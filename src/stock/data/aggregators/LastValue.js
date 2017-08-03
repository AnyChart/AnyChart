goog.provide('anychart.stockModule.data.aggregators.LastValue');
goog.require('anychart.stockModule.data.aggregators.Base');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.LastValue = function(valuesColumn) {
  anychart.stockModule.data.aggregators.LastValue.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.LastValue, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.LastValue.prototype.process = function(value) {
  if (goog.isDef(value))
    this.value = value;
};
