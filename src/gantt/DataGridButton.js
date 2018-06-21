goog.provide('anychart.ganttModule.DataGridButton');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.NewButton');



/**
 * Collapse-expand button customization.
 * @param {anychart.ganttModule.DataGrid} dataGrid - Parent data grid.
 * @constructor
 * @extends {anychart.core.ui.NewButton}
 */
anychart.ganttModule.DataGridButton = function(dataGrid) {
  anychart.ganttModule.DataGridButton.base(this, 'constructor');

  /**
   * Own data grid.
   * @type {anychart.ganttModule.DataGrid}
   * @private
   */
  this.dataGrid_ = dataGrid;

  /**
   * Index of data item to be expanded/collapsed.
   * @type {number}
   * @private
   */
  this.dataItemIndex_ = -1;

  this.supportsEnabledSuspension = false;

  this.setParentEventTarget(this.dataGrid_);
};
goog.inherits(anychart.ganttModule.DataGridButton, anychart.core.ui.NewButton);


//region Properties
/**
 * Default button side.
 * @type {number}
 */
anychart.ganttModule.DataGridButton.DEFAULT_BUTTON_SIDE = 15;


//endregion
//region Infrastructure
/**
 * Gets/sets data item index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.DataGridButton|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.DataGridButton.prototype.dataItemIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataItemIndex_ = opt_value;
    return this;
  }
  return this.dataItemIndex_;
};


//endregion
//region Interactivity
/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.handleMouseClick = function(event) {
  if (this.handleBrowserEvent(event)) {
    this.toggleButtonState();
    this.dataGrid_.collapseExpandItem(this.dataItemIndex_, !this.isSelected());
  }
};
//endregion
