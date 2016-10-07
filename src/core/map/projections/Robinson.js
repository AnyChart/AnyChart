goog.provide('anychart.core.map.projections.Robinson');
goog.require('anychart.core.map.projections.Base');



/**
 * AnyChart Map class.
 * @extends {anychart.core.map.projections.Base}
 * @constructor
 */
anychart.core.map.projections.Robinson = function() {
  anychart.core.map.projections.Robinson.base(this, 'constructor');
};
goog.inherits(anychart.core.map.projections.Robinson, anychart.core.map.projections.Base);


/**
 * Robinson projection constants.
 * @type {Array.<Array.<number>>}
 */
anychart.core.map.projections.Robinson.CONSTANTS = [[.9986, -.062], [1, 0], [.9986, .062], [.9954, .124], [.99, .186], [.9822, .248], [.973, .31], [.96, .372], [.9427, .434], [.9216, .4958], [.8962, .5571], [.8679, .6176], [.835, .6769], [.7986, .7346], [.7597, .7903], [.7186, .8435], [.6732, .8936], [.6213, .9394], [.5722, .9761], [.5322, 1]];


/** @inheritDoc */
anychart.core.map.projections.Robinson.prototype.forward = function(x, y) {
  if (isNaN(x) || isNaN(y)) return [NaN, NaN];

  x = goog.math.toRadians(x);
  y = goog.math.toRadians(y);

  var robinsonConstants = anychart.core.map.projections.Robinson.CONSTANTS;
  var k;
  var i = Math.min(18, Math.abs(y) * 36 / Math.PI);
  var i0 = Math.floor(i);
  var di = i - i0;
  var ax = (k = robinsonConstants[i0])[0];
  var ay = k[1];
  var bx = (k = robinsonConstants[++i0])[0];
  var by = k[1];
  var cx = (k = robinsonConstants[Math.min(19, ++i0)])[0];
  var cy = k[1];

  x = x * (bx + di * (cx - ax) / 2 + di * di * (cx - 2 * bx + ax) / 2);
  y = (y > 0 ? Math.PI / 2 : -Math.PI / 2) * (by + di * (cy - ay) / 2 + di * di * (cy - 2 * by + ay) / 2);

  return [x, y];
};


/** @inheritDoc */
anychart.core.map.projections.Robinson.prototype.invert = function(x, y) {
  if (isNaN(x) || isNaN(y)) return [NaN, NaN];

  var robinsonConstants = anychart.core.map.projections.Robinson.CONSTANTS;
  var eps = 1e-6, eps2 = eps * eps;

  var yy = y / Math.PI / 2;
  var phi = yy * 90;
  var i = Math.min(18, Math.abs(phi / 5));
  var i0 = Math.max(0, Math.floor(i));
  do {
    var ay = robinsonConstants[i0][1];
    var by = robinsonConstants[i0 + 1][1];
    var cy = robinsonConstants[Math.min(19, i0 + 2)][1];
    var u = cy - ay;
    var v = cy - 2 * by + ay;
    var t = 2 * (Math.abs(yy) - by) / u;
    var c = v / u;
    var di = t * (1 - c * t * (1 - 2 * c * t));
    if (di >= 0 || i0 === 1) {
      phi = (y >= 0 ? 5 : -5) * (di + i);
      var j = 50, delta;
      do {
        i = Math.min(18, Math.abs(phi) / 5);
        i0 = Math.floor(i);
        di = i - i0;
        ay = robinsonConstants[i0][1];
        by = robinsonConstants[i0 + 1][1];
        cy = robinsonConstants[Math.min(19, i0 + 2)][1];
        phi -= goog.math.toDegrees(delta = (y >= 0 ? Math.PI / 2 : -Math.PI / 2) * (by + di * (cy - ay) / 2 + di * di * (cy - 2 * by + ay) / 2) - y);
      } while (Math.abs(delta) > eps2 && --j > 0);
      break;
    }
  } while (--i0 >= 0);
  var ax = robinsonConstants[i0][0];
  var bx = robinsonConstants[i0 + 1][0];
  var cx = robinsonConstants[Math.min(19, i0 + 2)][0];
  x = x / (bx + di * (cx - ax) / 2 + di * di * (cx - 2 * bx + ax) / 2);
  y = goog.math.toRadians(phi);

  return [goog.math.toDegrees(x), goog.math.toDegrees(y)];
};
