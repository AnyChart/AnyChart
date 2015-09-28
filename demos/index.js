var chart;

anychart.onDocumentReady(function() {
  chart = anychart.line([1, 3, 2]);
  chart.container('container').draw();
});


    