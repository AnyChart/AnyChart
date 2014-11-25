var chart, ds, v1, v2, series1, series2, axis1, axis2;
function load() {
  var stage = acgraph.create().container('container');
  ds = new anychart.data.Set([0, 1, 2, 3, 4, 5, 6, 7]);
  var map = ds.mapAs();
  v1 = map.sort('value', function(a, b) { return b - a; });
  v2 = map.sort('value', function(a, b) { return a - b; });
  chart = new anychart.charts.Cartesian().container(stage).height('50%');
  series1 = chart.column(v1);
  series2 = chart.column(v2);
  chart.xAxis();
  chart.yAxis();
  chart.listen('CHART_DRAW', function() {console.log('chart draw'); });
  chart.draw();
  chart = new anychart.charts.Cartesian().container(stage).height('50%').top('50%');
  series1 = chart.column(v1);
  series2 = chart.column(v2);
  chart.xAxis();
  chart.yAxis();
  chart.listen('CHART_DRAW', function() {console.log('chart draw'); });
  chart.draw();
}
