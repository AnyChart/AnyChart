goog.provide('anychart.core.map.projections.Base');



/**
 * AnyChart map projection class.
 * @constructor
 */
anychart.core.map.projections.Base = function() {

};


/**
 * Sinci.
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.sinci = function(x) {
  return x ? x / Math.sin(x) : 1;
};


/**
 * Sgn.
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.sgn = function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.asin = function(x) {
  return x > 1 ? Math.PI / 2 : x < -1 ? -Math.PI / 2 : Math.asin(x);
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.acos = function(x) {
  return x > 1 ? 0 : x < -1 ? Math.PI : Math.acos(x);
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.asqrt = function(x) {
  return x > 0 ? Math.sqrt(x) : 0;
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.sinh = function(x) {
  return .5 * (Math.exp(x) - Math.exp(-x));
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.cosh = function(x) {
  return .5 * (Math.exp(x) + Math.exp(-x));
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.arsinh = function(x) {
  return Math.log(x + this.asqrt(x * x + 1));
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.core.map.projections.Base.prototype.arcosh = function(x) {
  return Math.log(x + this.asqrt(x * x - 1));
};


/**
 * Convert latitude and longitude coordinates into coordinates in radians in accordance with this projection.
 * @param {number} x
 * @param {number} y
 * @return {Array.<number>}
 */
anychart.core.map.projections.Base.prototype.forward = function(x, y) {
  return [x, y];
};


/**
 * Convert coordinates in radians into coordinates in degrees (lat/lon) in accordance with this projection.
 * @param {number} x
 * @param {number} y
 * @return {Array.<number>}
 */
anychart.core.map.projections.Base.prototype.invert = function(x, y) {
  return [x, y];
};
