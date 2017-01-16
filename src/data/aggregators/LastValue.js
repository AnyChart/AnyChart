goog.provide('anychart.data.aggregators.LastValue');
goog.require('anychart.data.aggregators.Base');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.LastValue = function(valuesColumn) {
  anychart.data.aggregators.LastValue.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.LastValue, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.LastValue.prototype.process = function(value) {
  if (goog.isDef(value))
    this.value = value;
};
