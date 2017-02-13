/**
 * @fileoverview anychart.modules.pie3d namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.pie3d');

goog.require('anychart.charts.Pie');
goog.require('anychart.modules.base');


/**
 * Default 3D pie chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pie3d([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Pie} Default pie chart.
 */
anychart.pie3d = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Pie(opt_data, opt_csvSettings);
  chart.setupByVal(anychart.getFullTheme('pie3d'), true);
  chart.mode3d(true);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.PIE_3D] = anychart.pie3d;


//exports
goog.exportSymbol('anychart.pie3d', anychart.pie3d);
