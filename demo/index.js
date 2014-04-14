anychart.onDocumentReady(function() {
  var chart = new anychart.cartesian.Chart();
  chart.container('container');
  chart.line([
    [Date.UTC(2010, 01, 01), 10],
    [Date.UTC(2010, 02, 01), 40],
    [Date.UTC(2010, 03, 01), 20],
    [Date.UTC(2010, 04, 01), 60],
    [Date.UTC(2010, 05, 01), 20],
    [Date.UTC(2010, 06, 01), 30],
    [Date.UTC(2010, 07, 01), 70],
    [Date.UTC(2010, 07, 30), 40]
  ]);
  chart.xScale(new anychart.scales.DateTime());
  var xAxis = chart.xAxis();
  xAxis.labels().offsetY(10);
  xAxis.minorLabels().enabled(true);
  chart.yAxis();
  chart.draw();
});

