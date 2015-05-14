var chart, dataSet, axis1;
anychart.onDocumentReady(function() {
  chart = anychart.circularGauge();
  chart.data([0, 7, 15 ,20]);
  //chart.padding(50);

  //chart.needle()
  //    .startRadius(0)
  //    .middleWidth(0)
  //    .startWidth(0);

  //chart.marker();
  //var knob = chart.knob();
  //knob
  //    .bottomRadius(80)
  //    .topRadius(40)
      //.verticesCount(10)
      //.verticesCurvature(.001)
      //.bottomRatio(1)
      //.topRatio(0.6);
  //chart.bar();


  var firstAxis = chart.axis();
  firstAxis.fill('#4DB6AC');


  chart.axis()
      .startAngle(90)
      .scale()
      .minimum(0)
      .maximum(20);

  chart.knob()
      .bottomRatio(1)
      .topRatio(4.1)//Я знаю что ratio не может быть больше 1
      //.stroke('blue .6', 2, '6', acgraph.vector.StrokeLineJoin.ROUND, acgraph.vector.StrokeLineCap.ROUND);
  chart.title('bottomRatio(1)\ntopRatio(4.1)');
  chart.bounds('50%','50%','50%', '50%');


  //
  //var secondAxis = chart.axis(1);
  //secondAxis.radius('50%');
  //secondAxis.fill('#FF8A65');
  //
  //chart.range().from(0).to(2.2).axisIndex(1);

  //var sweep = 270;
  //chart.startAngle(-180 + (360 - sweep) / 2).sweepAngle(sweep).encloseWithStraightLine(true);
  //chart.startAngle(70).sweepAngle(sweep).encloseWithStraightLine(true);

  chart.container('container');
  chart.draw();
});