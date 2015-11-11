goog.provide('anychart.data.Iterator');



/**
 *<b>anychart.data.Iterator</b> class is used to work with data in a View.<br/>
 * Iterator allows to get data from a {@link anychart.data.View} by crawling through rows. Iterator
 * can be obtained using {@link anychart.data.View#getIterator} method and has methods to control current
 * index and get values from data/metadata fields in a current row.
 * @param {!anychart.data.View} view The view to iterate through.
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
 * Sets a passed index as the current index and returns it in case of success.
 * Can be used to move the iterator point to the particular index and then fetch values.
 * @example <t>listingOnly</t>
 * // Data in some working state.
 * // Current index is marked with '=()=':
 * [ =(17.22)=, 31.23, 12.2141, 123.3231, 0.123, 34141.1, 2332.0, 12148.91]
 * // After iterator.select(4) is called current index is moved:
 * [17.22, 31.23, 12.2141, 123.3231, =(0.123)=, 34141.1, 2332.0, 12148.91]
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var iterator = view.getIterator();
 * // move cursor
 * iterator.select(2);
 * chart.title().text(iterator.get('x') + ' - ' + iterator.get('value'))
 * chart.line(data);
 * @param {number} index The index to select.
 * @return {boolean} <b>True</b> Returns true only when index
 * is within a possible range, otherwise returns <b>False</b>.
 */
anychart.data.Iterator.prototype.select = function(index) {
  this.currentIndex_ = index - 1;
  return this.advance();
};


/**
 * Resets the data iterator to its zero state (before the first item of the view).
 * @example <t>listingOnly</t>
 * // Data in some working state.
 * // Current index is marked with '=()=':
 * [17.22, 31.23, 12.2141, 123.3231, =(0.123)=, 34141.1, 2332.0, 12148.91]
 * // After Iterator.reset() is called current index is moved to -1 position.
 * =()= [17.22, 31.23, 12.2141, 123.3231, 0.123, 34141.1, 2332.0, 12148.91]
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var iterator = view.getIterator();
 * // move cursor
 * iterator.select(2);
 * iterator.reset();
 * // after reset current index -1, so get returns undefined.
 * chart.title().text(iterator.get('x') + ' - ' + iterator.get('value'))
 * chart.line(data);
 * @return {anychart.data.Iterator} {@link anychart.data.Iterator} class instance for method chaining.
 */
anychart.data.Iterator.prototype.reset = function() {
  this.currentIndex_ = -1;
  this.currentRow_ = undefined;
  return this;
};


/**
 * Advances the iterator to the next item.
 * @example <c>Sample usage</c><t>listingOnly</t>
 * // Go to the beginning and then iterate through the whole set:
 * iterator.reset();
 * while(iterator.advance()){
 *    // do something
 * }
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var iterator = view.getIterator();
 * var titles = [];
 * while(iterator.advance()){
 *     // collect point x
 *     titles.push(iterator.get('x'));
 * }
 * chart.title().text(titles.join(" "))
 * chart.line(data);
 * @return {boolean} <b>True</b> Returns <b>True</b> if moved to the next item, otherwise returns <b>False</b>.
 */
anychart.data.Iterator.prototype.advance = function() {
  this.currentRow_ = this.view_.row(++this.currentIndex_);
  return this.currentIndex_ < this.getRowsCount();
};


/**
 * Gets the value from the current row by the field name.<br/>
 * <b>Note:</b> Returns <b>undefined</b>, if no matching field found.
 * @example <t>listingOnly</t>
 * // Sample data set:
 * [
 *    {name: 'Kate', age: 27, contact: 6597439},
 *    {name: 'Billy', age: 31, contact: 6597789},
 *    {name: 'Margaret', age: 24, contact: 6597522},
 *    {name: 'John', age: 39, contact: 6597001},
 * ]
 * // Returns 'Margaret' to the currentName:
 * if (iterator.select(2)){
 *   var currentName = iterator.get('name');
 * }
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var iterator = view.getIterator();
 * // move cursor
 * iterator.select(2);
 * chart.title().text(iterator.get('x') + ' - ' + iterator.get('value'))
 * chart.line(data);
 * @param {string} fieldName The name of the field to be fetched from the current row.
 * @return {*} The field value or undefined, if not found.
 */
anychart.data.Iterator.prototype.get = function(fieldName) {
  // iterator does not use this.view_.get(), because of more light currentRow_ cache usage through direct getInternal call.
  if (this.currentIndex_ >= this.getRowsCount()) return undefined;
  return this.view_.getRowMapping(this.currentIndex_).getInternal(this.currentRow_, this.currentIndex_, fieldName);
};


/**
 * Returns the index of the item to which iterator points to.
 * @example <t>listingOnly</t>
 * // Data in some working state.
 * // Current index is marked with '=()=':
 * [17.22, 31.23, 12.2141, 123.3231, =(0.123)=, 34141.1, 2332.0, 12148.91]
 * // iterator.getIndex() will return 4.
 * @return {number} The index of an iterator position.
 */
anychart.data.Iterator.prototype.getIndex = function() {
  return this.currentIndex_;
};


/**
 * Returns the number of rows in the view.
 * @example <t>listingOnly</t>
 * // Data
 * [
 *    {name: 'Kate', age: 27, contact: 6597439},
 *    {name: 'Billy', age: 31, contact: 6597789},
 *    {name: 'Margaret', age: 24, contact: 6597522},
 *    {name: 'John', age: 39, contact: 6597001},
 * ]
 * // iterator.getRowsCount() will return 4.
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * var view = data.mapAs();
 * var iterator = view.getIterator();
 * chart.title().text("rows count: " + iterator.getRowsCount());
 * chart.line(data);
 * @return {number} The number of rows in the set.
 */
anychart.data.Iterator.prototype.getRowsCount = function() {
  return this.view_.getRowsCount();
};


/**
 * Getter/setter for meta.
 * @param {string} name .
 * @param {*=} opt_value .
 * @return {!anychart.data.Iterator|*} .
 */
anychart.data.Iterator.prototype.meta = function(name, opt_value) {
  if (arguments.length > 1) {
    this.view_.meta(this.currentIndex_, name, opt_value);
    return this;
  } else
    return this.view_.meta(this.currentIndex_, name);
};


//exports
anychart.data.Iterator.prototype['select'] = anychart.data.Iterator.prototype.select;//doc|ex
anychart.data.Iterator.prototype['reset'] = anychart.data.Iterator.prototype.reset;//doc|ex
anychart.data.Iterator.prototype['advance'] = anychart.data.Iterator.prototype.advance;//doc|ex
anychart.data.Iterator.prototype['get'] = anychart.data.Iterator.prototype.get;//doc|ex
anychart.data.Iterator.prototype['meta'] = anychart.data.Iterator.prototype.meta;//doc|need-ex
anychart.data.Iterator.prototype['getIndex'] = anychart.data.Iterator.prototype.getIndex;//doc|need-ex
anychart.data.Iterator.prototype['getRowsCount'] = anychart.data.Iterator.prototype.getRowsCount;//doc|ex
