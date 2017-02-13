/**
 * @fileoverview anychart.modules.pareto namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.pareto');

goog.require('anychart.charts.Pareto');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers.StepLine');
goog.require('anychart.modules.base');


/**
 * Default line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.pareto([4, 2, 1, 3])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array)=} opt_data Pareto chart data.
 * @return {anychart.charts.Pareto} Chart with defaults for line series.
 */
anychart.pareto = function(opt_data) {
  anychart.performance.start('anychart.pareto()');
  var chart = new anychart.charts.Pareto();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.COLUMN);
  chart.setType(anychart.enums.ChartTypes.PARETO);

  chart.setupByVal(anychart.getFullTheme('pareto'), true);
  chart.data(opt_data);

  anychart.performance.end('anychart.pareto()');
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.PARETO] = anychart.pareto;

//exports
goog.exportSymbol('anychart.pareto', anychart.pareto);
