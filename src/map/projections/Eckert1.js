goog.provide('anychart.mapModule.projections.Eckert1');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Eckert1 = function() {
  anychart.mapModule.projections.Eckert1.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.projections.Eckert1, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Eckert1.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var alpha = Math.sqrt(8 / (3 * Math.PI));
  x = alpha * x * (1 - Math.abs(y) / Math.PI);
  y = alpha * y;


  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Eckert1.prototype.invert = function(x, y) {
  var alpha = Math.sqrt(8 / (3 * Math.PI));
  var phi = y / alpha;
  x = x / (alpha * (1 - Math.abs(phi) / Math.PI));
  y = phi;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
