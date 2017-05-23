/**
 * @fileoverview anychart.modules.tagCloud namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.tagCloud');

goog.require('anychart.charts.TagCloud');
goog.require('anychart.modules.base');


/**
 * Tag cloud.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings If CSV string is passed,
 *    you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.TagCloud} Map with defaults for choropleth series.
 */
anychart.tagCloud = function(opt_data, opt_settings) {
  var chart = new anychart.charts.TagCloud(opt_data, opt_settings);
  chart.setupInternal(true, anychart.getFullTheme('tagCloud'));

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.TAG_CLOUD] = anychart.tagCloud;

//exports
goog.exportSymbol('anychart.tagCloud', anychart.tagCloud);
