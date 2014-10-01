goog.provide('anychart.modules.area');

goog.require('anychart');
goog.require('anychart.cartesian.Chart');
goog.require('anychart.cartesian.series.Area');
goog.require('anychart.cartesian.series.RangeArea');
goog.require('anychart.cartesian.series.RangeSplineArea');
goog.require('anychart.cartesian.series.RangeStepArea');
goog.require('anychart.cartesian.series.SplineArea');
goog.require('anychart.cartesian.series.StepArea');


/**
 * Default area chart.
 * xAxis, yAxis, grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.areaChart = function(var_args) {
  var chart = new anychart.cartesian.Chart();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.area(arguments[i]);
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

//exports
goog.exportSymbol('anychart.areaChart', anychart.areaChart);
