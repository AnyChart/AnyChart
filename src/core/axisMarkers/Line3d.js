goog.provide('anychart.core.axisMarkers.Line3d');
goog.require('anychart.core.axisMarkers.Line');



/**
 * Line marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.Line}
 */
anychart.core.axisMarkers.Line3d = function() {
  anychart.core.axisMarkers.Line3d.base(this, 'constructor');
};
goog.inherits(anychart.core.axisMarkers.Line3d, anychart.core.axisMarkers.Line);


/**
 * Sets the chart axisMarkers belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.axisMarkers.Line3d.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.axisMarkers.Line3d.prototype.getChart = function() {
  return this.chart_;
};


/** @inheritDoc */
anychart.core.axisMarkers.Line3d.prototype.boundsInvalidated = function() {
  this.drawLine3D();
};
