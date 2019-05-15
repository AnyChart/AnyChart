/**
 * @fileoverview anychart.sparklineModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.sparklineModule.entry');

goog.require('anychart.sparklineModule.Chart');
goog.require('anychart.sparklineModule.series.Area');
goog.require('anychart.sparklineModule.series.Column');
goog.require('anychart.sparklineModule.series.Line');
goog.require('anychart.sparklineModule.series.WinLoss');


/**
 * Default sparkline chart.<br/>
 * @example
 * anychart.sparkline([1.3, 2, 1.4, 4, 2.3, 6])
 *   .container(stage).draw();
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.sparklineModule.Chart} Chart with defaults for marker series.
 */
anychart.sparkline = function(opt_data, opt_csvSettings) {
  var chart = new anychart.sparklineModule.Chart(opt_data, opt_csvSettings);
  chart.setupElements();

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.SPARKLINE] = anychart.sparkline;

//exports
goog.exportSymbol('anychart.sparkline', anychart.sparkline);
