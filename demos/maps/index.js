var chart, series, zoom;

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
      if (id == 'FR.D')
        feature['properties']['overlapMode'] = true;

      auChoroplethData.push({'id': id, 'value': randomExt(min, max), 'labelrank': 1});
    }
  }

  return auChoroplethData;
};

anychart.onDocumentReady(function() {
  chart = anychart.map();
  chart.geoData(anychart.maps.france);

  chart.interactivity().zoomOnMouseWheel(true);
  chart.overlapMode(false);

  series = chart.choropleth(generateData(chart));
  series.labels().enabled(true).padding(0);
  series.tooltip(false);

  chart.container('container').draw();

  zoom = anychart.ui.zoom();
  zoom.render(chart);
});
