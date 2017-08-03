goog.provide('anychart.stockModule.data.aggregators.Min');
goog.require('anychart.stockModule.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the lowest passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.Min = function(valuesColumn) {
  anychart.stockModule.data.aggregators.Min.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.Min, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.Min.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.Min.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  // the second construction replaces both NaN checking and min determining
  if (!isNaN(value) && !(/** @type {number} */(this.value) <= value))
    this.value = value;
};
