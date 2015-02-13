goog.provide('anychart.modules.bubble');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Bubble');
goog.require('anychart.modules.base');


/**
 * Default bubble chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bubble([
 *      [1.3, 2, 1.3],
 *      [1.6, 1.5, 1.4],
 *      [1.9, 1.9, 1.1]
 *   ])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bubble chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for bubble series.
 */
anychart.bubble = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.BUBBLE);
  chart.setType(anychart.enums.ChartTypes.BUBBLE);

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


anychart.chartTypesMap[anychart.enums.ChartTypes.BUBBLE] = anychart.bubble;


/**
 * Default bubble chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bubble([
 *      [1.3, 2, 1.3],
 *      [1.6, 1.5, 1.4],
 *      [1.9, 1.9, 1.1]
 *   ])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bubble chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for bubble series.
 * @deprecated Use anychart.bubble() instead.
 */
anychart.bubbleChart = anychart.bubble;

//exports
goog.exportSymbol('anychart.bubble', anychart.bubble);//doc|ex
goog.exportSymbol('anychart.bubbleChart', anychart.bubbleChart);//doc|ex
