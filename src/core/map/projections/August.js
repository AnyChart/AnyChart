goog.provide('anychart.core.map.projections.August');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.August = function() {
  anychart.core.map.projections.August.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.August, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.August.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var tan = Math.tan(y / 2);
  var k = this.asqrt(1 - tan * tan);
  var c = 1 + k * Math.cos(x /= 2);
  var x_ = Math.sin(x) * k / c;
  var y_ = tan / c;
  var x2 = x_ * x_;
  var y2 = y_ * y_;

  x = 4 / 3 * x_ * (3 + x2 - 3 * y2);
  y = 4 / 3 * y_ * (3 + 3 * x2 - y2);

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.August.prototype.invert = function(x, y) {
  x *= 3 / 8;
  y *= 3 / 8;
  if (!x && Math.abs(y) > 1) return [NaN, NaN];
  var x2 = x * x;
  var y2 = y * y;
  var s = 1 + x2 + y2;
  var sin3eta = Math.sqrt(.5 * (s - Math.sqrt(s * s - 4 * y * y)));
  var eta = this.asin(sin3eta) / 3;
  var xi = sin3eta ? this.arcosh(Math.abs(y / sin3eta)) / 3 : this.arsinh(Math.abs(x)) / 3;
  var coseta = Math.cos(eta);
  var coshxi = this.cosh(xi);
  var d = coshxi * coshxi - coseta * coseta;
  x = this.sgn(x) * 2 * Math.atan2(this.sinh(xi) * coseta, .25 - d);
  y = this.sgn(y) * 2 * Math.atan2(coshxi * Math.sin(eta), .25 + d);

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
