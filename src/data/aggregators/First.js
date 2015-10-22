goog.provide('anychart.data.aggregators.First');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.First = function(valuesColumn, opt_weightsColumn) {
  goog.base(this, valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.data.aggregators.First, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.First.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.data.aggregators.First.prototype.process = function(value, weight) {
  if (isNaN(this.value))
    this.value = anychart.utils.toNumber(value);
};
