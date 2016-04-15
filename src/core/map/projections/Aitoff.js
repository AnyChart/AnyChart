goog.provide('anychart.core.map.projections.Aitoff');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Aitoff = function() {
  anychart.core.map.projections.Aitoff.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Aitoff, anychart.core.map.projections.Base);


/** @inheritDoc */
anychart.core.map.projections.Aitoff.prototype.forward = function(x, y) {
  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var cosφ = Math.cos(y);
  var sinciα = this.sinci(this.acos(cosφ * Math.cos(x /= 2)));
  x = 2 * cosφ * Math.sin(x) * sinciα;
  y = Math.sin(y) * sinciα;

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Aitoff.prototype.invert = function(x, y) {
  var ε = 1e-6;
  if (x * x + 4 * y * y > Math.PI * Math.PI + ε) return null;
  var λ = x, φ = y, i = 25;
  var F = 0;
  do {
    var sinλ = Math.sin(λ);
    var sinλ_2 = Math.sin(λ / 2);
    var cosλ_2 = Math.cos(λ / 2);
    var sinφ = Math.sin(φ);
    var cosφ = Math.cos(φ);
    var sin_2φ = Math.sin(2 * φ);
    var sin2φ = sinφ * sinφ;
    var cos2φ = cosφ * cosφ;
    var sin2λ_2 = sinλ_2 * sinλ_2;
    var C = 1 - cos2φ * cosλ_2 * cosλ_2;
    var E = C ? this.acos(cosφ * cosλ_2) * Math.sqrt(F = 1 / C) : F = 0;
    var fx = 2 * E * cosφ * sinλ_2 - x;
    var fy = E * sinφ - y;
    var δxδλ = F * (cos2φ * sin2λ_2 + E * cosφ * cosλ_2 * sin2φ);
    var δxδφ = F * (.5 * sinλ * sin_2φ - E * 2 * sinφ * sinλ_2);
    var δyδλ = F * .25 * (sin_2φ * sinλ_2 - E * sinφ * cos2φ * sinλ);
    var δyδφ = F * (sin2φ * cosλ_2 + E * sin2λ_2 * cosφ);
    var denominator = δxδφ * δyδλ - δyδφ * δxδλ;
    if (!denominator) break;

    var δλ = (fy * δxδφ - fx * δyδφ) / denominator;
    var δφ = (fx * δyδλ - fy * δxδλ) / denominator;
    λ -= δλ;
    φ -= δφ;
  } while ((Math.abs(δλ) > ε || Math.abs(δφ) > ε) && --i > 0);
  x = λ;
  y = φ;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
