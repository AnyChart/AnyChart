var gauge, dataSet;
anychart.onDocumentReady(function() {
  //create data set on our data
  dataSet = anychart.data.set([45,0.75,42]);

  gauge = anychart.circularGauge();

  gauge.data(dataSet)
      .padding('4%')
      .circularPadding('10%')
      .startAngle(270)
      .sweepAngle(360)
      .stroke('#A9A9A9');

  gauge.background()
      .enabled(true)
      .fill({
        keys: ['rgb(255, 255, 255)', 'rgb(243, 243, 243)', 'rgb(255, 255, 255)'],
        angle: 270
      });
  gauge.fill({keys: ['rgb(255, 255, 255)', 'rgb(220, 220, 220)'], angle: 315});

  gauge.cap()
      .fill({keys: ['rgb(255, 255, 255)', 'rgb(119, 119, 119)'], cx: .4, cy: .4})
      .stroke('rgb(87, 87, 87)')
      .radius('10%');

  var axis1 = gauge.axis()
      .fill('rgb(117, 183, 225)')
      .radius(95)
      .width(4)
      .startAngle(100)
      .sweepAngle(160);

  axis1.labels().autoRotate(true);

  axis1.scale()
      .minimum(0)
      .maximum(100)
      .ticks().interval(20);

  axis1.ticks()
      .fill('rgb(73, 73, 73)')
      .type('line');

  axis1.minorTicks()
      .enabled(true)
      .fill('rgb(73, 73, 73)')
      .type('line')
      .length(2);

  axis1.labels()
      .position('i')
      .fontColor('black');

  //var axis2 = gauge.axis(1)
  //    .width(4)
  //    .radius(93)
  //    .startAngle(280)
  //    .sweepAngle(160)
  //    .fill('#70DD71');
  //
  //axis2.scale()
  //    .inverted(true)
  //    .minimum(0)
  //    .maximum(1)
  //    .ticks().interval(.1);
  //
  //axis2.ticks()
  //    .fill('rgb(73, 73, 73)')
  //    .type('line');
  //
  //axis2.minorTicks()
  //    .enabled(true)
  //    .fill('rgb(73, 73, 73)')
  //    .type('line')
  //    .length(2);
  //
  //axis2.labels()
  //    .textFormatter(function() {
  //      return parseInt(this['tickValue']) == this['tickValue'] ? this['tickValue'] + '.0' : this['tickValue'];
  //    })
  //    .position('i')
  //    .fontColor('black');
  //
  //var axis3 = gauge.axis(2)
  //    .width('0.1%')
  //    .radius(70)
  //    .startAngle(105)
  //    .sweepAngle(330)
  //    .fill('#494949');
  //
  //axis3.scale()
  //    .inverted(true)
  //    .minimum(0)
  //    .maximum(60)
  //    .ticks().interval(5);
  //
  //axis3.ticks()
  //    .fill('#494949')
  //    .type('circle')
  //    .length(4);
  //
  //axis3.minorTicks()
  //    .enabled(true)
  //    .fill('#494949')
  //    .type('circle')
  //    .length(2);
  //
  //axis3.labels()
  //    .position('i')
  //    .fontColor('black');

  gauge.needle(0)
      .fill('rgb(240, 103, 59)')
      .stroke('rgb(73, 73, 73)')
      .endRadius(100)
      .middleRadius(0)
      .startRadius(0)
      .middleWidth(4)
      .startWidth(4);

  gauge.needle(1)
      .fill('rgb(240, 103, 59)')
      .stroke('rgb(73, 73, 73)')
      .axisIndex(1)
      .endRadius(100)
      .middleRadius(0)
      .startRadius(0)
      .middleWidth(4)
      .startWidth(4);

  gauge.needle(2)
      .fill('rgb(240, 103, 59)')
      .stroke('rgb(73, 73, 73)')
      .axisIndex(2)
      .endRadius(75)
      .middleRadius(0)
      .startRadius(0)
      .middleWidth(3)
      .startWidth(3);

  gauge.container('container').draw();
});