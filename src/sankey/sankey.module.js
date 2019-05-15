/**
 * @fileoverview anychart.sankeyModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.sankeyModule.entry');

goog.require('anychart.sankeyModule.Chart');


/**
 * Default sankey chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.sankeyModule.Chart} Sankey chart with defaults.
 */
anychart.sankey = function(opt_data, opt_csvSettings) {
  return new anychart.sankeyModule.Chart(opt_data, opt_csvSettings);
};
anychart.chartTypesMap[anychart.enums.ChartTypes.SANKEY] = anychart.sankey;

//exports
goog.exportSymbol('anychart.sankey', anychart.sankey);
