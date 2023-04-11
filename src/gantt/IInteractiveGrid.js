goog.provide('anychart.ganttModule.IInteractiveGrid');

goog.require('anychart.ganttModule.edit.StructureEdit');
goog.require('goog.events.Listenable');



/**
 * A common interface for grid-like interactivity handlers.
 * @interface
 * @extends {goog.events.Listenable}
 */
anychart.ganttModule.IInteractiveGrid = function() {
};


/**
 * Row click handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowClick = function(event) {};


/**
 * Row double click handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowDblClick = function(event) {};


/**
 * Row mouse move handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowMouseMove = function(event) {};


/**
 * Row mouse over handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowMouseOver = function(event) {};


/**
 * Row mouse out handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowMouseOut = function(event) {};


/**
 * Row mouse down handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowMouseDown = function(event) {};


/**
 * Row mouse up handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowMouseUp = function(event) {};


/**
 * Row select handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowSelect = function(event) {};


/**
 * Row unselect handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowUnselect = function(event) {};


/**
 * Row expand/collapse handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.rowExpandCollapse = function(event) {};


/**
 * Live edit settings.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.IInteractiveGrid|anychart.ganttModule.edit.StructureEdit} - Itself for method chaining or current value.
 */
anychart.ganttModule.IInteractiveGrid.prototype.edit = function(opt_value) {};


/**
 * Highlights selected vertical range.
 * Must remove highlightling if no arguments passed.
 * @param {number=} opt_index - Index of selected item.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 */
anychart.ganttModule.IInteractiveGrid.prototype.highlight = function(opt_index, opt_startY, opt_endY) {};


/**
 * Highlights vertical range on editing structure.
 * Must remove highlightling if no arguments passed.
 * @param {number=} opt_startY - Start Y to be highlighted.
 * @param {number=} opt_endY - End Y to be highlighted.
 * @param {(acgraph.vector.Cursor|string)=} opt_cursor - Cursor to be set.
 */
anychart.ganttModule.IInteractiveGrid.prototype.editStructureHighlight = function(opt_startY, opt_endY, opt_cursor) {};


/**
 * Handler for delete key.
 * @param {goog.events.KeyEvent} e - Key event.
 */
anychart.ganttModule.IInteractiveGrid.prototype.deleteKeyHandler = function(e) {};


/**
 * Gets/sets default row height.
 * @param {number=} opt_value - Default row height to set.
 * @return {number|anychart.ganttModule.IInteractiveGrid} - Current value or itself for chaining.
 */
anychart.ganttModule.IInteractiveGrid.prototype.defaultRowHeight = function(opt_value) {};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.ganttModule.IInteractiveGrid)} .
 */
anychart.ganttModule.IInteractiveGrid.prototype.palette = function(opt_value) {};


/**
 * Getter/setter for container.
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|!anychart.core.VisualBase)} .
 */
anychart.ganttModule.IInteractiveGrid.prototype.container = function(opt_value) {};


/**
 * Sets consistency state to an element {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state State(s) to be set.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.ganttModule.IInteractiveGrid.prototype.invalidate = function(state, opt_signal) {};


/**
 * Lock mouse interactivity.
 * @param {boolean} lock - True to lock, false to unlock.
 */
anychart.ganttModule.IInteractiveGrid.prototype.lockInteractivity = function(lock) {};


/**
 * Selection.
 * @return {anychart.ganttModule.Selection}
 */
anychart.ganttModule.IInteractiveGrid.prototype.selection = function() {};

/**
 * Dispatches an event (or event like object) with setTimeout.
 *
 * @param {goog.events.EventLike} e Event object.
 */
anychart.ganttModule.IInteractiveGrid.prototype.dispatchDetachedEvent = function(e) {};

