goog.provide('anychart.data.View');

goog.require('anychart.data.Iterator');
goog.require('anychart.utils.Invalidatable');



/**
 * A "view" - like a db select from a data set.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @constructor
 * @implements {anychart.data.IView}
 * @extends {anychart.utils.Invalidatable}
 */
anychart.data.View = function(parentView) {
  goog.base(this);

  /**
   * The parent view to ask for data from.
   * @type {!anychart.data.IView}
   * @protected
   */
  this.parentView = parentView;

  parentView.listen(anychart.utils.Invalidatable.INVALIDATED, this.parentViewChangedHandler, false, this);

  this.invalidate(anychart.utils.ConsistencyState.DATA);
};
goog.inherits(anychart.data.View, anychart.utils.Invalidatable);


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.data.View.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.DATA;


/**
 * Redirection mask for a view. Each value in this array means a number of the parentView row to fetch,
 * when that index is asked from the current view.
 * @type {Array.<number>}
 * @protected
 */
anychart.data.View.prototype.mask;


/**
 * Ensures that the view redirection mask is consistent due to last changes.
 */
anychart.data.View.prototype.ensureConsistent = function() {
  if (this.isConsistent())
    return;
  this.mask = this.buildMask();
  this.markConsistent(anychart.utils.ConsistencyState.DATA);
};


/**
 * Creates prepared derivative view. Internal method. Should not be published!
 * @param {string} fieldName The name of the field to look at.
 * @param {Array=} opt_categories Categories set to use in case of ordinal scale.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.prepare = function(fieldName, opt_categories) {
  var result = opt_categories ?
      new anychart.data.OrdinalView(this, fieldName, /** @type {!Array} */(opt_categories)) :
      new anychart.data.ScatterView(this, fieldName);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates pie-ready derivative view.
 * @param {string} fieldName Field name to make filter by.
 * @param {function(*):boolean=} opt_func Filter function that should accept a field value and return true if the row
 *    should be included into the resulting view as a and false otherwise.
 * @param {(function(R, T, number, Array) : R)=} opt_other The function to call for
 *     every value of other. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {(function():R)=} opt_otherInitialConstructor The function that constructs initial value for opt_other func.
 * @template T,S,R
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.preparePie = function(fieldName, opt_func, opt_other, opt_otherInitialConstructor) {
  var result = new anychart.data.PieView(this, fieldName, opt_func, opt_other, opt_otherInitialConstructor);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derivative view, containing only row that passed the filter.
 * @param {string} fieldName A field which value will be passed to a filter function.
 * @param {function(*):boolean} func Filter function that should accept a field value and return true if the row
 *    should be included into the resulting view and false otherwise.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.filter = function(fieldName, func) {
  var result = new anychart.data.FilterView(this, fieldName, func);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derivative view that ensures sorting by a passed field.
 * @param {string} fieldName Field name to make sort by.
 * @param {function(*, *):number=} opt_comparator Sorting function that should accept two field values and return
 *    numeric result of the comparison.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.sort = function(fieldName, opt_comparator) {
  var result = new anychart.data.SortView(this, fieldName, opt_comparator);
  this.registerDisposable(result);
  return result;
};


/**
 * Concatenates two views to make a derivative view, that contains rows from both views.
 * @param {(!anychart.data.IView|!Array)} otherView A view, data set or even an array to concat with.
 * @return {!anychart.data.IView} The new derived view.
 */
anychart.data.View.prototype.concat = function(otherView) {
  if (goog.isArray(otherView))
    otherView = new anychart.data.Set(/** @type {!Array} */(otherView));
  if (otherView instanceof anychart.data.Set)
    otherView = (/** @type {!anychart.data.Set} */(otherView)).mapAs();
  var result = new anychart.data.ConcatView(this, /** @type {!anychart.data.IView} */(otherView));
  this.registerDisposable(result);
  return result;
};


/**
 * Gets or sets the full row of the set by its index. If there is no any row for the index - returns undefined.
 * If used as a setter - returns the previous value of the row (don't think it saves the previous state of objects
 * stored by reference - it doesn't).
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * NOTE: If current view doesn't contain a row with passed index it does nothing and returns undefined.
 *
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value If passed, the method is treated as a setter.
 * @return {*} The full row current or previous value. May be anything including undefined.
 */
anychart.data.View.prototype.row = function(rowIndex, opt_value) {
  this.ensureConsistent();
  rowIndex = this.mask[rowIndex];
  if (goog.isDef(rowIndex)) {
    if (arguments.length > 1) {
      anychart.globalLock.lock();
      var res = this.parentView.row(rowIndex, opt_value);
      anychart.globalLock.unlock();
      return res;
    } else
      return this.parentView.row(rowIndex);
  }
  return rowIndex; // undefined
};


/**
 * Returns the number of rows in a view.
 * @return {number} Number of rows in the set.
 */
anychart.data.View.prototype.getRowsCount = function() {
  this.ensureConsistent();
  return this.mask.length;
};


/**
* Returns the mapping for the row.
* @param {number} rowIndex Index of the row.
* @return {!anychart.data.Mapping} Mapping for the row.
*/
anychart.data.View.prototype.getRowMapping = function(rowIndex) {
  this.ensureConsistent();
  return this.parentView.getRowMapping(this.mask[rowIndex]);
};


/**
 * Returns new iterator for the view.
 * @return {anychart.data.Iterator} New iterator.
 */
anychart.data.View.prototype.getIterator = function() {
  this.ensureConsistent();
  return new anychart.data.Iterator(this);
};


/**
 * Builds redirection mask.
 * @return {!Array.<number>} The mask.
 * @protected
 */
anychart.data.View.prototype.buildMask = goog.abstractMethod;


/**
 * Handles changes in parent view.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @protected
 */
anychart.data.View.prototype.parentViewChangedHandler = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.DATA))
    this.invalidate(anychart.utils.ConsistencyState.DATA);
};
