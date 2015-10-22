var parser, map, chart, s1, s2, s3, s, axis, axis_lin, cs, cr, series, currentColorScale;

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
    {id: "AU.SA", value: 45, title: "South Australian"}]);

  var dataSetForSeries = dataSet.mapAs({id: "id"});

  chart = anychart.map();
  chart.geoData(anychart.maps.australia);

  var currentColorScale = anychart.scales.linearColor("orange", "yellow");

  var series = chart.choropleth(dataSetForSeries);
  series
      .labels(false)
      .geoIdField("code_hasc")
      .colorScale(currentColorScale);

  chart.colorRange(true);
  chart.colorRange().marker().type("diamond");


  series.tooltip().textFormatter(function() {
    var count = this.getStat('pointsCount');
    console.log(count);
    return count  ;
  });

  chart.container('container').draw();

  //chart.listen('pointsselect', function(e) {console.log(e.currentPoint, e.seriesStatus);});
  //chart.listen('pointshover', function(e) {console.log(e.currentPoint, e.seriesStatus);});
});
