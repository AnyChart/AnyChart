anychart.onDocumentReady(function() {
  var chart = anychart.map();
  chart.geoData(geodata);
  chart.interactivity().mouseWheel(true);
  chart.container('container').draw();
});
