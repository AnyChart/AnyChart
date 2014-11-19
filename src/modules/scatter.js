goog.provide('anychart.modules.scatter');
goog.require('anychart');
goog.require('anychart.scatter.Chart');
goog.require('anychart.scatter.series.Bubble');
goog.require('anychart.scatter.series.Line');
goog.require('anychart.scatter.series.Marker');


/**
 * Returns a scatter chart instance with initial settings (axes, no grids, title).<br/>
 * By default creates marker series if arguments is set.
 * @example
 * var chart = anychart.scatterChart([20, 7, 10, 14]);
 * chart.container('container').draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.scatter.Chart} Chart with defaults for marker series.
 */
anychart.scatterChart = function(var_args) {
  var chart = new anychart.scatter.Chart();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
  }

  chart.title().text('Chart Title');

  chart.xAxis();
  chart.yAxis();

  return chart;
};

//exports
goog.exportSymbol('anychart.scatterChart', anychart.scatterChart);
