goog.provide('anychart.paretoModule.Chart');
goog.require('anychart.core.CartesianBase');
goog.require('anychart.data.Set');
goog.require('anychart.enums');
goog.require('anychart.paretoModule.Mapping');
goog.require('anychart.paretoModule.Series');
goog.require('anychart.paretoModule.SeriesMapping');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Ordinal');



/**
 * Pareto chart class.
 * @extends {anychart.core.CartesianBase}
 * @constructor
 */
anychart.paretoModule.Chart = function() {
  anychart.paretoModule.Chart.base(this, 'constructor');

  this.addThemes('pareto');

  /**
   * Percent scale.
   * @type {anychart.scales.Linear}
   */
  this.percentScale = anychart.scales.linear();
  this.percentScale.minimum(0).maximum(100);

  this.setType(anychart.enums.ChartTypes.PARETO);
};
goog.inherits(anychart.paretoModule.Chart, anychart.core.CartesianBase);


//region --- Working with data
/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|anychart.data.DataSettings|Array|string)=} opt_value .
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(anychart.data.View|anychart.paretoModule.Chart)} .
 * @override
 */
anychart.paretoModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData !== opt_value) {
      this.rawData = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the chart if any;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.parentView = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.parentView = this.parentViewToDispose = opt_value.mapAs();
      else
        this.parentView = (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.redefineView();
    }
    return this;
  }
  return this.paretoView;
};


/**
 * Updates/creates series.
 */
anychart.paretoModule.Chart.prototype.updateSeries = function() {
  var columnSeries = this.getSeriesAt(0);
  var lineSeries = this.getSeriesAt(1);

  if (this.columnMapping)
    goog.dispose(this.columnMapping);
  this.columnMapping = this.paretoView.derive();
  if (!columnSeries)
    columnSeries = this[anychart.enums.CartesianSeriesType.COLUMN]();
  columnSeries.data(this.columnMapping);

  if (this.lineMapping)
    goog.dispose(this.lineMapping);
  this.lineMapping = new anychart.paretoModule.SeriesMapping(this.paretoView);
  if (!lineSeries) {
    lineSeries = this[anychart.enums.CartesianSeriesType.LINE]()
        .clip(false).markers(true).yScale(this.percentScale);
  }
  lineSeries.data(this.lineMapping);
};


/**
 * Update scale after redefine view.
 */
anychart.paretoModule.Chart.prototype.updateScales = function() {
  if (goog.isDef(this.paretoView)) {
    var sum = this.paretoView.getSum();
    var columnSeries = this.getSeriesAt(0);
    var scale;
    if (columnSeries) {
      scale = columnSeries.yScale();
    } else {
      scale = this.yScale();
    }
    scale.minimum(0);
    if (sum)
      scale.maximum(sum);
    else
      scale.maximum(1);
  }
};


/**
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @private
 */
anychart.paretoModule.Chart.COMPARATOR_ = function(a, b) {
  if (anychart.utils.isNaN(a)) {
    return anychart.utils.isNaN(b) ? -1 : 1;
  }
  if (anychart.utils.isNaN(b)) {
    return -1;
  }
  return b - a;
};


/**
 * Sets new value of this.paretoView depending on current data settings.
 */
anychart.paretoModule.Chart.prototype.redefineView = function() {
  this.suspendSignalsDispatching();
  if (this.paretoView)
    this.paretoView.unlistenSignals(this.dataInvalidated_, this);
  goog.dispose(this.paretoView);
  this.paretoView = new anychart.paretoModule.Mapping(this.parentView.sort('value', anychart.paretoModule.Chart.COMPARATOR_));
  this.paretoView.listenSignals(this.dataInvalidated_, this);
  this.updateScales();
  this.updateSeries();
  this.resumeSignalsDispatching(true);
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} e Event.
 * @private
 */
anychart.paretoModule.Chart.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.updateScales();
  }
};


//endregion
//region --- Series
/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.paretoModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      anychart.core.series.Capabilities.ALLOW_ERROR |
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.CartesianSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,

      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathContiniousFallingFillConfig,
      anychart.core.shapeManagers.pathContiniousRisingFillConfig,
      anychart.core.shapeManagers.pathContiniousNegativeFillConfig,

      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig,

      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.BOX] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BOX,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathMedianStrokeConfig,
      anychart.core.shapeManagers.pathStemStrokeConfig,
      anychart.core.shapeManagers.pathWhiskerStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'highest',
    anchoredPositionBottom: 'lowest'
  };
  res[anychart.enums.CartesianSeriesType.BUBBLE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.BUBBLE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.circleFillStrokeConfig,
      anychart.core.shapeManagers.circleHatchConfig,
      anychart.core.shapeManagers.circleNegativeFillStrokeConfig,
      anychart.core.shapeManagers.circleNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.CANDLESTICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig,

      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.JUMP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.JUMP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig,
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathNegativeStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.STICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig,
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathNegativeStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig,

      anychart.core.shapeManagers.pathRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: (
        anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
        anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
        anychart.core.series.Capabilities.ALLOW_ERROR |
        // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
        anychart.core.series.Capabilities.SUPPORTS_LABELS |
        0),
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.OHLC] = {
    drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathRisingStrokeConfig,
      anychart.core.shapeManagers.pathFallingStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillConfig,
      anychart.core.shapeManagers.pathLowFillConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_BAR] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillStrokeConfig,
      anychart.core.shapeManagers.pathLowFillStrokeConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillStrokeConfig,
      anychart.core.shapeManagers.pathLowFillStrokeConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig,
      anychart.core.shapeManagers.pathHatchConfig,

      anychart.core.shapeManagers.pathHighFillConfig,
      anychart.core.shapeManagers.pathLowFillConfig,
      anychart.core.shapeManagers.pathHighHatchConfig,
      anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.RANGE_STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHatchConfig,
      // anychart.core.shapeManagers.pathHighFillConfig,
      // anychart.core.shapeManagers.pathLowFillConfig,
      anychart.core.shapeManagers.pathHighStrokeConfig,
      anychart.core.shapeManagers.pathLowStrokeConfig
      // anychart.core.shapeManagers.pathHighHatchConfig,
      // anychart.core.shapeManagers.pathLowHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.CartesianSeriesType.SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,

      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathContiniousFallingFillConfig,
      anychart.core.shapeManagers.pathContiniousRisingFillConfig,
      anychart.core.shapeManagers.pathContiniousNegativeFillConfig,

      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,

      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathContiniousFallingFillConfig,
      anychart.core.shapeManagers.pathContiniousRisingFillConfig,
      anychart.core.shapeManagers.pathContiniousNegativeFillConfig,

      anychart.core.shapeManagers.pathHatchConfig,
      anychart.core.shapeManagers.pathFallingHatchConfig,
      anychart.core.shapeManagers.pathRisingHatchConfig,
      anychart.core.shapeManagers.pathNegativeHatchConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.STEP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
      anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.paretoModule.Chart, anychart.paretoModule.Chart.prototype.seriesConfig);


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.paretoModule.Series(this, this, type, config, true);
};


//endregion
//region --- Scales
/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.paretoModule.Chart.prototype.getXScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.ORDINAL;
};


/**
 * @return {Array}
 */
anychart.paretoModule.Chart.prototype.getXScaleWrongTypeError = function() {
  return ['Pareto chart xScale', 'ordinal'];
};


/**
 * @return {anychart.scales.Base.ScaleTypes}
 */
anychart.paretoModule.Chart.prototype.getYScaleAllowedTypes = function() {
  return anychart.scales.Base.ScaleTypes.SCATTER;
};


/**
 * @return {Array}
 */
anychart.paretoModule.Chart.prototype.getYScaleWrongTypeError = function() {
  return ['Pareto chart yScale', 'scatter', 'linear, log'];
};


//endregion
//region --- CSV
/** @inheritDoc */
anychart.paretoModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.getCsvColumns = function(dataHolder) {
  return ['value', 'CF', 'RF'];
};


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.populateCsvRow = function(row, names, iterator, headers) {
  var rowIndex = iterator.getIndex();
  var mapping = this.paretoView.getRowMapping(rowIndex);
  // bad-bad hardcode((
  row[1] = mapping.getValue(rowIndex);
  row[2] = mapping.getCumulativeFrequency(rowIndex);
  row[3] = mapping.getRelativeFrequency(rowIndex);
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.paretoModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS)) {
    this.updateScales();
  }
  anychart.paretoModule.Chart.base(this, 'calculate');
};


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.drawContent = function(bounds) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS)) {
    this.updateScales();
  }
  return anychart.paretoModule.Chart.base(this, 'drawContent', bounds);
};


//endregion
//region --- CSV
//------------------------------------------------------------------------------
//
//  CSV
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.paretoModule.Chart.prototype.getCsvSourceXScale = function(series) {
  return /** @type {anychart.scales.IXScale} */(this.xScale());
};


//endregion
//region --- Setup/dispose
/** @inheritDoc */
anychart.paretoModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.paretoView, this.parentView, this.parentViewToDispose, this.columnMapping, this.lineMapping);
  this.paretoView = null;
  this.parentView = null;
  this.parentViewToDispose = null;
  this.columnMapping = null;
  this.lineMapping = null;
  goog.dispose(this.percentScale);
  this.percentScale = null;
  anychart.paretoModule.Chart.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.serialize = function() {
  var json = anychart.paretoModule.Chart.base(this, 'serialize');
  if (goog.isDef(this.data()))
    json['chart']['data'] = this.data().serialize();
  return json;
};


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.setupAxes = function(opt_config) {
  anychart.paretoModule.Chart.base(this, 'setupAxes', opt_config);
  if (!this.yAxis(1).scale())
    this.yAxis(1).scale(this.percentScale);
};


/** @inheritDoc */
anychart.paretoModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.paretoModule.Chart.base(this, 'setupByJSON', config, opt_default);
  if (!!opt_default)
    this.yAxis(1).scale(this.percentScale);
  if ('data' in config)
    this.data(config['data']);
};
//endregion

//exports
(function() {
  var proto = anychart.paretoModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;
  // auto generated from ChartWithOrthogonalScales
  // proto['barsPadding'] = proto.barsPadding;
  // proto['barGroupsPadding'] = proto.barGroupsPadding;
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
  // generated automatically
  // proto['area'] = proto.area;
  // proto['bar'] = proto.bar;
  // proto['box'] = proto.box;
  // proto['bubble'] = proto.bubble;
  // proto['candlestick'] = proto.candlestick;
  // proto['column'] = proto.column;
  // proto['line'] = proto.line;
  // proto['marker'] = proto.marker;
  // proto['ohlc'] = proto.ohlc;
  // proto['rangeArea'] = proto.rangeArea;
  // proto['rangeBar'] = proto.rangeBar;
  // proto['rangeColumn'] = proto.rangeColumn;
  // proto['rangeSplineArea'] = proto.rangeSplineArea;
  // proto['rangeStepArea'] = proto.rangeStepArea;
  // proto['spline'] = proto.spline;
  // proto['splineArea'] = proto.splineArea;
  // proto['stepLine'] = proto.stepLine;
  // proto['stepArea'] = proto.stepArea;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['getType'] = proto.getType;
  // auto from ChartWithSeries
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  // proto['maxBubbleSize'] = proto.maxBubbleSize;
  // proto['minBubbleSize'] = proto.minBubbleSize;
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
})();
