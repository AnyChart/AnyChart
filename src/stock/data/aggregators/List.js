goog.provide('anychart.stockModule.data.aggregators.List');
goog.require('anychart.stockModule.data.aggregators.Base');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.List = function(valuesColumn) {
  anychart.stockModule.data.aggregators.List.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.List, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.List.prototype.clear = function() {
  this.value = [];
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.List.prototype.process = function(value) {
  if (goog.isDef(value))
    this.value.push(value);
};
