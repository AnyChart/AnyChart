goog.provide('anychart.utils.Invalidatable');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * Список возможных флагов целостности в текущем состоянии элемента.
 * @enum {number}
 */
anychart.utils.ConsistencyState = {
  DATA: 0x001
};



/**
 * Класс, реализующий функциональность по работе элемента с состояниями целостности.
 * Изменять состояния целостности можно методами invalidate() и markConsistent().
 * Проверять наличие - методами isConsistent() и hasInvalidationState().
 * @constructor
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
 * Устанавливает элементу переданную комбинацию состояний рассинхронизации {@link anychart.utils.ConsistencyState}.
 * @param {anychart.utils.ConsistencyState|number} state Состояние, которые нужно установить (или комбинация состояний).
 * @return {number} Композиция состояний связности, которые реально изменились.
 */
anychart.utils.Invalidatable.prototype.invalidate = function(state) {
  state &= this.SUPPORTED_CONSISTENCY_STATES;
  var effective = state & ~this.consistency_;
  this.consistency_ |= effective;
  if (!!effective)
    this.dispatchInvalidationEvent(effective);
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
  return !!this.consistency_;
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
  this.dispatchEvent(new anychart.utils.InvalidatedStatesEvent(this, state));
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
