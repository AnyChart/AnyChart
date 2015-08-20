var chart;
anychart.onDocumentReady(function() {
  var chart = anychart.radar();
  chart.line([6,4,3,6, 'miss']).connectMissingPoints(true).markers(true).labels(true);
  chart.container('container').draw();
});