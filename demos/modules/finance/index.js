var chart;
anychart.onDocumentReady(function() {
  chart = anychart.financial();
  var scale = anychart.scales.dateTime();
  chart.xScale(scale);
  chart.barsP
  chart.candlestick([
    {x: new Date(1095048000), open: 1.916, high: 3, low: 1, close: 2.217},
    {x: new Date(1095048001), open: 2.916, high: 4, low: 1.5, close: 1.917}
  ]);
  chart.container('container').draw();
});
