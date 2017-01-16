goog.provide('anychart.data.aggregators.FirstValue');
goog.require('anychart.data.aggregators.Base');



/**
 * Stores the passed first value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.FirstValue = function(valuesColumn) {
  anychart.data.aggregators.FirstValue.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.FirstValue, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.FirstValue.prototype.process = function(value) {
  if (!goog.isDef(this.value))
    this.value = value;
};
