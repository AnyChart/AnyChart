var stage, map, chart, s1, s2, s3, s, axis, cs, cr;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;
var series, series2;
var showPreload = true;


var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var generateData = function(map, opt_min, opt_max) {
  var auChoroplethData = [];
  features = map.geoData()['features'];
  var min = opt_min !== void 0 ? opt_min : 1900;
  var max = opt_max !== void 0 ? opt_max : 2000;
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      id = feature['properties'][map.geoIdField()];
      auChoroplethData.push({'id': id, 'value': randomExt(min, max), 'size': randomExt(0, 10)});
    }
  }
  return auChoroplethData;
};

var drilldown = function(e) {
  var pointId = e.point.get('id');
  chart.zoomToFeature(pointId);
};

$(document).ready(function() {
  stage = anychart.graphics.create('container');

  chart = anychart.map();
  chart.geoData(anychart.maps.world_source);
  var series = chart.choropleth(generateData(chart));
  series.labels().enabled(true).textFormatter('{%id}');
  chart.container(stage).draw();

  chart.listen('pointClick', drilldown);
});
