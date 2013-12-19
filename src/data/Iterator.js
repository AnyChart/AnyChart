goog.provide('anychart.data.Iterator');



/**
 * Iterates over a view and allows to fetch values according to the view mapping.
 * @param {!anychart.data.View} view A view to iterate.
 * @constructor
 */
anychart.data.Iterator = function(view) {
  /**
   * @type {anychart.data.View}
   * @private
   */
  this.view_ = view;

  this.reset();
};


/**
 * Current item index in iteration.
 * @type {number}
 * @private
 */
anychart.data.Iterator.prototype.currentIndex_;


/**
 * Current item in iteration.
 * @type {*}
 * @private
 */
anychart.data.Iterator.prototype.currentRow_;


/**
 * Sets passed index as current index and returns if it was successful.
 * Can be used to make the iterator point to the particular index and than fetch values using it.
 * @param {number} index The index to try to select.
 * @return {boolean} If the selection was successful.
 */
anychart.data.Iterator.prototype.select = function(index) {
  this.currentIndex_ = index - 1;
  return this.advance();
};


/**
 * Resets data iterator to its zero state (before the first item of the view).
 * @return {anychart.data.Iterator} Chaining.
 */
anychart.data.Iterator.prototype.reset = function() {
  this.currentIndex_ = -1;
  this.currentRow_ = undefined;
  return this;
};


/**
 * Advances the iterator to the next item and returns if there is that next item.
 * @return {boolean} Is there any next items.
 */
anychart.data.Iterator.prototype.advance = function() {
  this.currentRow_ = this.view_.row(++this.currentIndex_);
  return this.currentIndex_ < this.getRowsCount();
};


/**
 * Gets field value of the current row by its field name. Returns undefined, if no matching field found.
 * @param {string} fieldName The name of the field to fetch from the current row.
 * @return {*} The field value or undefined, if not found.
 */
anychart.data.Iterator.prototype.get = function(fieldName) {
  return this.view_.getRowMapping(this.currentIndex_).get(this.currentRow_, this.currentIndex_, fieldName);
};


/**
 * Returns the index of the item iterator points to.
 * @return {number} Current index.
 */
anychart.data.Iterator.prototype.getIndex = function() {
  return this.currentIndex_;
};


/**
 * Returns the number of rows in the view.
 * @return {number} Number of rows in the set.
 */
anychart.data.Iterator.prototype.getRowsCount = function() {
  return this.view_.getRowsCount();
};
