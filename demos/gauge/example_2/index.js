var gauge, dataSet;
anychart.onDocumentReady(function() {
  //create data set on our data
  dataSet = anychart.data.set([81,34.5]);

  gauge = anychart.circularGauge();
  gauge.container('container').draw();

  gauge.data(dataSet)
      .padding('4%')
      .circularPadding('10%')
      .startAngle(270)
      .sweepAngle(360)
      .stroke('2 #A9A9A9')
      .fill('white');

  gauge.cap().enabled(false);

  var axis1 = gauge.axis(0)
      .fill('#aaa')
      .width(2)
      .radius(85)
      .minimum(0)
      .maximum(100)
      .startAngle(135)
      .sweepAngle(270)
      .ticksInterval(10);

  axis1.ticks()
      .fill('white')
      .stroke('#888')
      .type('trapezoid')
      .position('c')
      .length(20);

  axis1.minorTicks()
      .enabled(true)
      .fill('white')
      .stroke('#ccc')
      .type('trapezoid')
      .position('c')
      .length(10);

  axis1.labels()
      .position('o')
      .fontColor('black');

  var axis2 = gauge.axis(1)
      .width(2)
      .radius(55)
      .minimum(0)
      .maximum(64)
      .startAngle(135)
      .sweepAngle(270)
      .ticksInterval(8);

  axis2.ticks()
      .fill('white')
      .stroke('#888')
      .type('trapezoid')
      .position('c')
      .length(20);

  axis2.minorTicks()
      .enabled(true)
      .fill('white')
      .stroke('#ccc')
      .type('trapezoid')
      .position('c')
      .length(10);

  axis2.labels()
      .position('o')
      .fontColor('black');

  gauge.bar(0)
      .position('i')
      .fill('#F0673B .9')
      .stroke('#F0673B')
      .radius(80);

  gauge.bar(1)
      .position('i')
      .fill('#2AD62A .9')
      .stroke('#2AD62A')
      .axisIndex(1)
      .radius(50);

});