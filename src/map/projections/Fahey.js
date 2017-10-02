goog.provide('anychart.mapModule.projections.Fahey');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Fahey = function() {
  anychart.mapModule.projections.Fahey.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.projections.Fahey, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Fahey.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var faheyK = Math.cos(goog.math.toRadians(35));

  var t = Math.tan(y / 2);
  x = x * faheyK * this.asqrt(1 - t * t);
  y = (1 + faheyK) * t;

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Fahey.prototype.invert = function(x, y) {
  var faheyK = Math.cos(goog.math.toRadians(35));

  var t = y / (1 + faheyK);
  x = x ? x / (faheyK * this.asqrt(1 - t * t)) : 0;
  y = 2 * Math.atan(t);

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
