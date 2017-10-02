goog.provide('anychart.mapModule.projections.Hammer');
goog.require('anychart.mapModule.projections.Azimuthal');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Hammer = function() {
  anychart.mapModule.projections.Hammer.base(this, 'constructor');

  /**
   * @type {number}
   */
  this.B = 2;

  /**
   * @type {number}
   */
  this.A = 2;

  /**
   * @type {anychart.mapModule.projections.Azimuthal}
   */
  this.azimuthalProj = new anychart.mapModule.projections.Azimuthal(function(coslambdacosphi) {
    return Math.sqrt(2 / (1 + coslambdacosphi));
  }, function(ro) {
    return 2 * Math.asin(ro / 2);
  });
};
goog.inherits(anychart.mapModule.projections.Hammer, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Hammer.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var coordinates = this.azimuthalProj.forward(x / this.B, y);
  coordinates[0] *= this.A;

  x = coordinates[0];
  y = coordinates[1];

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Hammer.prototype.invert = function(x, y) {
  var coordinates = this.azimuthalProj.invert(x / this.A, y);
  coordinates[0] *= this.B;

  x = coordinates[0];
  y = coordinates[1];

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
