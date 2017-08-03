goog.provide('anychart.mapModule.geom');

/**
 * Namespace anychart.mapModule.geom.
 * @namespace
 * @name anychart.mapModule.geom
 */


/**
 Geo geometry "Point".
 @typedef {{
      coordinates: Array.<number>,
      properties: Object
    }}
 */
anychart.mapModule.geom.Point;


/**
 Geo geometry "Line".
 @typedef {{
      paths: Array.<Array.<number>>,
      properties: Object
    }}
 */
anychart.mapModule.geom.Line;


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
anychart.mapModule.geom.Polygon;


/**
 Geo geometry "Collection".
 @typedef {{
      geometries: Array.<
        anychart.mapModule.geom.Point|
        anychart.mapModule.geom.Line|
        anychart.mapModule.geom.Polygon>,
      properties: Object
    }}
 */
anychart.mapModule.geom.Collection;
