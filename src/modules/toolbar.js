/**
 * @fileoverview anychart.modules.toolbar namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.toolbar');

goog.require('anychart');
goog.require('anychart.ui.GanttToolbar');
goog.require('anychart.ui.Toolbar');


/**
 * Whether anychart.css is already embedded.
 * @type {boolean}
 */
anychart.toolbarCssEmbedded = false;


/**
 * Constructor function for default toolbar.
 * @return {anychart.ui.Toolbar}
 */
anychart.toolbar = function() {
  return new anychart.ui.Toolbar();
};


/**
 * Constructor function for gantt toolbar.
 * @return {anychart.ui.GanttToolbar}
 */
anychart.ganttToolbar = function() {
  return new anychart.ui.GanttToolbar();
};


//exports
goog.exportSymbol('anychart.toolbar', anychart.toolbar);
goog.exportSymbol('anychart.ganttToolbar', anychart.ganttToolbar);
