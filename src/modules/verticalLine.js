/**
 * @fileoverview anychart.modules.verticalLine namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.verticalLine');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers.StepLine');
goog.require('anychart.modules.base');


/**
 * Default vertical line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Series data.
 * @return {anychart.charts.Cartesian} Chart with defaults for vertical line series.
 */
anychart.verticalLine = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.LINE);
  chart.setType(anychart.enums.ChartTypes.VERTICAL_LINE);

  chart.setupByVal(anychart.getFullTheme('verticalLine'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart[anychart.enums.CartesianSeriesType.LINE](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.VERTICAL_LINE] = anychart.verticalLine;

//exports
goog.exportSymbol('anychart.verticalLine', anychart.verticalLine);
