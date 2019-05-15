/**
 * @fileoverview anychart.timelineModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.timelineModule.entry');

goog.require('anychart.timelineModule.Chart');


/**
 * Timeline chart constructor function.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args - Timeline chart data.
 * @return {anychart.timelineModule.Chart} Timeline chart instance.
 */
anychart.timeline = function(var_args) {
  var chart = new anychart.timelineModule.Chart();
  chart.addThemes('timeline');
  chart.setOption('defaultSeriesType', anychart.enums.TimelineSeriesType.MOMENT);
  // chart.setupScales(chart.themeSettings);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart[anychart.enums.TimelineSeriesType.MOMENT](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.TIMELINE] = anychart.timeline;

//exports
goog.exportSymbol('anychart.timeline', anychart.timeline);
