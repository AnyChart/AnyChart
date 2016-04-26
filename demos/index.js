anychart.onDocumentReady(function() {
  chart = anychart.column();
  chart.column([1, 5, 10, 14, 6]);
  chart.column([3, 6, 12, 6, 11]);
  chart.container('container');
  chart.draw();
});
    