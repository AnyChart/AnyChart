goog.provide('anychart.paretoModule.SeriesMapping');
goog.require('anychart.data.Mapping');



/**
 * Mapping for pareto series.
 * @param {!anychart.data.IView} parentView
 * @extends {anychart.data.Mapping}
 * @constructor
 */
anychart.paretoModule.SeriesMapping = function(parentView) {
  anychart.paretoModule.SeriesMapping.base(this, 'constructor', parentView);
};
goog.inherits(anychart.paretoModule.SeriesMapping, anychart.data.Mapping);


/** @inheritDoc */
anychart.paretoModule.SeriesMapping.prototype.getInternal = function(row, rowIndex, fieldName) {
  if (fieldName == 'value') {
    return this.parentView.getCumulativeFrequency(rowIndex);
  } else {
    return anychart.paretoModule.SeriesMapping.base(this, 'getInternal', row, rowIndex, fieldName);
  }
};


/**
 * Gets cumulative frequency for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Cumulative frequency.
 */
anychart.paretoModule.SeriesMapping.prototype.getCumulativeFrequency = function(rowIndex) {
  return this.parentView.getCumulativeFrequency(rowIndex);
};


/**
 * Gets relative frequency for row index.
 * @param {number} rowIndex Row index.
 * @return {number} Relative frequency.
 */
anychart.paretoModule.SeriesMapping.prototype.getRelativeFrequency = function(rowIndex) {
  return this.parentView.getRelativeFrequency(rowIndex);
};
