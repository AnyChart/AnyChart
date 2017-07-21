goog.provide('anychart.stockModule.data.aggregators.Last');
goog.require('anychart.stockModule.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the last passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.Last = function(valuesColumn) {
  anychart.stockModule.data.aggregators.Last.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.Last, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.Last.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.Last.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  if (!isNaN(value))
    this.value = value;
};
