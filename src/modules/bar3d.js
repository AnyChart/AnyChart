/**
 * @fileoverview anychart.modules.bar3d namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.bar3d');

goog.require('anychart.charts.Cartesian3d');
goog.require('anychart.core.drawers.Column3d');
goog.require('anychart.modules.base');


/**
 * Default bar 3d chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bar3d([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.charts.Cartesian3d} Chart with defaults for bar series.
 */
anychart.bar3d = function(var_args) {
  var chart = new anychart.charts.Cartesian3d();

  chart.defaultSeriesType(anychart.enums.Cartesian3dSeriesType.BAR);
  chart.setType(anychart.enums.ChartTypes.BAR_3D);

  chart.setupByVal(anychart.getFullTheme('bar3d'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['bar'](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.BAR_3D] = anychart.bar3d;

//exports
goog.exportSymbol('anychart.bar3d', anychart.bar3d);
