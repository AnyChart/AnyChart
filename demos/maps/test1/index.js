var parser, map, map1, s1, s2, s3, s, axis, axis_lin, cs, cr, series, currentColorScale;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var min = 0, max = 350;

anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {id: "AU.CT", value: 15, title: "Australian Capital Territory"},
    {id: "AU.VI", value: 23, title: "Victoria"},
    {id: "AU.WA", value: 86, title: "Western Australia"},
    {id: "AU.QL", value: 16, title: "Queensland"},
    {id: "AU.NS", value: 32, title: "New South Wales"},
    {id: "AU.NT", value: 64, title: "Northern Territory"},
    {id: "AU.TS", value: 28, title: "Tasmania"},
    {id: "AU.SA", value: 45, title: "South Australian"}
  ]);

  var dataSetForSeries = dataSet.mapAs({id: "id"});

  map = anychart.map();
  map.geoData(anychart.maps.australia);

  //var currentColorScale = anychart.scales.linearColor("#E0F7FA", "#0097A7");
  var currentColorScale = anychart.scales.linearColor("#E0F7FA", "#0097A7");
  //currentColorScale = anychart.scales.Color();
  //currentColorScale.colors();
  //currentColorScale.ranges([
  //  {less: 20},
  //  {from: 20, to: 30},
  //  {from: 30, to: 40},
  //  {from: 40, to: 50},
  //  {from: 50, to: 60},
  //  {from: 60, to: 70},
  //  {greater: 70}
  //]);

  series = map.choropleth(dataSetForSeries);
  series.geoIdField("code_hasc");
  series.colorScale(currentColorScale);

  // Sets settings for the color range.
  map.colorRange({orientation: "left"});
  //australiaMap.colorRange().orientation('left');
  map.container("container").draw();

  var json = map.toJson();
  //
  map1 = anychart.fromJson(json);
  map1.geoData(anychart.maps.australia);
  map1.container("container").draw();
});
