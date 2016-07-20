goog.provide('anychart.charts.Scatter');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.reporting');
goog.require('anychart.core.scatter.series.Base');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.enums');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Scatter chart class.<br/>
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Scatter = function() {
  goog.base(this);

  /**
   * @type {anychart.core.ui.Crosshair}
   * @private
   */
  this.crosshair_ = null;

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
   * @type {Array.<anychart.core.grids.Linear>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>}
   * @private
   */
  this.minorGrids_ = [];

  /**
   * @type {!Array.<anychart.core.axes.Linear>}
   * @private
   */
  this.xAxes_ = [];

  /**
   * @type {!Array.<anychart.core.axes.Linear>}
   * @private
   */
  this.yAxes_ = [];

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
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * @type {!Array.<anychart.core.scatter.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * Max size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.maxBubbleSize_;

  /**
   * Min size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.minBubbleSize_;

  this.defaultSeriesType(anychart.enums.ScatterSeriesType.MARKER);
};
goog.inherits(anychart.charts.Scatter, anychart.core.SeparateChart);


/**
 * Getter/setter for scatter defaultSeriesType.
 * @param {(string|anychart.enums.ScatterSeriesType)=} opt_value Default series type.
 * @return {anychart.charts.Scatter|anychart.enums.ScatterSeriesType} Default series type or self for chaining.
 */
anychart.charts.Scatter.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeScatterSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.getType = function() {
  return anychart.enums.ChartTypes.SCATTER;
};


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @private
 */
anychart.charts.Scatter.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Scatter.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SCATTER_SCALES |
    anychart.ConsistencyState.SCATTER_GRIDS |
    anychart.ConsistencyState.SCATTER_AXES |
    anychart.ConsistencyState.SCATTER_AXES_MARKERS |
    anychart.ConsistencyState.SCATTER_PALETTE |
    anychart.ConsistencyState.SCATTER_MARKER_PALETTE |
    anychart.ConsistencyState.SCATTER_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.SCATTER_SERIES |
    anychart.ConsistencyState.SCATTER_CROSSHAIR;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_LINE_SERIES = 31;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.charts.Scatter.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Getter/setter for x-axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.charts.Scatter.prototype.defaultXAxisSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultXAxisSettings_ = opt_value;
    return this;
  }
  return this.defaultXAxisSettings_ || {};
};


/**
 * Getter/setter for y-axis default settings.
 * @param {Object=} opt_value Object with y-axis settings.
 * @return {Object}
 */
anychart.charts.Scatter.prototype.defaultYAxisSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultYAxisSettings_ = opt_value;
    return this;
  }
  return this.defaultYAxisSettings_ || {};
};


/**
 * Getter/setter for grid default settings.
 * @param {Object=} opt_value Object with grid settings.
 * @return {Object}
 */
anychart.charts.Scatter.prototype.defaultGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultGridSettings_ = opt_value;
    return this;
  }
  return this.defaultGridSettings_ || {};
};


/**
 * Getter/setter for minor grid default settings.
 * @param {Object=} opt_value Object with minor grid settings.
 * @return {Object}
 */
anychart.charts.Scatter.prototype.defaultMinorGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


/**
 * Getter/setter for line marker default settings.
 * @param {Object=} opt_value Object with line marker settings.
 * @return {Object}
 */
anychart.charts.Scatter.prototype.defaultLineMarkerSettings = function(opt_value) {
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
anychart.charts.Scatter.prototype.defaultTextMarkerSettings = function(opt_value) {
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
anychart.charts.Scatter.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


/**
 * Crosshair z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_CROSSHAIR = 41;


/**
 * Sets default scale for layout based element.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.grids.Linear} item Item to set scale.
 * @private
 */
anychart.charts.Scatter.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (item.isHorizontal()) {
    item.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
  } else {
    item.scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Crosshair|anychart.charts.Scatter)}
 */
anychart.charts.Scatter.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.Crosshair();
    this.crosshair_.enabled(false);
    this.crosshair_.zIndex(anychart.charts.Scatter.ZINDEX_CROSSHAIR);
    this.crosshair_.bindHandlers(this);
    this.registerDisposable(this.crosshair_);
    this.crosshair_.listenSignals(this.onCrosshairSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
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
anychart.charts.Scatter.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.SCATTER_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for xScale.
 * @param {(anychart.enums.ScatterScaleTypes|anychart.scales.ScatterBase)=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.Scatter)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Scatter.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.ScatterBase.fromString(opt_value, false);
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales']);
      return this;
    }
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCATTER_SCALES, anychart.Signal.NEEDS_REDRAW);
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
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScatterScaleTypes|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.Scatter)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Scatter.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.ScatterBase.fromString(opt_value, false);
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, ['Scatter chart scales']);
      return this;
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCATTER_SCALES, anychart.Signal.NEEDS_REDRAW);
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
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.Scatter)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Linear();
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for minorGrid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Minor grid settings.
 * @param {(Object|boolean|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.Scatter)} Minor grid instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Linear();
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
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
anychart.charts.Scatter.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.SCATTER_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.Scatter)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.xAxis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.core.axes.Linear();
    axis.setParentEventTarget(this);
    axis.setup(this.defaultXAxisSettings());
    this.xAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * Getter/setter for yAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.Scatter)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis.setParentEventTarget(this);
    axis.setup(this.defaultYAxisSettings());
    this.yAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
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
anychart.charts.Scatter.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.SCATTER_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis by index. First of all goes through x-axes, then y-axes.
 * SAMPLE: if we have 4 x-axes and 3 y-axes, chart.getAxisByIndex(4) will return very first y-axis.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.Linear|undefined}
 */
anychart.charts.Scatter.prototype.getAxisByIndex = function(index) {
  return (index >= this.xAxes_.length) ? this.yAxes_[index - this.xAxes_.length] : this.xAxes_[index];
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.charts.Scatter)} Line marker instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
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
    lineMarker = new anychart.core.axisMarkers.Line();
    lineMarker.setChart(this);
    lineMarker.setup(this.defaultLineMarkerSettings());
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
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
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.charts.Scatter)} Range marker instance by index or itself for chaining call.
 */
anychart.charts.Scatter.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
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
    rangeMarker = new anychart.core.axisMarkers.Range();
    rangeMarker.setChart(this);
    rangeMarker.setup(this.defaultRangeMarkerSettings());
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
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
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart text marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart text marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.charts.Scatter)} Text marker instance by index or itself for chaining call.
 */
anychart.charts.Scatter.prototype.textMarker = function(opt_indexOrValue, opt_value) {
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
    textMarker = new anychart.core.axisMarkers.Text();
    textMarker.setChart(this);
    textMarker.setup(this.defaultTextMarkerSettings());
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.SCATTER_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
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
 * @private
 */
anychart.charts.Scatter.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.SCATTER_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Scatter)} .
 */
anychart.charts.Scatter.prototype.palette = function(opt_value) {
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
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.charts.Scatter.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
    this.palette_.listenSignals(this.onPaletteSignal_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.SCATTER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Scatter.prototype.onPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SCATTER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for markerPalette.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.charts.Scatter)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Scatter.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.onMarkerPaletteSignal_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
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
anychart.charts.Scatter.prototype.onMarkerPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SCATTER_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for hatchFillPalette.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Scatter)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Scatter.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.onHatchFillPaletteSignal_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
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
anychart.charts.Scatter.prototype.onHatchFillPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SCATTER_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Sets max size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Scatter}
 */
anychart.charts.Scatter.prototype.maxBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxBubbleSize_ != opt_value) {
      this.maxBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SCATTER_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxBubbleSize_;
};


/**
 * Sets min size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Scatter}
 */
anychart.charts.Scatter.prototype.minBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.minBubbleSize_ != opt_value) {
      this.minBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SCATTER_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minBubbleSize_;
};


/**
 * Adds Bubble series.
 * @example
 * var chart = anychart.scatterChart();
 * chart.bubble([
 *   [4, 4, 10],
 *   [1, 5, 6],
 *   [2, 6, 17],
 *   [3, 7, 20]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Bubble} instance for method chaining.
 */
anychart.charts.Scatter.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesType.BUBBLE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *   [4, 10],
 *   [1, 6],
 *   [2, 17],
 *   [3, 20]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Line} instance for method chaining.
 */
anychart.charts.Scatter.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesType.LINE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Marker series.
 * @example
 * var chart = anychart.scatterChart();
 * chart.marker([
 *   [4, 10],
 *   [1, 6],
 *   [2, 17],
 *   [3, 20]
 * ]);
 * chart.container(stage).draw();
 @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Marker} instance for method chaining.
 */
anychart.charts.Scatter.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesType.MARKER,
      data,
      opt_csvSettings
  );
};


/**
 * @param {string} type Series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @private
 * @return {anychart.core.scatter.series.Base}
 */
anychart.charts.Scatter.prototype.createSeriesByType_ = function(type, data, opt_csvSettings) {
  type = anychart.enums.normalizeScatterSeriesType(type);
  var ctl = anychart.core.scatter.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    instance.setChart(this);
    instance.setParentEventTarget(this);
    this.registerDisposable(instance);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);
    var inc = index * anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);
    var seriesZIndex = ((type == anychart.enums.ScatterSeriesType.LINE) ?
            anychart.charts.Scatter.ZINDEX_LINE_SERIES :
            anychart.charts.Scatter.ZINDEX_SERIES) + inc;
    instance.setAutoZIndex(seriesZIndex);
    instance.labels().setAutoZIndex(seriesZIndex + anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.clip(true);
    instance.setAutoColor(this.palette().itemAt(index));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    if (instance.supportsMarkers()) {
      instance.markers().setAutoZIndex(seriesZIndex + anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER / 2);
      instance.markers().setAutoFill(instance.getMarkerFill());
      instance.markers().setAutoStroke(instance.getMarkerStroke());
    }
    if (anychart.DEFAULT_THEME != 'v6')
      instance.labels().setAutoColor(anychart.color.darken(instance.color()));
    instance.setup(this.defaultSeriesSettings()[type]);
    instance.listenSignals(this.onSeriesSignal_, this);
    this.invalidate(
        anychart.ConsistencyState.SCATTER_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.SCATTER_SCALES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Scatter.prototype.onSeriesSignal_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SCATTER_SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SCATTER_SERIES;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.SCATTER_SCALES;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
      state |= anychart.ConsistencyState.BOUNDS;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Invalidates APPEARANCE for all size-based series.
 * @private
 */
anychart.charts.Scatter.prototype.invalidateSizeBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Scatter.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


/**
 * Add series to chart.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Chart series data.
 * @return {Array.<anychart.core.scatter.series.Base>} Array of created series.
 */
anychart.charts.Scatter.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType_(type, null));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType_(type, arguments[i]));
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
anychart.charts.Scatter.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.scatter.series.Base} Series instance.
 */
anychart.charts.Scatter.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.scatter.series.Base} Series instance.
 */
anychart.charts.Scatter.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.charts.Scatter.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.charts.Scatter}
 */
anychart.charts.Scatter.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.charts.Scatter}
 */
anychart.charts.Scatter.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.SCATTER_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.SCATTER_SCALES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.charts.Scatter} Self for method chaining.
 */
anychart.charts.Scatter.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.SCATTER_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.SCATTER_SCALES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Scatter.prototype.getAllSeries = function() {
  return this.series_;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.calculate();
  for (i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.core.scatter.series.Base} */
    var series = this.series_[i];
    var itemData = series.getLegendItemData(itemsTextFormatter);
    itemData['sourceUid'] = goog.getUid(this);
    itemData['sourceKey'] = series.index();
    data.push(itemData);
  }
  return data;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.getSeriesStatus = function(event) {
  var bounds = this.dataBounds_ || anychart.math.rect(0, 0, 0, 0);

  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var value, index;

  var containerOffset = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var minX = bounds.left;
  var minY = bounds.top;
  var rangeX = bounds.width;
  var rangeY = bounds.height;

  if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();
    var minRatio = (x - spotRadius - minX) / rangeX;
    var maxRatio = (x + spotRadius - minX) / rangeX;

    var minValue, maxValue;
    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      if (series.enabled()) {
        minValue = /** @type {number} */(series.xScale().inverseTransform(minRatio));
        maxValue = /** @type {number} */(series.xScale().inverseTransform(maxRatio));

        var indexes = series.data().findInRangeByX(minValue, maxValue);
        var iterator = series.getIterator();
        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pixY = /** @type {number} */(iterator.meta('value'));

            var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
            if (length <= spotRadius) {
              ind.push(index);
              if (length < minLength) {
                minLength = length;
                minLengthIndex = index;
              }
            }
          }
        }
        if (ind.length)
          points.push({
            series: series,
            points: ind,
            lastPoint: ind[ind.length - 1],
            nearestPointToCursor: {index: minLengthIndex, distance: minLength}
          });
      }
    }
  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
    var ratio = (x - minX) / rangeX;

    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      value = /** @type {number} */(series.xScale().inverseTransform(ratio));
      index = series.data().findInUnsortedDataByX(value);

      iterator = series.getIterator();
      minLength = Infinity;
      if (index.length) {
        for (j = 0; j < index.length; j++) {
          if (iterator.select(index[j])) {
            pixX = /** @type {number} */(iterator.meta('x'));
            pixY = /** @type {number} */(iterator.meta('value'));

            length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
            if (length < minLength) {
              minLength = length;
              minLengthIndex = index[j];
            }
          }
        }

        points.push({
          series: series,
          points: index,
          lastPoint: index[index.length - 1],
          nearestPointToCursor: {index: minLengthIndex, distance: minLength}
        });
      }
    }
  }

  return /** @type {Array.<Object>} */(points);
};


/**
 * @inheritDoc
 */
anychart.charts.Scatter.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_SCALES)) {
    /** @type {number} */
    var i;
    /** @type {number} */
    var count;

    /** @type {anychart.scales.ScatterBase} */
    var scale;

    /** @type {anychart.core.scatter.series.Base} */
    var aSeries;
    /** @type {anychart.data.Iterator} */
    var iterator;

    /** @type {number} */
    var id;

    /** @type {anychart.scales.ScatterBase} */
    var xScale;

    /** @type {anychart.scales.ScatterBase} */
    var yScale;

    /** @type {!Object.<anychart.scales.ScatterBase>} */
    var scales = {};

    /** @type {*} */
    var x;
    /** @type {*} */
    var y;
    /** @type {Array.<number, number>} */
    var errValues;

    this.statistics = {};

    anychart.core.Base.suspendSignalsDispatching(this.series_);

    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];

      if (!aSeries.xScale()) {
        aSeries.xScale(/** @type {anychart.scales.ScatterBase} */ (this.xScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SCATTER_SERIES);
      }
      scale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      id = goog.getUid(scale);
      scales[id] = scale;

      if (!aSeries.yScale()) {
        aSeries.yScale(/** @type {anychart.scales.ScatterBase} */ (this.yScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SCATTER_SERIES);
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
      if (!aSeries.enabled()) continue;
      xScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      yScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.yScale());

      iterator = aSeries.getResetIterator();

      while (iterator.advance()) {
        x = anychart.utils.toNumber(iterator.get('x'));
        y = anychart.utils.toNumber(iterator.get('value'));
        if (aSeries.supportsError()) {
          errValues = aSeries.getErrorValues(true);
          xScale.extendDataRange(x - errValues[0], x + errValues[1]);
          errValues = aSeries.getErrorValues(false);
          yScale.extendDataRange(y - errValues[0], y + errValues[1]);
        } else {
          xScale.extendDataRange(x);
          yScale.extendDataRange(y);
        }
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
      max = Math.max(max, /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_MAX)));
      min = Math.min(min, /** @type {number} */ (aSeries.statistics(anychart.enums.Statistics.SERIES_MIN)));
      sum += /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_SUM));
      pointsCount += /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT));
      //----------------------------------end calc statistics for series
    }

    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
    var average = sum / pointsCount;
    var ySum = 0;
    var xSum = 0;
    var bubbleSizeSum = 0;
    var bubbleSizeMax = -Infinity;
    var bubbleSizeMin = Infinity;
    var yMax = -Infinity;
    var yMin = Infinity;
    var xMax = -Infinity;
    var xMin = Infinity;
    var maxXSum = -Infinity;
    var minXSum = Infinity;
    var maxYSum = -Infinity;
    var minYSum = Infinity;
    var maxXSeriesName, minXSeriesName;
    var maxXSumSeriesName, minXSumSeriesName;
    var maxYSeriesName, minYSeriesName;
    var maxYSumSeriesName, minYSumSeriesName;
    var isBubble = false;

    for (i = 0; i < this.series_.length; i++) {
      aSeries = this.series_[i];
      var sName = aSeries.name();

      aSeries.statistics(anychart.enums.Statistics.MAX, max);
      aSeries.statistics(anychart.enums.Statistics.MIN, min);
      aSeries.statistics(anychart.enums.Statistics.SUM, sum);
      aSeries.statistics(anychart.enums.Statistics.AVERAGE, average);
      aSeries.statistics(anychart.enums.Statistics.POINTS_COUNT, pointsCount);

      if (aSeries.getType() == anychart.enums.ScatterSeriesType.BUBBLE) {
        isBubble = true;
        var bubSizeSum = aSeries.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM);
        if (!isNaN(bubSizeSum)) bubbleSizeSum += bubSizeSum;
        var bubSizeMax = aSeries.statistics(anychart.enums.Statistics.SERIES_BUBBLE_MAX_SIZE);
        if (!isNaN(bubbleSizeMax)) bubbleSizeMax = Math.max(bubbleSizeMax, bubSizeMax);
        var bubSizeMin = aSeries.statistics(anychart.enums.Statistics.SERIES_BUBBLE_MIN_SIZE);
        if (!isNaN(bubbleSizeMin)) bubbleSizeMin = Math.min(bubbleSizeMin, bubSizeMin);
      }

      var serXMax = /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_X_MAX));
      if (serXMax > xMax) {
        xMax = serXMax;
        maxXSeriesName = sName;
      }

      var serXMin = /** @type {number} */ (aSeries.statistics(anychart.enums.Statistics.SERIES_X_MIN));
      if (serXMin < xMin) {
        xMin = serXMin;
        minXSeriesName = sName;
      }

      var serXSum = /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_X_SUM));
      if (serXSum > maxXSum) {
        maxXSum = serXSum;
        maxXSumSeriesName = sName;
      }

      if (serXSum < minXSum) {
        minXSum = serXSum;
        minXSumSeriesName = sName;
      }

      var serYMax = /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_Y_MAX));
      if (serYMax > yMax) {
        yMax = serYMax;
        maxYSeriesName = sName;
      }

      var serYMin = /** @type {number} */ (aSeries.statistics(anychart.enums.Statistics.SERIES_Y_MIN));
      if (serYMin < yMin) {
        yMin = serYMin;
        minYSeriesName = sName;
      }

      var serYSum = /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
      if (serYSum > maxYSum) {
        maxYSum = serYSum;
        maxYSumSeriesName = sName;
      }

      if (serYSum < minYSum) {
        minYSum = serYSum;
        minYSumSeriesName = sName;
      }

      ySum += serYSum;
      xSum += serXSum;
    }

    this.statistics[anychart.enums.Statistics.DATA_PLOT_Y_SUM] = ySum;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_X_SUM] = xSum;

    this.statistics[anychart.enums.Statistics.DATA_PLOT_Y_MAX] = yMax;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_Y_MIN] = yMin;

    this.statistics[anychart.enums.Statistics.DATA_PLOT_X_MAX] = xMax;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_X_MIN] = xMin;

    this.statistics[anychart.enums.Statistics.DATA_PLOT_X_AVERAGE] = xSum / pointsCount;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE] = ySum / pointsCount;

    this.statistics[anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT] = this.series_.length;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_POINT_COUNT] = pointsCount;

    if (isBubble) {
      this.statistics[anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM] = bubbleSizeSum;
      this.statistics[anychart.enums.Statistics.DATA_PLOT_BUBBLE_MIN_SIZE] = bubbleSizeMin;
      this.statistics[anychart.enums.Statistics.DATA_PLOT_BUBBLE_MAX_SIZE] = bubbleSizeMax;
      this.statistics[anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_AVERAGE] = bubbleSizeSum / pointsCount;
    }

    this.statistics[anychart.enums.Statistics.DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME] = maxXSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME] = minXSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MAX_X_SUM_SERIES_NAME] = maxXSumSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MIN_X_SUM_SERIES_NAME] = minXSumSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME] = maxYSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME] = minYSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME] = maxYSumSeriesName;
    this.statistics[anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME] = minYSumSeriesName;

    anychart.core.Base.resumeSignalsDispatchingTrue(this.series_);

    this.markConsistent(anychart.ConsistencyState.SCATTER_SCALES);
  }
};


/**
 * @inheritDoc
 */
anychart.charts.Scatter.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_);

  var i;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().itemAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SCATTER_SERIES);
    this.markConsistent(anychart.ConsistencyState.SCATTER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SCATTER_SERIES);
    this.markConsistent(anychart.ConsistencyState.SCATTER_MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SCATTER_SERIES);
    this.markConsistent(anychart.ConsistencyState.SCATTER_HATCH_FILL_PALETTE);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
};


/**
 * Draw scatter chart content items.
 * @param {anychart.math.Rect} bounds Bounds of scatter content area.
 */
anychart.charts.Scatter.prototype.drawContent = function(bounds) {
  var i;
  var count;

  anychart.performance.start('Calulation');
  this.calculate();
  anychart.performance.end('Calulation');

  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.SCATTER_AXES)) {
    var item;
    for (i = this.xAxes_.length; i--;) {
      item = this.xAxes_[i];
      item.labels().dropCallsCache();
      item.minorLabels().dropCallsCache();
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
    }

    for (i = this.yAxes_.length; i--;) {
      item = this.yAxes_[i];
      item.labels().dropCallsCache();
      item.minorLabels().dropCallsCache();
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
      var axisStrokeThickness;

      for (i = axes.length; i--;) {
        axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          axis.parentBounds(contentAreaBounds);
          orientation = axis.orientation();
          axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(axis.stroke()));

          if (orientation == anychart.enums.Orientation.TOP) {
            axis.padding().top(topOffset);
            axis.padding().bottom(0);
            remainingBounds = axis.getRemainingBounds();
            topOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.topAxisPadding_))
              this.topAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.BOTTOM) {
            axis.padding().bottom(bottomOffset);
            axis.padding().top(0);
            remainingBounds = axis.getRemainingBounds();
            bottomOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.bottomAxisPadding_))
              this.bottomAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.LEFT) {
            axis.padding().left(leftOffset);
            axis.padding().right(0);
            remainingBounds = axis.getRemainingBounds();
            leftOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.leftAxisPadding_))
              this.leftAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.RIGHT) {
            axis.padding().right(rightOffset);
            axis.padding().left(0);
            remainingBounds = axis.getRemainingBounds();
            rightOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.rightAxisPadding_))
              this.rightAxisPadding_ = axisStrokeThickness;
          }
          axis.resumeSignalsDispatching(false);
        }
      }

      boundsWithoutAxes.left += leftOffset;
      boundsWithoutAxes.top += topOffset;
      boundsWithoutAxes.width -= rightOffset + leftOffset;
      boundsWithoutAxes.height -= bottomOffset + topOffset;

      for (i = axes.length; i--;) {
        axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          var remainingBoundsBeforeSetPadding = axis.getRemainingBounds();

          if (axis.isHorizontal()) {
            axis.padding().left(leftOffset);
            axis.padding().right(rightOffset);
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.height != remainingBoundsBeforeSetPadding.height) {
              complete = false;
            }
          } else {
            axis.padding().top(topOffset);
            axis.padding().bottom(bottomOffset);
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.width != remainingBoundsBeforeSetPadding.width) {
              complete = false;
            }
          }
          axis.resumeSignalsDispatching(false);
        }
      }
      attempt++;
    } while (!complete && attempt < anychart.charts.Scatter.MAX_ATTEMPTS_AXES_CALCULATION_);

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone().round();

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SCATTER_AXES |
        anychart.ConsistencyState.SCATTER_GRIDS |
        anychart.ConsistencyState.SCATTER_AXES_MARKERS |
        anychart.ConsistencyState.SCATTER_SERIES |
        anychart.ConsistencyState.SCATTER_CROSSHAIR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_GRIDS)) {
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
    this.markConsistent(anychart.ConsistencyState.SCATTER_GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_AXES)) {
    for (i = 0, count = axes.length; i < count; i++) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.SCATTER_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_AXES_MARKERS)) {
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
    this.markConsistent(anychart.ConsistencyState.SCATTER_AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
          this.leftAxisPadding_);
      series.parentBounds(this.dataBounds_);
    }

    this.calcBubbleSizes_();
    anychart.performance.start('Series drawing');
    this.drawSeries_();
    anychart.performance.end('Series drawing');
    this.markConsistent(anychart.ConsistencyState.SCATTER_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SCATTER_CROSSHAIR)) {
    if (this.crosshair_) {
      this.crosshair_.suspendSignalsDispatching();
      this.crosshair_.parentBounds(this.dataBounds_);
      this.crosshair_.container(this.rootElement);

      this.crosshair_.xAxis(this.xAxes_[this.crosshair_.xLabel().axisIndex()]);
      this.crosshair_.yAxis(this.yAxes_[this.crosshair_.yLabel().axisIndex()]);

      this.crosshair_.draw();
      this.crosshair_.resumeSignalsDispatching(false);
    }

    this.markConsistent(anychart.ConsistencyState.SCATTER_CROSSHAIR);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.charts.Scatter.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].setAutoSizeScale(minMax[0], minMax[1], this.minBubbleSize_, this.maxBubbleSize_);
  }
};


/**
 * Renders the series.
 * @private
 */
anychart.charts.Scatter.prototype.drawSeries_ = function() {
  var i;
  var count;
  var iterator;
  var series;
  for (i = 0, count = this.series_.length; i < count; i++) {
    series = this.series_[i];

    series.startDrawing();

    iterator = series.getResetIterator();
    while (iterator.advance()) {
      var index = iterator.getIndex();
      if (iterator.get('selected'))
        series.state.setPointState(anychart.PointState.SELECT, index);

      series.drawPoint(series.state.getPointStateByIndex(index));
    }

    series.finalizeDrawing();
  }
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var axesIds = [];
  var scale;
  var config;
  var objId;
  var axisId;
  var axis;
  var axisIndex;
  var axisScale;
  var axisOrientation;
  var isHorizontal;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  json['xScale'] = scales.length - 1;
  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
  }
  json['yScale'] = scales.length - 1;

  json['type'] = anychart.enums.ChartTypes.SCATTER;
  json['defaultSeriesType'] = this.defaultSeriesType();
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['minBubbleSize'] = this.minBubbleSize();
  json['maxBubbleSize'] = this.maxBubbleSize();
  json['crosshair'] = this.crosshair().serialize();

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    var xAxis = this.xAxes_[i];
    config = xAxis.serialize();
    scale = xAxis.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    axesIds.push(goog.getUid(xAxis));

    xAxes.push(config);
  }
  if (xAxes.length)
    json['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
    config = yAxis.serialize();
    scale = yAxis.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
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
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['scale'] = scales.length - 1;
      } else {
        config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }
      axis = grid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            axisOrientation = axis.orientation();
            isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
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
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['scale'] = scales.length - 1;
      } else {
        config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }
      axis = minorGrid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            axisOrientation = axis.orientation();
            isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
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
      minorGrids.push(config);
    }
  }
  if (minorGrids.length)
    json['minorGrids'] = minorGrids;

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    var lineAxesMarker = this.lineAxesMarkers_[i];
    config = lineAxesMarker.serialize();
    scale = lineAxesMarker.scale();
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
    axis = lineAxesMarker.axis();
    if (axis) {
      axisId = goog.getUid(axis);
      axisIndex = goog.array.indexOf(axesIds, axisId);
      if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
        axisScale = axis.scale();
        if (!('layout' in config)) {
          axisOrientation = axis.orientation();
          isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
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
    lineAxesMarkers.push(config);
  }
  if (lineAxesMarkers.length)
    json['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    var rangeAxesMarker = this.rangeAxesMarkers_[i];
    config = rangeAxesMarker.serialize();
    scale = rangeAxesMarker.scale();
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
    axis = rangeAxesMarker.axis();
    if (axis) {
      axisId = goog.getUid(axis);
      axisIndex = goog.array.indexOf(axesIds, axisId);
      if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
        axisScale = axis.scale();
        if (!('layout' in config)) {
          axisOrientation = axis.orientation();
          isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
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
    rangeAxesMarkers.push(config);
  }
  if (rangeAxesMarkers.length)
    json['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    var textAxesMarker = this.textAxesMarkers_[i];
    config = textAxesMarker.serialize();
    scale = textAxesMarker.scale();
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
    axis = textAxesMarker.axis();
    if (axis) {
      axisId = goog.getUid(axis);
      axisIndex = goog.array.indexOf(axesIds, axisId);
      if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
        axisScale = axis.scale();
        if (!('layout' in config)) {
          axisOrientation = axis.orientation();
          isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
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
    textAxesMarkers.push(config);
  }
  if (textAxesMarkers.length)
    json['textAxesMarkers'] = textAxesMarkers;

  var series = [];
  for (i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
    config = series_.serialize();

    scale = series_.xScale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['xScale'] = scales.length - 1;
    } else {
      config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }

    scale = series_.yScale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['yScale'] = scales.length - 1;
    } else {
      config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    series.push(config);
  }
  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['scales'] = scales;
  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.defaultSeriesType(config['defaultSeriesType']);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultXAxisSettings' in config)
    this.defaultXAxisSettings(config['defaultXAxisSettings']);

  if ('defaultYAxisSettings' in config)
    this.defaultYAxisSettings(config['defaultYAxisSettings']);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  if ('defaultMinorGridSettings' in config)
    this.defaultMinorGridSettings(config['defaultMinorGridSettings']);

  if ('defaultLineMarkerSettings' in config)
    this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);

  if ('defaultTextMarkerSettings' in config)
    this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);

  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.minBubbleSize(config['minBubbleSize']);
  this.maxBubbleSize(config['maxBubbleSize']);

  var i, json, scale;
  var grids = config['grids'];
  var minorGrids = config['minorGrids'];
  var xAxes = config['xAxes'];
  var yAxes = config['yAxes'];
  var lineAxesMarkers = config['lineAxesMarkers'];
  var rangeAxesMarkers = config['rangeAxesMarkers'];
  var textAxesMarkers = config['textAxesMarkers'];
  var series = config['series'];
  var scales = config['scales'];
  var type = this.getType();

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

  json = config['xScale'];
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
    this.xScale(scale);

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

  if (goog.isArray(xAxes)) {
    for (i = 0; i < xAxes.length; i++) {
      json = xAxes[i];
      this.xAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.xAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(yAxes)) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(grids)) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(minorGrids)) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.minorGrid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(lineAxesMarkers)) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      json = lineAxesMarkers[i];
      this.lineMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.lineMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(rangeAxesMarkers)) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      json = rangeAxesMarkers[i];
      this.rangeMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.rangeMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(textAxesMarkers)) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      json = textAxesMarkers[i];
      this.textMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.textMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = json['seriesType'] || this.defaultSeriesType();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('xScale' in json && json['xScale'] > 1) seriesInst.xScale(scalesInstances[json['xScale']]);
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }

  if (config['crosshair']) {
    this.crosshair(config['crosshair']);
  }
};


//exports
anychart.charts.Scatter.prototype['crosshair'] = anychart.charts.Scatter.prototype.crosshair;
anychart.charts.Scatter.prototype['xScale'] = anychart.charts.Scatter.prototype.xScale;//doc|ex
anychart.charts.Scatter.prototype['yScale'] = anychart.charts.Scatter.prototype.yScale;//doc|ex
anychart.charts.Scatter.prototype['grid'] = anychart.charts.Scatter.prototype.grid;//doc|ex
anychart.charts.Scatter.prototype['minorGrid'] = anychart.charts.Scatter.prototype.minorGrid;//doc|ex
anychart.charts.Scatter.prototype['xAxis'] = anychart.charts.Scatter.prototype.xAxis;//doc|ex
anychart.charts.Scatter.prototype['yAxis'] = anychart.charts.Scatter.prototype.yAxis;//doc|ex
anychart.charts.Scatter.prototype['getSeries'] = anychart.charts.Scatter.prototype.getSeries;//doc|ex
anychart.charts.Scatter.prototype['bubble'] = anychart.charts.Scatter.prototype.bubble;//doc|ex
anychart.charts.Scatter.prototype['line'] = anychart.charts.Scatter.prototype.line;//doc|ex
anychart.charts.Scatter.prototype['marker'] = anychart.charts.Scatter.prototype.marker;//doc|ex
anychart.charts.Scatter.prototype['lineMarker'] = anychart.charts.Scatter.prototype.lineMarker;//doc|ex
anychart.charts.Scatter.prototype['rangeMarker'] = anychart.charts.Scatter.prototype.rangeMarker;//doc|ex
anychart.charts.Scatter.prototype['textMarker'] = anychart.charts.Scatter.prototype.textMarker;//doc|ex
anychart.charts.Scatter.prototype['palette'] = anychart.charts.Scatter.prototype.palette;//doc|ex
anychart.charts.Scatter.prototype['markerPalette'] = anychart.charts.Scatter.prototype.markerPalette;
anychart.charts.Scatter.prototype['hatchFillPalette'] = anychart.charts.Scatter.prototype.hatchFillPalette;
anychart.charts.Scatter.prototype['getType'] = anychart.charts.Scatter.prototype.getType;
anychart.charts.Scatter.prototype['maxBubbleSize'] = anychart.charts.Scatter.prototype.maxBubbleSize;
anychart.charts.Scatter.prototype['minBubbleSize'] = anychart.charts.Scatter.prototype.minBubbleSize;
anychart.charts.Scatter.prototype['defaultSeriesType'] = anychart.charts.Scatter.prototype.defaultSeriesType;
anychart.charts.Scatter.prototype['addSeries'] = anychart.charts.Scatter.prototype.addSeries;
anychart.charts.Scatter.prototype['getSeriesAt'] = anychart.charts.Scatter.prototype.getSeriesAt;
anychart.charts.Scatter.prototype['getSeriesCount'] = anychart.charts.Scatter.prototype.getSeriesCount;
anychart.charts.Scatter.prototype['removeSeries'] = anychart.charts.Scatter.prototype.removeSeries;
anychart.charts.Scatter.prototype['removeSeriesAt'] = anychart.charts.Scatter.prototype.removeSeriesAt;
anychart.charts.Scatter.prototype['removeAllSeries'] = anychart.charts.Scatter.prototype.removeAllSeries;
anychart.charts.Scatter.prototype['getPlotBounds'] = anychart.charts.Scatter.prototype.getPlotBounds;
