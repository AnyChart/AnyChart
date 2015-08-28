var parser, map, map1, s1, s2, s3, s, axis, axis_lin, cs, cr, series, currentColorScale;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var min = 0, max = 350;

anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {id: "AU.CT", value: '15', title: "Australian Capital Territory"},
    {id: "AU.VI", value: 23, title: "Victoria"},
    {id: "AU.WA", value: -86, title: "Western Australia"},
    {id: "AU.QL", value: 90, title: "Queensland"},
    {id: "AU.NS", value: 32, title: "New South Wales"},
    {id: "AU.NT", value: 64, title: "Northern Territory"},
    {id: "AU.TS", value: 98, title: "Tasmania"},
    {id: "AU.SA", value: 45, title: "South Australian"}
  ]);

  var dataSetForSeries = dataSet.mapAs({id: "id"});

  map = anychart.map();
  map.geoData(anychart.maps.australia);
  map.colorRange(true);

  var currentColorScale = anychart.scales.ordinalColor();
  currentColorScale.ranges([
    {from: -100, to: 30},
    {from: 30, to: 65},
    {from: 65, to: 90}
  ]);

  map.choropleth(dataSetForSeries)
      .geoIdField("code_hasc")
      .colorScale(currentColorScale);
  map.container('container').draw();


  //var json = map.toJson();
  //map1 = anychart.fromJson(json);
  //map1.geoData(anychart.maps.australia);
  //map1.container("container").draw();

  currentColorScale.ranges([
    {from: -100, to: 0},
    {from: 0, to: 30},
    {from: 30, to: 65},
    {from: 65, to: 98}
  ]);

  //map.width(100);
  //map.height(100);
  //map.height(300);
  //map.width(400);
});
