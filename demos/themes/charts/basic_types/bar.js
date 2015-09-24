var BarChart_1 = function() {
  var chart = anychart.bar();
  chart.bar(products_data);
  chart.crosshair(true);
  return chart;
};

var BarChart_2 = function() {
  var chart = anychart.bar();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Product names'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  chart.bar(products_data);
  return chart;
};

var BarChart_3 = function() {
  var chart = anychart.bar();
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  var seriesData_1 = categorized_small_data.mapAs({x: [0], value: [1]});
  var seriesData_2 = categorized_small_data.mapAs({x: [0], value: [2]});
  chart.bar(seriesData_1).name('Revenue');
  chart.bar(seriesData_2).name('Internet sales');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var BarChart_4 = function() {
  var chart = anychart.bar();
  var series = chart.bar(products_data);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="bar_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="bar_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="bar_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="bar_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = BarChart_1();
  chart1.container('bar_1');
  chart1.draw();
  var chart2 = BarChart_2();
  chart2.container('bar_2');
  chart2.draw();
  var chart3 = BarChart_3();
  chart3.container('bar_3');
  chart3.draw();
  var chart4 = BarChart_4();
  chart4.container('bar_4');
  chart4.draw();
});
