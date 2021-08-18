goog.provide('anychart.stockModule.Plot');

goog.require('anychart.consistency');
goog.require('anychart.core.Axis');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.NoDataSettings');
goog.require('anychart.core.SeriesSettings');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.core.ui.DataArea');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.Title');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.palettes');
goog.require('anychart.scales.Linear');
goog.require('anychart.stockModule.Axis');
goog.require('anychart.stockModule.CurrentPriceIndicator');
goog.require('anychart.stockModule.Grid');
goog.require('anychart.stockModule.PlotControls');
goog.require('anychart.stockModule.Series');
goog.require('anychart.stockModule.eventMarkers.PlotController');
goog.require('anychart.stockModule.indicators');
goog.require('anychart.utils');
goog.require('goog.events.BrowserEvent');
goog.require('goog.fx.Dragger');



/**
 * Namespace anychart.core.stock
 * @namespace
 * @name anychart.core.stock
 */



/**
 * Stock Plot class.
 * @param {!anychart.stockModule.Chart} chart Stock chart reference.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.IPlot}
 */
anychart.stockModule.Plot = function(chart) {
  anychart.stockModule.Plot.base(this, 'constructor');

  this.addThemes('chart');

  /**
   * Parent chart reference.
   * @type {!anychart.stockModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Plot title.
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * Plot background.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Plot crosshair.
   * @type {anychart.core.ui.Crosshair}
   * @private
   */
  this.crosshair_ = null;

  /**
   * Series list.
   * @type {!Array.<!anychart.stockModule.Series>}
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
   * @type {!Array.<!anychart.core.Axis>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * Price indicators list.
   * @type {Array.<!anychart.stockModule.CurrentPriceIndicator>}
   * @private
   */
  this.priceIndicators_ = [];

  /**
   * X axis.
   * @type {anychart.stockModule.Axis}
   * @private
   */
  this.xAxis_ = null;

  /**
   * @type {Array.<anychart.core.axisMarkers.Line>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.stockModule.Grid>}
   * @private
   */
  this.xGrids_ = [];

  /**
   * @type {Array.<anychart.stockModule.Grid>}
   * @private
   */
  this.yGrids_ = [];

  /**
   * @type {Array.<anychart.stockModule.Grid>}
   * @private
   */
  this.xMinorGrids_ = [];

  /**
   * @type {Array.<anychart.stockModule.Grid>}
   * @private
   */
  this.yMinorGrids_ = [];

  /**
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.eventsInterceptor_ = null;

  /**
   * @type {anychart.annotationsModule.PlotController}
   * @private
   */
  this.annotations_ = null;

  /**
   * @type {anychart.stockModule.eventMarkers.PlotController}
   * @private
   */
  this.eventMarkers_ = null;

  /**
   * Statistics object.
   * @type {Object}
   * @private
   */
  this.statistics_ = {};

  /**
   * Whether this plot is first in chart.
   * @type {boolean}
   * @private
   */
  this.isFirstPlot_ = false;

  /**
   * Whether this plot is last in chart.
   * @type {boolean}
   * @private
   */
  this.isLastPlot_ = false;

  /**
   * Whether this plot is expanded or collapsed by plot controls.
   * True is for expanded, false - otherwise.
   * @type {boolean}
   * @private
   */
  this.isExpanded_ = false;

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
    if (isNaN(this.frameHighlightRatio_)) {
      this.chart_.unhighlight();
    } else {
      this.chart_.highlightAtRatio(this.frameHighlightRatio_, this.frameHighlightYRatio_, this.frameHighlightX_, this.frameHighlightY_, this);
    }
  }, this);

  /**
   * @type {!function(number)}
   * @private
   */
  this.zoomingFrameAction_ = goog.bind(function(time) {
    this.zoomingFrame_ = undefined;
    var anchor = this.zoomingFrameParams_.anchor;
    var dx = this.zoomingFrameParams_.dx;
    var dDistance = this.zoomingFrameParams_.dDistance;
    this.zoomingFrameParams_ = null;
    this.chart_.pinchZoom(anchor, dx, dDistance);
  }, this);

  /**
   * Scale instances
   * @type {Object}
   * @private
   */
  this.scalesInstances_ = null;

  this.defaultSeriesType(anychart.enums.StockSeriesType.LINE);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['pointWidth', anychart.ConsistencyState.STOCK_PLOT_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.invalidateWidthBasedSeries],
    ['maxPointWidth', anychart.ConsistencyState.STOCK_PLOT_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.invalidateWidthBasedSeries],
    ['minPointLength', anychart.ConsistencyState.STOCK_PLOT_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.resetSeriesStack],
    ['baseline', anychart.ConsistencyState.STOCK_PLOT_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.resetSeriesBaseline],

    /*
      NOTE: DVF-4261 - weight option is added to simplify value access
            and provide correct serialization/deserialization.
            Despite method plot.weight() becomes exported
            (available), it must not be exported and described
            in docs for a while (20 June 2019).
     */
    ['weight', anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.stockModule.Plot, anychart.core.VisualBaseWithBounds);
anychart.consistency.supportStates(anychart.stockModule.Plot, anychart.enums.Store.PLOT, anychart.enums.State.DATA_AREA);


/**
 * @type {number}
 * @private
 */
anychart.stockModule.Plot.prototype.frameHighlightRatio_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.stockModule.Plot.prototype.frameHighlightYRatio_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.stockModule.Plot.prototype.frameHighlightX_;


/**
 * @type {number}
 * @private
 */
anychart.stockModule.Plot.prototype.frameHighlightY_;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Plot.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION |
    // signal dispatched on highlight
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.stockModule.Plot.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_PLOT_GRIDS |
    anychart.ConsistencyState.STOCK_PLOT_AXES |
    anychart.ConsistencyState.STOCK_PLOT_DT_AXIS |
    anychart.ConsistencyState.STOCK_PLOT_SERIES |
    anychart.ConsistencyState.STOCK_PLOT_BACKGROUND |
    anychart.ConsistencyState.STOCK_PLOT_PALETTE |
    anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS |
    anychart.ConsistencyState.STOCK_PLOT_EVENT_MARKERS |
    anychart.ConsistencyState.STOCK_PLOT_LEGEND |
    anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL |
    anychart.ConsistencyState.AXES_CHART_CROSSHAIR |
    anychart.ConsistencyState.STOCK_PLOT_TITLE |
    anychart.ConsistencyState.STOCK_PLOT_PRICE_INDICATORS |
    anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_GRID = 10;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_LINE_SERIES = 31;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_AXIS = 35;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_PRICE_INDICATOR = 150;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_EVENTS_INTERCEPTOR = 199;


/**
 * Event markers Z index.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_EVENT_MARKERS = 200;


/**
 * Background ZIndex.
 * @type {number}
 */
anychart.stockModule.Plot.ZINDEX_BACKGROUND = 1;


/**
 * Highlighted series description object.
 *
 * @typedef {{
 *     series: ?anychart.stockModule.Series,
 *     point: ?anychart.stockModule.data.TableSelectable.RowProxy,
 *     pointYRatio: ?number,
 *     distance: ?number
 * }}
 *
 * Fields:
 *   series - highlighted series
 *   point - series point that is highlighted (has the same x ratio as the cursor)
 *   pointYRatio - y ratio (if calculated) of the highlighted point
 *   distance - distance (if calculated) between y ratio of the highlighted point and y ratio of the cursor
 */
anychart.stockModule.Plot.HighlightedSeriesInfo;


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.Plot.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'pointWidth', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxPointWidth', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minPointLength', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'baseline', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'weight', anychart.core.settings.numberNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.Plot, anychart.stockModule.Plot.PROPERTY_DESCRIPTORS);


//region --- Statistics
//------------------------------------------------------------------------------
//
//  Statistics
//
//------------------------------------------------------------------------------
/**
 * Ensures that statistics is ready.
 */
anychart.stockModule.Plot.prototype.calculateStatistics = function() {
  var elementsStat = this.statistics(anychart.enums.Statistics.CHART_ELEMENTS) || {'axes': {}, 'grids': {}};

  elementsStat['series'] = this.series_.length;

  elementsStat['axes']['x'] = 1;
  elementsStat['axes']['y'] = 0;
  elementsStat['grids']['x'] = 0;
  elementsStat['grids']['y'] = 0;
  elementsStat['grids']['xMinor'] = 0;
  elementsStat['grids']['yMinor'] = 0;

  var length = Math.max(
      this.yAxes_.length,
      this.xGrids_.length,
      this.yGrids_.length,
      this.xMinorGrids_.length,
      this.yMinorGrids_.length);

  for (var i = length; i--;) {
    if (this.yAxes_[i]) elementsStat['axes']['y']++;
    if (this.xGrids_[i]) elementsStat['grids']['x']++;
    if (this.yGrids_[i]) elementsStat['grids']['y']++;
    if (this.xMinorGrids_[i]) elementsStat['grids']['xMinor']++;
    if (this.yMinorGrids_[i]) elementsStat['grids']['yMinor']++;
  }

  this.statistics(anychart.enums.Statistics.CHART_ELEMENTS, elementsStat);
};


/**
 * Chart statistics getter/setter for internal usage. Turns names to lower case and asks values as lower case.
 * @param {string=} opt_name Statistics parameter name.
 * @param {*=} opt_value Statistics parameter value.
 * @return {anychart.stockModule.Plot|*}
 */
anychart.stockModule.Plot.prototype.statistics = function(opt_name, opt_value) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_name.toLowerCase()] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_name.toLowerCase()];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Resets statistics
 * @return {anychart.stockModule.Plot} - Itself.
 */
anychart.stockModule.Plot.prototype.resetStatistics = function() {
  this.statistics_ = {};
  return this;
};


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.stockModule.Plot.prototype.getStat = function(key) {
  this.calculateStatistics();
  return this.statistics(key);
};


//endregion
//region Series-related methods
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.area = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.candlestick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.column = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new jumpLine series.
 * @param {(anychart.stockModule.data.TableMapping|anychart.stockModule.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.jumpLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.JUMP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.stick = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.line = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.marker = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.ohlc = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.rangeArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.rangeColumn = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.rangeSplineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.rangeStepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.spline = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.splineArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.stepArea = function(opt_data, opt_mappingSettings, opt_csvSettings) {
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.stepLine = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.STEP_LINE, opt_data, opt_mappingSettings, opt_csvSettings);
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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.hilo = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType(anychart.enums.StockSeriesType.HILO, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Add series to chart.
 * @param {...anychart.stockModule.data.TableMapping} var_args Chart series data.
 * @return {Array.<anychart.stockModule.Series>} Array of created series.
 */
anychart.stockModule.Plot.prototype.addSeries = function(var_args) {
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
anychart.stockModule.Plot.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.stockModule.Series} Series instance.
 */
anychart.stockModule.Plot.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.stockModule.Series} Series instance.
 */
anychart.stockModule.Plot.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.stockModule.Plot.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.stockModule.Plot}
 */
anychart.stockModule.Plot.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.stockModule.Plot}
 */
anychart.stockModule.Plot.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
        anychart.ConsistencyState.STOCK_PLOT_LEGEND |
        anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.stockModule.Plot} Self for method chaining.
 */
anychart.stockModule.Plot.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
        anychart.ConsistencyState.STOCK_PLOT_LEGEND |
        anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Returns series list. Considered internal. Returns it for reading only.
 * @return {!Array.<anychart.stockModule.Series>}
 */
anychart.stockModule.Plot.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.stockModule.Plot.prototype.defaultSeriesSettings = function(opt_value) {
  if (!this.defaultSeriesSettings_) {
    this.defaultSeriesSettings_ = new anychart.core.SeriesSettings();
    this.setupCreated('defaultSeriesSettings', this.defaultSeriesSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_.themeSettings = opt_value;
    return this;
  }

  return this.defaultSeriesSettings_;
};


/**
 * Returns base series z-index.
 * @param {anychart.core.series.Base} series .
 * @return {number}
 */
anychart.stockModule.Plot.prototype.getBaseSeriesZIndex = function(series) {
  return series.isLineBased() ?
      anychart.stockModule.Plot.ZINDEX_LINE_SERIES :
      anychart.stockModule.Plot.ZINDEX_SERIES;
};


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
 * @return {anychart.stockModule.Series}
 */
anychart.stockModule.Plot.prototype.createSeriesByType = function(type, opt_data, opt_mappingSettings, opt_csvSettings) {
  var configAndType = this.chart_.getConfigByType(type);
  if (configAndType) {
    var config = /** @type {anychart.core.series.TypeConfig} */(configAndType[1]);
    var series = new anychart.stockModule.Series(this.chart_, this, type, config);

    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */(lastSeries.autoIndex()) + 1 : 0;
    this.series_.push(series);

    series.autoIndex(index);
    series.setupAutoZIndex();
    series.data(opt_data || null, opt_mappingSettings, opt_csvSettings);
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
//region Indicators
anychart.stockModule.indicators.generateIndicatorsConstructors(anychart.stockModule.Plot);


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
 * @return {anychart.stockModule.Plot|anychart.enums.StockSeriesType} Default series type or self for chaining.
 */
anychart.stockModule.Plot.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeStockSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/**
 * Returns stock chart.
 * @return {!anychart.stockModule.Chart}
 */
anychart.stockModule.Plot.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Getter/setter for y axis default settings.
 * @param {Object} value Object with default settings.
 */
anychart.stockModule.Plot.prototype.setDefaultYAxisSettings = function(value) {
  this.defaultYAxisSettings_ = value;
};


/**
 * Getter/setter for grid default settings.
 * @param {Object=} opt_value Object with grid settings.
 * @return {Object}
 */
anychart.stockModule.Plot.prototype.defaultGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultGridSettings_ = opt_value;
    return this;
  }

  if (!this.defaultGridSettings_) { // we need this for getGridZIndex method to work
    this.defaultGridSettings_ = anychart.getFlatTheme('stock.defaultPlotSettings.defaultGridSettings');
  }

  return this.defaultGridSettings_;
};


/**
 * Getter/setter for minor grid default settings.
 * @param {Object=} opt_value Object with minor grid settings.
 * @return {Object|anychart.stockModule.Plot}
 */
anychart.stockModule.Plot.prototype.defaultMinorGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }

  if (!this.defaultMinorGridSettings_) { // we need this for getGridZIndex method to work
    this.defaultMinorGridSettings_ = anychart.getFlatTheme('stock.defaultPlotSettings.defaultMinorGridSettings');
  }

  return this.defaultMinorGridSettings_;
};


/**
 * Getter/setter for price indicator default settings.
 * @param {Object=} opt_value Object with default price indicator settings.
 * @return {Object|anychart.stockModule.Plot}
 */
anychart.stockModule.Plot.prototype.defaultPriceIndicatorSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultPriceIndicatorSettings_ = opt_value;
    return this;
  }

  if (!this.defaultPriceIndicatorSettings_) { // we need this for getGridZIndex method to work
    this.defaultPriceIndicatorSettings_ = anychart.getFlatTheme('stock.defaultPlotSettings.defaultPriceIndicatorSettings');
  }

  return this.defaultPriceIndicatorSettings_;
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @protected
 */
anychart.stockModule.Plot.prototype.invalidateWidthBasedSeries = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isWidthBased())
      this.series_[i].invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/**
 * Resets series shared stack.
 * @param {boolean=} opt_skipInvalidation - Whether to skip width based series invalidation.
 */
anychart.stockModule.Plot.prototype.resetSeriesBaseline = function(opt_skipInvalidation) {
  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series)
      series.resetSharedStack();
    if (!opt_skipInvalidation)
      series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/**
 * Resets series shared stack.
 * @param {boolean=} opt_skipInvalidation - Whether to skip width based series invalidation.
 */
anychart.stockModule.Plot.prototype.resetSeriesStack = function(opt_skipInvalidation) {
  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series)
      series.resetSharedStack();
  }
  if (!opt_skipInvalidation)
    this.invalidateWidthBasedSeries();
};


/**
 * Invalidates plot series. Doesn't dispatch anything.
 * @param {boolean} doInvalidateBounds
 * @param {boolean=} opt_skipLegend
 */
anychart.stockModule.Plot.prototype.invalidateRedrawable = function(doInvalidateBounds, opt_skipLegend) {
  var i;

  var state = anychart.ConsistencyState.SERIES_POINTS;
  if (doInvalidateBounds) state |= anychart.ConsistencyState.BOUNDS;
  for (i = 0; i < this.series_.length; i++) {
    if (this.series_[i])
      this.series_[i].invalidate(state);
  }

  if (this.eventMarkers_) {
    this.eventMarkers_.invalidate(anychart.ConsistencyState.EVENT_MARKERS_DATA);
  }

  if (this.chart_.annotationsModule)
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
  var grids = goog.array.concat(this.xGrids_, this.yGrids_, this.xMinorGrids_, this.yMinorGrids_);
  for (i = 0; i < grids.length; i++) {
    grid = grids[i];
    if (grid)
      grid.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
  }

  var marker;
  var markers = goog.array.concat(this.lineAxesMarkers_, this.rangeAxesMarkers_, this.textAxesMarkers_);
  for (i = 0; i < markers.length; i++) {
    marker = markers[i];
    if (marker)
      marker.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
  }

  state = anychart.ConsistencyState.APPEARANCE;
  if (doInvalidateBounds) state |= anychart.ConsistencyState.BOUNDS;
  if (this.xAxis_)
    this.xAxis_.invalidate(state);

  if (!opt_skipLegend && this.legend_ && this.legend_.enabled())
    this.legend_.invalidate(state);

  for (i = 0; i < this.priceIndicators_.length; i++) {
    var priceIndicator = this.priceIndicators_[i];
    if (priceIndicator)
      priceIndicator.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE);
  }

  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
      anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS |
      anychart.ConsistencyState.STOCK_PLOT_EVENT_MARKERS |
      anychart.ConsistencyState.STOCK_PLOT_AXES |
      anychart.ConsistencyState.STOCK_PLOT_PRICE_INDICATORS |
      anychart.ConsistencyState.STOCK_PLOT_DT_AXIS |
      anychart.ConsistencyState.STOCK_PLOT_GRIDS |
      anychart.ConsistencyState.STOCK_PLOT_LEGEND |
      anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL |
      anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS);
  this.invalidateState(anychart.enums.Store.PLOT, anychart.enums.State.DATA_AREA);
};


/**
 * Returns plot series drawing width.
 * @return {number}
 */
anychart.stockModule.Plot.prototype.getDrawingWidth = function() {
  this.ensureBoundsDistributed_();
  return this.seriesBounds_.width;
};


/**
 * Returns series drawing bounds.
 * @return {!anychart.math.Rect}
 */
anychart.stockModule.Plot.prototype.getPlotBounds = function() {
  this.ensureBoundsDistributed_();
  return this.seriesBounds_;
};


/** @inheritDoc */
anychart.stockModule.Plot.prototype.getEnableChangeSignals = function() {
  return anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED |
      anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.NEEDS_RECALCULATION;
};


/**
 * Getter/setter for Data area.
 * @param {(Object|boolean)=} opt_value
 * @return {anychart.stockModule.Plot|anychart.core.ui.DataArea}
 */
anychart.stockModule.Plot.prototype.dataArea = function(opt_value) {
  if (!this.dataArea_) {
    this.dataArea_ = new anychart.core.ui.DataArea();
    this.setupCreated('dataArea', this.dataArea_);
    this.dataArea_.listenSignals(this.dataAreaInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.dataArea_.setup(opt_value);
    return this;
  }
  return this.dataArea_;
};


/**
 * Data area invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.dataAreaInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidateState(anychart.enums.Store.PLOT, anychart.enums.State.DATA_AREA, anychart.Signal.NEEDS_REDRAW);
  }
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
 * @return {anychart.stockModule.Plot|anychart.core.ui.Background} .
 */
anychart.stockModule.Plot.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.enabled(false);
    this.background_.zIndex(anychart.stockModule.Plot.ZINDEX_BACKGROUND);
    this.setupCreated('background', this.background_);
    this.background_.needsForceSignalsDispatching(true);
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
 * @return {!(anychart.stockModule.Plot|anychart.core.ui.Legend)} Chart legend instance of itself for chaining call.
 */
anychart.stockModule.Plot.prototype.legend = function(opt_value) {
  if (!this.legend_) {
    this.legend_ = new anychart.core.ui.Legend();
    this.legend_.listenSignals(this.onLegendSignal_, this);
    this.legend_.listen(anychart.enums.EventType.DRAG_START, function(e) {
      this.chart_.preventHighlight();
    }, false, this);
    this.legend_.listen(anychart.enums.EventType.DRAG_END, function(e) {
      this.chart_.allowHighlight();
    }, false, this);

    this.legend_.setParentEventTarget(this);

    this.setupCreated('legend', this.legend_);
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
 * @param {(anychart.enums.ScatterScaleTypes|Object|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.stockModule.Plot)} Default chart scale value or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.yScale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.SCATTER, ['Stock plot Y scale', 'scatter', 'linear, log'], this.yScaleInvalidated, this);
    if (val) {
      var dispatch = this.yScale_ == val;
      this.yScale_ = /** @type {anychart.scales.ScatterBase} */(val);
      this.yScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        this.invalidateRedrawable(false);
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
anychart.stockModule.Plot.prototype.yScaleInvalidated = function(e) {
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
 * @return {!(anychart.core.Axis|anychart.stockModule.Plot)} Axis instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.core.Axis();
    this.yAxes_[index] = axis;
    axis.addThemes('stock.defaultPlotSettings.defaultYAxisSettings', this.defaultYAxisSettings_);
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
 * Stock price indicators multi getter/setter.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Index or chart price indicators settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart price indicators settings to set.
 * @return {!(anychart.stockModule.CurrentPriceIndicator|anychart.stockModule.Plot)} Price indicator instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.priceIndicator = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var priceIndicator = this.priceIndicators_[index];
  if (!priceIndicator) {
    priceIndicator = new anychart.stockModule.CurrentPriceIndicator();
    priceIndicator.addThemes('stock.defaultPlotSettings.defaultPriceIndicatorSettings', this.defaultPriceIndicatorSettings());
    priceIndicator.setupLabels();
    this.priceIndicators_[index] = priceIndicator;
    priceIndicator.zIndex(anychart.stockModule.Plot.ZINDEX_PRICE_INDICATOR);
    priceIndicator.setPlot(this);
    priceIndicator.setParentEventTarget(this);
    priceIndicator.listenSignals(this.priceIndicatorInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_PRICE_INDICATORS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    priceIndicator.setup(value);
    return this;
  } else {
    return priceIndicator;
  }
};


/**
 * X axis getter/setter.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.stockModule.Axis|anychart.stockModule.Plot)}
 */
anychart.stockModule.Plot.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.stockModule.Axis(this.chart_);
    this.xAxis_.setParentEventTarget(this);
    this.xAxis_.setupSpecial(true, false);
    this.xAxis_.zIndex(anychart.stockModule.Plot.ZINDEX_AXIS);
    this.setupCreated('xAxis', this.xAxis_);
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
 * @return {anychart.stockModule.Axis|anychart.core.Axis|undefined}
 */
anychart.stockModule.Plot.prototype.getAxisByIndex = function(index) {
  return index ? (this.yAxes_[index - 1]) : this.xAxis_;
};


/** @inheritDoc */
anychart.stockModule.Plot.prototype.getXAxisByIndex = function(index) {
  return this.xAxis_;
};


/** @inheritDoc */
anychart.stockModule.Plot.prototype.getYAxisByIndex = function(index) {
  return this.yAxes_[index];
};


/**
 * Return z-index for grid.
 * @param {anychart.core.Base} grid
 * @return {number}
 */
anychart.stockModule.Plot.prototype.getGridZIndex = function(grid) {
  return grid.themeSettings['zIndex'] + (this.xGrids_.length + this.yGrids_.length + this.xMinorGrids_.length + this.yMinorGrids_.length) * 0.001;
};


/**
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.stockModule.Grid|anychart.stockModule.Plot)} Grid instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.xGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.xGrids_[index];
  if (!grid) {
    grid = new anychart.stockModule.Grid();
    grid.setOwner(this);
    grid.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    grid.addThemes('stock.defaultPlotSettings.defaultGridSettings', this.defaultGridSettings());
    grid.zIndex(this.getGridZIndex(grid));
    this.xGrids_[index] = grid;
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
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.stockModule.Grid|anychart.stockModule.Plot)} Grid instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.yGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.yGrids_[index];
  if (!grid) {
    grid = new anychart.stockModule.Grid();
    grid.setOwner(this);
    grid.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    grid.addThemes('stock.defaultPlotSettings.defaultGridSettings', this.defaultGridSettings());
    grid.zIndex(this.getGridZIndex(grid));
    this.yGrids_[index] = grid;
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
 * @return {!(anychart.stockModule.Grid|anychart.stockModule.Plot)} Minor grid instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.xMinorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.xMinorGrids_[index];
  if (!grid) {
    grid = new anychart.stockModule.Grid();
    grid.addThemes(
        'defaultMinorGridSettings',
        'stock.defaultPlotSettings.defaultMinorGridSettings',
        this.defaultMinorGridSettings());
    grid.setOwner(this);
    grid.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    grid.zIndex(this.getGridZIndex(grid));
    this.xMinorGrids_[index] = grid;
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
 * @return {!(anychart.stockModule.Grid|anychart.stockModule.Plot)} Minor grid instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.yMinorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.yMinorGrids_[index];
  if (!grid) {
    grid = new anychart.stockModule.Grid();
    grid.setOwner(this);
    grid.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    grid.addThemes(
        'defaultMinorGridSettings',
        'stock.defaultPlotSettings.defaultMinorGridSettings',
        this.defaultMinorGridSettings());
    grid.zIndex(this.getGridZIndex(grid));
    this.yMinorGrids_[index] = grid;
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
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.stockModule.Plot)} .
 */
anychart.stockModule.Plot.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.setParentEventTarget(this);
    this.title_.isStockPlotTitle(true);
    this.setupCreated('title', this.title_);
    this.title_.needsForceSignalsDispatching(true);
    this.title_.listenSignals(this.onTitleSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.stockModule.Plot.prototype.onTitleSignal_ = function(event) {
  var state = anychart.ConsistencyState.STOCK_PLOT_TITLE;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals - !state and nothing will happen.
  this.invalidate(state, signal);
};


//endregion
//region Axis markers and defaults
/**
 * Getter/setter for line marker default settings.
 * @param {Object=} opt_value Object with line marker settings.
 * @return {Object}
 */
anychart.stockModule.Plot.prototype.defaultLineMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultLineMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultLineMarkerSettings_ || {};
};


/**
 * Getter/setter for text marker default settings.
 * @param {Object=} opt_value Object with text marker settings.
 * @return {Object}
 */
anychart.stockModule.Plot.prototype.defaultTextMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultTextMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultTextMarkerSettings_ || {};
};


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value Object with range marker settings.
 * @return {Object}
 */
anychart.stockModule.Plot.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Marker index or chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.stockModule.Plot)} Line marker instance by index or itself for method chaining.
 */
anychart.stockModule.Plot.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.core.axisMarkers.Line();
    lineMarker.setChart(this);
    lineMarker.addThemes('stock.defaultPlotSettings.defaultLineMarkerSettings', this.defaultLineMarkerSettings());
    lineMarker.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    this.lineAxesMarkers_[index] = lineMarker;
    lineMarker.setParentEventTarget(this);
    this.applyMarkersListeners_(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Marker index or chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.stockModule.Plot)} Range marker instance by index or itself for chaining call.
 */
anychart.stockModule.Plot.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.core.axisMarkers.Range();
    rangeMarker.setChart(this);
    rangeMarker.addThemes('stock.defaultPlotSettings.defaultRangeMarkerSettings', this.defaultRangeMarkerSettings());
    rangeMarker.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    this.rangeAxesMarkers_[index] = rangeMarker;
    rangeMarker.setParentEventTarget(this);
    this.applyMarkersListeners_(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Marker index or chart text marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart text marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.stockModule.Plot)} Text marker instance by index or itself for chaining call.
 */
anychart.stockModule.Plot.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.core.axisMarkers.Text();
    textMarker.setChart(this);
    textMarker.addThemes('stock.defaultPlotSettings.defaultTextMarkerSettings', this.defaultTextMarkerSettings());
    textMarker.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    this.textAxesMarkers_[index] = textMarker;
    textMarker.setParentEventTarget(this);
    this.applyMarkersListeners_(textMarker);
    textMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @protected
 */
anychart.stockModule.Plot.prototype.onMarkersSignal = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.chart_.invalidate(anychart.ConsistencyState.STOCK_SCALES);
  }
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns all axis markers. Used to calculate scale.
 * @return {Array.<anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text>}
 */
anychart.stockModule.Plot.prototype.getAxisMarkers = function() {
  return goog.array.concat(this.lineAxesMarkers_, this.rangeAxesMarkers_, this.textAxesMarkers_);
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Plot.prototype.remove = function() {
  if (this.rootLayer_)
    this.rootLayer_.remove();
};


/**
 * Draws the plot.
 * @return {anychart.stockModule.Plot}
 */
anychart.stockModule.Plot.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var i, axis, series, priceIndicator;

  this.suspendSignalsDispatching();

  var noDataLabel = /** @type {anychart.core.ui.Label} */ (this.noData().label());
  var noData = this.isNoData();
  // checking for root layer to avoid dispatching on the first draw
  var doDispatch = noDataLabel['visible']() !== noData && this.rootLayer_;
  if (doDispatch) {
    var noDataEvent = {
      'type': anychart.enums.EventType.DATA_CHANGED,
      'chart': this,
      'hasData': !noData
    };
    noData = this.dispatchEvent(noDataEvent) && noData;
  }
  noDataLabel['visible'](noData);

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

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_AXES)) {
    for (i = 0; i < this.yAxes_.length; i++) {
      axis = this.yAxes_[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        if (!axis.scale()) axis.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
        axis.resumeSignalsDispatching(false);
      }
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS)) {
    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.scale(/** @type {anychart.stockModule.scales.Scatter} */(this.chart_.xScale()));
      this.xAxis_.resumeSignalsDispatching(false);
    }
  }

  this.ensureBoundsDistributed_();

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_AXES)) {
    for (i = 0; i < this.yAxes_.length; i++) {
      axis = this.yAxes_[i];
      if (axis) {
        axis.suspendSignalsDispatching();
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
      this.xAxis_.container(this.rootLayer_);
      this.xAxis_.draw();
      this.xAxis_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_GRIDS)) {
    /** @type {Array.<anychart.stockModule.Grid>} */
    var grids = goog.array.concat(this.xGrids_, this.yGrids_, this.xMinorGrids_, this.yMinorGrids_);
    for (i = 0; i < grids.length; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (!grid.scale()) {
          if (grid.isHorizontal()) {
            grid.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
          } else {
            grid.scale(/** @type {anychart.stockModule.scales.Scatter} */(this.chart_.xScale()));
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

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_TITLE)) {
    var title = this.getCreated('title');
    if (title) {
      title.needsForceSignalsDispatching(false);
      title.suspendSignalsDispatching();
      title.container(this.rootLayer_);
      title.draw();
      title.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS)) {
    var markers = goog.array.concat(this.lineAxesMarkers_, this.rangeAxesMarkers_, this.textAxesMarkers_);
    for (i = 0; i < markers.length; i++) {
      var marker = markers[i];
      if (marker) {
        marker.suspendSignalsDispatching();
        if (!marker.scale()) {
          marker.autoScale(marker.isHorizontal() ? this.yScale() : this.chart_.xScale());
        }
        marker.parentBounds(this.seriesBounds_);
        marker.container(this.rootLayer_);
        marker.draw();
        marker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_AXIS_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND)) {
    var background = this.getCreated('background');
    if (background) {
      background.needsForceSignalsDispatching(false);
      background.suspendSignalsDispatching();
      background.container(this.rootLayer_);
      background.draw();
      background.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_SERIES)) {
    var stackDirection = /** @type {anychart.enums.ScaleStackDirection} */ (this.yScale().stackDirection());
    var stackIsDirect = stackDirection == anychart.enums.ScaleStackDirection.DIRECT;
    for (i = 0; i < this.series_.length; i++) {
      series = this.series_[stackIsDirect ? this.series_.length - i - 1 : i];
      if (series) {
        series.suspendSignalsDispatching();
        series.parentBounds(this.seriesBounds_);
        series.container(this.rootLayer_);
        series.draw();
        series.resumeSignalsDispatching(false);
      }
    }
    this.resetSeriesStack(true);
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS)) {
    if (this.chart_.annotationsModule) {
      var annotations = this.annotations();
      annotations.suspendSignalsDispatching();
      annotations.parentBounds(this.seriesBounds_);
      annotations.container(this.rootLayer_);
      annotations.draw();
      annotations.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_EVENT_MARKERS)) {
    var eventMarkers = this.eventMarkers();
    eventMarkers.suspendSignalsDispatching();
    eventMarkers.parentBounds(this.seriesBounds_);
    eventMarkers.container(this.rootLayer_);
    eventMarkers.setAutoZIndex(anychart.stockModule.Plot.ZINDEX_EVENT_MARKERS);
    eventMarkers.draw();
    eventMarkers.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_EVENT_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_PRICE_INDICATORS)) {
    for (i = 0; i < this.priceIndicators_.length; i++) {
      priceIndicator = this.priceIndicators_[i];
      if (priceIndicator) {
        priceIndicator.suspendSignalsDispatching();
        priceIndicator.parentBounds(this.seriesBounds_);
        priceIndicator.container(this.rootLayer_);
        priceIndicator.draw();
        priceIndicator.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_PRICE_INDICATORS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_CROSSHAIR)) {
    var crosshair = /** @type {anychart.core.ui.Crosshair} */(this.crosshair());
    crosshair.suspendSignalsDispatching();
    crosshair.parentBounds(this.getPlotBounds());
    crosshair.container(this.rootLayer_);
    crosshair.xAxis(this.xAxis_);
    crosshair.draw();
    crosshair.resumeSignalsDispatching(false);

    this.markConsistent(anychart.ConsistencyState.AXES_CHART_CROSSHAIR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL)) {
    noDataLabel.suspendSignalsDispatching();
    noDataLabel.container(this.rootLayer_);
    noDataLabel.parentBounds(this.seriesBounds_);
    noDataLabel.draw();
    noDataLabel.resumeSignalsDispatching(false);

    this.markConsistent(anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.PLOT, anychart.enums.State.DATA_AREA)) {
    var dataArea = this.dataArea();
    dataArea.suspendSignalsDispatching();
    if (!dataArea.container()) dataArea.container(this.rootLayer_);
    dataArea.parentBounds(this.seriesBounds_);
    dataArea.resumeSignalsDispatching(false);
    dataArea.draw();
    this.markStateConsistent(anychart.enums.Store.PLOT, anychart.enums.State.DATA_AREA);
  }

  this.resumeSignalsDispatching(false);

  var plotsCount = this.chart_.getEnabledPlotsCount();
  var plotPosition;
  if (plotsCount == 1) {
    plotPosition = anychart.enums.PlotPosition.SINGLE;
  } else if (this.isFirstPlot()) {
    plotPosition = anychart.enums.PlotPosition.TOP;
  } else if (this.isLastPlot()) {
    plotPosition = anychart.enums.PlotPosition.BOTTOM;
  } else {
    plotPosition = anychart.enums.PlotPosition.CENTER;
  }

  if (!this.plotControls_) {
    this.plotControls_ = new anychart.stockModule.PlotControls(this);
    this.plotControls_.plotPosition(plotPosition);
    this.plotControls_.render();
    this.plotControls_.hide();
  }
  this.plotControls_.plotPosition(plotPosition);
  this.plotControls_.update();

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
 * Extract position info from mouse event.
 *
 * @param {anychart.core.MouseEvent} event
 * @return {{xRatio: number, x: number, yRatio: number, y: number}}
 *
 * @private
 */
anychart.stockModule.Plot.prototype.getPositionFromEvent_ = function(event) {
  var bounds = this.seriesBounds_;
  var stageReferencePoint = this.container().getStage().getClientPosition();
  var x = event['clientX'] - stageReferencePoint.x - bounds.left;
  var y = event['clientY'] - stageReferencePoint.y - bounds.top;

  return {
    xRatio: x / bounds.width,
    yRatio: y / bounds.height,
    x: event['clientX'],
    y: event['clientY']
  };
};


/**
 * Extract object for each series that contains info about series and nearest point.
 *
 * @param {number} xRatio
 * @param {number} yRatio
 *
 * @return {Array.<{
 *   series: anychart.stockModule.Series,
 *   nearestPointToCursor: {
 *     distance: number,
 *     index: number
 *   }
 * }>}
 */
anychart.stockModule.Plot.prototype.getSeriesStatus = function(xRatio, yRatio) {
  var rawValue = this.chart_.xScale().inverseTransform(xRatio);
  var alignedValue = this.chart_.alignValue(rawValue);
  var highlightInfo = this.prepareHighlight(alignedValue);

  var seriesStatus = [];

  for (var i = 0; i < highlightInfo.length; i++) {
    var plotInfo = highlightInfo[i];

    var point = plotInfo['point'];
    var series = plotInfo['series'];

    if (point) {
      var seriesHeight = series.getPixelBounds().height;
      var distance = this.chart_.getDistanceToSeries(series, point, yRatio).distance * seriesHeight;

      seriesStatus.push({
        'series': series,
        'nearestPointToCursor': {
          'distance': distance,
          'index': point.getIndex()
        }
      });
    }
  }

  return seriesStatus;
};



/** @inheritDoc */
anychart.stockModule.Plot.prototype.makeBrowserEvent = function(e) {
  var event = anychart.stockModule.Plot.base(this, 'makeBrowserEvent', e);
  var eventPositionInfo = this.getPositionFromEvent_(event);

  event['seriesStatus'] = this.getSeriesStatus(eventPositionInfo.xRatio, eventPositionInfo.yRatio);

  return event;
};


/**
 * Ensures that the root layer is created.
 * @private
 */
anychart.stockModule.Plot.prototype.ensureVisualReady_ = function() {
  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer_);
    this.eventsInterceptor_ = this.rootLayer_.rect();
    this.eventsInterceptor_.zIndex(anychart.stockModule.Plot.ZINDEX_EVENTS_INTERCEPTOR);
    //this.eventsInterceptor_.cursor(acgraph.vector.Cursor.EW_RESIZE);
    this.eventsInterceptor_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.eventsInterceptor_.stroke(null);
    this.eventsHandler.listenOnce(this, acgraph.events.EventType.MOUSEDOWN, this.initDragger_);
    this.eventsHandler.listenOnce(this, acgraph.events.EventType.TOUCHSTART, this.initDragger_);
    this.eventsHandler.listen(this, acgraph.events.EventType.TOUCHSTART, this.handleTouchStart_);
    this.eventsHandler.listen(this, acgraph.events.EventType.TOUCHEND, this.handleTouchEnd_);
    this.eventsHandler.listen(this, acgraph.events.EventType.MOUSEOVER, this.handlePlotMouseOverAndMove_);
    this.eventsHandler.listen(this, acgraph.events.EventType.MOUSEMOVE, this.handlePlotMouseOverAndMove_);
    this.eventsHandler.listen(this, acgraph.events.EventType.MOUSEOUT, this.handlePlotMouseOut_);
    this.eventsHandler.listen(this, acgraph.events.EventType.MOUSEDOWN, this.handlePlotMouseDown_);
  }
};


/**
 * Applies listeners to marker.
 * @param {anychart.core.axisMarkers.PathBase|anychart.core.axisMarkers.TextBase} marker
 */
anychart.stockModule.Plot.prototype.applyMarkersListeners_ = function(marker) {
  this.eventsHandler.listen(marker, [acgraph.events.EventType.TOUCHSTART, acgraph.events.EventType.MOUSEDOWN], this.markersListener_);
};


/**
 * Markers listener. Needed for drag to work.
 * @param {anychart.core.MouseEvent} event Axis marker event.
 */
anychart.stockModule.Plot.prototype.markersListener_ = function(event) {
  var originalEvent = event.originalEvent;

  var dragShouldStart = goog.isDef(this.dragger_) &&
                        (event.type === acgraph.events.EventType.MOUSEDOWN ||
                        event.type === acgraph.events.EventType.TOUCHSTART);

  // Fixes dragging on axis markers.
  if (dragShouldStart) {
    this.dragger_.startDrag(originalEvent);
  }
};


/**
 * Ensures that plot space is distributed among plot elements.
 * Redraws legend twice.
 * @private
 */
anychart.stockModule.Plot.prototype.ensureBoundsDistributed_ = function() {
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

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS |
          anychart.ConsistencyState.STOCK_PLOT_LEGEND |
          anychart.ConsistencyState.STOCK_PLOT_TITLE)) {
    var seriesBounds = this.getPixelBounds();

    var background = this.getCreated('background');
    if (background) {
      background.parentBounds(seriesBounds);
    }

    var title = this.getCreated('title');
    if (title && title.enabled()) {
      title.parentBounds(seriesBounds);
      seriesBounds = title.getRemainingBounds();
    }

    if (this.xAxis_ && this.xAxis_.enabled()) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.parentBounds(seriesBounds);
      this.xAxis_.resumeSignalsDispatching(false);
      // we need this to reduce bounds height by the height of the axis
      seriesBounds = this.xAxis_.getRemainingBounds();
      this.invalidate(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS);
    }

    var legendTitleDate;
    if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_LEGEND)) {
      legendTitleDate = isNaN(this.highlightedValue_) ? this.chart_.getLastDate() : this.highlightedValue_;
    } else {
      legendTitleDate = NaN;
    }

    var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
    if (legend.getOption('positionMode') == anychart.enums.LegendPositionMode.OUTSIDE) {
      this.updateLegend_(seriesBounds, legendTitleDate);
      // we need forced dispatch signal here to update standalone legend on series enable/disable
      // we do not worry about it because only standalone legend listens this signal
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND, true);

      seriesBounds = this.legend().getRemainingBounds();
    }


    var leftPadding = 0;
    var rightPadding = 0;
    var legendNotEnabled = !legend.getOption('enabled');
    var leftSide = legend.getOption('position') == anychart.enums.Orientation.LEFT;
    var rightSide = legend.getOption('position') == anychart.enums.Orientation.RIGHT;
    for (i = 0; i < this.yAxes_.length; i++) {
      var axis = this.yAxes_[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        var width = axis.width();
        if (axis.getOption('orientation') == anychart.enums.Orientation.LEFT) {
          if (legendNotEnabled || !leftSide) {
            axis.parentBounds(/** @type {number} */(seriesBounds.left - width - leftPadding), seriesBounds.top, 0, seriesBounds.height);
            leftPadding += width;
          } else {
            axis.parentBounds(seriesBounds);
            seriesBounds = axis.getRemainingBounds();
          }
        } else if (axis.getOption('orientation') == anychart.enums.Orientation.RIGHT) {
          if (legendNotEnabled || !rightSide) {
            rightPadding += width;
            axis.parentBounds(seriesBounds.left, seriesBounds.top, /** @type {number} */(seriesBounds.width + rightPadding), seriesBounds.height);
          } else {
            axis.parentBounds(seriesBounds);
            seriesBounds = axis.getRemainingBounds();
          }
        }
        axis.resumeSignalsDispatching(false);
      }
    }

    if (seriesBounds.width < 0) {
      seriesBounds.width = 1;
    }
    if (seriesBounds.height < 0) {
      seriesBounds.top += seriesBounds.height;
      seriesBounds.height = -seriesBounds.height;
    }

    if (this.xAxis_ && this.xAxis_.enabled()) {
      this.xAxis_.suspendSignalsDispatching();
      // we need this to tell xAxis about new width by Y axes
      this.xAxis_.parentBounds(seriesBounds.left, seriesBounds.top,
          seriesBounds.width, /** @type {number} */(seriesBounds.height + this.xAxis_.height()));
      this.xAxis_.resumeSignalsDispatching(false);
      seriesBounds = this.xAxis_.getRemainingBounds();
    }

    if (legend.getOption('positionMode') == anychart.enums.LegendPositionMode.INSIDE) {
      this.updateLegend_(seriesBounds, legendTitleDate);
      // we need forced dispatch signal here to update standalone legend on series enable/disable
      // we do not worry about it because only standalone legend listens this signal
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND, true);
    }

    this.seriesBounds_ = seriesBounds;
    this.eventsInterceptor_.setBounds(this.seriesBounds_);

    this.crosshair().parentBounds(seriesBounds);

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
 * @param {number=} opt_rawValue - As is date.
 * @return {?string} Title auto text or null.
 */
anychart.stockModule.Plot.prototype.getLegendAutoText = function(legendFormatter, opt_titleValue, opt_rawValue) {
  opt_titleValue = opt_titleValue || (isNaN(this.highlightedValue_) ? this.chart_.getLastDate() : this.highlightedValue_);
  var formatter;
  if (!isNaN(opt_titleValue) && (formatter = legendFormatter)) {
    if (goog.isString(formatter))
      formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
    if (goog.isFunction(formatter)) {
      var grouping = /** @type {anychart.stockModule.Grouping} */(this.chart_.grouping());

      var values = {
        'value': {value: opt_titleValue, type: anychart.enums.TokenType.DATE_TIME},
        'rawValue': {value: opt_rawValue, type: anychart.enums.TokenType.DATE_TIME},
        'hoveredDate': {value: opt_titleValue, type: anychart.enums.TokenType.DATE_TIME},
        'dataIntervalUnit': {value: grouping.getCurrentDataInterval()['unit'], type: anychart.enums.TokenType.STRING},
        'dataIntervalUnitCount': {value: grouping.getCurrentDataInterval()['count'], type: anychart.enums.TokenType.NUMBER},
        'isGrouped': {value: grouping.isGrouped(), type: anychart.enums.TokenType.UNKNOWN}
      };
      var context = (new anychart.format.Context(values)).propagate();
      return formatter.call(context, context);
    }
  }
  return null;
};


/**
 * Updates legend.
 * @param {anychart.math.Rect=} opt_seriesBounds
 * @param {number=} opt_titleValue
 * @param {number=} opt_rawValue - As is date.
 * @param {boolean=} opt_clear - Whether to clear legend.
 * @private
 */
anychart.stockModule.Plot.prototype.updateLegend_ = function(opt_seriesBounds, opt_titleValue, opt_rawValue, opt_clear) {
  var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
  legend.suspendSignalsDispatching();
  legend.container(this.rootLayer_);
  if (opt_seriesBounds) {
    legend.parentBounds(opt_seriesBounds);
  }
  var autoText = opt_clear ? '' : this.getLegendAutoText(/** @type {string|Function} */ (legend.getOption('titleFormat')), opt_titleValue, opt_rawValue);
  if (!goog.isNull(autoText))
    legend.title().autoText(autoText);

  if (opt_clear) {
    legend.clearItems();
    legend.itemsSource(null);
  } else if (!legend.itemsSource())
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
anychart.stockModule.Plot.prototype.onLegendSignal_ = function(event) {
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
 * @param {?(Function|string)} itemsFormat Legend items text formatter.
 * @return {!Array.<anychart.core.ui.Legend.LegendItemProvider>} Legend items provider.
 */
anychart.stockModule.Plot.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0; i < this.series_.length; i++) {
    /** @type {anychart.stockModule.Series} */
    var series = this.series_[i];
    if (series) {
      var itemData = series.getLegendItemData(itemsFormat);
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
anychart.stockModule.Plot.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.DEFAULT);
};


/**
 * Calls when legend item that some how belongs to the chart was clicked.
 * @param {anychart.core.ui.LegendItem} item Legend item that was clicked.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.stockModule.Plot.prototype.legendItemClick = function(item, event) {
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
anychart.stockModule.Plot.prototype.legendItemOver = function(item, event) {
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
anychart.stockModule.Plot.prototype.legendItemOut = function(item, event) {
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
anychart.stockModule.Plot.prototype.needsInteractiveLegendUpdate = function() {
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
 * @return {Array.<anychart.stockModule.Plot.HighlightedSeriesInfo>}
 */
anychart.stockModule.Plot.prototype.prepareHighlight = function(value) {
  return goog.array.map(this.series_, function(series) {
    return {
      'series': series,
      'point': series && series.enabled() && series.getClosestPointByX(value) || null
    };
  });
};


/**
 * Highlights passed value.
 * @param {number} value - Aligned date.
 * @param {number} rawValue - As is date.
 * @param {anychart.stockModule.Plot} hlSource - Highlight source.
 * @param {number=} opt_y - .
 * @param {(?anychart.stockModule.Plot.HighlightedSeriesInfo)=} opt_closestSeriesInfo - highlighted data row for series closest to cursor.
 * @param {boolean=} opt_showControls Whether to show controls on highlight. (Plot is source of highlight)
 */
anychart.stockModule.Plot.prototype.highlight = function(value, rawValue, hlSource, opt_y, opt_closestSeriesInfo, opt_showControls) {
  if (!this.rootLayer_ || !this.seriesBounds_ || !this.enabled()) return;

  var sticky = this.crosshair().getOption('displayMode') == anychart.enums.CrosshairDisplayMode.STICKY;
  var setValue = sticky ? value : rawValue;

  var ratio = this.chart_.xScale().transform(setValue);
  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */ (this.crosshair().getOption('yStroke')));
  var x = this.seriesBounds_.left + ratio * this.seriesBounds_.width;
  x = anychart.utils.applyPixelShift(x, thickness);

  if (sticky && opt_closestSeriesInfo) {
    var pointYRatio = opt_closestSeriesInfo['pointYRatio'];
    var chartOffset = this.container().getStage().getClientPosition();
    // Apply no pixelshift for y value because scale use it for transform.
    // We need this value as is.
    opt_y = pointYRatio * this.seriesBounds_.height + this.seriesBounds_.top + chartOffset.y;
  }

  this.crosshair().xLabelAutoEnabled(this.isLastPlot_);
  this.crosshair().autoHighlightX(x, this.isLastPlot_, hlSource != this, opt_y, ratio);

  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series) {
      series.removeHighlight();
      series.highlight(setValue, value);
    }
  }

  if (this.legend_ && this.legend_.enabled()) {
    var clear = this.chart_.xScale().isValueInDummyRange(setValue);
    this.updateLegend_(null, value, rawValue, clear);
  }
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
  if (opt_showControls)
    this.plotControls_.show();
};


/**
 * Removes plot highlight.
 */
anychart.stockModule.Plot.prototype.unhighlight = function() {
  if (!this.enabled()) return;

  this.highlightedValue_ = NaN;

  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series)
      series.removeHighlight();
  }

  this.crosshair().hide();
  if (this.legend_ && this.legend_.enabled()) {
    this.updateLegend_(null, this.chart_.getLastDate());
  }
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
  this.plotControls_.hide();
};


//endregion
//region Drag
//----------------------------------------------------------------------------------------------------------------------
//
//  Drag
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Refreshes drag anchor on data update.
 */
anychart.stockModule.Plot.prototype.refreshDragAnchor = function() {
  if (this.dragger_ && this.dragger_.isDragging()) {
    this.dragger_.refreshDragAnchor();
  }
  if (this.zooming_) {
    this.chart_.refreshDragAnchor(this.zooming_.anchor);
  }
};


/**
 * Mousedown handler.
 * @param {anychart.core.MouseEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.initDragger_ = function(e) {
  var googBrowserEvent = e.originalEvent.getOriginalEvent();

  this.dragger_ = new anychart.stockModule.Plot.Dragger(this, this.eventsInterceptor_);
  this.dragger_.startDrag(googBrowserEvent);
};


/**
 * Extracts 'touches' field from touch events.
 *
 * @param {goog.events.Event} e - Incoming touch-event wrapper.
 * @return {IArrayLike<Object>|null} - 'Touches' field.
 */
anychart.stockModule.Plot.prototype.extractTouches_ = function(e) {
  var acgraphBrowserEvent = /** @type {acgraph.events.BrowserEvent} */ (e.getOriginalEvent());

  // TODO I don't know why, but 'touches' field is in this path.
  var originalEvent = /** @type {goog.events.BrowserEvent} */ (acgraphBrowserEvent.getOriginalEvent());
  var touchEvent = originalEvent.getBrowserEvent();
  return touchEvent['touches'];
};


/**
 * Handles touch start.
 * @param {goog.events.Event} e
 * @private
 */
anychart.stockModule.Plot.prototype.handleTouchStart_ = function(e) {
  var acgraphBrowserEvent = /** @type {acgraph.events.BrowserEvent} */ (e.getOriginalEvent());
  var touches = this.extractTouches_(e);

  if (touches && touches.length > 1) {
    this.dragger_.endDrag(acgraphBrowserEvent);
    if (touches.length == 2) {
      var coords = [];
      var ids = {};
      for (var i = 0; i < 2; i++) {
        var touch = touches[i];
        coords[i + i] = touch['clientX'] !== undefined ? touch['clientX'] : touch['pageX'];
        coords[i + i + 1] = touch['clientY'] !== undefined ? touch['clientY'] : touch['pageY'];
        ids[touch['identifier']] = true;
      }
      this.zooming_ = {
        anchor: this.chart_.getDragAnchor(),
        x: (coords[0] + coords[2]) / 2,
        y: (coords[1] + coords[3]) / 2,
        distance: anychart.math.vectorLength.apply(null, coords),
        ids: ids
      };
      goog.events.listen(anychart.document, goog.events.EventType.TOUCHMOVE, this.handleZoomMove_, {capture: true, passive: false}, this);
      e.preventDefault();
    }
  }
};


/**
 * Handles touchMove in zooming.
 * @param {goog.events.Event} e
 * @private
 */
anychart.stockModule.Plot.prototype.handleZoomMove_ = function(e) {
  var touches = this.extractTouches_(e);

  if (this.zooming_ && touches && touches.length > 1) {
    var coords = [];
    for (var i = 0; i < touches.length; i++) {
      var touch = touches[i];
      if (touch['identifier'] in this.zooming_.ids) {
        coords[i + i] = touch['clientX'] !== undefined ? touch['clientX'] : touch['pageX'];
        coords[i + i + 1] = touch['clientY'] !== undefined ? touch['clientY'] : touch['pageY'];
      }
    }
    var x = (coords[0] + coords[2]) / 2;
    var y = (coords[1] + coords[3]) / 2;
    var distance = anychart.math.vectorLength.apply(null, coords);
    this.zoomingFrameParams_ = {
      anchor: this.zooming_.anchor,
      x: x,
      y: y,
      distance: distance,
      dx: (x - this.zooming_.x) / this.seriesBounds_.width,
      dDistance: distance / this.zooming_.distance
    };
    if (!goog.isDef(this.zoomingFrame_))
      this.zoomingFrame_ = anychart.window.requestAnimationFrame(this.zoomingFrameAction_);
    e.preventDefault();
  }
};


/**
 * Handles touch start.
 * @param {goog.events.Event} e
 * @private
 */
anychart.stockModule.Plot.prototype.handleTouchEnd_ = function(e) {
  var touches = this.extractTouches_(e);

  if (touches.length == 1) {
    goog.events.unlisten(anychart.document, goog.events.EventType.TOUCHMOVE, this.handleZoomMove_, {
      capture: true,
      passive: false
    }, this);
    var touch = touches[0];

    var acgraphBrowserEvent = e.getOriginalEvent();
    var browserEvent = acgraphBrowserEvent.getBrowserEvent();
    var newEvent = new goog.events.BrowserEvent(browserEvent);

    newEvent.clientX = touch['clientX'] !== undefined ? touch['clientX']: touch['pageX'];
    newEvent.clientY = touch['clientY'] !== undefined ? touch['clientY']: touch['pageY'];
    newEvent.screenX = touch['screenX'] || 0;
    newEvent.screenY = touch['screenY'] || 0;
    this.zooming_ = null;
    this.dragger_.startDrag(newEvent);
  }
};


/**
 * Handles mouseOver over the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.handlePlotMouseOverAndMove_ = function(e) {
  var annotationsInitAndDrawing = this.annotations_ && this.annotations_.inDrawing;
  if (this.seriesBounds_ && !annotationsInitAndDrawing) {
    var stageReferencePoint = this.container().getStage().getClientPosition();
    var x = e['clientX'] - stageReferencePoint.x - this.seriesBounds_.left;
    var y = e['clientY'] - stageReferencePoint.y - this.seriesBounds_.top;
    // testing that the point is inside series area
    if (x >= 0 && x <= this.seriesBounds_.width &&
        y >= 0 && y <= this.seriesBounds_.height) {
      var eventPosition = this.getPositionFromEvent_(/** @type {anychart.core.MouseEvent} */(e));
      this.frameHighlightRatio_ = eventPosition.xRatio;
      this.frameHighlightYRatio_ = eventPosition.yRatio;
      this.frameHighlightX_ = eventPosition.x;
      this.frameHighlightY_ = eventPosition.y;
      this.crosshair().xLabelAutoEnabled(this.isLastPlot_);
      if (!goog.isDef(this.frame_))
        this.frame_ = anychart.window.requestAnimationFrame(this.frameAction_);
    }
  }
};


/**
 * Handles mouseOut over the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.handlePlotMouseOut_ = function(e) {
  this.frameHighlightRatio_ = NaN;
  this.frameHighlightYRatio_ = NaN;
  if (!goog.isDef(this.frame_))
    this.frame_ = anychart.window.requestAnimationFrame(this.frameAction_);
};


/**
 * Handles mouseDown event on the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.handlePlotMouseDown_ = function(e) {
  if (this.chart_.annotationsModule)
    this.annotations().unselect();
};


//endregion
//region --- Crosshair
//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets whether this plot is first in chart.
 * @param {boolean=} opt_value - Value to set.
 * @return {anychart.stockModule.Plot|boolean}
 */
anychart.stockModule.Plot.prototype.isFirstPlot = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.isFirstPlot_ = opt_value;
    return this;
  }
  return this.isFirstPlot_;
};


/**
 * Sets whether this plot is last in chart.
 * @param {boolean=} opt_value - Value to set.
 * @return {anychart.stockModule.Plot|boolean}
 */
anychart.stockModule.Plot.prototype.isLastPlot = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.isLastPlot_ = opt_value;
    return this;
  }
  return this.isLastPlot_;
};


/**
 * Whether plot is expanded by plot controls.
 * @param {boolean=} opt_value
 * @return {anychart.stockModule.Plot|boolean}
 */
anychart.stockModule.Plot.prototype.isExpanded = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.isExpanded_ = opt_value;
    return this;
  }
  return this.isExpanded_;
};


/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Crosshair|anychart.stockModule.Plot)}
 */
anychart.stockModule.Plot.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.Crosshair();
    this.crosshair_.setInteractivityTarget(this);
    this.setupCreated('crosshair', this.crosshair_);
    this.crosshair_.listenSignals(this.onCrosshairSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.crosshair_.setup(opt_value);
    return this;
  } else {
    return this.crosshair_;
  }
};


/**
 * Listener for crosshair invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.stockModule.Plot.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
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
 * @param {(boolean|Array.<anychart.enums.AnnotationTypes|anychart.annotationsModule.AnnotationJSONFormat>)=} opt_value
 * @return {anychart.stockModule.Plot|anychart.annotationsModule.PlotController}
 */
anychart.stockModule.Plot.prototype.annotations = function(opt_value) {
  if (!this.chart_.annotationsModule) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Annotations']);
  } else if (!this.annotations_) {
    this.annotations_ = new this.chart_.annotationsModule['PlotController'](
        /** @type {!anychart.annotationsModule.ChartController} */(this.chart_.annotations()), this);
    this.annotations_.listenSignals(this.annotationsInvalidated_, this);
    this.annotations_.setParentEventTarget(this);
    this.annotations_.setup(this.themeSettings['annotations']);
  }
  if (goog.isDef(opt_value)) {
    if (this.annotations_)
      this.annotations_.setup(opt_value);
    return this;
  }
  return this.annotations_ || null;
};


//endregion
//region --- Event markers
//------------------------------------------------------------------------------
//
//  Event markers
//
//------------------------------------------------------------------------------
/**
 * Event markers controller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.stockModule.eventMarkers.PlotController|anychart.stockModule.Plot}
 */
anychart.stockModule.Plot.prototype.eventMarkers = function(opt_value) {
  if (!this.eventMarkers_) {
    this.eventMarkers_ = new anychart.stockModule.eventMarkers.PlotController(this, /** @type {anychart.stockModule.eventMarkers.ChartController} */(this.chart_.eventMarkers()));
    this.eventMarkers_.listenSignals(this.eventMarkersSignalsHandler_, this);
    this.eventMarkers_.setParentEventTarget(this.chart_.eventMarkers());
  }

  if (goog.isDef(opt_value)) {
    this.eventMarkers_.setup(opt_value);
    return this;
  }
  return this.eventMarkers_;
};


/**
 * Event markers controller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.eventMarkersSignalsHandler_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_EVENT_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Invalidation handlers
/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.annotationsInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.backgroundInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Series invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.seriesInvalidated_ = function(e) {
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
anychart.stockModule.Plot.prototype.yAxisInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.STOCK_PLOT_AXES;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    state |= anychart.ConsistencyState.BOUNDS;
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Y axis invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.priceIndicatorInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_PRICE_INDICATORS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * X axis invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.xAxisInvalidated_ = function(e) {
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
anychart.stockModule.Plot.prototype.onGridSignal_ = function(e) {
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
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.stockModule.Plot)} .
 */
anychart.stockModule.Plot.prototype.palette = function(opt_value) {
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
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.stockModule.Plot)} Return current chart markers palette or itself for chaining call.
 */
anychart.stockModule.Plot.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.setupCreated('markerPalette', this.markerPalette_);
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
 * @return {!(anychart.palettes.HatchFills|anychart.stockModule.Plot)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.stockModule.Plot.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.setupCreated('hatchFillPalette', this.hatchFillPalette_);
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
anychart.stockModule.Plot.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.STOCK_PLOT_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.stockModule.Plot.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- No data
/**
 * Creates chart label.
 * @return {anychart.core.ui.Label} Label instance.
 */
anychart.stockModule.Plot.prototype.createChartLabel = function() {
  return new anychart.core.ui.Label();
};


/**
 * No data label invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.stockModule.Plot.prototype.noDataSettingsInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.STOCK_PLOT_NO_DATA_LABEL, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 *  No data settings.
 *  @param {Object=} opt_value
 *  @return {anychart.stockModule.Plot|anychart.core.NoDataSettings} noData settings or self for chaining.
 */
anychart.stockModule.Plot.prototype.noData = function(opt_value) {
  if (!this.noDataSettings_) {
    this.noDataSettings_ = new anychart.core.NoDataSettings(this);
    this.noDataSettings_.listenSignals(this.noDataSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.noDataSettings_.setup(opt_value);
    return this;
  }
  return this.noDataSettings_;
};


/**
 * Whether series is visible on a plot.
 * @param {anychart.stockModule.Series} series
 * @return {boolean}
 */
anychart.stockModule.Plot.prototype.isSeriesVisible = function(series) {
  var data = series.getSelectableData();
  var rowsCount = data ? data.getFullPointsCount() : 0;
  return !!(series.enabled() && rowsCount);
};


/**
 * Is there no data on the plot.
 * @return {boolean}
 */
anychart.stockModule.Plot.prototype.isNoData = function() {
  var countDisabled = 0;
  var len = this.series_.length;
  for (var i = 0; i < len; i++) {
    if (!this.isSeriesVisible(this.series_[i]))
      countDisabled++;
    else
      break;
  }
  return (countDisabled == len);
};


//endregion
//region Serialization / deserialization / disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / deserialization / disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.stockModule.Plot.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.annotations_,
      this.title_,
      this.eventMarkers_,
      this.background_,
      this.xAxis_,
      this.yAxes_,
      this.noDataSettings_,
      this.rootLayer_,
      this.crosshair_,
      this.defaultSeriesSettings_,
      this.defaultGridSettings_,
      this.defaultMinorGridSettings_,
      this.defaultYAxisSettings_,
      this.legend_,
      this.xGrids_,
      this.yGrids_,
      this.xMinorGrids_,
      this.yMinorGrids_,
      this.series_,
      this.dataArea_,
      this.indicators_,
      this.priceIndicators_,
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.palette_,
      this.markerPalette_,
      this.hatchFillPalette_);

  this.annotations_ = null;
  this.title_ = null;
  this.eventMarkers_ = null;
  this.background_ = null;
  this.xAxis_ = null;
  this.noDataSettings_ = null;
  this.rootLayer_ = null;
  this.crosshair_ = null;
  this.defaultSeriesSettings_ = null;
  this.defaultGridSettings_ = null;
  this.defaultMinorGridSettings_ = null;
  this.defaultYAxisSettings_ = null;
  this.legend_ = null;
  this.dataArea_ = null;
  this.palette_ = null;
  this.markerPalette_ = null;
  this.hatchFillPalette_ = null;

  this.indicators_.length = 0;
  this.series_.length = 0;
  this.yAxes_.length = 0;
  this.xGrids_.length = 0;
  this.yGrids_.length = 0;
  this.xMinorGrids_.length = 0;
  this.yMinorGrids_.length = 0;
  this.lineAxesMarkers_.length = 0;
  this.rangeAxesMarkers_.length = 0;
  this.textAxesMarkers_.length = 0;
  this.priceIndicators_.length = 0;

  anychart.stockModule.Plot.base(this, 'disposeInternal');

  this.chart_.removePlotInternal(this);
  delete this.chart_;
};


/**
 * Grids serialization.
 * @param {string} propName
 * @param {Array.<anychart.stockModule.Grid>} list
 * @param {!Object} json
 * @param {Array.<Object>} scales
 * @param {Object} scalesIds
 * @param {Array} axesIds
 * @private
 */
anychart.stockModule.Plot.prototype.serializeGrids_ = function(propName, list, json, scales, scalesIds, axesIds) {
  var i, scale, objId, config, axis, axisId, axisIndex, axisScale, isHorizontal, axisOrientation;
  var grids = [];
  for (i = 0; i < list.length; i++) {
    var grid = list[i];
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
            if (anychart.utils.instanceOf(axis, anychart.core.Axis)) {
              axisOrientation = axis.getOption('orientation');
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
    json[propName] = grids;
};


/** @inheritDoc */
anychart.stockModule.Plot.prototype.serialize = function() {
  var json = anychart.stockModule.Plot.base(this, 'serialize');
  var scalesIds = {};
  var scales = [];
  var axesIds = [];

  var scale;
  var config;
  var objId;
  var i;

  anychart.core.settings.serialize(this, anychart.stockModule.Plot.PROPERTY_DESCRIPTORS, json);

  scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
  scales.push(scalesIds[goog.getUid(this.yScale())]);
  json['yScale'] = scales.length - 1;

  json['defaultSeriesType'] = this.defaultSeriesType();
  json['background'] = this.background().serialize();
  json['title'] = this.title().serialize();
  json['noDataLabel'] = this.noData().label().serialize();
  json['dataArea'] = this.dataArea().serialize();

  axesIds.push(goog.getUid(this.xAxis()));
  json['xAxis'] = this.xAxis().serialize();

  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['crosshair'] = this.crosshair().serialize();

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

  var priceIndicators = [];
  for (i = 0; i < this.priceIndicators_.length; i++) {
    var priceIndicator = this.priceIndicators_[i];
    if (priceIndicator)
      priceIndicators[i] = priceIndicator.serialize();
  }
  if (priceIndicators.length)
    json['priceIndicators'] = priceIndicators;

  this.serializeGrids_('xGrids', this.xGrids_, json, scales, scalesIds, axesIds);
  this.serializeGrids_('yGrids', this.yGrids_, json, scales, scalesIds, axesIds);
  this.serializeGrids_('xMinorGrids', this.xMinorGrids_, json, scales, scalesIds, axesIds);
  this.serializeGrids_('yMinorGrids', this.yMinorGrids_, json, scales, scalesIds, axesIds);

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
anychart.stockModule.Plot.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Plot.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.stockModule.Plot.PROPERTY_DESCRIPTORS, config, opt_default);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  if ('defaultPriceIndicatorSettings' in config)
    this.defaultPriceIndicatorSettings(config['defaultPriceIndicatorSettings']);

  if ('defaultLineMarkerSettings' in config)
    this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);

  if ('defaultTextMarkerSettings' in config)
    this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);

  if ('defaultMinorGridSettings' in config)
    this.defaultMinorGridSettings(config['defaultMinorGridSettings']);

  if ('defaultYAxisSettings' in config)
    this.setDefaultYAxisSettings(config['defaultYAxisSettings']);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  this.setupElements(opt_default, config);

  this.dataArea(config['dataArea']);

  this.defaultSeriesType(config['defaultSeriesType']);

  this.palette(config['palette']);

  this.markerPalette(config['markerPalette']);

  this.hatchFillPalette(config['hatchFillPalette']);

  this.noData().label(config['noDataLabel']);

  this.background(config['background']);

  if ('title' in config)
    this.title().setupInternal(!!opt_default, config['title']);

  this.legend(config['legend']);

  var i, json;
  var priceIndicators = config['priceIndicators'];
  if (goog.isArray(priceIndicators)) {
    for (i = 0; i < priceIndicators.length; i++) {
      json = priceIndicators[i];
      if (json)
        this.priceIndicator(i, json);
    }
  }

  if (this.chart_.annotationsModule)
    this.annotations(config['annotations']);

  if ('crosshair' in config)
    this.crosshair(config['crosshair']);

  this.setupElementsWithScales(config['xGrids'], this.xGrid);
  this.setupElementsWithScales(config['yGrids'], this.yGrid);
  this.setupElementsWithScales(config['xMinorGrids'], this.xMinorGrid);
  this.setupElementsWithScales(config['yMinorGrids'], this.yMinorGrid);

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
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(this.scalesInstances_[json['yScale']]);
        }
      }
    }
  }
};


/**
 * @param {Object=} opt_config
 */
anychart.stockModule.Plot.prototype.setupScales = function(opt_config) {
  var i, scale, json;

  var scales = anychart.utils.recursiveClone(this.getThemeOption('scales'));
  if (opt_config && opt_config['scales']) {
    for (var k = 0; k < scales.length; k++) {
      if (opt_config['scales'][k])
        goog.mixin(scales[k], opt_config['scales'][k]);
    }
    if (opt_config['scales'].length > scales.length)
      scales = goog.array.concat(scales, goog.array.slice(opt_config['scales'], scales.length));
  }

  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
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
      scale = anychart.scales.ScatterBase.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  json = anychart.utils.recursiveClone(this.getThemeOption('yScale'));
  if (opt_config && goog.isDef(opt_config['yScale'])) {
    if (goog.typeOf(opt_config['yScale']) == 'object' && goog.typeOf(json) == 'object')
      goog.mixin(/** @type {!Object} */(json), opt_config['yScale']);
    else
      json = opt_config['yScale'];
  }

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

  this.scalesInstances_ = scalesInstances;
};


/**
 * Create and setup elements that should be created before draw
 * @param {boolean=} opt_default
 * @param {Object=} opt_config
 */
anychart.stockModule.Plot.prototype.setupElements = function(opt_default, opt_config) {
  this.setupScales(opt_config);
  this.xAxis();

  var config = opt_config || this.themeSettings;
  this.setupElementsWithScales(config['yAxes'], this.yAxis);
};


/**
 * Setups elements defined by an array of json with scale instances map.
 * @param {*} items
 * @param {Function} itemConstructor
 * @param {boolean=} opt_setupElement
 * @protected
 */
anychart.stockModule.Plot.prototype.setupElementsWithScales = function(items, itemConstructor, opt_setupElement) {
  if (goog.isArray(items)) {
    for (var i = 0; i < items.length; i++) {
      var json = items[i];
      var element = itemConstructor.call(this, i);
      if (!goog.object.isEmpty(json)) {
        if (opt_setupElement) {
          element.setup(json);
        } else {
          element.addThemes(json);
        }

        var scale = goog.isObject(json) && 'scale' in json ? json['scale'] : element.getThemeOption('scale');
        if (scale > 0)
          element.scale(this.scalesInstances_[scale]);
      }
    }
  }
};

//endregion
//region anychart.stockModule.Plot.Dragger
//----------------------------------------------------------------------------------------------------------------------
//
//  anychart.stockModule.Plot.Dragger
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Dragger for plot thumbs.
 * @param {anychart.stockModule.Plot} plot
 * @param {acgraph.vector.Element} target
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.stockModule.Plot.Dragger = function(plot, target) {
  anychart.stockModule.Plot.Dragger.base(this, 'constructor', target.domElement());

  /**
   * Plot reference.
   * @type {anychart.stockModule.Plot}
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
  this.listen(goog.fx.Dragger.EventType.BEFOREDRAG, this.beforeDragHandler_, false, this);
  this.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
};
goog.inherits(anychart.stockModule.Plot.Dragger, goog.fx.Dragger);


/**
 * @type {number}
 * @private
 */
anychart.stockModule.Plot.Dragger.prototype.frameRatio_;


/**
 * @type {anychart.stockModule.Chart.DragAnchor}
 * @private
 */
anychart.stockModule.Plot.Dragger.prototype.frameAnchor_;


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.stockModule.Plot.Dragger.prototype.dragStartHandler_ = function(e) {
  return this.plot_.chart_.askDragStart();
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.stockModule.Plot.Dragger.prototype.dragEndHandler_ = function(e) {
  if (goog.isDef(this.frame_)) {
    anychart.window.cancelAnimationFrame(this.frame_);
    this.frameAction_(0);
  }
  this.plot_.chart_.dragEnd();
};


/**
 * Before drag handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.stockModule.Plot.Dragger.prototype.beforeDragHandler_ = function(e) {
  return !!this.plot_.chart_.getDragParamsIfChanged(e.left / this.plot_.seriesBounds_.width, this.anchor_);
};


/**
 * Refreshes drag anchor.
 */
anychart.stockModule.Plot.Dragger.prototype.refreshDragAnchor = function() {
  this.plot_.chart_.refreshDragAnchor(this.anchor_);
};


/** @inheritDoc */
anychart.stockModule.Plot.Dragger.prototype.computeInitialPosition = function() {
  /**
   * @type {anychart.stockModule.Chart.DragAnchor}
   * @private
   */
  this.anchor_ = this.plot_.chart_.getDragAnchor();
  this.deltaX = 0;
  this.deltaY = 0;
};


/** @inheritDoc */
anychart.stockModule.Plot.Dragger.prototype.defaultAction = function(x, y) {
  this.frameRatio_ = x / this.plot_.seriesBounds_.width;
  this.frameAnchor_ = this.anchor_;
  if (!goog.isDef(this.frame_))
    this.frame_ = anychart.window.requestAnimationFrame(this.frameAction_);
};


/** @inheritDoc */
anychart.stockModule.Plot.Dragger.prototype.limitX = function(x) {
  var width = this.plot_.seriesBounds_.width;
  var ratio = this.plot_.chart_.limitDragRatio(x / width, this.anchor_);
  return ratio * width;
};


/** @inheritDoc */
anychart.stockModule.Plot.Dragger.prototype.limitY = function(y) {
  return 0;
};


//endregion
//exports
(function() {
  var proto = anychart.stockModule.Plot.prototype;
  proto['crosshair'] = proto.crosshair;
  proto['background'] = proto.background;
  proto['title'] = proto.title;
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
  proto['hilo'] = proto.hilo;
  proto['getSeries'] = proto.getSeries;
  proto['yScale'] = proto.yScale;
  proto['yAxis'] = proto.yAxis;
  proto['xAxis'] = proto.xAxis;
  proto['xGrid'] = proto.xGrid;
  proto['yGrid'] = proto.yGrid;
  proto['xMinorGrid'] = proto.xMinorGrid;
  proto['yMinorGrid'] = proto.yMinorGrid;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  // auto generated methods
  //proto['adl'] = proto.adl;
  //proto['ama'] = proto.ama;
  //proto['aroon'] = proto.aroon;
  //proto['atr'] = proto.atr;
  //proto['bbands'] = proto.bbands;
  //proto['bbandsB'] = proto.bbandsB;
  //proto['bbandsWidth'] = proto.bbandsWidth;
  //proto['cci'] = proto.cci;
  //proto['cho'] = proto.cho;
  //proto['cmf'] = proto.cmf;
  //proto['dmi'] = proto.dmi;
  //proto['ema'] = proto.ema;
  //proto['kdj'] = proto.kdj;
  //proto['macd'] = proto.macd;
  //proto['mfi'] = proto.mfi;
  //proto['mma'] = proto.mma;
  //proto['momentum'] = proto.momentum;
  //proto['psar'] = proto.psar;
  //proto['roc'] = proto.roc;
  //proto['rsi'] = proto.rsi;
  //proto['sma'] = proto.sma;
  //proto['stochastic'] = proto.stochastic;
  //proto['williamsR'] = proto.williamsR;
  //proto['baseline'] = proto.baseline;
  proto['palette'] = proto.palette;
  proto['markerPalette'] = proto.markerPalette;
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  proto['annotations'] = proto.annotations;
  proto['eventMarkers'] = proto.eventMarkers;
  proto['priceIndicator'] = proto.priceIndicator;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['textMarker'] = proto.textMarker;
  proto['noData'] = proto.noData;
  proto['getStat'] = proto.getStat;
  proto['dataArea'] = proto.dataArea;
})();
