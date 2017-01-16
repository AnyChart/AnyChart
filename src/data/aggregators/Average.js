goog.provide('anychart.data.aggregators.Average');
goog.require('anychart.data.aggregators.Base');
goog.require('anychart.utils');



/**
 * Counts the average between all passed non-NaN values as the value of the aggregate.
 * @param {number|string} valuesColumn
 * @constructor
 * @extends {anychart.data.aggregators.Base}
 */
anychart.data.aggregators.Average = function(valuesColumn) {
  anychart.data.aggregators.Average.base(this, 'constructor', valuesColumn);
};
goog.inherits(anychart.data.aggregators.Average, anychart.data.aggregators.Base);


/** @inheritDoc */
anychart.data.aggregators.Average.prototype.clear = function() {
  /**
   * Number of passed non-NaN values.
   * @type {number}
   * @private
   */
  this.count_ = 0;
  this.value = 0;
};


/** @inheritDoc */
anychart.data.aggregators.Average.prototype.process = function(value) {
  value = anychart.utils.toNumber(value);
  if (!isNaN(value)) {
    // Doesn't work good, when values are big, but it was the same technique in Flash Stock - nobody complained
    this.value += value;
    this.count_++;
  }
};


/** @inheritDoc */
anychart.data.aggregators.Average.prototype.getValueAndClear = function() {
  var res = this.count_ ? /** @type {number} */(this.value) / this.count_ : NaN;
  this.clear();
  return res;
};
