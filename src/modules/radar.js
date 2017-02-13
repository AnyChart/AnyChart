/**
 * @fileoverview anychart.modules.radar namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.radar');

goog.require('anychart.charts.Radar');
goog.require('anychart.core.radar.series.Area');
goog.require('anychart.core.radar.series.Line');
goog.require('anychart.core.radar.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default radar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.radar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.charts.Radar} Chart with defaults for line series.
 */
anychart.radar = function(var_args) {
  var chart = new anychart.charts.Radar();
  chart.setupByVal(anychart.getFullTheme('radar'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.line(arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.RADAR] = anychart.radar;

//exports
goog.exportSymbol('anychart.radar', anychart.radar);
