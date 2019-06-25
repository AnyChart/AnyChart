goog.provide('anychart.ganttModule.DataGridButton');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.NewButton');



/**
 * Collapse-expand button customization.
 * TODO (A.Kudryavtsev): All this class (both with anychart.core.ui.NewButton) looks like a hacky hack.
 * TODO (A.Kudryavtsev): I recommend to rewrite it all with themes flatting, resolution chains and measuriator.
 *
 * @param {anychart.ganttModule.DataGrid} dataGrid - Parent data grid.
 * @constructor
 * @extends {anychart.core.ui.NewButton}
 */
anychart.ganttModule.DataGridButton = function(dataGrid) {
  anychart.ganttModule.DataGridButton.base(this, 'constructor');
  this.addThemes('defaultDataGrid.buttons');

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

  //todo: Should think about it after themes refactoring. Hack for gantt DataGrid serialize
  this.normal().background().serializeOnlyOwn = false;
  this.hovered().background().serializeOnlyOwn = false;
  this.selected().background().serializeOnlyOwn = false;

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
//region -- States setup.
/**
 * Sets state settings up.
 */
anychart.ganttModule.DataGridButton.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});
  this.normal_.setupCreated('background', this.normal_.background());

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});
  this.hovered_.setupCreated('background', this.hovered_.background());

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
  this.selected_.setupCreated('background', this.selected_.background());
};


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
  this.setParentEventTarget(null); // It fixes selection of row on button mouse click. Stopping propagation doesn't work in some reasons.
  if (this.handleBrowserEvent(event)) {
    this.toggleButtonState();
    this.dataGrid_.collapseExpandItem(this.dataItemIndex_, !this.isSelected());
  }
  this.setParentEventTarget(this.dataGrid_);
};
//endregion
