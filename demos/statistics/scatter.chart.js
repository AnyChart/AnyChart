
anychart.onDocumentReady(function() {
  chart = anychart.scatterChart();

  chart.xScale().minimum(1).maximum(6).ticks().interval(1);
  chart.yScale().minimum(40).maximum(100).ticks().interval(10);

  chart.xAxis().drawFirstLabel(false).drawLastLabel(false);

  chart.grid(0);
  chart.grid(1).layout('vertical');

  chart.tooltip().displayMode('union');

  var marker = chart.marker([
    [4.4, 78],
    [3.9, 74],
    [4, 68],
    [3.5, 80],
    [4.1, 84],
    [2.3, 50],
    [4.7, 93],
    [1.7, 55],
    [4.9, 76],
    [4.6, 74],
    [3.7, 79],
    [3.8, 60],
    [3.4, 86],
    [2.3, 67],
    [4.4, 81],
    [4.1, 76],
    [4.3, 83],
    [3.3, 76],
    [2, 55],
    [4.3, 73],
    [2.9, 56],
    [1.9, 57],
    [3.6, 71],
    [3.7, 72],
    [4.6, 80],
    [2.9, 78],
    [4, 78],
    [2.2, 51],
    [5.1, 81],
    [1.9, 52],
    [5, 76],
    [4.4, 73],
    [4.5, 84],
    [4.7, 84],
    [2, 51],
    [5.1, 81],
    [4.3, 83],
    [4.8, 84],
    [3, 72],
    [2.1, 54],
    [2.1, 61],
    [4.2, 81],
    [2.1, 48],
    [5.2, 84],
    [2, 63]
  ]).type('triangleup').size(4).hoverSize(7).hoverFill('gold').hoverStroke(anychart.color.darken('gold'));
  //marker.tooltip().hAlign('start');
  //marker.tooltip().textFormatter(function() {
  //
  //  return 'Waiting time: ' + this['value'] + ' min.\nDuration: ' + this['x'] + ' min.';
  //});

  var line = chart.line([
    [1.7, 51],
    [3, 64],
    [4, 64],
    [5.2, 88]
  ]).markers(true).hoverStroke(function() {
    return this['sourceColor'];
  });

  marker.name('Marker Series');
  line.name('Line Series');

  chart.tooltip().textFormatter(function() {
    var result = '';

    for (var i = 0; i < this.points.length; i++) {
      var pointContextProvider = this.points[i];
      var index = pointContextProvider.index;
      var series = pointContextProvider.series;
      var pointWrapper = series.getPoint(index);

      result += 'Series Name: ' + series.name() + '\n';
      result += 'X: ' + pointContextProvider['x'] + '\n';
      result += 'Value: ' + pointContextProvider['value'] + '\n';
      result += 'X % Of Series: ' + round(pointWrapper.getStat(anychart.enums.Statistics.X_PERCENT_OF_SERIES), 2) + '%\n';
      result += 'Y % Of Series: ' + round(pointWrapper.getStat(anychart.enums.Statistics.Y_PERCENT_OF_SERIES), 2) + '%\n';
      result += 'X % Of Total: ' + round(pointWrapper.getStat(anychart.enums.Statistics.X_PERCENT_OF_TOTAL), 2) + '%\n';
      result += 'Y % Of Total: ' + round(pointWrapper.getStat(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL), 2) + '%\n';

      result += '\n';
    }
    return result;
  });


  for (var i = 0; i < 2; i++) {
    series = chart.getSeries(i);
    log('<h3>' + series.name() + ' Stat</h3>', '');
    log(anychart.enums.Statistics.SERIES_X_MAX, series.getStat(anychart.enums.Statistics.SERIES_X_MAX));
    log(anychart.enums.Statistics.SERIES_Y_MAX, series.getStat(anychart.enums.Statistics.SERIES_Y_MAX));
    log(anychart.enums.Statistics.SERIES_X_MIN, series.getStat(anychart.enums.Statistics.SERIES_X_MIN));
    log(anychart.enums.Statistics.SERIES_Y_MIN, series.getStat(anychart.enums.Statistics.SERIES_Y_MIN));
    log(anychart.enums.Statistics.SERIES_X_SUM, series.getStat(anychart.enums.Statistics.SERIES_X_SUM));
    log(anychart.enums.Statistics.SERIES_Y_SUM, series.getStat(anychart.enums.Statistics.SERIES_Y_SUM));
    log(anychart.enums.Statistics.SERIES_X_AVERAGE, series.getStat(anychart.enums.Statistics.SERIES_X_AVERAGE));
    log(anychart.enums.Statistics.SERIES_Y_AVERAGE, series.getStat(anychart.enums.Statistics.SERIES_Y_AVERAGE));
    log(anychart.enums.Statistics.SERIES_X_MODE, series.getStat(anychart.enums.Statistics.SERIES_X_MODE));
    log(anychart.enums.Statistics.SERIES_Y_MODE, series.getStat(anychart.enums.Statistics.SERIES_Y_MODE));
    log(anychart.enums.Statistics.SERIES_X_MEDIAN, series.getStat(anychart.enums.Statistics.SERIES_X_MEDIAN));
    log(anychart.enums.Statistics.SERIES_Y_MEDIAN, series.getStat(anychart.enums.Statistics.SERIES_Y_MEDIAN));
    log(anychart.enums.Statistics.SERIES_POINTS_COUNT, series.getStat(anychart.enums.Statistics.SERIES_POINTS_COUNT));
  }

  log('<h3>Chart Stat</h3>', '');
  log(anychart.enums.Statistics.DATA_PLOT_X_SUM, chart.getStat(anychart.enums.Statistics.DATA_PLOT_X_SUM));
  log(anychart.enums.Statistics.DATA_PLOT_Y_SUM, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_SUM));
  log(anychart.enums.Statistics.DATA_PLOT_X_MAX, chart.getStat(anychart.enums.Statistics.DATA_PLOT_X_MAX));
  log(anychart.enums.Statistics.DATA_PLOT_Y_MAX, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_MAX));
  log(anychart.enums.Statistics.DATA_PLOT_X_MIN, chart.getStat(anychart.enums.Statistics.DATA_PLOT_X_MIN));
  log(anychart.enums.Statistics.DATA_PLOT_Y_MIN, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_MIN));
  log(anychart.enums.Statistics.DATA_PLOT_X_AVERAGE, chart.getStat(anychart.enums.Statistics.DATA_PLOT_X_AVERAGE));
  log(anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE, chart.getStat(anychart.enums.Statistics.DATA_PLOT_Y_AVERAGE));
  log(anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT, chart.getStat(anychart.enums.Statistics.DATA_PLOT_SERIES_COUNT));
  log(anychart.enums.Statistics.DATA_PLOT_POINT_COUNT, chart.getStat(anychart.enums.Statistics.DATA_PLOT_POINT_COUNT));
  log(anychart.enums.Statistics.DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MAX_X_VALUE_POINT_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MIN_X_VALUE_POINT_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MAX_X_SUM_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MAX_X_SUM_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MIN_X_SUM_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MIN_X_SUM_SERIES_NAME));
  log(anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME, chart.getStat(anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME));


  chart.container('container').draw();
});

function log(name, value) {
  var log = document.getElementById('log');
  log.innerHTML += name + ': <b>' + value + '</b><br/><br/>';
}


function round(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp || 0;
}

