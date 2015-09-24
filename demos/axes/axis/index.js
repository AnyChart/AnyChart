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
  if (axis1.isHorizontal()) {
    axis1.padding().right(axis1.parentBounds().width - parseFloat(value));
  } else {
    axis1.padding().bottom(axis1.parentBounds().width - parseFloat(value));
  }
  $('#scaleLength').text(parseFloat(value));
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
  //var values = ['Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'семь', 'восемь', 'девять'];
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
//  scale.ticks().interval(1);

  //scale = new anychart.scales.Linear();
//  var ticks = ["0", "25", "50", "75", "100"];
//  var minorTicks = [0, "5", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80", "85", "90", "95", "100"];
//  scale.ticks().set(ticks);
//  scale.minorTicks().set(minorTicks);
//  var ticksArr = scale.ticks().get();
//  var minorTicksArr = scale.minorTicks().get();
//  scale
//      .minimum(parseFloat(ticksArr[0]) > parseFloat(minorTicksArr[0]) ? minorTicksArr[0] : ticksArr[0])
//      .maximum(parseFloat(ticksArr[ticksArr.length - 1]) > parseFloat(minorTicksArr[minorTicksArr.length - 1]) ? ticksArr[ticksArr.length - 1] : minorTicksArr[minorTicksArr.length - 1]);

  axis1 = new anychart.core.axes.Linear();
  axis1.suspendSignalsDispatching();
  axis1.scale(scale);
  axis1.container('container');
  axis1.orientation('bottom');
//  axis1.staggerMaxLines(2);
//  axis1.overlapMode('nooverlap');
//  axis1.staggerLines(3);
  axis1.staggerMode(true);
  axis1.ticks().length(25).stroke('2 red');
  axis1.minorTicks().stroke('2 green').length(15);
  axis1.labels()
      .rotation(0)
      .fontSize(10)
      .enabled(true)
      .textFormatter(function() {
        return this.value;
      });
  axis1.minorLabels().rotation(0).enabled(true);
  axis1.orientation('top');

  var container = axis1.container();

  //axis1.parentBounds();
  axis1.draw();
  axis1.resumeSignalsDispatching(false);


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

    rotationInput.value = axis1.labels().rotation();
    $('#rotationAngle').text(axis1.labels().rotation());
    tickLengthInput.value = axis1.ticks().length();
    minorTickLengthInput.value = axis1.minorTicks().length();
  })();

  axis1.listen('signal', drawer);
}