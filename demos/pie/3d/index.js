var chart;
var chart2;
var stage;

var ranger, input;
function startAngle(value) {
  chart.startAngle(value);
  chart2.startAngle(value);
  input.value = chart.startAngle();
}

function startAngleInp(value) {
  chart.startAngle(value);
  chart2.startAngle(value);
  ranger.value = chart.startAngle();
}

var newPalette = anychart.palettes.distinctColors().colors(
    ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']);

var oldPalette = anychart.palettes.distinctColors();

function changePalette(value) {
  if (value == 'new') {
    chart.palette(newPalette);
    chart2.palette(newPalette);
  } else {
    chart.palette(oldPalette);
    chart2.palette(oldPalette);
  }
}

function changeLabelsPosition(value) {
  chart.labels().position(value);
  chart2.labels().position(value);
}

function load() {

  var data = [
    {name: 'Product A', value: '1432'},
    {name: 'Product B', value: '2431'},
    {name: 'Product C', value: '3624', fill: 'green'},
    {name: 'Product D', value: '5243'},
    {name: 'Product E', value: '8813'}
  ];

  var dataSet = [109, 100, 1024, 223, 107, 103, 120, 107, 102, 1030, 55, 48, 54, 66, 8, 90, 50, 45, 100];

  chart = anychart.pie3d(dataSet)
      .container('container')
      //.insideLabelsOffset('60%')
      .startAngle(199);

  chart.labels().position('o');

  chart.innerRadius('35%');
  chart.radius('35%');

  //chart.hatchFill(true);
  //chart.data([1, 20, 100]);

  // single point
  //chart.data([1]);

  // open source logo
  //chart.data([{
  //  value: 100,
  //  fill: '#3DA639',
  //  stroke: '#1E531D'
  //}, {
  //  value: 20,
  //  fill: '#fff',
  //  stroke: '#fff'
  //}]);

  chart.draw();

  ranger = document.getElementById('startAngle');
  input = document.getElementById('startAngleInp');

  ranger.value = chart.startAngle();
  input.value = chart.startAngle();

  // simple pie
  chart2 = anychart.pie(dataSet)
      .container('container2')
      .startAngle(199);

  chart2.labels().position('o');

  chart2.innerRadius('35%');
  chart2.radius('38%');

  chart2.draw();
}
