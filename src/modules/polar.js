goog.provide('anychart.modules.polar');

goog.require('anychart.charts.Polar');
goog.require('anychart.core.polar.series.Area');
goog.require('anychart.core.polar.series.Line');
goog.require('anychart.core.polar.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default polar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.polar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Polar} Chart with defaults for marker series.
 */
anychart.polar = function(var_args) {
  var chart = new anychart.charts.Polar();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.marker(arguments[i]);
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


anychart.chartTypesMap[anychart.enums.ChartTypes.POLAR] = anychart.polar;

//exports
goog.exportSymbol('anychart.polar', anychart.polar);
goog.exportSymbol('anychart.polarChart', anychart.polar);
