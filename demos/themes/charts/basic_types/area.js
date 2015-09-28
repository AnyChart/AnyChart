var AreaChart_1 = function() {
  var chart = anychart.area();
  chart.area(sales_by_months_data);
  chart.crosshair(true);
  chart.rangeMarker().from(120000).to(180000);
  chart.lineMarker().value(250000);
  chart.textMarker().value(250000);
  return chart;
};

var AreaChart_2 = function() {
  var chart = anychart.area();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  chart.stepArea(sales_by_months_data);
  return chart;
};

var AreaChart_3 = function() {
  var chart = anychart.area();
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  var seriesData_1 = sales_by_months_data_categorized.mapAs({x: [0], value: [1]});
  var seriesData_2 = sales_by_months_data_categorized.mapAs({x: [0], value: [2]});
  chart.splineArea(seriesData_1).name('Revenue');
  chart.splineArea(seriesData_2).name('Internet sales');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var AreaChart_4 = function() {
  var chart = anychart.area();
  var series = chart.area(sales_in_quater);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="area_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="area_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="area_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="area_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = AreaChart_1();
  chart1.container('area_1');
  chart1.draw();
  var chart2 = AreaChart_2();
  chart2.container('area_2');
  chart2.draw();
  var chart3 = AreaChart_3();
  chart3.container('area_3');
  chart3.draw();
  var chart4 = AreaChart_4();
  chart4.container('area_4');
  chart4.draw();
});
