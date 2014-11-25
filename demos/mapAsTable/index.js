var chart, chart2;
function load() {
  var container = acgraph.create().container('container');
  var data1 = [
    ['Point 1', 100, 200, 150],
    ['Point 2', 115, 101, 175],
    ['Point 3', 70, 60, 125],
    ['Point 4', 156, 98, 150],
    ['Point 5', 213, 150, 160],
    ['Point 6', 173, 205, 150],
    ['Point 7', 95, 190, 140]
  ];
  chart = anychart.line.apply(null, anychart.data.mapAsTable(data1));
  chart.container(container);
  chart.right('50%');
  chart.draw();

  var data2 = [
    ['Point 1', 100, 200, 150, 115],
    ['Point 2', 115, 101, 175, 230],
    ['Point 3', 70, 60, 125, 100],
    ['Point 4', 156, 98, 150, 180],
    ['Point 5', 213, 150, 160, 210],
    ['Point 6', 173, 205, 150, 140],
    ['Point 7', 95, 190, 140, 60]
  ];
  chart2 = anychart.columnChart();
  var series = anychart.data.mapAsTable(data2, 'range');
  for (var i in series)
    chart2.rangeColumn(series[i]);
  chart2.left('50%');
  chart2.container(container);
  chart2.draw();
}
