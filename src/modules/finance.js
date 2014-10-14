goog.provide('anychart.modules.finance');

goog.require('anychart');
goog.require('anychart.cartesian.Chart');
goog.require('anychart.cartesian.series.Candlestick');
goog.require('anychart.cartesian.series.OHLC');


/**
 * Default financial chart.
 * xAxis, yAxis, grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Finance chart data.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.financialChart = function(var_args) {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');
  var scale = new anychart.scales.DateTime();

  chart.xScale(scale);

  var axis = chart.xAxis();

  axis.labels()
      .textFormatter(function(value) {
        var date = new Date(value['tickValue']);
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

//exports
goog.exportSymbol('anychart.financialChart', anychart.financialChart);
