/**
 * @fileoverview anychart.modules.polar namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.polar');

goog.require('anychart.charts.Polar');
goog.require('anychart.core.polar.series.Area');
goog.require('anychart.core.polar.series.Line');
goog.require('anychart.core.polar.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default polar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.polar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Polar} Chart with defaults for marker series.
 */
anychart.polar = function(var_args) {
  var chart = new anychart.charts.Polar();
  chart.setupByVal(anychart.getFullTheme('polar'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.POLAR] = anychart.polar;

//exports
goog.exportSymbol('anychart.polar', anychart.polar);
