var axis1, axis2, axis3, axis4;
var parentBounds, container, drawer;
var textMarker, lineMarker, rangeMarker;

function setAxis(value) {
  axis1.enabled(value);
}

function setLabels(value) {
  axis1.labels().enabled(value);
}

function setMinorLabels(value) {
  axis1.minorLabels().enabled(value);
}

function setTicks(value) {
  axis1.ticks().enabled(value);
}

function setMinorTicks(value) {
  axis1.minorTicks().enabled(value);
}

function setTitle(value) {
  axis1.title().enabled(value);
}

function orientation(value) {
  axis1.orientation(value);
}

function direction(value) {
  axis1.orientation(value);
}

function scaleLength(value) {
  axis1.length(parseFloat(value));
}

function tickLength(value) {
  axis1.ticks().length(parseFloat(value));
}

function minorTickLength(value) {
  axis1.minorTicks().length(parseFloat(value));
}

function setFirstLabel(value) {
  axis1.drawFirstLabel(value);
}

function setLastLabel(value) {
  axis1.drawLastLabel(value);
}

function load() {
  var scale = new anychart.scales.Linear();

  var ticks = [0, "25", "50", "75", "100"];
  var minorTicks = [0, "5", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80", "85", "90", "95", "100"];

  scale.ticks().set(ticks);
  scale.minorTicks().set(minorTicks);
  var ticksArr = scale.ticks().get();
  var minorTicksArr = scale.minorTicks().get();
  scale
      .minimum(parseFloat(ticksArr[0]) > parseFloat(minorTicksArr[0]) ? minorTicksArr[0] : ticksArr[0])
      .maximum(parseFloat(ticksArr[ticksArr.length - 1]) > parseFloat(minorTicksArr[minorTicksArr.length - 1]) ? ticksArr[ticksArr.length - 1] : minorTicksArr[minorTicksArr.length - 1]);


  axis1 = new anychart.elements.Axis();
  axis1.scale(scale);
  axis1.container('container');
  axis1.orientation('top');
  axis1.length(500);

  var container = axis1.container();

  /*axis3 = new anychart.elements.Axis();
   axis3.scale(scale);
   axis3.container(container);
   axis3.orientation('left');
   axis3.length(500);


   var boundsAxis1 = axis1.getPixelBounds_();
   var boundsAxis3 = axis3.getPixelBounds_();

   axis1.offsetX(boundsAxis3.width());
   axis1.length(boundsAxis1.width() - 2 * boundsAxis3.width());

   axis3.offsetY(boundsAxis1.height());
   axis3.length(boundsAxis3.height() - 2 * boundsAxis1.height());

   var parentBounds = new anychart.math.Rect(0, 0, boundsAxis1.width(), boundsAxis3.height());

   axis1.parentBounds(parentBounds);
   axis3.parentBounds(parentBounds);

   boundsAxis1 = axis1.getPixelBounds_();
   boundsAxis3 = axis3.getPixelBounds_();


   axis1.draw();
   axis3.draw();


   axis2 = new anychart.elements.Axis();
   axis2.scale(scale);
   axis2.container(container);
   axis2.orientation('bottom');
   axis2.parentBounds(parentBounds);
   axis2.offsetX(boundsAxis1.left());
   axis2.offsetY(1);
   axis2.length(boundsAxis1.width());
   axis2.draw();

   axis4 = new anychart.elements.Axis();
   axis4.scale(scale);
   axis4.container(container);
   axis4.orientation('right');
   axis4.parentBounds(parentBounds);
   axis4.offsetY(boundsAxis3.top());
   axis4.length(boundsAxis3.height());
   axis4.draw();


   var boundsAxis2 = axis2.getPixelBounds_();
   var boundsAxis4 = axis4.getPixelBounds_();*/


//  container.rect().setBounds(boundsAxis1.toRect()).stroke('red');
//  container.rect().setBounds(boundsAxis2.toRect()).stroke('blue');
//  container.rect().setBounds(boundsAxis3.toRect()).stroke('green');
//  container.rect().setBounds(boundsAxis4.toRect()).stroke('yellow');

  /*
   var boundsForMarker = new anychart.math.Rect(
   boundsAxis3.left() + boundsAxis3.width(),
   boundsAxis1.top() + boundsAxis1.height(),
   boundsAxis1.width(),
   boundsAxis3.height()
   );*/


  var boundsForMarker = new anychart.math.Rect(50, 50, 100, 100);


  textMarker = new anychart.elements.TextMarker();
  textMarker
      .scale(scale)
      .parentBounds(boundsForMarker)
      .container(container)
      .value(35)
      .anchor('leftcenter')
      .align('far')
      .offsetX(30)
      .text('value: ' + textMarker.value());

  textMarker.draw();

  lineMarker = new anychart.elements.LineMarker();
  lineMarker.scale(scale)
      .parentBounds(boundsForMarker)
      .container(container)
      .value(textMarker.value())
      .draw();

  rangeMarker = new anychart.elements.RangeMarker();
  rangeMarker.scale(scale)
      .parentBounds(boundsForMarker)
      .container(container)
      .from(80)
      .to(90)
      .draw();

  textMarker.listen('signal', function() {
    lineMarker.value(textMarker.value());
    if (textMarker.orientation() == 'left' || textMarker.orientation() == 'right') {
      textMarker
          .offsetX(30)
          .offsetY(0)
          .anchor('leftcenter');
      lineMarker.direction('horizontal');

    } else {
      lineMarker.direction('vertical');
      textMarker
          .offsetX(0)
          .offsetY(30)
          .anchor('top');
    }
    textMarker.text('value: ' + textMarker.value());
    textMarker.draw();
  });

  lineMarker.listen('signal', function() {
    lineMarker.draw();
  });

  rangeMarker.listen('signal', function() {
    rangeMarker.draw();
  });


  var chart = new anychart.cartesian.Chart();
  chart.container(container);
  chart.bounds(10, 200, 500, 400);
  chart.line([
    [1, 10],
    [2, 40],
    [3, 30],
    [4, 60],
    [5, 20]
  ]).markers(null);
  chart.yAxis().orientation('left');
  chart.xAxis().orientation('bottom');
  chart.xAxis().orientation('top');
  chart.yAxis().orientation('right');

  chart.lineMarker().direction('horizontal').value(40);
  chart.lineMarker().direction('vertical').value(2);

  chart.rangeMarker().direction('horizontal').from(60).to(80);
  chart.rangeMarker().direction('vertical').from(3).to(4);

  chart.textMarker().orientation('bottom').value(2).text('2').align('near').anchor('rightbottom');
  chart.textMarker().orientation('left').value(40).text('40').align('near').anchor('leftbottom');

  chart.draw();

}