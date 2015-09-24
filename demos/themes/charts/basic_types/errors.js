var ErrorChart_1 = function() {
  var chart = anychart.bar();
  var series = chart.bar(average_client_age_data_by_regions);
  series.error(true);
  chart.crosshair(true);
  return chart;
};

var ErrorChart_2 = function() {
  var chart = anychart.line();
  var series = chart.line(average_client_age_data_by_regions);
  series.error(true);
  chart.crosshair(true);
  return chart;
};

var ErrorChart_3 = function() {
  var chart = anychart.column();
  var series_1 = chart.column(average_male_age_data_by_regions).name('Male');
  var series_2 = chart.column(average_female_age_data_by_regions).name('Female');
  series_1.error(true);
  series_2.error(true);
  chart.crosshair(true);

  chart.title().enabled(true);
  chart.title().text('Average age for ACME top clients, by regions');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var ErrorChart_4 = function() {
  var chart = anychart.area();
  var series = chart.area(average_client_age_data_by_regions);
  series.error(true);
  chart.crosshair(true);
  series.labels(true);
  series.markers(true);
  return chart;
};

var ErrorChart_5 = function() {
  var chart = anychart.line();
  var series = chart.marker(average_client_age_data_by_regions);
  series.error(true);
  chart.crosshair(true);
  return chart;
};

var ErrorChart_6 = function() {
  var data = anychart.data.set([
    [101.8871544450521, -80.75603982433677, 68, 47, 110, 48],
    [155.810951165855, 214.2723776474595, 81, 52, 56, 101],
    [203.250035367906, 3.05145130679011, 72, 34, 90, 96],
    [256.0341778919101, -120.86547581106424, 32, 36, 120, 103],
    [408.9005448967218, 94.85958395153284, 68, 52, 123, 99],
    [427.1872748956084, -203.48837719112635, 48, 102, 118, 94],

    [790.1034905686975, 578.32297029346228, 38, 42, 48, 74],
    [751.2865408137441, 489.1917199790478, 37, 29, 61, 58],
    [846.9176428839564, 423.6071574948728, 54, 32, 61, 93],
    [902.3598393574357, 560.46232794225216, 48.034, 52, 72, 98],
    [901.4813169538975, 321.57294746488333, 28, 29, 130, 42],
    [1023.732014581561, 224.7758020609617, 54, 23, 148, 94.6],
    [1124.1393811926246, 508.05048871412873, 63, 42, 132, 108],

    [1234.460888326168, -476.815727699548, 59, 71, 100.04, 18],
    [1236.66775120794773, -235.65700424462557, 37, 26, 59.7, 58],
    [1401.5943283513188, -123.7888190932572, 68, 29, 35, 28],
    [1441.3984118625522, -223.1356431134045, 38, 29, 118, 44],
    [1352.1733933240175, -497.88095516338944, 29.09, 27, 117, 91],
    [1474.0087166205049, -475.06017890200019, 34, 39, 103, 34],
    [1492.8169632852077, -268.41374530270696, 31, 49, 108.06, 52],
    [1592.577681608498, -267.3424177132547, 28, 26, 122, 38],
    [1590.6276988238096, -69.55818405747414, 61, 28, 121, 59],
    [1620.9351842403412, -469.9934994727373, 63, 29.09, 111, 61.09],
    [1810.7067560553551, -296.1982044093311, 59.08, 27.89, 119.76, 91]
  ]).mapAs({
    x: [0],
    value: [1],
    xLowerError: [2],
    xUpperError: [3],
    valueLowerError: [4],
    valueUpperError: [5]
  });
  var chart = anychart.scatter();
  var series = chart.marker(data);
  series.error(true);
  chart.crosshair(true);
  return chart;
};

anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="error_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="error_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="error_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="error_4"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="error_5"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="error_6"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = ErrorChart_1();
  chart1.container('error_1');
  chart1.draw();
  var chart2 = ErrorChart_2();
  chart2.container('error_2');
  chart2.draw();
  var chart3 = ErrorChart_3();
  chart3.container('error_3');
  chart3.draw();
  var chart4 = ErrorChart_4();
  chart4.container('error_4');
  chart4.draw();
  var chart5 = ErrorChart_5();
  chart5.container('error_5');
  chart5.draw();
  var chart6 = ErrorChart_6();
  chart6.container('error_6');
  chart6.draw();
});
