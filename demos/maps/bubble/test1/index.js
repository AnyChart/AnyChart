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

  var dataForSeries1 = dataSet.mapAs({id: "id"});

  var dataForSeries = [
    {id: "AU.NS", size: 4, 'middle-x': 0.9, 'middle-y': 0.2},
    ["AU.TS", 34],
    [324, -374, 10],
    {id: "AU.SA", lat: NaN, long: NaN, size: 4},
    {id: "AU.WA", lat: NaN, long: NaN, size: 25},
    ["AU.VI", 50]
  ];

  map = anychart.choropleth(dataForSeries1);
  map.geoData(anychart.maps.australia);

  var currentColorScale = anychart.scales.ordinalColor();
  currentColorScale.ranges([
    {from: -100, to: 30},
    {from: 30, to: 65},
    {from: 65, to: 90}
  ]);

  //var series1 = map.choropleth(dataForSeries1);
  //series1
  //    .geoIdField("code_hasc")
  //    .colorScale(currentColorScale);

  map
      .geoIdField("code_hasc");

  map.getSeries(0)
      .colorScale(currentColorScale);

  series = map.bubble(dataForSeries);
  series
      .labels(true)
      .markers(true)
      .geoIdField("code_hasc");

  //series.tooltip().textFormatter(function() {console.log(this.getDataValue('id'))});

  map.container('container').draw();

  //map.listen('pointshover', function(e) {console.log(e.seriesStatus)})

});
