anychart.onDocumentReady(function() {
  chart = anychart.line();
  chart.spline([1, 3, 2]);
  chart.legend(true);
  chart.container('container').draw();
});
