goog.provide('anychart.modules.anygantt');

goog.require('anychart.charts.Gantt');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.core.ui.Splitter');
goog.require('anychart.modules.base');
goog.require('anychart.modules.toolbar');


/**
 * Constructor function for gantt project chart.
 * @return {!anychart.charts.Gantt}
 */
anychart.ganttProject = function() {
  var chart = new anychart.charts.Gantt(false);

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


/**
 * Constructor function for gantt resource chart.
 * @return {!anychart.charts.Gantt}
 */
anychart.ganttResource = function() {
  var chart = new anychart.charts.Gantt(true);

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_RESOURCE] = anychart.ganttResource;
anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_PROJECT] = anychart.ganttProject;


//exports
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
