var chart;
anychart.onDocumentReady(function() {
  chart = anychart.pie([1, 2, 3, 4, 5]);
  chart.container('container').draw();
});
