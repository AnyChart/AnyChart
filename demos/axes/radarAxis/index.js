var axis1, axis2, axis3, axis4, chart, parentBounds, container, drawer, boundsRect, stroke, remainingBounds;

function setAxis(value) {
  axis1.enabled(value);
}

function setLabels(value) {
  axis1.labels().enabled(value);
}

function setTicks(value) {
  axis1.ticks().enabled(value);
}

function setThickness(value) {
  stroke.thickness = value;
  axis1.stroke(stroke);
}

function rotation(value) {
  axis1.labels().rotation(parseFloat(value));
}

function startAngle(value) {
  axis1.startAngle(parseFloat(value));
}

function tickLength(value) {
  axis1.ticks().length(parseFloat(value));
}

function setX(value) {
  parentBounds.left = value;
  axis1.parentBounds(parentBounds);
}

function setY(value) {
  parentBounds.top = value;
  axis1.parentBounds(parentBounds);
}

function setWidth(value) {
  parentBounds.width = value;
  axis1.parentBounds(parentBounds);
}

function setHeight(value) {
  parentBounds.height = value;
  axis1.parentBounds(parentBounds);
}


var scale;
function load() {
  var stage = anychart.graphics.create('container');


  scale = anychart.scales.linear();

  scale.maximum(360).minimum(0);
  scale.ticks().interval(15);

  //scale = anychart.scales.ordinal();
  //var values = ['Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь', 'Девять'];
//  var values = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
//  var values = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December December December' ];
//  scale.values(values);
//  scale.ticks().interval(1);
//  scale.inverted(true);

  parentBounds = new acgraph.math.Rect(250,0,553,720);
  boundsRect = stage.rect();
  stroke = {color: 'red', thickness: 1, opacity: .3};

  remainingBounds = stage.rect().stroke('green');

  axis1 = anychart.axes.polar();
  axis1.startAngle(190);
  axis1.scale(scale);
  axis1.container(stage);
  axis1.parentBounds(parentBounds);
  axis1.ticks().length(5);
  axis1.labels().rotation(0);
  axis1.stroke(stroke);

  axis1.labels().enabled(true);
  axis1.ticks().enabled(true);

  //axis1.minorLabels().enabled(true);
  //axis1.minorTicks().enabled(true);

  (drawer = function() {
    axis1.draw();

    var setAxisInput = document.getElementById('setAxis');
    var setLabelsInput = document.getElementById('setLabels');
    var setTicksInput = document.getElementById('setTicks');

    var thicknessRange = document.getElementById('thicknessRange');
    var thicknessInput = document.getElementById('thicknessInp');

    var rotationRange = document.getElementById('rotationRange');
    var rotationInput = document.getElementById('rotationInp');

    var angleRange = document.getElementById('startAngleRange');
    var angleInput = document.getElementById('startAngleInp');

    var tickLengthRange = document.getElementById('tickLengthRange');
    var tickLengthInput = document.getElementById('tickLengthInp');

    var xRange = document.getElementById('xRange');
    var xInput = document.getElementById('xInp');
    var yRange = document.getElementById('yRange');
    var yInput = document.getElementById('yInp');
    var widthRange = document.getElementById('widthRange');
    var widthInput = document.getElementById('widthInp');
    var heightRange = document.getElementById('heightRange');
    var heightInput = document.getElementById('heightInp');

    setAxisInput.checked = axis1.enabled();
    setLabelsInput.checked = axis1.labels().enabled();
    setTicksInput.checked = axis1.ticks().enabled();

    thicknessRange.value = axis1.stroke().thickness;
    thicknessInput.value = axis1.stroke().thickness;

    rotationRange.value = axis1.labels().rotation();
    rotationInput.value = axis1.labels().rotation();

    angleRange.value = axis1.startAngle();
    angleInput.value = axis1.startAngle();

    tickLengthRange.value = axis1.ticks().length();
    tickLengthInput.value = axis1.ticks().length();

    var pb = axis1.parentBounds();
    xRange.value = pb.left;
    xInput.value = pb.left;
    yRange.value = pb.top;
    yInput.value = pb.top;
    widthRange.value = pb.width;
    widthInput.value = pb.width;
    heightRange.value = pb.height;
    heightInput.value = pb.height;

    boundsRect.setBounds(pb);
    remainingBounds.setBounds(axis1.getRemainingBounds())
  })();

  axis1.listen('signal', drawer);
}