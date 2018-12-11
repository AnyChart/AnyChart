/**
 * @fileoverview anychart.waterfallModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.waterfallModule.entry');
goog.require('anychart.waterfallModule.Chart');
goog.require('anychart.waterfallModule.Drawer');


/**
 * Default waterfall chart.<br/>
 * <b>Note:</b> Contains predefined settings.
 * @example
 * anychart.waterfall()
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Waterfall chart data.
 * @return {anychart.waterfallModule.Chart} Chart with defaults for waterfall series.
 */
anychart.waterfall = function(var_args) {
  var chart = new anychart.waterfallModule.Chart();
  chart.setupAxes();
  chart.setupStateSettings();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['waterfall'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.WATERFALL] = anychart.waterfall;


//exports
goog.exportSymbol('anychart.waterfall', anychart.waterfall);
