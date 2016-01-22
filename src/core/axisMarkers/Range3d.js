goog.provide('anychart.core.axisMarkers.Range3d');
goog.require('anychart.core.axisMarkers.Range');



/**
 * Range marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.Range}
 */
anychart.core.axisMarkers.Range3d = function() {
  anychart.core.axisMarkers.Range3d.base(this, 'constructor');
};
goog.inherits(anychart.core.axisMarkers.Range3d, anychart.core.axisMarkers.Range);


/**
 * Sets the chart axisMarkers belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.axisMarkers.Range3d.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.axisMarkers.Range3d.prototype.getChart = function() {
  return this.chart_;
};


/** @inheritDoc */
anychart.core.axisMarkers.Range3d.prototype.boundsInvalidated = function() {
  this.drawRange3D();
};
