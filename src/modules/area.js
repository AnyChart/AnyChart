/**
 * @fileoverview anychart.modules.area namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.area');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.RangeArea');
goog.require('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers.RangeStepArea');
goog.require('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers.StepArea');
goog.require('anychart.modules.base');


/**
 * Default area chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.area([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for area series.
 */
anychart.area = function(var_args) {
  var chart = new anychart.charts.Cartesian();
  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.AREA);
  chart.setType(anychart.enums.ChartTypes.AREA);

  chart.setupByVal(anychart.getFullTheme('area'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['area'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.AREA] = anychart.area;


//exports
goog.exportSymbol('anychart.area', anychart.area);
