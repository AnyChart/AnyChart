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
 * Row expand/collapse handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.core.ui.IInteractiveGrid.prototype.rowExpandCollapse = function(event) {};


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
 * Highlights vertical range on editing structure.
 * Must remove highlightling if no arguments passed.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 * @param {(acgraph.vector.Cursor|string)=} opt_cursor - Cursor to be set.
 */
anychart.core.ui.IInteractiveGrid.prototype.editStructureHighlight = function(opt_startY, opt_endY, opt_cursor) {};


/**
 * Handler for delete key.
 * @param {goog.events.KeyEvent} e - Key event.
 */
anychart.core.ui.IInteractiveGrid.prototype.deleteKeyHandler = function(e) {};


/**
 * Creates gantt format provider.
 * @param {anychart.data.Tree.DataItem} dataItem - Data item.
 * @param {Object=} opt_period - Optional current period.
 * @param {number=} opt_periodIndex - Period index. Required is opt_period is set.
 * @return {!anychart.core.utils.GanttContextProvider} - Gantt context provider.
 */
anychart.core.ui.IInteractiveGrid.prototype.createFormatProvider = function(dataItem, opt_period, opt_periodIndex) {};


/**
 * Gets/sets default row height.
 * @param {number=} opt_value - Default row height to set.
 * @return {number|anychart.core.ui.IInteractiveGrid} - Current value or itself for chaining.
 */
anychart.core.ui.IInteractiveGrid.prototype.defaultRowHeight = function(opt_value) {};

