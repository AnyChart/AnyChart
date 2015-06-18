var chart;
anychart.onDocumentReady(function() {
  anychart.licenseKey('test-key-32db1f79-cc9312c4');
  chart = anychart.area([10, 14, 13, 12, 10], [12, 10, 14, 13, 12], [15, 12, 10, 14, 13]);
  //chart.credits(false);
  chart.animation(10000);
  chart.container('container');
  chart.draw();
});
