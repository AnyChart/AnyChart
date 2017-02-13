/**
 * @fileoverview anychart.modules.column namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.column');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.core.drawers.RangeColumn');
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
  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.COLUMN);
  chart.setType(anychart.enums.ChartTypes.COLUMN);

  chart.setupByVal(anychart.getFullTheme('column'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['column'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.COLUMN] = anychart.column;


//exports
goog.exportSymbol('anychart.column', anychart.column);
