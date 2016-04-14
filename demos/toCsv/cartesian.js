anychart.onDocumentReady(function() {
  chart = anychart.column();
  chart.container('container');

  var csv =
    's1,1,s1,2,a1,5\n' +
    's2,2,s2,3,a2,4\n' +
    's3,3,s3,4,a3,5\n';

  var csvString =
    's1,1,2\n' +
    's2,2,3\n' +
    's3,3,4\n' +
    'a1,,,5\n' +
    'a2,,,4\n' +
    'a3,,,5\n';

  var ds = [
    [1, 'p1', 10],
    [2, 'p2', 20],
    [3, 'p3', 30]
  ];

  var dataSet = anychart.data.set(ds);
  var map1 = dataSet.mapAs({'x': [1], 'value': [0]});
  var map2 = dataSet.mapAs({'x': [1], 'value': [2]});
  var s1 = chart.column(map1).id('series1');
  var s2 = chart.column(map2).id('series2');

  var scale = anychart.scales.ordinal();

  var s3 = chart.line([
    ['p1', 20],
    ['p2', 30],
    ['p3', 10],
    ['p4', 40],
    80
  ]).id('series3');
  s3.xScale(scale);
  chart.xAxis(1).orientation('bottom').scale(scale);

  var s4 = chart.spline([
    ['a1', 30],
    ['p2', 10],
    ['a3', 20]
  ]).id('spline');

  chart.draw();
  console.log(chart.toCsv(false));
});
