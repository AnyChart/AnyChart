/**
 * @fileoverview anychart.modules.resource namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.resource');

goog.require('anychart.charts.Resource');
goog.require('anychart.modules.base');


/**
 * Returns new resource chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Resource}
 */
anychart.resource = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Resource(opt_data, opt_csvSettings);
  chart.setupByVal(anychart.getFullTheme('resource'), true);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.RESOURCE] = anychart.resource;


//exports
goog.exportSymbol('anychart.resource', anychart.resource);
