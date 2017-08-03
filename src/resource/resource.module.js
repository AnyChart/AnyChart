/**
 * @fileoverview anychart.resourceModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.resourceModule.entry');

goog.require('anychart.resourceModule.Chart');


/**
 * Returns new resource chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.resourceModule.Chart}
 */
anychart.resource = function(opt_data, opt_csvSettings) {
  var chart = new anychart.resourceModule.Chart(opt_data, opt_csvSettings);
  chart.setupInternal(true, anychart.getFullTheme('resource'));

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.RESOURCE] = anychart.resource;


//exports
goog.exportSymbol('anychart.resource', anychart.resource);
