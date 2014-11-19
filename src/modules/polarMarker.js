goog.provide('anychart.modules.polarMarker');

goog.require('anychart');
goog.require('anychart.polar.Chart');
goog.require('anychart.polar.series.Marker');


/**
 * Default marker chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.markerChart([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.polar.Chart} Chart with defaults for marker series.
 */
anychart.polarMarkerChart = function(var_args) {
  var chart = new anychart.polar.Chart();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
  }

  chart.title().text('Chart Title');

  chart.xScale(anychart.scales.linear());

  chart.xAxis();
  chart.yAxis();

  chart.grid(0)
      .layout(anychart.enums.RadialGridLayout.CIRCUIT);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.1')
      .layout(anychart.enums.RadialGridLayout.CIRCUIT);

  chart.grid(1)
      .evenFill('none')
      .oddFill('none')
      .layout(anychart.enums.RadialGridLayout.RADIAL);

  return chart;
};

//exports
goog.exportSymbol('anychart.polarMarkerChart', anychart.polarMarkerChart);
