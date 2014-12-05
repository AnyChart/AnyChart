goog.provide('anychart.modules.column');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Column');
goog.require('anychart.core.cartesian.series.RangeColumn');
goog.require('anychart.modules.base');


/**
 * Default column chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.column([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for column series.
 */
anychart.column = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.COLUMN);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.column(arguments[i]);
  }

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xAxis();
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


anychart.chartTypesMap[anychart.enums.ChartTypes.COLUMN] = anychart.column;


/**
 * Default column chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.column([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for column series.
 * @deprecated Use anychart.column() instead.
 */
anychart.columnChart = anychart.column;

//exports
goog.exportSymbol('anychart.column', anychart.column);
goog.exportSymbol('anychart.columnChart', anychart.columnChart);
