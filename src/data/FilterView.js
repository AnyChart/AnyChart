goog.provide('anychart.data.FilterView');

goog.require('anychart.data.View');



/**
 * Filtering view.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @param {string} fieldName Field name to make filter by.
 * @param {function(*):boolean} func Filter function that should accept a field value and return true if the row
 *    should be included into the resulting view and false otherwise.
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.FilterView = function(parentView, fieldName, func) {
  anychart.data.FilterView.base(this, 'constructor', parentView);

  /**
   * Field name to categorize by. Stored for data change events.
   * @type {string}
   * @private
   */
  this.fieldName_ = fieldName;

  /**
   * Filter function.
   * @type {function(*): boolean}
   * @private
   */
  this.func_ = func;
};
goog.inherits(anychart.data.FilterView, anychart.data.View);


/** @inheritDoc */
anychart.data.FilterView.prototype.buildMask = function() {
  var mask = [];
  var iterator = this.parentView.getIterator();
  while (iterator.advance()) {
    if (this.func_(iterator.get(this.fieldName_)))
      mask.push(iterator.getIndex());
  }
  return mask;
};
