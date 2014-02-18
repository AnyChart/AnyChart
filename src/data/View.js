goog.provide('anychart.data.View');

goog.require('anychart.data.Iterator');
goog.require('anychart.utils.Invalidatable');



/**
 * "View" - это представление исходного набора данных, в результате операций над ними (сортировка, фильтрация и тд).<br/>
 * <b>Note:</b> дефолтный View - это  представление исходных данных с дефолтным маппингом.<br/>
 *
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @constructor
 * @implements {anychart.data.IView}
 * @name anychart.data.View
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
 * Metadata storage.
 * @type {Array.<Object>}
 * @private
 */
anychart.data.View.prototype.metadata_ = null;


/**
 * If the metadata should be transitioned to the parent view.
 * @type {boolean}
 * @private
 */
anychart.data.View.prototype.transitMeta_ = false;


/**
 * Ensures that the view redirection mask is consistent due to last changes.
 */
anychart.data.View.prototype.ensureConsistent = function() {
  if (this.isConsistent())
    return;
  if (this.metadata_)
    this.metadata_.length = 0;
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
 * Creates a derivative view, containing just the same data set and order as this view does.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.derive = function() {
  var result = new anychart.data.View(this);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derivative view, containing only row that passed the filter.
 * @example <t>listingOnly</t>
 *  // оставляем значения более 3.
 *  view.filter('fieldName', function(fieldValue){
 *    return fieldValue > 3;
 *  });
 * @param {string} fieldName A field which value will be passed to a filter function.
 * @param {function(*):boolean} func Filter function that should accept a field value and return true if the row
 *  should be included into the resulting view.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.filter = function(fieldName, func) {
  var result = new anychart.data.FilterView(this, fieldName, func);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derivative view that ensures sorting by a passed field.
 * @example <t>listingOnly</t>
 *  // sorting by string length.
 *  view.filter('pointName', function(value1, value2){
 *    return value1.toString().length() - value2.toString().length();
 *  });
 * @param {string} fieldName Field name to make sort by.
 * @param {function(*, *):number=} opt_comparator Sorting function that should accept two field values and return
 *  numeric result of the comparison.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.sort = function(fieldName, opt_comparator) {
  var result = new anychart.data.SortView(this, fieldName, opt_comparator);
  this.registerDisposable(result);
  return result;
};


/**
 * Concatenates two views to make a derivative view, that contains rows from both views.
 * @example <c>Конкатинация двух View</c><t>listingOnly</t>
 * // mainView                      additionalView
 *  [                               [
 *    [1, 3, 5],                        {x: 2, y: 5},
 *    [5, 3, 1]                         {x: 3, y: 7},
 *  ]                                   function(){ return {x: 4, y: 7}}
 *                                  ]
 * mainView.concat(additionalView);
 * // Result mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1],
 *    {x: 2, y: 5},
 *    {x: 3, y: 7},
 *    function(){ return {x: 4, y: 7}}
 *  ]
 * @example <c>Конкатинация View и dataSet</c><t>listingOnly</t>
 * // mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1]
 *  ]
 * mainView.concat(new anychart.data.Set([
 *     {x: 2, y: 5},
 *     {x: 3, y: 7},
 *     function(){ return {x: 4, y: 7}}
 *  ]));
 * // Result mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1],
 *    {x: 2, y: 5},
 *    {x: 3, y: 7},
 *    function(){ return {x: 4, y: 7}}
 *  ]
 * @example <c>Конкатинация View и Массива</c><t>listingOnly</t>
 * // mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1]
 *  ]
 * mainView.concat([2, 2, 2]);
 * // Result mainView
 *  [
 *    [1, 3, 5],
 *    [5, 3, 1],
 *    2,
 *    2,
 *    2
 *  ]
 * @param {!(anychart.data.IView|Array)} otherView A view, data set or even an array to concat with.
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
 * Gets the full row of the set by it's index.<br/>
 * <b>Note:</b> If there is no any row for the index - returns <b>undefined</b>.<br/>
 * Пример работы достаточно хорошо описан тут {@link anychart.data.Set#row}
 * @example <t>listingOnly</t>
 * // Данные
 *  [
 *    [1, 2, 4, 7],
 *    [11, 12, 14, 17],
 *    [21, 22, 24, 27]
 *  ]
 *  view.row(2); // вернет [21, 22, 24, 27]
 *  view.row(3); // вернет undefined
 * @see anychart.data.Set#row
 * @param {number} rowIndex Index of the row to fetch.
 * @return {*} The full row current.
 *//**
 * Sets the full row of the set by its index.<br/>
 * <b>Note:</b> returns the previous value of the row (it doesn't saves the previous state of objects).<br/>
 * @example <t>listingOnly</t>
 * // Данные
 *  [
 *    [1, 2, 4, 7],
 *    [11, 12, 14, 17],
 *    [21, 22, 24, 27]
 *  ]
 *  view.row(2, [2, 2, 2, 2]); // вернет [21, 22, 24, 27]
 *  view.row(3, {'low': 4, 'high': 11}); // вернет undefined
 * @see anychart.data.Set#row
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value Value to set.
 * @return {*} The full row of previous value.
 *//**
 * @ignoreDoc
 * @param {number} rowIndex .
 * @param {*=} opt_value .
 * @return {*} .
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
 * Returns the number of rows in current view.
 * @see anychart.data.Iterator#getRowsCount
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
 * Returns new iterator for current view.
 * @example <t>listingOnly</t>
 * // создаем новый набор данных.
 * var dataSet = new anychart.data.Set([1,2,3]);
 * // выполняем над ним дефолтный маппинг и получаем итератор.
 * var iterator = dataSet.mapAs().getIterator();
 * @return {anychart.data.Iterator} New iterator.
 */
anychart.data.View.prototype.getIterator = function() {
  this.ensureConsistent();
  return new anychart.data.Iterator(this);
};


/**
 * Builds redirection mask. Mask defaults to equality masking.
 * @return {!Array.<number>} The mask.
 * @protected
 */
anychart.data.View.prototype.buildMask = function() {
  var mask = [];
  var iterator = this.parentView.getIterator();
  while (iterator.advance()) {
    mask.push(iterator.getIndex());
  }
  return mask;
};


/**
 * Handles changes in parent view.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @protected
 */
anychart.data.View.prototype.parentViewChangedHandler = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.DATA))
    this.invalidate(anychart.utils.ConsistencyState.DATA);
};


/**
 * Getter for a metadata value.<br/>
 * Принцип работы достаточно хорошо описан в {@link anychart.data.Iterator#meta}.
 * @example <t>listingOnly</t>
 * // Выбор значение поля 'name' в четвертой строке.
 * view.meta(4, 'name');
 * @param {number} index Row index.
 * @param {string} name Name of the metadata field.
 * @return {*} Current value.
 * @see anychart.data.Iterator#meta
 *//**
 * Setter for a metadata value.
 * Принцип работы достаточно хорошо описан в {@link anychart.data.Iterator#meta}.
 * @example <t>listingOnly</t>
 * // Установка значение полю 'name' в четвертой строке.
 * view.meta(4, 'name', 'Samuel L. M.');
 * @param {number} index Row index.
 * @param {string} name Name of the metadata field.
 * @param {*=} opt_value Value to set.
 * @return {anychart.data.View} Экземпляр класса {@link anychart.data.View} для цепочного вызова.
 * @see anychart.data.Iterator#meta
 *//**
 * @ignoreDoc
 * @param {number} index .
 * @param {string} name .
 * @param {*=} opt_value .
 * @return {anychart.data.View|*|undefined} .
 */
anychart.data.View.prototype.meta = function(index, name, opt_value) {
  if (this.transitMeta_) {
    return this.parentMeta.apply(this, arguments);
  }
  if (!this.metadata_) this.metadata_ = [];
  var obj = this.metadata_[index];
  if (!obj)
    this.metadata_[index] = obj = {};
  if (arguments.length > 2) {
    obj[name] = opt_value;
    return this;
  }
  return obj[name];
};


/**
 * Getter and setter for parent metadata value. Can be overridden in descendants.
 *
 * ATTENTION: THE CHECK IF IT IS A SETTER IS MADE BY PARAMS COUNT,
 * e.g. ds.meta(1, 'qqq', undefined); is a SETTER.
 * @param {number} index Row index.
 * @param {string} name Name of the metadata field.
 * @param {*=} opt_value Value to set.
 * @return {anychart.data.View|*|undefined} Self for chaining or value.
 * @protected
 */
anychart.data.View.prototype.parentMeta = function(index, name, opt_value) {
  index = this.mask[index];
  //TODO(Anton Saukh): fix it to proper error reporting.
  if (!goog.isDef(index))
    throw Error('Index cannot be masked by this View');
  if (arguments.length > 2) {
    this.parentView.meta(index, name, opt_value);
    return this;
  } else {
    return this.parentView.meta(index, name);
  }
};


/**
 * Sets metadata transitioning state.
 * @param {boolean} on If the meta should be transitioned.
 */
anychart.data.View.prototype.transitionMeta = function(on) {
  this.transitMeta_ = !!on;
};
