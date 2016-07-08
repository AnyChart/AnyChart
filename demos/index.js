anychart.onDocumentReady(function() {
  // chart type
  chart = anychart.pie([1, 2, 3]);
  chart.fill('AQUASTYLE');
  //chart.innerRadius(20)

  chart.container('container');
  chart.draw();
});
