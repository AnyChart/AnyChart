/**
 * @fileoverview anychart.modules.funnel namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.funnel');

goog.require('anychart.charts.PyramidFunnel');
goog.require('anychart.modules.base');


/**
 * Default funnel chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.funnel([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.PyramidFunnel}
 */
anychart.funnel = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.PyramidFunnel(opt_data, opt_csvSettings);
  chart.setType(anychart.enums.ChartTypes.FUNNEL);
  chart.setupInternal(true, anychart.getFullTheme('funnel'));

  return chart;
};

anychart.chartTypesMap[anychart.enums.ChartTypes.FUNNEL] = anychart.funnel;

//exports
goog.exportSymbol('anychart.funnel', anychart.funnel);
