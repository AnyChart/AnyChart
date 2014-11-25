function load() {
  var stage = acgraph.create('container', '100%', '100%');

  var data = [
    'missing',//1
    10,//2
    30,//3
    20,//4
    60,//5
    50,//6
    80,//7
    'missing',//8
    50,//9
    'missing',//10
    'missing',//11
    60,//12
    70,//13
    'missing'];//14

  var rangeData = [
    [1, 'missing', 'missing', 120], //1
    [2, 'missing', 10, 20], //2
    [3, 'missing', 30, 40], //3
    [4, 'missing', 20, 40], //4
    [5, 'missing', 60, 90], //5
    [6, 'missing', 50, 70], //6
    [7, 'missing', 80, 100], //7
    [8, 'missing', 'missing', 120], //8
    [9, 'missing', 50, 70], //9
    [10, 'missing', 'missing', 120], //10
    [11, 'missing', 'missing', 120], //11
    [12, 'missing', 60, 90], //12
    [13, 'missing', 70, 80], //13
    [14, 'missing', 'missing', 120] //14
  ];

  function createChart(type, x, y, width, height) {
    var chart = new anychart.charts.Cartesian();
    chart.container(stage);
    chart.bounds(x, y, width, height);
    var seriesData = type.indexOf('range') == -1 ? data : rangeData;
    var series = chart[type](seriesData);
    series.connectMissingPoints(true);
    series.markers().enabled(true).type('square').fill('blue .5').size(5);
    chart.axis().orientation('bottom');
    chart.axis().orientation('left');
    chart.title().text(type);
    chart.draw();
  }

  createChart('line', 0, 0, 400, 400);
  createChart('spline', 410, 0, 400, 400);
  createChart('stepLine', 820, 0, 400, 400);
  createChart('area', 0, 410, 400, 400);
  createChart('splineArea', 410, 410, 400, 400);
  createChart('stepArea', 820, 410, 400, 400);
  createChart('rangeArea', 0, 820, 400, 400);
  createChart('rangeSplineArea', 410, 820, 400, 400);
  createChart('rangeStepArea', 820, 820, 400, 400);
}
