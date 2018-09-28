/**
 * @fileoverview anychart.modules.pie namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.pieModule.entry');

goog.require('anychart.core.entry');
goog.require('anychart.pieModule.Chart');


/**
 * Default pie chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pie([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.pieModule.Chart} Default pie chart.
 */
anychart.pie = function(opt_data, opt_csvSettings) {
  var chart = new anychart.pieModule.Chart(opt_data, opt_csvSettings);
  chart.setupStateSettings();
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.PIE] = anychart.pie;


/**
 * Default 3D pie chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pie3d([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.pieModule.Chart} Default pie chart.
 */
anychart.pie3d = function(opt_data, opt_csvSettings) {
  var chart = new anychart.pieModule.Chart(opt_data, opt_csvSettings);
  chart.addThemes('pie3d');
  chart.setupStateSettings();
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.PIE_3D] = anychart.pie3d;


//exports
goog.exportSymbol('anychart.pie', anychart.pie);
goog.exportSymbol('anychart.pie3d', anychart.pie3d);
