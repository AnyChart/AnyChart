goog.provide('anychart.data.Set');

goog.require('anychart.data.IView');
goog.require('anychart.data.Mapping');
goog.require('anychart.utils.Invalidatable');
goog.require('goog.array');



/**
 * Самое общее хранилище для линейных (не древовидных и не иерархических) данных.
 * Понимает данные как массив рядов (rows), которые состоят из колонок (cols).
 * Перед работой с этим хранилищем нужно задать способ адресации колонок в рядах.
 * Сделать это можно с помощью метода mapAs() (способов адресации колонок для хранилища может быть сколько угодно).
 *
 * @param {Array=} opt_data Data for the set can be passed here.
 * @constructor
 * @implements {anychart.data.IView}
 * @extends {anychart.utils.Invalidatable}
 */
anychart.data.Set = function(opt_data) {
  goog.base(this);
  this.data(opt_data || null);
};
goog.inherits(anychart.data.Set, anychart.utils.Invalidatable);


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.data.Set.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.DATA;


/**
 * Internal data set storage.
 * @type {!Array}
 */
anychart.data.Set.prototype.storage_;


/**
 * Getter/Setter for Set data.
 * @param {Array=} opt_data Data to set or undefined to get.
 * @return {(!anychart.data.Set|!Array)} Data array of the Set or the Set for chaining.
 */
anychart.data.Set.prototype.data = function(opt_data) {
  if (goog.isDef(opt_data)) {
    if (goog.isArrayLike(opt_data)) {
      /** @type {!Array} */
      var data = goog.array.slice(opt_data, 0);
      for (/** @type {number} */ var i = data.length; i--;) {
        if (goog.isArrayLike(data[i]))
          data[i] = goog.array.slice(data[i], 0);
      }
      this.storage_ = data;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
    } else {
      if (this.storage_ && this.storage_.length > 0) {
        this.storage_.length = 0;
        this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
      } else {
        this.storage_ = [];
      }
    }
    return this;
  }
  return this.storage_;
};


/**
 * Maps data set rows as if they were a set of named fields.
 *
 * @param {!Object.<number>=} opt_arrayMapping Настройки адресации колонок для рядов,
 *    представляющих собой массив.
 * @param {!Object.<Array.<string>>=} opt_objectMapping Настройки адресации колонок для рядов, являющихся объектами.
 * @param {!Array.<string>=} opt_defaultProps Массив имен полей, в качестве значения которых можно отдать значение ряда,
 *    если он является строкой, числом или функцией. Не работает, если ряд - объект, даже если нужное поле не было
 *    найдено внутри этого объекта.
 * @param {!Array.<string>=} opt_indexProps Массив имен полей, в качестве значения которых можно отдать текущий индекс
 *    ряда, если другие опции не сработали.
 * @return {anychart.data.Mapping} The mapping for the data set.
 */
anychart.data.Set.prototype.mapAs = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  var res = new anychart.data.Mapping(this, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps);
  this.registerDisposable(res);
  return res;
};


/**
 * Gets or sets the full row of the set by its index. If there is no any row for the index - returns undefined.
 * If used as a setter - returns the previous value of the row (don't think it saves the previous state of objects
 * stored by reference - it doesn't).
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value If passed, the method is treated as a setter.
 * @return {*} The full row current or previous value. May be anything including undefined.
 */
anychart.data.Set.prototype.row = function(rowIndex, opt_value) {
  /** @type {*} */
  var value = this.storage_[rowIndex];
  if (arguments.length > 1) {
    this.storage_[rowIndex] = opt_value;
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
  }
  return value;
};


/**
 * Returns the size of the data set (number of rows).
 * @return {number} Number of rows in the set.
 */
anychart.data.Set.prototype.getRowsCount = function() {
  return this.storage_.length;
};
