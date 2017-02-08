goog.provide('anychart.core.ChartWithAxes');

goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChartWithAnnotations');
goog.require('anychart.core.annotations.ChartController');
goog.require('anychart.core.annotations.PlotController');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * ChartWithAxes chart class.
 * @extends {anychart.core.ChartWithSeries}
 * @implements {anychart.core.IChartWithAnnotations}
 * @constructor
 * @param {boolean} joinData If series data should be sorted and joined.
 */
anychart.core.ChartWithAxes = function(joinData) {
  anychart.core.ChartWithAxes.base(this, 'constructor', joinData);

  /**
   * @type {anychart.core.ui.Crosshair}
   * @private
   */
  this.crosshair_ = null;

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
   * @type {Array.<anychart.core.axisMarkers.Line>|Array.<anychart.core.axisMarkers.Line3d>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>|Array.<anychart.core.axisMarkers.Range3d>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>|Array.<anychart.core.axisMarkers.Text3d>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>|Array.<anychart.core.grids.Linear3d>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>|Array.<anychart.core.grids.Linear3d>}
   * @private
   */
  this.minorGrids_ = [];
};
goog.inherits(anychart.core.ChartWithAxes, anychart.core.ChartWithSeries);


//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.ChartWithSeries states.
 * @type {number}
 */
anychart.core.ChartWithAxes.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.AXES_CHART_AXES_MARKERS |
    anychart.ConsistencyState.AXES_CHART_GRIDS |
    anychart.ConsistencyState.AXES_CHART_CROSSHAIR |
    anychart.ConsistencyState.AXES_CHART_ANNOTATIONS;


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @protected
 */
anychart.core.ChartWithAxes.MAX_ATTEMPTS_AXES_CALCULATION = 5;


/**
 * Sets default scale for layout based element depending on barChartMode.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.grids.Linear} item Item to set scale.
 * @protected
 */
anychart.core.ChartWithAxes.prototype.setDefaultScaleForLayoutBasedElements = function(item) {
  if (!!(item.isHorizontal() ^ this.barChartMode)) {
    item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
  } else {
    item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
  }
};


//endregion
//region --- Default settings getters/setters
//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for x-axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.core.ChartWithAxes.prototype.defaultXAxisSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultYAxisSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultGridSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultMinorGridSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultLineMarkerSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultTextMarkerSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


//endregion
//region --- Grids
//----------------------------------------------------------------------------------------------------------------------
//
//  Grids
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create Grid instance.
 * @return {!(anychart.core.grids.Linear|anychart.core.grids.Linear3d)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createGridInstance = function() {
  return new anychart.core.grids.Linear();
};


/**
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.core.grids.Linear3d|anychart.core.ChartWithAxes)} Grid instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = this.createGridInstance();
    grid.setChart(this);
    grid.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.grids.Linear|anychart.core.ChartWithAxes)} Minor grid instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = this.createGridInstance();
    grid.setChart(this);
    grid.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @protected
 */
anychart.core.ChartWithAxes.prototype.onGridSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Axes
//----------------------------------------------------------------------------------------------------------------------
//
//  Axes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.core.ChartWithAxes)} Axis instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.xAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
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
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.axes.Linear|anychart.core.ChartWithAxes)} Axis instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis.setParentEventTarget(this);
    axis.setup(this.defaultYAxisSettings());
    this.yAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * @return {number} Number of series.
 */
anychart.core.ChartWithAxes.prototype.getXAxesCount = function() {
  return this.xAxes_.length;
};


/**
 * @return {number} Number of series.
 */
anychart.core.ChartWithAxes.prototype.getYAxesCount = function() {
  return this.yAxes_.length;
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ChartWithAxes.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES_CHART_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis by index. First of all goes through x-axes, then y-axes.
 * SAMPLE: if we have 4 x-axes and 3 y-axes, chart.getAxisByIndex(4) will return very first y-axis.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.Linear|undefined}
 */
anychart.core.ChartWithAxes.prototype.getAxisByIndex = function(index) {
  return (index >= this.xAxes_.length) ? this.yAxes_[index - this.xAxes_.length] : this.xAxes_[index];
};


//endregion
//region --- Axis markers
//----------------------------------------------------------------------------------------------------------------------
//
//  Axis markers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create lineMarker instance.
 * @return {!(anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Line3d)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createLineMarkerInstance = function() {
  return new anychart.core.axisMarkers.Line();
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Line3d|anychart.core.ChartWithAxes)} Line marker instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
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
    lineMarker = this.createLineMarkerInstance();
    lineMarker.setChart(this);
    lineMarker.setup(this.defaultLineMarkerSettings());
    lineMarker.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Create rangeMarker instance.
 * @return {!(anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Range3d)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createRangeMarkerInstance = function() {
  return new anychart.core.axisMarkers.Range();
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Range3d|anychart.core.ChartWithAxes)} Range marker instance by index or itself for chaining call.
 */
anychart.core.ChartWithAxes.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
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
    rangeMarker = this.createRangeMarkerInstance();
    rangeMarker.setChart(this);
    rangeMarker.setup(this.defaultRangeMarkerSettings());
    rangeMarker.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Create textMarker instance.
 * @return {!(anychart.core.axisMarkers.Text|anychart.core.axisMarkers.Text3d)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createTextMarkerInstance = function() {
  return new anychart.core.axisMarkers.Text();
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.core.axisMarkers.Text3d|anychart.core.ChartWithAxes)} Line marker instance by index or itself for chaining call.
 */
anychart.core.ChartWithAxes.prototype.textMarker = function(opt_indexOrValue, opt_value) {
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
    textMarker = this.createTextMarkerInstance();
    textMarker.setChart(this);
    textMarker.setup(this.defaultTextMarkerSettings());
    textMarker.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.ChartWithAxes.prototype.onMarkersSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Crosshair
//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Crosshair|anychart.core.ChartWithAxes)}
 */
anychart.core.ChartWithAxes.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.Crosshair();
    this.crosshair_.enabled(false);
    this.crosshair_.bindHandlers(this);
    this.registerDisposable(this.crosshair_);
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
anychart.core.ChartWithAxes.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Annotations
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Annotations plot-level controller.
 * @param {Array.<anychart.enums.AnnotationTypes|anychart.core.annotations.AnnotationJSONFormat>=} opt_annotationsList
 * @return {anychart.core.ChartWithAxes|anychart.core.annotations.PlotController}
 */
anychart.core.ChartWithAxes.prototype.annotations = function(opt_annotationsList) {
  if (!this.annotationsPlotController_) {
    /**
     * @type {anychart.core.annotations.ChartController}
     * @private
     */
    this.annotationsChartController_ = new anychart.core.annotations.ChartController(this);
    /**
     * @type {anychart.core.annotations.PlotController}
     * @private
     */
    this.annotationsPlotController_ = new anychart.core.annotations.PlotController(this.annotationsChartController_, this);
    this.annotationsPlotController_.listenSignals(this.annotationsInvalidated_, this);
    this.registerDisposable(this.annotationsPlotController_);
  }
  if (goog.isDef(opt_annotationsList)) {
    this.annotationsPlotController_.setup(opt_annotationsList);
    return this;
  }
  return this.annotationsPlotController_;
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.ChartWithAxes.prototype.annotationsInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/Setter for default annotation settings.
 * @param {Object=} opt_value
 * @return {Object}
 */
anychart.core.ChartWithAxes.prototype.defaultAnnotationSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultAnnotationSettings_ = opt_value;
    return this;
  }
  return this.defaultAnnotationSettings_;
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.onMouseDown = function(event) {
  this.annotations().unselect();
  anychart.core.ChartWithAxes.base(this, 'onMouseDown', event);
};


//endregion
//region --- Bounds
//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getPlotBounds = function() {
  return this.dataBounds;
};


/**
 * Prepare content area bounds.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 * @return {anychart.math.Rect}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.getContentAreaBounds = function(bounds) {
  return bounds.clone().round();
};


/**
 * Get bounds without axes and scrollers.
 * @param {anychart.math.Rect} contentAreaBounds Total bounds of content area.
 * @param {number=} opt_scrollerSize Scroller size if any (used in descendants to override the behaviour).
 * @return {anychart.math.Rect}
 */
anychart.core.ChartWithAxes.prototype.getBoundsWithoutAxes = function(contentAreaBounds, opt_scrollerSize) {
  var i, count;
  var xAxis, yAxis;
  var axes = goog.array.concat(this.xAxes_, this.yAxes_);
  var attempt = 0;

  for (i = 0, count = this.xAxes_.length; i < count; i++) {
    xAxis = this.xAxes_[i];
    if (xAxis) {
      xAxis.suspendSignalsDispatching();
      xAxis.padding(0);
    }
  }

  for (i = 0, count = this.yAxes_.length; i < count; i++) {
    yAxis = this.yAxes_[i];
    if (yAxis) {
      yAxis.suspendSignalsDispatching();
      yAxis.padding(0);
    }
  }

  var boundsWithoutAxes;
  do {
    // axes local vars
    var remainingBounds;
    var axis;
    var orientation;
    var offsets = [0, 0, 0, 0];
    var complete = true;
    boundsWithoutAxes = contentAreaBounds.clone();
    this.topAxisPadding_ = NaN;
    this.bottomAxisPadding_ = NaN;
    this.leftAxisPadding_ = NaN;
    this.rightAxisPadding_ = NaN;
    var axisStrokeThickness;

    for (i = axes.length; i--;) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis && axis.enabled()) {
        axis.parentBounds(contentAreaBounds);
        orientation = axis.orientation();
        axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(axis.stroke()));

        if (orientation == anychart.enums.Orientation.TOP) {
          axis.padding()['top'](offsets[0]);
          axis.padding()['bottom'](0);
          remainingBounds = axis.getRemainingBounds();
          offsets[0] = contentAreaBounds.height - remainingBounds.height;
          if (isNaN(this.topAxisPadding_))
            this.topAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.BOTTOM) {
          axis.padding()['bottom'](offsets[2]);
          axis.padding()['top'](0);
          remainingBounds = axis.getRemainingBounds();
          offsets[2] = contentAreaBounds.height - remainingBounds.height;
          if (isNaN(this.bottomAxisPadding_))
            this.bottomAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.LEFT) {
          axis.padding()['left'](offsets[3]);
          axis.padding()['right'](0);
          remainingBounds = axis.getRemainingBounds();
          offsets[3] = contentAreaBounds.width - remainingBounds.width;
          if (isNaN(this.leftAxisPadding_))
            this.leftAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.RIGHT) {
          axis.padding()['right'](offsets[1]);
          axis.padding()['left'](0);
          remainingBounds = axis.getRemainingBounds();
          offsets[1] = contentAreaBounds.width - remainingBounds.width;
          if (isNaN(this.rightAxisPadding_))
            this.rightAxisPadding_ = axisStrokeThickness;
        }
      }
    }

    offsets = this.applyScrollerOffset(offsets, opt_scrollerSize || 0);

    boundsWithoutAxes.left += offsets[3];
    boundsWithoutAxes.top += offsets[0];
    boundsWithoutAxes.width -= offsets[1] + offsets[3];
    boundsWithoutAxes.height -= offsets[2] + offsets[0];

    for (i = axes.length; i--;) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis && axis.enabled()) {
        var remainingBoundsBeforeSetPadding = axis.getRemainingBounds();

        if (axis.isHorizontal()) {
          axis.padding()['left'](offsets[3]);
          axis.padding()['right'](offsets[1]);
          remainingBounds = axis.getRemainingBounds();
          if (remainingBounds.height != remainingBoundsBeforeSetPadding.height) {
            complete = false;
          }
        } else {
          axis.padding()['top'](offsets[0]);
          axis.padding()['bottom'](offsets[2]);
          remainingBounds = axis.getRemainingBounds();
          if (remainingBounds.width != remainingBoundsBeforeSetPadding.width) {
            complete = false;
          }
        }
      }
    }
    attempt++;
  } while (!complete && attempt < anychart.core.ChartWithAxes.MAX_ATTEMPTS_AXES_CALCULATION);

  for (i = 0, count = this.xAxes_.length; i < count; i++) {
    xAxis = this.xAxes_[i];
    if (xAxis) xAxis.resumeSignalsDispatching(false);
  }

  for (i = 0, count = this.yAxes_.length; i < count; i++) {
    yAxis = this.yAxes_[i];
    if (yAxis) yAxis.resumeSignalsDispatching(false);
  }

  return boundsWithoutAxes.clone().round();
};


/**
 * Should apply additional offsets produced by the scroller if any and return the offsets array.
 * @param {Array.<number>} offsets
 * @param {number} scrollerSize
 * @return {Array.<number>}
 */
anychart.core.ChartWithAxes.prototype.applyScrollerOffset = function(offsets, scrollerSize) {
  return offsets;
};


//endregion
//region --- Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns bounds chagned signal
 * @return {number}
 */
anychart.core.ChartWithAxes.prototype.getBoundsChangedSignal = function() {
  return anychart.ConsistencyState.AXES_CHART_AXES |
      anychart.ConsistencyState.AXES_CHART_GRIDS |
      anychart.ConsistencyState.AXES_CHART_AXES_MARKERS |
      anychart.ConsistencyState.SERIES_CHART_SERIES |
      anychart.ConsistencyState.AXES_CHART_ANNOTATIONS |
      anychart.ConsistencyState.AXES_CHART_CROSSHAIR;
};


/**
 * Draw chart elements.
 */
anychart.core.ChartWithAxes.prototype.drawElements = function() {
  var i, count;
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (!grid.scale())
          this.setDefaultScaleForLayoutBasedElements(grid);
        grid.parentBounds(this.dataBounds);
        grid.container(this.rootElement);
        grid.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_GRIDS);
  }

  // draw axes outside of data bounds
  // only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    var axes = goog.array.concat(this.xAxes_, this.yAxes_);
    var axis;
    for (i = 0, count = axes.length; i < count; i++) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (i = 0, count = markers.length; i < count; i++) {
      var axesMarker = markers[i];
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        if (!axesMarker.scale())
          this.setDefaultScaleForLayoutBasedElements(axesMarker);
        axesMarker.parentBounds(this.dataBounds);
        axesMarker.container(this.rootElement);
        axesMarker.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS);
  }
};


/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.core.ChartWithAxes.prototype.drawContent = function(bounds) {
  this.annotations();
  this.annotationsChartController_.ready(true);

  var i, count;

  this.calculate();

  if (this.isConsistent()) {
    return;
  }

  anychart.core.Base.suspendSignalsDispatching(this.xAxes_, this.yAxes_);

  anychart.performance.start('Cartesian bounds calc');
  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES_CHART_AXES)) {
    var item;
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      item = this.xAxes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
        if (item && !item.scale())
          item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
      }
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      item = this.yAxes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
        if (item && !item.scale())
          item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
      }
    }
  }

  // calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // bounds of data area
    this.dataBounds = this.getBoundsWithoutAxes(this.getContentAreaBounds(bounds));

    // we do not invalidate series BOUNDS state, because it will be invalidate naturally in series drawing section
    this.annotations().invalidateAnnotations();
    this.invalidate(this.getBoundsChangedSignal());
  }

  anychart.performance.end('Cartesian bounds calc');

  anychart.performance.start('Cartesian elements drawing');
  this.drawElements();
  anychart.performance.end('Cartesian elements drawing');

  this.drawSeries(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
      this.leftAxisPadding_);

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_CROSSHAIR)) {
    var crosshair = /** @type {anychart.core.ui.Crosshair} */(this.crosshair());
    crosshair.suspendSignalsDispatching();
    crosshair.parentBounds(this.dataBounds);
    crosshair.container(this.rootElement);
    crosshair.barChartMode(this.barChartMode);
    crosshair.xAxis(this.xAxes_[/** @type {number} */(this.crosshair_.xLabel().axisIndex())]);
    crosshair.yAxis(this.yAxes_[/** @type {number} */(this.crosshair_.yLabel().axisIndex())]);
    crosshair.draw();
    crosshair.resumeSignalsDispatching(false);

    this.markConsistent(anychart.ConsistencyState.AXES_CHART_CROSSHAIR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_ANNOTATIONS)) {
    var annotations = this.annotations();
    annotations.suspendSignalsDispatching();
    annotations.parentBounds(this.dataBounds);
    annotations.container(this.rootElement);
    annotations.draw();
    annotations.resumeSignalsDispatching(false);
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_ANNOTATIONS);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.xAxes_, this.yAxes_);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.ChartWithAxes.prototype.setupByJSONWithScales = function(config, scalesInstances) {
  anychart.core.ChartWithAxes.base(this, 'setupByJSONWithScales', config, scalesInstances);

  // barChartMode is @deprecated Since 7.13.0.
  if ('barChartMode' in config) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['barChartMode', 'isVertical', null, 'JSON property'], true);
    this.barChartMode = !!config['barChartMode'];
  }
  if ('isVertical' in config)
    this.barChartMode = !!config['isVertical'];

  this.defaultXAxisSettings(config['defaultXAxisSettings']);
  this.defaultYAxisSettings(config['defaultYAxisSettings']);
  this.defaultGridSettings(config['defaultGridSettings']);
  this.defaultMinorGridSettings(config['defaultMinorGridSettings']);
  this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);
  this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);
  this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);
  this.defaultAnnotationSettings(config['defaultAnnotationSettings']);
  this.annotations(config['annotations']);

  this.setupElements_(config['grids'], this.grid, scalesInstances);
  this.setupElements_(config['minorGrids'], this.minorGrid, scalesInstances);
  this.setupElements_(config['xAxes'], this.xAxis, scalesInstances);
  this.setupElements_(config['yAxes'], this.yAxis, scalesInstances);
  this.setupElements_(config['lineAxesMarkers'], this.lineMarker, scalesInstances);
  this.setupElements_(config['rangeAxesMarkers'], this.rangeMarker, scalesInstances);
  this.setupElements_(config['textAxesMarkers'], this.textMarker, scalesInstances);
  this.crosshair(config['crosshair']);
};


/**
 * Setups elements defined by an array of json
 * @param {*} items
 * @param {Function} itemConstructor
 * @param {Object} scaleInstances
 * @private
 */
anychart.core.ChartWithAxes.prototype.setupElements_ = function(items, itemConstructor, scaleInstances) {
  if (goog.isArray(items)) {
    for (var i = 0; i < items.length; i++) {
      var json = items[i];
      var element = itemConstructor.call(this, i);
      element.setup(json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1)
        element.scale(scaleInstances[json['scale']]);
    }
  }
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.core.ChartWithAxes.base(this, 'serializeWithScales', json, scales, scaleIds);

  json['isVertical'] = this.barChartMode;

  var axesIds = [];
  this.serializeElements_(json, 'xAxes', this.xAxes_, this.serializeAxis_, scales, scaleIds, axesIds);
  this.serializeElements_(json, 'yAxes', this.yAxes_, this.serializeAxis_, scales, scaleIds, axesIds);

  this.serializeElements_(json, 'grids', this.grids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElements_(json, 'minorGrids', this.minorGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElements_(json, 'lineAxesMarkers', this.lineAxesMarkers_, this.serializeAxisMarker_, scales, scaleIds, axesIds);
  this.serializeElements_(json, 'rangeAxesMarkers', this.rangeAxesMarkers_, this.serializeAxisMarker_, scales, scaleIds, axesIds);
  this.serializeElements_(json, 'textAxesMarkers', this.textAxesMarkers_, this.serializeAxisMarker_, scales, scaleIds, axesIds);

  json['crosshair'] = this.crosshair().serialize();
};


/**
 * Serializes a list of items and writes it to json[propName] if the resulting list is not empty.
 * @param {!Object} json
 * @param {string} propName
 * @param {Array.<T>} list
 * @param {function(T, Array, Object, Array):Object} serializer
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @private
 * @template T
 */
anychart.core.ChartWithAxes.prototype.serializeElements_ = function(json, propName, list, serializer, scales, scaleIds, axesIds) {
  var res = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item) {
      res.push(serializer.call(this, item, scales, scaleIds, axesIds));
    }
  }
  if (res.length) {
    json[propName] = res;
  }
};


/**
 * Serializes an axis and returns its config.
 * @param {anychart.core.axes.Linear} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeAxis_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  axesIds.push(goog.getUid(item));
  return config;
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.grids.Linear} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeGrid_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  var axis = /** @type {anychart.core.axes.Linear} */(item.axis());
  if (axis) {
    var axisIndex = goog.array.indexOf(axesIds, goog.getUid(axis));
    if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
      if (!('layout' in config)) {
        config['layout'] = axis.isHorizontal() ?
            anychart.enums.Layout.HORIZONTAL :
            anychart.enums.Layout.VERTICAL;
      }
      if (!('scale' in config)) { //doesn't override the scale already set.
        this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(axis.scale()), scales, scaleIds);
      }
    } else {
      config['axis'] = axisIndex;
    }
  }
  return config;
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.axisMarkers.PathBase|anychart.core.axisMarkers.TextBase|anychart.core.grids.Linear} item
 * @param {Object} config
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeElementAxis_ = function(item, config, scales, scaleIds, axesIds) {
  var axis = item.axis();
  if (axis) {
    var axisIndex = goog.array.indexOf(axesIds, goog.getUid(axis));
    if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
      if (!('layout' in config)) {
        config['layout'] = axis.isHorizontal() ?
            anychart.enums.Layout.HORIZONTAL :
            anychart.enums.Layout.VERTICAL;
      }
      if (!('scale' in config)) { //doesn't override the scale already set.
        this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(axis.scale()), scales, scaleIds);
      }
    } else {
      config['axis'] = axisIndex;
    }
  }
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.axisMarkers.PathBase|anychart.core.axisMarkers.TextBase} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeAxisMarker_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scaleInternal()), scales, scaleIds);
  this.serializeElementAxis_(item, config, scales, scaleIds, axesIds);
  return config;
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.xAxes_,
      this.yAxes_,
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.grids_,
      this.minorGrids_);

  delete this.xAxes_;
  delete this.yAxes_;
  this.lineAxesMarkers_ = null;
  this.rangeAxesMarkers_ = null;
  this.textAxesMarkers_ = null;
  this.grids_ = null;
  this.minorGrids_ = null;

  anychart.core.ChartWithAxes.base(this, 'disposeInternal');
};


//endregion
