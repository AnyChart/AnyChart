goog.provide('anychart.mekkoModule.Chart');
goog.require('anychart.core.ChartWithAxes');
goog.require('anychart.core.series');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');
goog.require('anychart.mekkoModule.Series');



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
anychart.mekkoModule.Chart = function(opt_useCategoryScale, opt_barmekkoMode) {
  anychart.mekkoModule.Chart.base(this, 'constructor', true);

  this.addThemes('mekko');

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

  // this.setOption('pointsPadding', 0);
  this.setOption('defaultSeriesType', anychart.enums.MekkoSeriesType.MEKKO);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['pointsPadding', anychart.ConsistencyState.ALL, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.mekkoModule.Chart, anychart.core.ChartWithAxes);


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
anychart.mekkoModule.Chart.prototype.seriesConfig = (function() {
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
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.mekkoModule.Chart, anychart.mekkoModule.Chart.prototype.seriesConfig);


/**
 * Supported consistency states. Adds CATEGORY_SCALE state.
 * @type {number}
 */
anychart.mekkoModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithAxes.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.MEKKO_CATEGORY_SCALE;


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.seriesInvalidated = function(event) {
  anychart.mekkoModule.Chart.base(this, 'seriesInvalidated', event);

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
 * @param {(anychart.scales.Ordinal|anychart.enums.ScaleTypes|Object)=} opt_value Ordinal scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.mekkoModule.Chart)}
 */
anychart.mekkoModule.Chart.prototype.firstCategoriesScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = /** @type {?anychart.scales.Ordinal} */(anychart.scales.Base.setupScale(this.firstCategoriesScale_, opt_value, anychart.enums.ScaleTypes.ORDINAL,
        anychart.scales.Base.ScaleTypes.ORDINAL, null, this.categoriesScaleInvalidated, this));
    if (val) {
      var dispatch = this.firstCategoriesScale_ == val;
      this.firstCategoriesScale_ = val;
      this.firstCategoriesScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
            anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
            anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
        if ((this.allowLegendCategoriesMode() && /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode')) == anychart.enums.LegendItemsSourceMode.CATEGORIES) ||
            this.barmekkoMode_) {
          state |= anychart.ConsistencyState.CHART_LEGEND;
        }
        this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
      }
    }
    return this;
  }
  if (!this.firstCategoriesScale_) {
    var scales = this.getScaleInstances();
    var scaleIndex = this.getThemeOption('firstCategoriesScale');
    this.firstCategoriesScale_ = /** @type {anychart.scales.Ordinal} */(anychart.scales.Base.setupScale(
        this.firstCategoriesScale_,
        scales[scaleIndex],
        null,
        void 0,
        null,
        this.categoriesScaleInvalidated,
        this));
    this.firstCategoriesScale_.resumeSignalsDispatching(false);
  }
  return /** @type {!anychart.scales.Ordinal} */(this.firstCategoriesScale_);
};


/**
 * Getter/setter for lastCategoriesScale.
 * @param {(anychart.scales.Ordinal|anychart.enums.ScaleTypes|Object)=} opt_value Ordinal scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.mekkoModule.Chart)}
 */
anychart.mekkoModule.Chart.prototype.lastCategoriesScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = /** @type {?anychart.scales.Ordinal} */(anychart.scales.Base.setupScale(this.lastCategoriesScale_, opt_value, anychart.enums.ScaleTypes.ORDINAL,
        anychart.scales.Base.ScaleTypes.ORDINAL, null, this.categoriesScaleInvalidated, this));
    if (val) {
      var dispatch = this.lastCategoriesScale_ == val;
      this.lastCategoriesScale_ = val;
      this.lastCategoriesScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
            anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
            anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
        this.invalidate(state, anychart.Signal.NEEDS_REDRAW | anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
      }
    }
    return this;
  }
  if (!this.lastCategoriesScale_) {
    var scales = this.getScaleInstances();
    var scaleIndex = this.getThemeOption('lastCategoriesScale');
    this.lastCategoriesScale_ = /** @type {anychart.scales.Ordinal} */(anychart.scales.Base.setupScale(
        this.lastCategoriesScale_,
        scales[scaleIndex],
        null,
        void 0,
        null,
        this.categoriesScaleInvalidated, this));
    this.lastCategoriesScale_.resumeSignalsDispatching(false);
  }
  return /** @type {!anychart.scales.Ordinal} */(this.lastCategoriesScale_);
};


/**
 * Left and right categories scales invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @protected
 */
anychart.mekkoModule.Chart.prototype.categoriesScaleInvalidated = function(event) {
  this.suspendSignalsDispatching();
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    var state = anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
    if ((this.allowLegendCategoriesMode() && /** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode')) == anychart.enums.LegendItemsSourceMode.CATEGORIES) ||
        this.barmekkoMode_) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
    this.invalidate(state, anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);
  }
  this.resumeSignalsDispatching(true);
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.mekkoModule.Chart.prototype.getXScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.ORDINAL;
};


/**
 * @return {Array}
 */
anychart.mekkoModule.Chart.prototype.getXScaleWrongTypeError = function() {
  return ['Mekko chart X scale', 'ordinal'];
};


/**
 * @return {anychart.enums.ScaleTypes}
 */
anychart.mekkoModule.Chart.prototype.getYScaleDefaultType = function() {
  return anychart.enums.ScaleTypes.LINEAR;
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.mekkoModule.Chart.prototype.getYScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.ALL_DEFAULT;
};


/**
 * @return {Array}
 */
anychart.mekkoModule.Chart.prototype.getYScaleWrongTypeError = function() {
  return ['Chart scale', 'ordinal, linear, log, date-time'];
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.allowLegendCategoriesMode = function() {
  return true;
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  if (this.barmekkoMode_ && this.getSeriesCount() == 1 &&
      anychart.utils.instanceOf(this.xScale(), anychart.scales.Ordinal)) {
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
        'iconType': anychart.enums.LegendItemIconType.SQUARE,
        'iconStroke': anychart.color.setThickness(color, 1),
        'iconFill': color,
        'iconHatchFill': series['hatchFill']()
      });
    }
    return data;
  }
  return anychart.mekkoModule.Chart.base(this, 'createLegendItemsProvider', sourceMode, itemsFormat);
};


//endregion
//region --- Axes
//----------------------------------------------------------------------------------------------------------------------
//
//  Axes
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.setYAxisScale = function(axis) {
  if (this.useCategoryScale_) {
    var straight = !this.xScale().inverted();
    var straightFirst = axis.getOption('orientation') == anychart.enums.Orientation.LEFT || axis.getOption('orientation') == anychart.enums.Orientation.BOTTOM;
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
anychart.mekkoModule.Chart.prototype.calculate = function() {
  var needsXScaleUpdate = this.hasInvalidationState(
      anychart.ConsistencyState.SCALE_CHART_SCALES |
      anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS);

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES |
          anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
          anychart.ConsistencyState.SCALE_CHART_Y_SCALES))
    this.invalidate(anychart.ConsistencyState.MEKKO_CATEGORY_SCALE);

  anychart.mekkoModule.Chart.base(this, 'calculate');

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
 * Processes a plan.
 * @param {Object} plan
 * @param {number} rightIndex
 * @param {Array} leftValues
 * @param {Array} leftWeights
 * @param {Array} rightValues
 * @param {Array} rightWeights
 * @private
 */
anychart.mekkoModule.Chart.prototype.processDrawingPlan_ = function(plan, rightIndex, leftValues, leftWeights, rightValues, rightWeights) {
  if (plan.data.length) {
    if (!plan.data[0].meta['missing']) {
      leftValues.push(plan.series.name());
      leftWeights.push(plan.data[0].data['value']);
    }
    if (!plan.data[rightIndex].meta['missing']) {
      rightValues.push(plan.series.name());
      rightWeights.push(plan.data[rightIndex].data['value']);
    }
  }
};


/**
 * Left and right categories scales values and weights calculation.
 */
anychart.mekkoModule.Chart.prototype.calculateCategoriesScales = function() {
  if (this.drawingPlans.length) {
    var leftValues = [];
    var rightValues = [];
    var leftWeights = [];
    var rightWeights = [];
    var rightIndex = this.drawingPlans[0].data.length - 1;
    var i;
    if (this.yScale().stackDirection() == anychart.enums.ScaleStackDirection.DIRECT) {
      for (i = this.drawingPlans.length; i--;) {
        this.processDrawingPlan_(this.drawingPlans[i], rightIndex, leftValues, leftWeights, rightValues, rightWeights);
      }
    } else {
      for (i = 0; i < this.drawingPlans.length; i++) {
        this.processDrawingPlan_(this.drawingPlans[i], rightIndex, leftValues, leftWeights, rightValues, rightWeights);
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
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mekkoModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'pointsPadding',
      anychart.core.settings.asIsNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.mekkoModule.Chart, anychart.mekkoModule.Chart.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.mekkoModule.Series(this, this, type, config, false, this.barmekkoMode_);
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.normalizeSeriesType = function(type) {
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
anychart.mekkoModule.Chart.prototype.defaultScalesLastIndex = function() {
  return 3;
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.serialize = function() {
  var json = anychart.mekkoModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.mekkoModule.Chart.PROPERTY_DESCRIPTORS, json);
  return {'chart': json};
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.serializeWithScales = function(json, scales, scaleIds) {
  // todo: (chernetsky) Uncomment when firstCategoriesScale and lastCategoriesScale become available from user API
  // this.serializeScale(json, 'firstCategoriesScale', /** @type {anychart.scales.Base} */(this.firstCategoriesScale()), scales, scaleIds);
  // this.serializeScale(json, 'lastCategoriesScale', /** @type {anychart.scales.Base} */(this.lastCategoriesScale()), scales, scaleIds);

  anychart.mekkoModule.Chart.base(this, 'serializeWithScales', json, scales, scaleIds);
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.serializeAxis = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  if ((item.scale() == this.firstCategoriesScale() && item.getOption('orientation') != anychart.enums.Orientation.LEFT) ||
      (item.scale() == this.lastCategoriesScale() && item.getOption('orientation') != anychart.enums.Orientation.RIGHT))
    this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  axesIds.push(goog.getUid(item));
  return config;
};


/** @inheritDoc */
anychart.mekkoModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.mekkoModule.Chart.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.mekkoModule.Chart.PROPERTY_DESCRIPTORS, config);
};


//endregion


//exports
(function() {
  var proto = anychart.mekkoModule.Chart.prototype;
  //proto['pointsPadding'] = proto.pointsPadding;
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
  // auto from ChartWithSeries
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
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
