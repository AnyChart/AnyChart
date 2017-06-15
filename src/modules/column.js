/**
 * @fileoverview anychart.modules.column namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.column');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.core.drawers.RangeColumn');
goog.require('anychart.core.drawers.RangeStick');
goog.require('anychart.core.drawers.Stick');
goog.require('anychart.modules.base');


/**
 * Default column chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.column([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for column series.
 */
anychart.column = function(var_args) {
  var chart = new anychart.charts.Cartesian();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.COLUMN);
  chart.setType(anychart.enums.ChartTypes.COLUMN);

  chart.setupInternal(true, anychart.getFullTheme('column'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['column'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.COLUMN] = anychart.column;


/**
 * Default hilo chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.hilo([['p1', 2, 3], ['p2', 4, 8], ['p3', 6, 9]])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Hilo chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for hilo series.
 */
anychart.hilo = function(var_args) {
  var chart = new anychart.charts.Cartesian();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.HILO);
  chart.setType(anychart.enums.ChartTypes.HILO);

  chart.setupInternal(true, anychart.getFullTheme('column'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['hilo'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.HILO] = anychart.hilo;


//exports
goog.exportSymbol('anychart.column', anychart.column);
goog.exportSymbol('anychart.hilo', anychart.hilo);
