var chart;
var stage;

var ranger, input;
function startAngle(value) {
  chart.startAngle(value);
  input.value = chart.startAngle();
}

function startAngleInp(value) {
  chart.startAngle(value);
  ranger.value = chart.startAngle();
}

var newPalette = anychart.palettes.distinctColors().colors(
    ['#64b5f6', '#1976d2', '#ef6c00', '#ffd54f', '#455a64', '#96a6a6', '#dd2c00', '#00838f', '#00bfa5', '#ffa000']);

var oldPalette = anychart.palettes.distinctColors();

function changePalette(value) {
  if (value == 'new') {
    chart.palette(newPalette);
  } else {
    chart.palette(oldPalette);
  }
}

function load() {

  anychart.theme('v6');

  var data = [
    {name: 'Product A', value: '1222'},
    {name: 'Product B', value: '2431'},
    {name: 'Product C', value: '3624'},
    {name: 'Product D', value: '5243'},
    {name: 'Product E', value: '6813'},
    {name: 'Product F', value: '5321'},
    {name: 'Product G', value: '1567'},
    {name: 'Product H', value: '3876'},
    {name: 'Product I', value: '2187'}
  ];


  chart = anychart.pie3d(data)
      .container('container')
      //.insideLabelsOffset('60%')
      .startAngle(38);

  chart.title()
      .text('3D Pie');

  chart.labels()
      .enabled(false);

  chart.legend()
      .enabled(false);

  chart.innerRadius('35%');
  //chart.hatchFill(true);

  chart.palette(newPalette);

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
}
