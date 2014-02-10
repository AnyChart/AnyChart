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
