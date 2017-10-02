goog.provide('anychart.mapModule.projections.Equirectangular');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Equirectangular = function() {
  anychart.mapModule.projections.Equirectangular.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.projections.Equirectangular, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Equirectangular.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Equirectangular.prototype.invert = function(x, y) {
  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
