goog.provide('anychart.utils.GeoJSONParser');
goog.require('anychart.core.map.geom');
//goog.require('goog.math.Coordinate');



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


/**
 * Export geo data to GeoJSON format.
 * @param {Object} gdom Geo data object.
 * @param {Object} tx Object with transformation for geo data.
 * @return {Object}
 */
anychart.utils.GeoJSONParser.prototype.exportToGeoJSON = function(gdom, tx) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//                                           Additional methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns transformed properties.
 * @param {Object} data Geo data.
 * @param {Array} properties Prop to replace.
 * @param {Object} dictionary Map for replace hc prop on ac prop.
 * @param {string} sortBy Field name for sort.
 * @return {Array.<Object>}
 */
anychart.utils.GeoJSONParser.prototype.getProperties = function(data, properties, dictionary, sortBy) {
  var i, len;

  var props = [];

  switch (data['type']) {
    case 'FeatureCollection':
      if (!data['features']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'FeatureCollection object missing \'features\' member.');
      } else {
        var features = data['features'];
        for (i = 0, len = features.length; i < len; i++) {
          var feature = features[i];
          props.push(this.getProps_(feature['properties'], properties, dictionary));
        }
      }
      break;

    case 'Feature':
      if (!(data['properties'] && data['geometry'])) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Feature object missing \'properties\' or \'geometry\' member.');
      } else {
        props.push(this.getProps_(data['properties'], properties, dictionary));
      }
      break;
  }

  var field = sortBy || 'name';
  goog.array.sort(props, function(a, b) {
    a = a[field];
    b = b[field];
    return a > b ? 1 : a < b ? -1 : 0;
  });
  return props;
};


/**
 * @param {Array} properties
 * @param {Array} props
 * @param {Object} dictionary
 * @return {Object}
 * @private
 */
anychart.utils.GeoJSONParser.prototype.getProps_ = function(properties, props, dictionary) {
  var result = {};
  for (var i = 0, len = props.length; i < len; i++) {
    var prop = props[i];
    var ac_name = dictionary[prop];
    result[ac_name] = properties[prop];
  }

  return result;
};


/**
 * @param {Object} data
 * @param {Object} txObj
 * @param {Array.<Object>} donor
 * @param {string} acFieldName
 * @param {string} hcFieldName
 * @return {Object}
 */
anychart.utils.GeoJSONParser.prototype.convert = function(data, txObj, donor, acFieldName, hcFieldName) {
  var i, len;
  this.txObj_ = txObj;

  switch (data['type']) {
    case 'FeatureCollection':
      if (!data['features']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'FeatureCollection object missing \'features\' member.');
      } else {
        var features = data['features'];
        for (i = 0, len = features.length; i < len; i++) {
          var feature = features[i];
          if (txObj)
            this.transformCoords_(feature['geometry']);
          this.transformProp_(feature['properties'], donor, acFieldName, hcFieldName);
        }
      }
      break;

    case 'GeometryCollection':
      if (!data['geometries']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geometries = data['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          if (txObj)
            this.transformCoords_(geometries[i]);
        }
      }
      break;

    case 'Feature':
      if (!(data['properties'] && data['geometry'])) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Feature object missing \'properties\' or \'geometry\' member.');
      } else {
        if (txObj)
          this.transformCoords_(data['geometry']);
        this.transformProp_(data['properties'], donor, acFieldName, hcFieldName);
      }
      break;

    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      if (data['coordinates']) {
        if (txObj)
          this.transformCoords_(data);
      } else {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object missing \'coordinates\' member.');
      }
      break;

    default:
      anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeoJSON object must be one of \'Point\',' +
          ' \'LineString\', \'Polygon\', \'MultiPolygon\', \'Feature\', \'FeatureCollection\' or \'GeometryCollection\'.');
  }

  return data;
};


/**
 * @param {Array.<number>} coord
 * @private
 */
anychart.utils.GeoJSONParser.prototype.transform_ = function(coord) {
  var x = coord[0];
  var y = coord[1];

  var projected = this.txObj_.crs ? window['proj4'](this.txObj_.crs).forward([x, y]) : [x, y];
  //var cosAngle = transform.cosAngle || (transform.rotation && Math.cos(transform.rotation));
  //var sinAngle = transform.sinAngle || (transform.rotation && Math.sin(transform.rotation));
  //
  //var rotated = transform.rotation ? [projected[0] * cosAngle + projected[1] * sinAngle, -projected[0] * sinAngle + projected[1] * cosAngle] : projected;
  //
  //x = ((rotated[0] - (transform.xoffset || 0)) * (transform.scale || 1) + (transform.xpan || 0)) * (transform.jsonres || 1) + (transform.jsonmarginX || 0);
  //y = (((transform.yoffset || 0) - rotated[1]) * (transform.scale || 1) + (transform.ypan || 0)) * (transform.jsonres || 1) - (transform.jsonmarginY || 0);

  x = projected[0] * this.txObj_.scale;
  y = projected[1] * this.txObj_.scale;

  if (this.txObj_.scale != 1) {
    x = Math.round(x);
    y = Math.round(y);
  }

  coord[0] = x;
  coord[1] = y;
};


/**
 * @param {Array} properties
 * @param {Array.<Object>} donor
 * @param {string} acFieldName
 * @param {string} hcFieldName
 * @private
 */
anychart.utils.GeoJSONParser.prototype.transformProp_ = function(properties, donor, acFieldName, hcFieldName) {
  if (!donor) return;

  var name = properties[acFieldName];

  for (var i = 0, len = donor.length; i < len; i++) {
    var donorName = donor[i][hcFieldName];

    if (name == donorName) {
      properties['middle-x'] = donor[i]['data-middle-x'];
      properties['middle-y'] = donor[i]['data-middle-y'];
      break;
    }
  }
};


/**
 * @param {Object} geosonGeometry
 * @return {null}
 * @private
 */
anychart.utils.GeoJSONParser.prototype.transformCoords_ = function(geosonGeometry) {
  var coord,
      polygon,
      i,
      j;

  var x, y;

  var geoCoords, len, len_;

  switch (geosonGeometry['type']) {
    case 'Point':
      x = geosonGeometry['coordinates'][0];
      y = geosonGeometry['coordinates'][1];
      this.transform_(geosonGeometry['coordinates']);
      break;

    case 'MultiPoint':
      geoCoords = geosonGeometry['coordinates'];
      for (i = 0, len = geoCoords.length; i < len; i++) {
        x = geoCoords[0];
        y = geoCoords[1];
        this.transform_(geoCoords);
      }
      break;

    case 'LineString':
      geoCoords = geosonGeometry['coordinates'];
      for (i = 0, len = geoCoords.length; i < len; i++) {
        coord = geoCoords[i];
        x = coord[0];
        y = coord[1];
        this.transform_(coord);
      }
      break;

    case 'MultiLineString':
      var strings = geosonGeometry['coordinates'];
      for (i = 0, len = strings.length; i < len; i++) {
        geoCoords = strings[i];
        for (j = 0, len_ = geoCoords.length; j < len_; j++) {
          coord = geoCoords[j];
          x = coord[0];
          y = coord[1];
          this.transform_(coord);
        }
      }
      break;

    case 'Polygon':
      polygon = geosonGeometry['coordinates'];
      for (i = 0, len = polygon.length; i < len; i++) {
        geoCoords = polygon[i];
        for (j = 0, len_ = geoCoords.length; j < len_; j++) {
          coord = geoCoords[j];
          x = coord[0];
          y = coord[1];
          this.transform_(coord);
        }
      }

      break;

    case 'MultiPolygon':
      var geoPolygons = geosonGeometry['coordinates'];
      for (i = 0, len = geoPolygons.length; i < len; i++) {
        polygon = geoPolygons[i];
        for (j = 0, len_ = polygon.length; j < len_; j++) {
          geoCoords = polygon[j];
          for (var k = 0, len__ = geoCoords.length; k < len__; k++) {
            coord = geoCoords[k];
            x = coord[0];
            y = coord[1];
            this.transform_(coord);
          }
        }
      }
      break;

    case 'GeometryCollection':
      if (!geosonGeometry['geometries']) {
        anychart.utils.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geometries = geosonGeometry['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          this.transformCoords_(geometries[i]);
        }
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
