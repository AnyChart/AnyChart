goog.provide('anychart.stockModule.data.aggregators.Sum');
goog.require('anychart.stockModule.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.Sum = function(valuesColumn) {
  anychart.stockModule.data.aggregators.Sum.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.Sum, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.Sum.prototype.clear = function() {
  this.value = 0;
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.Sum.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  if (!isNaN(value)) {
    this.value += value;
  }
};
