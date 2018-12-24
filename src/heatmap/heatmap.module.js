/**
 * @fileoverview anychart.heatmapModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.heatmapModule.entry');

goog.require('anychart.heatmapModule.Chart');


/**
 * Default heat map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.heatmapModule.Chart} Heat map chart with defaults.
 */
anychart.heatMap = function(opt_data, opt_csvSettings) {
  var chart = new anychart.heatmapModule.Chart(opt_data, opt_csvSettings);
  chart.setupColorScale(/** @type {Object|string} */ (chart.getThemeOption('colorScale')), chart.getScaleInstances());
  chart.setupAxes();
  chart.setupStateSettings();
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.HEAT_MAP] = anychart.heatMap;

//exports
goog.exportSymbol('anychart.heatMap', anychart.heatMap);
