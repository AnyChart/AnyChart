/**
 * @fileoverview anychart.vennModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.vennModule.entry');

goog.require('anychart.vennModule.Chart');


/**
 * Default pert chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data - Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.vennModule.Chart} Heat map chart with defaults.
 */
anychart.venn = function(opt_data, opt_csvSettings) {
  var chart = new anychart.vennModule.Chart(opt_data, opt_csvSettings);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.VENN] = anychart.venn;

//exports
goog.exportSymbol('anychart.venn', anychart.venn);
