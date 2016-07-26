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

  chart.interactivity().zoomOnMouseWheel(true);
  // chart.overlapMode(true);

  callout = chart.callout(0);
  callout.items(['FR.M', 'FR.I', 'FR.V', 'FR.Q', 'sdf', 'sdf', 'FR.E']);
  // callout.items(['FR.M']);
  callout.align('center');
  callout.orientation('left');
  // callout.width(500);

  callout.margin('2%');
  callout.padding('2%');

  callout.background()
      .enabled(true)
      .fill('green .2');
  callout.title()
      .enabled(true)
      .text('callout ёпть!!!')
      .orientation('left')
      .rotation(0)
      .padding(20);
  callout.labels()
      .textFormatter('{%name}');


  callout2 = chart.callout(1);
  callout2.items(['FR.M', 'FR.I', 'FR.V']);
  callout2.align('right');
  callout2.orientation('top');
  callout2.length(500);
  callout2.width(100);
  callout2.title()
      .enabled(true)
      .orientation('bottom')
      .text('callout ёпть!!!');


  callout3 = chart.callout(2);
  callout3.items(['FR.M', 'FR.I', 'FR.V']);
  callout3.align('center');
  callout3.orientation('right');
  callout3.title()
      .enabled(true)
      .text('callout ёпть!!!');
  callout3.labels()
      .connectorStroke('black');


  callout4 = chart.callout(3);
  callout4.items(['FR.RE', 'FR.YT', 'FR.GF', 'FR.MQ', 'FR.GP']);
  callout4.align('right');
  callout4.orientation('bottom');
  callout4.length(500);
  callout4.title()
      .enabled(true)
      .padding(0, 10, 0, 10)
      .orientation('right')
      .rotation(0)
      .height(null)
      .width(200)
      .textWrap('byLatter')
      .text('А эти острова вообще не тут находятся на самом деле!\nА один из них вообще не остров!');
  callout4.labels()
      .textFormatter('{%name}')
      .connectorStroke('black');

  chart.colorRange().enabled(true);

  series = chart.choropleth(generateData(chart));
  series.labels().enabled(false).textFormatter('{%id}');

  chart.container('container').draw();

  // chart1 = anychart.fromJson(chart.toJson()).container('container').draw();
});
