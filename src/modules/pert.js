/**
 * @fileoverview anychart.modules.pert namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.pert');

goog.require('anychart.charts.Pert');
goog.require('anychart.modules.base');


/**
 * Default pert chart.
 * @return {anychart.charts.Pert} Heat map chart with defaults.
 */
anychart.pert = function() {
  var chart = new anychart.charts.Pert();

  chart.setupByVal(anychart.getFullTheme('pert'), true);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.PERT] = anychart.pert;

//exports
goog.exportSymbol('anychart.pert', anychart.pert);
