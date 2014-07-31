anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet1 = new anychart.data.Set([
    [1, 10, 1.2],
    [2, 20, 1.3],
    [3, 30, 1.5],
    [4, 25, 1.6],
    [5, 11, 1.4]
  ]);

  var dataSet2 = new anychart.data.Set([
    [1, -0.489863522578899, 0.848138677816903],
    [2, -0.385774774190865, 0.779071607989758],
    [3, 0.085320462046806, 0.665356275004035],
    [4, 0.661951933364362, 1.48857802967009],
    [5, 0.275939368771361, 1.78112017585948],
    [6, 0.327782217100161, 0.910945756785081],
    [7, -0.353034448974316, 0.51492272900181],
    [8, -1.52464778559499, 0.260972126042923],
    [9, -0.593361686260142, 0.162759391666744],
    [10, -0.282102011275525, 0.828140289442679],
    [11, -1.23059300530264, 0.451152587985225],
    [12, -1.24995265027972, -0.31266194270582],
    [13, -1.37795240635888, -0.589722591726911],
    [14, -2.52518734732884, -0.95184304656081],
    [15, -1.70164913297708, -1.54184969446708],
    [16, -2.80066758524658, -1.31031245938982],
    [17, -2.21871327339612, -0.895693067878342],
    [18, -1.86045028588756, -1.26512897818588],
    [19, -2.13514441304614, -1.08943821214579],
    [20, -1.36106428148275, -0.751109295408758]
  ]);

  //helper function to setup same settings for all six charts
  var setupChartSettings = function(chart) {
    chart.container(stage);
    chart.margin(10, 10, 10, 10);
    chart.title().fontColor('#595959').align('left');
    chart.background().stroke('#CCCCCC');
    chart.xAxis(0).title().enabled(false);
    chart.yAxis(0).title().enabled(false);
    chart.minorGrid(0).enabled(false);
  };

  var stage = acgraph.create('container', '100%', '100%');

  var columnChart = anychart.columnChart();
  columnChart.title().text('Column');
  columnChart.bounds(0, 0, '33.3%', '50%');
  columnChart.column(dataSet1);
  setupChartSettings(columnChart);
  columnChart.draw();

  var areaChart = anychart.areaChart();
  areaChart.title().text('Spline-Area');
  areaChart.bounds('33.3%', 0, '33.3%', '50%');
  areaChart.splineArea(dataSet1);
  setupChartSettings(areaChart);
  areaChart.draw();

  var barChart = anychart.barChart();
  barChart.title().text('Bar');
  barChart.bounds('66.6%', 0, '33.3%', '50%');
  barChart.bar(dataSet1);
  setupChartSettings(barChart);
  barChart.draw();

  var lineChart = anychart.lineChart();
  lineChart.title().text('Spline');
  lineChart.bounds(0, '50%', '33.3%', '50%');
  lineChart.line(dataSet1);
  setupChartSettings(lineChart);
  lineChart.draw();

  var scatterChart = anychart.cartesian.chart();
  scatterChart.title().text('Bubble');
  scatterChart.bounds('33.3%', '50%', '33.3%', '50%');
  scatterChart.bubble(dataSet1);
  setupChartSettings(scatterChart);
  scatterChart.draw();

  var rangeSplineAreaChart = anychart.areaChart();
  rangeSplineAreaChart.title().text('Range Spline-Area');
  rangeSplineAreaChart.bounds('66.6%', '50%', '33.3%', '50%');
  rangeSplineAreaChart.rangeSplineArea(dataSet2);
  setupChartSettings(rangeSplineAreaChart);
  rangeSplineAreaChart.draw();
});
