goog.provide('anychart.modules.finance');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Candlestick');
goog.require('anychart.core.cartesian.series.OHLC');
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

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.candlestick(arguments[i]);
  }

  chart.title().text('Chart Title').fontWeight('bold');
  var scale = new anychart.scales.DateTime();

  chart.xScale(scale);

  var axis = chart.xAxis();

  axis.labels()
      .textFormatter(function() {
        var date = new Date(this['tickValue']);
        var options = {year: 'numeric', month: 'short', day: 'numeric'};
        return date.toLocaleDateString('en-US', options);
      });

  chart.yAxis();

  chart.grid(0)
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.grid(1)
      .evenFill('none')
      .oddFill('none')
      .layout(anychart.enums.Layout.VERTICAL);

  return chart;
};


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
 * @deprecated Use anychart.financial() instead.
 */
anychart.financialChart = anychart.financial;

//exports
goog.exportSymbol('anychart.financial', anychart.financial);
goog.exportSymbol('anychart.financialChart', anychart.financialChart);
