var createSparklineColumnChart = function(name, range_markers, labels) {
  var data = table_data[name];
  var chart = anychart.sparkline(data['profitTrend']);
  chart.type('column');
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

var SparklineColumnChart_1 = function() {
  var table = anychart.ui.table();
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineColumnChart('Alabama')],
    ['Alaska', createSparklineColumnChart('Alaska')],
    ['Arizona', createSparklineColumnChart('Arizona')],
    ['Idaho', createSparklineColumnChart('Idaho')],
    ['Illinois', createSparklineColumnChart('Illinois')],
    ['Indiana', createSparklineColumnChart('Indiana')],
    ['Ohio', createSparklineColumnChart('Ohio')],
    ['Oklahoma', createSparklineColumnChart('Oklahoma')],
    ['Oregon', createSparklineColumnChart('Oregon')],
    ['Vermont', createSparklineColumnChart('Vermont')],
    ['Virginia', createSparklineColumnChart('Virginia')],
    ['Washington', createSparklineColumnChart('Washington')]

  ]);
  return table;
};

var SparklineColumnChart_2 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineColumnChart('Alabama', true)],
    ['Alaska', createSparklineColumnChart('Alaska', true)],
    ['Arizona', createSparklineColumnChart('Arizona', true)],
    ['Idaho', createSparklineColumnChart('Idaho', true)],
    ['Illinois', createSparklineColumnChart('Illinois', true)],
    ['Indiana', createSparklineColumnChart('Indiana', true)],
    ['Ohio', createSparklineColumnChart('Ohio', true)],
    ['Oklahoma', createSparklineColumnChart('Oklahoma', true)],
    ['Oregon', createSparklineColumnChart('Oregon', true)],
    ['Vermont', createSparklineColumnChart('Vermont', true)],
    ['Virginia', createSparklineColumnChart('Virginia', true)],
    ['Washington', createSparklineColumnChart('Washington', true)]
  ]);
  return table;
};

var SparklineColumnChart_3 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['Alabama', createSparklineColumnChart('Alabama', false, true)],
    ['Alaska', createSparklineColumnChart('Alaska', false, true)],
    ['Arizona', createSparklineColumnChart('Arizona', false, true)],
    ['Idaho', createSparklineColumnChart('Idaho', false, true)],
    ['Illinois', createSparklineColumnChart('Illinois', false, true)],
    ['Indiana', createSparklineColumnChart('Indiana', false, true)],
    ['Ohio', createSparklineColumnChart('Ohio', false, true)],
    ['Oklahoma', createSparklineColumnChart('Oklahoma', false, true)],
    ['Oregon', createSparklineColumnChart('Oregon', false, true)],
    ['Vermont', createSparklineColumnChart('Vermont', false, true)],
    ['Virginia', createSparklineColumnChart('Virginia', false, true)],
    ['Washington', createSparklineColumnChart('Washington', false, true)]
  ]);
  return table;
};

anychart.onDocumentReady(function () {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="sparkline_column_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="sparkline_column_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="sparkline_column_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = SparklineColumnChart_1();
  chart1.container('sparkline_column_1');
  chart1.draw();
  var chart2 = SparklineColumnChart_2();
  chart2.container('sparkline_column_2');
  chart2.draw();
  var chart3 = SparklineColumnChart_3();
  chart3.container('sparkline_column_3');
  chart3.draw();
});
