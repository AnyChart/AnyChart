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
  dataSet = anychart.data.set([
    {"id": "67482", "title": "Strasbourg", "value": 928},
    {"id": "33063", "title": "Bordeaux", "value": 192},
    {"id": "63113", "title": "Clermont-Ferrand", "value": 963},
    {"id": "14118", "title": "Caen", "value": 266},
    {"id": "21231", "title": "Dijon", "value": 518},
    {"id": "35238", "title": "Rennes", "value": 324},
    {"id": "45234", "title": "OrlГ©ans", "value": 767},
    {"id": "51108", "title": "ChГўlons-en-Champagne", "value": 478},
    {"id": "2A004", "title": "Ajaccio", "value": 456},
    {"id": "25056", "title": "BesanГ§on", "value": 477},
    {"id": "97105", "title": "Basse-Terre", "value": 200},
    {"id": "97302", "title": "Cayenne", "value": 945},
    {"id": "76540", "title": "Rouen", "value": 669},
    {"id": "75056", "title": "Paris", "value": 153},
    {"id": "34172", "title": "Montpellier", "value": 548},
    {"id": "97411", "title": "Saint-Denis", "value": 184},
    {"id": "87085", "title": "Limoges", "value": 796},
    {"id": "57463", "title": "Metz", "value": 929},
    {"id": "97209", "title": "Fort-de-France", "value": 216},
    {"id": "97608", "title": "Dzaoudzi", "value": 466},
    {"id": "31555", "title": "Toulouse", "value": 212},
    {"id": "59350", "title": "Lille", "value": 762},
    {"id": "44109", "title": "Nantes", "value": 772},
    {"id": "80021", "title": "Amiens", "value": 908},
    {"id": "86194", "title": "Poitiers", "value": 413},
    {"id": "13055", "title": "Marseille", "value": 627},
    {"id": "69123", "title": "Lyon", "value": 676}
  ]);
  chart = anychart.map();
  chart.geoData('anychart.maps.france');
  chart.geoIdField("insee_cl");
  chart.interactivity()
      .zoomOnMouseWheel(true)
      .keyboardZoomAndMove(true)
      .zoomOnDoubleClick(true);
  chart.choropleth(dataSet).labels(true);
  chart.overlapMode(false);
  chart.container('container').draw();

  chart.listen('chartdraw',function(){
    var json = chart.toJson();
    chart.dispose();
    chart2 = anychart.fromJson(json);
    chart2.overlapMode(true);
    chart2.container('container').draw();
  });
});
