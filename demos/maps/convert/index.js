var parser, map, transform, transform_, scale;
var scale_min_x;
var scale_max_x;
var scale_min_y;
var scale_max_y;
var geoData, properties, dictionary, sortBy, props, acGeoDataFromQGIS, transformedGeoData;

anychart.onDocumentReady(function() {
  parser = anychart.core.utils.GeoJSONParser.getInstance();
  map = anychart.map();

  //World map
  if (anychart.maps.world && Highcharts.maps["custom/world"]) {
    geoData = Highcharts.maps["custom/world"];
    properties = ['hc-a2', 'iso_a2', 'hc-middle-x', 'hc-middle-y'];
    dictionary = {
      'hc-a2': 'iso-a2',
      'iso_a2': 'name',
      'hc-middle-x': 'data-middle-x',
      'hc-middle-y': 'data-middle-y'
    };
    sortBy = 'name';
    props = parser.getProperties(geoData, properties, dictionary, sortBy);
    console.log(props);

    //transform = {
    //  "crs": "+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs",
    //  "crs-name": "World_Miller_Cylindrical",
    //  "src-code": "urn:ogc:def:crs:EPSG:54003",
    //  "scale": 1.71716888719e-05
    //};
    acGeoDataFromQGIS = anychart.maps.world;
    transformedGeoData = parser.convert(acGeoDataFromQGIS, null, props, 'iso_a2', 'iso-a2');
    console.log(JSON.stringify(transformedGeoData));

    map.geoData(transformedGeoData);
  }
  //
  ////Usa map mainland
  //if (anychart.maps.usaMainland && Highcharts.maps["countries/us/custom/us-all-mainland"]) {
  //  geoData = Highcharts.maps["countries/us/custom/us-all-mainland"];
  //  properties = ['woe-id', 'hc-a2', 'hc-middle-x', 'hc-middle-y'];
  //  dictionary = {
  //    'woe-id': 'woe-id',
  //    'hc-a2': 'name',
  //    'hc-middle-x': 'data-middle-x',
  //    'hc-middle-y': 'data-middle-y'
  //  };
  //  sortBy = 'woe-id';
  //  props = parser.getProperties(geoData, properties, dictionary, sortBy);
  //
  //  transform = {
  //    "crs": "+proj=lcc +lat_1=33 +lat_2=45 +lat_0=39 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs",
  //    "crs-name": "USA_Contiguous_Lambert_Conformal_Conic",
  //    "src-code": "urn:ogc:def:crs:EPSG:102004",
  //    "scale": 0.000151481324748
  //  };
  //  acGeoDataFromQGIS = anychart.maps.usaMainland;
  //
  //  transformedGeoData = parser.convert(acGeoDataFromQGIS, transform, props, 'woe_id', 'woe-id');
  //
  //  console.log(JSON.stringify(transformedGeoData));
  //
  //  map.geoData(transformedGeoData);
  //}

  //Australia map mainland
  if (anychart.maps.australia && Highcharts.maps["countries/au/au-all"]) {
    //geoData = Highcharts.maps["countries/au/au-all"];
    //properties = ['woe-id', 'hc-middle-x', 'hc-middle-y'];
    //dictionary = {
    //  'woe-id': 'woe-id',
    //  'hc-middle-x': 'data-middle-x',
    //  'hc-middle-y': 'data-middle-y'
    //};
    //sortBy = 'woe-id';
    //props = parser.getProperties(geoData, properties, dictionary, sortBy);
    //
    //transform_ = {
    //  "crs": "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    //  "src-name": "GDA94 / Geoscience Australia Lambert",
    //  "src-code": "urn:ogc:def:crs:EPSG:3112",
    //  "scale": 1
    //};
    //acGeoDataFromQGIS = anychart.maps.australia;
    //
    //transformedGeoData = parser.convert(acGeoDataFromQGIS, transform_, props, 'woe_id', 'woe-id');
    //
    //map.geoData(transformedGeoData);
    //map.container('container').draw();
    //
    //
    //
    //scale_min_x = Math.abs(9999 / map.scale().minimumX());
    //scale_max_x = Math.abs(9999 / map.scale().maximumX());
    //scale_min_y = Math.abs(9999 / map.scale().minimumY());
    //scale_max_y = Math.abs(9999 / map.scale().maximumY());
    //
    //scale = Math.min(scale_min_x, scale_max_x, scale_min_y, scale_max_y);
    //
    //
    //
    //transform = {
    //  "src-name": "GDA94 / Geoscience Australia Lambert",
    //  "src-code": "urn:ogc:def:crs:EPSG:3112",
    //  "scale": scale
    //};
    //acGeoDataFromQGIS = anychart.maps.australia;
    //
    //transformedGeoData = parser.convert(acGeoDataFromQGIS, transform);
    //transformedGeoData['crs'] = {"type": "name", "properties": {"name": transform['src-code']}};
    //transformedGeoData['ac-tx'] = {"default": transform};
    //transformedGeoData['ac-tx']["default"]['crs'] = transform_['crs'];
    //
    //console.log(JSON.stringify(transformedGeoData));
    //
    //map.geoData(transformedGeoData);



    //geoData = Highcharts.maps["countries/au/au-all"];
    //properties = ['woe-id', 'hc-middle-x', 'hc-middle-y'];
    //dictionary = {
    //  'woe-id': 'woe-id',
    //  'hc-middle-x': 'data-middle-x',
    //  'hc-middle-y': 'data-middle-y'
    //};
    //sortBy = 'woe-id';
    //props = parser.getProperties(geoData, properties, dictionary, sortBy);
    //
    //transform = {
    //  "crs": "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    //  "src-name": "GDA94 / Geoscience Australia Lambert",
    //  "src-code": "urn:ogc:def:crs:EPSG:3112",
    //  "scale": 0.000158093982027
    //};
    //acGeoDataFromQGIS = anychart.maps.australia;
    //
    //transformedGeoData = parser.convert(acGeoDataFromQGIS, transform, props, 'woe_id', 'woe-id');
    //
    //console.log(JSON.stringify(transformedGeoData));
    //
    //map.geoData(transformedGeoData);
  }

   //France map mainland
  if (anychart.maps.france) {
    //geoData = Highcharts.maps["countries/au/au-all"];
    //properties = ['woe-id', 'hc-middle-x', 'hc-middle-y'];
    //dictionary = {
    //  'woe-id': 'woe-id',
    //  'hc-middle-x': 'data-middle-x',
    //  'hc-middle-y': 'data-middle-y'
    //};
    //sortBy = 'woe-id';
    //props = parser.getProperties(geoData, properties, dictionary, sortBy);

    //transform_ = {
    //  "crs": "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=2.337229166666667 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs",
    //  "src-name": "ED50 / France EuroLambert",
    //  "src-code": "urn:ogc:def:crs:EPSG:2192",
    //  "scale": 1
    //};
    //acGeoDataFromQGIS = anychart.maps.france;
    //
    //transformedGeoData = parser.convert(acGeoDataFromQGIS, transform_);
    //transformedGeoData['crs'] = {"type": "name", "properties": {"name": transform['src-code']}};
    //transformedGeoData['ac-tx'] = {"default": transform};

    //console.log(JSON.stringify(transformedGeoData));

    //map.geoData(transformedGeoData);
    //
    //map.container('container').draw();
    //
    ////console.log(
    ////    'min-x: ' + map.scale().minimumX() +
    ////    ' max-x: ' + map.scale().maximumX() +
    ////    ' min-y: ' + map.scale().minimumY() +
    ////    ' max-y: ' + map.scale().maximumY()
    ////);
    //
    //var scale_min_x = Math.abs(9999 / map.scale().minimumX());
    //var scale_max_x = Math.abs(9999 / map.scale().maximumX());
    //var scale_min_y = Math.abs(9999 / map.scale().minimumY());
    //var scale_max_y = Math.abs(9999 / map.scale().maximumY());
    //
    //console.log(scale_min_x, scale_max_x, scale_min_y, scale_max_y);
    //
    //scale = Math.min(scale_min_x, scale_max_x, scale_min_y, scale_max_y);
    //
    //transform = {
    //  "crs": "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=2.337229166666667 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs",
    //  "src-name": "ED50 / France EuroLambert",
    //  "src-code": "urn:ogc:def:crs:EPSG:2192",
    //  "scale": scale
    //};
    //acGeoDataFromQGIS = anychart.maps.france;
    //
    //transformedGeoData = parser.convert(acGeoDataFromQGIS, transform);
    //transformedGeoData['crs'] = {"type": "name", "properties": {"name": transform['src-code']}};
    //transformedGeoData['ac-tx'] = {"default": transform};
    //transformedGeoData['ac-tx']["default"]['crs'] = transform_['crs'];
    //
    //console.log(JSON.stringify(transformedGeoData));
    //
    //map.geoData(transformedGeoData);

    //console.log(
    //    'min-x: ' + map.scale().minimumX() +
    //    ' max-x: ' + map.scale().maximumX() +
    //    ' min-y: ' + map.scale().minimumY() +
    //    ' max-y: ' + map.scale().maximumY()
    //);
  }

});
