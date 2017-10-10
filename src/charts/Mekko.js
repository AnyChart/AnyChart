goog.provide('anychart.charts.Mekko');
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series');
goog.require('anychart.core.series.Mekko');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');



/**
 * Mekko chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.mosaic}</li>
 *      <li>{@link anychart.mekko}</li>
 *      <li>{@link anychart.barmekko}</li>
 *  </ul>
 * @param {boolean=} opt_useCategoryScale
 * @param {boolean=} opt_barmekkoMode
 * @extends {anychart.core.ChartWithAxes}
 * @constructor
 */
anychart.charts.Mekko = function(opt_useCategoryScale, opt_barmekkoMode) {
  anychart.charts.Mekko.base(this, 'constructor', true);

  /**
   * Scale for LEFT oriented Y axis. Uses first categories values to calculate weights.
   * @type {anychart.scales.Ordinal}
   * @private
   */
  this.firstCategoriesScale_ = null;

  /**
   * Scale for RIGHT oriented Y axis. Uses last categories values to calculate weights.
   * @type {anychart.scales.Ordinal}
   * @private
   */
  this.lastCategoriesScale_ = null;

  /**
   * Should Y Axis use category scales or not.
   * @type {boolean}
   * @private
   */
  this.useCategoryScale_ = !!opt_useCategoryScale;

  /**
   * If chart created as barmekko chart.
   * @type {boolean}
   * @private
   */
  this.barmekkoMode_ = !!opt_barmekkoMode;

  /**
   * @type {(number|string)}
   * @private
   */
  this.pointsPadding_ = 0;

  this.defaultSeriesType(anychart.enums.MekkoSeriesType.MEKKO);
};
goog.inherits(anychart.charts.Mekko, anychart.core.ChartWithAxes);


//region --- Infrastucture
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastucture
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series config for Mekko chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.charts.Mekko.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS | 0);

  res[anychart.enums.MekkoSeriesType.MEKKO] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MEKKO,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
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
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.charts.Mekko, anychart.charts.Mekko.prototype.seriesConfig);


/**
 * Supported consistency states. Adds CATEGORY_SCALE state.
 * @type {number}
 */
anychart.charts.Mekko.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithAxes.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.MEKKO_CATEGORY_SCALE;


/** @inheritDoc */
anychart.charts.Mekko.prototype.seriesInvalidated = function(event) {
  anychart.charts.Mekko.base(this, 'seriesInvalidated', event);

  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    var state = anychart.ConsistencyState.MEKKO_CATEGORY_SCALE;
    this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Scales
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for firstCategoriesScale.
 * @param {anychart.scales.Ordinal=} opt_value Ordinal scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.charts.Mekko)}
 */
anychart.charts.Mekko.prototype.firstCategoriesScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (acgraph.utils.instanceOf(opt_value, anychart.scales.Ordinal) && this.firstCategoriesScale_ != opt_value) {
      if (this.firstCategoriesScale_)
        this.firstCategoriesScale_.unlistenSignals(this.categoriesScaleInvalidated, this);
      this.firstCategoriesScale_ = opt_value;
      if (this.firstCategoriesScale_)
        this.firstCategoriesScale_.listenSignals(this.categoriesScaleInvalidated, this);

      var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
          anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
      if ((this.allowLegendCategoriesMode() && this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) ||
          this.barmekkoMode_) {
        state |= anychart.ConsistencyState.CHART_LEGEND;
      }
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
    }
    return this;
  }

  if (!this.firstCategoriesScale_) {
    this.firstCategoriesScale_ = /** @type {anychart.scales.Ordinal} */(this.createScaleByType('ordinal', true, false));
    this.firstCategoriesScale_.listenSignals(this.categoriesScaleInvalidated, this);
  }
  return /** @type {!anychart.scales.Ordinal} */(this.firstCategoriesScale_);
};


/**
 * Getter/setter for lastCategoriesScale.
 * @param {anychart.scales.Ordinal=} opt_value Ordinal scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.charts.Mekko)}
 */
anychart.charts.Mekko.prototype.lastCategoriesScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (acgraph.utils.instanceOf(opt_value, anychart.scales.Ordinal) && this.lastCategoriesScale_ != opt_value) {
      if (this.lastCategoriesScale_)
        this.lastCategoriesScale_.unlistenSignals(this.categoriesScaleInvalidated, this);
      this.lastCategoriesScale_ = opt_value;
      if (this.lastCategoriesScale_)
        this.lastCategoriesScale_.listenSignals(this.categoriesScaleInvalidated, this);

      var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
          anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
      this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
    }
    return this;
  }

  if (!this.lastCategoriesScale_) {
    this.lastCategoriesScale_ = /** @type {anychart.scales.Ordinal} */(this.createScaleByType('ordinal', true, false));
    this.lastCategoriesScale_.listenSignals(this.categoriesScaleInvalidated, this);
  }
  return /** @type {!anychart.scales.Ordinal} */(this.lastCategoriesScale_);
};


/**
 * Left and right categories scales invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @protected
 */
anychart.charts.Mekko.prototype.categoriesScaleInvalidated = function(event) {
  this.suspendSignalsDispatching();
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
    if ((this.allowLegendCategoriesMode() && this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) ||
        this.barmekkoMode_) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
    this.invalidate(state, anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
  }
  this.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.checkXScaleType = function(scale) {
  var res = (acgraph.utils.instanceOf(scale, anychart.scales.Ordinal)) && !scale.isColorScale();
  if (!res)
    anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Mekko chart X scale', 'ordinal']);
  return res;
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.allowLegendCategoriesMode = function() {
  return true;
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  if (this.barmekkoMode_ && this.getSeriesCount() == 1 &&
      acgraph.utils.instanceOf(this.xScale(), anychart.scales.Ordinal)) {
    // we need to calculate statistics
    this.calculate();
    /**
     * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
     */
    var data = [];
    var i;
    var names = this.xScale().names();
    var values = this.xScale().values();
    var series = this.getSeriesAt(0);
    for (i = 0; i < values.length; i++) {
      var itemText = null;
      if (goog.isFunction(itemsFormat)) {
        var format = {
          'value': values[i],
          'name': names[i]
        };
        itemText = itemsFormat.call(format, format);
      }

      if (!goog.isString(itemText))
        itemText = String(names[i]);

      var color = this.palette().itemAt(i);

      data.push({
        'text': itemText,
        'sourceUid': goog.getUid(this),
        'sourceKey': i,
        'iconType': anychart.enums.LegendItemIconType.SQUARE,
        'iconStroke': anychart.color.setThickness(color, 1),
        'iconFill': color,
        'iconHatchFill': series['hatchFill']()
      });
    }
    return data;
  }
  return anychart.charts.Mekko.base(this, 'createLegendItemsProvider', sourceMode, itemsFormat);
};


//endregion
//region --- Axes
//----------------------------------------------------------------------------------------------------------------------
//
//  Axes
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Mekko.prototype.setYAxisScale = function(axis) {
  if (this.useCategoryScale_) {
    var straight = !this.xScale().inverted();
    var straightFirst = axis.orientation() == anychart.enums.Orientation.LEFT || axis.orientation() == anychart.enums.Orientation.BOTTOM;
    axis.scale(/** @type {anychart.scales.Base} */(straightFirst == straight ? this.firstCategoriesScale() : this.lastCategoriesScale()));
  } else {
    axis.scale(/** @type {anychart.scales.Base} */(this.yScale()));
  }
};


//endregion
//region --- Calculations
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Mekko.prototype.calculate = function() {
  var needsXScaleUpdate = this.hasInvalidationState(
      anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS);

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES))
    this.invalidate(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);

  anychart.charts.Mekko.base(this, 'calculate');

  if (needsXScaleUpdate) {
    // xScale weights calculation
    var i;
    var j;
    var seriesData;
    var weights = [];
    var missings = [];
    var numOfSeries = this.drawingPlans.length;
    var value;

    for (i = 0; i < this.drawingPlans.length; i++) {
      seriesData = this.drawingPlans[i].data;
      for (j = 0; j < seriesData.length; j++) {
        if (!goog.isDef(missings[j])) missings[j] = 0;
        if (seriesData[j].meta['missing']) {
          missings[j]++;
          value = 0;
        } else {
          value = anychart.utils.toNumber(seriesData[j].data['value']);
          if (this.barmekkoMode_)
            value = Math.abs(value);
          else
            value = value < 0 ? 0 : value;
        }
        if (weights[j] == void 0)
          weights.push(value);
        else
          weights[j] += value;
      }
    }
    // update category indexes for excluded points processing
    for (i = 0; i < this.drawingPlans.length; i++) {
      seriesData = this.drawingPlans[i].data;
      var category = 0;
      for (j = 0; j < seriesData.length; j++) {
        seriesData[j].meta['category'] = missings[j] < numOfSeries ? category++ : category;
      }
    }
    weights = goog.array.filter(weights, function(el, index) {
      return missings[index] < numOfSeries;
    });
    this.xScale().setAutoWeights(weights);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE)) {
    this.calculateCategoriesScales();
    this.markConsistent(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
  }
};


/**
 * Left and right categories scales values and weights calculation.
 */
anychart.charts.Mekko.prototype.calculateCategoriesScales = function() {
  if (this.drawingPlans.length) {
    var leftValues = [];
    var rightValues = [];
    var leftWeights = [];
    var rightWeights = [];
    var rightIndex = this.drawingPlans[0].data.length - 1;
    for (var i = 0; i < this.drawingPlans.length; i++) {
      if (!this.drawingPlans[i].data[0].meta['missing']) {
        leftValues.push(this.drawingPlans[i].series.name());
        leftWeights.push(this.drawingPlans[i].data[0].data['value']);
      }
      if (!this.drawingPlans[i].data[rightIndex].meta['missing']) {
        rightValues.push(this.drawingPlans[i].series.name());
        rightWeights.push(this.drawingPlans[i].data[rightIndex].data['value']);
      }
    }

    var scale = this.firstCategoriesScale();
    scale.startAutoCalc();
    scale.extendDataRange.apply(/** @type {anychart.scales.Ordinal} */(scale), leftValues);
    scale.finishAutoCalc();
    scale.setAutoWeights(leftWeights);

    scale = this.lastCategoriesScale();
    scale.startAutoCalc();
    scale.extendDataRange.apply(/** @type {anychart.scales.Ordinal} */(scale), rightValues);
    scale.finishAutoCalc();
    scale.setAutoWeights(rightWeights);
  }
};


//endregion
//region --- Series
//----------------------------------------------------------------------------------------------------------------------
//
//  Series
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for points padding.
 * @param {(number|string)=} opt_value
 * @return {(number|string|!anychart.charts.Mekko)}
 */
anychart.charts.Mekko.prototype.pointsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.pointsPadding_ != opt_value) {
      this.pointsPadding_ = opt_value;
      this.invalidate(anychart.ConsistencyState.ALL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.pointsPadding_;
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.createSeriesInstance = function(type, config) {
  return new anychart.core.series.Mekko(this, this, type, config, false, this.barmekkoMode_);
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.normalizeSeriesType = function(type) {
  return anychart.enums.MekkoSeriesType.MEKKO;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Mekko.prototype.defaultScalesLastIndex = function() {
  return 3;
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.serialize = function() {
  var json = anychart.charts.Mekko.base(this, 'serialize');
  json['type'] = this.getType();
  json['pointsPadding'] = this.pointsPadding();
  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.serializeWithScales = function(json, scales, scaleIds) {
  this.serializeScale(json, 'firstCategoriesScale', /** @type {anychart.scales.Base} */(this.firstCategoriesScale()), scales, scaleIds);
  this.serializeScale(json, 'lastCategoriesScale', /** @type {anychart.scales.Base} */(this.lastCategoriesScale()), scales, scaleIds);

  anychart.charts.Mekko.base(this, 'serializeWithScales', json, scales, scaleIds);
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.serializeAxis = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  if ((item.scale() == this.firstCategoriesScale() && item.orientation() != anychart.enums.Orientation.LEFT) ||
      (item.scale() == this.lastCategoriesScale() && item.orientation() != anychart.enums.Orientation.RIGHT))
    this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  axesIds.push(goog.getUid(item));
  return config;
};


/** @inheritDoc */
anychart.charts.Mekko.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Mekko.base(this, 'setupByJSON', config, opt_default);

  this.pointsPadding(config['pointsPadding']);
};


//endregion


//exports
(function() {
  var proto = anychart.charts.Mekko.prototype;
  proto['pointsPadding'] = proto.pointsPadding;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  proto['crosshair'] = proto.crosshair;
  proto['xAxis'] = proto.xAxis;
  proto['getXAxesCount'] = proto.getXAxesCount;
  proto['yAxis'] = proto.yAxis;
  proto['getYAxesCount'] = proto.getYAxesCount;
  proto['getSeries'] = proto.getSeries;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['annotations'] = proto.annotations;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  // generated automatically
  // proto['mekko'] = proto.mekko;
})();
