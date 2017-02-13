/**
 * @fileoverview anychart.modules.finance namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.finance');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Candlestick');
goog.require('anychart.core.drawers.OHLC');
goog.require('anychart.modules.base');


/**
 * Default financial chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * var chart = anychart.financial();
 * chart.ohlc([
 *    [Date.UTC(2013, 07, 04), 511.53, 514.98, 505.79, 506.40],
 *    [Date.UTC(2013, 07, 05), 507.84, 513.30, 507.23, 512.88],
 *    [Date.UTC(2013, 07, 06), 512.36, 515.40, 510.58, 511.40],
 *    [Date.UTC(2013, 07, 07), 513.10, 516.50, 511.47, 515.25],
 *    [Date.UTC(2013, 07, 08), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Finance chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for ohlc and candlestick series.
 */
anychart.financial = function(var_args) {
  var chart = new anychart.charts.Cartesian();
  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.CANDLESTICK);
  chart.setType(anychart.enums.ChartTypes.FINANCIAL);

  chart.setupByVal(anychart.getFullTheme('financial'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['candlestick'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.FINANCIAL] = anychart.financial;


//exports
goog.exportSymbol('anychart.financial', anychart.financial);
