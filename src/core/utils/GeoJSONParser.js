goog.provide('anychart.utils.GeoJSONParser');
goog.require('anychart.core.map.geom');



/**
 * Geo JSON parser class.
 * @constructor
 */
anychart.utils.GeoJSONParser = function() {
};
goog.addSingletonGetter(anychart.utils.GeoJSONParser);


/**
 * Parse geo JSON data.
 * @param {Object} data GeoJSON data to parse.
 * @return {!Array.<anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection>} .
 */
anychart.utils.GeoJSONParser.prototype.parse = function(data) {
  var i, len;
  var objects = [];

  switch (data['type']) {
    case 'FeatureCollection':
      if (!data['features']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'FeatureCollection object missing \'features\' member.');
      } else {
        var features = data['features'];
        for (i = 0, len = features.length; i < len; i++) {
          var feature = features[i];
          objects.push(this.parseGeometry_(feature['geometry'], feature['properties']));
        }
      }
      break;

    case 'GeometryCollection':
      if (!data['geometries']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geometries = data['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          objects.push(this.parseGeometry_(geometries[i], null));
        }
      }
      break;

    case 'Feature':
      if (!(data['properties'] && data['geometry'])) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Feature object missing \'properties\' or \'geometry\' member.');
      } else {
        objects.push(this.parseGeometry_(data['geometry'], data['properties']));
      }
      break;

    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      if (data['coordinates']) {
        objects.push(this.parseGeometry_(data, null));
      } else {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object missing \'coordinates\' member.');
      }
      break;

    default:
      anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeoJSON object must be one of \'Point\',' +
          ' \'LineString\', \'Polygon\', \'MultiPolygon\', \'Feature\', \'FeatureCollection\' or \'GeometryCollection\'.');
  }

  return objects;
};


/**
 * @param {Object.<*>} geojsonGeometry .
 * @param {Object.<*>} properties .
 * @return {null|anychart.core.map.geom.Point|anychart.core.map.geom.Line|anychart.core.map.geom.Polygon|anychart.core.map.geom.Collection}
 * @private
 */
anychart.utils.GeoJSONParser.prototype.parseGeometry_ = function(geojsonGeometry, properties) {
  var coord,
      path,
      polygon,
      polygons,
      i,
      j,
      obj,
      outerPath,
      holes,
      hole;

  var geoCoords, len, len_;

  if (properties && !(properties['middle-x'] || properties['middle-y'])) {
    var geoMiddleX = goog.object.findValue(properties, function(value, key) {
      return (/middle-x/).test(key);
    });
    var geoMiddleY = goog.object.findValue(properties, function(value, key) {
      return (/middle-y/).test(key);
    });

    var middleX = /** @type {number}*/(geoMiddleX || .5);
    var middleY = /** @type {number}*/(geoMiddleY || .5);

    properties['middle-x'] = middleX;
    properties['middle-y'] = middleY;
  }

  switch (geojsonGeometry['type']) {
    case 'Point':
      return {
        'coordinates': [geojsonGeometry['coordinates'][0], geojsonGeometry['coordinates'][1]],
        'properties': properties
      };
      break;

    case 'MultiPoint':
      var coordinates = [];
      geoCoords = geojsonGeometry['coordinates'];
      for (i = 0, len = geoCoords.length; i < len; i++) {
        coordinates.push(geoCoords[0], geoCoords[1]);
      }
      return {'coordinates': coordinates, 'properties': properties};
      break;

    case 'LineString':
      path = [];
      geoCoords = geojsonGeometry['coordinates'];
      for (i = 0, len = geoCoords.length; i < len; i++) {
        coord = geoCoords[i];
        path.push(coord[0], coord[1]);
      }
      return {'paths': [path], 'properties': properties};
      break;

    case 'MultiLineString':
      var paths = [];
      var strings = geojsonGeometry['coordinates'];
      for (i = 0, len = strings.length; i < len; i++) {
        path = [];
        geoCoords = strings[i];
        for (j = 0, len_ = geoCoords.length; j < len_; j++) {
          coord = geoCoords[j];
          path.push(coord[0], coord[1]);
        }
        paths.push(path);
      }
      return {'paths': paths, 'properties': properties};
      break;

    case 'Polygon':
      outerPath = [];
      holes = [];
      polygon = geojsonGeometry['coordinates'];
      for (i = 0, len = polygon.length; i < len; i++) {
        if (i != 0) hole = [];
        geoCoords = polygon[i];
        for (j = 0, len_ = geoCoords.length; j < len_; j++) {
          coord = geoCoords[j];
          if (i == 0) {
            outerPath.push(coord[0], coord[1]);
          } else {
            hole.push(coord[0], coord[1]);
          }
        }
        if (hole) holes.push(hole);
      }

      return {'polygones': [{'outerPath': outerPath, 'holes': holes}], 'properties': properties};
      break;

    case 'MultiPolygon':
      polygons = [];
      var geoPolygons = geojsonGeometry['coordinates'];
      for (i = 0, len = geoPolygons.length; i < len; i++) {
        outerPath = [];
        holes = [];
        polygon = geoPolygons[i];
        for (j = 0, len_ = polygon.length; j < len_; j++) {
          if (j != 0) hole = [];
          geoCoords = polygon[j];
          for (var k = 0, len__ = geoCoords.length; k < len__; k++) {
            coord = geoCoords[k];
            if (j == 0) {
              outerPath.push(coord[0], coord[1]);
            } else {
              hole.push(coord[0], coord[1]);
            }
          }
          if (hole) holes.push(hole);
        }
        polygon = {'outerPath': outerPath, 'holes': holes};
        polygons.push(polygon);
      }
      return {'polygones': polygons, 'properties': properties};
      break;

    case 'GeometryCollection':
      if (!geojsonGeometry['geometries']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geoms = [];
        var geometries = geojsonGeometry['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          obj = this.parseGeometry_(geometries[i], null);
          if (goog.isDef(obj)) {
            geoms.push(obj);
          } else {
            break;
          }
        }
        return {'geometries': geoms, 'properties': properties || null};
      }
      break;

    default:
      anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object must be one of ' +
          '\'Point\', \'LineString\', \'Polygon\' or \'MultiPolygon\'.');
      return null;
      break;
  }
  return null;
};
