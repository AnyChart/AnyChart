goog.provide('anychart.data.aggregators.FirstValue');
goog.require('anychart.data.aggregators.Base');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.FirstValue = function(valuesColumn, opt_weightsColumn) {
  goog.base(this, valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.data.aggregators.FirstValue, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.FirstValue.prototype.process = function(value, weight) {
  if (!goog.isDef(this.value))
    this.value = value;
};
