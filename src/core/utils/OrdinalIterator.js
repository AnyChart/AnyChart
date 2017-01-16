goog.provide('anychart.core.utils.OrdinalIterator');

goog.require('anychart.core.utils.ScatterIterator');



/**
 * @param {!Array.<(anychart.core.polar.series.Base|anychart.core.radar.series.Base)>} series .
 * @param {!Array} categories .
 * @param {Function=} opt_pointCallback .
 * @param {Function=} opt_missingCallback .
 * @param {Function=} opt_beforePointCallback .
 * @param {Function=} opt_afterPointCallback .
 * @constructor
 * @extends {anychart.core.utils.ScatterIterator}
 */
anychart.core.utils.OrdinalIterator = function(series, categories, opt_pointCallback, opt_missingCallback, opt_beforePointCallback,
    opt_afterPointCallback) {
  /**
   * @type {!Array}
   * @protected
   */
  this.categories = goog.array.slice(categories, 0);

  anychart.core.utils.OrdinalIterator.base(this, 'constructor', series, false, opt_pointCallback, opt_missingCallback, opt_beforePointCallback, opt_afterPointCallback);
};
goog.inherits(anychart.core.utils.OrdinalIterator, anychart.core.utils.ScatterIterator);


/** @inheritDoc */
anychart.core.utils.OrdinalIterator.prototype.findMin = function(var_args) {
  return this.categories[this.currentIndex];
};


/** @inheritDoc */
anychart.core.utils.OrdinalIterator.prototype.normalize = function(value) {
  return value;
};
