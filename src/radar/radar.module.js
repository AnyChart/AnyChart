/**
 * @fileoverview anychart.radarModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.radarModule.entry');

goog.require('anychart.radarModule.Chart');
// goog.require('anychart.core.radar.series.Area');
// goog.require('anychart.core.radar.series.Line');
// goog.require('anychart.core.radar.series.Marker');


/**
 * Default radar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.radar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.radarModule.Chart} Chart with defaults for line series.
 */
anychart.radar = function(var_args) {
  var chart = new anychart.radarModule.Chart();
  chart.setupStateSettings();
  chart.setupGrids();
  if (arguments.length)
    chart.addSeries.apply(chart, arguments);
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.RADAR] = anychart.radar;

//exports
goog.exportSymbol('anychart.radar', anychart.radar);
