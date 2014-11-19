goog.provide('anychart.utils.OrdinalIterator');

goog.require('anychart.utils.ScatterIterator');



/**
 * @param {!Array.<(anychart.cartesian.series.Base|anychart.polar.series.Base|anychart.radar.series.Base)>} series .
 * @param {!Array} categories .
 * @param {Function=} opt_pointCallback .
 * @param {Function=} opt_missingCallback .
 * @param {Function=} opt_beforePointCallback .
 * @param {Function=} opt_afterPointCallback .
 * @constructor
 * @extends {anychart.utils.ScatterIterator}
 */
anychart.utils.OrdinalIterator = function(series, categories, opt_pointCallback, opt_missingCallback, opt_beforePointCallback,
    opt_afterPointCallback) {
  /**
   * @type {!Array}
   * @protected
   */
  this.categories = goog.array.slice(categories, 0);

  goog.base(this, series, false, opt_pointCallback, opt_missingCallback, opt_beforePointCallback, opt_afterPointCallback);
};
goog.inherits(anychart.utils.OrdinalIterator, anychart.utils.ScatterIterator);


/** @inheritDoc */
anychart.utils.OrdinalIterator.prototype.findMin = function(var_args) {
  return this.categories[this.currentIndex];
};


/** @inheritDoc */
anychart.utils.OrdinalIterator.prototype.normalize = function(value) {
  return value;
};
