goog.provide('anychart.waterfallModule.Chart');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');
goog.require('anychart.waterfallModule.Series');



/**
 * Waterfall chart class.<br/>
 * To get the chart use these method:
 *  <ul>
 *      <li>{@link anychart.waterfall}</li>
 *  </ul>
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.waterfallModule.Chart = function() {
  anychart.waterfallModule.Chart.base(this, 'constructor');

  this.setType(anychart.enums.ChartTypes.WATERFALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['dataMode', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['connectorStroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.waterfallModule.Chart, anychart.core.CartesianBase);


//region --- infrastructure
/**
 * Series config for Mekko chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.waterfallModule.Chart.prototype.seriesConfig = (function() {
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS | 0);

  var res = {};
  res[anychart.enums.WaterfallSeriesType.WATERFALL] = {
    drawerType: anychart.enums.SeriesDrawerTypes.WATERFALL,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig,
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.waterfallModule.Chart, anychart.waterfallModule.Chart.prototype.seriesConfig);


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.WaterfallSeriesType.WATERFALL;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getYScaleStackMode = function(yScale) {
  return anychart.enums.ScaleStackMode.VALUE;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.extendYScaleRange = function(scale, value) {};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.getPointStackingValue = function(point) {
  return +point.meta[point.meta['isTotal'] ? 'absolute' : 'diff'];
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.postProcessStacking = function(drawingPlans, firstIndex, lastIndex, yScale) {
  var prevValue = 0;
  var i, point;
  if (firstIndex) {
    for (i = 0; i < drawingPlans.length; i++) {
      point = drawingPlans[i].data[firstIndex - 1];
      prevValue += Number(point.meta['diff']) || 0;
    }
  }
  this.pointValueSums_ = [];
  for (i = firstIndex; i <= lastIndex; i++) {
    var absSum = 0;
    for (var j = 0; j < drawingPlans.length; j++) {
      point = drawingPlans[j].data[i];
      if (!point.meta['isTotal']) {
        point.meta['stackedZero'] += prevValue;
        point.meta['stackedValue'] += prevValue;
        point.meta['stackedZeroPrev'] += prevValue;
        point.meta['stackedValuePrev'] += prevValue;
        point.meta['stackedZeroNext'] += prevValue;
        point.meta['stackedValueNext'] += prevValue;
      }
      yScale.extendDataRange(point.meta['stackedValue']);
      yScale.extendDataRange(point.meta['stackedValuePrev']);
      yScale.extendDataRange(point.meta['stackedValueNext']);
      absSum += !point.meta['missing'] ? (Number(point.meta['diff']) || 0) : 0;
    }
    prevValue += absSum;
    this.pointValueSums_.push(prevValue);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.afterSeriesDraw = function() {
  if (!this.connectorPath_) {
    this.connectorPath_ = acgraph.path();
  } else {
    this.connectorPath_.clear();
  }
  var xScale = this.xScale();
  var drawingPlans = this.drawingPlansByXScale[String(goog.getUid(xScale))];
  if (!drawingPlans || !drawingPlans.length)
    return;
  var connectorStroke = /** @type {acgraph.vector.Stroke} */ (this.getOption('connectorStroke'));
  this.connectorPath_.stroke(connectorStroke);
  var thickness = acgraph.vector.getThickness(connectorStroke);
  this.connectorPath_.parent(this.container());
  this.connectorPath_.zIndex(1000);
  this.connectorPath_.clip(this.getPlotBounds());
  var isVertical = /** @type {boolean} */(this.isVertical());
  var individualPointWidths = xScale.checkWeights();
  var firstIndex = drawingPlans[0].firstIndex;
  var lastIndex = drawingPlans[0].lastIndex;
  var leftX, leftY, meta, drawingPlan, pointWidth, rightX, rightY;
  var index = this.getLastNonNaNSeries_(drawingPlans, firstIndex);
  if (isNaN(index)) {
    leftX = leftY = NaN;
  } else {
    drawingPlan = drawingPlans[index];
    meta = drawingPlan.data[firstIndex].meta;
    if (individualPointWidths) {
      pointWidth = drawingPlan.series.getCategoryWidth(goog.isDef(meta['category']) ? /** @type {number} */(meta['category']) : firstIndex);
    } else {
      pointWidth = drawingPlan.series.pointWidthCache;
    }
    leftY = anychart.utils.applyPixelShift(this.transformValue_(this.pointValueSums_[0]), thickness);
    leftX = meta['valueX'] + pointWidth / 2;
  }

  for (var i = firstIndex + 1; i <= lastIndex; i++) {
    index = this.getFirstNonNaNSeries_(drawingPlans, i);
    if (isNaN(index)) {
      rightX = rightY = NaN;
    } else {
      drawingPlan = drawingPlans[index];
      meta = drawingPlan.data[i].meta;
      if (individualPointWidths) {
        pointWidth = drawingPlan.series.getCategoryWidth(goog.isDef(meta['category']) ? /** @type {number} */(meta['category']) : firstIndex);
      } else {
        pointWidth = drawingPlan.series.pointWidthCache;
      }
      rightY = anychart.utils.applyPixelShift(this.transformValue_(this.pointValueSums_[i - firstIndex - 1]), thickness);
      rightX = meta['valueX'] - pointWidth / 2;
    }
    if (!isNaN(leftX) && !isNaN(leftY)) {
      if (!isNaN(rightX) && !isNaN(rightY)) {
        anychart.core.drawers.move(this.connectorPath_, isVertical, leftX, leftY);
        anychart.core.drawers.line(this.connectorPath_, isVertical, rightX, rightY);
      } else {
        continue;
      }
    }
    index = this.getLastNonNaNSeries_(drawingPlans, i);
    if (isNaN(index)) {
      leftX = leftY = NaN;
    } else {
      drawingPlan = drawingPlans[index];
      meta = drawingPlan.data[i].meta;
      if (individualPointWidths) {
        pointWidth = drawingPlan.series.getCategoryWidth(goog.isDef(meta['category']) ? /** @type {number} */(meta['category']) : firstIndex);
      } else {
        pointWidth = drawingPlan.series.pointWidthCache;
      }
      leftY = anychart.utils.applyPixelShift(this.transformValue_(this.pointValueSums_[i - firstIndex]), thickness);
      leftX = meta['valueX'] + pointWidth / 2;
    }
  }
};


/**
 * Transforms y value to pix coord.
 * @param {*} value
 * @return {number}
 * @private
 */
anychart.waterfallModule.Chart.prototype.transformValue_ = function(value) {
  var ratio = this.yScale().transform(value);
  var bounds = this.dataBounds;
  var min, range;
  if (this.isVertical()) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


/**
 * Returns first drawing plan index, that has a non-missing value at the passed index.
 * @param {Array.<Object>} drawingPlans
 * @param {number} index
 * @return {number}
 * @private
 */
anychart.waterfallModule.Chart.prototype.getFirstNonNaNSeries_ = function(drawingPlans, index) {
  for (var i = 0; i < drawingPlans.length; i++) {
    if (!drawingPlans[i].data[index].meta['missing'])
      return i;
  }
  return NaN;
};


/**
 * Returns first drawing plan index, that has a non-missing value at the passed index.
 * @param {Array.<Object>} drawingPlans
 * @param {number} index
 * @return {number}
 * @private
 */
anychart.waterfallModule.Chart.prototype.getLastNonNaNSeries_ = function(drawingPlans, index) {
  for (var i = drawingPlans.length; i--;) {
    if (!drawingPlans[i].data[index].meta['missing'])
      return i;
  }
  return NaN;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.waterfallModule.Series(this, this, type, config, true);
};


//endregion
//region --- api/descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'dataMode',
      anychart.enums.normalizeWaterfallDataMode);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'connectorStroke',
      anychart.core.settings.strokeNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.waterfallModule.Chart, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- legend
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.keyToSeriesMap_ = {};
    var seriesList = this.getAllSeries();
    var series;
    var totalFill, risingFill, fallingFill;
    var totalFillHash, risingFillHash, fallingFillHash;
    var seen = {};
    var legendItemKey = 0;
    var resolver;

    for (var i = 0; i < seriesList.length; i++) {
      series = /** @type {anychart.core.series.Base} */ (seriesList[i]);

      resolver = anychart.color.getColorResolver('risingFill', anychart.enums.ColorType.FILL, false);
      risingFill = resolver(series, anychart.PointState.NORMAL, true, true);
      risingFillHash = anychart.utils.hash(risingFill);
      if (!(risingFillHash in seen)) {
        seen[risingFillHash] = legendItemKey;
        this.keyToSeriesMap_[legendItemKey] = {
          series: [series],
          type: 'rising'
        };
        data.push({
          'text': 'Increase',
          'iconEnabled': true,
          'iconFill': /** @type {acgraph.vector.Fill} */ (risingFill),
          'sourceUid': goog.getUid(this),
          'sourceKey': legendItemKey++
        });
      } else {
        this.keyToSeriesMap_[seen[risingFillHash]].series.push(series);
      }

      resolver = anychart.color.getColorResolver('fallingFill', anychart.enums.ColorType.FILL, false);
      fallingFill = resolver(series, anychart.PointState.NORMAL, true, true);
      fallingFillHash = anychart.utils.hash(fallingFill);
      if (!(fallingFillHash in seen)) {
        seen[fallingFillHash] = legendItemKey;
        this.keyToSeriesMap_[legendItemKey] = {
          series: [series],
          type: 'falling'
        };
        data.push({
          'text': 'Decrease',
          'iconEnabled': true,
          'iconFill': /** @type {acgraph.vector.Fill} */ (fallingFill),
          'sourceUid': goog.getUid(this),
          'sourceKey': legendItemKey++
        });
      } else {
        this.keyToSeriesMap_[seen[fallingFillHash]].series.push(series);
      }

      resolver = anychart.color.getColorResolver('fill', anychart.enums.ColorType.FILL, false);
      totalFill = resolver(series, anychart.PointState.NORMAL, true, true);
      totalFillHash = anychart.utils.hash(totalFill);
      if (!(totalFillHash in seen)) {
        seen[totalFillHash] = legendItemKey;
        this.keyToSeriesMap_[legendItemKey] = {
          series: [series],
          type: 'total'
        };
        data.push({
          'text': 'Total',
          'iconEnabled': true,
          'iconFill': /** @type {acgraph.vector.Fill} */ (totalFill),
          'sourceUid': goog.getUid(this),
          'sourceKey': legendItemKey++
        });
      } else {
        this.keyToSeriesMap_[seen[totalFillHash]].series.push(series);
      }
    }
  } else {
    data = anychart.waterfallModule.Chart.base(this, 'createLegendItemsProvider', sourceMode, itemsFormat);
  }
  return data;
};


/**
 * Hover all points for all series on legend mouse over.
 * @param {number} sourceKey
 */
anychart.waterfallModule.Chart.prototype.doHoverOnPoints = function(sourceKey) {
  var seriesInfo = this.keyToSeriesMap_[sourceKey];
  var seriesList = seriesInfo.series;
  var pointType = seriesInfo.type;
  var series, iterator, isTotal, rising, falling, indexes, condition;
  for (var i = 0; i < seriesList.length; i++) {
    series = seriesList[i];
    iterator = series.getDetachedIterator();
    indexes = [];
    while (iterator.advance()) {
      var index = iterator.getIndex();
      if (iterator.meta('missing'))
        continue;
      isTotal = iterator.meta('isTotal');
      rising = (iterator.meta('diff') >= 0) && !isTotal;
      falling = (iterator.meta('diff') < 0) && !isTotal;

      condition = (isTotal && pointType == 'total') || (rising && pointType == 'rising') || (falling && pointType == 'falling');
      if (condition)
        indexes.push(index);
    }
    series.hover(indexes);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemOver = function(item, event) {
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.doHoverOnPoints(/** @type {number} */ (item.sourceKey()));
  } else {
    return anychart.waterfallModule.Chart.base(this, 'legendItemOver', item, event);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemOut = function(item, event) {
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.unhover();
  } else {
    return anychart.waterfallModule.Chart.base(this, 'legendItemOut', item, event);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemClick = function(item, event) {
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    return anychart.waterfallModule.Chart.base(this, 'legendItemClick', item, event);
  }
};


//endregion
//region --- setup/dispose
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.serialize = function() {
  var json = anychart.waterfallModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS, json['chart']);
  return json;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.disposeInternal = function() {
  goog.dispose(this.connectorPath_);
  anychart.waterfallModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region --- exports
(function() {
  var proto = anychart.waterfallModule.Chart.prototype;
  //generated automatically
  //proto['waterfall'] = proto.waterfall;
  //proto['dataMode'] = proto.dataMode;
  //proto['connectorStroke'] = proto.connectorStroke;

  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['crosshair'] = proto.crosshair;
  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['xMinorGrid'] = proto.xMinorGrid;
  proto['yMinorGrid'] = proto.yMinorGrid;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['xZoom'] = proto.xZoom;
  proto['xScroller'] = proto.xScroller;
  proto['getStat'] = proto.getStat;
  proto['annotations'] = proto.annotations;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
  proto['data'] = proto.data;
})();
//endregion
