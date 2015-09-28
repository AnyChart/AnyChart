var axis1, axis2, grid1, grid2, grid3, chart, parentBounds, container, boundsRect, stroke, stroke2, remainingBounds, startAngleSet;
var angleAxisDrawer, angleGridDrawer, radialAxisDrawer, circuitGridDrawer, circuitMinorGridDrawer;

function setAxis(value) {
  axis1.enabled(value);
}

function setRadialAxis(value) {
  axis2.enabled(value);
}

function setLabels(value) {
  axis1.labels().enabled(value);
}

function setTicks(value) {
  axis1.ticks().enabled(value);
}

function setAngleGrid(value) {
  grid1.enabled(value);
}

function setCircuitGrid(value) {
  grid2.enabled(value);
}

function setCircuitMinorGrid(value) {
  grid3.enabled(value);
}

function setThickness(value) {
  stroke.thickness = value;
  axis1.stroke(stroke);
}

function rotation(value) {
  axis1.labels().rotation(parseFloat(value));
}

function startAngle(value) {
  startAngleSet = value;
  grid1.startAngle(parseFloat(value));
  grid2.startAngle(parseFloat(value));
  grid3.startAngle(parseFloat(value));
  axis2.startAngle(parseFloat(value));
  axis1.startAngle(parseFloat(value));


  var angleRange = document.getElementById('startAngleRange');
  var angleInput = document.getElementById('startAngleInp');
  angleRange.value = axis1.startAngle();
  angleInput.value = axis1.startAngle();
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

//--------------------Radial Axis------------------

function setRadialAxisLabels(value) {
  axis2.labels().enabled(value);
}

function setRadialAxisTicks(value) {
  axis2.ticks().enabled(value);
}

function setThicknessRadialAxis(value) {
  stroke2.thickness = value;
  axis2.stroke(stroke2);
}

function rotationRadialAxis(value) {
  axis2.labels().rotation(parseFloat(value));
}

function tickLengthRadialAxis(value) {
  axis2.ticks().length(parseFloat(value));
}


var scale, scale2;
function load() {
  var stage = anychart.graphics.create('container');

  scale = anychart.scales.ordinal();

  var values = [];
  var count = 360 / 15;
  for (var i = 0; i < count; i++) {
    values.push(i * 15);
  }

  startAngleSet = 90;

//  var values = ['Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь', 'Девять'];
//  var values = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20', 'P21', 'P22', 'P23', 'P24'];
//  var values = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
//  var values = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
  scale.values(values);
  scale.ticks().interval(1);

  scale2 = anychart.scales.linear();
  scale2.ticks().set([0,4,8,12]);
  scale2.minorTicks().set([0,1,2,3,4,5,6,7,8,9,10,11,12]);


  parentBounds = new acgraph.math.Rect(0,0,930,720);
  boundsRect = stage.rect();
  stroke = {color: 'black', thickness: 1, opacity: 0.5};

  remainingBounds = stage.rect().stroke('0 green');

  axis1 = anychart.axes.radar();
  axis1.startAngle(startAngleSet);
  axis1.scale(scale);
  axis1.container(stage);
  axis1.parentBounds(parentBounds);
  axis1.ticks().length(5);
  axis1.labels().rotation(0).textFormatter(function () {return this.value + '°'});
  axis1.stroke(stroke);
  axis1.enabled(true);
  axis1.zIndex(2);

  var rb = axis1.getRemainingBounds();

  grid1 = anychart.grids.radar();
  grid1.xScale(scale);
  grid1.startAngle(startAngleSet);
  grid1.container(stage);
  grid1.layout(anychart.enums.RadialGridLayout.RADIAL);
  grid1.parentBounds(rb);
  grid1.evenFill('rgba(245, 245, 245, 0.2)');
  grid1.oddFill(false);
  grid1.enabled(true);
  grid1.zIndex(1);


  grid2 = anychart.grids.radar();
  grid2.xScale(scale);
  grid2.yScale(scale2);
  grid2.isMinor(false);
  grid2.startAngle(startAngleSet);
  grid2.container(stage);
  grid2.layout(anychart.enums.RadialGridLayout.CIRCUIT);
  grid2.parentBounds(rb);
  grid2.evenFill('rgb(253, 253, 253)');
  grid2.oddFill('white');
  grid2.enabled(true);
  grid2.zIndex(0);


  grid3 = anychart.grids.radar();
  grid3.xScale(scale);
  grid3.yScale(scale2);
  grid3.isMinor(true);
  grid3.startAngle(startAngleSet);
  grid3.container(stage);
  grid3.layout(anychart.enums.RadialGridLayout.CIRCUIT);
  grid3.parentBounds(rb);
  grid3.evenFill('rgb(253, 253, 253)');
  grid3.oddFill('white');
  grid3.enabled(false);
  grid3.zIndex(0.1);


  stroke2 = {color: 'black', thickness: 1, opacity: 0.5};
  axis2 = anychart.axes.radial();
  axis2.container(stage);
  axis2.scale(scale2);
  axis2.startAngle(startAngleSet);
  axis2.stroke(stroke2);
  axis2.parentBounds(rb);
  axis2.ticks().length(5);
  axis2.minorLabels().enabled(true);
  axis2.minorTicks().enabled(true);
  axis2.zIndex(3);


  (angleAxisDrawer = function() {
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
    var rb = axis1.getRemainingBounds();

    xRange.value = pb.left;
    xInput.value = pb.left;
    yRange.value = pb.top;
    yInput.value = pb.top;
    widthRange.value = pb.width;
    widthInput.value = pb.width;
    heightRange.value = pb.height;
    heightInput.value = pb.height;

    boundsRect.setBounds(pb);
    remainingBounds.setBounds(rb);
    grid1.parentBounds(rb);
    grid2.parentBounds(rb);
    grid3.parentBounds(rb);
    axis2.parentBounds(rb);
  })();

  (angleGridDrawer = function() {
    grid1.draw();

    var setAngleGridInput = document.getElementById('setAngleGrid');
    setAngleGridInput.checked = grid1.enabled();
  })();

  (circuitGridDrawer = function() {
    grid2.draw();

    var setCircuitGridInput = document.getElementById('setCircuitGrid');
    setCircuitGridInput.checked = grid2.enabled();
  })();

  (circuitMinorGridDrawer = function() {
    grid3.draw();

    var setCircuitMinorGridInput = document.getElementById('setCircuitMinorGrid');
    setCircuitMinorGridInput.checked = grid3.enabled();
  })();

  (radialAxisDrawer = function() {
    axis2.draw();

    var setAxisInput = document.getElementById('setRadialAxis');
    var setLabelsInput = document.getElementById('setRadialAxisLabels');
    var setTicksInput = document.getElementById('setRadialAxisTicks');

    var thicknessRange = document.getElementById('thicknessRadialAxisRange');
    var thicknessInput = document.getElementById('thicknessRadialAxisInp');

    var rotationRange = document.getElementById('rotationRadialAxisRange');
    var rotationInput = document.getElementById('rotationRadialAxisInp');

    var tickLengthRange = document.getElementById('tickLengthRadialAxisRange');
    var tickLengthInput = document.getElementById('tickLengthRadialAxisInp');


    setAxisInput.checked = axis2.enabled();
    setLabelsInput.checked = axis2.labels().enabled();
    setTicksInput.checked = axis2.ticks().enabled();

    thicknessRange.value = axis2.stroke().thickness;
    thicknessInput.value = axis2.stroke().thickness;

    rotationRange.value = axis2.labels().rotation();
    rotationInput.value = axis2.labels().rotation();

    tickLengthRange.value = axis2.ticks().length();
    tickLengthInput.value = axis2.ticks().length();
  })();

  axis1.listen('signal', angleAxisDrawer);
  grid1.listen('signal', angleGridDrawer);
  grid2.listen('signal', circuitGridDrawer);
  grid3.listen('signal', circuitMinorGridDrawer);
  axis2.listen('signal', radialAxisDrawer);
}