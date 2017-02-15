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
  /**
   * So magical consistency state. Used to invalidate entities
   * that don't have own invalidation, can't be drawn but must
   * be able to dispatch signals.
   */
  ONLY_DISPATCHING: 0,
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
  /**
   * Accessibility settings.
   */
  A11Y: 1 << 5,
  //---------------------------------- DATA STATES (BASE) ---------------------------------
  /**
   * Data mask invalidated.
   */
  DATA_MASK: 1 << 0,
  //---------------------------------- CHART STATES (VB) ---------------------------------
  /**
   * Chart title has changed.
   */
  CHART_BACKGROUND: 1 << 6,
  /**
   * Chart title has changed.
   */
  CHART_TITLE: 1 << 7,
  /**
   * Chart title has changed.
   */
  CHART_LABELS: 1 << 8,
  // We also add SeparateChart states here to not to add prefix SEPARATE_CHART.
  // But if bullet or spark chart will need some new consistency states, there is a possibility to add 2 here.
  CHART_LEGEND: 1 << 9,
  CHART_CREDITS: 1 << 10,
  CHART_ANIMATION: 1 << 11,
  //---------------------------------- BULLET STATES (CHART) ---------------------------------
  BULLET_DATA: 1 << 12,
  BULLET_SCALES: 1 << 13,
  BULLET_AXES: 1 << 14,
  BULLET_AXES_MARKERS: 1 << 15,
  BULLET_MARKERS: 1 << 16,
  //---------------------------------- CARTESIAN STATES (CHART) ---------------------------------
  SERIES_CHART_PALETTE: 1 << 12,
  SERIES_CHART_MARKER_PALETTE: 1 << 13,
  SERIES_CHART_HATCH_FILL_PALETTE: 1 << 14,
  SERIES_CHART_SCALES: 1 << 15,
  SERIES_CHART_SERIES: 1 << 16,
  SERIES_CHART_SCALE_MAPS: 1 << 17,
  SERIES_CHART_Y_SCALES: 1 << 18,
  SERIES_CHART_STATISTICS: 1 << 19,
  AXES_CHART_AXES: 1 << 20,
  AXES_CHART_AXES_MARKERS: 1 << 21,
  AXES_CHART_GRIDS: 1 << 22,
  AXES_CHART_CROSSHAIR: 1 << 23,
  AXES_CHART_ANNOTATIONS: 1 << 24,
  CARTESIAN_ZOOM: 1 << 25,
  CARTESIAN_X_SCROLLER: 1 << 26,
  //---------------------------------- PYRAMID/FUNNEL STATES (CHART) ---------------------------------
  PYRAMID_FUNNEL_LABELS: 1 << 12,
  PYRAMID_FUNNEL_MARKERS: 1 << 13,
  PYRAMID_FUNNEL_DATA: 1 << 14,
  //---------------------------------- GANTT STATES (CHART) ---------------------------------
  GANTT_DATA: 1 << 12,
  GANTT_POSITION: 1 << 13,
  GANTT_SPLITTER_POSITION: 1 << 14,
  //---------------------------------- PIE STATES (CHART) ---------------------------------
  PIE_LABELS: 1 << 12,
  PIE_DATA: 1 << 13,
  //---------------------------------- POLAR STATES (CHART) ---------------------------------
  POLAR_PALETTE: 1 << 12,
  POLAR_MARKER_PALETTE: 1 << 13,
  POLAR_HATCH_FILL_PALETTE: 1 << 14,
  POLAR_SCALES: 1 << 15,
  POLAR_SERIES: 1 << 16,
  POLAR_AXES: 1 << 17,
  POLAR_GRIDS: 1 << 18,
  //---------------------------------- RADAR STATES (CHART) ---------------------------------
  RADAR_PALETTE: 1 << 12,
  RADAR_MARKER_PALETTE: 1 << 13,
  RADAR_HATCH_FILL_PALETTE: 1 << 14,
  RADAR_SCALES: 1 << 15,
  RADAR_SERIES: 1 << 16,
  RADAR_AXES: 1 << 17,
  RADAR_GRIDS: 1 << 18,
  //---------------------------------- SCATTER STATES (CHART) ---------------------------------
  SCATTER_PALETTE: 1 << 12,
  SCATTER_MARKER_PALETTE: 1 << 13,
  SCATTER_HATCH_FILL_PALETTE: 1 << 14,
  SCATTER_SCALES: 1 << 15,
  SCATTER_SERIES: 1 << 16,
  SCATTER_AXES: 1 << 17,
  SCATTER_AXES_MARKERS: 1 << 18,
  SCATTER_GRIDS: 1 << 19,
  SCATTER_CROSSHAIR: 1 << 20,
  //---------------------------------- SPARKLINE STATES (CHART) ---------------------------------
  SPARK_SCALES: 1 << 12,
  SPARK_SERIES: 1 << 13,
  SPARK_AXES_MARKERS: 1 << 14,
  //---------------------------------- MAP STATES (CHART) ---------------------------------
  MAP_SCALE: 1 << 12,
  MAP_COLOR_SCALE: 1 << 13,
  MAP_GEO_DATA: 1 << 14,
  MAP_SERIES: 1 << 15,
  MAP_PALETTE: 1 << 16,
  MAP_MARKER_PALETTE: 1 << 17,
  MAP_HATCH_FILL_PALETTE: 1 << 18,
  MAP_COLOR_RANGE: 1 << 19,
  MAP_MOVE: 1 << 20,
  MAP_ZOOM: 1 << 21,
  MAP_GEO_DATA_INDEX: 1 << 22,
  MAP_LABELS: 1 << 23,
  MAP_CALLOUT: 1 << 24,
  MAP_AXES: 1 << 25,
  MAP_GRIDS: 1 << 26,
  MAP_CROSSHAIR: 1 << 27,
  //---------------------------------- HEAT MAP STATES (CHART) ---------------------------------
  HEATMAP_SCALES: 1 << 12,
  HEATMAP_SERIES: 1 << 13,
  HEATMAP_AXES: 1 << 14,
  HEATMAP_GRIDS: 1 << 15,
  HEATMAP_COLOR_SCALE: 1 << 16,
  HEATMAP_X_SCROLLER: 1 << 17,
  HEATMAP_Y_SCROLLER: 1 << 18,
  HEATMAP_ZOOM: 1 << 19,
  //---------------------------------- SERIES STATES (VB) ---------------------------------
  // also combined, due to a very big prefix
  SERIES_HATCH_FILL: 1 << 6, //
  SERIES_MARKERS: 1 << 7, //
  SERIES_LABELS: 1 << 8, //
  SERIES_DATA: 1 << 9,
  SERIES_POINTS: 1 << 10, //
  SERIES_COLOR: 1 << 11, //
  SERIES_CLIP: 1 << 12, //
  SERIES_ERROR: 1 << 13, //
  SERIES_OUTLIERS: 1 << 14, //
  SERIES_SHAPE_MANAGER: 1 << 15,
  //---------------------------------- AXES STATES (VB) ---------------------------------
  CALLOUT_TITLE: 1 << 6,
  CALLOUT_LABELS: 1 << 7,
  CALLOUT_BACKGROUND: 1 << 8,
  //---------------------------------- AXES STATES (VB) ---------------------------------
  // also combined
  AXIS_TITLE: 1 << 6,
  AXIS_LABELS: 1 << 7,
  AXIS_TICKS: 1 << 8,
  AXIS_OVERLAP: 1 << 9,
  //---------------------------------- AXES STATES (AXIS) ---------------------------------
  COLOR_RANGE_MARKER: 1 << 10,
  //---------------------------------- GANTT CONTROLLER STATES (VB) ---------------------------------
  CONTROLLER_DATA: 1 << 6,
  CONTROLLER_VISIBILITY: 1 << 7,
  CONTROLLER_POSITION: 1 << 8,
  //---------------------------------- GANTT TIMELINE STATES (VB) ---------------------------------
  TIMELINE_SCALES: 1 << 9,
  //---------------------------------- GANTT TIMELINE HEADER STATES (VB) ---------------------------------
  TIMELINE_HEADER_SCALES: 1 << 6,
  //---------------------------------- GANTT TIMELINE HEADER LEVEL STATES (VB) ---------------------------------
  TIMELINE_HEADER_LEVEL_LABELS: 1 << 6,
  TIMELINE_HEADER_LEVEL_TICKS: 1 << 7,
  //---------------------------------- GRIDS STATES (VB) ---------------------------------
  // also combined
  GRIDS_POSITION: 1 << 6,
  //---------------------------------- BASE GRIDS STATES (VB) ---------------------------------
  BASE_GRID_REDRAW: 1 << 7,
  BASE_GRID_HOVER: 1 << 8,
  //---------------------------------- BUTTON STATES (VB) ---------------------------------
  BUTTON_BACKGROUND: 1 << 6,
  BUTTON_CURSOR: 1 << 7,
  //---------------------------------- CREDITS STATES (VB) ---------------------------------
  CREDITS_POSITION: 1 << 6,
  CREDITS_REDRAW_IMAGE: 1 << 7,
  //---------------------------------- DATA GRID STATES (BASE GRID) ---------------------------------
  DATA_GRID_GRIDS: 1 << 9,
  //---------------------------------- DATA GRID COLUMN STATES (VB) ---------------------------------
  DATA_GRID_COLUMN_TITLE: 1 << 6,
  DATA_GRID_COLUMN_POSITION: 1 << 7,
  DATA_GRID_COLUMN_BUTTON_CURSOR: 1 << 8,
  //---------------------------------- BACKGROUND STATES (VB) ---------------------------------
  BACKGROUND_POINTER_EVENTS: 1 << 6,
  //---------------------------------- LABEL STATES (VB) ---------------------------------
  LABEL_BACKGROUND: 1 << 6,
  //---------------------------------- LABELS FACTORY STATES (VB) ---------------------------------
  LABELS_FACTORY_BACKGROUND: 1 << 6,
  LABELS_FACTORY_HANDLERS: 1 << 7,
  LABELS_FACTORY_CLIP: 1 << 8,
  LABELS_FACTORY_CONNECTOR: 1 << 9,
  //---------------------------------- LEGEND STATES (VB) ---------------------------------
  LEGEND_BACKGROUND: 1 << 6,
  LEGEND_TITLE: 1 << 7,
  LEGEND_SEPARATOR: 1 << 8,
  LEGEND_PAGINATOR: 1 << 9,
  LEGEND_RECREATE_ITEMS: 1 << 10,
  LEGEND_DRAG: 1 << 11,
  //---------------------------------- MARKERS FACTORY STATES (VB) ---------------------------------
  MARKERS_FACTORY_HANDLERS: 1 << 6,
  //---------------------------------- PAGINATOR STATES (VB) ---------------------------------
  PAGINATOR_BACKGROUND: 1 << 6,
  //---------------------------------- SCROLLBAR STATES (VB) ---------------------------------
  SCROLLBAR_POSITION: 1 << 6,
  //---------------------------------- SPLITTER STATES (VB) ---------------------------------
  SPLITTER_POSITION: 1 << 6,
  //---------------------------------- TITLE STATES (VB) ---------------------------------
  TITLE_BACKGROUND: 1 << 6,
  //---------------------------------- TOOLTIP STATES (VB) ---------------------------------
  // actually its for TooltipItem, but tooltip doesn't have any states and we hope they will merge
  TOOLTIP_POSITION: 1 << 6,
  TOOLTIP_TITLE: 1 << 7,
  TOOLTIP_SEPARATOR: 1 << 8,
  TOOLTIP_CONTENT: 1 << 9,
  TOOLTIP_BACKGROUND: 1 << 10,
  TOOLTIP_VISIBILITY: 1 << 11,
  TOOLTIP_MODE: 1 << 12,
  TOOLTIP_ALLOWANCE: 1 << 13, //allowLeaveScreen or allowLeaveChart.
  //------------------------------ CIRCULAR/LINEAR GAUGE (CHART) ------------------------------
  GAUGE_POINTERS: 1 << 12,
  GAUGE_KNOB: 1 << 13,
  GAUGE_CAP: 1 << 14,
  GAUGE_AXES: 1 << 15,
  GAUGE_HATCH_FILL: 1 << 16,
  GAUGE_AXIS_MARKERS: 1 << 17,
  GAUGE_SCALE: 1 << 18,
  GAUGE_MARKER_PALETTE: 1 << 19,
  GAUGE_COLOR_SCALE: 1 << 20,
  GAUGE_PALETTE: 1 << 21,
  GAUGE_HATCH_FILL_PALETTE: 1 << 22,
  GAUGE_SCALE_BAR: 1 << 23,
  GAUGE_POINTER_LABEL: 1 << 13, // reset knob state for linear gauge, cause it doesn't need it
  //---------------------------------- TABLE (VB) ---------------------------------------------
  TABLE_CELL_BOUNDS: 1 << 6,
  TABLE_OVERLAP: 1 << 7,
  TABLE_BORDERS: 1 << 8,
  TABLE_FILLS: 1 << 9,
  TABLE_CONTENT: 1 << 10,
  TABLE_STRUCTURE: 1 << 11,
  //---------------------------------- SCROLLER (VB) ---------------------------------------------
  SCROLLER_THUMBS_SHAPE: 1 << 6,
  SCROLLER_ORIENTATION: 1 << 7,
  SCROLLER_AUTO_HIDE: 1 << 8,
  //---------------------------------- STOCK CHART (CHART) -------------------------------------------
  STOCK_PLOTS_APPEARANCE: 1 << 12,
  STOCK_SCROLLER: 1 << 13,
  STOCK_DATA: 1 << 14,
  STOCK_SCALES: 1 << 15,
  //---------------------------------- STOCK PLOT (VB) -------------------------------------------
  STOCK_PLOT_BACKGROUND: 1 << 6,
  STOCK_PLOT_SERIES: 1 << 7,
  STOCK_PLOT_AXES: 1 << 8,
  STOCK_PLOT_DT_AXIS: 1 << 9,
  STOCK_PLOT_GRIDS: 1 << 10,
  STOCK_PLOT_LEGEND: 1 << 11,
  STOCK_PLOT_PALETTE: 1 << 12,
  STOCK_PLOT_ANNOTATIONS: 1 << 13,
  //---------------------------------- STOCK DATETIME AXIS (VB) ----------------------------------------
  STOCK_DTAXIS_BACKGROUND: 1 << 6,
  //---------------------------------- STOCK SCROLLER (SCROLLER) ----------------------------------------
  STOCK_SCROLLER_SERIES: 1 << 9,
  STOCK_SCROLLER_AXIS: 1 << 10,
  //---------------------------------- TREE MAP CHART (SEPARATE CHART) ----------------------------------
  TREEMAP_DATA: 1 << 12,
  TREEMAP_LABELS: 1 << 13,
  TREEMAP_MARKERS: 1 << 14,
  TREEMAP_COLOR_SCALE: 1 << 15,
  TREEMAP_NODE_TYPES: 1 << 16,
  TREEMAP_COLOR_RANGE: 1 << 17,
  TREEMAP_HINT_OPACITY: 1 << 18,
  //---------------------------------- PERT CHART (SEPARATE CHART) ----------------------------------
  PERT_DATA: 1 << 12,
  PERT_CALCULATIONS: 1 << 13,
  PERT_LABELS: 1 << 14,
  PERT_APPEARANCE: 1 << 15,
  //---------------------------------- ANNOTATIONS (VB) ----------------------------------
  ANNOTATIONS_ANCHORS: 1 << 6,
  ANNOTATIONS_LAST_POINT: 1 << 7,
  ANNOTATIONS_SHAPES: 1 << 8,
  ANNOTATIONS_MARKERS: 1 << 9,
  ANNOTATIONS_INTERACTIVITY: 1 << 10,
  ANNOTATIONS_LABELS: 1 << 11,
  ANNOTATIONS_LEVELS: 1 << 12,
  //---------------------------------- ANNOTATIONS (VB) ----------------------------------
  ANNOTATIONS_CONTROLLER_ANNOTATIONS: 1 << 6,
  ANNOTATIONS_CONTROLLER_DRAWING_MODE: 1 << 7,
  //---------------------------------- RESOURCE LIST (VB) --------------------------------
  RESOURCE_LIST_BACKGROUND: 1 << 6,
  RESOURCE_LIST_SCROLL: 1 << 7,
  RESOURCE_LIST_ITEMS: 1 << 8,
  RESOURCE_LIST_DATA: 1 << 9,
  RESOURCE_LIST_IMAGES_SETTINGS: 1 << 10,
  RESOURCE_LIST_NAMES_SETTINGS: 1 << 11,
  RESOURCE_LIST_TYPES_SETTINGS: 1 << 12,
  RESOURCE_LIST_DESCRIPTIONS_SETTINGS: 1 << 13,
  RESOURCE_LIST_TAGS_SETTINGS: 1 << 14,
  RESOURCE_LIST_OVERLAY: 1 << 15,
  //---------------------------------- RESOURCE (CHART) ----------------------------------
  RESOURCE_RESOURCE_LIST: 1 << 12,
  RESOURCE_TIME_LINE: 1 << 13,
  RESOURCE_X_SCROLL: 1 << 14,
  RESOURCE_Y_SCROLL: 1 << 15,
  RESOURCE_GRID: 1 << 16,
  RESOURCE_X_SCALE_RANGE: 1 << 17,
  RESOURCE_X_SCALE_POSITION: 1 << 18,
  RESOURCE_DATA: 1 << 19,
  RESOURCE_Y_RANGE: 1 << 20,
  RESOURCE_RESOURCES: 1 << 21,
  RESOURCE_LOGO: 1 << 22,
  RESOURCE_OVERLAY: 1 << 23,
  RESOURCE_SPLITTER: 1 << 24,
  RESOURCE_CONFLICTS: 1 << 25,
  //---------------------------------- RESOURCE GRID (VB) ----------------------------------
  RESOURCE_GRID_BACKGROUND: 1 << 6,
  RESOURCE_GRID_TICKS: 1 << 7,
  RESOURCE_GRID_POSITION: 1 << 8,
  RESOURCE_GRID_OVERLAY: 1 << 9,
  //---------------------------------- RESOURCE TIMELINE (VB) ----------------------------------
  RESOURCE_TIMELINE_BACKGROUND: 1 << 6,
  RESOURCE_TIMELINE_TICKS: 1 << 7,
  RESOURCE_TIMELINE_LABELS: 1 << 8,
  RESOURCE_TIMELINE_LEVELS: 1 << 9,
  RESOURCE_TIMELINE_OVERLAY: 1 << 10,
  //---------------------------------- RESOURCE LOGO (BACKGROUND) ----------------------------------
  RESOURCE_LOGO_OVERLAY: 1 << 7,
  //---------------------------------- RESOURCE RESOURCE (B) -----------------------------
  RESOURCE_RESOURCE_DATA: 1 << 0,
  RESOURCE_RESOURCE_SCHEDULE: 1 << 1,
  //---------------------------------- RESOURCE CONFLICTS (VB) -----------------------------
  RESOURCE_CONFLICTS_LABELS: 1 << 6,
  RESOURCE_CONFLICTS_CONFLICTS: 1 << 7,
  //---------------------------------- DATE TIME WITH CALENDAR -----------------------------
  DTWC_TS_GRID: 1 << 0,
  DTWC_TS_GRID_ZERO: 1 << 1,
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
  NEED_UPDATE_TICK_DEPENDENT: 1 << 9,
  NEED_UPDATE_OVERLAP: 1 << 10,
  NEEDS_UPDATE_A11Y: 1 << 11,
  NEEDS_REDRAW_LABELS: 1 << 12,
  NEEDS_REDRAW_APPEARANCE: 1 << 13,
  NEEDS_UPDATE_TOOLTIP: 1 << 14,
  ENABLED_STATE_CHANGED: 1 << 15,
  Z_INDEX_STATE_CHANGED: 1 << 16,
  NEED_RECALCULATE_LEGEND: 1 << 17
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
  anychart.core.Base.base(this, 'constructor');
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
 * @param {...*} var_args Arguments to setup the instance.
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
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {*} value Arguments to setup the instance.
 * @param {boolean=} opt_default .
 * @return {anychart.core.Base} Returns itself for chaining.
 */
anychart.core.Base.prototype.setupByVal = function(value, opt_default) {
  if (goog.isDef(value)) {
    this.suspendSignalsDispatching();
    if (!this.specialSetupByVal(value, opt_default) && goog.isObject(value)) {
      //if (arg0 instanceof anychart.core.Base)
      //  throw 'Instance of object is passed to setter. You should use JSON instead';
      this.setupByJSON(/** @type {!Object} */(value), opt_default);
    }
    this.resumeSignalsDispatching(true);
  }
  return this;
};


/**
 * Setups current instance using passed JSON object.
 * @param {!Object} json .
 * @param {boolean=} opt_default Identifies that we should setup defaults.
 */
anychart.core.Base.prototype.setupByJSON = function(json, opt_default) {
};


/**
 * Special objects to setup current instance.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.core.Base.prototype.setupSpecial = function(var_args) {
  return this.specialSetupByVal(arguments[0]);
};


/**
 * Setups current instance using passed JSON object.
 * @param {Object|Array|number|string|undefined|boolean|null} value .
 * @param {boolean=} opt_default .
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.core.Base.prototype.specialSetupByVal = function(value, opt_default) {
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
  anychart.SignalEvent.base(this, 'constructor', anychart.enums.EventType.SIGNAL, target);

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
  return anychart.core.Base.base(this, 'dispatchEvent', e);
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
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.core.Base.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
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
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.Base.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.core.Base.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
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
 *     if (!counter) {
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
  return anychart.core.Base.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
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
 *     if (!counter) {
 *         line.unlistenByKey(listenKey);
 *         title.text('You have no more clicks');
 *     }
 * }
 * @param {!goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
anychart.core.Base.prototype.unlistenByKey = function(key) {
  return anychart.core.Base.base(this, 'unlistenByKey', key);
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
  return anychart.core.Base.base(this, 'removeAllListeners', opt_type);
};


//exports
(function() {
  var proto = anychart.core.Base.prototype;
  proto['listen'] = proto.listen;//doc|ex
  proto['listenOnce'] = proto.listenOnce;//doc|ex
  proto['unlisten'] = proto.unlisten;//doc|ex
  proto['unlistenByKey'] = proto.unlistenByKey;//doc|ex
  proto['removeAllListeners'] = proto.removeAllListeners;//doc|ex
  proto['dispose'] = proto.dispose;
  proto = anychart.SignalEvent.prototype;
  proto['targetNeedsRedraw'] = proto.targetNeedsRedraw;//doc
  proto['targetBoundsChanged'] = proto.targetBoundsChanged;//doc
  proto['targetDataChanged'] = proto.targetDataChanged;//doc
  proto['targetMetaChanged'] = proto.targetMetaChanged;//doc
  proto['targetNeedsReapplication'] = proto.targetNeedsReapplication;//doc
  proto['targetNeedsRecalculation'] = proto.targetNeedsRecalculation;//doc
  goog.exportSymbol('anychart.PointState.NORMAL', anychart.PointState.NORMAL);
  goog.exportSymbol('anychart.PointState.HOVER', anychart.PointState.HOVER);
  goog.exportSymbol('anychart.PointState.SELECT', anychart.PointState.SELECT);
})();
