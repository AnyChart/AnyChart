goog.provide('anychart.utils.Invalidatable');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * Список возможных флагов целостности в текущем состоянии элемента.
 * @enum {number}
 */
anychart.utils.ConsistencyState = {
  /**
   * Выставляется когда изменились данные.
   */
  DATA: 0x0001,

  /**
   * Выставляется когда изменился содержащий елемент контейнер.
   */
  CONTAINER: 0x0002,

  /**
   * Выставляется когда изменились настройки позиции или размера.
   * Это не значит что фактическое местоположение изменилось, изменилась лишь настройка.
   */
  BOUNDS: 0x0004,

  /**
   *  Выставляется когда фактическая позиция или размер изменились.
   */
  PIXEL_BOUNDS: 0x0008,

  /**
   * Выставляется когда все окружение елемента изменилось и его нужно полностью перерисовать.
   */
  APPEARANCE: 0x0010,

  /**
   * Выставляется когда изменились настройки фона елемента не влияющие на остальные части елемента.
   * Это значит, что нужно перерисовать только фон и ничего кроме фона.
   */
  BACKGROUND_APPEARANCE: 0x0020,

  /**
   * Выставляется когда изменились настройки заголовка елемента не влияющие на остальные части элемента.
   * Это значит что нужно перерисовать только заголовок и ничего кроме заголовка.
   */
  TITLE_APPEARANCE: 0x0040,

  /**
   * Выставляется когда изменился zIndex контейнера.
   */
  Z_INDEX: 0x0080,

  /**
   * Выставляется когда изменились настройки форматирования текста.
   */
  TEXT_FORMAT: 0x0100,

  /**
   * Выставляется когда изменилось отображение pie chart.
   */
  PIE_APPEARANCE: 0x0200,

  /**
   * Выставляется когда изменились настройки позиционирования.
   */
  POSITION: 0x0400,
  /**
   * Вызывается изменилось состояние HOVER
   */
  HOVER: 0x0800,
  /**
   * Вызывается изменилось состояние CLICK
   */
  CLICK: 0x1000,
  /**
   * Ticks settings changed. Axes redrawing needed.
   */
  TICKS_SET: 0x2000,
  /**
   * Scale settings changed. Data and axes redrawing needed.
   */
  SCALE_SETTINGS: 0x4000,
  /**
   * Scale settings changed. Data pass needed (for ex. auto calculation turned on).
   */
  SCALE_SETTINGS_HARD: 0x8000,
  /**
   * Scale stack settings changed. Data redrawing needed.
   */
  SCALE_STACK_SETTINGS: 0x10000,
  /**
   * Scale categorization settings changed. Data recategorisation is needed.
   */
  SCALE_RECATEGORIZED: 0x20000,

  /**
   * Вызывается когда изменились настройки лейблов
   */
  LABELS: 0x40000,
  //  RESERVED_FLAG12: 0x80000,
  //  RESERVED_FLAG13: 0x100000,
  //  RESERVED_FLAG14: 0x200000,
  //  RESERVED_FLAG15: 0x400000,
  //  RESERVED_FLAG16: 0x800000,
  //  RESERVED_FLAG17: 0x1000000,
  //  RESERVED_FLAG18: 0x2000000,
  //  RESERVED_FLAG19: 0x4000000,
  //  RESERVED_FLAG20: 0x8000000,
  //  RESERVED_FLAG21: 0x10000000,
  //  RESERVED_FLAG22: 0x20000000,
  //  RESERVED_FLAG23: 0x40000000,
  //  RESERVED_FLAG24: 0x80000000,
  //  RESERVED_FLAG25: 0x100000000,
  //  RESERVED_FLAG26: 0x200000000,
  //  RESERVED_FLAG27: 0x400000000,
  //  RESERVED_FLAG28: 0x800000000,
  //  RESERVED_FLAG29: 0x1000000000,
  //  RESERVED_FLAG30: 0x2000000000,
  //  RESERVED_FLAG31: 0x4000000000,
  //  RESERVED_FLAG32: 0x8000000000,
  //  RESERVED_FLAG33: 0x10000000000,
  //  RESERVED_FLAG34: 0x20000000000,
  //  RESERVED_FLAG35: 0x40000000000,
  //  RESERVED_FLAG36: 0x80000000000,
  //  RESERVED_FLAG37: 0x100000000000,
  //  RESERVED_FLAG38: 0x200000000000,
  //  RESERVED_FLAG39: 0x400000000000,
  //  RESERVED_FLAG40: 0x800000000000,
  //  RESERVED_FLAG_LAST: 0x10000000000000000,
  ALL: 0x3FFFF
};



/**
 * Класс, реализующий функциональность по работе элемента с состояниями целостности.
 * Изменять состояния целостности можно методами invalidate() и markConsistent().
 * Проверять наличие - методами isConsistent() и hasInvalidationState().
 * @constructor
 * @name anychart.utils.Invalidatable
 * @extends {goog.events.EventTarget}
 */
anychart.utils.Invalidatable = function() {
  goog.base(this);
};
goog.inherits(anychart.utils.Invalidatable, goog.events.EventTarget);


/**
 * Строка с событием, которое отправляется классом Invalidatable.
 * @const {string}
 */
anychart.utils.Invalidatable.INVALIDATED = 'invalidated';


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.utils.Invalidatable.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Текущее состояние целостности элемента. Если оно равно нулю - элемент согласован.
 * @type {number}
 * @private
 */
anychart.utils.Invalidatable.prototype.consistency_ = 0;


/**
 * If NaN - no dispatching suspending is active.
 * If a number - contains the cumulative state for all suspended states that were to be dispatched during the suspend.
 * @type {number}
 * @private
 */
anychart.utils.Invalidatable.prototype.suspendedDispatching_ = NaN;


/**
 * Устанавливает элементу переданную комбинацию состояний рассинхронизации {@link anychart.utils.ConsistencyState}.
 * @param {anychart.utils.ConsistencyState|number} state Состояние, которые нужно установить (или комбинация состояний).
 * @return {number} Композиция состояний связности, которые реально изменились.
 */
anychart.utils.Invalidatable.prototype.invalidate = function(state) {
  var effective = this.silentlyInvalidate(state);
  if (!!effective)
    this.dispatchInvalidationEvent(effective);
  return effective;
};


/**
 * Устанавливает элементу переданную комбинацию состояний рассинхронизации {@link anychart.utils.ConsistencyState}.
 * В отличие от invalidate() не запускает событие - краткая форма записи:
 * this.suspendInvalidationDispatching().invalidate(state).resumeInvalidationDispatching(false);
 *
 * @param {anychart.utils.ConsistencyState|number} state Состояние, которые нужно установить (или комбинация состояний).
 * @return {number} Композиция состояний связности, которые реально изменились.
 */
anychart.utils.Invalidatable.prototype.silentlyInvalidate = function(state) {
  state &= this.SUPPORTED_CONSISTENCY_STATES;
  var effective = state & ~this.consistency_;
  this.consistency_ |= effective;
  return effective;
};


/**
 * Очищает у элемента переданное состояние рассинхронизации.
 * @param {anychart.utils.ConsistencyState|number} state Состояние, которое нужно очистить (или комбинация состояний).
 */
anychart.utils.Invalidatable.prototype.markConsistent = function(state) {
  this.consistency_ &= ~state;
};


/**
 * Проверяет, имеет ли элемент хоть какое-нибудь состояние рассинхронизации.
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.utils.Invalidatable.prototype.isConsistent = function() {
  return !this.consistency_;
};


/**
 * Проверяет, имеет ли элемент переданное состояние рассинхронизации (или хотя бы одно из комбинации).
 * @param {anychart.utils.ConsistencyState|number} state Состояние, которое нужно проверить (или комбинация).
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.utils.Invalidatable.prototype.hasInvalidationState = function(state) {
  return !!(this.consistency_ & state);
};


/**
 * Отправляет подписчикам событие инвалидации объекта.
 * @param {anychart.utils.ConsistencyState|number} state Установленные состояния инвалидации.
 */
anychart.utils.Invalidatable.prototype.dispatchInvalidationEvent = function(state) {
  if (isNaN(this.suspendedDispatching_))
    this.dispatchEvent(new anychart.utils.InvalidatedStatesEvent(this, state));
  else
    this.suspendedDispatching_ |= state;
};


/**
 * Suspends invalidation events dispatching. The dispatching can be then resumed with or without cumulative dispatching
 * of all affected states.
 * @return {!anychart.utils.Invalidatable} Itself for chaining.
 */
anychart.utils.Invalidatable.prototype.suspendInvalidationDispatching = function() {
  if (isNaN(this.suspendedDispatching_))
    this.suspendedDispatching_ = 0;
  return this;
};


/**
 * Resumes dispatching of invalidation events.
 * @param {boolean} doDispatchSuspendedStates Whether to dispatch all invalidation that were to be dispatched while the
 *    suspend or not.
 * @return {anychart.utils.Invalidatable} Itself for chaining.
 */
anychart.utils.Invalidatable.prototype.resumeInvalidationDispatching = function(doDispatchSuspendedStates) {
  if (isNaN(this.suspendedDispatching_))
    return this;
  var eventsToDispatch = this.suspendedDispatching_;
  this.suspendedDispatching_ = NaN;
  if (doDispatchSuspendedStates && eventsToDispatch)
    this.dispatchInvalidationEvent(eventsToDispatch);
  return this;
};


/**
 * Defines is invalidation dispatching suspended or not.
 * @return {boolean} Is invalidation dispatching suspended or not.
 */
anychart.utils.Invalidatable.prototype.isInvalidationDispatchingSuspended = function() {
  return isNaN(this.suspendedDispatching_);
};



/**
 * Special event for changes in dirty states.
 * @param {anychart.utils.Invalidatable} target Event target.
 * @param {number} invalidatedStates Changes effectively happen with the target.
 * @constructor
 * @extends {goog.events.Event}
 */
anychart.utils.InvalidatedStatesEvent = function(target, invalidatedStates) {
  goog.base(this, anychart.utils.Invalidatable.INVALIDATED, target);

  /**
   * Aspects of the object that were invalidated.
   * @type {number}
   */
  this.invalidatedStates = invalidatedStates;
};
goog.inherits(anychart.utils.InvalidatedStatesEvent, goog.events.Event);


/**
 * Проверяет, имеет ли элемент переданное состояние рассинхронизации (или хотя бы одно из комбинации).
 * @param {anychart.utils.ConsistencyState|number} state Состояние, которое нужно проверить (или комбинация).
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.utils.InvalidatedStatesEvent.prototype.invalidated = function(state) {
  return !!(this.invalidatedStates & state);
};
