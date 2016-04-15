goog.provide('anychart.core.map.projections.Orthographic');
goog.require('anychart.core.map.projections.Azimuthal');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Orthographic = function() {
  anychart.core.map.projections.Orthographic.base(this, 'constructor');

  this.azimuthalProj = new anychart.core.map.projections.Azimuthal(function() {
    return 1;
  }, Math.asin);
};
goog.inherits(anychart.core.map.projections.Orthographic, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Orthographic.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var coords = this.azimuthalProj.forward(x, y);
  x = coords[0];
  y = coords[1];

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Orthographic.prototype.invert = function(x, y) {
  var coords = this.azimuthalProj.invert(x, y);
  x = coords[0];
  y = coords[1];

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
