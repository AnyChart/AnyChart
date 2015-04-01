var chart;
anychart.onDocumentReady(function() {
  chart = anychart.line();
  chart.spline([1, 3, 2]);
  chart.container('container').draw();
});
