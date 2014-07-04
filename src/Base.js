goog.provide('anychart.Base');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * The list of elements consistency states.
 * @enum {number}
 */
anychart.ConsistencyState = {
  /**
   * enabled() has changed.
   */
  ENABLED: 0x00000001,
  /**
   * Container has changed.
   */
  CONTAINER: 0x00000002,
  /**
   * Z index has changed.
   */
  Z_INDEX: 0x00000004,
  /**
   * Visual settings have changed (fill, stroke, etc.).
   */
  APPEARANCE: 0x00000008,
  /**
   * Size has changed.
   */
  BOUNDS: 0x00000010,
  /**
   * Background has changed.
   */
  BACKGROUND: 0x00000020,
  /**
   * Data has changed.
   */
  DATA: 0x00000040,
  /**
   * Title has changed.
   */
  TITLE: 0x00000080,
  /**
   * Axes has changed.
   */
  AXES: 0x00000100,
  /**
   * Palette has changed.
   */
  PALETTE: 0x00000200,
  /**
   * Scales have changed.
   */
  SCALES: 0x00000400,
  /**
   * Series have changed.
   */
  SERIES: 0x00000800,
  /**
   * Ticks have changed.
   */
  TICKS: 0x00001000,
  /**
   * Markers have changed.
   */
  MARKERS: 0x00002000,
  /**
   * Minor ticks have changed.
   */
  MINOR_TICKS: 0x00004000,
  /**
   * Labels have changed.
   */
  LABELS: 0x00008000,
  /**
   * Minor labels have changed.
   */
  MINOR_LABELS: 0x00010000,
  /**
   * Separator has changed.
   */
  SEPARATOR: 0x00020000,
  /**
   * Paginator has changed.
   */
  PAGINATOR: 0x00040000,
  /**
   * Legend has changed.
   */
  LEGEND: 0x00080000,
  /**
   * Overlap has changed.
   */
  OVERLAP: 0x00100000,
  /**
   * Visibility has changed.
   */
  VISIBILITY: 0x00200000,
  /**
   * Position has changed.
   */
  POSITION: 0x00400000,
  /**
   * Click.
   */
  CLICK: 0x00800000,
  /**
   * Hover.
   */
  HOVER: 0x01000000,
  /**
   * Axes markers have changed.
   */
  AXES_MARKERS: 0x02000000,
  /**
   * Grids have changed.
   */
  GRIDS: 0x04000000,
  /**
   * Handlers set has changed.
   */
  HANDLERS: 0x08000000,
  /**
   * Chart labels have changed (weird naming due to the fact that we use LABELS state for pie chart)
   */
  CHART_LABELS: 0x10000000,
  /**
   * Marker palette has changed.
   */
  MARKER_PALETTE: 0x20000000,
  /**
   * Hatch fill has changed
   */
  HATCH_FILL: 0x40000000,
  /**
   * Combination of all states.
   */
  ALL: 0xFFFFFFFF
};


/**
 * List of all possible signals.
 * @enum {number}
 */
anychart.Signal = {
  NEEDS_REDRAW: 0x00000001,
  NEEDS_REAPPLICATION: 0x00000002,
  NEEDS_RECALCULATION: 0x00000004,
  BOUNDS_CHANGED: 0x00000008,
  DATA_CHANGED: 0x00000010,

  RESERVED_6: 0x00000020,
  RESERVED_7: 0x00000040,
  RESERVED_8: 0x00000080,
  RESERVED_9: 0x00000100,
  RESERVED_10: 0x00000200,
  RESERVED_11: 0x00000400,
  RESERVED_12: 0x00000800,
  RESERVED_13: 0x00001000,
  RESERVED_14: 0x00002000,
  RESERVED_15: 0x00004000,
  RESERVED_16: 0x00008000,
  RESERVED_17: 0x00010000,
  RESERVED_18: 0x00020000,
  RESERVED_19: 0x00040000,
  RESERVED_20: 0x00080000,
  RESERVED_21: 0x00100000,
  RESERVED_22: 0x00200000,
  RESERVED_23: 0x00400000,
  RESERVED_24: 0x00800000,
  RESERVED_25: 0x01000000,
  RESERVED_26: 0x02000000,
  RESERVED_27: 0x04000000,
  RESERVED_28: 0x08000000,
  RESERVED_29: 0x10000000,
  RESERVED_30: 0x20000000,
  RESERVED_31: 0x40000000
};



/**
 * Class implementins all the work with consistency states.
 * invalidate() and markConsistent() are used to change states.
 * isConsistent() and hasInvalidationState() are used to check states.
 * @constructor
 * @name anychart.Base
 * @extends {goog.events.EventTarget}
 */
anychart.Base = function() {
  goog.base(this);
};
goog.inherits(anychart.Base, goog.events.EventTarget);


/**
 * String with event sent by Invalidatable class.
 * @const {string}
 */
anychart.Base.SIGNAL = 'signal';


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.Base.prototype.SUPPORTED_SIGNALS = 0;


/**
 * Supported consistency states mask.
 * @type {number}
 */
anychart.Base.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Current consistency state. Equals zero when element is consistent.
 * @type {number}
 * @private
 */
anychart.Base.prototype.consistency_ = 0;


/**
 * If NaN - no dispatching suspend is active.
 * If a number - contains the cumulative signal for all suspended states that had to be dispatched during the suspend.
 * @type {number}
 * @protected
 */
anychart.Base.prototype.suspendedDispatching = NaN;


/**
 * Dispatching suspend level to support suspend-resume stacking.
 * @type {number}
 * @protected
 */
anychart.Base.prototype.suspensionLevel = 0;


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {function(this:SCOPE, anychart.SignalEvent):(boolean|undefined)} listener Callback
 *     method.
 * @param {SCOPE=} opt_scope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE
 */
anychart.Base.prototype.listenSignals = function(listener, opt_scope) {
  return this.listen(anychart.Base.SIGNAL, listener, false, opt_scope);
};


/**
 * Sets consistency state to an element {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state State(s) to be set.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistensy states.
 */
anychart.Base.prototype.invalidate = function(state, opt_signal) {
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
anychart.Base.prototype.markConsistent = function(state) {
  this.consistency_ &= ~state;
};


/**
 * Checks if an element has any consistency state set.
 * @return {boolean} True if it has it.
 */
anychart.Base.prototype.isConsistent = function() {
  return !this.consistency_;
};


/**
 * Checks of an element has a consistency state(s).
 * @param {anychart.ConsistencyState|number} state State(s) to be checked.
 * @return {boolean} True if it has it.
 */
anychart.Base.prototype.hasInvalidationState = function(state) {
  return !!(this.consistency_ & state);
};


/**
 * Sends invalidation event to listeners.
 *
 * NOTE: YOU CAN ONLY SEND SIGNALS FROM SUPPORTED_SIGNALS MASK!
 *
 * @param {anychart.Signal|number} state Invalidation state(s).
 */
anychart.Base.prototype.dispatchSignal = function(state) {
  state &= this.SUPPORTED_SIGNALS;
  if (!state) return;
  if (isNaN(this.suspendedDispatching)) {
    //if (this.hasListener(anychart.Base.SIGNAL, false)) {
    //  var signal = [];
    //  for (var i in anychart.Signal) {
    //    if (!!(anychart.Signal[i] & state))
    //      signal.push(i);
    //  }
    //  goog.global['console']['log']('dispatching invalidation', signal.join(' | '), 'at\n', this, '\n');
    //}
    this.dispatchEvent(new anychart.SignalEvent(this, state));
  } else {
    this.suspendedDispatching |= state;
    //goog.global['console']['log']('dispatching suspended in', this);
  }
};


/**
 * Suspends dispatching of invalidation events. The dispatching can be resumed with or without cumulative dispatching
 * of all affected states.
 * @return {!anychart.Base} Itself for chaining.
 */
anychart.Base.prototype.suspendSignalsDispatching = function() {
  this.suspensionLevel++;
  if (isNaN(this.suspendedDispatching))
    this.suspendedDispatching = 0;
  return this;
};


/**
 * Resumes dispatching of invalidation events.
 * @param {boolean} doDispatchSuspendedSignals Whether to dispatch all signals that were to be dispatched while the
 *    suspend or not.
 * @return {!anychart.Base} Itself for chaining.
 */
anychart.Base.prototype.resumeSignalsDispatching = function(doDispatchSuspendedSignals) {
  if (isNaN(this.suspendedDispatching) || --this.suspensionLevel)
    return this;
  var eventsToDispatch = this.suspendedDispatching;
  this.suspendedDispatching = NaN;
  if (doDispatchSuspendedSignals && eventsToDispatch)
    this.dispatchSignal(eventsToDispatch);
  return this;
};


/**
 * Deserializes element to JSON.
 * @return {Object} Deserialized JSON object of element.
 */
anychart.Base.prototype.serialize = function() {
  return {};
};


/**
 * Deserializes element from JSON.
 * @param {Object} config Config of an element.
 * @return {anychart.Base} Returns itself for chaining.
 */
anychart.Base.prototype.deserialize = function(config) {
  return this;
};


/**
 * Dispatches external event with a timeout to detach it from the other code execution frame.
 * @param {goog.events.EventLike} event Event object.
 */
anychart.Base.prototype.dispatchDetachedEvent = function(event) {
  setTimeout(goog.bind(this.dispatchEvent, this, event), 0);
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.Base|Array.<anychart.Base>)} var_args
 */
anychart.Base.suspendSignalsDispatching = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.Base.suspendSignalsDispatching.apply(null, obj);
    else if (obj instanceof anychart.Base)
      (/** @type {anychart.Base} */(obj)).suspendSignalsDispatching();
  }
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.Base|Array.<anychart.Base>)} var_args
 */
anychart.Base.resumeSignalsDispatchingTrue = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.Base.resumeSignalsDispatchingTrue.apply(null, obj);
    else if (obj instanceof anychart.Base)
      (/** @type {anychart.Base} */(obj)).resumeSignalsDispatching(true);
  }
};


/**
 * Suspends dispatching for all passed arguments. Any argument can also be an array.
 * @param {...(anychart.Base|Array.<anychart.Base>)} var_args
 */
anychart.Base.resumeSignalsDispatchingFalse = function(var_args) {
  for (var i = arguments.length; i--;) {
    var obj = arguments[i];
    if (goog.isArray(obj))
      anychart.Base.resumeSignalsDispatchingFalse.apply(null, obj);
    else if (obj instanceof anychart.Base)
      (/** @type {anychart.Base} */(obj)).resumeSignalsDispatching(false);
  }
};



/**
 * Special event for changes in dirty states.
 * @param {anychart.Base} target Event target.
 * @param {number} invalidatedStates Changes effectively happened with the target.
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.SignalEvent = function(target, invalidatedStates) {
  goog.base(this, anychart.Base.SIGNAL, target);

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
 * @return {boolean} True if element has it.
 */
anychart.SignalEvent.prototype.hasSignal = function(state) {
  return !!(this.signals & state);
};
