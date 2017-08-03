goog.provide('anychart.stockModule.data.aggregators.WeightedAverage');
goog.require('anychart.stockModule.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.WeightedAverage = function(valuesColumn, opt_weightsColumn) {
  anychart.stockModule.data.aggregators.WeightedAverage.base(this, 'constructor', valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.WeightedAverage, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.WeightedAverage.prototype.clear = function() {
  /**
   * Number of passed non-NaN values.
   * @type {number}
   * @private
   */
  this.count_ = 0;
  this.value = 0;
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.WeightedAverage.prototype.process = function(value, weight) {
  value = anychart.utils.toNumber(value);
  weight = anychart.utils.toNumber(weight) || 0;
  if (!isNaN(value)) {
    // Doesn't work good, when values are big (> 1e20), but it should work fine on real cases
    this.value += value * /** @type {number} */(weight);
    this.count_ += weight;
  }
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.WeightedAverage.prototype.getValueAndClear = function() {
  var res = this.count_ ? /** @type {number} */(this.value) / this.count_ : NaN;
  this.clear();
  return res;
};
