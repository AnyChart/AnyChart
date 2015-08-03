anychart.onDocumentReady(function() {
  var stage = acgraph.create('container', 500, 500);
  stage.suspend();

  var dataSet = anychart.data.set([1,5,15,20]);
  var chart1 = anychart.circularGauge();
  chart1.data(dataSet);
  chart1.axis()
      .scale()
      .minimum(0)
      .maximum(20);
  chart1.axis()
      .startAngle(90)
      .sweepAngle(90)
      .radius('70');
  chart1.title().enabled(true).text("startAngle(90) sweepAngle(90)\n radius('70')");
  chart1.bounds(0,0,'50%', '50%');
  chart1.container(stage).draw();

  var chart2 = anychart.circularGauge();
  chart2.data(dataSet);
  chart2.axis()
      .scale()
      .minimum(0)
      .maximum(20);
  chart2.axis()
      .startAngle(45)
      .sweepAngle(330)
      .radius(50);
  chart2.title().enabled(true).text('startAngle(45) sweepAngle(330)\nradius(50)');
  chart2.bounds('50%',0,'50%', '50%');
  chart2.container(stage).draw();

  var chart3 = anychart.circularGauge();
  chart3.data(dataSet);
  chart3.axis()
      .scale()
      .minimum(0)
      .maximum(20);
  chart3.axis()
      .startAngle(0)
      .sweepAngle(30)
      .radius(92);
  chart3.title().enabled(true).text('startAngle(0) sweepAngle(30)\nradius(92)');
  chart3.bounds(0,'50%','50%', '50%');
  chart3.container(stage).draw();

  var chart4 = anychart.circularGauge();
  chart4.data(dataSet);
  chart4.axis()
      .scale()
      .minimum(0)
      .maximum(20);
  chart4.axis()
      .startAngle(-45)
      .sweepAngle(-60)
      .radius('60');
  chart4.title().enabled(true).text('startAngle(-45) sweepAngle(-60)\nradius(60)');
  //chart4.axis()
  //    .startAngle(71)
  //    .radius(65)
  //    .sweepAngle(-70);
  //chart4.title('startAngle(71) sweepAngle(-70)\nradius(65)');
  chart4.bounds('50%', '50%', '50%', '50%');


  //anytest.stageListen(function() {
  //  anytest.CAT.getScreen();
  //  chart4.axis()
  //      .startAngle(71)
  //      .radius(65)
  //      .sweepAngle(-70);
  //  chart4.title('startAngle(71) sweepAngle(-70)\nradius(65)');
  //  anytest.CAT.getScreen('afterDraw', -1);
  //  anytest.exit();
  //});

  chart4.container(stage).draw();

  stage.resume();
});
