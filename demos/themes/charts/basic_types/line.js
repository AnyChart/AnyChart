var LineChart_1 = function() {
  var chart = anychart.line();
  chart.line(sales_by_months_data);
  chart.crosshair(true);
  return chart;
};

var LineChart_2 = function() {
  var chart = anychart.line();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  chart.stepLine(sales_by_months_data);
  return chart;
};

var LineChart_3 = function() {
  var chart = anychart.line();
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  var seriesData_1 = sales_by_months_data_categorized.mapAs({x: [0], value: [1]});
  var seriesData_2 = sales_by_months_data_categorized.mapAs({x: [0], value: [2]});
  chart.spline(seriesData_1).name('Revenue');
  chart.spline(seriesData_2).name('Internet sales');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var LineChart_4 = function() {
  var chart = anychart.line();
  var series = chart.line(sales_in_quater);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="line_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="line_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="line_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="line_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = LineChart_1();
  chart1.container('line_1');
  chart1.draw();
  var chart2 = LineChart_2();
  chart2.container('line_2');
  chart2.draw();
  var chart3 = LineChart_3();
  chart3.container('line_3');
  chart3.draw();
  var chart4 = LineChart_4();
  chart4.container('line_4');
  chart4.draw();
});
