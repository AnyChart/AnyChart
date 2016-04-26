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
  this.phi0 = parallel * Math.PI / 180;
  /**
   * @type {number}
   */
  this.cotphi0 = 1 / Math.tan(this.phi0);
};
goog.inherits(anychart.core.map.projections.Bonne, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Bonne.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var ro = this.cotphi0 + this.phi0 - y;
  var E = ro ? x * Math.cos(y) / ro : ro;
  x = ro * Math.sin(E);
  y = this.cotphi0 - ro * Math.cos(E);

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Bonne.prototype.invert = function(x, y) {
  var ro = Math.sqrt(x * x + (y = this.cotphi0 - y) * y);
  var phi = this.cotphi0 + this.phi0 - ro;
  x = ro / Math.cos(phi) * Math.atan2(x, y);
  y = phi;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
