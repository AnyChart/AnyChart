/**
 * @fileoverview anychart.ganttModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.ganttModule.entry');

goog.require('anychart.ganttModule.Chart');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.ganttModule.Splitter');


/**
 * Constructor function for gantt project chart.
 * @return {!anychart.ganttModule.Chart}
 */
anychart.ganttProject = function() {
  var chart = new anychart.ganttModule.Chart(false);
  chart.setupInternal(true, anychart.getFullTheme('ganttProject'));

  return chart;
};


/**
 * Constructor function for gantt resource chart.
 * @return {!anychart.ganttModule.Chart}
 */
anychart.ganttResource = function() {
  var chart = new anychart.ganttModule.Chart(true);
  chart.setupInternal(true, anychart.getFullTheme('ganttResource'));

  return chart;
};


anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_RESOURCE] = anychart.ganttResource;
anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_PROJECT] = anychart.ganttProject;


//exports
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
