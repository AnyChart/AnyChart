var chart;

anychart.onDocumentReady(function() {
  chart = anychart.ui.scroller();
  chart.height(100);
  chart.padding(0, 10, 20, 30);
  chart.container('container').draw();
  var rect = chart.container().getStage().rect().stroke('green');
  rect.setBounds(chart.getRemainingBounds());
  chart.listen('signal', function() {
    rect.setBounds(chart.getRemainingBounds());
  });
});