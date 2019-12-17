goog.provide('anychart.mapModule.utils.GeoJSONParser');
goog.require('anychart.core.reporting');
goog.require('anychart.mapModule.geom');
//goog.require('acgraph.math');



/**
 * Geo JSON parser class.
 * @constructor
 */
anychart.mapModule.utils.GeoJSONParser = function() {
};
goog.addSingletonGetter(anychart.mapModule.utils.GeoJSONParser);


/**
 * Returns parser type.
 * @return {anychart.enums.MapGeoDataTypes}
 */
anychart.mapModule.utils.GeoJSONParser.prototype.getType = function() {
  return anychart.enums.MapGeoDataTypes.GEO_JSON;
};


/**
 * Parse geo JSON data.
 * @param {Object} data GeoJSON data to parse.
 * @return {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} .
 */
anychart.mapModule.utils.GeoJSONParser.prototype.parse = function(data) {
  var i, len;
  var objects = [];

  switch (data['type']) {
    case 'FeatureCollection':
      if (!data['features']) {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'FeatureCollection object missing \'features\' member.');
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
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geometries = data['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          objects.push(this.parseGeometry_(geometries[i], geometries[i]['properties']));
        }
      }
      break;

    case 'Feature':
      if (!(data['properties'] && data['geometry'])) {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Feature object missing \'properties\' or \'geometry\' member.');
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
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object missing \'coordinates\' member.');
      }
      break;

    default:
      anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeoJSON object must be one of \'Point\',' +
          ' \'LineString\', \'Polygon\', \'MultiPolygon\', \'Feature\', \'FeatureCollection\' or \'GeometryCollection\'.');
  }

  return objects;
};


/**
 * @param {Object.<*>} geojsonGeometry .
 * @param {Object.<*>} properties .
 * @return {null|anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection}
 * @private
 */
anychart.mapModule.utils.GeoJSONParser.prototype.parseGeometry_ = function(geojsonGeometry, properties) {
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

    var middleX = /** @type {number} */(geoMiddleX || .5);
    var middleY = /** @type {number} */(geoMiddleY || .5);

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
          if (!i) {
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
            if (!j) {
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
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geoms = [];
        var geometries = geojsonGeometry['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          obj = this.parseGeometry_(geometries[i], geometries[i]['properties']);
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
      anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object must be one of ' +
          '\'Point\', \'LineString\', \'Polygon\' or \'MultiPolygon\'.');
      return null;
      break;
  }
  return null;
};


/**
 * Export geo data to GeoJSON format.
 * @param {Object} gdom Geo data object.
 * @param {Object} tx Object with transformation for geo data.
 * @return {Object}
 */
anychart.mapModule.utils.GeoJSONParser.prototype.exportToGeoJSON = function(gdom, tx) {
  var geojson = {
    'type': 'FeatureCollection',
    'crs': gdom['crs'] || {
      'type': 'name',
      'properties': {
        'name': tx['default']['src-code']
      }
    },
    'features': []
  };
  geojson['ac-tx'] = {};
  goog.object.forEach(tx, function(value, key) {
    var tx_ = {};

    if (goog.isDef(value.crs)) tx_['crs'] = value.crs;
    if (goog.isDef(value.scale)) tx_['scale'] = value.scale;
    if (goog.isDef(value.xoffset)) tx_['xoffset'] = value.xoffset;
    if (goog.isDef(value.yoffset)) tx_['yoffset'] = value.yoffset;
    if (goog.isDef(value.heatZone)) tx_['heatZone'] = value.heatZone.serialize();

    geojson['ac-tx'][key] = tx_;
  });

  var features = geojson['features'];

  for (var i = 0; i < gdom.length; i++) {
    var region = gdom[i];
    var feature = {
      'type': 'Feature',
      'properties': region['properties'],
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': []
      }
    };

    for (var j = 0; j < region['polygones'].length; j++) {
      var coords = [];
      var polygon = region['polygones'][j];

      for (var k = 0; k < polygon['outerPath'].length - 1; k += 2) {
        coords.push([polygon['outerPath'][k], polygon['outerPath'][k + 1]]);
      }
      feature['geometry']['coordinates'].push([coords]);
    }

    features.push(feature);
  }

  return geojson;
};
