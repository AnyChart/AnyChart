var createSparklineAreaChart = function(name, range_markers, labels) {
  var data = table_data[name];
  var chart = anychart.sparkline(data['profitTrend']);
  chart.type('area');
  chart.xScale('linear');
  if (range_markers) {
    chart.rangeMarker().scale(chart.yScale()).from(0).to(3.5);
    chart.firstMarkers(true);
    chart.lastMarkers(true);
    chart.maxMarkers(true);
    chart.minMarkers(true);
    chart.negativeMarkers(true);
  }
  if (labels) {
    chart.firstMarkers(true);
    chart.lastMarkers(true);
    chart.maxMarkers(true);
    chart.minMarkers(true);
    chart.negativeMarkers(true);
    chart.firstLabels(true);
    chart.lastLabels(true);
    chart.maxLabels(true);
    chart.minLabels(true);
    chart.negativeLabels(true);
  }
  return chart;
};

var SparklineAreaChart_1 = function() {
  var table = anychart.ui.table();
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineAreaChart('Alabama')],
    ['Alaska', createSparklineAreaChart('Alaska')],
    ['Arizona', createSparklineAreaChart('Arizona')],
    ['Idaho', createSparklineAreaChart('Idaho')],
    ['Illinois', createSparklineAreaChart('Illinois')],
    ['Indiana', createSparklineAreaChart('Indiana')],
    ['Ohio', createSparklineAreaChart('Ohio')],
    ['Oklahoma', createSparklineAreaChart('Oklahoma')],
    ['Oregon', createSparklineAreaChart('Oregon')],
    ['Vermont', createSparklineAreaChart('Vermont')],
    ['Virginia', createSparklineAreaChart('Virginia')],
    ['Washington', createSparklineAreaChart('Washington')]

  ]);
  return table;
};

var SparklineAreaChart_2 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineAreaChart('Alabama', true)],
    ['Alaska', createSparklineAreaChart('Alaska', true)],
    ['Arizona', createSparklineAreaChart('Arizona', true)],
    ['Idaho', createSparklineAreaChart('Idaho', true)],
    ['Illinois', createSparklineAreaChart('Illinois', true)],
    ['Indiana', createSparklineAreaChart('Indiana', true)],
    ['Ohio', createSparklineAreaChart('Ohio', true)],
    ['Oklahoma', createSparklineAreaChart('Oklahoma', true)],
    ['Oregon', createSparklineAreaChart('Oregon', true)],
    ['Vermont', createSparklineAreaChart('Vermont', true)],
    ['Virginia', createSparklineAreaChart('Virginia', true)],
    ['Washington', createSparklineAreaChart('Washington', true)]
  ]);
  return table;
};

var SparklineAreaChart_3 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineAreaChart('Alabama', false, true)],
    ['Alaska', createSparklineAreaChart('Alaska', false, true)],
    ['Arizona', createSparklineAreaChart('Arizona', false, true)],
    ['Idaho', createSparklineAreaChart('Idaho', false, true)],
    ['Illinois', createSparklineAreaChart('Illinois', false, true)],
    ['Indiana', createSparklineAreaChart('Indiana', false, true)],
    ['Ohio', createSparklineAreaChart('Ohio', false, true)],
    ['Oklahoma', createSparklineAreaChart('Oklahoma', false, true)],
    ['Oregon', createSparklineAreaChart('Oregon', false, true)],
    ['Vermont', createSparklineAreaChart('Vermont', false, true)],
    ['Virginia', createSparklineAreaChart('Virginia', false, true)],
    ['Washington', createSparklineAreaChart('Washington', false, true)]
  ]);
  return table;
};

anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="sparkline_area_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="sparkline_area_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="sparkline_area_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = SparklineAreaChart_1();
  chart1.container('sparkline_area_1');
  chart1.draw();
  var chart2 = SparklineAreaChart_2();
  chart2.container('sparkline_area_2');
  chart2.draw();
  var chart3 = SparklineAreaChart_3();
  chart3.container('sparkline_area_3');
  chart3.draw();
});
