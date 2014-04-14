var areaChart, barChart;
function load() {
  var stage = acgraph.create('100%', '100%', 'container');
  var data1 = [];
  var data2 = [];
  var d1 = [], d2 = [];
  var t1, t2;
  var vals = [];
  for (var i = 0; i < 20; i++) {
    if (t1 = (Math.random() > 0)) {
      d1.push(i);
      data1.push([
        i,
        Math.round(Math.random() * 1000) + 10,
        Math.round(Math.random() * 1000) + 1000,
        Math.round(Math.random() * 1000) - 990,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    if (t2 = (Math.random() > 0.2)) {
      d2.push(i);
      data2.push([
        i,
        Math.round(Math.random() * 1000) + 10,
        Math.round(Math.random() * 1000) + 1000,
        Math.round(Math.random() * 1000) - 990,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    vals.push(i);
  }

  function drawChart(chart, seriesName) {
    chart.container(stage);
    var series1 = chart[seriesName](data2)
        .name('Worst ' + seriesName + ' EU');
    var series2 = chart[seriesName](data1)
        .name('Best ' + seriesName + ' EU');

    if (seriesName != 'marker') {
      series1.markers().type('triangleup').enabled(true).fill({color: series1.color(), opacity: 0.5});
      series2.markers().type('triangledown').enabled(true).fill({color: series2.color(), opacity: 0.5});
    }

    chart.background().fill('gray .5');
    chart.legend().enabled(true);
    chart.yAxis().orientation('left');
    chart.xAxis().orientation('bottom');
//    chart.axis().orientation('top');
//    chart.axis().orientation('right');

    if (seriesName == 'bubble') {
      series1.minimumSize(1);
      series1.maximumSize(20);
      series2.minimumSize(1);
      series2.maximumSize(20);
    }
  }

  areaChart = new anychart.cartesian.Chart();
  drawChart(areaChart, 'area');
  areaChart.bounds(0, 0, 500, 400);
  areaChart.draw();

  barChart = new anychart.cartesian.Chart();
  drawChart(barChart, 'bar');
  barChart.bounds(510, 0, 500, 400);
  barChart.draw();

  var bubbleChart = new anychart.cartesian.Chart();
  drawChart(bubbleChart, 'bubble');
  bubbleChart.bounds(0, 410, 500, 400);
  bubbleChart.draw();

  var candlestick = new anychart.cartesian.Chart();
  drawChart(candlestick, 'candlestick');
  candlestick.bounds(510, 410, 500, 400);
  candlestick.draw();

  var column = new anychart.cartesian.Chart();
  drawChart(column, 'column');
  column.bounds(0, 820, 500, 400);
  column.draw();

  var line = new anychart.cartesian.Chart();
  drawChart(line, 'line');
  line.bounds(510, 820, 500, 400);
  line.draw();

  var ohlc = new anychart.cartesian.Chart();
  drawChart(ohlc, 'ohlc');
  ohlc.bounds(0, 1230, 500, 400);
  ohlc.draw();

  var rangeArea = new anychart.cartesian.Chart();
  drawChart(rangeArea, 'rangeArea');
  rangeArea.bounds(510, 1230, 500, 400);
  rangeArea.draw();

  var rangeBar = new anychart.cartesian.Chart();
  drawChart(rangeBar, 'rangeBar');
  rangeBar.bounds(0, 1640, 500, 400);
  rangeBar.draw();

  var rangeColumn = new anychart.cartesian.Chart();
  drawChart(rangeColumn, 'rangeColumn');
  rangeColumn.bounds(510, 1640, 500, 400);
  rangeColumn.draw();

  var rangeSplineArea = new anychart.cartesian.Chart();
  drawChart(rangeSplineArea, 'rangeSplineArea');
  rangeSplineArea.bounds(0, 2050, 500, 400);
  rangeSplineArea.draw();

  var rangeStepLineArea = new anychart.cartesian.Chart();
  drawChart(rangeStepLineArea, 'rangeStepLineArea');
  rangeStepLineArea.bounds(510, 2050, 500, 400);
  rangeStepLineArea.draw();

  var spline = new anychart.cartesian.Chart();
  drawChart(spline, 'spline');
  spline.bounds(0, 2460, 500, 400);
  spline.draw();

  var splineArea = new anychart.cartesian.Chart();
  drawChart(splineArea, 'splineArea');
  splineArea.bounds(510, 2460, 500, 400);
  splineArea.draw();

  var stepLine = new anychart.cartesian.Chart();
  drawChart(stepLine, 'stepLine');
  stepLine.bounds(0, 2870, 500, 400);
  stepLine.draw();

  var stepLineArea = new anychart.cartesian.Chart();
  drawChart(stepLineArea, 'stepLineArea');
  stepLineArea.bounds(510, 2870, 500, 400);
  stepLineArea.draw();

  var markerChart = new anychart.cartesian.Chart();
  drawChart(markerChart, 'marker');
  markerChart.bounds(0, 3280, 500, 400);
  markerChart.draw();
}
