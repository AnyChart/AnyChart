/**
 * @fileoverview anychart.pertModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.pertModule.entry');

goog.require('anychart.pertModule.Chart');


/**
 * Default pert chart.
 * @return {anychart.pertModule.Chart} Heat map chart with defaults.
 */
anychart.pert = function() {
  var chart = new anychart.pertModule.Chart();

  chart.setupInternal(true, anychart.getFullTheme('pert'));

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.PERT] = anychart.pert;

//exports
goog.exportSymbol('anychart.pert', anychart.pert);
