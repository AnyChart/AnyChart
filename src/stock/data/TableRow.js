goog.provide('anychart.stockModule.data.TableRow');



/**
 * Table item constructor.
 * @param {number} key
 * @param {!(Array|Object)} values
 * @constructor
 */
anychart.stockModule.data.TableRow = function(key, values) {
  /**
   * Indexing key.
   * @type {number}
   */
  this.key = key;

  /**
   * Values array.
   * @type {!(Array|Object)}
   */
  this.values = values;

  /**
   * Reference to the next item of the storage. It's an optimization for faster consequent reading.
   * @type {anychart.stockModule.data.TableRow}
   */
  this.next = null;

  /**
   * Reference to the previous item of the storage. It's an optimization for faster consequent searching.
   * @type {anychart.stockModule.data.TableRow}
   */
  this.prev = null;

  /**
   * If the item should be removed on the next transaction commit.
   * @type {boolean}
   */
  this.isRemoved = false;

  /**
   * The special number to maintain stable sort on appends storage if needed.
   * @type {number}
   */
  this.addingOrder = anychart.stockModule.data.TableRow.instancesCount_++;
};


/**
 * Calculated values array.
 * @type {?Array}
 */
anychart.stockModule.data.TableRow.prototype.computedValues = null;


/**
 * Number of instances. Used to maintain order on items - the item created later replaces item created earlier.
 * @type {number}
 * @private
 */
anychart.stockModule.data.TableRow.instancesCount_ = 0;


/**
 * Returns current column value.
 * @param {number|string} column
 * @return {*}
 */
anychart.stockModule.data.TableRow.prototype.getValue = function(column) {
  var value;
  if (goog.isNumber(column) && column < 0) {
    if (this.computedValues)
      value = this.computedValues[~column];
  } else {
    value = this.values[column];
  }

  return value;
};


/**
 * Comparator for strong sort of table items.
 * @param {anychart.stockModule.data.TableRow} i1
 * @param {anychart.stockModule.data.TableRow} i2
 * @return {number}
 */
anychart.stockModule.data.TableRow.comparator = function(i1, i2) {
  if (i1.key == i2.key)
    return i1.addingOrder - i2.addingOrder;
  return i1.key - i2.key;
};


/**
 * Evaluator function for keys binary search. Used with ASC sorting. Can accept any object with key field.
 * @this {number}
 * @param {!{key: number}} value
 * @return {number}
 */
anychart.stockModule.data.TableRow.searchEvaluator = function(value) {
  return this - value.key;
};


/**
 * Evaluator function for keys binary search. Used with DESC sorting. Can accept any object with key field.
 * @this {number}
 * @param {!{key: number}} value
 * @return {number}
 */
anychart.stockModule.data.TableRow.reversedSearchEvaluator = function(value) {
  return this - value.key;
};
