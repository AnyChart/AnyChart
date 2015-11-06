goog.provide('anychart.data.aggregators.List');
goog.require('anychart.data.aggregators.Base');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @param {(number|string)=} opt_weightsColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.List = function(valuesColumn, opt_weightsColumn) {
  goog.base(this, valuesColumn, opt_weightsColumn);
};
goog.inherits(anychart.data.aggregators.List, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.List.prototype.clear = function() {
  this.value = [];
};


/** @inheritDoc */
anychart.data.aggregators.List.prototype.process = function(value, weight) {
  if (goog.isDef(value))
    this.value.push(value);
};
