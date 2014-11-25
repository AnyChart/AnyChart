var chart;
anychart.onDocumentReady(function() {
  chart = anychart.area();
  var scale = anychart.scales.dateTime();
  chart.xScale(scale);
  chart.area([
    {x: new Date(1095048000), y: 1.916},
    {x: new Date(1095048001), y: 2.916}
  ]);
  chart.container('container').draw();
});
