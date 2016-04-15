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

  // var projected = this.txObj_.crs ? window['proj4'](this.txObj_.crs).forward([x, y]) : [x, y];

  //var cosAngle = transform.cosAngle || (transform.rotation && Math.cos(transform.rotation));
  //var sinAngle = transform.sinAngle || (transform.rotation && Math.sin(transform.rotation));
  //
  //var rotated = transform.rotation ? [projected[0] * cosAngle + projected[1] * sinAngle, -projected[0] * sinAngle + projected[1] * cosAngle] : projected;
  //
  //x = ((rotated[0] - (transform.xoffset || 0)) * (transform.scale || 1) + (transform.xpan || 0)) * (transform.jsonres || 1) + (transform.jsonmarginX || 0);
  //y = (((transform.yoffset || 0) - rotated[1]) * (transform.scale || 1) + (transform.ypan || 0)) * (transform.jsonres || 1) - (transform.jsonmarginY || 0);

  // x = projected[0] * this.txObj_.scale;
  // y = projected[1] * this.txObj_.scale;

  // if (this.txObj_.scale != 1) {
  //   x = Math.round(x);
  //   y = Math.round(y);
  // }

  var ε = 1e-6, ε2 = ε * ε, τ = 2 * Math.PI, τε = τ - ε;
  var d3_radians = Math.PI / 180, d3_degrees = 180 / Math.PI;
  var sqrtπ = Math.sqrt(Math.PI), radians = Math.PI / 180, degrees = 180 / Math.PI;

  function sinci(x) {
    return x ? x / Math.sin(x) : 1;
  }

  function sgn(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }

  function asin(x) {
    return x > 1 ? Math.PI / 2 : x < -1 ? -Math.PI / 2 : Math.asin(x);
  }

  function acos(x) {
    return x > 1 ? 0 : x < -1 ? Math.PI : Math.acos(x);
  }

  function asqrt(x) {
    return x > 0 ? Math.sqrt(x) : 0;
  }

  function sinh(x) {
    return .5 * (Math.exp(x) - Math.exp(-x));
  }

  function cosh(x) {
    return .5 * (Math.exp(x) + Math.exp(-x));
  }

  function arsinh(x) {
    return Math.log(x + asqrt(x * x + 1));
  }

  function arcosh(x) {
    return Math.log(x + asqrt(x * x - 1));
  }

  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(λ, φ) {
      var cosλ = Math.cos(λ);
      var cosφ = Math.cos(φ);
      var k = scale(cosλ * cosφ);
      return [k * cosφ * Math.sin(λ), k * Math.sin(φ)];
    }
    azimuthal.invert = function(x, y) {
      var ρ = Math.sqrt(x * x + y * y);
      var c = angle(ρ);
      var sinc = Math.sin(c), cosc = Math.cos(c);
      return [Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ)];
    };
    return azimuthal;
  }

  x = x * d3_radians;
  y = y * d3_radians;

  x = x > Math.PI ? x - τ : x < -Math.PI ? x + τ : x;
  y = y;

  //--------------------------------------------------------------------------------

  //bonne

  // var parallel = 45;
  // var φ0 = parallel * Math.PI / 180;
  // var cotφ0 = 1 / Math.tan(φ0);
  //
  // var ρ = cotφ0 + φ0 - y;
  // var E = ρ ? x * Math.cos(y) / ρ : ρ;
  // x = ρ * Math.sin(E);
  // y = cotφ0 - ρ * Math.cos(E);

  //---------invert

  // var ρ = Math.sqrt(x * x + (y = cotφ0 - y) * y);
  // var φ = cotφ0 + φ0 - ρ;
  // x = ρ / Math.cos(φ) * Math.atan2(x, y);
  // y = φ;

  //--------------------------------------------------------------------------------

  //eckert1

  // var α = Math.sqrt(8 / (3 * Math.PI));
  // x = α * x * (1 - Math.abs(y) / Math.PI);
  // y = α * y;

  //---------invert

  // var α = Math.sqrt(8 / (3 * Math.PI));
  // var φ = y / α;
  // x = x / (α * (1 - Math.abs(φ) / Math.PI));
  // y = φ;

  //--------------------------------------------------------------------------------

  //eckert3

  // var k = Math.sqrt(Math.PI * (4 + Math.PI));
  // x = 2 / k * x * (1 + Math.sqrt(1 - 4 * y * y / (Math.PI * Math.PI)));
  // y = 4 / k * y;

  //---------invert

  // var k = Math.sqrt(Math.PI * (4 + Math.PI)) / 2;
  // x = x * k / (1 + asqrt(1 - y * y * (4 + Math.PI) / (4 * Math.PI)));
  // y = y * k / 2;

  //--------------------------------------------------------------------------------

  //August

  // var tan = Math.tan(y / 2);
  // var k = asqrt(1 - tan * tan);
  // var c = 1 + k * Math.cos(x /= 2);
  // var x_ = Math.sin(x) * k / c;
  // var y_ = tan / c;
  // var x2 = x_ * x_;
  // var y2 = y_ * y_;
  //
  // x = 4 / 3 * x_ * (3 + x2 - 3 * y2);
  // y = 4 / 3 * y_ * (3 + 3 * x2 - y2);

  //---------invert

  // x *= 3 / 8;
  // y *= 3 / 8;
  // if (!x && Math.abs(y) > 1) return null;
  // var x2 = x * x;
  // var y2 = y * y;
  // var s = 1 + x2 + y2;
  // var sin3η = Math.sqrt(.5 * (s - Math.sqrt(s * s - 4 * y * y)));
  // var η = asin(sin3η) / 3;
  // var ξ = sin3η ? arcosh(Math.abs(y / sin3η)) / 3 : arsinh(Math.abs(x)) / 3;
  // var cosη = Math.cos(η);
  // var coshξ = cosh(ξ);
  // var d = coshξ * coshξ - cosη * cosη;
  // x = sgn(x) * 2 * Math.atan2(sinh(ξ) * cosη, .25 - d);
  // y = sgn(y) * 2 * Math.atan2(coshξ * Math.sin(η), .25 + d);

  //--------------------------------------------------------------------------------

  //Equirectangular

  // x = x;
  // y = y;

  //--------------------------------------------------------------------------------

  //Fahey

  // var faheyK = Math.cos(35 * d3_radians);
  //
  // var t = Math.tan(y / 2);
  // x = x * faheyK * asqrt(1 - t * t);
  // y = (1 + faheyK) * t;

  //---------invert

  // var t = y / (1 + faheyK);
  // x = x ? x / (faheyK * asqrt(1 - t * t)) : 0;
  // y =  2 * Math.atan(t);

  //--------------------------------------------------------------------------------

  //hammer

  // var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
  //   return Math.sqrt(2 / (1 + cosλcosφ));
  // }, function(ρ) {
  //   return 2 * Math.asin(ρ / 2);
  // });

  // var B = 2;
  // var A = 2;
  //
  // var coordinates = d3_geo_azimuthalEqualArea(x / B, y);
  // coordinates[0] *= A;
  //
  // x = coordinates[0];
  // y = coordinates[1];

  //---------invert

  // var coordinates = d3_geo_azimuthalEqualArea.invert(x / A, y);
  // coordinates[0] *= B;
  //
  // x = coordinates[0];
  // y = coordinates[1];

  //--------------------------------------------------------------------------------

  //Aitoff

  // var cosφ = Math.cos(y);
  // var sinciα = sinci(acos(cosφ * Math.cos(x /= 2)));
  // x = 2 * cosφ * Math.sin(x) * sinciα;
  // y = Math.sin(y) * sinciα;

  //---------invert

  // if (x * x + 4 * y * y > Math.PI * Math.PI + ε) return;
  // var λ = x, φ = y, i = 25;
  // do {
  //   var sinλ = Math.sin(λ);
  //   var sinλ_2 = Math.sin(λ / 2);
  //   var cosλ_2 = Math.cos(λ / 2);
  //   var sinφ = Math.sin(φ);
  //   var cosφ = Math.cos(φ);
  //   var sin_2φ = Math.sin(2 * φ);
  //   var sin2φ = sinφ * sinφ;
  //   var cos2φ = cosφ * cosφ;
  //   var sin2λ_2 = sinλ_2 * sinλ_2;
  //   var C = 1 - cos2φ * cosλ_2 * cosλ_2;
  //   var E = C ? acos(cosφ * cosλ_2) * Math.sqrt(F = 1 / C) : F = 0;
  //   var F;
  //   var fx = 2 * E * cosφ * sinλ_2 - x;
  //   var fy = E * sinφ - y;
  //   var δxδλ = F * (cos2φ * sin2λ_2 + E * cosφ * cosλ_2 * sin2φ);
  //   var δxδφ = F * (.5 * sinλ * sin_2φ - E * 2 * sinφ * sinλ_2);
  //   var δyδλ = F * .25 * (sin_2φ * sinλ_2 - E * sinφ * cos2φ * sinλ);
  //   var δyδφ = F * (sin2φ * cosλ_2 + E * sin2λ_2 * cosφ);
  //   var denominator = δxδφ * δyδλ - δyδφ * δxδλ;
  //   if (!denominator) break;
  //
  //   var δλ = (fy * δxδφ - fx * δyδφ) / denominator;
  //   var δφ = (fx * δyδλ - fy * δxδλ) / denominator;
  //   λ -= δλ;
  //   φ -= δφ;
  // } while ((Math.abs(δλ) > ε || Math.abs(δφ) > ε) && --i > 0);
  // x = λ;
  // y = φ;

  //--------------------------------------------------------------------------------

  //mercator

  // x = x;
  // y = Math.log(Math.tan(Math.PI / 4 + y / 2));

  //---------invert (bad)

  // x = x;
  // y = 2 * Math.atan(Math.exp(y)) - Math.PI / 2;

  //--------------------------------------------------------------------------------

  //orthographic

  // var d3_geo_orthographic = d3_geo_azimuthal(function() {
  //   return 1;
  // }, Math.asin);
  //
  // var coords = d3_geo_orthographic(x, y);
  // x = coords[0];
  // y = coords[1];

  //---------invert (bad)

  // var coords = d3_geo_orthographic.invert(x, y);
  // x = coords[0];
  // y = coords[1];

  //--------------------------------------------------------------------------------

  //robinson

  // var robinsonConstants = [[.9986, -.062], [1, 0], [.9986, .062], [.9954, .124], [.99, .186], [.9822, .248], [.973, .31], [.96, .372], [.9427, .434], [.9216, .4958], [.8962, .5571], [.8679, .6176], [.835, .6769], [.7986, .7346], [.7597, .7903], [.7186, .8435], [.6732, .8936], [.6213, .9394], [.5722, .9761], [.5322, 1]];
  //
  // var i = Math.min(18, Math.abs(y) * 36 / Math.PI);
  // var i0 = Math.floor(i);
  // var di = i - i0;
  // var ax = (k = robinsonConstants[i0])[0];
  // var ay = k[1];
  // var bx = (k = robinsonConstants[++i0])[0];
  // var by = k[1];
  // var cx = (k = robinsonConstants[Math.min(19, ++i0)])[0];
  // var cy = k[1];
  // var k;
  // x = x * (bx + di * (cx - ax) / 2 + di * di * (cx - 2 * bx + ax) / 2);
  // y = (y > 0 ? Math.PI / 2 : -Math.PI / 2) * (by + di * (cy - ay) / 2 + di * di * (cy - 2 * by + ay) / 2);

  //---------invert

  // var yy = y / Math.PI / 2;
  // var φ = yy * 90;
  // var i = Math.min(18, Math.abs(φ / 5));
  // var i0 = Math.max(0, Math.floor(i));
  // do {
  //   var ay = robinsonConstants[i0][1];
  //   var by = robinsonConstants[i0 + 1][1];
  //   var cy = robinsonConstants[Math.min(19, i0 + 2)][1];
  //   var u = cy - ay;
  //   var v = cy - 2 * by + ay;
  //   var t = 2 * (Math.abs(yy) - by) / u;
  //   var c = v / u;
  //   var di = t * (1 - c * t * (1 - 2 * c * t));
  //   if (di >= 0 || i0 === 1) {
  //     φ = (y >= 0 ? 5 : -5) * (di + i);
  //     var j = 50, δ;
  //     do {
  //       i = Math.min(18, Math.abs(φ) / 5);
  //       i0 = Math.floor(i);
  //       di = i - i0;
  //       ay = robinsonConstants[i0][1];
  //       by = robinsonConstants[i0 + 1][1];
  //       cy = robinsonConstants[Math.min(19, i0 + 2)][1];
  //       φ -= (δ = (y >= 0 ? Math.PI / 2 : -Math.PI / 2) * (by + di * (cy - ay) / 2 + di * di * (cy - 2 * by + ay) / 2) - y) * degrees;
  //     } while (Math.abs(δ) > ε2 && --j > 0);
  //     break;
  //   }
  // } while (--i0 >= 0);
  // var ax = robinsonConstants[i0][0];
  // var bx = robinsonConstants[i0 + 1][0];
  // var cx = robinsonConstants[Math.min(19, i0 + 2)][0];
  // x = x / (bx + di * (cx - ax) / 2 + di * di * (cx - 2 * bx + ax) / 2);
  // y = φ * radians;

  //--------------------------------------------------------------------------------

  //wagner6

  // x = x * Math.sqrt(1 - 3 * y * y / (Math.PI * Math.PI));
  // y = y;

  //---------invert

  // x = x / Math.sqrt(1 - 3 * y * y / (Math.PI * Math.PI));
  // y = y;


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
