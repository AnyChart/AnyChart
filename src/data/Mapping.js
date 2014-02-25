goog.provide('anychart.data.Mapping');

goog.require('anychart.data.View');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Специальный View, который позволяет адресовать поля хранилища типа anychart.data.Set.
 * @param {!anychart.data.Set} parentSet Хранилище, поля которого нужно адресовать.
 * @param {!Object.<number>=} opt_arrayMapping Настройки адресации колонок для рядов,
 *    представляющих собой массив.
 * @param {!Object.<Array.<string>>=} opt_objectMapping Настройки адресации колонок для рядов, являющихся объектами.
 * @param {!Array.<string>=} opt_defaultProps Массив имен полей, в качестве значения которых можно отдать значение ряда,
 *    если он является строкой, числом или функцией. Не работает, если ряд - объект, даже если нужное поле не было
 *    найдено внутри этого объекта.
 * @param {!Array.<string>=} opt_indexProps Массив имен полей, в качестве значения которых можно отдать текущий индекс
 *    ряда, если другие опции не сработали.
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.Mapping = function(parentSet, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  goog.base(this, parentSet);
  this.initMappingInfo(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps);
};
goog.inherits(anychart.data.Mapping, anychart.data.View);


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.data.Mapping.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.DATA;


/**
 * Mapping doesn't support DATA dirty state.
 * @type {number}
 */
anychart.data.Mapping.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Fetches field value from the row by its field name. Returns undefined, if no matching field found.
 * @param {*} row The row to fetch field value from.
 * @param {number} rowIndex The index of the row to be able to use it as a field value in some cases.
 * @param {string} fieldName The name of the field to fetch from the row.
 * @return {*} The field value or undefined, if not found.
 */
anychart.data.Mapping.prototype.get = function(row, rowIndex, fieldName) {
  /** @type {*} */
  var result;
  if (goog.isDefAndNotNull(row)) {
    /** @type {string} */
    var rowType = goog.typeOf(row);
    if (rowType == 'array') {
      /** @type {number} */
      var index = +this.arrayMapping_[fieldName];
      if (!isNaN(index))
        result = row[index];
    } else if (rowType == 'object') {
      result = anychart.utils.mapObject(/** @type {!Object} */(row), fieldName, this.objectMapping_[fieldName]);
    } else if (goog.array.indexOf(this.defaultProps_, fieldName) > -1) {
      result = row;
    } else if (goog.array.indexOf(this.indexProps_, fieldName) > -1) {
      result = rowIndex;
    }
  }
  return result;
};


/** @inheritDoc */
anychart.data.Mapping.prototype.getRowMapping = function(rowIndex) {
  return this;
};


/** @inheritDoc */
anychart.data.Mapping.prototype.row = function(rowIndex, opt_value) {
  return this.parentView.row.apply(this.parentView, arguments);
};


/** @inheritDoc */
anychart.data.Mapping.prototype.getRowsCount = function() {
  return this.parentView.getRowsCount();
};


/** @inheritDoc */
anychart.data.Mapping.prototype.parentViewChangedHandler = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.DATA))
    this.dispatchEvent(new anychart.utils.InvalidatedStatesEvent(this, anychart.utils.ConsistencyState.DATA));
};


/**
 * Initializes mapping info objects for the mapping.
 * @param {!Object.<number>=} opt_arrayMapping Настройки адресации колонок для рядов,
 *    представляющих собой массив.
 * @param {!Object.<Array.<string>>=} opt_objectMapping Настройки адресации колонок для рядов, являющихся объектами.
 * @param {!Array.<string>=} opt_defaultProps Массив имен полей, в качестве значения которых можно отдать значение ряда,
 *    если он является строкой, числом или функцией. Не работает, если ряд - объект, даже если нужное поле не было
 *    найдено внутри этого объекта.
 * @param {!Array.<string>=} opt_indexProps Массив имен полей, в качестве значения которых можно отдать текущий индекс
 *    ряда, если другие опции не сработали.
 * @protected
 */
anychart.data.Mapping.prototype.initMappingInfo = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  /**
   * Настройки адресации колонок для рядов, представляющих собой массив.
   * @type {!Object.<number>}
   * @private
   */
  this.arrayMapping_ = opt_arrayMapping || {
    'x': 0,
    'value': 1,
    'size': 2, // bubble series
    'open': 1,
    'high': 2,
    'low': 3,
    'close': 4
  };

  /**
   * Настройки адресации колонок для объектных рядов.
   * @type {!Object.<Array.<string>>}
   * @private
   */
  this.objectMapping_ = opt_objectMapping || {
    //'x': ['x'], // this mapping entry can be omitted cause of defaults
    'value': ['value', 'y', 'close'] // 'value' here enforces checking order
  };

  /**
   * Массив имен полей, в качестве значения которых можно отдать значение ряда,
   * если он не является объектом или массивом.
   * @type {!Array.<string>}
   * @private
   */
  this.defaultProps_ = opt_defaultProps || ['value', 'close'];

  /**
   * Массив имен полей, в качестве значения которых можно отдать значение индекса ряда,
   * если он не является объектом или массивом.
   * @type {!Array.<string>}
   * @private
   */
  this.indexProps_ = opt_indexProps || ['x'];
};
