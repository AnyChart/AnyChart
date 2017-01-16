goog.provide('anychart.data.ScatterView');

goog.require('anychart.data.View');
goog.require('goog.array');



/**
 * Special view to use as the terminating view with Scatter scales.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @param {string} fieldName Field name to make scatter mask by.
 * @param {boolean} isDateTime If the View should use timestamp normalization before considering values.
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.ScatterView = function(parentView, fieldName, isDateTime) {
  anychart.data.ScatterView.base(this, 'constructor', parentView);

  /**
   * Field name to categorize by. Stored for data change events.
   * @type {string}
   * @private
   */
  this.fieldName_ = fieldName;

  /**
   * If the View should use timestamp normalization before considering values.
   * @type {boolean}
   * @private
   */
  this.dateTimeMode_ = isDateTime;
};
goog.inherits(anychart.data.ScatterView, anychart.data.View);


/** @inheritDoc */
anychart.data.ScatterView.prototype.buildMask = function() {
  var mask = [];
  var values = [];
  var iterator = this.parentView.getIterator();
  while (iterator.advance()) {
    var value = iterator.get(this.fieldName_);
    if (goog.isDef(value)) {
      if (this.dateTimeMode_)
        value = anychart.utils.normalizeTimestamp(value);
      var index = goog.array.binarySearch(values, value, anychart.utils.compareAsc);
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


/**
 * Searches the current scatter view for the specified fieldValue using the
 * binary search algorithm. Elements are compared using
 * <code>anychart.utils.compareAsc</code>, which compares the elements using
 * < and > operators for comparing numbers and anychart.utils.hash for
 * comparing other types (String, Objects, Functions).
 *
 * @private
 *
 * @param {number} fieldValue The sought value. Should be number.
 * @return {number} Lowest index of the fieldValue if found, otherwise index
 *    of nearest to fieldValue element in view.
 */
anychart.data.ScatterView.prototype.search_ = function(fieldValue) {
  var iterator = this.getIterator();
  var length = iterator.getRowsCount();

  var left = 0; // inclusive
  var right = length; // exclusive
  var found, compareResult;

  while (left < right) {
    var middle = (left + right) >> 1;
    iterator.select(middle);
    var currX = iterator.get('x');
    if (this.dateTimeMode_)
      currX = anychart.utils.normalizeTimestamp(currX);
    compareResult = anychart.utils.compareAsc(fieldValue, currX);
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      found = !compareResult;
    }
  }

  if (found || !left)
    return left;
  else if (left == length)
    return left - 1;
  else {
    iterator.select(left);
    var cur = /** @type {number} */ (iterator.get('x'));
    iterator.select(left - 1);
    var prev = /** @type {number} */ (iterator.get('x'));
    if (Math.abs(cur - fieldValue) <= Math.abs(prev - fieldValue))
      return left;
    else
      return left - 1;
  }
};


/**
 * @inheritDoc
 */
anychart.data.ScatterView.prototype.findInRangeByX = function(minValue, maxValue) {
  this.ensureConsistent();
  var minIndex = this.search_(/** @type {number} */ (minValue));
  var maxIndex = this.search_(/** @type {number} */ (maxValue));

  var indexes = [];
  for (var i = minIndex; i <= maxIndex; i++)
    indexes.push(i);

  return indexes;
};


/**
 * @inheritDoc
 */
anychart.data.ScatterView.prototype.find = function(fieldName, fieldValue) {
  if (fieldName != 'x')
    return anychart.data.ScatterView.base(this, 'find', fieldName, fieldValue);

  this.ensureConsistent();
  return this.search_(/** @type {number} */ (fieldValue));
};
