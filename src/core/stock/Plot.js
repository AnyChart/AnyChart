goog.provide('anychart.core.stock.Plot');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axes.StockDateTime');
goog.require('anychart.core.grids.Stock');
goog.require('anychart.core.stock.series.Base');
goog.require('anychart.core.stock.series.Column');
goog.require('anychart.core.stock.series.Line');
goog.require('anychart.core.stock.series.OHLC');
goog.require('anychart.core.ui.Background');
goog.require('anychart.enums');
goog.require('anychart.utils');


/**
 * Namespace anychart.core.stock
 * @namespace
 * @name anychart.core.stock
 */



/**
 * Stock Plot class.
 * @param {anychart.charts.Stock} chart Stock chart reference.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.stock.Plot = function(chart) {
  goog.base(this);

  /**
   * Parent chart reference.
   * @type {anychart.charts.Stock}
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
   * @type {!Array.<!anychart.core.stock.series.Base>}
   * @private
   */
  this.series_ = [];

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

  this.defaultSeriesType(anychart.enums.StockSeriesType.LINE);
};
goog.inherits(anychart.core.stock.Plot, anychart.core.VisualBaseWithBounds);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.stock.Plot.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


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


//region Series-related methods
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
 * @return {anychart.core.stock.series.Base}
 */
anychart.core.stock.Plot.prototype.column = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.StockSeriesType.COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
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
 * @return {anychart.core.stock.series.Base}
 */
anychart.core.stock.Plot.prototype.line = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.StockSeriesType.LINE, opt_data, opt_mappingSettings, opt_csvSettings);
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
 * @return {anychart.core.stock.series.Base}
 */
anychart.core.stock.Plot.prototype.ohlc = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.StockSeriesType.OHLC, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Add series to chart.
 * @param {...anychart.data.TableMapping} var_args Chart series data.
 * @return {Array.<anychart.core.stock.series.Base>} Array of created series.
 */
anychart.core.stock.Plot.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType_(type, null, undefined, undefined));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType_(type, arguments[i], undefined, undefined));
    }
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
 * @return {anychart.core.stock.series.Base} Series instance.
 */
anychart.core.stock.Plot.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.stock.series.Base} Series instance.
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
 * @return {!Array.<!anychart.core.stock.series.Base>}
 */
anychart.core.stock.Plot.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Getter/setter for series default settings.
 * @param {Object} value Object with default series settings.
 */
anychart.core.stock.Plot.prototype.setDefaultSeriesSettings = function(value) {
  this.defaultSeriesSettings_ = value;
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
 * @private
 * @return {anychart.core.stock.series.Base}
 */
anychart.core.stock.Plot.prototype.createSeriesByType_ = function(type, opt_data, opt_mappingSettings, opt_csvSettings) {
  type = anychart.enums.normalizeStockSeriesType(type);
  var ctl = anychart.core.stock.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(this.chart_, this);
    instance.data(opt_data, opt_mappingSettings, opt_csvSettings);
    instance.setParentEventTarget(this);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);
    var inc = index * anychart.core.stock.Plot.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);
    var seriesZIndex = ((type == anychart.enums.StockSeriesType.LINE) ?
            anychart.core.stock.Plot.ZINDEX_LINE_SERIES :
            anychart.core.stock.Plot.ZINDEX_SERIES) + inc;
    instance.setAutoZIndex(seriesZIndex);
    instance.clip(true);
    //instance.setAutoColor(this.palette().colorAt(this.series_.length - 1));
    instance.setup(this.defaultSeriesSettings_[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(
        anychart.ConsistencyState.STOCK_PLOT_SERIES |
        anychart.ConsistencyState.STOCK_PLOT_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};
//endregion


//region Public properties
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
    this.legend_.zIndex(200);
    this.legend_.listenSignals(this.onLegendSignal_, this);
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
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
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
 * Getter/setter for y axis default settings.
 * @param {Object} value Object with default settings.
 */
anychart.core.stock.Plot.prototype.setDefaultYAxisSettings = function(value) {
  this.defaultYAxisSettings_ = value;
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
    index = opt_indexOrValue;
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
    this.xAxis_ = new anychart.core.axes.StockDateTime();
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
 * Getter/setter for grid default settings.
 * @param {Object} value Object with default grid settings.
 */
anychart.core.stock.Plot.prototype.setDefaultGridSettings = function(value) {
  this.defaultGridSettings_ = value;
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
    index = opt_indexOrValue;
    value = opt_value;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Stock();
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
 * Getter/setter for minor grid default settings.
 * @param {Object} value Object with default minor grid settings.
 */
anychart.core.stock.Plot.prototype.setDefaultMinorGridSettings = function(value) {
  this.defaultMinorGridSettings_ = value;
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
    index = opt_indexOrValue;
    value = opt_value;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Stock();
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


/**
 * Draws the plot.
 * @return {anychart.core.stock.Plot}
 */
anychart.core.stock.Plot.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var i, axis, legend, series;

  this.suspendSignalsDispatching();

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer_);
    this.eventsInterceptor_ = this.rootLayer_.rect();
    this.eventsInterceptor_.zIndex(1000);
    //this.eventsInterceptor_.cursor(acgraph.vector.Cursor.EW_RESIZE);
    this.eventsInterceptor_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.eventsInterceptor_.stroke(null);
    this.eventsHandler.listenOnce(this.eventsInterceptor_, acgraph.events.EventType.MOUSEDOWN, this.initDragger_);
    this.eventsHandler.listenOnce(this.eventsInterceptor_, acgraph.events.EventType.TOUCHSTART, this.initDragger_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEOVER, this.handlePlotMouseOverAndMove_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEMOVE, this.handlePlotMouseOverAndMove_);
    this.eventsHandler.listen(this.eventsInterceptor_, acgraph.events.EventType.MOUSEOUT, this.handlePlotMouseOut_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_SERIES)) {
    for (i = 0; i < this.series_.length; i++) {
      series = this.series_[i];
      if (series) {
        series.updateLastRow();
      }
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOT_LEGEND)) {
    var seriesBounds = this.getPixelBounds();
    if (this.background_) {
      this.background_.suspendSignalsDispatching();
      this.background_.parentBounds(seriesBounds);
      this.background_.resumeSignalsDispatching(false);
      //seriesBounds = this.background_.getRemainingBounds();
      this.invalidate(anychart.ConsistencyState.STOCK_PLOT_BACKGROUND);
    }

    var legendTitleDate;
    if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_PLOT_LEGEND)) {
      legendTitleDate = isNaN(this.highlightedValue_) ? this.chart_.getLastDate() : this.highlightedValue_;
    } else {
      legendTitleDate = NaN;
    }
    this.updateLegend_(seriesBounds, legendTitleDate);
    seriesBounds = this.legend().getRemainingBounds();

    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.parentBounds(seriesBounds);
      this.xAxis_.resumeSignalsDispatching(false);
      // we need this to reduce bounds height by the height of the axis
      seriesBounds = this.xAxis_.getRemainingBounds();
      this.invalidate(anychart.ConsistencyState.STOCK_PLOT_DT_AXIS);
    }

    var bounds = seriesBounds.clone();
    var leftPadding = 0;
    var rightPadding = 0;
    for (i = 0; i < this.yAxes_.length; i++) {
      axis = this.yAxes_[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        var width = axis.width();
        if (axis.orientation() == anychart.enums.Orientation.LEFT) {
          axis.parentBounds(/** @type {number} */(bounds.left - width - leftPadding),
              bounds.top, 0, bounds.height);
          leftPadding += width;
        } else if (axis.orientation() == anychart.enums.Orientation.RIGHT) {
          axis.parentBounds(/** @type {number} */(bounds.left),
              bounds.top, bounds.width - rightPadding, bounds.height);
          rightPadding += width;
        }
        axis.resumeSignalsDispatching(false);
      }
    }

    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      // we need this to tell xAxis about new width by Y axes
      this.xAxis_.parentBounds(seriesBounds.left, seriesBounds.top,
          seriesBounds.width, /** @type {number} */(seriesBounds.height + this.xAxis_.height()));
      this.xAxis_.resumeSignalsDispatching(false);
      seriesBounds = this.xAxis_.getRemainingBounds();
    }

    if (this.legend_ && this.legend_.enabled()) {
      var legendBounds = seriesBounds.clone();
      var legendHeight = this.legend_.getPixelBounds().height;
      legendBounds.top -= legendHeight;
      legendBounds.height += legendHeight;
      this.updateLegend_(legendBounds);
      seriesBounds = this.legend_.getRemainingBounds();
    }

    this.seriesBounds_ = seriesBounds;
    this.eventsInterceptor_.setBounds(this.seriesBounds_);
    this.invalidateRedrawable(true);
    this.markConsistent(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.STOCK_PLOT_LEGEND);
  }

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

  this.resumeSignalsDispatching(false);

  return this;
};
//endregion


//region Legend
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
    legend.width(opt_seriesBounds.width);
  }
  var formatter;
  if (!isNaN(opt_titleValue) && goog.isFunction(formatter = legend.titleFormatter())) {
    var context = {
      'value': opt_titleValue,
      'groupingIntervalUnit': this.chart_.xScale().getGroupingUnit(),
      'groupingIntervalUnitCount': this.chart_.xScale().getGroupingUnitCount()
    };
    legend.title().text(formatter.call(context, context));
  }
  if (!legend.itemsSource())
    legend.itemsSource(this);
  legend.invalidate(anychart.ConsistencyState.APPEARANCE);
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
  // If there are no signals � state == 0 and nothing will happen.
  this.invalidate(state, signal);
};


/**
 * Create legend items provider specific to chart type.
 * @param {string} sourceMode Items source mode (default|categories).
 * @param {?Function} itemsTextFormatter Legend items text formatter.
 * @return {!Array.<anychart.core.ui.Legend.LegendItemProvider>} Legend items provider.
 */
anychart.core.stock.Plot.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0; i < this.series_.length; i++) {
    /** @type {anychart.core.stock.series.Base} */
    var series = this.series_[i];
    if (series) {
      var itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.index();
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
  return false;
};


/**
 * Calls when legend item that some how belongs to the chart was clicked.
 * @param {anychart.core.ui.LegendItem} item Legend item that was clicked.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.stock.Plot.prototype.legendItemClick = goog.nullFunction;


/**
 * Calls when legend item that some how belongs to the chart was hovered.
 * @param {anychart.core.ui.LegendItem} item Legend item that was hovered.
 */
anychart.core.stock.Plot.prototype.legendItemOver = goog.nullFunction;


/**
 * Calls when legend item that some how belongs to the chart was unhovered.
 * @param {anychart.core.ui.LegendItem} item Legend item that was unhovered.
 */
anychart.core.stock.Plot.prototype.legendItemOut = goog.nullFunction;
//endregion


//region Interactivity
/**
 * Prepares highlight and returns an array of highlighted data rows for each series of the plot.
 * @param {number} value
 * @return {Array.<{series:?anychart.core.stock.series.Base, point:?anychart.data.TableSelectable.RowProxy}>}
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
  } else {
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
};


/**
 * Mousedown handler.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.initDragger_ = function(e) {
  this.dragger_ = new anychart.core.stock.Plot.Dragger(this, this.eventsInterceptor_);
  this.dragger_.listen(goog.fx.Dragger.EventType.START, this.dragStartHandler_, false, this);
  this.dragger_.listen(goog.fx.Dragger.EventType.END, this.dragEndHandler_, false, this);
  this.dragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag start handler.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 * @private
 */
anychart.core.stock.Plot.prototype.dragStartHandler_ = function(e) {
  var res;
  if (res = this.chart_.askDragStart())
    goog.style.setStyle(document['body'], 'cursor', acgraph.vector.Cursor.EW_RESIZE);
  return res;
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.dragEndHandler_ = function(e) {
  goog.style.setStyle(document['body'], 'cursor', '');
  this.chart_.dragEnd();
};


/**
 * Handles mouseOver over the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.handlePlotMouseOverAndMove_ = function(e) {
  if (this.seriesBounds_) {
    var stageReferencePoint = goog.style.getClientPosition(/** @type {Element} */
        (this.container().getStage().container()));
    var x = e['clientX'] - stageReferencePoint.x - this.seriesBounds_.left;
    var y = e['clientY'] - stageReferencePoint.y - this.seriesBounds_.top;
    // testing that the point is inside series area
    if (x >= 0 && x <= this.seriesBounds_.width &&
        y >= 0 && y <= this.seriesBounds_.height) {
      this.chart_.highlightAtRatio(x / this.seriesBounds_.width, e['clientX'], e['clientY']);
    }
  }
};


/**
 * Handles mouseOut over the series plot area.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.stock.Plot.prototype.handlePlotMouseOut_ = function(e) {
  this.chart_.unhighlight();
};
//endregion


//region Invalidation handlers
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


/**
 * Invalidates plot series. Doesn't dispatch anything.
 * @param {boolean} doInvalidateBounds
 */
anychart.core.stock.Plot.prototype.invalidateRedrawable = function(doInvalidateBounds) {
  var i;

  var state = anychart.ConsistencyState.STOCK_SERIES_POINTS;
  if (doInvalidateBounds) state |= anychart.ConsistencyState.BOUNDS;
  for (i = 0; i < this.series_.length; i++) {
    if (this.series_[i])
      this.series_[i].invalidate(state);
  }

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
  if (this.legend_ && this.legend_.enabled())
    this.legend_.invalidate(state);

  this.invalidate(anychart.ConsistencyState.STOCK_PLOT_SERIES |
      anychart.ConsistencyState.STOCK_PLOT_AXES |
      anychart.ConsistencyState.STOCK_PLOT_DT_AXIS |
      anychart.ConsistencyState.STOCK_PLOT_GRIDS |
      anychart.ConsistencyState.STOCK_PLOT_LEGEND);
};
//endregion


/** @inheritDoc */
anychart.core.stock.Plot.prototype.disposeInternal = function() {
  goog.dispose(this.background_);
  this.background_ = null;

  goog.disposeAll(this.series_);
  delete this.series_;

  goog.disposeAll(this.yAxes_);
  delete this.yAxes_;

  goog.disposeAll(this.xAxis_);
  this.xAxis_ = null;

  this.chart_ = null;

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.stock.Plot.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  var scalesIds = {};
  var scales = [];
  var scale;
  var config;
  var objId;
  var i;

  scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
  scales.push(scalesIds[goog.getUid(this.yScale())]);
  json['yScale'] = scales.length - 1;

  json['defaultSeriesType'] = this.defaultSeriesType();
  json['background'] = this.background().serialize();
  json['xAxis'] = this.xAxis().serialize();
  json['dateTimeHighlighter'] = anychart.color.serialize(this.dateTimeHighlighterStroke_);

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
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
    grids.push(config);
  }
  if (grids.length)
    json['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
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
  if (minorGrids.length)
    json['minorGrids'] = minorGrids;

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
    yAxes.push(config);
  }
  if (yAxes.length)
    json['yAxes'] = yAxes;

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
anychart.core.stock.Plot.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  var i, json, scale;

  this.defaultSeriesType(config['defaultSeriesType']);
  this.background(config['background']);
  this.xAxis(config['xAxis']);
  this.dateTimeHighlighter(config['dateTimeHighlighter']);
  this.legend(config['legend']);

  var scales = config['scales'];
  var scalesInstances = {};
  if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        scale = anychart.scales.ScatterBase.fromString(json, false);
      } else {
        scale = anychart.scales.ScatterBase.fromString(json['type'], false);
        scale.setup(json);
      }
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
    this.setDefaultSeriesSettings(config['defaultSeriesSettings']);

  var series = config['series'];
  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || this.defaultSeriesType()).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }
};


/**
 * Returns current pixel position of 0.5 ratio.
 * @return {Object}
 */
anychart.core.stock.Plot.prototype.getDragAnchor = function() {
  return this.chart_.getDragAnchor();
};


/**
 * Drags current 0.5 date to passed position.
 * @param {number} x
 * @param {Object} anchor
 */
anychart.core.stock.Plot.prototype.dragTo = function(x, anchor) {
  this.chart_.dragToRatio(x / this.seriesBounds_.width, anchor);
};


/**
 * Limits passed position.
 * @param {number} x
 * @param {Object} anchor
 * @return {number}
 */
anychart.core.stock.Plot.prototype.limitDragPosition = function(x, anchor) {
  if (!this.seriesBounds_) return x;
  var width = this.seriesBounds_.width;
  var ratio = this.chart_.limitDragRatio(x / width, anchor);
  return ratio * width;
};



/**
 * Dragger for plot thumbs.
 * @param {anychart.core.stock.Plot} plot
 * @param {acgraph.vector.Element} target
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.stock.Plot.Dragger = function(plot, target) {
  goog.base(this, target.domElement());

  /**
   * Plot reference.
   * @type {anychart.core.stock.Plot}
   * @private
   */
  this.plot_ = plot;
};
goog.inherits(anychart.core.stock.Plot.Dragger, goog.fx.Dragger);


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.computeInitialPosition = function() {
  this.anchor_ = this.plot_.getDragAnchor();
  this.deltaX = 0;
  this.deltaY = 0;
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.defaultAction = function(x, y) {
  this.plot_.dragTo(x, this.anchor_);
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.limitX = function(x) {
  return this.plot_.limitDragPosition(x, this.anchor_);
};


/** @inheritDoc */
anychart.core.stock.Plot.Dragger.prototype.limitY = function(y) {
  return 0;
};


//exports
anychart.core.stock.Plot.prototype['background'] = anychart.core.stock.Plot.prototype.background;
anychart.core.stock.Plot.prototype['legend'] = anychart.core.stock.Plot.prototype.legend;
anychart.core.stock.Plot.prototype['line'] = anychart.core.stock.Plot.prototype.line;
anychart.core.stock.Plot.prototype['ohlc'] = anychart.core.stock.Plot.prototype.ohlc;
anychart.core.stock.Plot.prototype['column'] = anychart.core.stock.Plot.prototype.column;
anychart.core.stock.Plot.prototype['getSeries'] = anychart.core.stock.Plot.prototype.getSeries;
anychart.core.stock.Plot.prototype['yScale'] = anychart.core.stock.Plot.prototype.yScale;
anychart.core.stock.Plot.prototype['yAxis'] = anychart.core.stock.Plot.prototype.yAxis;
anychart.core.stock.Plot.prototype['xAxis'] = anychart.core.stock.Plot.prototype.xAxis;
anychart.core.stock.Plot.prototype['grid'] = anychart.core.stock.Plot.prototype.grid;
anychart.core.stock.Plot.prototype['minorGrid'] = anychart.core.stock.Plot.prototype.minorGrid;
anychart.core.stock.Plot.prototype['dateTimeHighlighter'] = anychart.core.stock.Plot.prototype.dateTimeHighlighter;
anychart.core.stock.Plot.prototype['defaultSeriesType'] = anychart.core.stock.Plot.prototype.defaultSeriesType;
anychart.core.stock.Plot.prototype['addSeries'] = anychart.core.stock.Plot.prototype.addSeries;
anychart.core.stock.Plot.prototype['getSeriesAt'] = anychart.core.stock.Plot.prototype.getSeriesAt;
anychart.core.stock.Plot.prototype['getSeriesCount'] = anychart.core.stock.Plot.prototype.getSeriesCount;
anychart.core.stock.Plot.prototype['removeSeries'] = anychart.core.stock.Plot.prototype.removeSeries;
anychart.core.stock.Plot.prototype['removeSeriesAt'] = anychart.core.stock.Plot.prototype.removeSeriesAt;
anychart.core.stock.Plot.prototype['removeAllSeries'] = anychart.core.stock.Plot.prototype.removeAllSeries;
