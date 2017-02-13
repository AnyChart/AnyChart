/**
 * @fileoverview anychart.modules.verticalArea namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.verticalArea');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.RangeArea');
goog.require('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers.RangeStepArea');
goog.require('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers.StepArea');
goog.require('anychart.modules.base');


/**
 * Default vertical area chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Series data.
 * @return {anychart.charts.Cartesian} Chart with defaults for vertical area series.
 */
anychart.verticalArea = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.AREA);
  chart.setType(anychart.enums.ChartTypes.VERTICAL_AREA);

  chart.setupByVal(anychart.getFullTheme('verticalArea'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart[anychart.enums.CartesianSeriesType.AREA](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.VERTICAL_AREA] = anychart.verticalArea;

//exports
goog.exportSymbol('anychart.verticalArea', anychart.verticalArea);
