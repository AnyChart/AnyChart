var createSparklineLineChart = function(name, range_markers, labels) {
  var data = table_data[name];
  var chart = anychart.sparkline(data['profitTrend']);
  chart.type('line');
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

var SparklineLineChart_1 = function() {
  var table = anychart.ui.table();
  table.getCol(0).width(100);

  table.contents([
    ['Alabama', createSparklineLineChart('Alabama')],
    ['Alaska', createSparklineLineChart('Alaska')],
    ['Arizona', createSparklineLineChart('Arizona')],
    ['Idaho', createSparklineLineChart('Idaho')],
    ['Illinois', createSparklineLineChart('Illinois')],
    ['Indiana', createSparklineLineChart('Indiana')],
    ['Ohio', createSparklineLineChart('Ohio')],
    ['Oklahoma', createSparklineLineChart('Oklahoma')],
    ['Oregon', createSparklineLineChart('Oregon')],
    ['Vermont', createSparklineLineChart('Vermont')],
    ['Virginia', createSparklineLineChart('Virginia')],
    ['Washington', createSparklineLineChart('Washington')]

  ]);
  return table;
};

var SparklineLineChart_2 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineLineChart('Alabama', true)],
    ['Alaska', createSparklineLineChart('Alaska', true)],
    ['Arizona', createSparklineLineChart('Arizona', true)],
    ['Idaho', createSparklineLineChart('Idaho', true)],
    ['Illinois', createSparklineLineChart('Illinois', true)],
    ['Indiana', createSparklineLineChart('Indiana', true)],
    ['Ohio', createSparklineLineChart('Ohio', true)],
    ['Oklahoma', createSparklineLineChart('Oklahoma', true)],
    ['Oregon', createSparklineLineChart('Oregon', true)],
    ['Vermont', createSparklineLineChart('Vermont', true)],
    ['Virginia', createSparklineLineChart('Virginia', true)],
    ['Washington', createSparklineLineChart('Washington', true)]
  ]);
  return table;
};

var SparklineLineChart_3 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineLineChart('Alabama', false, true)],
    ['Alaska', createSparklineLineChart('Alaska', false, true)],
    ['Arizona', createSparklineLineChart('Arizona', false, true)],
    ['Idaho', createSparklineLineChart('Idaho', false, true)],
    ['Illinois', createSparklineLineChart('Illinois', false, true)],
    ['Indiana', createSparklineLineChart('Indiana', false, true)],
    ['Ohio', createSparklineLineChart('Ohio', false, true)],
    ['Oklahoma', createSparklineLineChart('Oklahoma', false, true)],
    ['Oregon', createSparklineLineChart('Oregon', false, true)],
    ['Vermont', createSparklineLineChart('Vermont', false, true)],
    ['Virginia', createSparklineLineChart('Virginia', false, true)],
    ['Washington', createSparklineLineChart('Washington', false, true)]
  ]);
  return table;
};

anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="sparkline_line_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="sparkline_line_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="sparkline_line_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = SparklineLineChart_1();
  chart1.container('sparkline_line_1');
  chart1.draw();
  var chart2 = SparklineLineChart_2();
  chart2.container('sparkline_line_2');
  chart2.draw();
  var chart3 = SparklineLineChart_3();
  chart3.container('sparkline_line_3');
  chart3.draw();
});
