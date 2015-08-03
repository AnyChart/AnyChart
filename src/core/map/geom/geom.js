goog.provide('anychart.core.map.geom');

/**
 * Namespace anychart.core.map.geom.
 * @namespace
 * @name anychart.core.map.geom
 */


/**
 Geo geometry "Point".
 @typedef {{
      coordinates: Array.<number>,
      properties: Object
    }}
 */
anychart.core.map.geom.Point;


/**
 Geo geometry "Line".
 @typedef {{
      paths: Array.<Array.<number>>,
      properties: Object
    }}
 */
anychart.core.map.geom.Line;


/**
 Geo geometry "Polygone".
 @typedef {{
      polygones: Array.<{
          outerPath: Array.<number>,
          holes: Array.<Array.<number>>
      }>,
      properties: Object
    }}
 */
anychart.core.map.geom.Polygon;


/**
 Geo geometry "Collection".
 @typedef {{
      geometries: Array.<
        anychart.core.map.geom.Point|
        anychart.core.map.geom.Line|
        anychart.core.map.geom.Polygon>,
      properties: Object
    }}
 */
anychart.core.map.geom.Collection;
