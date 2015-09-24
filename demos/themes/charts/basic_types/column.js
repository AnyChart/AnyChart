var ColumnChart_1 = function() {
  var chart = anychart.column();
  chart.column(products_data);
  return chart;
};

var ColumnChart_2 = function() {
  var chart = anychart.column();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  chart.column(products_data);
  return chart;
};

var ColumnChart_3 = function() {
  var chart = anychart.column();
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  var seriesData_1 = categorized_small_data.mapAs({x: [0], value: [1]});
  var seriesData_2 = categorized_small_data.mapAs({x: [0], value: [2]});
  chart.column(seriesData_1).name('Revenue');
  chart.column(seriesData_2).name('Internet sales');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var ColumnChart_4 = function() {
  var chart = anychart.column();
  var series = chart.column(products_data);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="column_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="column_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="column_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="column_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = ColumnChart_1();
  chart1.container('column_1');
  chart1.draw();
  var chart2 = ColumnChart_2();
  chart2.container('column_2');
  chart2.draw();
  var chart3 = ColumnChart_3();
  chart3.container('column_3');
  chart3.draw();
  var chart4 = ColumnChart_4();
  chart4.container('column_4');
  chart4.draw();
});
