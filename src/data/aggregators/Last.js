goog.provide('anychart.data.aggregators.Last');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the last passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.Last = function(valuesColumn) {
  anychart.data.aggregators.Last.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.Last, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.Last.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.data.aggregators.Last.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  if (!isNaN(value))
    this.value = value;
};
