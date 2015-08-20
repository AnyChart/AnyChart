var chart;
anychart.onDocumentReady(function() {
  var stage = acgraph.create('container', 300, 500);

  chart = anychart.cartesian();

  chart.line();
  chart.spline();
  chart.stepLine();

  chart.area();
  chart.splineArea();
  chart.stepArea();
  chart.rangeArea();
  chart.rangeStepArea();
  chart.rangeSplineArea();

  chart.bar();
  chart.rangeBar();

  chart.column();
  chart.rangeColumn();

  chart.candlestick();
  chart.ohlc();

  chart.container(stage).draw();

  stage.resume();
});