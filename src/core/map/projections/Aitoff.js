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

  var cosphi = Math.cos(y);
  var sincialpha = this.sinci(this.acos(cosphi * Math.cos(x /= 2)));
  x = 2 * cosphi * Math.sin(x) * sincialpha;
  y = Math.sin(y) * sincialpha;

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Aitoff.prototype.invert = function(x, y) {
  var epsilon = 1e-6;
  if (x * x + 4 * y * y > Math.PI * Math.PI + epsilon) return [NaN, NaN];
  var lambda = x, phi = y, i = 25;
  var F = 0;
  do {
    var sinlambda = Math.sin(lambda);
    var sinlambda_2 = Math.sin(lambda / 2);
    var coslambda_2 = Math.cos(lambda / 2);
    var sinphi = Math.sin(phi);
    var cosphi = Math.cos(phi);
    var sin_2phi = Math.sin(2 * phi);
    var sin2phi = sinphi * sinphi;
    var cos2phi = cosphi * cosphi;
    var sin2lambda_2 = sinlambda_2 * sinlambda_2;
    var C = 1 - cos2phi * coslambda_2 * coslambda_2;
    var E = C ? this.acos(cosphi * coslambda_2) * Math.sqrt(F = 1 / C) : F = 0;
    var fx = 2 * E * cosphi * sinlambda_2 - x;
    var fy = E * sinphi - y;
    var deltaxdeltalambda = F * (cos2phi * sin2lambda_2 + E * cosphi * coslambda_2 * sin2phi);
    var deltaxdeltaphi = F * (.5 * sinlambda * sin_2phi - E * 2 * sinphi * sinlambda_2);
    var deltaydeltalambda = F * .25 * (sin_2phi * sinlambda_2 - E * sinphi * cos2phi * sinlambda);
    var deltaydeltaphi = F * (sin2phi * coslambda_2 + E * sin2lambda_2 * cosphi);
    var denominator = deltaxdeltaphi * deltaydeltalambda - deltaydeltaphi * deltaxdeltalambda;
    if (!denominator) break;

    var deltalambda = (fy * deltaxdeltaphi - fx * deltaydeltaphi) / denominator;
    var deltaphi = (fx * deltaydeltalambda - fy * deltaxdeltalambda) / denominator;
    lambda -= deltalambda;
    phi -= deltaphi;
  } while ((Math.abs(deltalambda) > epsilon || Math.abs(deltaphi) > epsilon) && --i > 0);
  x = lambda;
  y = phi;

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
