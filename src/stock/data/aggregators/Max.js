goog.provide('anychart.stockModule.data.aggregators.Max');
goog.require('anychart.stockModule.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the highest passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.stockModule.data.aggregators.Base}
 */
anychart.stockModule.data.aggregators.Max = function(valuesColumn) {
  anychart.stockModule.data.aggregators.Max.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.stockModule.data.aggregators.Max, anychart.stockModule.data.aggregators.Base);


/** @inheritDoc */
anychart.stockModule.data.aggregators.Max.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.stockModule.data.aggregators.Max.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  // the second construction replaces both NaN checking and max determining
  if (!isNaN(value) && !(/** @type {number} */(this.value) >= value))
    this.value = value;
};
