goog.provide('anychart.modules.radar');

goog.require('anychart.charts.Radar');
goog.require('anychart.core.radar.series.Area');
goog.require('anychart.core.radar.series.Line');
goog.require('anychart.core.radar.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default line chart.
 * xAxis, yAxis, grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.charts.Radar} Chart with defaults for line series.
 */
anychart.radar = function(var_args) {
  var chart = new anychart.charts.Radar();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.line(arguments[i]);
  }

  chart.title().text('Chart Title');

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
goog.exportSymbol('anychart.radar', anychart.radar);
goog.exportSymbol('anychart.radarChart', anychart.radar);
