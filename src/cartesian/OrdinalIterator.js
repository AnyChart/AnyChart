goog.provide('anychart.cartesian.OrdinalIterator');

goog.require('anychart.cartesian.ScatterIterator');



/**
 * @param {!Array.<anychart.cartesian.series.Base>} series .
 * @param {!Array} categories .
 * @param {Function=} opt_pointCallback .
 * @param {Function=} opt_missingCallback .
 * @param {Function=} opt_beforePointCallback .
 * @param {Function=} opt_afterPointCallback .
 * @constructor
 * @extends {anychart.cartesian.ScatterIterator}
 */
anychart.cartesian.OrdinalIterator = function(series, categories, opt_pointCallback, opt_missingCallback, opt_beforePointCallback,
    opt_afterPointCallback) {
  /**
   * @type {!Array}
   * @protected
   */
  this.categories = goog.array.slice(categories, 0);

  goog.base(this, series, false, opt_pointCallback, opt_missingCallback, opt_beforePointCallback, opt_afterPointCallback);
};
goog.inherits(anychart.cartesian.OrdinalIterator, anychart.cartesian.ScatterIterator);


/** @inheritDoc */
anychart.cartesian.OrdinalIterator.prototype.findMin = function(var_args) {
  return this.categories[this.currentIndex];
};


/** @inheritDoc */
anychart.cartesian.OrdinalIterator.prototype.normalize = function(value) {
  return value;
};
