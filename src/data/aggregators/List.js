goog.provide('anychart.data.aggregators.List');
goog.require('anychart.data.aggregators.Base');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.List = function(valuesColumn) {
  anychart.data.aggregators.List.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.List, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.List.prototype.clear = function() {
  this.value = [];
};


/** @inheritDoc */
anychart.data.aggregators.List.prototype.process = function(value) {
  if (goog.isDef(value))
    this.value.push(value);
};
