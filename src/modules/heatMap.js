/**
 * @fileoverview anychart.modules.heatMap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.heatMap');

goog.require('anychart.charts.HeatMap');
goog.require('anychart.modules.base');


/**
 * Default heat map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.HeatMap} Heat map chart with defaults.
 */
anychart.heatMap = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.HeatMap(opt_data, opt_csvSettings);

  chart.setupByVal(anychart.getFullTheme('heatMap'), true);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.HEAT_MAP] = anychart.heatMap;

//exports
goog.exportSymbol('anychart.heatMap', anychart.heatMap);
