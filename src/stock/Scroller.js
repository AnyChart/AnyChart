goog.provide('anychart.stockModule.Scroller');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IGroupingProvider');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.palettes');
goog.require('anychart.scales');
goog.require('anychart.stockModule.Axis');
goog.require('anychart.stockModule.ScrollerSeries');
goog.require('anychart.stockModule.indicators');
goog.require('anychart.stockModule.scales.IKeyIndexTransformer');
goog.require('anychart.stockModule.scales.Ordinal');
goog.require('anychart.stockModule.scales.Scatter');



/**
 * Stock scroller class. Adds series drawing to UI Scroller.
 * @param {!anychart.stockModule.Chart} chart
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 * @implements {anychart.core.IPlot}
 * @implements {anychart.core.IChart}
 * @implements {anychart.core.IGroupingProvider}
 * @implements {anychart.stockModule.scales.IKeyIndexTransformer}
 */
anychart.stockModule.Scroller = function(chart) {
  anychart.stockModule.Scroller.base(this, 'constructor');

  /**
   * Stock chart reference.
   * @type {!anychart.stockModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Series list.
   * @type {!Array.<!anychart.stockModule.ScrollerSeries>}
   * @private
   */
  this.series_ = [];

  /**
   * Indicators list.
   * @type {!Array.<!goog.Disposable>}
   * @private
   */
  this.indicators_ = [];

  /**
   * Default scroller Y scale.
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.yScale_ = null;

  /**
   * X axis.
   * @type {anychart.stockModule.Axis}
   * @private
   */
  this.xAxis_ = null;

  /**
   * Series layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.seriesContainer_ = null;

  /**
   * Selected series layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.selectedSeriesContainer_ = null;

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   * Hatch fill palette for scroller series.
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  this.defaultSeriesType(anychart.enums.StockSeriesType.LINE);
};
goog.inherits(anychart.stockModule.Scroller, anychart.core.ui.Scroller);


/**
 * Supported signals.
 * @type {number}
 */
anychart.stockModule.Scroller.prototype.SUPPORTED_SIGNALS =
    anychart.core.ui.Scroller.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_SCROLLER_SERIES |
    anychart.ConsistencyState.STOCK_SCROLLER_AXIS;


/**
 * @inheritDoc
 */
anychart.stockModule.Scroller.prototype.supportsTooltip = function() {
  return false;
};


//region Series and indicators -related methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Series and indicators -related methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series config for the scroller.
 * @type {Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.stockModule.Scroller.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (
      // anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      // anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      // anychart.core.series.Capabilities.SUPPORTS_LABELS |
      0);
  res[anychart.enums.StockSeriesType.AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillConfig,
      anychart.core.shapeManagers.pathScrollerStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillConfig,
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.StockSeriesType.CANDLESTICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerRisingHatchConfig,
      anychart.core.shapeManagers.pathScrollerFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerFallingHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectRisingFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectRisingHatchConfig,
      anychart.core.shapeManagers.pathScrollerSelectFallingFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectFallingHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.CartesianSeriesType.JUMP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.JUMP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.StockSeriesType.HILO] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.CartesianSeriesType.STICK] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STICK,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.StockSeriesType.LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.StockSeriesType.MARKER] = {
    drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.StockSeriesType.OHLC] = {
    drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerRisingStrokeConfig,
      anychart.core.shapeManagers.pathScrollerFallingStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectRisingStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectFallingStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.RANGE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillConfig,
      anychart.core.shapeManagers.pathScrollerLowStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHighStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillConfig,
      anychart.core.shapeManagers.pathScrollerSelectLowStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHighStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.RANGE_COLUMN] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.RANGE_SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillConfig,
      anychart.core.shapeManagers.pathScrollerHighStrokeConfig,
      anychart.core.shapeManagers.pathScrollerLowStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillConfig,
      anychart.core.shapeManagers.pathScrollerSelectHighStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectLowStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.RANGE_STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillConfig,
      anychart.core.shapeManagers.pathScrollerHighStrokeConfig,
      anychart.core.shapeManagers.pathScrollerLowStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillConfig,
      anychart.core.shapeManagers.pathScrollerSelectHighStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectLowStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'high',
    anchoredPositionBottom: 'low'
  };
  res[anychart.enums.StockSeriesType.SPLINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  res[anychart.enums.StockSeriesType.SPLINE_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.SPLINE_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillConfig,
      anychart.core.shapeManagers.pathScrollerStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillConfig,
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.StockSeriesType.STEP_AREA] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerFillConfig,
      anychart.core.shapeManagers.pathScrollerStrokeConfig,
      anychart.core.shapeManagers.pathScrollerHatchConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectFillConfig,
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig,
      anychart.core.shapeManagers.pathScrollerSelectHatchConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'zero'
  };
  res[anychart.enums.StockSeriesType.STEP_LINE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
    shapesConfig: [
      anychart.core.shapeManagers.pathScrollerStrokeConfig
    ],
    secondaryShapesConfig: [
      anychart.core.shapeManagers.pathScrollerSelectStrokeConfig
    ],
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'value',
    anchoredPositionBottom: 'value'
  };
  return res;
})();


/**
 * Getter/setter for stock scroller plot defaultSeriesType.
 * @param {(string|anychart.enums.StockSeriesType)=} opt_value Default series type.
 * @return {anychart.stockModule.Scroller|anychart.enums.StockSeriesType} Default series type or self for chaining.
 */
anychart.stockModule.Scroller.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeStockSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/**
 * Creates and returns a new area series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.area = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new candlestick series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.candlestick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.CANDLESTICK, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new column series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.column = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new jump line series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.jumpLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.JUMP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new hilo series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.hilo = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.HILO, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new stick series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.stick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STICK, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new line series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.line = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new marker series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.marker = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.MARKER, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new ohlc series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.ohlc = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.OHLC, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeArea series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.rangeArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeColumn series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.rangeColumn = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeSplineArea series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.rangeSplineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_SPLINE_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeStepArea series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.rangeStepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_STEP_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new spline series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.spline = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.SPLINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new splineArea series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.splineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.SPLINE_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new stepArea series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.stepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STEP_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new stepLine series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.stepLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STEP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Add series to chart.
 * @param {...(anychart.stockModule.data.TableMapping)} var_args Chart series data.
 * @return {Array.<anychart.stockModule.ScrollerSeries>} Array of created series.
 */
anychart.stockModule.Scroller.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (count) {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType(type, arguments[i]));
    }
  } else rv.push(this.createSeriesByType(type, null));
  this.resumeSignalsDispatching(true);
  return rv;
};


/**
 * Find series index by its id.
 * @param {number|string} id Series id.
 * @return {number} Series index or -1 if didn't find.
 */
anychart.stockModule.Scroller.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.stockModule.ScrollerSeries} Series instance.
 */
anychart.stockModule.Scroller.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.stockModule.ScrollerSeries} Series instance.
 */
anychart.stockModule.Scroller.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.stockModule.Scroller.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.stockModule.Scroller}
 */
anychart.stockModule.Scroller.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.stockModule.Scroller}
 */
anychart.stockModule.Scroller.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.stockModule.Scroller} Self for method chaining.
 */
anychart.stockModule.Scroller.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    var series = this.series_;
    anychart.globalLock.lock();
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Returns series list. Considered internal. Returns it for reading only.
 * @return {!Array.<!anychart.stockModule.ScrollerSeries>}
 */
anychart.stockModule.Scroller.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Creates ADL indicator on the scroller.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.ADL}
 */
anychart.stockModule.Scroller.prototype.adl = function(mapping, opt_seriesType) {
  var result = new anychart.stockModule.indicators.ADL(this, mapping, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates AMA indicator on the scroller.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.AMA}
 */
anychart.stockModule.Scroller.prototype.ama = function(mapping, opt_period, opt_fastPeriod, opt_slowPeriod, opt_seriesType) {
  var result = new anychart.stockModule.indicators.AMA(this, mapping, opt_period, opt_fastPeriod, opt_slowPeriod, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates Aroon indicator on the scroller.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_upSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_downSeriesType
 * @return {anychart.stockModule.indicators.Aroon}
 */
anychart.stockModule.Scroller.prototype.aroon = function(mapping, opt_period, opt_upSeriesType, opt_downSeriesType) {
  var result = new anychart.stockModule.indicators.Aroon(this, mapping, opt_period, opt_upSeriesType, opt_downSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates ATR indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.ATR}
 */
anychart.stockModule.Scroller.prototype.atr = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.ATR(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates BBands indicator on the scroller.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [20] Sets moving average period value.
 * @param {number=} opt_deviation [2] Sets the multiplier applied to the moving average to compute upper and lower bands of the indicator.
 * @param {anychart.enums.StockSeriesType=} opt_middleSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_upperSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_lowerSeriesType
 * @return {anychart.stockModule.indicators.BBands}
 */
anychart.stockModule.Scroller.prototype.bbands = function(mapping, opt_period, opt_deviation, opt_middleSeriesType, opt_upperSeriesType, opt_lowerSeriesType) {
  var result = new anychart.stockModule.indicators.BBands(this, mapping, opt_period, opt_deviation, opt_middleSeriesType, opt_upperSeriesType, opt_lowerSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates BBands %B indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [20] Sets moving average period value.
 * @param {number=} opt_deviation [2] Sets the multiplier applied to the moving average to compute upper and lower bands of the indicator.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.BBandsB}
 */
anychart.stockModule.Scroller.prototype.bbandsB = function(mapping, opt_period, opt_deviation, opt_seriesType) {
  var result = new anychart.stockModule.indicators.BBandsB(this, mapping, opt_period, opt_deviation, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates BBands Width indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period [20] Sets moving average period value.
 * @param {number=} opt_deviation [2] Sets the multiplier applied to the moving average to compute upper and lower bands of the indicator.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.BBandsWidth}
 */
anychart.stockModule.Scroller.prototype.bbandsWidth = function(mapping, opt_period, opt_deviation, opt_seriesType) {
  var result = new anychart.stockModule.indicators.BBandsWidth(this, mapping, opt_period, opt_deviation, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates CCI indicator on the scroller.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.CCI}
 */
anychart.stockModule.Scroller.prototype.cci = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.CCI(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates CHO indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod [3] Indicator period. Defaults to 3.
 * @param {number=} opt_slowPeriod [10] Indicator period. Defaults to 10.
 * @param {string=} opt_maType [EMA] Indicator smoothing type. Defaults to EMA.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.CHO}
 */
anychart.stockModule.Scroller.prototype.cho = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_maType, opt_seriesType) {
  var result = new anychart.stockModule.indicators.CHO(this, mapping, opt_fastPeriod, opt_slowPeriod, opt_maType, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates CMF indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.CMF}
 */
anychart.stockModule.Scroller.prototype.cmf = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.CMF(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates DMI indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_adxPeriod
 * @param {boolean=} opt_useWildersSmoothing
 * @param {anychart.enums.StockSeriesType=} opt_pdiSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_ndiSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_adxSeriesType
 * @return {anychart.stockModule.indicators.DMI}
 */
anychart.stockModule.Scroller.prototype.dmi = function(mapping, opt_period, opt_adxPeriod, opt_useWildersSmoothing, opt_pdiSeriesType, opt_ndiSeriesType, opt_adxSeriesType) {
  var result = new anychart.stockModule.indicators.DMI(this, mapping, opt_period, opt_adxPeriod, opt_useWildersSmoothing, opt_pdiSeriesType, opt_ndiSeriesType, opt_adxSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates EMA indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.EMA}
 */
anychart.stockModule.Scroller.prototype.ema = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.EMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates KDJ indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [5] Indicator K smoothing period. Defaults to 5.
 * @param {number=} opt_dPeriod [5] Indicator D period. Defaults to 5.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [EMA] Indicator K smoothing type. Defaults to EMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [EMA] Indicator D smoothing type. Defaults to EMA.
 * @param {number=} opt_kMultiplier [-2] K multiplier.
 * @param {number=} opt_dMultiplier [3] D multiplier.
 * @param {anychart.enums.StockSeriesType=} opt_kSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_dSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_jSeriesType
 * @return {anychart.stockModule.indicators.KDJ}
 */
anychart.stockModule.Scroller.prototype.kdj = function(mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier, opt_kSeriesType, opt_dSeriesType, opt_jSeriesType) {
  var result = new anychart.stockModule.indicators.KDJ(this, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier, opt_kSeriesType, opt_dSeriesType, opt_jSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates MACD indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {number=} opt_signalPeriod
 * @param {anychart.enums.StockSeriesType=} opt_macdSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_signalSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_histogramSeriesType
 * @return {anychart.stockModule.indicators.MACD}
 */
anychart.stockModule.Scroller.prototype.macd = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod,
    opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType) {
  var result = new anychart.stockModule.indicators.MACD(this, mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod,
      opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates MMA indicator on the scroller.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.MMA}
 */
anychart.stockModule.Scroller.prototype.mma = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.MMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates RoC indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.RoC}
 */
anychart.stockModule.Scroller.prototype.roc = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.RoC(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates RSI indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.RSI}
 */
anychart.stockModule.Scroller.prototype.rsi = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.RSI(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates SMA indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.stockModule.indicators.SMA}
 */
anychart.stockModule.Scroller.prototype.sma = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.stockModule.indicators.SMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates Stochastic indicator on the chart.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [1] Indicator K smoothing period. Defaults to 1.
 * @param {number=} opt_dPeriod [3] Indicator D period. Defaults to 3.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [SMA] Indicator K smoothing type. Defaults to SMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [SMA] Indicator D smoothing type. Defaults to SMA.
 * @param {anychart.enums.StockSeriesType=} opt_kSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_dSeriesType
 * @return {anychart.stockModule.indicators.Stochastic}
 */
anychart.stockModule.Scroller.prototype.stochastic = function(mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kSeriesType, opt_dSeriesType) {
  var result = new anychart.stockModule.indicators.Stochastic(this, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kSeriesType, opt_dSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.stockModule.Scroller.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Returns normalized series type and a config for this series type.
 * @param {string} type
 * @return {?Array.<string|anychart.core.series.TypeConfig>}
 */
anychart.stockModule.Scroller.prototype.getConfigByType = function(type) {
  type = anychart.enums.normalizeStockSeriesType(type);
  var config = this.seriesConfig[type];
  var res;
  if (config && (config.drawerType in anychart.core.drawers.AvailableDrawers)) {
    res = [type, config];
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    res = null;
  }
  return res;
};


/**
 * @inheritDoc
 * TODO (A.Kudryavtsev): statistics calculations TBA.
 */
anychart.stockModule.Scroller.prototype.calculate = goog.nullFunction;


/**
 * @inheritDoc
 */
anychart.stockModule.Scroller.prototype.ensureStatisticsReady = goog.nullFunction;


/**
 * @param {string} type Series type.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.ScrollerSeries}
 */
anychart.stockModule.Scroller.prototype.createSeriesByType = function(type, opt_data, opt_mappingSettings,
    opt_csvSettings) {
  var configAndType = this.getConfigByType(type);
  if (configAndType) {
    var config = /** @type {anychart.core.series.TypeConfig} */(configAndType[1]);
    var series = new anychart.stockModule.ScrollerSeries(this, type, config);

    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */(lastSeries.autoIndex()) + 1 : 0;
    this.series_.push(series);
    var inc = index * anychart.stockModule.Plot.ZINDEX_INCREMENT_MULTIPLIER;
    var seriesZIndex = (series.isLineBased() ?
            anychart.stockModule.Plot.ZINDEX_LINE_SERIES :
            anychart.stockModule.Plot.ZINDEX_SERIES) + inc;

    series.autoIndex(index);
    series.data(opt_data || null, opt_mappingSettings, opt_csvSettings);
    series.setAutoZIndex(seriesZIndex);
    series.clip(true);
    series.setAutoPointWidth(.9);
    series.setAutoColor(this.palette().itemAt(index));
    series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    series.setParentEventTarget(this);
    series.listenSignals(this.seriesInvalidated_, this);

    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    series = null;
  }

  return series;
};


/**
 * Series invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Scroller.prototype.seriesInvalidated_ = function(e) {
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, signal);
};


/**
 * Resets series shared stack.
 */
anychart.stockModule.Scroller.prototype.resetSeriesStack = function() {
  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series)
      series.resetSharedStack();
  }
};


/**
 * Invalidates all series.
 * @private
 */
anychart.stockModule.Scroller.prototype.invalidateSeries_ = function() {
  for (var i = 0; i < this.series_.length; i++)
    this.series_[i].invalidate(
        anychart.ConsistencyState.SERIES_COLOR |
        anychart.ConsistencyState.SERIES_HATCH_FILL |
        anychart.ConsistencyState.BOUNDS);
};


//endregion
//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns the chart that created this scroller.
 * @return {!anychart.stockModule.Chart}
 */
anychart.stockModule.Scroller.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Returns current scroller pixel bounds.
 * @return {!anychart.math.Rect}
 */
anychart.stockModule.Scroller.prototype.getPixelBounds = function() {
  return this.pixelBoundsCache;
};


/**
 * Returns current scroller pixel bounds.
 * @return {!anychart.math.Rect}
 */
anychart.stockModule.Scroller.prototype.getPlotBounds = function() {
  return this.getPixelBounds();
};


/**
 * INTERNAL x scale getter/setter. Managed by stock chart.
 * @param {anychart.stockModule.scales.Scatter=} opt_value
 * @return {anychart.stockModule.scales.Scatter|anychart.stockModule.Scroller}
 */
anychart.stockModule.Scroller.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_ = opt_value;
    // this.xScale_.listenSignals(this.invalidateScaleDependend, this);
    this.invalidateScaleDependend();
    return this;
  }
  if (!this.xScale_) {
    this.xScale_ = new anychart.stockModule.scales.Ordinal(this);
  }
  return this.xScale_;
};


/**
 * Sets range and invalidates what is needed to be invalidated.
 * @param {number} start
 * @param {number} end
 * @return {anychart.stockModule.Scroller}
 */
anychart.stockModule.Scroller.prototype.setRangeByValues = function(start, end) {
  start = this.xScale().transform(start);
  if (isNaN(start))
    start = 0;
  else
    start = goog.math.clamp(start, 0, 1);
  end = this.xScale().transform(end);
  if (isNaN(end))
    end = 1;
  else
    end = goog.math.clamp(end, 0, 1);
  this.setRangeInternal(start, end);
  return this;
};


/** @inheritDoc */
anychart.stockModule.Scroller.prototype.updateBoundsCache = function() {
  anychart.stockModule.Scroller.base(this, 'updateBoundsCache');
  this.invalidateScaleDependend();
};


/**
 * Returns current selection min distance (from scroller sources).
 * @return {number}
 */
anychart.stockModule.Scroller.prototype.getCurrentMinDistance = function() {
  return this.chart_.getCurrentScrollerMinDistance();
};


/**
 * Returns gropuing.
 * @return {anychart.stockModule.Grouping}
 */
anychart.stockModule.Scroller.prototype.grouping = function() {
  return /** @type {anychart.stockModule.Grouping} */(this.chart_.scrollerGrouping());
};


/**
 * @return {boolean}
 */
anychart.stockModule.Scroller.prototype.isVertical = function() {
  return false;
};


//endregion
//region Public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Default plot Y scale getter/setter.
 * @param {(anychart.enums.ScatterScaleTypes|Object|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.stockModule.Scroller)} Default chart scale value or itself for method chaining.
 */
anychart.stockModule.Scroller.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.yScale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.SCATTER, ['Scroller Y scale', 'scatter', 'linear, log'], this.yScaleInvalidated, this);
    if (val) {
      var dispatch = this.yScale_ == val;
      this.yScale_ = /** @type {anychart.scales.ScatterBase} */(val);
      this.yScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        for (var i = 0; i < this.series_.length; i++) {
          var series = this.series_[i];
          if (series && series.enabled() && series.yScale() == this.yScale_) {
            series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
            this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES);
          }
        }
        this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
      }
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = anychart.scales.linear();
      this.yScale_.listenSignals(this.yScaleInvalidated, this);
    }
    return this.yScale_;
  }
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} e
 * @protected
 */
anychart.stockModule.Scroller.prototype.yScaleInvalidated = function(e) {
  var foundOne = 0;
  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series && series.enabled() && series.yScale() == this.yScale_) {
      foundOne |= series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
    }
  }
  if (foundOne) {
    var signal = anychart.Signal.NEEDS_REDRAW;
    if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
      signal |= anychart.Signal.NEEDS_RECALCULATION;
    }
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, signal);
  }
};


/**
 * X axis getter/setter.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.stockModule.Axis|anychart.stockModule.Scroller)}
 */
anychart.stockModule.Scroller.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.stockModule.Axis(this, true);
    this.xAxis_.setParentEventTarget(this);
    this.xAxis_.enabled(false);
    this.xAxis_.zIndex(52);
    this.xAxis_.listenSignals(this.xAxisInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_AXIS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.xAxis_.setup(opt_value);
    return this;
  } else {
    return this.xAxis_;
  }
};


//endregion
//region Invalidation handlers
//----------------------------------------------------------------------------------------------------------------------
//
//  Invalidation handlers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * X axis invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Scroller.prototype.xAxisInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_AXIS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Invalidates scroller entities that depend on scroller scale.
 */
anychart.stockModule.Scroller.prototype.invalidateScaleDependend = function() {
  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series) {
      series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
    }
  }
  if (this.xAxis_)
    this.xAxis_.invalidate(anychart.ConsistencyState.APPEARANCE);
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES | anychart.ConsistencyState.STOCK_SCROLLER_AXIS);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Scroller.prototype.draw = function() {
  anychart.stockModule.Scroller.base(this, 'draw');

  if (!this.checkDrawingNeeded())
    return this;

  if (!this.seriesContainer_) {
    this.seriesContainer_ = this.rootLayer.layer();
    this.seriesContainer_.zIndex(1);
    this.seriesContainer_.clip(this.nonSelectedClipRect);
    this.selectedSeriesContainer_ = this.rootLayer.layer();
    this.selectedSeriesContainer_.disablePointerEvents(true);
    this.selectedSeriesContainer_.zIndex(51);
    this.selectedSeriesContainer_.clip(this.selectedClipRect);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER_SERIES)) {
    for (var i = 0; i < this.series_.length; i++) {
      var series = this.series_[i];
      if (series) {
        series.suspendSignalsDispatching();
        series.parentBounds(this.pixelBoundsCache);
        series.container(this.seriesContainer_);
        series.secondaryContainer(this.selectedSeriesContainer_);
        series.setAutoColor(this.palette().itemAt(i));
        series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
        series.draw();
        series.resumeSignalsDispatching(false);
      }
    }
    this.resetSeriesStack();
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER_AXIS)) {
    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.scale(/** @type {anychart.stockModule.scales.Scatter} */(this.xScale()));
      this.xAxis_.container(this.rootLayer);
      this.xAxis_.parentBounds(this.pixelBoundsCache);
      this.xAxis_.height(this.pixelBoundsCache.height);
      this.xAxis_.draw();
      this.xAxis_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER_AXIS);
  }

  return this;
};


//endregion
//region Palettes
//----------------------------------------------------------------------------------------------------------------------
//
//  Palettes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.stockModule.Scroller)} .
 */
anychart.stockModule.Scroller.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.stockModule.Scroller.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  this.invalidateSeries_();
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.stockModule.Scroller)} Return current hatch fill palette or itself
 * for chaining call.
 */
anychart.stockModule.Scroller.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.stockModule.Scroller.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region IKeyIndexTransformer
//----------------------------------------------------------------------------------------------------------------------
//
//  IKeyIndexTransformer
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.stockModule.Scroller.prototype.getKeyByIndex = function(index) {
  return this.chart_.getKeyByScrollerIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.Scroller.prototype.getIndexByKey = function(key) {
  return this.chart_.getScrollerIndexByKey(key);
};


//endregion
//region Events
//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Scroller.prototype.makeRangeChangeEvent = function(type, startRatio, endRatio, source) {
  return {
    'type': type,
    'startRatio': startRatio,
    'endRatio': endRatio,
    'startKey': this.xScale().inverseTransform(startRatio),
    'endKey': this.xScale().inverseTransform(endRatio),
    'source': source
  };
};


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Scroller.prototype.disposeInternal = function() {
  goog.disposeAll(this.series_);
  delete this.series_;

  goog.disposeAll(this.indicators_);
  delete this.indicators_;

  goog.dispose(this.seriesContainer_);
  goog.dispose(this.selectedSeriesContainer_);
  this.seriesContainer_ = null;
  this.selectedSeriesContainer_ = null;

  goog.dispose(this.xAxis_);
  this.xAxis_ = null;

  this.yScale_ = null;

  goog.dispose(this.xScale_);
  this.xScale_ = null;

  delete this.chart_;

  anychart.stockModule.Scroller.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.stockModule.Scroller.prototype.serialize = function() {
  var json = anychart.stockModule.Scroller.base(this, 'serialize');

  json['defaultSeriesType'] = this.defaultSeriesType();
  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

  return json;
};


/** @inheritDoc */
anychart.stockModule.Scroller.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Scroller.base(this, 'setupByJSON', config, opt_default);

  var i, json, scale;

  this.xAxis(config['xAxis']);
  this.defaultSeriesType(config['defaultSeriesType']);
  var type = this.getChart().getType();

  var scales = config['scales'];
  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
      scale = anychart.scales.ScatterBase.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type, anychart.enums.ScaleTypes.LINEAR);
      scale = anychart.scales.ScatterBase.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  json = config['yScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.ScatterBase.fromString(json, true);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.ScatterBase.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.yScale(scale);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  var series = config['series'];
  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || this.defaultSeriesType()).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }
  this.palette(config['palette']);
  this.hatchFillPalette(config['hatchFillPalette']);
};


//endregion
//exports
(function() {
  var proto = anychart.stockModule.Scroller.prototype;
  proto['area'] = proto.area;
  proto['candlestick'] = proto.candlestick;
  proto['column'] = proto.column;
  proto['stick'] = proto.stick;
  proto['jumpLine'] = proto.jumpLine;
  proto['hilo'] = proto.hilo;
  proto['line'] = proto.line;
  proto['marker'] = proto.marker;
  proto['ohlc'] = proto.ohlc;
  proto['rangeArea'] = proto.rangeArea;
  proto['rangeColumn'] = proto.rangeColumn;
  proto['rangeSplineArea'] = proto.rangeSplineArea;
  proto['rangeStepArea'] = proto.rangeStepArea;
  proto['spline'] = proto.spline;
  proto['splineArea'] = proto.splineArea;
  proto['stepArea'] = proto.stepArea;
  proto['stepLine'] = proto.stepLine;
  proto['getSeries'] = proto.getSeries;
  proto['yScale'] = proto.yScale;
  proto['xAxis'] = proto.xAxis;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['palette'] = proto.palette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['adl'] = proto.adl;
  proto['ama'] = proto.ama;
  proto['aroon'] = proto.aroon;
  proto['atr'] = proto.atr;
  proto['bbands'] = proto.bbands;
  proto['bbandsB'] = proto.bbandsB;
  proto['bbandsWidth'] = proto.bbandsWidth;
  proto['cci'] = proto.cci;
  proto['cho'] = proto.cho;
  proto['cmf'] = proto.cmf;
  proto['dmi'] = proto.dmi;
  proto['ema'] = proto.ema;
  proto['kdj'] = proto.kdj;
  proto['macd'] = proto.macd;
  proto['mma'] = proto.mma;
  proto['roc'] = proto.roc;
  proto['rsi'] = proto.rsi;
  proto['sma'] = proto.sma;
  proto['stochastic'] = proto.stochastic;
})();
