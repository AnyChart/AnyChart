var chart;
anychart.onDocumentReady(function() {
  chart = anychart.pie();
  chart.data([20, 22.5, 11, 4, 6, 7, 3, 5, 9, 10]);
  chart.container('container').draw();
  chart.width(500);
});
