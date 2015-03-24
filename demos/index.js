var gauge;
anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = anychart.data.set([]);

  setInterval(function() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    dataSet.data([hours, minutes, seconds]);
  }, 1000);

  gauge = anychart.circularGauge();
  gauge.data(dataSet);
  gauge.padding('4%', '4%', '2%', '4%');
  gauge.circularPadding('10%');
  gauge.startAngle(-90);
  gauge.sweepAngle(360);
  gauge.stroke('#A9A9A9');
  gauge.fill({
    src: 'http://juliewight.com/wp-content/uploads/2013/11/rastafarian-pictures.jpg',
    mode: acgraph.vector.ImageFillMode.STRETCH
  });
  //gauge.fill({keys:[{color: "#FDFDFD"}, {color: "#F7F3F4"}], angle: 45});
  //gauge.fill({keys:[{color: "#FDFDFD"}, {color: "green"}], angle: 45, opacity: 0.7});
  var axisHours = gauge.axis()
    //.startAngle(-140)
    //.sweepAngle(100)
      .fill('#aaa')
      .radius(95)
      .width(1)
      .minimum(0)
      .maximum(12)
      .ticksInterval(1);

  axisHours.ticks()
    //.hatchFill('confetti')
      .fill('red')
      .type('line')
      .width(2)
      .length(axisHours.width());

  axisHours.labels().position('o').fontColor('white');

  var axisMinutes = gauge.axis(1)
      .width(0)
      .radius(95)
      .minimum(0)
      .maximum(60)
      .ticksInterval(1);

  axisMinutes.ticks().enabled(false);
  axisMinutes.labels().position('i').fontColor('white');

  var axisMs = gauge.axis(2)
      .width(0)
      .radius(25)
      .minimum(0)
      .maximum(1000)
      .ticksInterval(1);

  axisMs.ticks().enabled(false);
  axisMs.labels().enabled(false);

  gauge.cap().radius('5%');

  var color1 = 'rgb(242,41,34)';
  var color2 = 'rgb(255,255,7)';
  var color3 = 'rgb(2,119,40)';

  gauge.bar(0).fill(color1).stroke(color1).radius('85%').hatchFill(true);
  gauge.bar(1).fill(color2).stroke(color2).radius('80%').hatchFill(true).axisIndex(1);
  gauge.bar(2).fill(color3).stroke(color3).radius('75%').hatchFill(true).axisIndex(1);

  gauge.container('container').draw();
});