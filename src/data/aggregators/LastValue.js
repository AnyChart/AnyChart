goog.provide('anychart.data.aggregators.LastValue');
goog.require('anychart.data.aggregators.Base');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.LastValue = function(valuesColumn, opt_weightsColumn) {
  goog.base(this, valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.data.aggregators.LastValue, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.LastValue.prototype.process = function(value, weight) {
  if (goog.isDef(value))
    this.value = value;
};
