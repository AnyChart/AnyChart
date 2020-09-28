goog.provide('anychart.waterfallModule.Chart');

goog.require('anychart.core.CartesianBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
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

  this.addThemes('waterfall');

  this.setType(anychart.enums.ChartTypes.WATERFALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['dataMode', anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.SCALE_CHART_Y_SCALES, anychart.Signal.NEEDS_REDRAW],
    ['connectorStroke', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.waterfallModule.Chart, anychart.core.CartesianBase);


/**
 * States that waterfall chart supports.
 *
 * @enum {string}
 */
anychart.waterfallModule.Chart.SUPPORTED_STATES = {
  STACK_LABELS: 'stackLabels'
};


anychart.consistency.supportStates(
  anychart.waterfallModule.Chart,
  anychart.enums.Store.WATERFALL,
  anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS
);


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
anychart.waterfallModule.Chart.prototype.drawContent = function(contentBounds) {
  anychart.waterfallModule.Chart.base(this, 'drawContent', contentBounds);

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS) ||
      this.hasStateInvalidation(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS)) {
    this.drawLabels();
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.afterSeriesDraw = function() {
  anychart.waterfallModule.Chart.base(this, 'afterSeriesDraw');
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
    var data = drawingPlans[i].data;
    if (data.length && !data[index].meta['missing'])
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
//region --- Labels
/**
 * Return format provider for stack labels.
 *
 * @param {number} index - Stack index.
 *
 * @return {anychart.core.BaseContext}
 */
anychart.waterfallModule.Chart.prototype.getFormatProviderForStackedLabel = function(index) {
  var provider = new anychart.format.Context();

  var value = this.getStackAbsolutesSum(index);

  var values = {
    'index': {value: index, type: anychart.enums.TokenType.NUMBER},
    'value': {value: value, type: anychart.enums.TokenType.NUMBER}
  };

  return provider.propagate(values);
};


/**
 * Resolve label position for stack.
 *
 * @param {anychart.enums.Position} position - Labels position of labels factory.
 * @param {number} index - Index of stack.
 *
 * @return {anychart.enums.Position}
 */
anychart.waterfallModule.Chart.prototype.resolvePositionForStackLabel = function(position, index) {
  if (position == 'auto') {
    var stackSum = this.getStackSum(index);
    return stackSum >= 0 ? anychart.enums.Position.CENTER_TOP : anychart.enums.Position.CENTER_BOTTOM;
  }

  return position;
};


/**
 * Resolve anchor for specific stack label.
 *
 * @param {anychart.enums.Anchor} anchor - Anchor for stack labels.
 * @param {anychart.enums.Position} position - Position for stack labels.
 * @param {number} index - Index of stack.
 *
 * @return {anychart.enums.Anchor} - Resolved anchor value for stack label.
 */
anychart.waterfallModule.Chart.prototype.resolveAnchorForStackLabel = function(anchor, position, index) {
  if (anchor == anychart.enums.Anchor.AUTO) {
    if (position == 'auto') {
      var stackSum = this.getStackSum(index);

      anchor = stackSum >= 0 ? anychart.enums.Anchor.CENTER_BOTTOM : anychart.enums.Anchor.CENTER_TOP;
    } else if (position == anychart.enums.Position.CENTER) {
      anchor = anychart.enums.Anchor.CENTER;
    } else {
      anchor = anychart.utils.rotateAnchor(position, 180);
    }
  }

  return anychart.utils.rotateAnchor(anchor, this.isVertical() ? -90 : 0);
};


/**
 * Return position provider for stack labels.
 *
 * @param {number} index - Stack index.
 * @param {anychart.enums.Position} labelsPosition - Labels position.
 *
 * @return {{value: {x: number, y:number}}} - Position provider.
 */
anychart.waterfallModule.Chart.prototype.getPositionProviderForStackedLabel = function(index, labelsPosition) {
  var bounds = this.getStackBounds(index);
  var position = anychart.utils.getCoordinateByAnchor(bounds, labelsPosition);

  var x = position['x'];
  var y = position['y'];

  var tmpX = x;
  x = this.isVertical() ? y : x;
  y = this.isVertical() ? tmpX : y;

  return {
    'value': {
      x: x,
      y: y
    }
  };
};


/**
 * Draw stack labels of chart.
 */
anychart.waterfallModule.Chart.prototype.drawStackLabels = function() {
  if (!this.stackLabelsLayer_) {
    this.stackLabelsLayer_ = this.rootElement.layer();
    this.stackLabelsLayer_.zIndex(40); //Above series.

    this.stackLabels_.container(this.stackLabelsLayer_);
  }

  var series = this.getSeriesAt(0);

  var iterator = series.getResetIterator();

  var labelsAnchor = this.stackLabels_.anchor();
  var labelsPosition = this.stackLabels_.position();

  while (iterator.advance()) {
    var index = iterator.getIndex();

    if (this.isStackVisible(index)) {
      var labelAnchor = this.resolveAnchorForStackLabel(labelsAnchor, labelsPosition, index);
      var labelPosition = this.resolvePositionForStackLabel(labelsPosition, index);

      var positionProvider = this.getPositionProviderForStackedLabel(index, labelPosition);
      var formatProvider = this.getFormatProviderForStackedLabel(index);

      var label = this.stackLabels_.getLabel(index);

      label = label ? label : this.stackLabels_.add(null, null, index);

      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);

      label.anchor(labelAnchor);
    }
  }

  this.stackLabels_.draw();
};


/**
 * Draw chart labels.
 */
anychart.waterfallModule.Chart.prototype.drawLabels = function() {
  this.stackLabels().clear();

  var countOfVisibleSeries = goog.array.reduce(this.seriesList, function(count, series) {
    return series.enabled() ? count + 1 : count;
  }, 0);

  if (countOfVisibleSeries > 1 && this.stackLabels().getOption('enabled')) {
    this.drawStackLabels();
  }

  this.stackLabels().markConsistent(this.stackLabels().SUPPORTED_CONSISTENCY_STATES);
  this.markStateConsistent(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS);
};


/**
 * Stack labels invalidation function.
 */
anychart.waterfallModule.Chart.prototype.stackLabelsInvalidated = function() {
  this.invalidateState(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels factory getter/setter for stack labels.
 *
 * @param {Object=} opt_value - Labels config.
 *
 * @returns {anychart.waterfallModule.Chart|anychart.core.ui.LabelsFactory} - Chart or labels factory instance.
 */
anychart.waterfallModule.Chart.prototype.stackLabels = function(opt_value) {
  if (!this.stackLabels_) {
    this.stackLabels_ = new anychart.core.ui.LabelsFactory();
    this.setupCreated('stackLabels', this.stackLabels_);
    this.stackLabels_.markConsistent(this.stackLabels_.SUPPORTED_CONSISTENCY_STATES);
    this.stackLabels_.listenSignals(this.stackLabelsInvalidated, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.stackLabels_.setup(opt_value);
    return this;
  }

  return this.stackLabels_;
};


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
          'categoryType': 'increase',
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
          'categoryType': 'decrease',
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
          'categoryType': 'total',
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
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.doHoverOnPoints(/** @type {number} */ (item.sourceKey()));
  } else {
    return anychart.waterfallModule.Chart.base(this, 'legendItemOver', item, event);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemOut = function(item, event) {
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.unhover();
  } else {
    return anychart.waterfallModule.Chart.base(this, 'legendItemOut', item, event);
  }
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.legendItemClick = function(item, event) {
  var sourceMode = /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode'));
  if (sourceMode == anychart.enums.LegendItemsSourceMode.DEFAULT) {
    return anychart.waterfallModule.Chart.base(this, 'legendItemClick', item, event);
  }
};


//endregion
//region --- Stack
/**
 * Returns bounds of stack.
 * Used for labels position calculation.
 *
 * @param {number} index - Stack index.
 *
 * @return {!anychart.math.Rect} - Bounds of stack.
 */
anychart.waterfallModule.Chart.prototype.getStackBounds = function(index) {
  var width = goog.array.reduce(this.drawingPlans, function(width, plan) {
    var seriesPointWidth = plan.series.pointWidthCache;
    return Math.max(seriesPointWidth, width);
  }, -Infinity);

  var left = this.drawingPlans[0].data[index].meta['valueX'] - width / 2;

  var top = this.transformValue_(this.getStackTop(index));
  var height = this.transformValue_(this.getStackBottom(index));

  return anychart.math.rect(left, top, width, height - top);
};


/**
 * Returns sum of stack values.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackSum = function(index) {
  return goog.array.reduce(this.seriesList, function(sum, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();
      iterator.select(index);

      var value = iterator.get('value') || 0;

      return sum + value;
    }

    return sum;
  }, 0);
};


/**
 * Returns sum of stack absolute values.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackAbsolutesSum = function(index) {
  return goog.array.reduce(this.seriesList, function(sum, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();
      iterator.select(index);

      var absolute = iterator.meta('absolute') || 0;

      return sum + absolute;
    }

    return sum;
  }, 0);
};


/**
 * Whether stack visible.
 * Stack is visible when at least one point visible.
 *
 * @param {number} index - Stack index.
 *
 * @return {boolean}
 */
anychart.waterfallModule.Chart.prototype.isStackVisible = function(index) {
  return goog.array.reduce(this.drawingPlans, function(isVisible, plan) {
    return isVisible || !plan.data[index].meta['missing'];
  }, false);
};


/**
 * Return highest value of stack.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackTop = function(index) {
  return goog.array.reduce(this.seriesList, function(top, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();

      iterator.select(index);

      var stackedValue = /**@type {number}*/(iterator.meta('stackedValue')) || 0;
      var stackedZero = /**@type {number}*/(iterator.meta('stackedZero')) || 0;

      return Math.max(top, stackedValue, stackedZero);
    }
    return top;
  }, -Infinity);
};


/**
 * Return lowest value of stack.
 *
 * @param {number} index - Stack index.
 *
 * @return {number}
 */
anychart.waterfallModule.Chart.prototype.getStackBottom = function(index) {
  return goog.array.reduce(this.seriesList, function(bottom, currentSeries) {
    if (currentSeries.enabled()) {
      var iterator = currentSeries.getIterator();

      iterator.select(index);

      var stackedValue = /**@type {number}*/(iterator.meta('stackedValue')) || 0;
      var stackedZero = /**@type {number}*/(iterator.meta('stackedZero')) || 0;

      return Math.min(stackedValue, stackedZero, bottom);
    }
    return bottom;
  }, Infinity);
};


//endregion
//region --- Series
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.seriesInvalidated = function(event) {
  this.invalidateState(anychart.enums.Store.WATERFALL, anychart.waterfallModule.Chart.SUPPORTED_STATES.STACK_LABELS);

  anychart.waterfallModule.Chart.base(this, 'seriesInvalidated', event);
};


//endregion
//region --- setup/dispose
/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.serialize = function() {
  var json = anychart.waterfallModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS, json['chart']);
  json['chart']['stackLabels'] = this.stackLabels().serialize();


  return json;
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.Chart.base(this, 'setupByJSON', config, opt_default);

  var stackLabelsConfig = config['stackLabels'];
  if (stackLabelsConfig) {
    this.stackLabels().setupInternal(!!opt_default, stackLabelsConfig);
  }

  anychart.core.settings.deserialize(this, anychart.waterfallModule.Chart.PROPERTY_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.waterfallModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.stackLabels_,
    this.stackLabelsLayer_,
    this.connectorPath_
  );
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

  proto['stackLabels'] = proto.stackLabels;
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
  proto['yZoom'] = proto.yZoom;
  proto['xScroller'] = proto.xScroller;
  proto['yScroller'] = proto.yScroller;
  proto['getStat'] = proto.getStat;
  proto['annotations'] = proto.annotations;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
  proto['data'] = proto.data;
})();
//endregion
