goog.provide('anychart.modules.polar');

goog.require('anychart.charts.Polar');
goog.require('anychart.core.polar.series.Area');
goog.require('anychart.core.polar.series.Line');
goog.require('anychart.core.polar.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default polar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Polar} Chart with defaults for marker series.
 */
anychart.polar = function(var_args) {
  var chart = new anychart.charts.Polar();

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
goog.exportSymbol('anychart.polar', anychart.polar);
goog.exportSymbol('anychart.polarChart', anychart.polar);
