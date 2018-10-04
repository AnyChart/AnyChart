goog.provide('anychart.treeChartBase.ArrayIterator');
goog.require('anychart.data.Iterator');



/**
 * Iterator for array with interface common to data.Iterator.
 * Need mostly to keep in with InteractivityState.
 * @extends {anychart.data.Iterator}
 * @param {Array} arr
 * @constructor
 */
anychart.treeChartBase.ArrayIterator = function(arr) {
  /**
   * @type {Array}
   * @protected
   */
  this.arr = arr;

  this.reset();
};
goog.inherits(anychart.treeChartBase.ArrayIterator, anychart.data.Iterator);


/**
 * Advances the iterator to the next item.
 * @return {boolean} Returns true if moved to the next item, otherwise returns false.
 */
anychart.treeChartBase.ArrayIterator.prototype.advance = function() {
  this.currentRow = this.arr[++this.currentIndex];
  var rc = this.getRowsCount();
  return !!rc && this.currentIndex < rc;
};


/**
 * Gets the value of the current item in the array.
 * @param {string} fieldName Field name.
 * @return {*} The value or undefined, if not found.
 */
anychart.treeChartBase.ArrayIterator.prototype.get = function(fieldName) {
  if (this.currentIndex >= this.getRowsCount()) return void 0;
  if (goog.isDef(fieldName) && this.currentRow) {
    var result;
    if (this.currentRow.meta) {
      var type = this.currentRow.meta('treemap_type');
      if (type == 1 /* HEADER */ || type == 3 /* TRANSIENT */ || type == 4 /* HINT_LEAF */) return void 0;
      result = this.currentRow.meta(fieldName);
      if (result)
        return result;
    }
    if (this.currentRow.get) {
      return this.currentRow.get(fieldName);
    }
  } else
    return void 0;
};


/**
 * Returns current row. May be undefined.
 * @return {*} Current row.
 */
anychart.treeChartBase.ArrayIterator.prototype.getItem = function() {
  return this.currentRow;
};


/**
 * Returns the index of the item to which iterator points to.
 * @return {number} The index of an iterator position.
 */
anychart.treeChartBase.ArrayIterator.prototype.getIndex = function() {
  return this.currentIndex;
};


/**
 * Returns the number of items in the array.
 * @return {number} The number of items in the array.
 */
anychart.treeChartBase.ArrayIterator.prototype.getRowsCount = function() {
  return this.arr.length;
};


/**
 * Getter/setter for meta.
 * Gets/sets meta only if item of array supports meta method.
 * @param {string} name Name of meta field.
 * @param {*=} opt_value Value that should be set.
 * @return {!anychart.treeChartBase.ArrayIterator|*} Meta value of self for chaining.
 */
anychart.treeChartBase.ArrayIterator.prototype.meta = function(name, opt_value) {
  if (this.currentRow && this.currentRow.meta) {
    if (arguments.length > 1) {
      this.currentRow.meta(name, opt_value);
      return this;
    } else
      return this.currentRow.meta(name);
  }
};
