var chart, chart1;
anychart.onDocumentLoad(function() {
  var chart = anychart.sparkline([15.5, -10.4, 25, -19, 15]);
  chart.bounds(0, 0, 800, 103);
  chart.type('area');
  chart.rangeMarker().from(0).to(1);
  //chart.lineMarker().value(0).stroke('4 red');
  chart.container('container').draw();
});