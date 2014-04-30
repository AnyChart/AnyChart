goog.provide('anychart.Base');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * Список возможных флагов целостности в текущем состоянии элемента.
 * @enum {number}
 */
anychart.ConsistencyState = {
  /**
   * Означает, что поменялось значение свойства enabled()
   */
  ENABLED: 0x00000001,
  /**
   * Означает, что поменялся контейнер.
   */
  CONTAINER: 0x00000002,
  /**
   * Означает, что поменялся Z индекс.
   */
  Z_INDEX: 0x00000004,
  /**
   * Означает, что изменились визуальные настройки (например, fill или stroke).
   */
  APPEARANCE: 0x00000008,
  /**
   * Означает, что изменились размеры элемента
   */
  BOUNDS: 0x00000010,
  /**
   * Означает, что изменился фон элемента.
   */
  BACKGROUND: 0x00000020,
  /**
   * Означает, что изменились данные.
   */
  DATA: 0x00000040,
  /**
   * Означает, что именился заголовок.
   */
  TITLE: 0x00000080,
  /**
   * Изменились оси.
   */
  AXES: 0x00000100,
  /**
   * Изменлась палитра.
   */
  PALETTE: 0x00000200,
  /**
   * Изменились шкалы.
   */
  SCALES: 0x00000400,
  /**
   * Серии изменились.
   */
  SERIES: 0x00000800,
  /**
   * Тики изменились.
   */
  TICKS: 0x00001000,
  /**
   * Маркеры изменились.
   */
  MARKERS: 0x00002000,
  /**
   * Минорные тики изменились.
   */
  MINOR_TICKS: 0x00004000,
  /**
   * Лэйблы изменились.
   */
  LABELS: 0x00008000,
  /**
   * Минорные лейблы изменились.
   */
  MINOR_LABELS: 0x00010000,
  /**
   * Сепаратор изменился.
   */
  SEPARATOR: 0x00020000,
  /**
   * Пагинатор изменился.
   */
  PAGINATOR: 0x00040000,
  /**
   * Легенда изменилась.
   */
  LEGEND: 0x00080000,
  /**
   * Оверлап изменился.
   */
  OVERLAP: 0x00100000,
  /**
   * Видимость изменилась.
   */
  VISIBILITY: 0x00200000,
  /**
   * Позиция изменилась.
   */
  POSITION: 0x00400000,
  /**
   * Клик.
   */
  CLICK: 0x00800000,
  /**
   * Ховер.
   */
  HOVER: 0x01000000,
  /**
   * Маркеры оси изменились.
   */
  AXES_MARKERS: 0x02000000,
  /**
   * Гриды изменились.
   */
  GRIDS: 0x04000000,
  /**
   * Состав хэндлеров событий изменился.
   */
  HANDLERS: 0x08000000,
  /**
   * Лейблы чарта (появились из-за того, что pie уже занял стейт LABELS)
   */
  CHART_LABELS: 0x10000000,
  RESERVED_30: 0x20000000,
  RESERVED_31: 0x40000000,
  /**
   * Комбинация всех состояний.
   */
  ALL: 0xFFFFFFFF
};


/**
 * Список возможных сигналов.
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
 * Класс, реализующий функциональность по работе элемента с состояниями целостности.
 * Изменять состояния целостности можно методами invalidate() и markConsistent().
 * Проверять наличие - методами isConsistent() и hasInvalidationState().
 * @constructor
 * @name anychart.Base
 * @extends {goog.events.EventTarget}
 */
anychart.Base = function() {
  goog.base(this);
};
goog.inherits(anychart.Base, goog.events.EventTarget);


/**
 * Строка с событием, которое отправляется классом Invalidatable.
 * @const {string}
 */
anychart.Base.SIGNAL = 'signal';


/**
 * Маска состояний рассинхронизации, которые умеет отправлять этот объект.
 * @type {number}
 */
anychart.Base.prototype.SUPPORTED_SIGNALS = 0;


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.Base.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Текущее состояние целостности элемента. Если оно равно нулю - элемент согласован.
 * @type {number}
 * @private
 */
anychart.Base.prototype.consistency_ = 0;


/**
 * If NaN - no dispatching suspending is active.
 * If a number - contains the cumulative signal for all suspended states that were to be dispatched during the suspend.
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
 * Устанавливает элементу переданную комбинацию состояний рассинхронизации {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state Состояние, которые нужно установить (или комбинация состояний).
 * @param {(anychart.Signal|number)=} opt_signal Сигнал или комбинация, которые нужно отправить слушателям, если
 *    состояния были установлены.
 * @return {number} Композиция состояний связности, которые реально изменились.
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
 * Очищает у элемента переданное состояние рассинхронизации.
 * @param {anychart.ConsistencyState|number} state Состояние, которое нужно очистить (или комбинация состояний).
 */
anychart.Base.prototype.markConsistent = function(state) {
  this.consistency_ &= ~state;
};


/**
 * Проверяет, имеет ли элемент хоть какое-нибудь состояние рассинхронизации.
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.Base.prototype.isConsistent = function() {
  return !this.consistency_;
};


/**
 * Проверяет, имеет ли элемент переданное состояние рассинхронизации (или хотя бы одно из комбинации).
 * @param {anychart.ConsistencyState|number} state Состояние, которое нужно проверить (или комбинация).
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.Base.prototype.hasInvalidationState = function(state) {
  return !!(this.consistency_ & state);
};


/**
 * Отправляет подписчикам событие инвалидации объекта.
 *
 * NOTE: ОТПРАВИТЬСЯ МОГУТ ТОЛЬКО ТЕ СИГНАЛЫ, КОТОРЫЕ ЕСТЬ В МАСКЕ SUPPORTED_SIGNALS!
 *
 * @param {anychart.Signal|number} state Установленные состояния инвалидации.
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
 * Suspends invalidation events dispatching. The dispatching can be then resumed with or without cumulative dispatching
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
 * @param {Object} config Config of the element.
 * @return {anychart.Base} return itself for chaining.
 */
anychart.Base.prototype.deserialize = function(config) {
  return this;
};


/**
 * Dispatches external event with a timeout to detach it from other code execution frame.
 * @param {goog.events.EventLike} event Event object.
 */
anychart.Base.prototype.dispatchDetachedEvent = function(event) {
  setTimeout(goog.bind(this.dispatchEvent, this, event), 0);
};


/**
 * Suspends dispatching for all passed arguments. Any argument can be an array also.
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
 * Suspends dispatching for all passed arguments. Any argument can be an array also.
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
 * Suspends dispatching for all passed arguments. Any argument can be an array also.
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
 * @param {number} invalidatedStates Changes effectively happen with the target.
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
 * Проверяет, имеет ли элемент переданное состояние рассинхронизации (или хотя бы одно из комбинации).
 * @param {anychart.Signal|number} state Состояние, которое нужно проверить (или комбинация).
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.SignalEvent.prototype.hasSignal = function(state) {
  return !!(this.signals & state);
};
