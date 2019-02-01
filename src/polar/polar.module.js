/**
 * @fileoverview anychart.polarModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.polarModule.entry');

goog.require('anychart.polarModule.Chart');


/**
 * Default polar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.polar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.polarModule.Chart} Chart with defaults for marker series.
 */
anychart.polar = function(var_args) {
  var chart = new anychart.polarModule.Chart();
  chart.setupStateSettings();
  chart.setupGrids();
  if (arguments.length)
    chart.addSeries.apply(chart, arguments);
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.POLAR] = anychart.polar;

//exports
goog.exportSymbol('anychart.polar', anychart.polar);
