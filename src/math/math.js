goog.provide('anychart.math');



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
 * Tries to normalize anychart.math.Coordinate to acgraph.math.Coordinate.
 * @param {anychart.math.Coordinate} value anychart.math.Coordinate to normalize.
 * @return {acgraph.math.Coordinate} Normalized to acgraph.math.Coordinate value.
 */
anychart.math.normalizeCoordinate = function(value) {
  if (value instanceof acgraph.math.Coordinate) {
    return /** @type {acgraph.math.Coordinate} */(value);
  } else {
    if (goog.isArray(value)) {
      return new acgraph.math.Coordinate(value[0], value[1]);
    } else if (goog.isObject(value)) {
      return new acgraph.math.Coordinate(value['x'], value['y']);
    }
  }
  return new acgraph.math.Coordinate(0, 0);
};


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
