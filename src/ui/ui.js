/**
 * @fileoverview anychart.ui namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.ui');
goog.require('anychart.core.reporting');
goog.require('anychart.ui.Background');
goog.require('anychart.ui.DataGrid');
goog.require('anychart.ui.Label');
goog.require('anychart.ui.LabelsFactory');
goog.require('anychart.ui.Legend');
goog.require('anychart.ui.MarkersFactory');
goog.require('anychart.ui.ProjectTimeline');
goog.require('anychart.ui.ResourceTimeline');
goog.require('anychart.ui.Scroller');
goog.require('anychart.ui.Table');
goog.require('anychart.ui.Title');


/**
 * Namespace with standalone and anychart.ui UI elements.
 * @namespace
 * @name anychart.ui
 */


/**
 * @ignoreDoc
 */
anychart.ui.contextMenu = goog.global['anychart']['ui']['contextMenu'] || /** @type {function():null} */ (function(opt_fromTheme) {
  if (!opt_fromTheme) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['anychart.ui.ContextMenu']);
  }
  return null;
});


/**
 * @ignoreDoc
 */
anychart.ui.ganttToolbar = goog.global['anychart']['ui']['ganttToolbar'] || /** @type {function():null} */ (function() {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['anychart.ui.GanttToolbar']);
  return null;
});


/**
 * @ignoreDoc
 */
anychart.ui.preloader = goog.global['anychart']['ui']['preloader'] || /** @type {function():null} */ (function() {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['anychart.ui.preloader']);
  return null;
});


goog.exportSymbol('anychart.ui.contextMenu', anychart.ui.contextMenu);
goog.exportSymbol('anychart.ui.ganttToolbar', anychart.ui.ganttToolbar);
goog.exportSymbol('anychart.ui.preloader', anychart.ui.preloader);
