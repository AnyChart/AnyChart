anychart.onDocumentReady(function() {
  // create column chart
  chart = anychart.area();

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  chart.title('Range Area Chart Statistics');
  chart.legend(true);

  // create area series with passed data
  var ranges_data = anychart.data.set([
    {low: 39, high: 52, month: 'Jan', low1: 104, high1: 120, low2: 201, high2: 225},
    {low: 42, high: 62, month: 'Feb', low1: 114, high1: 122, low2: 223, high2: 256},
    {low: 41, high: 61, month: 'Mar', low1: 127, high1: 145, low2: 210, high2: 260},
    {low: 49, high: 75, month: 'Apr', low1: 135, high1: 140, low2: 245, high2: 251},
    {low: 57, high: 83, month: 'May', low1: 106, high1: 140, low2: 213, high2: 230},
    {low: 63, high: 84, month: 'June', low1: 119, high1: 127, low2: 235, high2: 257},
    {low: 53, high: 81, month: 'July', low1: 122, high1: 160, low2: 227, high2: 280},
    {low: 55, high: 92, month: 'Aug', low1: 115, high1: 135, low2: 230, high2: 243},
    {low: 69, high: 102, month: 'Sep', low1: 115, high1: 156, low2: 210, high2: 214},
    {low: 86, high: 137, month: 'Oct', low1: 154, high1: 170, low2: 240, high2: 274},
    {low: 86, high: 132, month: 'Nov', low1: 140, high1: 156, low2: 224, high2: 254},
    {low: 77, high: 125, month: 'Dec', low1: 135, high1: 171, low2: 249, high2: 290}
  ]);

  var data1 = ranges_data.mapAs(null, {x: ['month']});
  var series1 = chart.rangeArea(data1).name('Series1');

  var data2 = ranges_data.mapAs(null, {x: ['month'], high: ['high1'], low: ['low1']});
  var series2 = chart.rangeArea(data2).name('Series2');

  var data3 = ranges_data.mapAs(null, {x: ['month'], high: ['high2'], low: ['low2']});
  var series3 = chart.rangeArea(data3).name('Series3');

  var formatTemplate = 'Common Stats:\nCat Name: {%CategoryName}\nCat Y Range % Of Total: {%CategoryYRangePercentOfTotal}\n' +
      'Cat Y Range Sum: {%CategoryYRangeSum}\nCat Y Range Max: {%CategoryYRangeMax}\nCat Y Range Min: {%CategoryYRangeMin}\n' +
      'Cat Y Range Avg: {%CategoryYRangeAverage}\nCat Y Range Mode: {%CategoryYRangeMode}\nCat Y Range Median: {%CategoryYRangeMedian}\n\n' +
      '% Of Series: {%YPercentOfSeries}\n% Of Category: {%YPercentOfCategory}\n% Of Total: {%YPercentOfTotal}';

  chart.tooltip().displayMode('single');

  series1.tooltip().textFormatter(formatTemplate);
  series2.tooltip().textFormatter(formatTemplate);
  series3.tooltip().textFormatter(formatTemplate);

  for (var i = 0; i < 3; i++) {
    var series = chart.getSeries(i);
    log('<h3>' + series.name() + ' Stat</h3>', '');
    log(anychart.enums.Statistics.SERIES_Y_RANGE_MAX, series.getStat(anychart.enums.Statistics.SERIES_Y_RANGE_MAX));
    log(anychart.enums.Statistics.SERIES_Y_RANGE_MIN, series.getStat(anychart.enums.Statistics.SERIES_Y_RANGE_MIN));
    log(anychart.enums.Statistics.SERIES_Y_RANGE_SUM, series.getStat(anychart.enums.Statistics.SERIES_Y_RANGE_SUM));
    log(anychart.enums.Statistics.SERIES_Y_RANGE_AVERAGE, series.getStat(anychart.enums.Statistics.SERIES_Y_RANGE_AVERAGE));
    log(anychart.enums.Statistics.SERIES_Y_RANGE_MODE, series.getStat(anychart.enums.Statistics.SERIES_Y_RANGE_MODE));
    log(anychart.enums.Statistics.SERIES_Y_RANGE_MEDIAN, series.getStat(anychart.enums.Statistics.SERIES_Y_RANGE_MEDIAN));
    log(anychart.enums.Statistics.SERIES_POINTS_COUNT, series.getStat(anychart.enums.Statistics.SERIES_POINTS_COUNT));
  }

  log('<h3>Chart Stat</h3>', '');
  log(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_SUM, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_SUM));
  log(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MAX, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MAX));
  log(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MIN, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_RANGE_MIN));
  log(anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE));
  log(anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT, chart.getStat(anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT));
  log(anychart.enums.Statistics.DATA_PLOT_POINT_COUNT, chart.getStat(anychart.enums.Statistics.DATA_PLOT_POINT_COUNT));
  log(anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME));

  chart.draw();
});


function log(name, value) {
  var log = document.getElementById('log');
  log.innerHTML += name + ': <b>' + value + '</b><br/><br/>';
}


function round(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp || 0;
}

