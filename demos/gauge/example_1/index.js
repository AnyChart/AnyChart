var gauge, dataSet;
anychart.onDocumentReady(function() {
  //create data set on our data
  dataSet = anychart.data.set([0,0,0]);

  setInterval(function() {
    var now = new Date();
    var seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    var minutes = now.getMinutes() + seconds / 60;
    var hours = (now.getHours() % 12) + minutes / 60;

    //console.log(hours, minutes, seconds);

    dataSet.data([hours, minutes, seconds]);
  }, 1);

  gauge = anychart.circularGauge();
  gauge.container('container').draw();

  gauge.data(dataSet);
  gauge.padding('4%');
  gauge.circularPadding('10%');
  gauge.startAngle(270);
  gauge.sweepAngle(360);
  gauge.stroke('#A9A9A9');
  gauge.fill('black');

  var axisHours = gauge.axis()
      .fill('#aaa')
      .radius(95)
      .width(1)
      .minimum(0)
      .maximum(12)
      .ticksInterval(1);

  axisHours.ticks()
      .fill('red')
      .type('line')
      .length('4%');

  axisHours.labels()
      .position('o')
      .fontColor('white');

  var axisMinutes = gauge.axis(1)
      .width(0)
      .radius(93)
      .minimum(0)
      .maximum(60)
      .ticksInterval(1);

  axisMinutes.ticks().enabled(false);
  axisMinutes.labels().position('i').fontColor('white');

  gauge.cap().radius('5%');

  gauge.needle(0)
      .fill('white')
      .stroke('white')
      .endRadius(60)
      .middleWidth('3%');

  gauge.needle(1)
      .fill('white')
      .stroke('white')
      .axisIndex(1)
      .endRadius(80)
      .middleWidth('2%')
      .startWidth('2%');

  gauge.needle(2)
      .fill('rgb(242,41,34)')
      .stroke('rgb(242,41,34)')
      .axisIndex(1)
      .endRadius('85%')
      .startWidth(1)
      .startRadius('-10%');
});