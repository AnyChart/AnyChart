goog.provide('anychart.mapModule.projections.Orthographic');
goog.require('anychart.mapModule.projections.Azimuthal');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Orthographic = function() {
  anychart.mapModule.projections.Orthographic.base(this, 'constructor');

  this.azimuthalProj = new anychart.mapModule.projections.Azimuthal(function() {
    return 1;
  }, Math.asin);
};
goog.inherits(anychart.mapModule.projections.Orthographic, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Orthographic.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var coords = this.azimuthalProj.forward(x, y);
  x = coords[0];
  y = coords[1];

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Orthographic.prototype.invert = function(x, y) {
  var coords = this.azimuthalProj.invert(x, y);
  x = coords[0];
  y = coords[1];

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
