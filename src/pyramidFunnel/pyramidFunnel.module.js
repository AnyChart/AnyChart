/**
 * @fileoverview anychart.pyramidFunnelModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.pyramidFunnelModule.entry');

goog.require('anychart.pyramidFunnelModule.Chart');


/**
 * Default funnel chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.funnel([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.pyramidFunnelModule.Chart}
 */
anychart.funnel = function(opt_data, opt_csvSettings) {
  var chart = new anychart.pyramidFunnelModule.Chart(opt_data, opt_csvSettings);
  chart.setType(anychart.enums.ChartTypes.FUNNEL);
  chart.setupInternal(true, anychart.getFullTheme('funnel'));

  return chart;
};

anychart.chartTypesMap[anychart.enums.ChartTypes.FUNNEL] = anychart.funnel;


/**
 * Default pyramid chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pyramid([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.pyramidFunnelModule.Chart}
 */
anychart.pyramid = function(opt_data, opt_csvSettings) {
  var chart = new anychart.pyramidFunnelModule.Chart(opt_data, opt_csvSettings);
  chart.setType(anychart.enums.ChartTypes.PYRAMID);
  chart.setupInternal(true, anychart.getFullTheme('pyramid'));

  return chart;
};

anychart.chartTypesMap[anychart.enums.ChartTypes.PYRAMID] = anychart.pyramid;

//exports
goog.exportSymbol('anychart.funnel', anychart.funnel);
goog.exportSymbol('anychart.pyramid', anychart.pyramid);
