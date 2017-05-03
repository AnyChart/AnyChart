goog.provide('anychart.core.series.Mekko');
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
anychart.core.series.Mekko = function(chart, plot, type, config, sortedMode, barmekkoMode) {
  anychart.core.series.Mekko.base(this, 'constructor', chart, plot, type, config, sortedMode);

  /**
   * @type {boolean}
   * @private
   */
  this.barmekkoMode_ = barmekkoMode;
};
goog.inherits(anychart.core.series.Mekko, anychart.core.series.Cartesian);


/** @inheritDoc */
anychart.core.series.Mekko.prototype.normalizeYValue = function(value) {
  return !this.barmekkoMode_ && value < 0 ? 0 : value;
};


/** @inheritDoc */
anychart.core.series.Mekko.prototype.drawMarker = function(point, pointState) {
  if (this.barmekkoMode_ || /** @type {number} */(point.get('value')) > 0)
    anychart.core.series.Mekko.base(this, 'drawMarker', point, pointState);
};


/** @inheritDoc */
anychart.core.series.Mekko.prototype.drawLabel = function(point, pointState) {
  if (this.barmekkoMode_ || /** @type {number} */(point.get('value')) > 0)
    anychart.core.series.Mekko.base(this, 'drawLabel', point, pointState);
};
