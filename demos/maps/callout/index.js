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
      // if (id == 'FR.D')
      //   feature['properties']['overlapMode'] = true;
      var data = {'id': id, 'value': randomExt(min, max), 'labelrank': 1};
      // if (id == 'FR.M')
      //   data['label'] = false;

      auChoroplethData.push(data);
    }
  }

  return auChoroplethData;
};

anychart.onDocumentReady(function() {
  chart = anychart.map();
  chart.geoData('anychart.maps.france');
  chart.legend(true);

  // chart.interactivity().zoomOnMouseWheel(true);
  // chart.overlapMode(true);

  // callout = chart.callout(0);
  // callout.items(['FR.M', 'FR.I', 'FR.V', 'FR.Q', 'sdf', 'sdf', 'FR.E']);
  // // callout.items(['FR.M']);
  // callout.align('center');
  // callout.orientation('left');
  //
  // // callout.margin('5%');
  // // callout.padding('5%');
  //
  // callout.background()
  //     .enabled(true)
  //     .fill('green .2');
  // callout.title()
  //     .enabled(true)
  //     .text('callout ёпть!!!')
  //     .orientation('left')
  //     .rotation(0)
  //     .padding(20);
  // callout.labels()
  //     .enabled(true)
  //     .textFormatter('{%name}');
  //
  //
  // callout2 = chart.callout(1);
  // callout2.items(['FR.M', 'FR.I', 'FR.V']);
  // callout2.align('right');
  // callout2.orientation('top');
  // callout2.length(500);
  // callout2.width(100);
  // callout2.title()
  //     .enabled(true)
  //     .orientation('bottom')
  //     .text('callout ёпть!!!');
  // callout2.labels()
  //     .enabled(true);
  //
  // callout3 = chart.callout(2);
  // callout3.items(['FR.M', 'FR.I', 'FR.V']);
  // callout3.align('center');
  // callout3.orientation('right');
  // callout3.title()
  //     .enabled(true)
  //     .text('callout ёпть!!!');
  // callout3.labels()
  //     .enabled(true);
  //
  // callout4 = chart.callout(3);
  // callout4.items(['FR.M', 'FR.I', 'FR.V']);
  // callout4.align('center');
  // callout4.orientation('bottom');
  // callout4.title()
  //     .enabled(true)
  //     .text('callout ёпть!!!');
  // callout4.labels()
  //     .enabled(true);

  // callout.length(300);
  // callout.width(10);

  // chart.colorRange().enabled(true);

  series = chart.choropleth(generateData(chart));
  // series.labels().enabled(true).textFormatter('{%id}');

  chart.container('container').draw();

  // chart1 = anychart.fromJson(chart.toJson()).container('container').draw();
});
