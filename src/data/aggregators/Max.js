goog.provide('anychart.data.aggregators.Max');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Stores the highest passed non-NaN value as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.Max = function(valuesColumn) {
  anychart.data.aggregators.Max.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.Max, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.Max.prototype.clear = function() {
  this.value = NaN;
};


/** @inheritDoc */
anychart.data.aggregators.Max.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  // the second construction replaces both NaN checking and max determining
  if (!isNaN(value) && !(/** @type {number} */(this.value) >= value))
    this.value = value;
};
