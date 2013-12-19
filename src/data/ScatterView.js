goog.provide('anychart.data.ScatterView');

goog.require('anychart.data.View');
goog.require('goog.array');



/**
 * Special view to use as the terminating view with Scatter scales.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @param {string} fieldName Field name to make scatter mask by.
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.ScatterView = function(parentView, fieldName) {
  goog.base(this, parentView);

  /**
   * Field name to categorize by. Stored for data change events.
   * @type {string}
   * @private
   */
  this.fieldName_ = fieldName;
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
