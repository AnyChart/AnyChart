anychart.onDocumentLoad(function() {
  var chart = anychart.bulletChart();

  chart.data([17, 12, 13, 14]);
  chart.range().from(0).to(10);
  chart.range(1).from(10).to(20);
  var customScale = anychart.scales.linear();
  customScale.minimum(10).maximum(15);
  chart.scale(customScale);
  chart.container('container').draw();

});