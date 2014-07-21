goog.provide('anychart.modules.column');

goog.require('anychart');
goog.require('anychart.cartesian.Chart');
goog.require('anychart.cartesian.series.Column');
goog.require('anychart.cartesian.series.RangeColumn');


/**
 * Default column chart.
 * xAxis, yAxis, grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.columnChart = function(var_args) {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xAxis();
  chart.yAxis();

  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  return chart;
};

//exports
goog.exportSymbol('anychart.columnChart', anychart.columnChart);
