goog.provide('anychart.mapModule.projections.Eckert3');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Eckert3 = function() {
  anychart.mapModule.projections.Eckert3.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.projections.Eckert3, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Eckert3.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var k = Math.sqrt(Math.PI * (4 + Math.PI));
  x = 2 / k * x * (1 + Math.sqrt(1 - 4 * y * y / (Math.PI * Math.PI)));
  y = 4 / k * y;

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Eckert3.prototype.invert = function(x, y) {
  var k = Math.sqrt(Math.PI * (4 + Math.PI)) / 2;
  x = x * k / (1 + this.asqrt(1 - y * y * (4 + Math.PI) / (4 * Math.PI)));
  y = y * k / 2;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
