goog.provide('anychart.data.OrdinalView');

goog.require('anychart.data.View');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Special view to use as the terminating view with Ordinal scales.
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @param {string} fieldName Field name to make ordinal mask by.
 * @param {!Array} categories A set of categories to fit to.
 * @constructor
 * @extends {anychart.data.View}
 */
anychart.data.OrdinalView = function(parentView, fieldName, categories) {
  anychart.data.OrdinalView.base(this, 'constructor', parentView);

  /**
   * Field name to categorize by. Stored for data change events.
   * @type {string}
   * @private
   */
  this.fieldName_ = fieldName;

  /**
   * A set of categories to fit to. Stored a copy for data change events.
   * @type {!Array.<{value, index:number}>}
   * @private
   */
  this.categoriesMap_ = [];

  for (var i = 0; i < categories.length; i++) {
    goog.array.binaryInsert(
        this.categoriesMap_,
        {value: categories[i], index: i},
        this.comparator_
    );
  }
};
goog.inherits(anychart.data.OrdinalView, anychart.data.View);


/**
 * Compares to values of special kind.
 * @param {{value}} a The first item.
 * @param {{value}} b The second item.
 * @return {number} The comparison result.
 * @private
 */
anychart.data.OrdinalView.prototype.comparator_ = function(a, b) {
  return anychart.utils.compareAsc(a.value, b.value);
};


/** @inheritDoc */
anychart.data.OrdinalView.prototype.buildMask = function() {
  var result = [];

  var count = this.categoriesMap_.length;
  if (count) {
    var mask = new Array(count);
    var iterator = this.parentView.getIterator();
    var item = {value: 0, index: 0};
    while (iterator.advance()) {
      var value = iterator.get(this.fieldName_);
      if (goog.isDef(value)) {
        item.value = value;
        var index = goog.array.binarySearch(this.categoriesMap_, item, this.comparator_);
        if (index >= 0) {
          mask[this.categoriesMap_[index].index] = iterator.getIndex();
        }
      }
    }

    for (var i = 0; i < count; i++)
      if (i in mask)
        result.push(mask[i]);
  }

  return result;
};
