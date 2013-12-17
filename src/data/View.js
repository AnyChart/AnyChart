goog.provide('anychart.data.View');

goog.require('anychart.data.Iterator');



/**
 * A "view" - like a db select from a data set.
 * @param {!anychart.data.View} parentView Parent view. The last view is a mapping.
 * @constructor
 * @implements {anychart.data.IView}
 */
anychart.data.View = function(parentView) {
  /**
   * Mapping applied to the views sequence.
   * @type {!anychart.data.Mapping}
   * @private
   */
  this.mapping_ = parentView.getMapping();

  /**
   * The parent view to ask for data from.
   * @type {!anychart.data.IView}
   * @protected
   */
  this.parentView = parentView;
};


/**
 * Redirection mask for a view. Each value in this array means a number of the parentView row to fetch,
 * when that index is asked from the current view.
 * @type {Array.<number>}
 * @protected
 */
anychart.data.View.prototype.mask;


/**
 * Creates prepared derivative view. Internal method. Should not be published!
 * @param {string} fieldName The name of the field to look at.
 * @param {Array=} opt_categories Categories set to use in case of ordinal scale.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.prepare = function(fieldName, opt_categories) {
  var result = new anychart.data.View(this);
  result.mask = opt_categories ?
      this.buildOrdinalMask_(fieldName, /** @type {!Array} */(opt_categories)) :
      this.buildScatterMask_(fieldName);

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
  var result = new anychart.data.View(this);
  var mask = [];
  var iterator = this.getIterator();
  while (iterator.advance()) {
    if (func(iterator.get(fieldName)))
      mask.push(iterator.getIndex());
  }
  result.mask = mask;
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
  rowIndex = this.mask[rowIndex];
  if (goog.isDef(rowIndex)) {
    if (arguments.length > 1)
      return this.parentView.row(rowIndex, opt_value);
    else
      return this.parentView.row(rowIndex);
  }
  return undefined;
};


/**
 * Returns the number of rows in a view.
 * @return {number} Number of rows in the set.
 */
anychart.data.View.prototype.getRowsCount = function() {
  return this.mask.length;
};


/**
 * Returns view mapping.
 * @return {!anychart.data.Mapping} Current view mapping.
 */
anychart.data.View.prototype.getMapping = function() {
  return this.mapping_;
};


/**
 * Returns new iterator for the view.
 * @return {anychart.data.Iterator} New iterator.
 */
anychart.data.View.prototype.getIterator = function() {
  return new anychart.data.Iterator(this);
};


/**
 * Builds mask to use in ordinal view.
 * @param {string} fieldName Field name that should be categorized.
 * @param {!Array} categories A set of categories to fit to.
 * @return {!Array.<number>} Returns masking array.
 * @private
 */
anychart.data.View.prototype.buildOrdinalMask_ = function(fieldName, categories) {
  var result = [];

  var count = categories.length;

  if (count) {
    var i;
    var categoriesMap = [];
    var comparator = function(a, b) {
      return anychart.utils.compare(a.value, b.value);
    };
    for (i = 0; i < count; i++) {
      goog.array.binaryInsert(
          categoriesMap,
          {value: categories[i], index: i},
          comparator
      );
    }

    var mask = new Array(count);
    var iterator = this.getIterator();
    var item = {value: 0, index: 0};
    while (iterator.advance()) {
      var value = iterator.get(fieldName);
      if (goog.isDef(value)) {
        item.value = value;
        var index = goog.array.binarySearch(categoriesMap, item, comparator);
        if (index >= 0) {
          mask[categoriesMap[index].index] = iterator.getIndex();
        }
      }
    }

    for (i = 0; i < count; i++)
      if (i in mask)
        result.push(mask[i]);
  }

  return result;
};


/**
 * Builds mask to use in scatter view.
 * @param {string} fieldName Field name that should be used.
 * @return {!Array.<number>} Returns masking array.
 * @private
 */
anychart.data.View.prototype.buildScatterMask_ = function(fieldName) {
  var mask = [];
  var values = [];
  var iterator = this.getIterator();
  while (iterator.advance()) {
    var value = iterator.get(fieldName);
    if (goog.isDef(value)) {
      var index = goog.array.binarySearch(values, value, anychart.utils.compare);
      if (index < 0) {
        goog.array.insertAt(values, value, ~index);
        goog.array.insertAt(mask, iterator.getIndex(), ~index);
      } else {
        mask[index] = iterator.getIndex();
      }
    }
  }
  return mask;
};
