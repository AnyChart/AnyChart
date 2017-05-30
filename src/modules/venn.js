/**
 * @fileoverview anychart.modules.venn namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.venn');

goog.require('anychart.charts.Venn');
goog.require('anychart.modules.base');


/**
 * Default pert chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data - Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Venn} Heat map chart with defaults.
 */
anychart.venn = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Venn(opt_data, opt_csvSettings);

  chart.setupInternal(true, anychart.getFullTheme('venn'));

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.VENN] = anychart.venn;

//exports
goog.exportSymbol('anychart.venn', anychart.venn);
