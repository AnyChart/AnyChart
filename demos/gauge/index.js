var gauge, dataSet;
anychart.onDocumentReady(function() {
  //create data set on our data
  dataSet = anychart.data.set([4.5,5.5,3,6.5]);

  gauge = anychart.circularGauge();
  //gauge.container('container').draw();


  gauge.data(dataSet);
  gauge.margin(50);
  gauge.padding(0);
  //gauge.background().enabled(true).fill('red');
  gauge.sweepAngle(360);
  gauge.circularPadding(15);
  gauge.encloseWithStraightLine(true);

  //gauge.label(0)
  //    .text('AnyChart')
  //    .position('center')
  //    .anchor('center')
  //    .zIndex(60)
  //    .offsetY('60%')
  //    .offsetX(-90)
  //    .padding(10)
  //    .zIndex(20);
  //
  //gauge.label(0).background()
  //    .enabled(false);

  var axis = gauge.axis();
  axis.scale().minimum(0).maximum(10);
  axis.scale().ticks().interval(1);
  axis.drawFirstLabel(true);
  axis.drawLastLabel(true);
  axis.labels().autoRotate(false).position('i').padding(0);
  axis.labels();
  axis.labels().textFormatter(function() {
    return this.value + 'dsfsdfs'
  });

  gauge.cap();
  //gauge.knob(4).topRadius(50).bottomRadius(40).verticesCurvature(.5);
  //gauge.range()
  //    .position('i')
  //    .from(6)
  //    .to('1')
  //    .radius(null);
  gauge.needle(0).hatchFill('diagonal');
  gauge.needle(1).hatchFill(true);
  //gauge.marker();
  //gauge.bar();



  //var json = gauge.toJson();
  //console.log(JSON.stringify(json));
  //gauge.dispose();
  //gauge = anychart.fromJson(json);
  //gauge.container('container').draw();

  gauge.container('container').draw();

});