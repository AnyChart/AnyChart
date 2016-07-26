var chart, series;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};


var generateData = function(map, opt_min, opt_max) {
  var data = [];

  var geoData = map.geoData();
  features = geoData.type == 'Topology' ? geoData['objects']['features']['geometries'] : geoData['features'];
  var min = opt_min !== void 0 ? opt_min : 1900;
  var max = opt_max !== void 0 ? opt_max : 2000;
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      id = feature['properties'][map.geoIdField()];
      data.push({'id': id, 'value': randomExt(min, max), 'labelrank': 1});
    }
  }

  return data;
};


$(document).ready(function() {
  chart = anychart.map();
  chart.geoData('anychart.maps.australia');
  chart.interactivity().zoomOnMouseWheel(true);
  chart.overlapMode(false);

  series = chart.choropleth(generateData(chart));
  series.labels(true);

  chart.container('container').draw();
});
