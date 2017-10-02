goog.provide('anychart.mapModule.projections.Azimuthal');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @param {Function} scale Scale.
 * @param {Function} angle
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Azimuthal = function(scale, angle) {
  anychart.mapModule.projections.Azimuthal.base(this, 'constructor');

  /**
   * @type {Function}
   */
  this.scale = scale;

  /**
   * @type {Function}
   */
  this.angle = angle;
};
goog.inherits(anychart.mapModule.projections.Azimuthal, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Azimuthal.prototype.forward = function(x, y) {
  var coslambda = Math.cos(x);
  var cosphi = Math.cos(y);
  var k = this.scale(coslambda * cosphi);

  x = k * cosphi * Math.sin(x);
  y = k * Math.sin(y);

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Azimuthal.prototype.invert = function(x, y) {
  var ro = anychart.math.vectorLength(0, 0, x, y);
  var c = this.angle(ro);
  var sinc = Math.sin(c);
  var cosc = Math.cos(c);

  x = Math.atan2(x * sinc, ro * cosc);
  y = Math.asin(ro && y * sinc / ro);

  return [x, y];
};
