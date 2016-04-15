goog.provide('anychart.core.map.projections.Eckert1');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Eckert1 = function() {
  anychart.core.map.projections.Eckert1.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Eckert1, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Eckert1.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var α = Math.sqrt(8 / (3 * Math.PI));
  x = α * x * (1 - Math.abs(y) / Math.PI);
  y = α * y;


  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Eckert1.prototype.invert = function(x, y) {
  var α = Math.sqrt(8 / (3 * Math.PI));
  var φ = y / α;
  x = x / (α * (1 - Math.abs(φ) / Math.PI));
  y = φ;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
