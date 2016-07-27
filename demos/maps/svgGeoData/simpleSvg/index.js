anychart.onDocumentReady(function() {
  chart = anychart.map();
  chart.geoData('<path d="M 0 0 L 72.5 0 72.5 17 0 17 0 0 Z" fill="red"/>');
  chart.unboundRegions({fill: 'green'});
  chart.container('container').draw();
});
