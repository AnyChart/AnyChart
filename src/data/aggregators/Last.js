goog.provide('anychart.data.aggregators.Last');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the last passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.Last = function(valuesColumn, opt_weightsColumn) {
  goog.base(this, valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.data.aggregators.Last, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.Last.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.data.aggregators.Last.prototype.process = function(value, weight) {
  value = anychart.utils.toNumber(value);
  if (!isNaN(value))
    this.value = value;
};
