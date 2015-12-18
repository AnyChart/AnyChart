goog.provide('anychart.core.ui.IInteractiveGrid');
goog.require('goog.events.Listenable');



/**
 * A common interface for grid-like interactivity handlers.
 * @interface
 * @extends {goog.events.Listenable}
 */
anychart.core.ui.IInteractiveGrid = function() {
};


/**
 * Row click handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowClick = function(event) {};


/**
 * Row double click handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowDblClick = function(event) {};


/**
 * Row mouse move handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowMouseMove = function(event) {};


/**
 * Row mouse over handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowMouseOver = function(event) {};


/**
 * Row mouse out handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowMouseOut = function(event) {};


/**
 * Row mouse down handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowMouseDown = function(event) {};


/**
 * Row mouse up handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowMouseUp = function(event) {};


/**
 * Row select handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowSelect = function(event) {};


/**
 * Row unselect handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowUnselect = function(event) {};


/**
 * Enables/disables live edit mode.
 * @param {boolean=} opt_value - Value to be set.
 * @return {anychart.core.ui.IInteractiveGrid|boolean} - Itself for method chaining or current value.
 */
anychart.core.ui.IInteractiveGrid.prototype.editing = function(opt_value) {};


/**
 * Highlights selected vertical range.
 * Must remove highlightling if no arguments passed.
 * @param {number=} opt_index - Index of selected item.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 */
anychart.core.ui.IInteractiveGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY) {};


/**
 * Creates gantt format provider.
 * @param {anychart.data.Tree.DataItem} dataItem - Data item.
 * @param {Object=} opt_period - Optional current period.
 * @return {!anychart.core.utils.GanttContextProvider} - Gantt context provider.
 */
anychart.core.ui.IInteractiveGrid.prototype.createFormatProvider = function(dataItem, opt_period) {};
