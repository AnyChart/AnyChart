/**
 * @fileoverview anychart.modules.bar namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.bar');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Bar');
goog.require('anychart.core.cartesian.series.RangeBar');
goog.require('anychart.modules.base');


/**
 * Default bar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for bar series.
 */
anychart.bar = function(var_args) {
  var chart = new anychart.charts.Cartesian(true);
  var theme = anychart.getFullTheme();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.BAR);
  chart.setType(anychart.enums.ChartTypes.BAR);

  chart.setup(theme['bar']);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.bar(arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.BAR] = anychart.bar;


/**
 * Default bar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for bar series.
 * @deprecated Use anychart.bar() instead.
 */
anychart.barChart = anychart.bar;

//exports
goog.exportSymbol('anychart.bar', anychart.bar);//doc|ex
goog.exportSymbol('anychart.barChart', anychart.barChart);//doc|ex
