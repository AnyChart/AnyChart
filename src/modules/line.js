/**
 * @fileoverview anychart.modules.line namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.line');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.JumpLine');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers.StepLine');
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
  anychart.performance.start('anychart.line()');
  var chart = new anychart.charts.Cartesian();
  var theme = anychart.getFullTheme('line');

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.LINE);
  chart.setType(anychart.enums.ChartTypes.LINE);

  chart.setupByVal(anychart.getFullTheme('line'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['line'](arguments[i]);
  }
  anychart.performance.end('anychart.line()');
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.LINE] = anychart.line;


//exports
goog.exportSymbol('anychart.line', anychart.line);
