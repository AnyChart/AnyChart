/**
 * @fileoverview anychart.modules.pyramid namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.pyramid');

goog.require('anychart.charts.PyramidFunnel');
goog.require('anychart.modules.base');


/**
 * Default pyramid chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pyramid([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.PyramidFunnel}
 */
anychart.pyramid = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.PyramidFunnel(opt_data, opt_csvSettings);
  chart.setType(anychart.enums.ChartTypes.PYRAMID);
  chart.setupInternal(true, anychart.getFullTheme('pyramid'));

  return chart;
};

anychart.chartTypesMap[anychart.enums.ChartTypes.PYRAMID] = anychart.pyramid;

//exports
goog.exportSymbol('anychart.pyramid', anychart.pyramid);
