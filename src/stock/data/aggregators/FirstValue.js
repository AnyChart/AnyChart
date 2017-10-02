goog.provide('anychart.stockModule.data.aggregators.FirstValue');
goog.require('anychart.stockModule.data.aggregators.Base');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.FirstValue = function(valuesColumn) {
  anychart.stockModule.data.aggregators.FirstValue.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.FirstValue, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.FirstValue.prototype.process = function(value) {
  if (!goog.isDef(this.value))
    this.value = value;
};
