goog.provide('anychart.core.stock.Scroller');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IGroupingProvider');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.axes.StockDateTime');
goog.require('anychart.core.series.StockScroller');
goog.require('anychart.core.stock.IKeyIndexTransformer');
goog.require('anychart.core.stock.indicators');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.scales');
goog.require('anychart.scales.StockOrdinalDateTime');
goog.require('anychart.scales.StockScatterDateTime');



/**
 * Stock scroller class. Adds series drawing to UI Scroller.
 * @param {!anychart.charts.Stock} chart
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 * @implements {anychart.core.IPlot}
 * @implements {anychart.core.IChart}
 * @implements {anychart.core.IGroupingProvider}
 * @implements {anychart.core.stock.IKeyIndexTransformer}
 */
anychart.core.stock.Scroller = function(chart) {
  goog.base(this);

  /**
   * Stock chart reference.
   * @type {!anychart.charts.Stock}
   * @private
   */
  this.chart_ = chart;

  /**
   * Series list.
   * @type {!Array.<!anychart.core.series.StockScroller>}
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
   * @type {anychart.core.axes.StockDateTime}
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

  this.defaultSeriesType(anychart.enums.StockSeriesType.LINE);
};
goog.inherits(anychart.core.stock.Scroller, anychart.core.ui.Scroller);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.stock.Scroller.prototype.SUPPORTED_SIGNALS =
    anychart.core.ui.Scroller.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.stock.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_SCROLLER_SERIES |
    anychart.ConsistencyState.STOCK_SCROLLER_AXIS;


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
anychart.core.stock.Scroller.prototype.seriesConfig = (function() {
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
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
    anchoredPositionTop: anychart.opt.HIGH,
    anchoredPositionBottom: anychart.opt.LOW
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
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
    anchoredPositionTop: anychart.opt.HIGH,
    anchoredPositionBottom: anychart.opt.LOW
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
    anchoredPositionTop: anychart.opt.HIGH,
    anchoredPositionBottom: anychart.opt.LOW
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
    anchoredPositionTop: anychart.opt.HIGH,
    anchoredPositionBottom: anychart.opt.LOW
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
    anchoredPositionTop: anychart.opt.HIGH,
    anchoredPositionBottom: anychart.opt.LOW
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
    anchoredPositionTop: anychart.opt.HIGH,
    anchoredPositionBottom: anychart.opt.LOW
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.ZERO
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
    anchoredPositionTop: anychart.opt.VALUE,
    anchoredPositionBottom: anychart.opt.VALUE
  };
  return res;
})();


/**
 * Getter/setter for stock scroller plot defaultSeriesType.
 * @param {(string|anychart.enums.StockSeriesType)=} opt_value Default series type.
 * @return {anychart.core.stock.Scroller|anychart.enums.StockSeriesType} Default series type or self for chaining.
 */
anychart.core.stock.Scroller.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeStockSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/**
 * Creates and returns a new area series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.area = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new candlestick series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.candlestick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.CANDLESTICK, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new column series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.column = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new line series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.line = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new marker series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.marker = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.MARKER, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new ohlc series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.ohlc = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.OHLC, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeArea series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.rangeArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeColumn series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.rangeColumn = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeSplineArea series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.rangeSplineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_SPLINE_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new rangeStepArea series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.rangeStepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.RANGE_STEP_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new spline series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.spline = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.SPLINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new splineArea series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.splineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.SPLINE_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new stepArea series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.stepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STEP_AREA, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new stepLine series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.stepLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STEP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Add series to chart.
 * @param {...(anychart.data.TableMapping)} var_args Chart series data.
 * @return {Array.<anychart.core.series.StockScroller>} Array of created series.
 */
anychart.core.stock.Scroller.prototype.addSeries = function(var_args) {
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
anychart.core.stock.Scroller.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.series.StockScroller} Series instance.
 */
anychart.core.stock.Scroller.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.series.StockScroller} Series instance.
 */
anychart.core.stock.Scroller.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.core.stock.Scroller.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.removeSeriesAt = function(index) {
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
 * @return {anychart.core.stock.Scroller} Self for method chaining.
 */
anychart.core.stock.Scroller.prototype.removeAllSeries = function() {
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
 * @return {!Array.<!anychart.core.series.StockScroller>}
 */
anychart.core.stock.Scroller.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Creates EMA indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.EMA}
 */
anychart.core.stock.Scroller.prototype.ema = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.EMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates MACD indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {number=} opt_signalPeriod
 * @param {anychart.enums.StockSeriesType=} opt_macdSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_signalSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_histogramSeriesType
 * @return {anychart.core.stock.indicators.MACD}
 */
anychart.core.stock.Scroller.prototype.macd = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod,
    opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType) {
  var result = new anychart.core.stock.indicators.MACD(this, mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod,
      opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates RoC indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.RoC}
 */
anychart.core.stock.Scroller.prototype.roc = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.RoC(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates RSI indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.RSI}
 */
anychart.core.stock.Scroller.prototype.rsi = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.RSI(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates SMA indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.SMA}
 */
anychart.core.stock.Scroller.prototype.sma = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.SMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.core.stock.Scroller.prototype.defaultSeriesSettings = function(opt_value) {
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
anychart.core.stock.Scroller.prototype.getConfigByType = function(type) {
  type = anychart.enums.normalizeStockSeriesType(type);
  var config = this.seriesConfig[type];
  var res;
  if (config && (config.drawerType in anychart.core.drawers.AvailableDrawers)) {
    res = [type, config];
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    res = null;
  }
  return res;
};


/**
 * @inheritDoc
 * TODO (A.Kudryavtsev): statistics calculations TBA.
 */
anychart.core.stock.Scroller.prototype.calculate = goog.nullFunction;


/**
 * @param {string} type Series type.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.StockScroller}
 */
anychart.core.stock.Scroller.prototype.createSeriesByType = function(type, opt_data, opt_mappingSettings,
    opt_csvSettings) {
  var configAndType = this.getConfigByType(type);
  if (configAndType) {
    var config = /** @type {anychart.core.series.TypeConfig} */(configAndType[1]);
    var series = new anychart.core.series.StockScroller(this, type, config);

    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */(lastSeries.autoIndex()) + 1 : 0;
    this.series_.push(series);
    var inc = index * anychart.core.stock.Plot.ZINDEX_INCREMENT_MULTIPLIER;
    var seriesZIndex = (series.isLineBased() ?
            anychart.core.stock.Plot.ZINDEX_LINE_SERIES :
            anychart.core.stock.Plot.ZINDEX_SERIES) + inc;

    series.autoIndex(index);
    series.data(opt_data, opt_mappingSettings, opt_csvSettings);
    series.setAutoZIndex(seriesZIndex);
    series.clip(true);
    series.setAutoPointWidth(.9);
    // series.setAutoColor(this.palette().itemAt(index));
    // series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    // series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
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
anychart.core.stock.Scroller.prototype.seriesInvalidated_ = function(e) {
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, signal);
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
 * @return {!anychart.charts.Stock}
 */
anychart.core.stock.Scroller.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Returns current scroller pixel bounds.
 * @return {!anychart.math.Rect}
 */
anychart.core.stock.Scroller.prototype.getPixelBounds = function() {
  return this.pixelBoundsCache;
};


/**
 * INTERNAL x scale getter/setter. Managed by stock chart.
 * @param {anychart.scales.StockScatterDateTime=} opt_value
 * @return {anychart.scales.StockScatterDateTime|anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_ = opt_value;
    this.invalidateScaleDependend();
    return this;
  }
  if (!this.xScale_) {
    this.xScale_ = new anychart.scales.StockOrdinalDateTime(this);
  }
  return this.xScale_;
};


/**
 * Sets range and invalidates what is needed to be invalidated.
 * @param {number} start
 * @param {number} end
 * @return {anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.setRangeByValues = function(start, end) {
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
anychart.core.stock.Scroller.prototype.updateBoundsCache = function() {
  goog.base(this, 'updateBoundsCache');
  this.invalidateScaleDependend();
};


/**
 * Returns current selection min distance (from scroller sources).
 * @return {number}
 */
anychart.core.stock.Scroller.prototype.getCurrentMinDistance = function() {
  return this.chart_.getCurrentScrollerMinDistance();
};


/**
 * Returns gropuing.
 * @return {anychart.core.stock.Grouping}
 */
anychart.core.stock.Scroller.prototype.grouping = function() {
  return /** @type {anychart.core.stock.Grouping} */(this.chart_.scrollerGrouping());
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
 * @param {(anychart.enums.ScatterScaleTypes|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.core.stock.Scroller)} Default chart scale value or itself for method chaining.
 */
anychart.core.stock.Scroller.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      this.registerDisposable(opt_value = anychart.scales.ScatterBase.fromString(opt_value, false));
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      //this.chart_.redrawSeries();
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
      this.registerDisposable(this.yScale_);
    }
    return this.yScale_;
  }
};


/**
 * X axis getter/setter.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.StockDateTime|anychart.core.stock.Scroller)}
 */
anychart.core.stock.Scroller.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.core.axes.StockDateTime(this, true);
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
anychart.core.stock.Scroller.prototype.xAxisInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_AXIS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Invalidates scroller entities that depend on scroller scale.
 */
anychart.core.stock.Scroller.prototype.invalidateScaleDependend = function() {
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
anychart.core.stock.Scroller.prototype.draw = function() {
  goog.base(this, 'draw');

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
    this.nonSelectedClipRect.shape(this.pixelBoundsCache);
    for (var i = 0; i < this.series_.length; i++) {
      var series = this.series_[i];
      if (series) {
        series.suspendSignalsDispatching();
        series.parentBounds(this.pixelBoundsCache);
        series.container(this.seriesContainer_);
        series.secondaryContainer(this.selectedSeriesContainer_);
        series.draw();
        series.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER_AXIS)) {
    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.scale(/** @type {anychart.scales.StockScatterDateTime} */(this.xScale()));
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
anychart.core.stock.Scroller.prototype.getKeyByIndex = function(index) {
  return this.chart_.getKeyByScrollerIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Scroller.prototype.getIndexByKey = function(key) {
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
anychart.core.stock.Scroller.prototype.makeRangeChangeEvent = function(type, startRatio, endRatio, source) {
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
anychart.core.stock.Scroller.prototype.disposeInternal = function() {
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

  goog.dispose(this.xScale_);
  this.xScale_ = null;

  delete this.chart_;

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['defaultSeriesType'] = this.defaultSeriesType();

  return json;
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

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
      json = anychart.themes.merging.mergeScale(json, i, type);
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
      json = anychart.themes.merging.mergeScale(json, i, type);
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
};
//endregion


//exports
anychart.core.stock.Scroller.prototype['area'] = anychart.core.stock.Scroller.prototype.area;
anychart.core.stock.Scroller.prototype['candlestick'] = anychart.core.stock.Scroller.prototype.candlestick;
anychart.core.stock.Scroller.prototype['column'] = anychart.core.stock.Scroller.prototype.column;
anychart.core.stock.Scroller.prototype['line'] = anychart.core.stock.Scroller.prototype.line;
anychart.core.stock.Scroller.prototype['marker'] = anychart.core.stock.Scroller.prototype.marker;
anychart.core.stock.Scroller.prototype['ohlc'] = anychart.core.stock.Scroller.prototype.ohlc;
anychart.core.stock.Scroller.prototype['rangeArea'] = anychart.core.stock.Scroller.prototype.rangeArea;
anychart.core.stock.Scroller.prototype['rangeColumn'] = anychart.core.stock.Scroller.prototype.rangeColumn;
anychart.core.stock.Scroller.prototype['rangeSplineArea'] = anychart.core.stock.Scroller.prototype.rangeSplineArea;
anychart.core.stock.Scroller.prototype['rangeStepArea'] = anychart.core.stock.Scroller.prototype.rangeStepArea;
anychart.core.stock.Scroller.prototype['spline'] = anychart.core.stock.Scroller.prototype.spline;
anychart.core.stock.Scroller.prototype['splineArea'] = anychart.core.stock.Scroller.prototype.splineArea;
anychart.core.stock.Scroller.prototype['stepArea'] = anychart.core.stock.Scroller.prototype.stepArea;
anychart.core.stock.Scroller.prototype['stepLine'] = anychart.core.stock.Scroller.prototype.stepLine;
anychart.core.stock.Scroller.prototype['getSeries'] = anychart.core.stock.Scroller.prototype.getSeries;
anychart.core.stock.Scroller.prototype['yScale'] = anychart.core.stock.Scroller.prototype.yScale;
anychart.core.stock.Scroller.prototype['xAxis'] = anychart.core.stock.Scroller.prototype.xAxis;
anychart.core.stock.Scroller.prototype['defaultSeriesType'] = anychart.core.stock.Scroller.prototype.defaultSeriesType;
anychart.core.stock.Scroller.prototype['addSeries'] = anychart.core.stock.Scroller.prototype.addSeries;
anychart.core.stock.Scroller.prototype['getSeriesAt'] = anychart.core.stock.Scroller.prototype.getSeriesAt;
anychart.core.stock.Scroller.prototype['getSeriesCount'] = anychart.core.stock.Scroller.prototype.getSeriesCount;
anychart.core.stock.Scroller.prototype['removeSeries'] = anychart.core.stock.Scroller.prototype.removeSeries;
anychart.core.stock.Scroller.prototype['removeSeriesAt'] = anychart.core.stock.Scroller.prototype.removeSeriesAt;
anychart.core.stock.Scroller.prototype['removeAllSeries'] = anychart.core.stock.Scroller.prototype.removeAllSeries;
anychart.core.stock.Scroller.prototype['ema'] = anychart.core.stock.Scroller.prototype.ema;
anychart.core.stock.Scroller.prototype['macd'] = anychart.core.stock.Scroller.prototype.macd;
anychart.core.stock.Scroller.prototype['roc'] = anychart.core.stock.Scroller.prototype.roc;
anychart.core.stock.Scroller.prototype['rsi'] = anychart.core.stock.Scroller.prototype.rsi;
anychart.core.stock.Scroller.prototype['sma'] = anychart.core.stock.Scroller.prototype.sma;
