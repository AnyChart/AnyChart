goog.provide('anychart.core.map.projections.Equirectangular');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Equirectangular = function() {
  anychart.core.map.projections.Equirectangular.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Equirectangular, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Equirectangular.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Equirectangular.prototype.invert = function(x, y) {
  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
