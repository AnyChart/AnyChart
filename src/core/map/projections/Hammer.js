goog.provide('anychart.core.map.projections.Hammer');
goog.require('anychart.core.map.projections.Azimuthal');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Hammer = function() {
  anychart.core.map.projections.Hammer.base(this, 'constructor');

  /**
   * @type {number}
   */
  this.B = 2;

  /**
   * @type {number}
   */
  this.A = 2;

  /**
   * @type {anychart.core.map.projections.Azimuthal}
   */
  this.azimuthalProj = new anychart.core.map.projections.Azimuthal(function(coslambdacosphi) {
    return Math.sqrt(2 / (1 + coslambdacosphi));
  }, function(ro) {
    return 2 * Math.asin(ro / 2);
  });
};
goog.inherits(anychart.core.map.projections.Hammer, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Hammer.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var coordinates = this.azimuthalProj.forward(x / this.B, y);
  coordinates[0] *= this.A;

  x = coordinates[0];
  y = coordinates[1];

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Hammer.prototype.invert = function(x, y) {
  var coordinates = this.azimuthalProj.invert(x / this.A, y);
  coordinates[0] *= this.B;

  x = coordinates[0];
  y = coordinates[1];

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
