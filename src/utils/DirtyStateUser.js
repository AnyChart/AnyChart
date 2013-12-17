goog.provide('anychart.utils.DirtyStateUser');


/**
 * Список возможных флагов рассинхронизации в текущем состоянии элемента.
 * @enum {number}
 */
anychart.utils.DirtyState = {
};



/**
 * Класс, реализующий функциональность по работе элемента с состояниями рассинхронизации.
 * Изменять состояния рассинхронизации можно методами setDirtyState() и clearDirtyState().
 * Проверять наличие - методами isDirty() и hasDirtyState().
 * На изменения состояния рассинхронизации можно подписываться с помощью методов subscribe(), unsubscribe() и
 * unsubscribeAll().
 * @constructor
 */
anychart.utils.DirtyStateUser = function() {
  /**
   * An array of dirty state changes subscribers.
   * @type {!Array.<{handler: function(anychart.utils.DirtyStateUser, number), context: Object}>}
   * @private
   */
  this.subscribers_ = [];
};


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.utils.DirtyStateUser.prototype.SUPPORTED_DIRTY_STATES = 0;


/**
 * Устанавливает элементу переданную комбинацию состояний рассинхронизации {@link anychart.utils.DirtyState}.
 * @param {number} state Состояние, которые нужно установить (или комбинация состояний).
 */
anychart.utils.DirtyStateUser.prototype.setDirtyState = function(state) {
  state &= this.SUPPORTED_DIRTY_STATES;
  var effective = state & ~this.dirtyState_;
  this.dirtyState_ |= effective;
  if (!!effective)
    this.informSubscribers(effective);
};


/**
 * Очищает у элемента переданное состояние рассинхронизации.
 * @param {number} state Состояние, которое нужно очистить (или комбинация состояний).
 */
anychart.utils.DirtyStateUser.prototype.clearDirtyState = function(state) {
  this.dirtyState_ &= ~state;
};


/**
 * Проверяет, имеет ли элемент хоть какое-нибудь состояние рассинхронизации.
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.utils.DirtyStateUser.prototype.isDirty = function() {
  return !!this.dirtyState_;
};


/**
 * Проверяет, имеет ли элемент переданное состояние рассинхронизации (или хотя бы одно из комбинации).
 * @param {anychart.utils.DirtyState} state Состояние, которое нужно проверить (или комбинация).
 * @return {boolean} Имеет ли элемент переданное состояние рассинхронизации.
 */
anychart.utils.DirtyStateUser.prototype.hasDirtyState = function(state) {
  return !!(this.dirtyState_ & state);
};


/**
 * Добавляет подписчика на изменение состояния рассинхронизации текущего объекта.
 * Не проверяет на то, что такой подписчик уже есть.
 * @param {function(anychart.utils.DirtyStateUser, number)} handler Новый обработчик.
 * @param {Object=} opt_context Опционально - контекст, в котором должен выполниться обработчик.
 */
anychart.utils.DirtyStateUser.prototype.subscribe = function(handler, opt_context) {
  this.subscribers_.push({handler: handler, context: opt_context || null});
};


/**
 * Удаляет подписчика на изменение состояния рассинхронизации текущего объекта.
 * @param {function(anychart.utils.DirtyStateUser, number)} handler Новый обработчик.
 * @param {Object=} opt_context Опционально - контекст, в котором должен выполниться обработчик.
 * @return {boolean} Returns removal success.
 */
anychart.utils.DirtyStateUser.prototype.unsubscribe = function(handler, opt_context) {
  opt_context = opt_context || null;
  for (var i = this.subscribers_.length; i--;) {
    var subscriber = this.subscribers_[i];
    if (subscriber.handler == handler && subscriber.context == opt_context)
      return goog.array.removeAt(this.subscribers_, i);
  }
  return false;
};


/**
 * Удаляет всех подписчиков текущего объекта.
 */
anychart.utils.DirtyStateUser.prototype.unsubscribeAll = function() {
  this.subscribers_.length = 0;
};


/**
 * Informs all subscribers that passed dirty states combination was effectively set on this object.
 * @param {number} state State or state combination that was set for this object.
 * @protected
 */
anychart.utils.DirtyStateUser.prototype.informSubscribers = function(state) {
  for (var i = 0, len = this.subscribers_.length; i < len; i++) {
    var subscriber = this.subscribers_[i];
    subscriber.handler.call(subscriber.context, this, state);
  }
};
