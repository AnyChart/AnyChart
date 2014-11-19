goog.provide('anychart.scatter.Chart');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.Chart');
goog.require('anychart.elements.Axis');
goog.require('anychart.elements.Grid');
goog.require('anychart.elements.LineMarker');
goog.require('anychart.elements.RangeMarker');
goog.require('anychart.elements.TextMarker');
goog.require('anychart.enums');
goog.require('anychart.scales');
goog.require('anychart.scatter.series.Base');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.HatchFillPalette');
goog.require('anychart.utils.MarkerPalette');
goog.require('anychart.utils.RangeColorPalette');



/**
 * Scatter chart class.<br/>
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.scatter.Chart = function() {
  goog.base(this);

  /**
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.yScale_ = null;

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
   * Palette for series colors.
   * @type {anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.utils.MarkerPalette}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.utils.HatchFillPalette}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * @type {!Array.<anychart.scatter.series.Base>}
   * @private
   */
  this.series_ = [];
};
goog.inherits(anychart.scatter.Chart, anychart.Chart);


/**
 * @type {string}
 */
anychart.scatter.Chart.CHART_TYPE = 'scatter';
anychart.chartTypesMap[anychart.scatter.Chart.CHART_TYPE] = anychart.scatter.Chart;


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @private
 */
anychart.scatter.Chart.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.scatter.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SCALES |
    anychart.ConsistencyState.GRIDS |
    anychart.ConsistencyState.AXES |
    anychart.ConsistencyState.AXES_MARKERS |
    anychart.ConsistencyState.PALETTE |
    anychart.ConsistencyState.MARKER_PALETTE |
    anychart.ConsistencyState.HATCH_FILL_PALETTE |
    anychart.ConsistencyState.SERIES;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_GRID = 10;


/**
 * Axis range marker z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_AXIS_RANGE_MARKER = 25.1;


/**
 * Axis line marker z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_AXIS_LINE_MARKER = 25.2;


/**
 * Axis text marker z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_AXIS_TEXT_MARKER = 25.3;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_LINE_SERIES = 31;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_AXIS = 35;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.scatter.Chart.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Sets default scale for layout based element.
 * @param {anychart.elements.LineMarker|anychart.elements.RangeMarker|anychart.elements.TextMarker|anychart.elements.Grid} item Item to set scale.
 * @private
 */
anychart.scatter.Chart.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (item.isHorizontal()) {
    item.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
  } else {
    item.scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
  }
};


/**
 * @ignoreDoc
 * @param {anychart.scales.ScatterBase=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.scatter.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.scatter.Chart.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Linear();
    }
    return this.xScale_;
  }
};


/**
 * @ignoreDoc
 * @param {anychart.scales.ScatterBase=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.scatter.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.scatter.Chart.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
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


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.Grid|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.elements.Grid|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.elements.Grid|anychart.scatter.Chart)} Grid instance by index or itself for method chaining.
 */
anychart.scatter.Chart.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.elements.Grid();
    grid.layout(anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(anychart.scatter.Chart.ZINDEX_GRID);
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Grid) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.scatter.Chart.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.scatter.Chart.ZINDEX_GRID);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.Grid|Object|string|null)=} opt_indexOrValue Minor grid settings.
 * @param {(anychart.elements.Grid|Object|string|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.elements.Grid|anychart.scatter.Chart)} Minor grid instance by index or itself for method chaining.
 */
anychart.scatter.Chart.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.elements.Grid();
    grid.layout(anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(anychart.scatter.Chart.ZINDEX_GRID);
    grid.isMinor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Grid) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.scatter.Chart.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.scatter.Chart.ZINDEX_GRID);
    } else if (anychart.utils.isNone(value)) {
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
anychart.scatter.Chart.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.Axis|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.elements.Axis|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.elements.Axis|anychart.scatter.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.scatter.Chart.prototype.xAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var axis = this.xAxes_[index];
  if (!axis) {
    axis = new anychart.elements.Axis();
    axis.orientation(anychart.enums.Orientation.BOTTOM);
    axis.zIndex(anychart.scatter.Chart.ZINDEX_AXIS);
    axis.title().text('X-Axis');
    this.xAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Axis) {
      axis.deserialize(value.serialize());
      if (axis.zIndex() == 0) axis.zIndex(anychart.scatter.Chart.ZINDEX_AXIS);
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
      if (axis.zIndex() == 0) axis.zIndex(anychart.scatter.Chart.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.Axis|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.elements.Axis|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.elements.Axis|anychart.scatter.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.scatter.Chart.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.elements.Axis();
    axis.staggerMode(false);
    axis.orientation(anychart.enums.Orientation.LEFT);
    axis.zIndex(anychart.scatter.Chart.ZINDEX_AXIS);
    axis.title().text('Y-Axis');
    this.yAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.Axis) {
      axis.deserialize(value.serialize());
      if (axis.zIndex() == 0) axis.zIndex(anychart.scatter.Chart.ZINDEX_AXIS);
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
      if (axis.zIndex() == 0) axis.zIndex(anychart.scatter.Chart.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(value)) {
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
anychart.scatter.Chart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.LineMarker|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.elements.LineMarker|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.elements.LineMarker|anychart.scatter.Chart)} Line marker instance by index or itself for method chaining.
 */
anychart.scatter.Chart.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.elements.LineMarker();
    lineMarker.layout(anychart.enums.Layout.HORIZONTAL);
    lineMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_LINE_MARKER);
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.LineMarker) {
      lineMarker.deserialize(value.serialize());
      if (lineMarker.zIndex() == 0) lineMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_LINE_MARKER);
    } else if (goog.isObject(value)) {
      lineMarker.deserialize(value);
      if (lineMarker.zIndex() == 0) lineMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_LINE_MARKER);
    } else if (anychart.utils.isNone(value)) {
      lineMarker.enabled(false);
    }
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.RangeMarker|Object|string|null)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(anychart.elements.RangeMarker|Object|string|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.elements.RangeMarker|anychart.scatter.Chart)} Range marker instance by index or itself for chaining call.
 */
anychart.scatter.Chart.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.elements.RangeMarker();
    rangeMarker.layout(anychart.enums.Layout.HORIZONTAL);
    rangeMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_RANGE_MARKER);
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.RangeMarker) {
      rangeMarker.deserialize(value.serialize());
      if (rangeMarker.zIndex() == 0) rangeMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_RANGE_MARKER);
    } else if (goog.isObject(value)) {
      rangeMarker.deserialize(value);
      if (rangeMarker.zIndex() == 0) rangeMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_RANGE_MARKER);
    } else if (anychart.utils.isNone(value)) {
      rangeMarker.enabled(false);
    }
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * @ignoreDoc
 * @param {(number|anychart.elements.TextMarker|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.elements.TextMarker|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.elements.TextMarker|anychart.scatter.Chart)} Line marker instance by index or itself for chaining call.
 */
anychart.scatter.Chart.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.elements.TextMarker();
    textMarker.layout(anychart.enums.Layout.HORIZONTAL);
    textMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_TEXT_MARKER);
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.TextMarker) {
      textMarker.deserialize(value.serialize());
      if (textMarker.zIndex() == 0) textMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_TEXT_MARKER);
    } else if (goog.isObject(value)) {
      textMarker.deserialize(value);
      if (textMarker.zIndex() == 0) textMarker.zIndex(anychart.scatter.Chart.ZINDEX_AXIS_TEXT_MARKER);
    } else if (anychart.utils.isNone(value)) {
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
anychart.scatter.Chart.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @ignoreDoc
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value .
 * @return {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|anychart.scatter.Chart)} .
 */
anychart.scatter.Chart.prototype.palette = function(opt_value) {
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
anychart.scatter.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
  } else {
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
    this.palette_.listenSignals(this.onPaletteSignal_, this);
    this.registerDisposable(this.palette_);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scatter.Chart.prototype.onPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart markers palette settings.
 * @param {(Array.<anychart.enums.MarkerType>|Object|anychart.utils.MarkerPalette)=} opt_value Chart marker palette settings to set.
 * @return {anychart.utils.MarkerPalette|anychart.scatter.Chart} Return current chart markers palette or itself for chaining call.
 */
anychart.scatter.Chart.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.utils.MarkerPalette();
    this.markerPalette_.listenSignals(this.onMarkerPaletteSignal_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.MarkerPalette) {
      this.markerPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markerPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.markerPalette_.markers(opt_value);
    }
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scatter.Chart.prototype.onMarkerPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKER_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.utils.HatchFillPalette)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {anychart.utils.HatchFillPalette|anychart.scatter.Chart} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.scatter.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.utils.HatchFillPalette();
    this.hatchFillPalette_.listenSignals(this.onHatchFillPaletteSignal_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.HatchFillPalette) {
      this.hatchFillPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hatchFillPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.hatchFillPalette_.hatchFills(opt_value);
    }
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scatter.Chart.prototype.onHatchFillPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HATCH_FILL_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Adds Bubble series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.scatter.series.Base} {@link anychart.scatter.series.Bubble} instance for method chaining.
 */
anychart.scatter.Chart.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesTypes.BUBBLE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.scatter.series.Base} {@link anychart.scatter.series.Line} instance for method chaining.
 */
anychart.scatter.Chart.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesTypes.LINE,
      data,
      opt_csvSettings,
      anychart.scatter.Chart.ZINDEX_LINE_SERIES
  );
};


/**
 * Adds Marker series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.scatter.series.Base} {@link anychart.scatter.series.Marker} instance for method chaining.
 */
anychart.scatter.Chart.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesTypes.MARKER,
      data,
      opt_csvSettings
  );
};


/**
 * @param {string} type Series type.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @param {number=} opt_zIndex Optional series zIndex.
 * @private
 * @return {anychart.scatter.series.Base}
 */
anychart.scatter.Chart.prototype.createSeriesByType_ = function(type, data, opt_csvSettings, opt_zIndex) {
  var ctl = anychart.scatter.series.Base.SeriesTypesMap[/** @type {anychart.enums.ScatterSeriesTypes} */(type)];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    this.registerDisposable(instance);
    this.series_.push(instance);
    var index = this.series_.length - 1;
    var inc = index * anychart.scatter.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index);
    instance.setAutoZIndex((goog.isDef(opt_zIndex) ? opt_zIndex : anychart.scatter.Chart.ZINDEX_SERIES) + inc);
    if (instance.hasMarkers())
      instance.markers().setAutoZIndex(anychart.scatter.Chart.ZINDEX_MARKER + inc);
    instance.labels().setAutoZIndex(anychart.scatter.Chart.ZINDEX_LABEL + inc + anychart.scatter.Chart.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.clip(true);
    instance.setAutoColor(this.palette().colorAt(this.series_.length - 1));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(this.series_.length - 1)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(this.series_.length - 1)));
    instance.restoreDefaults();
    instance.listenSignals(this.onSeriesSignal_, this);
    this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
  }

  return instance;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scatter.Chart.prototype.onSeriesSignal_ = function(event) {
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


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.scatter.Chart.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
};


/**
 * Getter series by index.
 * @param {number} index
 * @return {anychart.scatter.series.Base}
 */
anychart.scatter.Chart.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/** @inheritDoc */
anychart.scatter.Chart.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.elements.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.scatter.series.Base} */
    var series = this.series_[i];
    data.push(series.getLegendItemData());
  }

  return data;
};


/**
 * Calculate scatter chart properties.
 */
anychart.scatter.Chart.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {number} */
  var count;

  /** @type {anychart.scales.ScatterBase} */
  var scale;

  /** @type {anychart.scatter.series.Base} */
  var aSeries;
  /** @type {anychart.data.Iterator} */
  var iterator;

  /** @type {number} */
  var id;

  /** @type {anychart.scales.ScatterBase} */
  var xScale;

  /** @type {anychart.scales.ScatterBase} */
  var yScale;

  /** @type {!Array.<anychart.scales.ScatterBase>} */
  var scales = [];

  /** @type {*} */
  var x;
  /** @type {*} */
  var y;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
    anychart.Base.suspendSignalsDispatching(this.series_);

    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];

      if (!aSeries.xScale()) {
        aSeries.xScale(/** @type {anychart.scales.ScatterBase} */ (this.xScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SERIES);
      }
      scale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      id = goog.getUid(scale);
      scales[id] = scale;

      if (!aSeries.yScale()) {
        aSeries.yScale(/** @type {anychart.scales.ScatterBase} */ (this.yScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SERIES);
      }
      scale = /** @type {anychart.scales.ScatterBase} */ (aSeries.yScale());
      id = goog.getUid(scale);
      scales[id] = scale;
    }

    for (id in scales) {
      scale = scales[id];
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
      }
    }

    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];
      xScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      yScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.yScale());

      iterator = aSeries.getResetIterator();

      while (iterator.advance()) {
        x = iterator.get('x');
        y = iterator.get('value');
        if (goog.isDef(x))
          xScale.extendDataRange(x);
        if (goog.isDef(y))
          yScale.extendDataRange(y);
      }
    }

    var scalesChanged = false;
    for (id in scales) {
      scale = scales[id];
      if (scale.needsAutoCalc()) {
        scalesChanged |= scale.finishAutoCalc();
      }
    }

    if (scalesChanged) {
      this.invalidateSeries_();
    }

    var max = -Infinity;
    var min = Infinity;
    var sum = 0;
    var pointsCount = 0;

    for (i = 0; i < this.series_.length; i++) {
      //----------------------------------calc statistics for series
      aSeries = this.series_[i];
      aSeries.calculateStatistics();
      max = Math.max(max, /** @type {number} */(aSeries.statistics('seriesMax')));
      min = Math.min(min, /** @type {number} */ (aSeries.statistics('seriesMin')));
      sum += /** @type {number} */(aSeries.statistics('seriesSum'));
      pointsCount += /** @type {number} */(aSeries.statistics('seriesPointsCount'));
      //----------------------------------end calc statistics for series
    }

    //----------------------------------calc statistics for series
    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
    var average = sum / pointsCount;
    for (i = 0; i < this.series_.length; i++) {
      aSeries = this.series_[i];
      aSeries.statistics('max', max);
      aSeries.statistics('min', min);
      aSeries.statistics('sum', sum);
      aSeries.statistics('average', average);
      aSeries.statistics('pointsCount', pointsCount);
    }
    //----------------------------------end calc statistics for series

    anychart.Base.resumeSignalsDispatchingTrue(this.series_);

    this.markConsistent(anychart.ConsistencyState.SCALES);
  }
};


/**
 * Draw scatter chart content items.
 * @param {anychart.math.Rect} bounds Bounds of scatter content area.
 */
anychart.scatter.Chart.prototype.drawContent = function(bounds) {
  var i;
  var count;

  this.calculate();

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

  if (this.hasInvalidationState(anychart.ConsistencyState.MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.HATCH_FILL_PALETTE);
  }

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES)) {
    var item;
    for (i = this.xAxes_.length; i--;) {
      item = this.xAxes_[i];
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
    }

    for (i = this.yAxes_.length; i--;) {
      item = this.yAxes_[i];
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
    }
  }

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);
  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone().round();
    var attempt = 0;

    do {
      //axes local vars
      var remainingBounds;
      var axis;
      var orientation;
      var topOffset = 0;
      var bottomOffset = 0;
      var leftOffset = 0;
      var rightOffset = 0;
      var complete = true;
      var boundsWithoutAxes = bounds.clone();
      this.topAxisPadding_ = NaN;
      this.bottomAxisPadding_ = NaN;
      this.leftAxisPadding_ = NaN;
      this.rightAxisPadding_ = NaN;

      for (i = axes.length; i--;) {
        axis = axes[i];
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          axis.parentBounds(contentAreaBounds);
          orientation = axis.orientation();

          if (orientation == anychart.enums.Orientation.TOP) {
            axis.offsetY(topOffset);
            remainingBounds = axis.getRemainingBounds();
            topOffset += contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.topAxisPadding_))
              this.topAxisPadding_ = acgraph.vector.getThickness(axis.stroke());
          } else if (orientation == anychart.enums.Orientation.BOTTOM) {
            axis.offsetY(bottomOffset);
            remainingBounds = axis.getRemainingBounds();
            bottomOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.bottomAxisPadding_))
              this.bottomAxisPadding_ = acgraph.vector.getThickness(axis.stroke());
          } else if (orientation == anychart.enums.Orientation.LEFT) {
            axis.offsetX(leftOffset);
            remainingBounds = axis.getRemainingBounds();
            leftOffset += contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.leftAxisPadding_))
              this.leftAxisPadding_ = acgraph.vector.getThickness(axis.stroke());
          } else if (orientation == anychart.enums.Orientation.RIGHT) {
            axis.offsetX(rightOffset);
            remainingBounds = axis.getRemainingBounds();
            rightOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.rightAxisPadding_))
              this.rightAxisPadding_ = acgraph.vector.getThickness(axis.stroke());
          }
          axis.resumeSignalsDispatching(false);
        }
      }

      boundsWithoutAxes.left += leftOffset;
      boundsWithoutAxes.top += topOffset;
      boundsWithoutAxes.width -= rightOffset + leftOffset;
      boundsWithoutAxes.height -= bottomOffset + topOffset;

      for (i = axes.length; i--;) {
        axis = axes[i];
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          var remainingBoundsBeforeSetLength = axis.getRemainingBounds();
          if (axis.isHorizontal()) {
            axis.length(parseFloat(boundsWithoutAxes.width));
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.height != remainingBoundsBeforeSetLength.height) {
              complete = false;
            }
          } else {
            axis.length(parseFloat(boundsWithoutAxes.height));
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.width != remainingBoundsBeforeSetLength.width) {
              complete = false;
            }
          }
          axis.resumeSignalsDispatching(false);
        }
      }
      attempt++;
    } while (!complete && attempt < anychart.scatter.Chart.MAX_ATTEMPTS_AXES_CALCULATION_);

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone().round();

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.AXES);
    this.invalidate(anychart.ConsistencyState.GRIDS);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
    this.invalidate(anychart.ConsistencyState.SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (!grid.scale())
          this.setDefaultScaleForLayoutBasedElements_(grid);
        grid.parentBounds(this.dataBounds_);
        grid.container(this.rootElement);
        grid.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES)) {
    for (i = 0, count = axes.length; i < count; i++) {
      axis = axes[i];
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        if (axis.isHorizontal()) {
          axis.offsetX(leftOffset);
          axis.length(parseFloat(this.dataBounds_.width));
        } else {
          axis.offsetY(topOffset);
          axis.length(parseFloat(this.dataBounds_.height));
        }
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
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
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        if (!axesMarker.scale())
          this.setDefaultScaleForLayoutBasedElements_(axesMarker);
        axesMarker.parentBounds(this.dataBounds_);
        axesMarker.container(this.rootElement);
        axesMarker.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
          this.leftAxisPadding_);
      series.parentBounds(this.dataBounds_);
    }

    this.calcBubbleSizes_();
    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
  }

  anychart.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.scatter.Chart.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].setAutoSizeScale(minMax[0], minMax[1]);
  }
};


/**
 * Renders the series.
 * @private
 */
anychart.scatter.Chart.prototype.drawSeries_ = function() {
  var i;
  var count;
  var iterator;
  var series;
  for (i = 0, count = this.series_.length; i < count; i++) {
    series = this.series_[i];

    series.startDrawing();

    iterator = series.getResetIterator();
    while (iterator.advance()) {
      series.drawPoint();
    }

    series.finalizeDrawing();
  }
};


//exports
anychart.scatter.Chart.prototype['xScale'] = anychart.scatter.Chart.prototype.xScale;
anychart.scatter.Chart.prototype['yScale'] = anychart.scatter.Chart.prototype.yScale;
anychart.scatter.Chart.prototype['grid'] = anychart.scatter.Chart.prototype.grid;
anychart.scatter.Chart.prototype['minorGrid'] = anychart.scatter.Chart.prototype.minorGrid;
anychart.scatter.Chart.prototype['xAxis'] = anychart.scatter.Chart.prototype.xAxis;
anychart.scatter.Chart.prototype['yAxis'] = anychart.scatter.Chart.prototype.yAxis;
anychart.scatter.Chart.prototype['getSeries'] = anychart.scatter.Chart.prototype.getSeries;
anychart.scatter.Chart.prototype['bubble'] = anychart.scatter.Chart.prototype.bubble;
anychart.scatter.Chart.prototype['line'] = anychart.scatter.Chart.prototype.line;
anychart.scatter.Chart.prototype['marker'] = anychart.scatter.Chart.prototype.marker;
anychart.scatter.Chart.prototype['lineMarker'] = anychart.scatter.Chart.prototype.lineMarker;
anychart.scatter.Chart.prototype['rangeMarker'] = anychart.scatter.Chart.prototype.rangeMarker;
anychart.scatter.Chart.prototype['textMarker'] = anychart.scatter.Chart.prototype.textMarker;
anychart.scatter.Chart.prototype['palette'] = anychart.scatter.Chart.prototype.palette;
anychart.scatter.Chart.prototype['markerPalette'] = anychart.scatter.Chart.prototype.markerPalette;
anychart.scatter.Chart.prototype['hatchFillPalette'] = anychart.scatter.Chart.prototype.hatchFillPalette;
