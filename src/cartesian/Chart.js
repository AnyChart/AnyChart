goog.provide('anychart.cartesian.Chart');

goog.require('anychart.Chart');
goog.require('anychart.cartesian.OrdinalIterator');
goog.require('anychart.cartesian.ScatterIterator');
goog.require('anychart.cartesian.series');
goog.require('anychart.elements.Axis');
goog.require('anychart.elements.Grid');
goog.require('anychart.elements.LineMarker');
goog.require('anychart.elements.RangeMarker');
goog.require('anychart.elements.TextMarker');
goog.require('anychart.scales.DateTime');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Logarithmic');
goog.require('anychart.scales.Ordinal');



/**
 * Класс предназначен для создания и управления cartesian графиками.
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.cartesian.Chart = function() {
  goog.base(this);

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * @type {!Array.<anychart.cartesian.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * @type {!Array.<anychart.elements.Axis>}
   * @private
   */
  this.xAxes_ = [];

  /**
   * @type {!Array.<anychart.elements.Axis>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * @type {Array.<anychart.elements.LineMarker>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.elements.RangeMarker>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.elements.TextMarker>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.elements.Grid>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.elements.Grid>}
   * @private
   */
  this.minorGrids_ = [];

  /**
   * Palette for series colors.
   * @type {anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette}
   * @private
   */
  this.palette_ = null;

  /**
   * Cache of chart data bounds.
   * @type {acgraph.math.Rect}
   * @private
   */
  this.dataBounds_ = null;

  /**
   * @type {number}
   * @private
   */
  this.barGroupsPadding_ = 0.5;

  /**
   * @type {number}
   * @private
   */
  this.barsPadding_ = 0.1;
};
goog.inherits(anychart.cartesian.Chart, anychart.Chart);


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS  to anychart.Chart states.
 * @type {number}
 */
anychart.cartesian.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.PALETTE |
        anychart.ConsistencyState.SCALES |
        anychart.ConsistencyState.SERIES |
        anychart.ConsistencyState.AXES |
        anychart.ConsistencyState.AXES_MARKERS |
        anychart.ConsistencyState.GRIDS;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets default chart X scale.
 * This scale will be passed to all scale depend chart elements if them not assigned they own scales.
 * @param {anychart.scales.Base=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.cartesian.Chart)} Default chart scale value or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Ordinal();
    }
    return this.xScale_;
  }
};


/**
 * Gets or sets default chart Y scale.
 * This scale will be passed to all scale depend chart elements if them not assigned they own scales.
 * @param {anychart.scales.Base=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.cartesian.Chart)} Default chart scale value or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
    }
    return this.yScale_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scale map properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {!Object.<!Array.<anychart.cartesian.series.Base>>}
 * @private
 */
anychart.cartesian.Chart.prototype.seriesOfStackedScaleMap_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.cartesian.Chart.prototype.yScales_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.cartesian.Chart.prototype.xScales_;


/**
 * @type {!Object.<!Array.<anychart.cartesian.series.Base>>}
 * @private
 */
anychart.cartesian.Chart.prototype.seriesOfXScaleMap_;


/**
 * @type {!Object.<!Array.<anychart.cartesian.series.Base>>}
 * @private
 */
anychart.cartesian.Chart.prototype.seriesOfYScaleMap_;


//----------------------------------------------------------------------------------------------------------------------
//
//  Grids.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets chart grid by index.
 * @param {(anychart.elements.Grid|Object|string|number|null)=} opt_indexOrValue Grid settings.
 * @param {anychart.elements.Grid=} opt_value Grid settings to set.
 * @return {!(anychart.elements.Grid|anychart.cartesian.Chart)} Grid instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.grid = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.grids_.length;
    value = opt_indexOrValue;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = new anychart.elements.Grid();
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Grid) {
      grid.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
    } else if (anychart.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * Gets or sets chart minor grid by index.
 * @param {(anychart.elements.Grid|Object|string|number|null)=} opt_indexOrValue Minor grid settings.
 * @param {anychart.elements.Grid=} opt_value Minor grid settings to set.
 * @return {!(anychart.elements.Grid|anychart.cartesian.Chart)} Grid instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.minorGrids_.length;
    value = opt_indexOrValue;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = new anychart.elements.Grid();
    grid.minor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Grid) {
      grid.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
    } else if (anychart.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * Listener for grids invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.Chart.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets chart X axis by index.
 * @param {(anychart.elements.Axis|Object|string|number|null)=} opt_indexOrValue Chart axis instance to set.
 * @param {anychart.elements.Axis=} opt_value Axis settings to set.
 * @return {!(anychart.elements.Axis|anychart.cartesian.Chart)} Axis by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.xAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.xAxes_.length;
    value = opt_indexOrValue;
  }
  var axis = this.xAxes_[index];
  if (!axis) {
    axis = new anychart.elements.Axis();
    axis.orientation(anychart.utils.Orientation.BOTTOM);
    axis.title().text('X Axis');
    this.xAxes_[index] = axis;
    this.restoreDefaultsForAxis(axis);
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Axis) {
      axis.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
    } else if (anychart.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * Gets or sets chart Y axis by index.
 * @param {(anychart.elements.Axis|Object|string|number|null)=} opt_indexOrValue Chart axis instance to set.
 * @param {anychart.elements.Axis=} opt_value Axis settings to set.
 * @return {!(anychart.elements.Axis|anychart.cartesian.Chart)} Axis by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.yAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.yAxes_.length;
    value = opt_indexOrValue;
  }
  var axis = this.yAxes_[index];
  if (!axis) {
    axis = new anychart.elements.Axis();
    axis.orientation(anychart.utils.Orientation.LEFT);
    axis.title().text('Y Axis');
    this.yAxes_[index] = axis;
    this.restoreDefaultsForAxis(axis);
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Axis) {
      axis.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
    } else if (anychart.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.Chart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // Если ни одного сингнала нет, то state == 0 и ничего не произойдет.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets chart line marker by index.
 * @param {(anychart.elements.LineMarker|Object|string|number|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {anychart.elements.LineMarker=} opt_value Chart line marker settings to set.
 * @return {!(anychart.elements.LineMarker|anychart.cartesian.Chart)} Line marker instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.lineAxesMarkers_.length;
    value = opt_indexOrValue;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.elements.LineMarker();
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.LineMarker) {
      lineMarker.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      lineMarker.deserialize(value);
    } else if (anychart.isNone(value)) {
      lineMarker.enabled(false);
    }
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Gets or sets chart range marker by index.
 * @param {(anychart.elements.RangeMarker|Object|string|number|null)=} opt_indexOrValue Chart range marker settings to set.
 * @param {anychart.elements.RangeMarker=} opt_value Chart range marker settings to set.
 * @return {!(anychart.elements.RangeMarker|anychart.cartesian.Chart)} Range marker instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.rangeAxesMarkers_.length;
    value = opt_indexOrValue;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.elements.RangeMarker();
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.RangeMarker) {
      rangeMarker.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      rangeMarker.deserialize(value);
    } else if (anychart.isNone(value)) {
      rangeMarker.enabled(false);
    }
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Gets or sets chart text marker by index.
 * @param {(anychart.elements.TextMarker|Object|string|number|null)=} opt_indexOrValue Chart text marker settings to set.
 * @param {anychart.elements.TextMarker=} opt_value Chart text marker settings to set.
 * @return {!(anychart.elements.TextMarker|anychart.cartesian.Chart)} Text marker instance by index or itself for chaining call.
 */
anychart.cartesian.Chart.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = this.textAxesMarkers_.length;
    value = opt_indexOrValue;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.elements.TextMarker();
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.TextMarker) {
      textMarker.deserialize(value.serialize());
    } else if (goog.isObject(value)) {
      textMarker.deserialize(value);
    } else if (anychart.isNone(value)) {
      textMarker.enabled(false);
    }
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.Chart.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
///**
// * Do nothing.
// * @param {*=} opt_value Do nothing.
// */
//anychart.cartesian.Chart.prototype.tooltip = function(opt_value) {
//  //todo:implement in 21 sprint
//};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series constructors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Area} Column.
 */
anychart.cartesian.Chart.prototype.area = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Area(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Bar} Column.
 */
anychart.cartesian.Chart.prototype.bar = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Bar(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Bubble} Column.
 */
anychart.cartesian.Chart.prototype.bubble = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Bubble(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Candlestick} Column.
 */
anychart.cartesian.Chart.prototype.candlestick = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Candlestick(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Column} Column.
 */
anychart.cartesian.Chart.prototype.column = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Column(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Line} Column.
 */
anychart.cartesian.Chart.prototype.line = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Line(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Marker} Column.
 */
anychart.cartesian.Chart.prototype.marker = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Marker(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.OHLC} Column.
 */
anychart.cartesian.Chart.prototype.ohlc = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.OHLC(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.RangeArea} Column.
 */
anychart.cartesian.Chart.prototype.rangeArea = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.RangeArea(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.RangeBar} Column.
 */
anychart.cartesian.Chart.prototype.rangeBar = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.RangeBar(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.RangeColumn} Column.
 */
anychart.cartesian.Chart.prototype.rangeColumn = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.RangeColumn(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.RangeSplineArea} Column.
 */
anychart.cartesian.Chart.prototype.rangeSplineArea = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.RangeSplineArea(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.RangeStepLineArea} Column.
 */
anychart.cartesian.Chart.prototype.rangeStepLineArea = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.RangeStepLineArea(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.Spline} Column.
 */
anychart.cartesian.Chart.prototype.spline = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.Spline(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.SplineArea} Column.
 */
anychart.cartesian.Chart.prototype.splineArea = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.SplineArea(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.StepLine} Column.
 */
anychart.cartesian.Chart.prototype.stepLine = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.StepLine(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.cartesian.series.StepLineArea} Column.
 */
anychart.cartesian.Chart.prototype.stepLineArea = function(data, opt_csvSettings) {
  var res = new anychart.cartesian.series.StepLineArea(data, opt_csvSettings);
  this.series_.push(res);
  res.setAutoColor(this.palette().colorAt(this.series_.length - 1));
  res.restoreDefaults();
  res.listenSignals(this.seriesInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
      anychart.Signal.NEEDS_REDRAW);
  return res;
};


/**
 * Getter for series.
 * @param {number} index
 * @return {anychart.cartesian.series.Base}
 */
anychart.cartesian.Chart.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.Chart.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SERIES;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.SCALES;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Расстояние между группами баров на ординальном чарте в долях от ширины бара.
 * @param {number=} opt_value .
 * @return {number|anychart.cartesian.Chart} .
 */
anychart.cartesian.Chart.prototype.barGroupsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barGroupsPadding_ != +opt_value) {
      this.barGroupsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barGroupsPadding_;
};


/**
 * Расстояние между барами на ординальном чарте в долях от ширины бара.
 * @param {number=} opt_value .
 * @return {number|anychart.cartesian.Chart} .
 */
anychart.cartesian.Chart.prototype.barsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barsPadding_ != +opt_value) {
      this.barsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barsPadding_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate cartesian chart properties.
 */
anychart.cartesian.Chart.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {number} */
  var j;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.cartesian.series.Base>} */
  var series;
  /** @type {anychart.cartesian.series.Base} */
  var aSeries;
  /** @type {Array.<*>} */
  var categories;
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {anychart.scales.Base} */
  var xScale;
  /** @type {number} */
  var id;
  /** @type {number} */
  var xId;
  /** @type {Array.<anychart.scales.Base>} */
  var yScalesToCalc;
  /** @type {Object.<!Array.<anychart.cartesian.series.Base>>} */
  var xScales;
  /** @type {anychart.cartesian.ScatterIterator} */
  var syncIterator;
  /** @type {Array.<*>} */
  var values;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
    anychart.Base.suspendSignalsDispatching(this.series_);

    this.makeScaleMaps_();

    yScalesToCalc = [];

    // parsing y scales map and getting lists of scales that need to be calculated and resetting them.
    for (id in this.yScales_) {
      scale = this.yScales_[id];
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc(); // starting autocalc for stacked scales too.
        if (scale.stackMode() != anychart.scales.StackMode.VALUE)
          yScalesToCalc.push(scale);
      }
    }
    // parsing x scales map and calculating them if needed as they cannot be stacked.
    for (id in this.xScales_) {
      scale = this.xScales_[id];
      series = this.seriesOfXScaleMap_[goog.getUid(scale)];
      // we can crash or warn user here if the scale is stacked, if we want.
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        for (i = 0; i < series.length; i++) {
          aSeries = series[i];
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            value = iterator.get('x');
            if (goog.isDef(value))
              scale.extendDataRange(value);
          }
        }
      }
      // categorise series data if needed.
      categories = scale.getCategorisation();
      for (i = 0; i < series.length; i++)
        series[i].categoriseData(categories);
    }

    // calculate non-stacked y scales.
    for (i = 0; i < yScalesToCalc.length; i++) {
      scale = yScalesToCalc[i];
      series = this.seriesOfYScaleMap_[goog.getUid(scale)];
      if (scale.stackMode() == anychart.scales.StackMode.PERCENT) {
        var hasPositive = false;
        var hasNegative = false;
        for (j = 0; j < series.length; j++) {
          aSeries = series[j];
          if (aSeries.supportsStack()) {
            iterator = aSeries.getResetIterator();
            while (iterator.advance()) {
              values = aSeries.getReferenceScaleValues();
              if (values) {
                for (var k = values.length; k--;) {
                  if ((/** @type {number} */(values[k])) > 0)
                    hasPositive = true;
                  else if ((/** @type {number} */(values[k])) < 0)
                    hasNegative = true;
                }
              }
            }
          }
        }
        scale.extendDataRange(0);
        if (hasPositive || (!hasPositive && !hasNegative))
          scale.extendDataRange(100);
        if (hasNegative)
          scale.extendDataRange(-100);
      } else {
        for (j = 0; j < series.length; j++) {
          aSeries = series[j];
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            values = aSeries.getReferenceScaleValues();
            if (values)
              scale.extendDataRange.apply(scale, values);
          }
        }
      }
    }

    // calculate stacked y scales.
    for (id in this.seriesOfStackedScaleMap_) {
      series = this.seriesOfStackedScaleMap_[id];
      scale = this.yScales_[id];
      xScales = {};
      for (i = 0; i < series.length; i++) {
        xId = goog.getUid(series[i].xScale());
        if (xId in xScales)
          xScales[xId].push(series[i]);
        else
          xScales[xId] = [series[i]];
      }
      for (xId in xScales) {
        xScale = this.xScales_[xId];
        var cats = xScale.getCategorisation();
        var pointCallback = goog.bind(
            function(series) {
              var values = series.getReferenceScaleValues();
              var i;
              if (values) {
                if (series.supportsStack()) {
                  for (i = values.length; i--;)
                    this.extendDataRange(this.applyStacking(values[i]));
                } else {
                  for (i = values.length; i--;)
                    this.extendDataRange(values[i]);
                }
              }
            }, scale);
        var beforePointCallback = goog.bind(
            function() {
              this.resetStack();
            }, scale);
        if (!!cats) {
          syncIterator = new anychart.cartesian.OrdinalIterator(xScales[xId], cats,
              pointCallback, null, beforePointCallback);
        } else {
          syncIterator = new anychart.cartesian.ScatterIterator(xScales[xId],
              pointCallback, null, beforePointCallback);
        }
        while (syncIterator.advance()) {
        }
      }
    }

    anychart.Base.resumeSignalsDispatchingTrue(this.series_);

    this.markConsistent(anychart.ConsistencyState.SCALES);
    this.scalesFinalization_ = true;
  }
};


/**
 * Prepares scale maps.
 * @private
 */
anychart.cartesian.Chart.prototype.makeScaleMaps_ = function() {
  var i;
  var id;
  var count;
  var xScales = {};
  var yScales = {};
  var seriesOfStackedScaleMap = {};
  var seriesOfXScaleMap = {};
  var seriesOfYScaleMap = {};
  var scale;
  var item;

  //search for scales in series
  for (i = 0, count = this.series_.length; i < count; i++) {
    var series = this.series_[i];

    //series X scale
    if (!series.xScale()) {
      series.xScale(/** @type {anychart.scales.Base} */(this.xScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES);
    }
    scale = series.xScale();

    id = goog.getUid(scale);
    xScales[id] = scale;
    if (id in seriesOfXScaleMap)
      seriesOfXScaleMap[id].push(series);
    else
      seriesOfXScaleMap[id] = [series];

    //series Y scale
    if (!series.yScale()) {
      series.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES);
    }
    scale = series.yScale();

    id = goog.getUid(scale);
    if (scale.stackMode() == anychart.scales.StackMode.VALUE) {
      if (id in seriesOfStackedScaleMap)
        seriesOfStackedScaleMap[id].push(series);
      else
        seriesOfStackedScaleMap[id] = [series];
    }
    yScales[id] = scale;
    if (id in seriesOfYScaleMap)
      seriesOfYScaleMap[id].push(series);
    else
      seriesOfYScaleMap[id] = [series];

  }

  for (i = 0, count = this.xAxes_.length; i < count; i++) {
    item = this.xAxes_[i];
    if (!item.scale())
      item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
  }

  for (i = 0, count = this.yAxes_.length; i < count; i++) {
    item = this.yAxes_[i];
    if (!item.scale())
      item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
  }

  var directionBasedElements = goog.array.concat(
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.grids_,
      this.minorGrids_);

  for (i = 0, count = directionBasedElements.length; i < count; i++) {
    item = directionBasedElements[i];

    if (!item.scale()) {
      if (item.isHorizontal()) {
        item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
      } else {
        item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
      }
    }
  }

  this.seriesOfStackedScaleMap_ = seriesOfStackedScaleMap;
  this.yScales_ = yScales;
  this.xScales_ = xScales;
  this.seriesOfXScaleMap_ = seriesOfXScaleMap;
  this.seriesOfYScaleMap_ = seriesOfYScaleMap;
};


/**
 * Распределяет Column и Bar серии по ширине категорий
 * @private
 */
anychart.cartesian.Chart.prototype.distributeSeries_ = function() {
  /** @type {number} */
  var i;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.cartesian.series.Base>} */
  var series;
  /** @type {anychart.cartesian.series.Base} */
  var aSeries;
  /** @type {number} */
  var id;
  /** @type {number} */
  var xId;
  var wSeries;
  var seenScales;
  var currPosition;
  var barWidthRatio;
  var numColumnClusters;
  var numBarClusters;
  var seenScalesWithColumns;
  var seenScalesWithBars;
  // Делаем разведение column и bar серий по ширине категории для всех Х категорий
  for (xId in this.seriesOfXScaleMap_) {
    // Если это не ординальная шкала, то все и так ок
    if (!this.xScales_[xId].getCategorisation())
      continue;
    series = this.seriesOfXScaleMap_[xId];
    // Задача - посчитать количество column и bar кластеров.
    // За один column кластер считается каждая column серия, если ее шкала без стэка,
    // либо все серии стэкированной шкалы, если на ней есть хотя бы один колумн.
    // За один bar кластер считается каждая bar серия, если ее шкала без стэка,
    // либо все bar серии стэкированной шкалы, если на ней есть хотя бы один bar.
    numColumnClusters = 0;
    numBarClusters = 0;
    seenScalesWithColumns = {};
    seenScalesWithBars = {};
    for (i = 0; i < series.length; i++) {
      aSeries = series[i];
      scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
      id = goog.getUid(scale);
      if (aSeries instanceof anychart.cartesian.series.BarBase) {
        if (scale.stackMode() == anychart.scales.StackMode.NONE) {
          numBarClusters++;
        } else {
          if (!(id in seenScalesWithBars)) {
            numBarClusters++;
            seenScalesWithBars[id] = true;
          }
        }
      } else if (aSeries instanceof anychart.cartesian.series.WidthBased) {
        if (scale.stackMode() == anychart.scales.StackMode.NONE) {
          numColumnClusters++;
        } else {
          if (!(id in seenScalesWithColumns)) {
            numColumnClusters++;
            seenScalesWithColumns[id] = true;
          }
        }
      }
    }
    if (numColumnClusters > 0) {
      numColumnClusters = numColumnClusters + (numColumnClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
      barWidthRatio = 1 / numColumnClusters;
      currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
      seenScales = {};
      for (i = 0; i < series.length; i++) {
        wSeries = /** @type {anychart.cartesian.series.WidthBased} */(series[i]);
        if (wSeries instanceof anychart.cartesian.series.WidthBased && !(wSeries instanceof anychart.cartesian.series.BarBase)) {
          scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
          if (scale.stackMode() == anychart.scales.StackMode.NONE) {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoBarWidth(barWidthRatio);
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          } else {
            id = goog.getUid(scale);
            if (id in seenScales) {
              wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
            } else {
              wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
              seenScales[id] = currPosition;
              currPosition += barWidthRatio * (1 + this.barsPadding_);
            }
          }
        }
      }
    }
    if (numBarClusters > 0) {
      numBarClusters = numBarClusters + (numBarClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
      barWidthRatio = 1 / numBarClusters;
      currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
      seenScales = {};
      for (i = 0; i < series.length; i++) {
        wSeries = /** @type {anychart.cartesian.series.Bar} */(series[i]);
        if (wSeries instanceof anychart.cartesian.series.BarBase) {
          scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
          if (scale.stackMode() == anychart.scales.StackMode.NONE) {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoBarWidth(barWidthRatio);
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          } else {
            id = goog.getUid(scale);
            if (id in seenScales) {
              wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
            } else {
              wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
              seenScales[id] = currPosition;
              currPosition += barWidthRatio * (1 + this.barsPadding_);
            }
          }
        }
      }
    }
  }
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.cartesian.Chart.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i] instanceof anychart.cartesian.series.Bubble)
      /** @type {anychart.cartesian.series.Bubble} */(this.series_[i]).calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i] instanceof anychart.cartesian.series.Bubble)
      /** @type {anychart.cartesian.series.Bubble} */(this.series_[i]).setAutoSizeScale(minMax[0], minMax[1]);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Геттер-сеттер для палитры цветов серий.
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value .
 * @return {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|anychart.cartesian.Chart)} .
 */
anychart.cartesian.Chart.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.utils.RangeColorPalette) {
    this.setupPalette_(anychart.utils.RangeColorPalette, opt_value);
    return this;
  } else if (opt_value instanceof anychart.utils.DistinctColorPalette) {
    this.setupPalette_(anychart.utils.DistinctColorPalette, opt_value);
    return this;
  }

  if (!this.palette_)
    this.setupPalette_(anychart.utils.DistinctColorPalette);

  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value))
      this.palette_.colors(opt_value);
    else if (goog.isNull(opt_value))
      this.palette_.cloneFrom(opt_value);
    else
      return this;
    return this;
  }
  return /** @type {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.cartesian.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
  } else {
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.cartesian.Chart.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();
  if (this.scalesFinalization_) {
    var scale;
    var scalesChanged = false;
    for (i in this.xScales_) {
      scale = this.xScales_[i];
      if (scale.needsAutoCalc())
        scalesChanged |= scale.finishAutoCalc();
    }
    for (i in this.yScales_) {
      scale = this.yScales_[i];
      if (scale.needsAutoCalc())
        scalesChanged |= scale.finishAutoCalc();
    }
    this.scalesFinalization_ = false;
    if (scalesChanged) {
      this.invalidateSeries_();
    }
  }

  if (this.isConsistent())
    return;

  anychart.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

  if (this.hasInvalidationState(anychart.ConsistencyState.PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().colorAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.PALETTE);
  }

  //total bounds of content area
  var contentAreaBounds = bounds.clone();
  //bounds of content area with subtracted axes bounds
  var boundsWithoutAxes = bounds.clone();

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //axes local vars
    var remainingBounds;
    var axis;
    var orientation;
    var topOffset = 0;
    var bottomOffset = 0;
    var leftOffset = 0;
    var rightOffset = 0;

    for (i = axes.length; i--;) {
      axis = axes[i];
      if (axis.enabled()) {
        axis.parentBounds(contentAreaBounds);

        remainingBounds = axis.getRemainingBounds(); ////НАГРУЗКА!!!!!!!!!!
        orientation = axis.orientation();

        if (orientation == anychart.utils.Orientation.TOP) {
          axis.offsetY(topOffset);
          topOffset += contentAreaBounds.height - remainingBounds.height;
        } else if (orientation == anychart.utils.Orientation.BOTTOM) {
          axis.offsetY(bottomOffset);
          bottomOffset += contentAreaBounds.height - remainingBounds.height;
        } else if (orientation == anychart.utils.Orientation.LEFT) {
          axis.offsetX(leftOffset);
          leftOffset += contentAreaBounds.width - remainingBounds.width;
        } else if (orientation == anychart.utils.Orientation.RIGHT) {
          axis.offsetX(rightOffset);
          rightOffset += contentAreaBounds.width - remainingBounds.width;
        }
      }
    }

    boundsWithoutAxes.left += leftOffset;
    boundsWithoutAxes.top += topOffset;
    boundsWithoutAxes.width -= rightOffset + leftOffset;
    boundsWithoutAxes.height -= bottomOffset + topOffset;

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone();

    for (i = this.series_.length; i--;) {
      this.series_[i].pixelBounds(this.dataBounds_);
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.GRIDS);
    this.invalidate(anychart.ConsistencyState.SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      grid.suspendSignalsDispatching();
      grid.parentBounds(this.dataBounds_);
      grid.container(this.rootElement);
      grid.draw(); ////НАГРУЗКА!!!!!!!!!!
      grid.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES)) {
    for (i = 0, count = axes.length; i < count; i++) {
      axis = axes[i];
      axis.suspendSignalsDispatching();
      axis.container(this.rootElement);
      if (axis.isHorizontal()) {
        axis.offsetX(leftOffset);
        axis.length(parseFloat(this.dataBounds_.width));
      } else {
        axis.offsetY(topOffset);
        axis.length(parseFloat(this.dataBounds_.height));
      }
      axis.draw(); ////НАГРУЗКА!!!!!!!!!!
      axis.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (i = 0, count = markers.length; i < count; i++) {
      var axesMarker = markers[i];
      axesMarker.suspendSignalsDispatching();
      axesMarker.parentBounds(this.dataBounds_);
      axesMarker.container(this.rootElement);
      axesMarker.draw(); ////НАГРУЗКА!!!!!!!!!!
      axesMarker.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++)
      this.series_[i].container(this.rootElement);

    this.distributeSeries_();
    this.calcBubbleSizes_();
    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
  }

  anychart.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.cartesian.Chart.prototype.drawSeries_ = function() {
  var i;
  var iterator;
  for (var id in this.xScales_) {
    var scale = this.xScales_[id];
    var yScales = {};
    var yScalePositiveSumms = {};
    var yScaleNegativeSumms = {};
    var series = this.seriesOfXScaleMap_[goog.getUid(scale)];
    for (i = 0; i < series.length; i++) {
      var yUid = goog.getUid(series[i].yScale());
      yScales[yUid] = series[i].yScale();
      yScalePositiveSumms[yUid] = 0;
      yScaleNegativeSumms[yUid] = 0;
    }
    var categories = scale.getCategorisation();
    var pointClb = function(series) {
      series.drawPoint();
    };
    var missingClb = function(series) {
      series.drawMissing();
    };
    var beforeClb = function(activeSeries) {
      var i;
      for (i = activeSeries.length; i--;) {
        var values = activeSeries[i].getReferenceScaleValues();
        if (activeSeries[i].supportsStack() && values) {
          for (var j = values.length; j--;) {
            var value = /** @type {number} */(values[j]);
            if (value >= 0)
              yScalePositiveSumms[goog.getUid(activeSeries[i].yScale())] += value;
            else if (value < 0)
              yScaleNegativeSumms[goog.getUid(activeSeries[i].yScale())] += value;
          }
        }
      }
      for (i in yScales) {
        yScales[i].resetStack();
        yScales[i].setStackRange(yScaleNegativeSumms[i], yScalePositiveSumms[i]);
      }
    };
    var afterClb = function() {
      for (var i in yScales) {
        yScalePositiveSumms[i] = 0;
        yScaleNegativeSumms[i] = 0;
      }
    };
    if (!!categories) {
      iterator = new anychart.cartesian.OrdinalIterator(series, categories, pointClb, missingClb, beforeClb, afterClb);
    } else {
      iterator = new anychart.cartesian.ScatterIterator(series, pointClb, missingClb, beforeClb, afterClb);
    }
    for (i = 0; i < series.length; i++) {
      series[i].startDrawing();
    }
    while (iterator.advance()) {
    }
    for (i = 0; i < series.length; i++)
      series[i].finalizeDrawing();
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.cartesian.Chart.prototype.invalidateWidthBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i] instanceof anychart.cartesian.series.WidthBased)
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.cartesian.Chart.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.Chart.prototype.createLegendItemsProvider = function() {
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.cartesian.series.Base} */
    var series = this.series_[i];
    var seriesName = series.name();
    data.push({
      'index': i,
      'text': seriesName ? seriesName : 'Series: ' + i,
      'iconColor': series.getLegendItemColor()
    });
  }
  return new anychart.utils.LegendItemsProvider(data);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Defaults.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.cartesian.Chart.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');

  var i, count;

  if (this.xAxes_) {
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      this.restoreDefaultsForAxis(this.xAxes_[i]);
    }
  }

  if (this.yAxes_) {
    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      this.restoreDefaultsForAxis(this.yAxes_[i]);
    }
  }
};


/**
 * Restore default axis settings.
 * @protected
 * @param {anychart.elements.Axis} axis Axis to restore settings.
 */
anychart.cartesian.Chart.prototype.restoreDefaultsForAxis = function(axis) {
  axis.suspendSignalsDispatching();
  axis.drawFirstLabel(true);
  axis.drawLastLabel(true);

  var title = /** @type {anychart.elements.Title} */(axis.title());
  title.margin(10, 0, 10, 0);
  title.padding(0, 0, 0, 0);

  var majorLabels = /** @type {anychart.elements.Multilabel} */(axis.labels());

  var majorTicks = /** @type {anychart.elements.Ticks} */(axis.ticks());
  majorTicks.length(5);

  var minorLabels = /** @type {anychart.elements.Multilabel} */(axis.minorLabels());
  minorLabels.enabled(false);

  var minorTicks = /** @type {anychart.elements.Ticks} */(axis.minorTicks());
  minorTicks.length(2);

  axis.resumeSignalsDispatching(true);
};


/**
 * @inheritDoc
 */
anychart.cartesian.Chart.prototype.deserialize = function(config) {
  var chart = config['chart'];

  debugger;
  if (!chart) return this;
  goog.base(this, 'deserialize', config);

  this.suspendSignalsDispatching();
  var i;
  var grids = chart['grids'];
  var minorGrids = chart['minorGrids'];
  var xAxes = chart['xAxes'];
  var yAxes = chart['yAxes'];
  var lineAxesMarkers = chart['lineAxesMarkers'];
  var rangeAxesMarkers = chart['rangeAxesMarkers'];
  var textAxesMarkers = chart['textAxesMarkers'];
  var series = chart['series'];
  var barGroupsPadding = chart['barGroupsPadding'];
  var barsPadding = chart['barsPadding'];


  if (grids) {
    for (i = 0; i < grids.length; i++) {
      this.grid(grids[i]);
    }
  }

  if (minorGrids) {
    for (i = 0; i < minorGrids.length; i++) {
      this.minorGrid(minorGrids[i]);
    }
  }

  if (xAxes) {
    for (i = 0; i < xAxes.length; i++) {
      this.xAxis(xAxes[i]);
    }
  }

  if (yAxes) {
    for (i = 0; i < yAxes.length; i++) {
      this.yAxis(yAxes[i]);
    }
  }

  if (lineAxesMarkers) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      this.lineMarker(lineAxesMarkers[i]);
    }
  }

  if (rangeAxesMarkers) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      this.rangeMarker(rangeAxesMarkers[i]);
    }
  }

  if (textAxesMarkers) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      this.textMarker(textAxesMarkers[i]);
    }
  }

  if (series) {
    for (i = 0; i < series.length; i++) {
      var s = series[i];
      var seriesType = s['seriesType'].toLowerCase();
      var data = s['data'];
      var seriesInst;

      switch (seriesType) {
        case 'area':
          seriesInst = this.area(data);
          break;
        case 'bar':
          seriesInst = this.bar(data);
          break;
        case 'bubble':
          seriesInst = this.bubble(data);
          break;
        case 'candlestick':
          seriesInst = this.candlestick(data);
          break;
        case 'column':
          seriesInst = this.column(data);
          break;
        case 'line':
          seriesInst = this.line(data);
          break;
        case 'marker':
          seriesInst = this.marker(data);
          break;
        case 'ohlc':
          seriesInst = this.ohlc(data);
          break;
        case 'rangearea':
          seriesInst = this.rangeArea(data);
          break;
        case 'rangebar':
          seriesInst = this.rangeBar(data);
          break;
        case 'rangecolumn':
          seriesInst = this.rangeColumn(data);
          break;
        case 'rangesplinearea':
          seriesInst = this.rangeSplineArea(data);
          break;
        case 'rangesteplinearea':
          seriesInst = this.rangeStepLineArea(data);
          break;
        case 'spline':
          seriesInst = this.spline(data);
          break;
        case 'splinearea':
          seriesInst = this.splineArea(data);
          break;
        case 'stepline':
          seriesInst = this.stepLine(data);
          break;
        case 'ateplinearea':
          seriesInst = this.stepLineArea(data);
          break;
      }
      seriesInst.deserialize(s);
    }
  }

  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * @inheritDoc
 */
anychart.cartesian.Chart.prototype.serialize = function() {
  var json = {};
  var chart = goog.base(this, 'serialize');
  var i;

  chart['type'] = 'cartesian';

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    grids.push(this.grids_[i].serialize());
  }
  chart['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    minorGrids.push(this.minorGrids_[i].serialize());
  }
  chart['minorGrids'] = minorGrids;

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    xAxes.push(this.xAxes_[i].serialize());
  }
  chart['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    yAxes.push(this.yAxes_[i].serialize());
  }
  chart['yAxes'] = yAxes;

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    lineAxesMarkers.push(this.lineAxesMarkers_[i].serialize());
  }
  chart['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    rangeAxesMarkers.push(this.rangeAxesMarkers_[i].serialize());
  }
  chart['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    textAxesMarkers.push(this.textAxesMarkers_[i].serialize());
  }
  chart['textAxesMarkers'] = textAxesMarkers;

  var series = [];
  for (i = 0; i < this.series_.length; i++) {
    series.push(this.series_[i].serialize());
  }
  chart['series'] = series;

  chart['barGroupsPadding'] = this.barGroupsPadding_;
  chart['barsPadding'] = this.barsPadding_;

  json['chart'] = chart;

  return json;
};
