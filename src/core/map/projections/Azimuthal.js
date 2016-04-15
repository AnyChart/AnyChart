goog.provide('anychart.core.map.projections.Azimuthal');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @param {Function} scale Scale.
 * @param {Function} angle
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Azimuthal = function(scale, angle) {
  anychart.core.map.projections.Azimuthal.base(this, 'constructor');

  /**
   * @type {Function}
   */
  this.scale = scale;

  /**
   * @type {Function}
   */
  this.angle = angle;
};
goog.inherits(anychart.core.map.projections.Azimuthal, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Azimuthal.prototype.forward = function(x, y) {
  var cosλ = Math.cos(x);
  var cosφ = Math.cos(y);
  var k = this.scale(cosλ * cosφ);

  x = k * cosφ * Math.sin(x);
  y = k * Math.sin(y);

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Azimuthal.prototype.invert = function(x, y) {
  var ρ = Math.sqrt(x * x + y * y);
  var c = this.angle(ρ);
  var sinc = Math.sin(c);
  var cosc = Math.cos(c);

  x = Math.atan2(x * sinc, ρ * cosc);
  y = Math.asin(ρ && y * sinc / ρ);

  return [x, y];
};
