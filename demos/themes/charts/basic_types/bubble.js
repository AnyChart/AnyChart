var BubbleChart_1 = function() {
  var chart = anychart.line();
  chart.bubble(sales_by_months_data_bubble);
  chart.minBubbleSize('10%').maxBubbleSize('35%');
  chart.rangeMarker().from(120000).to(180000);
  chart.lineMarker().value(250000);
  chart.textMarker().value(250000);
  chart.crosshair(true);
  return chart;
};

var BubbleChart_2 = function() {
  var chart = anychart.column();
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  chart.marker(sales_by_months_data_bubble);
  return chart;
};

var BubbleChart_3 = function() {
  var chart = anychart.area();
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  var seriesData_1 = sales_by_months_data_bubble_categorized.mapAs({x: [0], value: [1], size: [3]});
  var seriesData_2 = sales_by_months_data_bubble_categorized.mapAs({x: [0], value: [2], size: [4]});
  chart.bubble(seriesData_1).name('Revenue');
  chart.marker(seriesData_2).name('Internet sales');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var BubbleChart_4 = function() {
  var chart = anychart.line();
  var series = chart.bubble(sales_by_months_data_bubble);
  series.labels(true);
  series.markers(true);
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="bubble_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="bubble_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="bubble_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="bubble_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = BubbleChart_1();
  chart1.container('bubble_1');
  chart1.draw();
  var chart2 = BubbleChart_2();
  chart2.container('bubble_2');
  chart2.draw();
  var chart3 = BubbleChart_3();
  chart3.container('bubble_3');
  chart3.draw();
  var chart4 = BubbleChart_4();
  chart4.container('bubble_4');
  chart4.draw();
});
