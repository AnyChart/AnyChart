goog.provide('anychart.modules.bar');

goog.require('anychart.cartesian.Chart');
goog.require('anychart.cartesian.series.Bar');
goog.require('anychart.cartesian.series.RangeBar');
goog.require('anychart.modules.base');


/**
 * Default bar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.barChart([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.cartesian.Chart} Chart with defaults for bar series.
 */
anychart.barChart = function(var_args) {
  var chart = new anychart.cartesian.Chart(true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.bar(arguments[i]);
  }

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xScale().inverted(true);

  chart.xAxis();
  chart.yAxis();

  chart.grid(0);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075');

  chart.grid(1)
      .drawFirstLine(true)
      .drawLastLine(true)
      .layout(anychart.enums.Layout.HORIZONTAL)
      .evenFill('none')
      .oddFill('none');

  return chart;
};

//exports
goog.exportSymbol('anychart.barChart', anychart.barChart);//doc|ex
