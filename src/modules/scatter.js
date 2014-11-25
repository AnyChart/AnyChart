goog.provide('anychart.modules.scatter');
goog.require('anychart');
goog.require('anychart.scatter.Chart');
goog.require('anychart.scatter.series.Bubble');
goog.require('anychart.scatter.series.Line');
goog.require('anychart.scatter.series.Marker');


/**
 * Returns a scatter chart instance with initial settings (axes, grids, title).<br/>
 * By default creates marker series if arguments is set.
 * @example
 * anychart.scatterChart([20, 7, 10, 14])
 *    .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.scatter.Chart} Chart with defaults for scatter series.
 */
anychart.scatterChart = function(var_args) {
  var chart = new anychart.scatter.Chart();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
  }

  chart.title().text('Chart Title');

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
goog.exportSymbol('anychart.scatterChart', anychart.scatterChart);
