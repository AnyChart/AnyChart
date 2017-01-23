goog.provide('anychart.data.ParetoSeriesMapping');
goog.require('anychart.data.Mapping');



/**
 * Mapping for pareto series.
 * @param {!anychart.data.IView} parentView
 * @extends {anychart.data.Mapping}
 * @constructor
 */
anychart.data.ParetoSeriesMapping = function(parentView) {
  anychart.data.ParetoSeriesMapping.base(this, 'constructor', parentView);
};
goog.inherits(anychart.data.ParetoSeriesMapping, anychart.data.Mapping);


/** @inheritDoc */
anychart.data.ParetoSeriesMapping.prototype.getInternal = function(row, rowIndex, fieldName) {
  if (fieldName == 'value') {
    return this.parentView.getCumulativeFrequency(rowIndex);
  } else {
    return anychart.data.ParetoSeriesMapping.base(this, 'getInternal', row, rowIndex, fieldName);
  }
};


/**
 * Gets cumulative frequency for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Cumulative frequency.
 */
anychart.data.ParetoSeriesMapping.prototype.getCumulativeFrequency = function(rowIndex) {
  return this.parentView.getCumulativeFrequency(rowIndex);
};


/**
 * Gets relative frequency for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Relative frequency.
 */
anychart.data.ParetoSeriesMapping.prototype.getRelativeFrequency = function(rowIndex) {
  return this.parentView.getRelativeFrequency(rowIndex);
};
