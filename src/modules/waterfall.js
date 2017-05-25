/**
 * @fileoverview anychart.modules.waterfall namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.waterfall');
goog.require('anychart.charts.Waterfall');
goog.require('anychart.core.drawers.Waterfall');
goog.require('anychart.modules.base');


/**
 * Default waterfall chart.<br/>
 * <b>Note:</b> Contains predefined settings.
 * @example
 * anychart.waterfall()
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Waterfall chart data.
 * @return {anychart.charts.Waterfall} Chart with defaults for waterfall series.
 */
anychart.waterfall = function(var_args) {
  var chart = new anychart.charts.Waterfall();

  chart.setupInternal(true, anychart.getFullTheme('waterfall'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['waterfall'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.WATERFALL] = anychart.waterfall;


//exports
goog.exportSymbol('anychart.waterfall', anychart.waterfall);
