goog.provide('anychart.modules.marker');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default marker chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.marker([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for marker series.
 */
anychart.marker = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
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


/**
 * Default marker chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.marker([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for marker series.
 * @deprecated Use anychart.marker() instead.
 */
anychart.markerChart = anychart.marker;

//exports
goog.exportSymbol('anychart.marker', anychart.marker);
goog.exportSymbol('anychart.markerChart', anychart.markerChart);
