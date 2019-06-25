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
  return new anychart.ganttModule.Chart(false);
};


/**
 * Constructor function for gantt resource chart.
 * @return {!anychart.ganttModule.Chart}
 */
anychart.ganttResource = function() {
  return new anychart.ganttModule.Chart(true);
};


anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_RESOURCE] = anychart.ganttResource;
anychart.ganttTypesMap[anychart.enums.ChartTypes.GANTT_PROJECT] = anychart.ganttProject;


//exports
goog.exportSymbol('anychart.ganttProject', anychart.ganttProject);
goog.exportSymbol('anychart.ganttResource', anychart.ganttResource);
