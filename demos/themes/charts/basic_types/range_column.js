var rangeColumnChart_1 = function() {
  var chart = anychart.column();
  var data = ranges_data.mapAs(null, {x: ['month']});
  chart.rangeColumn(data);
  chart.crosshair(true);
  return chart;
};

var rangeColumnChart_2 = function() {
  var chart = anychart.column();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  var data = ranges_data.mapAs(null, {x: ['month']});
  chart.rangeColumn(data);
  return chart;
};

var rangeColumnChart_3 = function() {
  var chart = anychart.column();
  chart.title().enabled(true);
  chart.title().text('Sales of different products');
  var data = ranges_data.mapAs(null, {x: ['month']});
  var data_last = ranges_data_last.mapAs(null, {x: ['month']});
  chart.rangeColumn(data).name('This year');
  chart.rangeColumn(data_last).name('Last year');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var rangeColumnChart_4 = function() {
  var chart = anychart.column();
  var data = ranges_data.mapAs(null, {x: ['month']});
  var series = chart.rangeColumn(data);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function () {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="range_column_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="range_column_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="range_column_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="range_column_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = rangeColumnChart_1();
  chart1.container('range_column_1');
  chart1.draw();
  var chart2 = rangeColumnChart_2();
  chart2.container('range_column_2');
  chart2.draw();
  var chart3 = rangeColumnChart_3();
  chart3.container('range_column_3');
  chart3.draw();
  var chart4 = rangeColumnChart_4();
  chart4.container('range_column_4');
  chart4.draw();
});
