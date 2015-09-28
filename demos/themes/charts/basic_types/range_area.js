var rangeAreaChart_1 = function() {
  var chart = anychart.area();
  var data = ranges_data.mapAs(null, {x: ['month']});
  chart.rangeArea(data);
  chart.crosshair(true);
  return chart;
};

var rangeAreaChart_2 = function() {
  var chart = anychart.area();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  var data = ranges_data.mapAs(null, {x: ['month']});
  chart.rangeStepArea(data);
  return chart;
};

var rangeAreaChart_3 = function() {
  var chart = anychart.area();
  chart.title().enabled(true);
  chart.title().text('Sales of different products');
  var data = ranges_data.mapAs(null, {x: ['month']});
  var data_last = ranges_data_last.mapAs(null, {x: ['month']});
  chart.rangeSplineArea(data).name('This year');
  chart.rangeSplineArea(data_last).name('Last year');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var rangeAreaChart_4 = function() {
  var chart = anychart.area();
  var data = ranges_data.mapAs(null, {x: ['month']});
  var series = chart.rangeSplineArea(data);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function () {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="range_area_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="range_area_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="range_area_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="range_area_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = rangeAreaChart_1();
  chart1.container('range_area_1');
  chart1.draw();
  var chart2 = rangeAreaChart_2();
  chart2.container('range_area_2');
  chart2.draw();
  var chart3 = rangeAreaChart_3();
  chart3.container('range_area_3');
  chart3.draw();
  var chart4 = rangeAreaChart_4();
  chart4.container('range_area_4');
  chart4.draw();
});
