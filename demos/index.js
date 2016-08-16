anychart.onDocumentReady(function() {
  chart = anychart.cartesian();
  chart.title(null);
  chart.line([1, 4, 5, 7, 2]);
  chart.xAxis(1).title(null);
  chart.yAxis(1).title(null);
  chart.yAxis().title(null).orientation('right');
  chart.xAxis().title(null).orientation('top');
  chart.container('container').draw();
});
