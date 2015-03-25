var chart, dataSet, axis1;
anychart.onDocumentReady(function() {
  chart = anychart.circularGauge();
  chart.data([7.5, 5, 6 ,7]);

  chart.needle();
  chart.marker();
  //chart.knob();
  chart.bar();


  var firstAxis = chart.axis();
  firstAxis.fill('#4DB6AC');

  var secondAxis = chart.axis(1);
  secondAxis.radius('50%');
  secondAxis.fill('#FF8A65');

  chart.range().from(0).to(2.2).axisIndex(1);

  //chart.axis(0, false);

  chart.container('container');
  chart.draw();
});