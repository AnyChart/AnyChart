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

  chart.xAxis().stroke('#C0C0C0');
  chart.xAxis().ticks().stroke('#333333');
  chart.xAxis().labels().fontFamily('Tahoma').fontSize('11');


  chart.yAxis().stroke('#333333');

  chart.grid(0)
      .stroke('#C0C0C0')
      .oddFill('white')
      .evenFill('Rgb(250,250,250)')
      .layout(anychart.enums.RadialGridLayout.CIRCUIT);

  chart.minorGrid()
      .enabled(false)
      .evenFill('none')
      .oddFill('none')
      .stroke('#333333')
      .layout(anychart.enums.RadialGridLayout.CIRCUIT);

  chart.grid(1)
      .stroke('#DDDDDD')
      .oddFill('none')
      .evenFill('none')
      .layout(anychart.enums.RadialGridLayout.RADIAL);

  chart.background().fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);

  return chart;
};

//exports
goog.exportSymbol('anychart.radar', anychart.radar);
goog.exportSymbol('anychart.radarChart', anychart.radar);
