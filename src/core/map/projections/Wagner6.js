goog.provide('anychart.core.map.projections.Wagner6');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Wagner6 = function() {
  anychart.core.map.projections.Wagner6.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Wagner6, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Wagner6.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  x = x * Math.sqrt(1 - 3 * y * y / (Math.PI * Math.PI));

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Wagner6.prototype.invert = function(x, y) {
  x = x / Math.sqrt(1 - 3 * y * y / (Math.PI * Math.PI));

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
