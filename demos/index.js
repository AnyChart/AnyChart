var chart, series, zoom;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var generateData = function(map, opt_min, opt_max) {
  var data = [];

  features = map.geoData()['features'];
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

anychart.onDocumentReady(function() {
  chart = anychart.map();
  chart.crs(anychart.enums.MapProjections.AUGUST);
  chart.geoData('anychart.maps.world_source');
  // chart.geoData('anychart.maps.world');
  // chart.geoData('anychart.maps.france');
  chart.interactivity()
      .zoomOnMouseWheel(true)
      .keyboardZoomAndMove(true)
      .zoomOnDoubleClick(true);


  chart.axes(true);
  chart.grids(true);

  var choropleth = chart.choropleth(generateData(chart));
  choropleth.labels(true);

  chart.container('container').draw();

  // chart.listen('chartdraw', function() {
  //   var json = chart.toJson();
  //   chart.dispose();
  //   chart2 = anychart.fromJson(json);
  //   chart2.overlapMode(true);
  //   chart2.container('container').draw();
  // });
});