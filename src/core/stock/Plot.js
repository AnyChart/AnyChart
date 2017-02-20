goog.provide('anychart.core.stock.Plot');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.annotations.PlotController');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axes.StockDateTime');
goog.require('anychart.core.grids.Stock');
goog.require('anychart.core.reporting');
goog.require('anychart.core.series.Stock');
goog.require('anychart.core.stock.indicators');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.utils.GenericContextProvider');
goog.require('anychart.enums');
goog.require('anychart.palettes');
goog.require('anychart.scales.Linear');
goog.require('anychart.utils');
goog.require('goog.fx.Dragger');


/**
 * Namespace anychart.core.stock
 * @namespace
 * @name anychart.core.stock
 */



/**
 * Stock Plot class.
 * @param {!anychart.charts.Stock} chart Stock chart reference.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.IPlot}
 */
anychart.core.stock.Plot = function(chart) {
  anychart.core.stock.Plot.base(this, 'constructor');

  /**
   * Parent chart reference.
   * @type {!anychart.charts.Stock}
   * @private
   */
  this.chart_ = chart;

  /**
   * Plot background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Series list.
   * @type {!Array.<!anychart.core.series.Stock>}
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
   * Default plot Y scale.
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.yScale_ = null;

  /**
   * Y axes list.
   * @type {!Array.<!anychart.core.axes.Linear>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * X axis.
   * @type {anychart.core.axes.StockDateTime}
   * @private
   */
  this.xAxis_ = null;

  /**
   * @type {Array.<anychart.core.grids.Stock>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Stock>}
   * @private
   */
  this.minorGrids_ = [];

  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.dateTimeHighlighter_ = null;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.dateTimeHighlighterStroke_ = '#f00';

  /**
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsInterceptor_ = null;

  /**
   * @type {number|undefined}
   * @private
   */
  this.frame_ = undefined;

  /**
   * @type {!function(number)}
   * @private
   */
  this.frameAction_ = goog.bind(function(time) {
    this.frame_ = undefined;
    if (isNaN(this.frameHighlightRatio_))
      this.chart_.unhighlight();
    else
      this.chart_.highlightAtRatio(this.frameHighlightRatio_, this.frameHighlightX_, this.frameHighlightY_);
  }, this);

  this.defaultSeriesType(anychart.enums.StockSeriesType.LINE);
};
goog.inherits(anychart.core.stock.Plot, anychart.core.VisualBaseWithBounds);


/**
 * @type {number}
 * @private
 */
anychart.core.stock.Plot.prototype.frameHighlightRatio_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.stock.Plot.prototype.frameHighlightX_;


/**
 * @type {number}
 * @private
 */
anychart.core.stock.Plot.prototype.frameHighlightY_;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.stock.Plot.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION |
    // signal dispatched on highlight
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.stock.Plot.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_PLOT_GRIDS |
    anychart.ConsistencyState.STOCK_PLOT_AXES |
    anychart.ConsistencyState.STOCK_PLOT_DT_AXIS |
    anychart.ConsistencyState.STOCK_PLOT_SERIES |
    anychart.ConsistencyState.STOCK_PLOT_BACKGROUND |
    anychart.ConsistencyState.STOCK_PLOT_PALETTE |
    anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS |
    anychart.ConsistencyState.STOCK_PLOT_LEGEND;


/**
 * Series Z-index increment multiplier.
 * @type {number}
 */
anychart.core.stock.Plot.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.core.stock.Plot.ZINDEX_GRID = 10;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.core.stock.Plot.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.core.stock.Plot.ZINDEX_LINE_SERIES = 31;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.core.stock.Plot.ZINDEX_AXIS = 35;


/**
 * Background ZIndex.
 * @type {number}
 */
anychart.core.stock.Plot.ZINDEX_BACKGROUND = 1;


//region Series-related methods
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.area = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.candlestick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.column = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new jumpLine series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.jumpLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.JUMP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new stick series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.stick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STICK, opt_data, opt_mappingSettings, opt_csvSettings);
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.line = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.marker = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.ohlc = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.rangeArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.rangeColumn = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.rangeSplineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.rangeStepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.spline = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.splineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.stepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.stepLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STEP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Add series to chart.
 * @param {...anychart.data.TableMapping} var_args Chart series data.
 * @return {Array.<anychart.core.series.Stock>} Array of created series.
 */
anychart.core.stock.Plot.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (count) {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType(type, arguments[i]));
    }
  } else {
    rv.push(this.createSeriesByType(type, null));
  }
  this.resumeSignalsDispatching(true);
  return rv;
};


/**
 * Find series index by its id.
 * @param {number|string} id Series id.
 * @return {number} Series index or -1 if didn't find.
 */
anychart.core.stock.Plot.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.series.Stock} Series instance.
 */
anychart.core.stock.Plot.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.series.Stock} Series instance.
 */
anychart.core.stock.Plot.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.core.stock.Plot.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.core.stock.Plot}
 */
anychart.core.stock.Plot.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.core.stock.Plot}
 */
anychart.core.stock.Plot.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
        anychart.ConsistencyState.STOCK_PLOT_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.core.stock.Plot} Self for method chaining.
 */
anychart.core.stock.Plot.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
        anychart.ConsistencyState.STOCK_PLOT_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Returns series list. Considered internal. Returns it for reading only.
 * @return {!Array.<anychart.core.series.Stock>}
 */
anychart.core.stock.Plot.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Creates AMA indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.AMA}
 */
anychart.core.stock.Plot.prototype.ama = function(mapping, opt_period, opt_fastPeriod, opt_slowPeriod, opt_seriesType) {
  var result = new anychart.core.stock.indicators.AMA(this, mapping, opt_period, opt_fastPeriod, opt_slowPeriod, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates Aroon indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_upSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_downSeriesType
 * @return {anychart.core.stock.indicators.Aroon}
 */
anychart.core.stock.Plot.prototype.aroon = function(mapping, opt_period, opt_upSeriesType, opt_downSeriesType) {
  var result = new anychart.core.stock.indicators.Aroon(this, mapping, opt_period, opt_upSeriesType, opt_downSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates ATR indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.ATR}
 */
anychart.core.stock.Plot.prototype.atr = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.ATR(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates BBands indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period [20] Sets moving average period value.
 * @param {number=} opt_deviation [2] Sets the multiplier applied to the moving average to compute upper and lower bands of the indicator.
 * @param {anychart.enums.StockSeriesType=} opt_middleSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_upperSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_lowerSeriesType
 * @return {anychart.core.stock.indicators.BBands}
 */
anychart.core.stock.Plot.prototype.bbands = function(mapping, opt_period, opt_deviation, opt_middleSeriesType, opt_upperSeriesType, opt_lowerSeriesType) {
  var result = new anychart.core.stock.indicators.BBands(this, mapping, opt_period, opt_deviation, opt_middleSeriesType, opt_upperSeriesType, opt_lowerSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates BBands %B indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period [20] Sets moving average period value.
 * @param {number=} opt_deviation [2] Sets the multiplier applied to the moving average to compute upper and lower bands of the indicator.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.BBandsB}
 */
anychart.core.stock.Plot.prototype.bbandsB = function(mapping, opt_period, opt_deviation, opt_seriesType) {
  var result = new anychart.core.stock.indicators.BBandsB(this, mapping, opt_period, opt_deviation, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates BBands Width indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period [20] Sets moving average period value.
 * @param {number=} opt_deviation [2] Sets the multiplier applied to the moving average to compute upper and lower bands of the indicator.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.BBandsWidth}
 */
anychart.core.stock.Plot.prototype.bbandsWidth = function(mapping, opt_period, opt_deviation, opt_seriesType) {
  var result = new anychart.core.stock.indicators.BBandsWidth(this, mapping, opt_period, opt_deviation, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates EMA indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.EMA}
 */
anychart.core.stock.Plot.prototype.ema = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.EMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates KDJ indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
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
 * @return {anychart.core.stock.indicators.KDJ}
 */
anychart.core.stock.Plot.prototype.kdj = function(mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier, opt_kSeriesType, opt_dSeriesType, opt_jSeriesType) {
  var result = new anychart.core.stock.indicators.KDJ(this, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier, opt_kSeriesType, opt_dSeriesType, opt_jSeriesType);
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
anychart.core.stock.Plot.prototype.macd = function(mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod,
    opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType) {
  var result = new anychart.core.stock.indicators.MACD(this, mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod,
      opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates MMA indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @return {anychart.core.stock.indicators.MMA}
 */
anychart.core.stock.Plot.prototype.mma = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.MMA(this, mapping, opt_period, opt_seriesType);
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
anychart.core.stock.Plot.prototype.roc = function(mapping, opt_period, opt_seriesType) {
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
anychart.core.stock.Plot.prototype.rsi = function(mapping, opt_period, opt_seriesType) {
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
anychart.core.stock.Plot.prototype.sma = function(mapping, opt_period, opt_seriesType) {
  var result = new anychart.core.stock.indicators.SMA(this, mapping, opt_period, opt_seriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Creates Stochastic indicator on the chart.
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [1] Indicator K smoothing period. Defaults to 1.
 * @param {number=} opt_dPeriod [3] Indicator D period. Defaults to 3.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [SMA] Indicator K smoothing type. Defaults to SMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [SMA] Indicator D smoothing type. Defaults to SMA.
 * @param {anychart.enums.StockSeriesType=} opt_kSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_dSeriesType
 * @return {anychart.core.stock.indicators.Stochastic}
 */
anychart.core.stock.Plot.prototype.stochastic = function(mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kSeriesType, opt_dSeriesType) {
  var result = new anychart.core.stock.indicators.Stochastic(this, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kSeriesType, opt_dSeriesType);
  this.indicators_.push(result);
  return result;
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.core.stock.Plot.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


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
 * @return {anychart.core.series.Stock}
 */
anychart.core.stock.Plot.prototype.createSeriesByType = function(type, opt_data, opt_mappingSettings, opt_csvSettings) {
  var configAndType = this.chart_.getConfigByType(type);
  if (configAndType) {
    var config = /** @type {anychart.core.series.TypeConfig} */(configAndType[1]);
    var series = new anychart.core.series.Stock(this.chart_, this, type, config);

    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */(lastSeries.autoIndex()) + 1 : 0;
    this.series_.push(series);
    var inc = index * anychart.core.stock.Plot.ZINDEX_INCREMENT_MULTIPLIER;
    var seriesZIndex = (series.isLineBased() ?
            anychart.core.stock.Plot.ZINDEX_LINE_SERIES :
            anychart.core.stock.Plot.ZINDEX_SERIES) + inc;

    series.autoIndex(index);
    series.data(opt_data || null, opt_mappingSettings, opt_csvSettings);
    series.setAutoZIndex(seriesZIndex);
    series.clip(true);
    series.setAutoColor(this.palette().itemAt(index));
    series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    series.setParentEventTarget(this);
    series.listenSignals(this.seriesInvalidated_, this);

    this.invalidate(
        anychart.ConsistencyState.STOCK_PLOT_SERIES |
        anychart.ConsistencyState.STOCK_PLOT_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    series = null;
  }

  return series;
};
//endregion


//region Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for stock plot defaultSeriesType.
 * @param {(string|anychart.enums.StockSeriesType)=} opt_value Default series type.
 * @return {anychart.core.stock.Plot|anychart.enums.StockSeriesType} Default series type or self for chaining.
 */
anychart.core.stock.Plot.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeStockSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/**
 * Returns stock chart.
 * @return {!anychart.charts.Stock}
 */
anychart.core.stock.Plot.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Getter/setter for y axis default settings.
 * @param {Object} value Object with default settings.
 */
anychart.core.stock.Plot.prototype.setDefaultYAxisSettings = function(value) {
  this.defaultYAxisSettings_ = value;
};


/**
 * Getter/setter for minor grid default settings.
 * @param {Object} value Object with default minor grid settings.
 */
anychart.core.stock.Plot.prototype.setDefaultMinorGridSettings = function(value) {
  this.defaultMinorGridSettings_ = value;
};


/**
 * Getter/setter for grid default settings.
 * @param {Object} value Object with default grid settings.
 */
anychart.core.stock.Plot.prototype.setDefaultGridSettings = function(value) {
  this.defaultGridSettings_ = value;
};


/**
 * Invalidates plot series. Doesn't dispatch anything.
 * @param {boolean} doInvalidateBounds
 * @param {boolean=} opt_skipLegend
 */
anychart.core.stock.Plot.prototype.invalidateRedrawable = function(doInvalidateBounds, opt_skipLegend) {
  var i;

  var state = anychart.ConsistencyState.SERIES_POINTS;
  if (doInvalidateBounds) state |= anychart.ConsistencyState.BOUNDS;
  for (i = 0; i < this.series_.length; i++) {
    if (this.series_[i])
      this.series_[i].invalidate(state);
  }

  this.annotations().invalidateAnnotations();

  for (i = 0; i < this.yAxes_.length; i++) {
    var axis = this.yAxes_[i];
    if (axis) {
      axis.suspendSignalsDispatching();
      // effectively invalidates all what's needed
      axis.invalidateParentBounds();
      axis.resumeSignalsDispatching(false);
    }
  }

  var grid;
  for (i = 0; i < this.grids_.length; i++) {
    grid = this.grids_[i];
    if (grid)
      grid.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
  }
  for (i = 0; i < this.minorGrids_.length; i++) {
    grid = this.minorGrids_[i];
    if (grid)
      grid.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
  }

  state = anychart.ConsistencyState.APPEARANCE;
  if (doInvalidateBounds) state |= anychart.ConsistencyState.BOUNDS;
  if (this.xAxis_)
    this.xAxis_.invalidate(state);

  if (!opt_skipLegend && this.legend_ && this.legend_.enabled())
    this.legend_.invalidate(state);

  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
      anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS |
      anychart.ConsistencyState.STOCK_PLOT_AXES |
      anychart.ConsistencyState.STOCK_PLOT_DT_AXIS |
      anychart.ConsistencyState.STOCK_PLOT_GRIDS |
      anychart.ConsistencyState.STOCK_PLOT_LEGEND);
};


/**
 * Returns plot series drawing width.
 * @return {number}
 */
anychart.core.stock.Plot.prototype.getDrawingWidth = function() {
  this.ensureBoundsDistributed_();
  return this.seriesBounds_.width;
};
//endregion


//region Public getters, setters and methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public getters, setters and methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Plot background getter-setter.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.stock.Plot|anychart.core.ui.Background} .
 */
anychart.core.stock.Plot.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.enabled(false);
    this.background_.zIndex(anychart.core.stock.Plot.ZINDEX_BACKGROUND);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {!(anychart.core.stock.Plot|anychart.core.ui.Legend)} Chart legend instance of itself for chaining call.
 */
anychart.core.stock.Plot.prototype.legend = function(opt_value) {
  if (!this.legend_) {
    this.legend_ = new anychart.core.ui.Legend();
    this.registerDisposable(this.legend_);
    this.legend_.zIndex(200);
    this.legend_.listenSignals(this.onLegendSignal_, this);
    this.legend_.listen(anychart.enums.EventType.DRAG_START, function(e) {
      this.chart_.preventHighlight();
    }, false, this);
    this.legend_.listen(anychart.enums.EventType.DRAG_END, function(e) {
      this.chart_.allowHighlight();
    }, false, this);

    this.legend_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    this.legend_.setup(opt_value);
    return this;
  } else {
    return this.legend_;
  }
};


/**
 * Default plot Y scale getter/setter.
 * @param {(anychart.enums.ScatterScaleTypes|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.core.stock.Plot)} Default chart scale value or itself for method chaining.
 */
anychart.core.stock.Plot.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.ScatterBase.fromString(opt_value, false);
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales', 'scatter', 'linear, log']);
      return this;
    }
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.yScaleInvalidated, this);
      this.yScale_ = opt_value;
      if (this.yScale_)
        this.yScale_.listenSignals(this.yScaleInvalidated, this);
      this.invalidateRedrawable(false);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
    }
    return this.yScale_;
  }
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} e
 * @protected
 */
anychart.core.stock.Plot.prototype.yScaleInvalidated = function(e) {
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
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES, signal);
  }
};


/**
 * Y axis multi getter/setter.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.core.stock.Plot)} Axis instance by index or itself for method chaining.
 */
anychart.core.stock.Plot.prototype.yAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var axis = this.yAxes_[index];
  if (!axis) {
    axis = new anychart.core.axes.Linear();
    this.yAxes_[index] = axis;
    axis.setup(this.defaultYAxisSettings_);
    axis.setParentEventTarget(this);
    axis.listenSignals(this.yAxisInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * X axis getter/setter.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.StockDateTime|anychart.core.stock.Plot)}
 */
anychart.core.stock.Plot.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.core.axes.StockDateTime(this.chart_);
    this.xAxis_.setParentEventTarget(this);
    this.xAxis_.enabled(false);
    this.xAxis_.zIndex(anychart.core.stock.Plot.ZINDEX_AXIS);
    this.xAxis_.listenSignals(this.xAxisInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.xAxis_.setup(opt_value);
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 * Gets axis by index.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.StockDateTime|anychart.core.axes.Linear|undefined}
 */
anychart.core.stock.Plot.prototype.getAxisByIndex = function(index) {
  return index ? (this.yAxes_[index - 1]) : this.xAxis_;
};


/**
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Stock|anychart.core.stock.Plot)} Grid instance by index or itself for method chaining.
 */
anychart.core.stock.Plot.prototype.grid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Stock();
    grid.setPlot(this);
    grid.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    grid.setup(this.defaultGridSettings_);
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Minor grid settings.
 * @param {(Object|boolean|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.grids.Stock|anychart.core.stock.Plot)} Minor grid instance by index or itself for method chaining.
 */
anychart.core.stock.Plot.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Stock();
    grid.setPlot(this);
    grid.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    grid.setup(this.defaultMinorGridSettings_);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. If empty - set to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|anychart.core.stock.Plot} .
 */
anychart.core.stock.Plot.prototype.dateTimeHighlighter = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.dateTimeHighlighterStroke_ != color) {
      this.dateTimeHighlighterStroke_ = color;
      if (this.dateTimeHighlighter_)
        this.dateTimeHighlighter_.stroke(this.dateTimeHighlighterStroke_);
    }
    return this;
  } else {
    return this.dateTimeHighlighterStroke_;
  }
};
//endregion


//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws the plot.
 * @return {anychart.core.stock.Plot}
 */
anychart.core.stock.Plot.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var i, axis, series;

  this.suspendSignalsDispatching();

  this.ensureVisualReady_();

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_PALETTE)) {
    var palette = this.palette();
    var markerPalette = this.markerPalette();
    var hatchFillPalette = this.hatchFillPalette();
    for (i = 0; i < this.series_.length; i++) {
      series = this.series_[i];
      var index = /** @type {number} */(series.autoIndex());
      series.setAutoColor(/** @type {acgraph.vector.Fill} */(palette.itemAt(index)));
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(markerPalette.itemAt(index)));
      series.setAutoHatchFill(/** @type {acgraph.vector.PatternFill} */(hatchFillPalette.itemAt(index)));
    }
    this.invalidateRedrawable(false);
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_PALETTE);
  }

  this.ensureBoundsDistributed_();

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_AXES)) {
    for (i = 0; i < this.yAxes_.length; i++) {
      axis = this.yAxes_[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        if (!axis.scale()) axis.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
        axis.labels().dropCallsCache();
        axis.minorLabels().dropCallsCache();
        axis.container(this.rootLayer_);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS)) {
    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.scale(/** @type {anychart.scales.StockScatterDateTime} */(this.chart_.xScale()));
      this.xAxis_.container(this.rootLayer_);
      this.xAxis_.draw();
      this.xAxis_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_GRIDS)) {
    /** @type {Array.<anychart.core.grids.Stock>} */
    var grids = goog.array.concat(this.grids_, this.minorGrids_);
    for (i = 0; i < grids.length; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (!grid.scale()) {
          if (grid.isHorizontal()) {
            grid.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
          } else {
            grid.scale(/** @type {anychart.scales.StockScatterDateTime} */(this.chart_.xScale()));
          }
        }
        grid.parentBounds(this.seriesBounds_);
        grid.container(this.rootLayer_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_GRIDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND)) {
    if (this.background_) {
      this.background_.suspendSignalsDispatching();
      this.background_.container(this.rootLayer_);
      this.background_.draw();
      this.background_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_SERIES)) {
    for (i = 0; i < this.series_.length; i++) {
      series = this.series_[i];
      if (series) {
        series.suspendSignalsDispatching();
        series.parentBounds(this.seriesBounds_);
        series.container(this.rootLayer_);
        series.draw();
        series.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS)) {
    var annotations = this.annotations();
    annotations.suspendSignalsDispatching();
    annotations.parentBounds(this.seriesBounds_);
    annotations.container(this.rootLayer_);
    annotations.draw();
    annotations.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS);
  }

  this.resumeSignalsDispatching(false);

  // this is a debug code and should remain until we finally decide what to do with auto gaps
  // if (!this.__zeroPath)
  //   this.__zeroPath = this.container().getStage().rect().zIndex(1000).stroke('3 red');
  // var s = this.getSeriesAt(0);
  // var b = this.seriesBounds_;
  // var l = this.chart_.xScale().transform(this.chart_.dataController_.getFirstSelectedKey());
  // var r = this.chart_.xScale().transform(this.chart_.dataController_.getLastSelectedKey());
  // var tmp = s.applyRatioToBounds(l, true);
  // this.__zeroPath.setY(b.top).setHeight(b.height).setX(tmp).setWidth(s.applyRatioToBounds(r, true) - tmp);


  return this;
};


/**
 * Ensures that the root layer is created.
 * @private
 */
anychart.core.stock.Plot.prototype.ensureVisualReady_ = function() {
  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer_);
    this.eventsInterceptor_ = this.rootLayer_.rect();
    this.eventsInterceptor_.zIndex(199);
    //this.eventsInterceptor_.cursor(acgraph.vector.Cursor.EW_RESIZE);
    this.eventsInterceptor_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.eventsInterceptor_.stroke(null);
    this.eventsHandler.listenOnce(this.eventsInterceptor_, acgraph.events.EventType.MOUSEDOWN, this.initDragger_);
    this.eventsHandler.listenOnce(this.eventsInterceptor_, acgraph.events.EventType.TOUCHSTART, this.initDragger_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEOVER, this.handlePlotMouseOverAndMove_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEMOVE, this.handlePlotMouseOverAndMove_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEOUT, this.handlePlotMouseOut_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEDOWN, this.handlePlotMouseDown_);
  }
};


/**
 * Ensures that plot space is distributed among plot elements.
 * Redraws legend twice.
 * @private
 */
anychart.core.stock.Plot.prototype.ensureBoundsDistributed_ = function() {
  this.ensureVisualReady_();

  var i;
  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_SERIES)) {
    for (i = 0; i < this.series_.length; i++) {
      var series = this.series_[i];
      if (series) {
        series.updateLastRow();
      }
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOT_LEGEND)) {
    var seriesBounds = this.getPixelBounds();
    if (this.background_) {
      this.background_.parentBounds(seriesBounds);
    }

    var legendTitleDate;
    if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_LEGEND)) {
      legendTitleDate = isNaN(this.highlightedValue_) ? this.chart_.getLastDate() : this.highlightedValue_;
    } else {
      legendTitleDate = NaN;
    }

    var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
    if (legend.positionMode() == anychart.enums.LegendPositionMode.OUTSIDE) {
      this.updateLegend_(seriesBounds, legendTitleDate);
      // we need forced dispatch signal here to update standalone legend on series enable/disable
      // we do not worry about it because only standalone legend listens this signal
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND, true);

      seriesBounds = this.legend().getRemainingBounds();
    }

    if (this.xAxis_ && this.xAxis_.enabled()) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.parentBounds(seriesBounds);
      this.xAxis_.resumeSignalsDispatching(false);
      // we need this to reduce bounds height by the height of the axis
      seriesBounds = this.xAxis_.getRemainingBounds();
      this.invalidate(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS);
    }

    var leftPadding = 0;
    var rightPadding = 0;
    for (i = 0; i < this.yAxes_.length; i++) {
      var axis = this.yAxes_[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        var width = axis.width();
        if (axis.orientation() == anychart.enums.Orientation.LEFT) {
          axis.parentBounds(/** @type {number} */(seriesBounds.left - width - leftPadding),
              seriesBounds.top, 0, seriesBounds.height);
          leftPadding += width;
        } else if (axis.orientation() == anychart.enums.Orientation.RIGHT) {
          rightPadding += width;
          axis.parentBounds(seriesBounds.left, seriesBounds.top, /** @type {number} */(seriesBounds.width + rightPadding), seriesBounds.height);
        }
        axis.resumeSignalsDispatching(false);
      }
    }

    if (this.xAxis_ && this.xAxis_.enabled()) {
      this.xAxis_.suspendSignalsDispatching();
      // we need this to tell xAxis about new width by Y axes
      this.xAxis_.parentBounds(seriesBounds.left, seriesBounds.top,
          seriesBounds.width, /** @type {number} */(seriesBounds.height + this.xAxis_.height()));
      this.xAxis_.resumeSignalsDispatching(false);
      seriesBounds = this.xAxis_.getRemainingBounds();
    }

    if (legend.positionMode() == anychart.enums.LegendPositionMode.INSIDE) {
      this.updateLegend_(seriesBounds, legendTitleDate);
      // we need forced dispatch signal here to update standalone legend on series enable/disable
      // we do not worry about it because only standalone legend listens this signal
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND, true);
    }

    this.seriesBounds_ = seriesBounds;
    this.eventsInterceptor_.setBounds(this.seriesBounds_);
    this.invalidateRedrawable(true, true);
    this.markConsistent(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOT_LEGEND);
  }
};
//endregion


//region Legend
//----------------------------------------------------------------------------------------------------------------------
//
//  Legend
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets autoText for legend title.
 * @param {string|Function} legendFormatter Legend title formatter.
 * @param {number=} opt_titleValue Value for title.
 * @return {?string} Title auto text or null.
 */
anychart.core.stock.Plot.prototype.getLegendAutoText = function(legendFormatter, opt_titleValue) {
  opt_titleValue = opt_titleValue || (isNaN(this.highlightedValue_) ? this.chart_.getLastDate() : this.highlightedValue_);
  var formatter;
  if (!isNaN(opt_titleValue) && (formatter = legendFormatter)) {
    if (goog.isString(formatter))
      formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);
    if (goog.isFunction(formatter)) {
      var grouping = /** @type {anychart.core.stock.Grouping} */(this.chart_.grouping());
      var context = new anychart.core.utils.GenericContextProvider({
        'value': opt_titleValue,
        'hoveredDate': opt_titleValue,
        'dataIntervalUnit': grouping.getCurrentDataInterval()['unit'],
        'dataIntervalUnitCount': grouping.getCurrentDataInterval()['count'],
        'isGrouped': grouping.isGrouped()
      }, {
        'value': anychart.enums.TokenType.DATE_TIME,
        'hoveredDate': anychart.enums.TokenType.DATE_TIME,
        'dataIntervalUnit': anychart.enums.TokenType.STRING,
        'dataIntervalUnitCount': anychart.enums.TokenType.STRING
      });
      return formatter.call(context, context);
    }
  }
  return null;
};


/**
 * Updates legend.
 * @param {anychart.math.Rect=} opt_seriesBounds
 * @param {number=} opt_titleValue
 * @private
 */
anychart.core.stock.Plot.prototype.updateLegend_ = function(opt_seriesBounds, opt_titleValue) {
  var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
  legend.suspendSignalsDispatching();
  legend.container(this.rootLayer_);
  if (opt_seriesBounds) {
    legend.parentBounds(opt_seriesBounds);
  }
  var autoText = this.getLegendAutoText(/** @type {string|Function} */ (legend.titleFormatter()), opt_titleValue);
  if (!goog.isNull(autoText))
    legend.title().autoText(autoText);
  if (!legend.itemsSource())
    legend.itemsSource(this);
  legend.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.LEGEND_RECREATE_ITEMS);
  legend.draw();
  legend.resumeSignalsDispatching(false);
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.stock.Plot.prototype.onLegendSignal_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.STOCK_PLOT_LEGEND;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals !state and nothing will happen.
  this.invalidate(state, signal);
};


/**
 * Create legend items provider specific to chart type.
 * @param {string} sourceMode Items source mode (default|categories).
 * @param {?(Function|string)} itemsTextFormatter Legend items text formatter.
 * @return {!Array.<anychart.core.ui.Legend.LegendItemProvider>} Legend items provider.
 */
anychart.core.stock.Plot.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0; i < this.series_.length; i++) {
    /** @type {anychart.core.series.Stock} */
    var series = this.series_[i];
    if (series) {
      var itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.id();
      data.push(itemData);
    }
  }
  return data;
};


/**
 * Identifies that legend item created by this source can interact in specified mode.
 * By default can interact only in DEFAULT mode.
 * @param {anychart.enums.LegendItemsSourceMode} mode Legend mode for this chart.
 * @return {boolean} Can interact or not.
 */
anychart.core.stock.Plot.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.DEFAULT);
};


/**
 * Calls when legend item that some how belongs to the chart was clicked.
 * @param {anychart.core.ui.LegendItem} item Legend item that was clicked.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.stock.Plot.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  var series = this.getSeries(/** @type {number} */ (sourceKey));
  if (series) {
    series.enabled(!series.enabled());
    if (series.enabled())
      series.hoverSeries();
    else
      series.unhover();
  }
};


/**
 * Calls when legend item that some how belongs to the chart was hovered.
 * @param {anychart.core.ui.LegendItem} item Legend item that was hovered.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.stock.Plot.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var series = this.getSeries(/** @type {number} */ (sourceKey));
  if (series) {
    series.hoverSeries();
  }
};


/**
 * Calls when legend item that some how belongs to the chart was unhovered.
 * @param {anychart.core.ui.LegendItem} item Legend item that was unhovered.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.stock.Plot.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var series = this.getSeries(/** @type {number} */ (sourceKey));
  if (series) {
    series.unhover();
  }
};


/**
 * Returns true, if it is a stock plot. Used in standalone legend.
 * @return {boolean}
 */
anychart.core.stock.Plot.prototype.needsInteractiveLegendUpdate = function() {
  return true;
};
//endregion


//region Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Prepares highlight and returns an array of highlighted data rows for each series of the plot.
 * @param {number} value
 * @return {Array.<{series:?anychart.core.series.Stock, point:?anychart.data.TableSelectable.RowProxy}>}
 */
anychart.core.stock.Plot.prototype.prepareHighlight = function(value) {
  return goog.array.map(this.series_, function(series) {
    return {
      'series': series,
      'point': series && series.enabled() && series.prepareHighlight(value) || null
    };
  });
};


/**
 * Highlights passed value.
 * @param {number} value
 */
anychart.core.stock.Plot.prototype.highlight = function(value) {
  if (!this.rootLayer_ || !this.seriesBounds_) return;

  var ratio = this.chart_.xScale().transform(value);

  this.highlightedValue_ = value;

  var thickness = acgraph.vector.getThickness(this.dateTimeHighlighterStroke_);
  if (thickness && this.dateTimeHighlighterStroke_ != 'none' && ratio >= 0 && ratio <= 1) {
    if (!this.dateTimeHighlighter_) {
      this.dateTimeHighlighter_ = acgraph.path();
      this.dateTimeHighlighter_.fill(null);
      this.dateTimeHighlighter_.stroke(this.dateTimeHighlighterStroke_);
      this.dateTimeHighlighter_.disablePointerEvents(true);
      this.dateTimeHighlighter_.zIndex(1000);
    } else {
      this.dateTimeHighlighter_.clear();
    }
    var x = this.seriesBounds_.left + ratio * this.seriesBounds_.width;
    x = anychart.utils.applyPixelShift(x, thickness);
    this.dateTimeHighlighter_.moveTo(x, this.seriesBounds_.top);
    this.dateTimeHighlighter_.lineTo(x, this.seriesBounds_.getBottom());
    if (!this.dateTimeHighlighter_.parent())
      this.rootLayer_.addChild(this.dateTimeHighlighter_);
  } else if (this.dateTimeHighlighter_) {
    this.dateTimeHighlighter_.remove();
  }

  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series)
      series.highlight(value);
  }

  if (this.legend_ && this.legend_.enabled()) {
    this.updateLegend_(null, value);
  }
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
};


/**
 */
anychart.core.stock.Plot.prototype.unhighlight = function() {
  if (this.dateTimeHighlighter_)
    this.dateTimeHighlighter_.remove();

  this.highlightedValue_ = NaN;

  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series)
      series.removeHighlight();
  }

  if (this.legend_ && this.legend_.enabled()) {
    this.updateLegend_(null, this.chart_.getLastDate());
  }
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
};
//endregion


//region Drag
//----------------------------------------------------------------------------------------------------------------------
//
//  Drag
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mousedown handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.initDragger_ = function(e) {
  this.dragger_ = new anychart.core.stock.Plot.Dragger(this, this.eventsInterceptor_);
  this.dragger_.startDrag(e.getOriginalEvent());
};


/**
 * Handles mouseOver over the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.handlePlotMouseOverAndMove_ = function(e) {
  if (this.seriesBounds_) {
    var stageReferencePoint = this.container().getStage().getClientPosition();
    var x = e['clientX'] - stageReferencePoint.x - this.seriesBounds_.left;
    var y = e['clientY'] - stageReferencePoint.y - this.seriesBounds_.top;
    // testing that the point is inside series area
    if (x >= 0 && x <= this.seriesBounds_.width &&
        y >= 0 && y <= this.seriesBounds_.height) {
      this.frameHighlightRatio_ = x / this.seriesBounds_.width;
      this.frameHighlightX_ = e['clientX'];
      this.frameHighlightY_ = e['clientY'];
      if (!goog.isDef(this.frame_))
        this.frame_ = window.requestAnimationFrame(this.frameAction_);
    }
  }
};


/**
 * Handles mouseOut over the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.handlePlotMouseOut_ = function(e) {
  this.frameHighlightRatio_ = NaN;
  if (!goog.isDef(this.frame_))
    this.frame_ = window.requestAnimationFrame(this.frameAction_);
};


/**
 * Handles mouseDown event on the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.handlePlotMouseDown_ = function(e) {
  this.annotations().unselect();
};
//endregion


//region Annotations
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Annotations plot-level controller.
 * @param {(boolean|Array.<anychart.enums.AnnotationTypes|anychart.core.annotations.AnnotationJSONFormat>)=} opt_value
 * @return {anychart.core.stock.Plot|anychart.core.annotations.PlotController}
 */
anychart.core.stock.Plot.prototype.annotations = function(opt_value) {
  if (!this.annotations_) {
    this.annotations_ = new anychart.core.annotations.PlotController(
        /** @type {!anychart.core.annotations.ChartController} */(this.chart_.annotations()), this);
    this.annotations_.listenSignals(this.annotationsInvalidated_, this);
    this.annotations_.setParentEventTarget(this);
  }
  if (goog.isDef(opt_value)) {
    this.annotations_.setup(opt_value);
    return this;
  }
  return this.annotations_;
};
//endregion


//region Invalidation handlers
/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.annotationsInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.backgroundInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Series invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.seriesInvalidated_ = function(e) {
  var signal = anychart.Signal.NEEDS_REDRAW;
  var state = anychart.ConsistencyState.STOCK_PLOT_SERIES;
  if (e.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND))
    state |= anychart.ConsistencyState.STOCK_PLOT_LEGEND;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  }
  this.invalidate(state, signal);
};


/**
 * Y axis invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.yAxisInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.STOCK_PLOT_AXES;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.BOUNDS;
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * X axis invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.xAxisInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.STOCK_PLOT_DT_AXIS;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.BOUNDS;
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Listener for grids invalidation.
 * @param {anychart.SignalEvent} e Invalidation event.
 * @private
 */
anychart.core.stock.Plot.prototype.onGridSignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.stock.Plot)} .
 */
anychart.core.stock.Plot.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
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
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.core.stock.Plot)} Return current chart markers palette or itself for chaining call.
 */
anychart.core.stock.Plot.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.paletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.core.stock.Plot)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.core.stock.Plot.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.paletteInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.core.stock.Plot.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
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
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.STOCK_PLOT_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.stock.Plot.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};
//endregion


//region Serialization / deserialization / disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / deserialization / disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.stock.Plot.prototype.disposeInternal = function() {
  goog.dispose(this.annotations_);
  this.annotations_ = null;

  goog.dispose(this.background_);
  this.background_ = null;

  goog.disposeAll(this.indicators_);
  delete this.indicators_;

  goog.disposeAll(this.series_);
  delete this.series_;

  goog.disposeAll(this.yAxes_);
  delete this.yAxes_;

  goog.disposeAll(this.xAxis_);
  this.xAxis_ = null;

  delete this.chart_;
  delete this.defaultSeriesSettings_;
  delete this.defaultGridSettings_;
  delete this.defaultMinorGridSettings_;
  delete this.defaultYAxisSettings_;

  goog.disposeAll(this.palette_, this.markerPalette_, this.hatchFillPalette_);
  this.palette_ = this.markerPalette_ = this.hatchFillPalette_ = null;

  anychart.core.stock.Plot.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.stock.Plot.prototype.serialize = function() {
  var json = anychart.core.stock.Plot.base(this, 'serialize');
  var scalesIds = {};
  var scales = [];
  var axesIds = [];

  var scale;
  var config;
  var objId;
  var i;
  var axisId;
  var axis;
  var axisIndex;
  var axisScale;
  var axisOrientation;
  var isHorizontal;

  scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
  scales.push(scalesIds[goog.getUid(this.yScale())]);
  json['yScale'] = scales.length - 1;

  json['defaultSeriesType'] = this.defaultSeriesType();
  json['background'] = this.background().serialize();

  axesIds.push(goog.getUid(this.xAxis()));
  json['xAxis'] = this.xAxis().serialize();
  json['dateTimeHighlighter'] = anychart.color.serialize(this.dateTimeHighlighterStroke_);

  json['palette'] = this.palette().serialize();
  // json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
    config = yAxis.serialize();
    scale = yAxis.scale();
    if (scale) {
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['scale'] = scales.length - 1;
      } else {
        config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }
    }
    axesIds.push(goog.getUid(yAxis));

    yAxes.push(config);
  }
  if (yAxes.length)
    json['yAxes'] = yAxes;


  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
    if (grid) {
      config = grid.serialize();
      scale = grid.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      axis = grid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            isHorizontal = false;
            if (axis instanceof anychart.core.axes.Linear) {
              axisOrientation = axis.orientation();
              isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
            }
            config['layout'] = isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
          }
          if (!('scale' in config)) { //doesn't override the scale already set.
            objId = goog.getUid(axisScale);
            if (!scalesIds[objId]) {
              scalesIds[objId] = axisScale.serialize();
              scales.push(scalesIds[objId]);
              config['scale'] = scales.length - 1;
            } else {
              config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
            }
          }
        } else {
          config['axis'] = axisIndex;
        }
      }
      grids.push(config);
    }
  }
  if (grids.length)
    json['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
    if (minorGrid) {
      config = minorGrid.serialize();
      scale = minorGrid.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      minorGrids.push(config);
    }
  }
  if (minorGrids.length)
    json['minorGrids'] = minorGrids;


  var series = [];
  for (i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
    config = series_.serialize();
    scale = series_.yScale();
    if (scale) {
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['yScale'] = scales.length - 1;
      } else {
        config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }
    }
    series.push(config);
  }
  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['scales'] = scales;
  return json;
};


/** @inheritDoc */
anychart.core.stock.Plot.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.stock.Plot.base(this, 'setupByJSON', config, opt_default);
  var i, json, scale;

  this.defaultSeriesType(config['defaultSeriesType']);

  this.palette(config['palette']);
  // this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);

  this.background(config['background']);

  this.xAxis(config['xAxis']);
  this.dateTimeHighlighter(config['dateTimeHighlighter']);
  this.legend(config['legend']);
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

  if ('defaultGridSettings' in config)
    this.setDefaultGridSettings(config['defaultGridSettings']);

  var grids = config['grids'];
  if (goog.isArray(grids)) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if ('defaultMinorGridSettings' in config)
    this.setDefaultMinorGridSettings(config['defaultMinorGridSettings']);

  var minorGrids = config['minorGrids'];
  if (goog.isArray(minorGrids)) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.minorGrid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if ('defaultYAxisSettings' in config)
    this.setDefaultYAxisSettings(config['defaultYAxisSettings']);

  var yAxes = config['yAxes'];
  if (goog.isArray(yAxes)) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  this.annotations(config['annotations']);

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



//region anychart.core.stock.Plot.Dragger
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.core.stock.Plot.Dragger
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Dragger for plot thumbs.
 * @param {anychart.core.stock.Plot} plot
 * @param {acgraph.vector.Element} target
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.stock.Plot.Dragger = function(plot, target) {
  anychart.core.stock.Plot.Dragger.base(this, 'constructor', target.domElement());

  /**
   * Plot reference.
   * @type {anychart.core.stock.Plot}
   * @private
   */
  this.plot_ = plot;

  /**
   * @type {number|undefined}
   * @private
   */
  this.frame_ = undefined;

  /**
   * @type {!function(number)}
   * @private
   */
  this.frameAction_ = goog.bind(function(time) {
    this.frame_ = undefined;
    this.plot_.chart_.dragToRatio(this.frameRatio_, this.frameAnchor_);
  }, this);

  this.setHysteresis(3);

  this.listen(goog.fx.Dragger.EventType.START, this.dragStartHandler_, false, this);
  this.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
};
goog.inherits(anychart.core.stock.Plot.Dragger, goog.fx.Dragger);


/**
 * @type {number}
 * @private
 */
anychart.core.stock.Plot.Dragger.prototype.frameRatio_;


/**
 * @type {anychart.charts.Stock.DragAnchor}
 * @private
 */
anychart.core.stock.Plot.Dragger.prototype.frameAnchor_;


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.core.stock.Plot.Dragger.prototype.dragStartHandler_ = function(e) {
  return this.plot_.chart_.askDragStart();
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.stock.Plot.Dragger.prototype.dragEndHandler_ = function(e) {
  if (goog.isDef(this.frame_)) {
    window.cancelAnimationFrame(this.frame_);
    this.frameAction_(0);
  }
  this.plot_.chart_.dragEnd();
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.computeInitialPosition = function() {
  /**
   * @type {anychart.charts.Stock.DragAnchor}
   * @private
   */
  this.anchor_ = this.plot_.chart_.getDragAnchor();
  this.deltaX = 0;
  this.deltaY = 0;
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.defaultAction = function(x, y) {
  this.frameRatio_ = x / this.plot_.seriesBounds_.width;
  this.frameAnchor_ = this.anchor_;
  if (goog.isDef(this.frame_))
    window.cancelAnimationFrame(this.frame_);
  this.frame_ = window.requestAnimationFrame(this.frameAction_);
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.limitX = function(x) {
  var width = this.plot_.seriesBounds_.width;
  var ratio = this.plot_.chart_.limitDragRatio(x / width, this.anchor_);
  return ratio * width;
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.limitY = function(y) {
  return 0;
};
//endregion


//exports
(function() {
  var proto = anychart.core.stock.Plot.prototype;
  proto['background'] = proto.background;
  proto['legend'] = proto.legend;
  proto['area'] = proto.area;
  proto['candlestick'] = proto.candlestick;
  proto['column'] = proto.column;
  proto['jumpLine'] = proto.jumpLine;
  proto['stick'] = proto.stick;
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
  proto['yAxis'] = proto.yAxis;
  proto['xAxis'] = proto.xAxis;
  proto['grid'] = proto.grid;
  proto['minorGrid'] = proto.minorGrid;
  proto['dateTimeHighlighter'] = proto.dateTimeHighlighter;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['ama'] = proto.ama;
  proto['aroon'] = proto.aroon;
  proto['atr'] = proto.atr;
  proto['bbands'] = proto.bbands;
  proto['bbandsB'] = proto.bbandsB;
  proto['bbandsWidth'] = proto.bbandsWidth;
  proto['ema'] = proto.ema;
  proto['kdj'] = proto.kdj;
  proto['macd'] = proto.macd;
  proto['mma'] = proto.mma;
  proto['roc'] = proto.roc;
  proto['rsi'] = proto.rsi;
  proto['sma'] = proto.sma;
  proto['stochastic'] = proto.stochastic;
  proto['palette'] = proto.palette;
  // proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['annotations'] = proto.annotations;
})();
