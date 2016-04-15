goog.provide('anychart.core.map.projections.Bonne');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Bonne = function() {
  anychart.core.map.projections.Bonne.base(this, 'constructor');

  var parallel = 45;
  /**
   * @type {number}
   */
  this.φ0 = parallel * Math.PI / 180;
  /**
   * @type {number}
   */
  this.cotφ0 = 1 / Math.tan(this.φ0);
};
goog.inherits(anychart.core.map.projections.Bonne, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Bonne.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var ρ = this.cotφ0 + this.φ0 - y;
  var E = ρ ? x * Math.cos(y) / ρ : ρ;
  x = ρ * Math.sin(E);
  y = this.cotφ0 - ρ * Math.cos(E);

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Bonne.prototype.invert = function(x, y) {
  var ρ = Math.sqrt(x * x + (y = this.cotφ0 - y) * y);
  var φ = this.cotφ0 + this.φ0 - ρ;
  x = ρ / Math.cos(φ) * Math.atan2(x, y);
  y = φ;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
