goog.provide('anychart.core.map.projections.Fahey');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Fahey = function() {
  anychart.core.map.projections.Fahey.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Fahey, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Fahey.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var faheyK = Math.cos(goog.math.toRadians(35));

  var t = Math.tan(y / 2);
  x = x * faheyK * this.asqrt(1 - t * t);
  y = (1 + faheyK) * t;

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Fahey.prototype.invert = function(x, y) {
  var faheyK = Math.cos(goog.math.toRadians(35));

  var t = y / (1 + faheyK);
  x = x ? x / (faheyK * this.asqrt(1 - t * t)) : 0;
  y = 2 * Math.atan(t);

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
