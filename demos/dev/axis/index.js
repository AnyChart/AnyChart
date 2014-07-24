var axis1, axis2, axis3, axis4, chart, parentBounds, container, drawer;

function setAxis(value) {
  axis1.enabled(value);
}

function setStaggerMode(value) {
  axis1.staggerMode(value);
}

function setStaggerLines(value) {
  axis1.staggerLines(value == '' ? null : value);
}

function setStaggerMaxLines(value) {
  axis1.staggerMaxLines(value == '' ? null : value);
}

function setOverlapMode(value) {
  axis1.overlapMode(value ? 'overlap' : 'nooverlap');
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

function scaleLength(value) {
  axis1.length(parseFloat(value));
  $('#scaleLength').text(axis1.length());
}

function rotation(value) {
  axis1.labels().rotation(parseFloat(value));
  $('#rotationAngle').text(axis1.labels().rotation());
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

function tickSet(value) {
  var ticks = value.split(' ');
  axis1.scale().ticks().set(ticks);

  var ticksArr = axis1.scale().ticks().get();
  var minorTicksArr = axis1.scale().minorTicks().get();

  axis1.scale()
      .minimum(parseFloat(ticksArr[0]) > parseFloat(minorTicksArr[0]) ? minorTicksArr[0] : ticksArr[0])
      .maximum(parseFloat(ticksArr[ticksArr.length - 1]) > parseFloat(minorTicksArr[minorTicksArr.length - 1]) ? ticksArr[ticksArr.length - 1] : minorTicksArr[minorTicksArr.length - 1]);
}

function minorTickSet(value) {
  var ticks = value.split(' ');
  axis1.scale().minorTicks().set(ticks);

  var ticksArr = axis1.scale().ticks().get();
  var minorTicksArr = axis1.scale().minorTicks().get();

  axis1.scale()
      .minimum(parseFloat(ticksArr[0]) > parseFloat(minorTicksArr[0]) ? minorTicksArr[0] : ticksArr[0])
      .maximum(parseFloat(ticksArr[ticksArr.length - 1]) > parseFloat(minorTicksArr[minorTicksArr.length - 1]) ? ticksArr[ticksArr.length - 1] : minorTicksArr[minorTicksArr.length - 1]);
}


var scale;
function load() {
  scale = new anychart.scales.Ordinal();
//  var values = ['Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'семь', 'восемь', 'девять'];
  var values =
      [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
  scale.values(values);
  scale.ticks().interval(1);

//  scale = new anychart.scales.Linear();
//  var ticks = ["0", "25", "50", "75", "100"];
//  var minorTicks = [0, "5", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80", "85", "90", "95", "100"];
//  scale.ticks().set(ticks);
//  scale.minorTicks().set(minorTicks);
//  var ticksArr = scale.ticks().get();
//  var minorTicksArr = scale.minorTicks().get();
//  scale
//      .minimum(parseFloat(ticksArr[0]) > parseFloat(minorTicksArr[0]) ? minorTicksArr[0] : ticksArr[0])
//      .maximum(parseFloat(ticksArr[ticksArr.length - 1]) > parseFloat(minorTicksArr[minorTicksArr.length - 1]) ? ticksArr[ticksArr.length - 1] : minorTicksArr[minorTicksArr.length - 1]);

  axis1 = new anychart.elements.Axis();
  axis1.suspendSignalsDispatching();
  axis1.scale(scale);
  axis1.offsetY(250);
  axis1.container('container');
  axis1.orientation('bottom');
  axis1.length(156);
//  axis1.staggerMaxLines(2);
//  axis1.overlapMode('nooverlap');
//  axis1.staggerLines(3);
  axis1.staggerMode(true);
  axis1.ticks().enabled(true);
  axis1.labels().rotation(0).fontSize(10).enabled(true);
  axis1.minorLabels().rotation(0).enabled(true);

  var container = axis1.container();

//  axis3 = new anychart.elements.Axis();
//  axis3.scale(scale);
//  axis3.container(container);
//  axis3.orientation('left');
//  axis3.length(500);

//  var boundsAxis1 = axis1.getPixelBounds_();
//  var boundsAxis3 = axis3.getPixelBounds_();

//  axis1.offsetX(boundsAxis3.width());
  axis1.offsetX(200);
//  axis1.length(boundsAxis1.width() - 2 * boundsAxis3.width());

//  axis3.offsetY(boundsAxis1.height());
//  axis3.length(boundsAxis3.height() - 2 * boundsAxis1.height());

//  var parentBounds = new anychart.math.Rect(0, 0, 500, 500);

  axis1.parentBounds(parentBounds);

//  axis3.parentBounds(parentBounds);
//
//  boundsAxis1 = axis1.getPixelBounds_();
//  boundsAxis3 = axis3.getPixelBounds_();

  axis1.draw();
  axis1.resumeSignalsDispatching(false);

//  axis3.draw();
//
//  axis2 = new anychart.elements.Axis();
//  axis2.scale(scale);
//  axis2.container(container);
//  axis2.orientation('bottom');
//  axis2.parentBounds(parentBounds);
//  axis2.offsetX(boundsAxis1.left());
//  axis2.offsetY(1);
//  axis2.length(boundsAxis1.width());
//  axis2.draw();
//
//
//  axis4 = new anychart.elements.Axis();
//  axis4.scale(scale);
//  axis4.container(container);
//  axis4.orientation('right');
//  axis4.parentBounds(parentBounds);
//  axis4.offsetY(boundsAxis3.top());
//  axis4.length(boundsAxis3.height());
//  axis4.draw();
//
//
//  var boundsAxis2 = axis2.getPixelBounds_();
//  var boundsAxis4 = axis4.getPixelBounds_();


//  container.rect().setBounds(boundsAxis1.toRect()).stroke('red');
//  container.rect().setBounds(boundsAxis2.toRect()).stroke('blue');
//  container.rect().setBounds(boundsAxis3.toRect()).stroke('green');
//  container.rect().setBounds(boundsAxis4.toRect()).stroke('yellow');


  //axes in chart sample
//  var data1 = [];
//  var data2 = [];
//  var d1 = [], d2 = [];
//  var t1, t2;
//  var vals = [];
//  for (var i = 0; i < 20; i++) {
//    if (t1 = (Math.random() > 0)) {
//      d1.push(i);
//      data1.push([
//        i,
//        Math.round(Math.random() * 1000) + 10,
//        Math.round(Math.random() * 1000) - 500,
//        Math.round(Math.random() * 1000) + 1000,
//        Math.round(Math.random() * 1000) - 990,
//        Math.round(Math.random() * 1000) + 10
//      ]);
//    }
//    if (t2 = (Math.random() > 0.2)) {
//      d2.push(i);
//      data2.push([
//        i,
//        Math.round(Math.random() * 1000) + 10,
//        Math.round(Math.random() * 1000) + 1000,
//        Math.round(Math.random() * 1000) - 990,
//        Math.round(Math.random() * 1000) + 10
//      ]);
//    }
//    vals.push(i);
//  }

//  chart = new anychart.cartesian.Chart();
//  chart.container('chart-container');
//  chart.bounds(0, 0, 500, 500);
//  chart.title('Range spline \n area chart');
//  chart.title().fontSize(14).hAlign('center');
//  chart.axis().orientation('left');
//  chart.axis().orientation('right');
//  chart.axis().orientation('bottom');
//  chart.axis().orientation('top');
//  chart.rangeSplineArea(data2).markers(null);
//  chart.rangeSplineArea(data1).markers(null);
//  chart.draw();


//  $('#container').width(500).height(500);


//  var chart = new anychart.cartesian.Chart();
//  chart.container('container');
//  chart.line([
//    [Date.UTC(2010, 01, 01), 10],
//    [Date.UTC(2010, 02, 01), 40],
//    [Date.UTC(2010, 03, 01), 20],
//    [Date.UTC(2010, 04, 01), 60],
//    [Date.UTC(2010, 05, 01), 20],
//    [Date.UTC(2010, 06, 01), 30],
//    [Date.UTC(2010, 07, 01), 70],
//    [Date.UTC(2010, 07, 30), 40]
//  ]);
//  chart.xScale(new anychart.scales.DateTime());
//  var xAxis = chart.axis().orientation('bottom');
//  xAxis.labels().offsetY(10);
//  xAxis.minorLabels().enabled(true);
//  chart.axis().orientation('left');
//  chart.draw();

  (drawer = function() {
    axis1.draw();

    var setAxisInput = document.getElementById('setAxis');
    var setLabelsInput = document.getElementById('setLabels');
    var setMinorLabelsInput = document.getElementById('setMinorLabels');
    var setTicksInput = document.getElementById('setTicks');
    var setMinorTicksInput = document.getElementById('setMinorTicks');
    var setTitleInput = document.getElementById('setTitle');

    var setStaggerLinesInput = document.getElementById('setStaggerLines');
    var setStaggerMaxLinesInput = document.getElementById('setStaggerMaxLines');
    var setStaggerModeInput = document.getElementById('setStaggerMode');
    var setOverlapModeInput = document.getElementById('setOverlapMode');

    var lengthInput = document.getElementById('length');
    var rotationInput = document.getElementById('rotation');
    var tickLengthInput = document.getElementById('tickLength');
    var minorTickLengthInput = document.getElementById('minorTickLength');
    var setFirstLabelInput = document.getElementById('setFirstLabel');
    var setLastLabelInput = document.getElementById('setLastLabel');
    var orientationInput = document.getElementById('orientation');

    var ticksSetInput = document.getElementById('ticksSet');
    var minorTicksSetInput = document.getElementById('minorTicksSet');


    goog.array.forEach(scale.ticks().get(), function(value, index, arr) {
      this.value += value + (index == arr.length - 1 ? '' : ' ');
    }, ticksSetInput);

    if (axis1.scale() instanceof anychart.scales.Linear) {
      goog.array.forEach(scale.minorTicks().get(), function(value, index, arr) {
        this.value += value + (index == arr.length - 1 ? '' : ' ');
      }, minorTicksSetInput);
      setMinorLabelsInput.checked = axis1.minorLabels().enabled();
      setMinorTicksInput.checked = axis1.minorTicks().enabled();
    }

    setAxisInput.checked = axis1.enabled();

    setLabelsInput.checked = axis1.labels().enabled();
    setMinorLabelsInput.checked = axis1.minorLabels().enabled();

    setStaggerModeInput.checked = axis1.staggerMode();
    setOverlapModeInput.checked = axis1.overlapMode() == 'overlap';

    setTicksInput.checked = axis1.ticks().enabled();
    setTitleInput.checked = axis1.title().enabled();

    setFirstLabelInput.checked = axis1.drawFirstLabel();
    setLastLabelInput.checked = axis1.drawLastLabel();


    setStaggerLinesInput.value = axis1.staggerLines();
    setStaggerMaxLinesInput.value = axis1.staggerMaxLines();

    orientationInput.value = axis1.orientation();

    lengthInput.value = axis1.length();
    $('#scaleLength').text(axis1.length());
    rotationInput.value = axis1.labels().rotation();
    $('#rotationAngle').text(axis1.labels().rotation());
    tickLengthInput.value = axis1.ticks().length();
    minorTickLengthInput.value = axis1.minorTicks().length();
  })();

  axis1.listen('signal', drawer);
}