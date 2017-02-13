/**
 * @fileoverview anychart.modules.sparkline namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.sparkline');

goog.require('anychart.charts.Sparkline');
goog.require('anychart.core.sparkline.series.Area');
goog.require('anychart.core.sparkline.series.Column');
goog.require('anychart.core.sparkline.series.Line');
goog.require('anychart.core.sparkline.series.WinLoss');
goog.require('anychart.modules.base');


/**
 * Default sparkline chart.<br/>
 * @example
 * anychart.sparkline([1.3, 2, 1.4, 4, 2.3, 6])
 *   .container(stage).draw();
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Sparkline} Chart with defaults for marker series.
 */
anychart.sparkline = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Sparkline(opt_data, opt_csvSettings);

  chart.setupByVal(anychart.getFullTheme('sparkline'), true);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.SPARKLINE] = anychart.sparkline;

//exports
goog.exportSymbol('anychart.sparkline', anychart.sparkline);
