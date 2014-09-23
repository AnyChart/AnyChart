goog.provide('anychart.modules.bubble');

goog.require('anychart');
goog.require('anychart.cartesian.Chart');
goog.require('anychart.cartesian.series.Bubble');


/**
 * Default bubble chart.
 * xAxis, yAxis, grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bubble chart data.
 * @return {anychart.cartesian.Chart} Chart with defaults for bubble series.
 */
anychart.bubbleChart = function(var_args) {
  var chart = new anychart.cartesian.Chart();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.bubble(arguments[i]);
  }

  chart.title().text('Chart Title');

  chart.xScale(anychart.scales.linear());

  chart.xAxis();
  chart.yAxis();

  chart.grid(0)
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.1')
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.grid(1)
      .evenFill('none')
      .oddFill('none')
      .layout(anychart.enums.Layout.VERTICAL);

  return chart;
};

//exports
goog.exportSymbol('anychart.bubbleChart', anychart.bubbleChart);
