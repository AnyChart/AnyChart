var chart, series1;
var ranger, input, dataSet;

function startAngle(value) {
  chart.startAngle(value);
  input.value = chart.startAngle();
}


function startAngleInp(value) {
  chart.startAngle(value);
  ranger.value = chart.startAngle();
}

anychart.onDocumentReady(function() {
  dataSet = anychart.data.set([
    [50, 55],
    [10, 6],
    [20, 7],
    [30, 8],
    [40, 9],
    [50, 10],
    [60, 11],
    [70, 12],
    [80, 13],
    [90, 14],
    [100, 15],
    [110, 16],
    [120, NaN],
    [130, NaN],
    [140, NaN],
    [150, NaN],
    [160, NaN],
    [170, NaN],
    [180, NaN],
    [190, NaN],
    [200, 25],
    [210, 26],
    [220, 27],
    [230, 28],
    [240, 29],
    [250, 7],
    [260, 45],
    [90, 55]
    //[20, 76]

    //[90, 10],
    //[100, 45]
    //  [40, 60],
    //  [60, 40]
  ]);

  var data = dataSet.mapAs({x: [0], value: [1]});

  chart = anychart.polar();

  chart.xScale().maximum(95).minimum(0).inverted(false);
  chart.xScale().ticks().interval(5);

  series1 = chart.area(data).connectMissingPoints(true).closed(false).stroke('5 red .2');
  //series1.hatchFill(true);

  chart.container('container').draw();

  //dataSet.append({x: 5, value: 60});
  //dataSet.append({x: 10, value: 70});

  ranger = document.getElementById('startAngle');
  input = document.getElementById('startAngleInp');

  ranger.value = chart.startAngle();
  input.value = chart.startAngle();
});