goog.provide('anychart.core.map.projections.Mercator');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Mercator = function() {
  anychart.core.map.projections.Mercator.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Mercator, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Mercator.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  y = Math.log(Math.tan(Math.PI / 4 + y / 2));

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Mercator.prototype.invert = function(x, y) {
  x = x;
  y = 2 * Math.atan(Math.exp(y)) - Math.PI / 2;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
