/**
 * @fileoverview anychart.modules.column3d namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.column3d');

goog.require('anychart.charts.Cartesian3d');
goog.require('anychart.core.drawers.Column3d');
goog.require('anychart.modules.base');


/**
 * Default column 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.column3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Cartesian3d} Chart with defaults for column series.
 */
anychart.column3d = function(var_args) {
  var chart = new anychart.charts.Cartesian3d();
  chart.defaultSeriesType(anychart.enums.Cartesian3dSeriesType.COLUMN);
  chart.setType(anychart.enums.ChartTypes.COLUMN_3D);

  chart.setupByVal(anychart.getFullTheme('column3d'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['column'](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.COLUMN_3D] = anychart.column3d;

//exports
goog.exportSymbol('anychart.column3d', anychart.column3d);
