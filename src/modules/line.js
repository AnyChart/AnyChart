goog.provide('anychart.modules.line');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Line');
goog.require('anychart.core.cartesian.series.Spline');
goog.require('anychart.core.cartesian.series.StepLine');
goog.require('anychart.modules.base');


/**
 * Default line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.line([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for line series.
 */
anychart.line = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.line(arguments[i]);
  }

  chart.title().text('Chart Title');

  chart.xAxis();
  chart.yAxis();

  chart.grid(0)
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.1')
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.grid(1)
      .evenFill('none')
      .oddFill('none')
      .layout(anychart.enums.Layout.VERTICAL);

  return chart;
};


/**
 * Default line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.line([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for line series.
 * @deprecated Use anychart.line() instead.
 */
anychart.lineChart = anychart.line;

//exports
goog.exportSymbol('anychart.line', anychart.line);
goog.exportSymbol('anychart.lineChart', anychart.lineChart);
