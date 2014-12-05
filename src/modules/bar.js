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

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.BAR);

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
