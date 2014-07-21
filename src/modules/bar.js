goog.provide('anychart.modules.bar');

goog.require('anychart');
goog.require('anychart.cartesian.Chart');
goog.require('anychart.cartesian.series.Bar');
goog.require('anychart.cartesian.series.RangeBar');


/**
 * Default bar chart.
 * xAxis, yAxis, grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.barChart = function(var_args) {
  var chart = new anychart.cartesian.Chart();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.bar(arguments[i]);
  }

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xScale().inverted(true);

  chart.xAxis().orientation('left');
  chart.yAxis().orientation('bottom');

  chart.grid()
      .direction(anychart.utils.Direction.VERTICAL).scale(/** @type {anychart.scales.Base} */ (chart.yScale()));

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.VERTICAL).scale(/** @type {anychart.scales.Base} */ (chart.yScale()));

  chart.grid()
      .drawFirstLine(true)
      .drawLastLine(true)
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.HORIZONTAL).scale(/** @type {anychart.scales.Base} */ (chart.xScale()));

  return chart;
};

//exports
goog.exportSymbol('anychart.barChart', anychart.barChart);
