/**
 * @fileoverview anychart.modules.pie namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.pie');

goog.require('anychart.charts.Pie');
goog.require('anychart.modules.base');


/**
 * Default pie chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pie([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Pie} Default pie chart.
 */
anychart.pie = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Pie(opt_data, opt_csvSettings);
  chart.setupByVal(anychart.getFullTheme('pie'), true);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.PIE] = anychart.pie;


//exports
goog.exportSymbol('anychart.pie', anychart.pie);
