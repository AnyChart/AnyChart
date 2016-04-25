goog.provide('anychart.SignalEvent');
goog.provide('anychart.core.Base');

goog.require('anychart');
goog.require('anychart.enums');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * The list of elements consistency states.
 * @enum {number}
 */
anychart.ConsistencyState = {
  //---------------------------------- GENERAL STATES ---------------------------------
  /**
   * enabled() has changed.
   */
  ENABLED: 1 << 0,
  /**
   * Container has changed.
   */
  CONTAINER: 1 << 1,
  /**
   * Size has changed.
   */
  BOUNDS: 1 << 2,
  /**
   * Z index has changed.
   */
  Z_INDEX: 1 << 3,
  /**
   * Visual settings have changed (fill, stroke, etc.).
   */
  APPEARANCE: 1 << 4,
  //---------------------------------- DATA STATES (BASE) ---------------------------------
  /**
   * Data mask invalidated.
   */
  DATA_MASK: 1 << 0,
  //---------------------------------- CHART STATES (VB) ---------------------------------
  /**
   * Chart title has changed.
   */
  CHART_BACKGROUND: 1 << 5,
  /**
   * Chart title has changed.
   */
  CHART_TITLE: 1 << 6,
  /**
   * Chart title has changed.
   */
  CHART_LABELS: 1 << 7,
  // We also add SeparateChart states here to not to add prefix SEPARATE_CHART.
  // But if bullet or spark chart will need some new consistency states, there is a possibility to add 2 here.
  CHART_LEGEND: 1 << 8,
  CHART_CREDITS: 1 << 9,
  CHART_ANIMATION: 1 << 10,
  //---------------------------------- BULLET STATES (CHART) ---------------------------------
  BULLET_DATA: 1 << 11,
  BULLET_SCALES: 1 << 12,
  BULLET_AXES: 1 << 13,
  BULLET_AXES_MARKERS: 1 << 14,
  BULLET_MARKERS: 1 << 15,
  //---------------------------------- CARTESIAN STATES (CHART) ---------------------------------
  CARTESIAN_PALETTE: 1 << 11,
  CARTESIAN_MARKER_PALETTE: 1 << 12,
  CARTESIAN_HATCH_FILL_PALETTE: 1 << 13,
  CARTESIAN_SCALES: 1 << 14,
  CARTESIAN_SERIES: 1 << 15,
  CARTESIAN_AXES: 1 << 16,
  CARTESIAN_AXES_MARKERS: 1 << 17,
  CARTESIAN_GRIDS: 1 << 18,
  CARTESIAN_CROSSHAIR: 1 << 19,
  CARTESIAN_ZOOM: 1 << 20,
  CARTESIAN_SCALE_MAPS: 1 << 21,
  CARTESIAN_Y_SCALES: 1 << 22,
  CARTESIAN_X_SCROLLER: 1 << 23,
  //---------------------------------- PYRAMID/FUNNEL STATES (CHART) ---------------------------------
  PYRAMID_FUNNEL_LABELS: 1 << 11,
  PYRAMID_FUNNEL_MARKERS: 1 << 12,
  PYRAMID_FUNNEL_DATA: 1 << 13,
  //---------------------------------- GANTT STATES (CHART) ---------------------------------
  GANTT_DATA: 1 << 11,
  GANTT_POSITION: 1 << 12,
  GANTT_SPLITTER_POSITION: 1 << 13,
  //---------------------------------- PIE STATES (CHART) ---------------------------------
  PIE_LABELS: 1 << 11,
  PIE_DATA: 1 << 12,
  //---------------------------------- POLAR STATES (CHART) ---------------------------------
  POLAR_PALETTE: 1 << 11,
  POLAR_MARKER_PALETTE: 1 << 12,
  POLAR_HATCH_FILL_PALETTE: 1 << 13,
  POLAR_SCALES: 1 << 14,
  POLAR_SERIES: 1 << 15,
  POLAR_AXES: 1 << 16,
  POLAR_GRIDS: 1 << 17,
  //---------------------------------- RADAR STATES (CHART) ---------------------------------
  RADAR_PALETTE: 1 << 11,
  RADAR_MARKER_PALETTE: 1 << 12,
  RADAR_HATCH_FILL_PALETTE: 1 << 13,
  RADAR_SCALES: 1 << 14,
  RADAR_SERIES: 1 << 15,
  RADAR_AXES: 1 << 16,
  RADAR_GRIDS: 1 << 17,
  //---------------------------------- SCATTER STATES (CHART) ---------------------------------
  SCATTER_PALETTE: 1 << 11,
  SCATTER_MARKER_PALETTE: 1 << 12,
  SCATTER_HATCH_FILL_PALETTE: 1 << 13,
  SCATTER_SCALES: 1 << 14,
  SCATTER_SERIES: 1 << 15,
  SCATTER_AXES: 1 << 16,
  SCATTER_AXES_MARKERS: 1 << 17,
  SCATTER_GRIDS: 1 << 18,
  SCATTER_CROSSHAIR: 1 << 19,
  //---------------------------------- SPARKLINE STATES (CHART) ---------------------------------
  SPARK_SCALES: 1 << 11,
  SPARK_SERIES: 1 << 12,
  SPARK_AXES_MARKERS: 1 << 13,
  //---------------------------------- MAP STATES (CHART) ---------------------------------
  MAP_SCALE: 1 << 11,
  MAP_COLOR_SCALE: 1 << 12,
  MAP_GEO_DATA: 1 << 13,
  MAP_SERIES: 1 << 14,
  MAP_PALETTE: 1 << 15,
  MAP_MARKER_PALETTE: 1 << 16,
  MAP_HATCH_FILL_PALETTE: 1 << 17,
  MAP_COLOR_RANGE: 1 << 18,
  MAP_MOVE: 1 << 19,
  MAP_ZOOM: 1 << 20,
  //---------------------------------- HEAT MAP STATES (CHART) ---------------------------------
  HEATMAP_SCALES: 1 << 11,
  HEATMAP_SERIES: 1 << 12,
  HEATMAP_AXES: 1 << 13,
  HEATMAP_GRIDS: 1 << 14,
  HEATMAP_COLOR_SCALE: 1 << 15,
  HEATMAP_X_SCROLLER: 1 << 16,
  HEATMAP_Y_SCROLLER: 1 << 17,
  HEATMAP_ZOOM: 1 << 18,
  //---------------------------------- SERIES STATES (VB) ---------------------------------
  // also combined, due to a very big prefix
  SERIES_HATCH_FILL: 1 << 5, //
  SERIES_MARKERS: 1 << 6, //
  SERIES_LABELS: 1 << 7, //
  SERIES_DATA: 1 << 8,
  SERIES_POINTS: 1 << 9, //
  SERIES_COLOR: 1 << 10, //
  SERIES_CLIP: 1 << 11, //
  SERIES_ERROR: 1 << 12, //
  SERIES_OUTLIERS: 1 << 13, //
  //---------------------------------- AXES STATES (VB) ---------------------------------
  // also combined
  AXIS_TITLE: 1 << 5,
  AXIS_LABELS: 1 << 6,
  AXIS_TICKS: 1 << 7,
  AXIS_OVERLAP: 1 << 8,
  //---------------------------------- AXES STATES (AXIS) ---------------------------------
  COLOR_RANGE_MARKER: 1 << 9,
  //---------------------------------- GANTT CONTROLLER STATES (VB) ---------------------------------
  CONTROLLER_DATA: 1 << 5,
  CONTROLLER_VISIBILITY: 1 << 6,
  CONTROLLER_POSITION: 1 << 7,
  //---------------------------------- GANTT TIMELINE STATES (VB) ---------------------------------
  TIMELINE_SCALES: 1 << 8,
  //---------------------------------- GANTT TIMELINE HEADER STATES (VB) ---------------------------------
  TIMELINE_HEADER_SCALES: 1 << 5,
  //---------------------------------- GANTT TIMELINE HEADER LEVEL STATES (VB) ---------------------------------
  TIMELINE_HEADER_LEVEL_LABELS: 1 << 5,
  TIMELINE_HEADER_LEVEL_TICKS: 1 << 6,
  //---------------------------------- GRIDS STATES (VB) ---------------------------------
  // also combined
  GRIDS_POSITION: 1 << 5,
  //---------------------------------- BASE GRIDS STATES (VB) ---------------------------------
  BASE_GRID_REDRAW: 1 << 6,
  BASE_GRID_HOVER: 1 << 7,
  //---------------------------------- BUTTON STATES (VB) ---------------------------------
  BUTTON_BACKGROUND: 1 << 5,
  //---------------------------------- CREDITS STATES (VB) ---------------------------------
  CREDITS_POSITION: 1 << 5,
  CREDITS_REDRAW_IMAGE: 1 << 6,
  //---------------------------------- DATA GRID STATES (BASE GRID) ---------------------------------
  DATA_GRID_GRIDS: 1 << 8,
  //---------------------------------- DATA GRID COLUMN STATES (VB) ---------------------------------
  DATA_GRID_COLUMN_TITLE: 1 << 5,
  DATA_GRID_COLUMN_POSITION: 1 << 6,
  //---------------------------------- BACKGROUND STATES (VB) ---------------------------------
  BACKGROUND_POINTER_EVENTS: 1 << 5,
  //---------------------------------- LABEL STATES (VB) ---------------------------------
  LABEL_BACKGROUND: 1 << 5,
  //---------------------------------- LABELS FACTORY STATES (VB) ---------------------------------
  LABELS_FACTORY_BACKGROUND: 1 << 5,
  LABELS_FACTORY_HANDLERS: 1 << 6,
  LABELS_FACTORY_CLIP: 1 << 7,
  //---------------------------------- LEGEND STATES (VB) ---------------------------------
  LEGEND_BACKGROUND: 1 << 5,
  LEGEND_TITLE: 1 << 6,
  LEGEND_SEPARATOR: 1 << 7,
  LEGEND_PAGINATOR: 1 << 8,
  //---------------------------------- MARKERS FACTORY STATES (VB) ---------------------------------
  MARKERS_FACTORY_HANDLERS: 1 << 5,
  //---------------------------------- PAGINATOR STATES (VB) ---------------------------------
  PAGINATOR_BACKGROUND: 1 << 5,
  //---------------------------------- SCROLLBAR STATES (VB) ---------------------------------
  SCROLLBAR_POSITION: 1 << 5,
  //---------------------------------- SPLITTER STATES (VB) ---------------------------------
  SPLITTER_POSITION: 1 << 5,
  //---------------------------------- TITLE STATES (VB) ---------------------------------
  TITLE_BACKGROUND: 1 << 5,
  //---------------------------------- TOOLTIP STATES (VB) ---------------------------------
  // actually its for TooltipItem, but tooltip doesn't have any states and we hope they will merge
  TOOLTIP_POSITION: 1 << 5,
  TOOLTIP_TITLE: 1 << 6,
  TOOLTIP_SEPARATOR: 1 << 7,
  TOOLTIP_CONTENT: 1 << 8,
  TOOLTIP_BACKGROUND: 1 << 9,
  TOOLTIP_VISIBILITY: 1 << 10,
  //---------------------------------- GAUGE (CHART) ------------------------------------------
  GAUGE_POINTERS: 1 << 11,
  GAUGE_KNOB: 1 << 12,
  GAUGE_CAP: 1 << 13,
  GAUGE_AXES: 1 << 14,
  GAUGE_HATCH_FILL: 1 << 15,
  GAUGE_AXIS_MARKERS: 1 << 16,
  GAUGE_SCALE: 1 << 17,
  //---------------------------------- TABLE (VB) ---------------------------------------------
  TABLE_CELL_BOUNDS: 1 << 5,
  TABLE_OVERLAP: 1 << 6,
  TABLE_BORDERS: 1 << 7,
  TABLE_FILLS: 1 << 8,
  TABLE_CONTENT: 1 << 9,
  TABLE_STRUCTURE: 1 << 10,
  //---------------------------------- SCROLLER (VB) ---------------------------------------------
  SCROLLER_THUMBS_SHAPE: 1 << 5,
  SCROLLER_ORIENTATION: 1 << 6,
  SCROLLER_AUTO_HIDE: 1 << 7,
  //---------------------------------- STOCK CHART (CHART) -------------------------------------------
  STOCK_PLOTS_APPEARANCE: 1 << 11,
  STOCK_SCROLLER: 1 << 12,
  STOCK_DATA: 1 << 22, //13,
  STOCK_SCALES: 1 << 14,
  //---------------------------------- STOCK PLOT (VB) -------------------------------------------
  STOCK_PLOT_BACKGROUND: 1 << 5,
  STOCK_PLOT_SERIES: 1 << 6,
  STOCK_PLOT_AXES: 1 << 7,
  STOCK_PLOT_DT_AXIS: 1 << 8,
  STOCK_PLOT_GRIDS: 1 << 9,
  STOCK_PLOT_LEGEND: 1 << 10,
  STOCK_PLOT_PALETTE: 1 << 11,
  //---------------------------------- STOCK DATETIME AXIS (VB) ----------------------------------------
  STOCK_DTAXIS_BACKGROUND: 1 << 5,
  //---------------------------------- STOCK SCROLLER (SCROLLER) ----------------------------------------
  STOCK_SCROLLER_SERIES: 1 << 8,
  STOCK_SCROLLER_AXIS: 1 << 9,
  //---------------------------------- TREE MAP CHART (SEPARATE CHART) ----------------------------------
  TREEMAP_DATA: 1 << 11,
  TREEMAP_LABELS: 1 << 12,
  TREEMAP_MARKERS: 1 << 13,
  TREEMAP_COLOR_SCALE: 1 << 14,
  TREEMAP_NODE_TYPES: 1 << 15,
  TREEMAP_COLOR_RANGE: 1 << 16,
  TREEMAP_HINT_OPACITY: 1 << 17,
  /**
   * Combination of all states.
   */
  ALL: 0xFFFFFFFF
};


/**
 * List of all possible signals (can be only from 1 << 0 to 1 << 30)
 * @enum {number}
 */
anychart.Signal = {
  NEEDS_REDRAW: 1 << 0,
  NEEDS_REAPPLICATION: 1 << 1,
  NEEDS_RECALCULATION: 1 << 2,
  BOUNDS_CHANGED: 1 << 3,
  DATA_CHANGED: 1 << 4,
  META_CHANGED: 1 << 5,
  NEED_UPDATE_LEGEND: 1 << 6,
  NEED_UPDATE_COLOR_RANGE: 1 << 7,
  NEED_UPDATE_FULL_RANGE_ITEMS: 1 << 8,
  NEED_UPDATE_TICK_DEPENDENT: 1 << 9
};


/**
 * The list of point states.
 * @enum {number}
 */
anychart.PointState = {
  NORMAL: 0,
  HOVER: 1,
  SELECT: 2,
  ALL: 0xFFFFFFFF
};



/**
 * Class implements all the work with consistency states.
 * invalidate() and markConsistent() are used to change states.
 * isConsistent() and hasInvalidationState() are used to check states.
 * @constructor
 * @name anychart.core.Base
 * @extends {goog.events.EventTarget}
 */
anychart.core.Base = function() {
  goog.base(this);
};
goog.inherits(anychart.core.Base, goog.events.EventTarget);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.Base.prototype.SUPPORTED_SIGNALS = 0;


/**
 * Supported consistency states mask.
 * @type {number}
 */
anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Current consistency state. Equals zero when element is consistent.
 * @type {number}
 * @private
 */
anychart.core.Base.prototype.consistency_ = 0;


/**
 * If NaN - no dispatching suspend is active.
 * If a number - contains the cumulative signal for all suspended states that had to be dispatched during the suspend.
 * @type {number}
 * @protected
 */
anychart.core.Base.prototype.suspendedDispatching = NaN;


/**
 * Dispatching suspend level to support suspend-resume stacking.
 * @type {number}
 * @protected
 */
anychart.core.Base.prototype.suspensionLevel = 0;


/**
 * Adds a signal events listener.
 *
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener Callback
 *     method.
 * @param {SCOPE=} opt_scope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE
 */
anychart.core.Base.prototype.listenSignals = function(listener, opt_scope) {
  return this.listen(anychart.enums.EventType.SIGNAL, listener, false, opt_scope);
};


/**
 * Removes a signal events listener.
 *
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener Callback
 *     method.
 * @param {SCOPE=} opt_scope Object in whose scope to call the
 *     listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE
 */
anychart.core.Base.prototype.unlistenSignals = function(listener, opt_scope) {
  return this.unlisten(anychart.enums.EventType.SIGNAL, listener, false, opt_scope);
};


/**
 * Sets consistency state to an element {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state State(s) to be set.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.core.Base.prototype.invalidate = function(state, opt_signal) {
  state &= this.SUPPORTED_CONSISTENCY_STATES;
  var effective = state & ~this.consistency_;
  this.consistency_ |= effective;
  if (!!effective)
    this.dispatchSignal(opt_signal || 0);
  return effective;
};


/**
 * Clears consistency state.
 * @param {anychart.ConsistencyState|number} state State(s) to be cleared.
 */
anychart.core.Base.prototype.markConsistent = function(state) {
  this.consistency_ &= ~state;
};


/**
 * Checks if an element has any consistency state set.
 * @return {boolean} True if it has it.
 */
anychart.core.Base.prototype.isConsistent = function() {
  return !this.consistency_;
};


/**
 * Checks of an element has a consistency state(s).
 * @param {anychart.ConsistencyState|number} state State(s) to be checked.
 * @return {boolean} True if it has it.
 */
anychart.core.Base.prototype.hasInvalidationState = function(state) {
  return !!(this.consistency_ & state);
};


/**
 * Sends invalidation event to listeners.
 *
 * NOTE: YOU CAN ONLY SEND SIGNALS FROM SUPPORTED_SIGNALS MASK!
 *
 * @param {anychart.Signal|number} state Invalidation state(s).
 * @param {boolean=} opt_force Force to dispatch signal.
 */
anychart.core.Base.prototype.dispatchSignal = function(state, opt_force) {
  state &= this.SUPPORTED_SIGNALS;
  if (!state) return;
  if (isNaN(this.suspendedDispatching) || !!opt_force) {
    // Hack to prevent Signal events bubbling. May be we should use all advantages of bubbling but not now.
    var parent = this.getParentEventTarget();
    this.setParentEventTarget(null);
    this.dispatchEvent(new anychart.SignalEvent(this, state));
    this.setParentEventTarget(parent);
  } else {
    this.suspendedDispatching |= state;
  }
};


/**
 * Suspends dispatching of invalidation events. The dispatching can be resumed with or without cumulative dispatching
 * of all affected states.
 * @return {!anychart.core.Base} Itself for chaining.
 */
anychart.core.Base.prototype.suspendSignalsDispatching = function() {
  this.suspensionLevel++;
  if (isNaN(this.suspendedDispatching))
    this.suspendedDispatching = 0;
  return this;
};


/**
 * Resumes dispatching of invalidation events.
 * @param {boolean} doDispatchSuspendedSignals Whether to dispatch all signals that were to be dispatched while the
 *    suspend or not.
 * @return {!anychart.core.Base} Itself for chaining.
 */
anychart.core.Base.prototype.resumeSignalsDispatching = function(doDispatchSuspendedSignals) {
  if (isNaN(this.suspendedDispatching) || --this.suspensionLevel)
    return this;
  var eventsToDispatch = this.suspendedDispatching;
  this.suspendedDispatching = NaN;
  if (doDispatchSuspendedSignals && eventsToDispatch)
    this.dispatchSignal(eventsToDispatch);
  return this;
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.core.Base.prototype.serialize = function() {
  return {};
};


/**
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args Arguments to setup the instance.
 * @return {anychart.core.Base} Returns itself for chaining.
 */
anychart.core.Base.prototype.setup = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isDef(arg0)) {
    this.suspendSignalsDispatching();
    if (!this.setupSpecial.apply(this, arguments) && goog.isObject(arg0)) {
      //if (arg0 instanceof anychart.core.Base)
      //  throw 'Instance of object is passed to setter. You should use JSON instead';
      this.setupByJSON(/** @type {!Object} */(arguments[0]));
    }
    this.resumeSignalsDispatching(true);
  }
  return this;
};


/**
 * Setups current instance using passed JSON object.
 * @param {!Object} json
 * @protected
 */
anychart.core.Base.prototype.setupByJSON = function(json) {
};


/**
 * Special objects to setup current instance.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.core.Base.prototype.setupSpecial = function(var_args) {
  return false;
};


/**
 * Dispatches external event with a timeout to detach it from the other code execution frame.
 * @param {goog.events.EventLike} event Event object.
 */
anychart.core.Base.prototype.dispatchDetachedEvent = function(event) {
  setTimeout(goog.bind(this.dispatchEvent, this, event), 0);
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.core.Base|Array.<anychart.core.Base>)} var_args
 */
anychart.core.Base.suspendSignalsDispatching = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.core.Base.suspendSignalsDispatching.apply(null, obj);
    else if (obj instanceof anychart.core.Base)
      (/** @type {anychart.core.Base} */(obj)).suspendSignalsDispatching();
  }
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.core.Base|Array.<anychart.core.Base>)} var_args
 */
anychart.core.Base.resumeSignalsDispatchingTrue = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.core.Base.resumeSignalsDispatchingTrue.apply(null, obj);
    else if (obj instanceof anychart.core.Base)
      (/** @type {anychart.core.Base} */(obj)).resumeSignalsDispatching(true);
  }
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.core.Base|Array.<anychart.core.Base>)} var_args
 */
anychart.core.Base.resumeSignalsDispatchingFalse = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.core.Base.resumeSignalsDispatchingFalse.apply(null, obj);
    else if (obj instanceof anychart.core.Base)
      (/** @type {anychart.core.Base} */(obj)).resumeSignalsDispatching(false);
  }
};



/**
 * Special event for changes in dirty states.
 * @param {anychart.core.Base} target Event target.
 * @param {number} invalidatedStates Changes effectively happened with the target.
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.SignalEvent = function(target, invalidatedStates) {
  goog.base(this, anychart.enums.EventType.SIGNAL, target);

  /**
   * Aspects of the object that were hasSignal.
   * @type {number}
   */
  this.signals = invalidatedStates;
};
goog.inherits(anychart.SignalEvent, goog.events.Event);


/**
 * Checks if an element has consistency state that was sent.
 * @param {anychart.Signal|number} state State(s) to be checked.
 * @return {boolean} True if element has it (one of it).
 */
anychart.SignalEvent.prototype.hasSignal = function(state) {
  return !!(this.signals & state);
};


/**
 * If target needs redraw.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetNeedsRedraw = function() {
  return this.hasSignal(anychart.Signal.NEEDS_REDRAW);
};


/**
 * If target signalled bounds change.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetBoundsChanged = function() {
  return this.hasSignal(anychart.Signal.BOUNDS_CHANGED);
};


/**
 * If target signalled data change.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetDataChanged = function() {
  return this.hasSignal(anychart.Signal.DATA_CHANGED);
};


/**
 * If target signalled meta change.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetMetaChanged = function() {
  return this.hasSignal(anychart.Signal.META_CHANGED);
};


/**
 * If target needs to be reapplied.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetNeedsReapplication = function() {
  return this.hasSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/**
 * If target needs to be recalculated.
 * @return {boolean}
 */
anychart.SignalEvent.prototype.targetNeedsRecalculation = function() {
  return this.hasSignal(anychart.Signal.NEEDS_RECALCULATION);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
anychart.core.Base.prototype.dispatchEvent = function(e) {
  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = e.toLowerCase();
  } else if ('type' in e) {
    e.type = String(e.type).toLowerCase();
  }
  return goog.base(this, 'dispatchEvent', e);
};


/**
 * Adds an event listener to an implementing object.<br/>
 * The listener can be added to an object once, and if it is added one more time,
 * its key will be returned.<br/>
 * <b>Note</b> Notice that if the existing listener is one-off (added
 * using listenOnce), it will cease to be such after calling the listen() method.
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
 *    counter++;
 *    title.text('You clicked ' + counter + ' times. Click again.');
 *  });
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Adds an event listener to an implementing object.<br/>
 * <b>After the event is called, its handler will be deleted.</b><br>
 * If the event handler being added already exists, listenOnce will do nothing. <br/>
 * <b>Note</b> In particular, if the handler is already registered using listen(), listenOnce()
 * <b>will not</b> make it one-off. Similarly, if a one-off listener already exists,
 * listenOnce will not change it (it wil remain one-off).
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
 *    counter++;
 *    title.text('You can\'t click anymore.');
 *  });
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Removes a listener added using listen() or listenOnce() methods.
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series. You have 3 clicks.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_CLICK, customListener);
 * var counter = 3;
 * function customListener(e){
 *     counter--;
 *     title.text('Click on line series. You have ' + counter + ' clicks.');
 *     if (counter == 0) {
 *         line.unlisten(anychart.enums.EventType.POINT_CLICK, customListener);
 *         title.text('You have no more clicks');
 *     }
 * }
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Removes an event listener which was added with listen() by the key returned by listen() or listenOnce().
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('Click on line series. You have 3 clicks.');
 * var counter = 0;
 * var listenKey = line.listen(anychart.enums.EventType.POINT_CLICK, customListener);
 * var counter = 3;
 * function customListener(e){
 *     counter--;
 *     title.text('Click on line series. You have ' + counter + ' clicks.');
 *     if (counter == 0) {
 *         line.unlistenByKey(listenKey);
 *         title.text('You have no more clicks');
 *     }
 * }
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
anychart.core.Base.prototype.unlistenByKey = function(key) {
  return goog.base(this, 'unlistenByKey', key);
};


/**
 * Removes all listeners from an object. You can also optionally remove listeners of some particular type.
 * @example <t>lineChart</t>
 * var line = chart.line([1, 4, 2, 6]);
 * var title = chart.title();
 * title.text('MouseOver the title and click on line series.');
 * var counter = 0;
 * line.listen(anychart.enums.EventType.POINT_MOUSE_OUT, function(e){
 *   title.fontColor('green');
 * });
 * line.listen(anychart.enums.EventType.POINT_MOUSE_OVER, function(e){
 *   title.fontColor('red');
 * });
 * line.listen(anychart.enums.EventType.POINT_CLICK, function(e){
 *   title.text('You can\'t click here anymore.').fontColor('black');
 *   line.removeAllListeners();
 * });
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
anychart.core.Base.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return goog.base(this, 'removeAllListeners', opt_type);
};


//exports
anychart.core.Base.prototype['listen'] = anychart.core.Base.prototype.listen;//doc|ex
anychart.core.Base.prototype['listenOnce'] = anychart.core.Base.prototype.listenOnce;//doc|ex
anychart.core.Base.prototype['unlisten'] = anychart.core.Base.prototype.unlisten;//doc|ex
anychart.core.Base.prototype['unlistenByKey'] = anychart.core.Base.prototype.unlistenByKey;//doc|ex
anychart.core.Base.prototype['removeAllListeners'] = anychart.core.Base.prototype.removeAllListeners;//doc|ex
anychart.core.Base.prototype['dispose'] = anychart.core.Base.prototype.dispose;
anychart.SignalEvent.prototype['targetNeedsRedraw'] = anychart.SignalEvent.prototype.targetNeedsRedraw;//doc
anychart.SignalEvent.prototype['targetBoundsChanged'] = anychart.SignalEvent.prototype.targetBoundsChanged;//doc
anychart.SignalEvent.prototype['targetDataChanged'] = anychart.SignalEvent.prototype.targetDataChanged;//doc
anychart.SignalEvent.prototype['targetMetaChanged'] = anychart.SignalEvent.prototype.targetMetaChanged;//doc
anychart.SignalEvent.prototype['targetNeedsReapplication'] = anychart.SignalEvent.prototype.targetNeedsReapplication;//doc
anychart.SignalEvent.prototype['targetNeedsRecalculation'] = anychart.SignalEvent.prototype.targetNeedsRecalculation;//doc
