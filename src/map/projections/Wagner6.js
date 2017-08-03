goog.provide('anychart.mapModule.projections.Wagner6');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Wagner6 = function() {
  anychart.mapModule.projections.Wagner6.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.projections.Wagner6, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Wagner6.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  x = x * Math.sqrt(1 - 3 * y * y / (Math.PI * Math.PI));

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Wagner6.prototype.invert = function(x, y) {
  x = x / Math.sqrt(1 - 3 * y * y / (Math.PI * Math.PI));

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
