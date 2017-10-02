goog.provide('anychart.mekkoModule.Series');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.utils.IInteractiveSeries');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @param {boolean} barmekkoMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.mekkoModule.Series = function(chart, plot, type, config, sortedMode, barmekkoMode) {
  anychart.mekkoModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);

  /**
   * @type {boolean}
   * @private
   */
  this.barmekkoMode_ = barmekkoMode;
};
goog.inherits(anychart.mekkoModule.Series, anychart.core.series.Cartesian);


/** @inheritDoc */
anychart.mekkoModule.Series.prototype.normalizeYValue = function(value) {
  return !this.barmekkoMode_ && value < 0 ? 0 : value;
};


/** @inheritDoc */
anychart.mekkoModule.Series.prototype.drawMarker = function(point, pointState, pointStateChanged) {
  if (this.barmekkoMode_ || /** @type {number} */(point.get('value')) > 0)
    anychart.mekkoModule.Series.base(this, 'drawMarker', point, pointState, pointStateChanged);
};


/** @inheritDoc */
anychart.mekkoModule.Series.prototype.drawLabel = function(point, pointState, pointStateChanged) {
  if (this.barmekkoMode_ || /** @type {number} */(point.get('value')) > 0)
    anychart.mekkoModule.Series.base(this, 'drawLabel', point, pointState, pointStateChanged);
};
