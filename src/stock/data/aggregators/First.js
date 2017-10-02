goog.provide('anychart.stockModule.data.aggregators.First');
goog.require('anychart.stockModule.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.First = function(valuesColumn) {
  anychart.stockModule.data.aggregators.First.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.First, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.First.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.First.prototype.process = function(value) {
  if (isNaN(this.value))
    this.value = anychart.utils.toNumber(value);
};
