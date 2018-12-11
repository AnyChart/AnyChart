/**
 * @fileoverview anychart.paretoModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.paretoModule.entry');

goog.require('anychart.core.drawers.Column');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers.StepLine');
goog.require('anychart.paretoModule.Chart');


/**
 * Default line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.pareto([4, 2, 1, 3])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array)=} opt_data Pareto chart data.
 * @return {anychart.paretoModule.Chart} Chart with defaults for line series.
 */
anychart.pareto = function(opt_data) {
  anychart.performance.start('anychart.pareto()');
  var chart = new anychart.paretoModule.Chart();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.COLUMN);
  chart.setupAxes();
  chart.setupStateSettings();
  chart.data(opt_data);

  anychart.performance.end('anychart.pareto()');
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.PARETO] = anychart.pareto;

//exports
goog.exportSymbol('anychart.pareto', anychart.pareto);
