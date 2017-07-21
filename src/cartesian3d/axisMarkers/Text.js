goog.provide('anychart.cartesian3dModule.axisMarkers.Text');
goog.require('anychart.core.axisMarkers.Text');



/**
 * Text marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.Text}
 */
anychart.cartesian3dModule.axisMarkers.Text = function() {
  anychart.cartesian3dModule.axisMarkers.Text.base(this, 'constructor');
};
goog.inherits(anychart.cartesian3dModule.axisMarkers.Text, anychart.core.axisMarkers.Text);


/** @inheritDoc */
anychart.cartesian3dModule.axisMarkers.Text.prototype.parentBounds = function(opt_boundsOrLeft, opt_top, opt_width, opt_height) {
  var parentBounds = anychart.cartesian3dModule.axisMarkers.Text.base(this, 'parentBounds', opt_boundsOrLeft, opt_top, opt_width, opt_height);

  if (!goog.isDef(opt_boundsOrLeft)) {
    var x3dShift = this.getChart().x3dShift;
    var y3dShift = this.getChart().y3dShift;
    parentBounds.top -= y3dShift;
    parentBounds.height += y3dShift;
    parentBounds.width += x3dShift;
  }

  return parentBounds;
};
