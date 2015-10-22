goog.provide('anychart.data.aggregators.Min');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the lowest passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.Min = function(valuesColumn, opt_weightsColumn) {
  goog.base(this, valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.data.aggregators.Min, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.Min.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.data.aggregators.Min.prototype.process = function(value, weight) {
  value = anychart.utils.toNumber(value);
  // the second construction replaces both NaN checking and min determining
  if (!isNaN(value) && !(/** @type {number} */(this.value) <= value))
    this.value = value;
};
