/**
 * @fileoverview anychart.modules.line namespace file.
 * @suppress {extraRequire}
 */

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
  var theme = anychart.getFullTheme();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.LINE);
  chart.setType(anychart.enums.ChartTypes.LINE);

  chart.setup(theme['line']);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.line(arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.LINE] = anychart.line;


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
goog.exportSymbol('anychart.cartesian.series.line', anychart.core.cartesian.series.line);//doc|ex
