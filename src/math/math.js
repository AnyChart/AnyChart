goog.provide('anychart.math');
goog.provide('anychart.math.Coordinate');



/**
 @namespace
 @name anychart.math
 */


/**
 * @includeDoc
 * @typedef {{
     x: (string|number),
     y: (string|number)
  }}
 */
anychart.math.CoordinateObject;


/**
 * Identifies an x-y coordinate pair.
 * @includeDoc
 * @typedef {!(
 *  Array.<number, number> |
 *  {x: number, y:number} |
 *  anychart.math.CoordinateObject |
 *  acgraph.math.Coordinate
 * )} anychart.math.Coordinate
 */
anychart.math.Coordinate;


/**
 * Rounds a given number to a certain number of decimal places.
 * @param {number} num The number to be rounded.
 * @param {number=} opt_digitsCount Optional The number of places after the decimal point.
 * @return {number} The rounded number.
 */
anychart.math.round = function(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp || 0;
};


/**
 * Safe log of a value.
 * @param {number} val .
 * @return {number} .
 */
anychart.math.log = function(val) {
  if (val > 1e-7)
    return Math.log(val);
  return Math.log(1e-7);
};
