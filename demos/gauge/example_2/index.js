var gauge, dataSet;
anychart.onDocumentReady(function() {
  //create data set on our data
  dataSet = anychart.data.set([81, 34.5, 92.5]);

  gauge = anychart.circularGauge();


  gauge.data(dataSet)
      .padding('4%')
      .circularPadding('10%')
      .startAngle(270)
      .sweepAngle(360)
      .stroke('2 #A9A9A9')
      .fill('white');

  gauge.cap().enabled(true);

  var axis1 = gauge.axis(0)
      .startAngle(135)
      .sweepAngle(270);

  axis1.scale()
      .minimum(0)
      .maximum(100)
      .ticks().interval(10);

  axis1.labels()
      .position('o')
      .fontColor('black');

  gauge.bar(0);
  gauge.needle(1);
  gauge.marker(2);
  gauge.knob(3);

  gauge.tooltip(true);

  gauge.container('container').draw();
});