goog.provide('anychart.core.axisMarkers.Text3d');
goog.require('anychart.core.axisMarkers.Text');



/**
 * Text marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.Text}
 */
anychart.core.axisMarkers.Text3d = function() {
  anychart.core.axisMarkers.Text3d.base(this, 'constructor');
};
goog.inherits(anychart.core.axisMarkers.Text3d, anychart.core.axisMarkers.Text);


/**
 * Sets the chart axisMarkers belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.axisMarkers.Text3d.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.axisMarkers.Text3d.prototype.getChart = function() {
  return this.chart_;
};


/** @inheritDoc */
anychart.core.axisMarkers.Text3d.prototype.parentBounds = function(opt_boundsOrLeft, opt_top, opt_width, opt_height) {
  var parentBounds = goog.base(this, 'parentBounds', opt_boundsOrLeft, opt_top, opt_width, opt_height);

  if (!goog.isDef(opt_boundsOrLeft)) {
    var x3dShift = this.getChart().x3dShift;
    var y3dShift = this.getChart().y3dShift;
    parentBounds.top -= y3dShift;
    parentBounds.height += y3dShift;
    parentBounds.width += x3dShift;
  }

  return parentBounds;
};
