goog.provide('anychart.mapModule.projections.Mercator');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Mercator = function() {
  anychart.mapModule.projections.Mercator.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.projections.Mercator, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Mercator.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  y = Math.log(Math.tan(Math.PI / 4 + y / 2));

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Mercator.prototype.invert = function(x, y) {
  x = x;
  y = 2 * Math.atan(Math.exp(y)) - Math.PI / 2;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
