goog.provide('anychart.data.aggregators.First');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.First = function(valuesColumn) {
  anychart.data.aggregators.First.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.First, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.First.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.data.aggregators.First.prototype.process = function(value) {
  if (isNaN(this.value))
    this.value = anychart.utils.toNumber(value);
};
