var chart, series;

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
  var data = [
    {'id': 'FR.A', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.B', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.C', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.P', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.D', size: 10, 'labelrank': 10, 'value': 10},
    {'id': 'FR.E', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.F', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.G', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.H', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.I', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.GP', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.GF', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.Q', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.J', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.K', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.RE', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.L', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.M', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.MQ', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.YT', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.N', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.O', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.R', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.S', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.T', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.U', size: 10, 'labelrank': 10, 'value': 1},
    {'id': 'FR.V', size: 10, 'labelrank': 10, 'value': 1}
  ];
  //
  var data1 = [
    {'id': 'FR.Q', 'labelrank': 10, 'value': 1},
    {'id': 'FR.J', 'labelrank': 10, 'value': 1},
    {'id': 'FR.K', 'labelrank': 10, 'value': 1},
    {'id': 'FR.RE', 'labelrank': 10, 'value': 1},
    {'id': 'FR.L', 'labelrank': 10, 'value': 1},
    {'id': 'FR.M', 'labelrank': 10, 'value': 1},
    {'id': 'FR.MQ', 'labelrank': 10, 'value': 1},
    {'id': 'FR.YT', 'labelrank': 10, 'value': 1},
    {'id': 'FR.N', 'labelrank': 10, 'value': 1},
    {'id': 'FR.O', 'labelrank': 10, 'value': 1},
    {'id': 'FR.R', 'labelrank': 10, 'value': 1},
    {'id': 'FR.S', 'labelrank': 10, 'value': 1},
    {'id': 'FR.T', 'labelrank': 10, 'value': 1},
    {'id': 'FR.U', 'labelrank': 10, 'value': 1},
    {'id': 'FR.V', 'labelrank': 10, 'value': 1},

    {'id': 'FR.I', 'labelrank': 20, 'value': 1}
  ];

  var data2 = [
    {'id': 'FR.A', 'labelrank': 10, 'value': 1},
    {'id': 'FR.B', 'labelrank': 10, 'value': 1},
    {'id': 'FR.C', 'labelrank': 10, 'value': 1},
    {'id': 'FR.P', 'labelrank': 10, 'value': 1},
    {'id': 'FR.E', 'labelrank': 10, 'value': 1},
    {'id': 'FR.F', 'labelrank': 10, 'value': 1},
    {'id': 'FR.G', 'labelrank': 10, 'value': 1},
    {'id': 'FR.H', 'labelrank': 10, 'value': 1},
    {'id': 'FR.GP', 'labelrank': 10, 'value': 1},
    {'id': 'FR.GF', 'labelrank': 10, 'value': 1},

    {'id': 'FR.D', 'labelrank': 10, 'value': 1}
  ];

  chart = anychart.map();
  chart.geoData(anychart.maps.france);
  // generateData(chart);
  chart.interactivity().zoomOnMouseWheel(true);
  chart.overlapMode(false);

  // series = chart.choropleth(generateData(chart));
  // series.overlapMode(true);



  series1 = chart.choropleth(data1);
  series1.labels().enabled(true).padding(0);
  series1.tooltip(false);
  // series1.overlapMode(false);
  // series1.enabled(false);


  // series2 = chart.choropleth(data2);
  // series2.labels().enabled(true).padding(0);
  // series2.tooltip(false);
  // series2.overlapMode(false);


  // var series3 = chart.bubble([{lat: 49.745781, long: -1.922607, size: 15}]);
  // series3.labels().enabled(true).padding(0);
  //
  // chart.maxBubbleSize('5%');
  // chart.minBubbleSize('3%');




  // series.labels()
  //     .enabled(true)
  //     .padding(0);
  //     .textFormatter(function() {
  //       return 'labelrank: ' + this.getDataValue('labelrank');
  //     });
  //
  // series.tooltip()
  //     .textFormatter(function() {
  //       return 'labelrank: ' + this.getDataValue('labelrank');
  //     });
  // series.hoverLabels().fontColor('red');

  // series.selectLabels().fontSize(30);

  // series1 = chart.choropleth([
  //   {id: 'FR.J', value: 2, labelrank: 1},
  //   {id: 'FR.M', value: 2, labelrank: 3}
  // ]);
  // series1.labels(true);
  // series2 = chart.choropleth([
  //   {id: 'FR.G', value: 2, labelrank: 1}
  // ]);
  // series2.labels(true);

  chart.legend(true);

  chart.container('container').draw();
});
