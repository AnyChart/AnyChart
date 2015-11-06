/**
 * @fileoverview anychart.modules.anygantt namespace file.
 * @suppress {extraRequire}
 */

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
  var theme = anychart.getFullTheme();
  chart.setup(theme['gantt']['ganttProject']);

  return chart;
};


/**
 * Constructor function for gantt resource chart.
 * @return {!anychart.charts.Gantt}
 */
anychart.ganttResource = function() {
  var chart = new anychart.charts.Gantt(true);
  var theme = anychart.getFullTheme();
  chart.setup(theme['gantt']['ganttResource']);

  return chart;
};


anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_RESOURCE] = anychart.ganttResource;
anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_PROJECT] = anychart.ganttProject;


//exports
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
