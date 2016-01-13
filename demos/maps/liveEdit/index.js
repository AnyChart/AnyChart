var stage, map, chart, s1, s2, s3, s, axis, cs, cr, series;
var selectedRegions;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var crs = [
  {"value": "default", "text": "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=2.337229166666667 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs"},
  {"value": "reunion", "text": "+proj=utm +zone=40 +south +datum=WGS84 +units=m +no_defs"},
  {"value": "mayotte", "text": "+proj=utm +zone=38 +south +datum=WGS84 +units=m +no_defs"},
  {"value": "guyana", "text": "+proj=utm +zone=22 +datum=WGS84 +units=m +no_defs"},
  {"value": "martinique", "text": "+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs"},
  {"value": "guadeloupe", "text": "+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs"}
];

$(document).ready(function() {
  $(crs).each(function() {
    $('#select_crs').append($("<option>").attr('value', this.text).text(this.text));
  });

  $('body').append('<div id="tooltip"></div>');
  $('#tooltip')
      .css({
        'position': 'absolute',
        'z-index': 1000,
        'pointerEvents': 'none',
        'font-size': '14px'
      });







  stage = anychart.graphics.create('container');

  chart = anychart.map();
  chart.geoData(anychart.maps.australia);
  chart.interactivity().drag(false);

  var dataSet = anychart.data.set([]);

  var series = chart.choropleth(dataSet);
  series.labels().textFormatter(function() {
    return this.getDataValue('title');
  });
  series.tooltip(false);

  chart.container(stage).draw();

  var data = [];
  var features = chart.geoData()['features'];
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      var id = feature['properties'][chart.geoIdField()];
      data.push({'id': id, 'title': feature['properties']['code_hasc'], 'value': randomExt(100, 1000)});
    }
  }
  dataSet.data(data);






  chart.listen(anychart.enums.EventType.POINTS_SELECT, function(e) {
    selectedRegions = e.seriesStatus[0].points;
    var defaultCrs = chart.geoData()['ac-tx'] && chart.geoData()['ac-tx']['default'] && chart.geoData()['ac-tx']['default']['crs'] ?
        chart.geoData()['ac-tx']['default']['crs'] :
        anychart.charts.Map.DEFAULT_TX['default']['crs'];

    var defaultScale = chart.geoData()['ac-tx'] && chart.geoData()['ac-tx']['default'] && chart.geoData()['ac-tx']['default']['scale'] ?
    chart.geoData()['ac-tx']['default']['scale'] || anychart.charts.Map.DEFAULT_TX['default']['scale'] :
        anychart.charts.Map.DEFAULT_TX['default']['scale'];

    if (!selectedRegions.length) {
      $('#scale').val(defaultScale);
      $('#scaleInp').val(defaultScale);
      $('#select_crs').val(defaultCrs);
    } else {
      var scaleFactor = e.point.scaleFactor();
      var crs = e.point.crs();

      //console.log(e.point.getFeatureProp());

      $('#scale').val(scaleFactor);
      $('#scaleInp').val(scaleFactor);
      $('#select_crs').val(crs);
    }
  });

  chart.listen(anychart.enums.EventType.CHART_DRAW, function(e) {
    var iterator = series.data().getIterator();

    var startX, startY, drag;
    while (iterator.advance()) {
      var el = iterator.meta('regionShape');
      var prop = iterator.meta('regionProperties');

      el.drag(true).cursor('hand');

      el.listenOnce('start', function(e) {
        startX = e.clientX;
        startY = e.clientY;
      });

      el.listenOnce('end', function(e) {
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;

        chart.translateFeature(this[chart.geoIdField()], dx, dy);
      }, false, prop);
    }
  });

  $(document).mousemove(function(e) {
    var scaled = chart.scale().pxToScale(e.clientX, e.clientY);
    var latLon = chart.scale().inverseTransform(e.clientX, e.clientY);

    $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
        .show()
        .html(
          'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
          'Scaled: ' + scaled[0] + ' , ' + scaled[1] + '<br>' +
          'Lat: ' + latLon[1].toFixed(4) + ' , ' + 'Lon: ' + latLon[0].toFixed(4)
        );
  });

  $(document).mouseout(function(e) {
    $('#tooltip').html('').hide();
  });

  $('#select_crs').change(function(e) {
    var crs = $('#select_crs option:selected').text();
    var id = selectedRegions[0].properties[chart.geoIdField()];

    chart.featureCrs(id, crs);
  });

  $('#exportToGeoJSON').click(function(e) {
    console.log(JSON.stringify(chart.toGeoJSON()));
  });

  scale = function(value) {
    $('#scaleInp').val(value);

    chart.featureScaleFactor(selectedRegions[0].properties[chart.geoIdField()], value);
  };

  scaleEnd = function(value) {
    $('#scale').val(value);

    chart.featureScaleFactor(selectedRegions[0].properties[chart.geoIdField()], value);
  };

  scaleInp = function(value) {
    $('#scale').val(value);

    chart.featureScaleFactor(selectedRegions[0].properties[chart.geoIdField()], value);
  };
});
