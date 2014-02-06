goog.provide('anychart.math');
goog.provide('anychart.math.Coordinate');


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
 *  Array.<number|string> |
 *  anychart.math.CoordinateObject |
 *  acgraph.math.Coordinate
 * )}
 */
anychart.math.Coordinate;
