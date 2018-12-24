/**
 * @fileoverview anychart.surfaceModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.surfaceModule.entry');

goog.require('anychart.surfaceModule.Chart');


/**
 * Default surface chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for surface chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings
 * @return {anychart.surfaceModule.Chart} Surface chart.
 */
anychart.surface = function(opt_data, opt_csvSettings) {
  var chart = new anychart.surfaceModule.Chart(opt_data, opt_csvSettings);
  chart.colorScale(/** @type {Object} */(chart.getThemeOption('colorScale')));
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.SURFACE] = anychart.surface;

//exports
goog.exportSymbol('anychart.surface', anychart.surface);
