goog.provide('anychart.ganttModule.Selection');

//region -- Requirements.
goog.require('goog.Disposable');



//endregion
//region -- Constructor.
/**
 * Gantt selection controller.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.ganttModule.Selection = function() {

  /**
   *
   * @type {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)}
   * @private
   */
  this.selectedItem_ = null;

  /**
   *
   * @type {?(number|undefined)}
   * @private
   */
  this.selectedPeriodIndex_ = null;

  /**
   *
   * @type {?anychart.ganttModule.Selection.SelectedConnectorData}
   * @private
   */
  this.selectedConnector_ = null;

};
goog.inherits(anychart.ganttModule.Selection, goog.Disposable);


//endregion
//region -- Typedefs.
/**
 * @typedef {{
 *   fromItem: (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem),
 *   toItem: (anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem),
 *   fromPeriodIndex: (?number),
 *   toPeriodIndex: (?number),
 *   connType: anychart.enums.ConnectorType,
 *   fromItemIndex: number,
 *   toItemIndex: number
 * }}
 */
anychart.ganttModule.Selection.SelectedConnectorData;


//endregion
//region -- Row selection.
/**
 *
 * @param {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Selected item.
 */
anychart.ganttModule.Selection.prototype.selectRow = function(item) {
  //TODO (A.Kudryavtsev): In current implementation (18 Mar 2019) no multiple selection is allowed.
  if (this.selectedItem_ != item) {
    var tree;
    if (this.selectedItem_) {
      tree = this.selectedItem_.tree();
      tree.suspendSignalsDispatching();
      this.selectedItem_.meta('selected', false);
      tree.resumeSignalsDispatching(false);
    } else {
      this.selectedPeriodIndex_ = null;
    }
    if (item) {
      tree = item.tree();
      tree.suspendSignalsDispatching();
      item.meta('selected', true);
      tree.resumeSignalsDispatching(false); //false?
    } else {
      this.selectedPeriodIndex_ = null;
    }
    this.selectedItem_ = item;
  }
};


/**
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item
 * @return {boolean} - Whether row is selected.
 */
anychart.ganttModule.Selection.prototype.isRowSelected = function(item) {
  if (this.hasSelectedRow()) {
    /*
      Here we have the kind of magic:
      In current implementation (8 Apr 2019) Gantt can have only one selected row.
      By default, this.selectedItem_ is filled by user mouse actions, but if user
      writes item.meta('selected', true), selection must be performed correctly
      because value of item.meta('selected') must always reflect correct selection state.
      Conditions below make it work.
     */
    if (item.meta('selected')) {
      this.selectRow(item);
      return true;
    } else if (!this.selectedItem_.meta('selected')) {
      this.selectedItem_ = null;
      this.selectedPeriodIndex_ = null;
      return false;
    }
    return this.selectedItem_ == item;
  }
  return false;
};


/**
 *
 * @return {boolean}
 */
anychart.ganttModule.Selection.prototype.hasSelectedRow = function() {
  return !!this.selectedItem_;
};


/**
 * Gets currently selected item.
 * @return {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)}
 */
anychart.ganttModule.Selection.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};


//endregion
//region -- Period selection.
/**
 *
 * @param {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Selected item.
 * @param {number=} opt_periodIndex - Selected period index.
 */
anychart.ganttModule.Selection.prototype.selectPeriod = function(item, opt_periodIndex) {
  //TODO (A.Kudryavtsev): In current implementation (18 Mar 2019) no multiple selection is allowed.
  this.selectRow(item);
  this.selectedPeriodIndex_ = item ? opt_periodIndex : null;
};


/**
 *
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Item.
 * @param {number} periodIndex - Period index.
 * @return {boolean}
 */
anychart.ganttModule.Selection.prototype.isPeriodSelected = function(item, periodIndex) {
  if (this.isRowSelected(item) && goog.isDefAndNotNull(this.selectedPeriodIndex_)) {
    return this.selectedItem_ == item && this.selectedPeriodIndex_ === periodIndex;
  }
  return false;
};


/**
 * Gets selected period index.
 * @return {?(number|undefined)}
 */
anychart.ganttModule.Selection.prototype.getSelectedPeriodIndex = function() {
  return this.selectedPeriodIndex_;
};


/**
 *
 * @return {boolean}
 */
anychart.ganttModule.Selection.prototype.hasSelectedPeriod = function() {
  return goog.isDefAndNotNull(this.selectedPeriodIndex_) && this.hasSelectedRow();
};


//endregion
//region -- Connector selection.
/**
 *
 * @param {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} fromItem - From item.
 * @param {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_toItem - To Item.
 * @param {number=} opt_fromItemIndex - From item index.
 * @param {number=} opt_toItemIndex - To item index.
 * @param {number=} opt_fromPeriodIndex - From period index.
 * @param {number=} opt_toPeriodIndex - To period index.
 * @param {anychart.enums.ConnectorType=} opt_type - Connector type.
 */
anychart.ganttModule.Selection.prototype.selectConnector = function(fromItem, opt_toItem, opt_fromItemIndex, opt_toItemIndex, opt_fromPeriodIndex, opt_toPeriodIndex, opt_type) {
  //TODO (A.Kudryavtsev): In current implementation (18 Mar 2019) no multiple selection is allowed.
  if (fromItem && opt_toItem) {
    this.selectedConnector_ = /** @type {anychart.ganttModule.Selection.SelectedConnectorData} */ ({
      fromItem: fromItem,
      toItem: opt_toItem,
      fromItemIndex: opt_fromItemIndex,
      toItemIndex: opt_toItemIndex,
      fromPeriodIndex: opt_fromPeriodIndex,
      toPeriodIndex: opt_toPeriodIndex,
      connType: opt_type || anychart.enums.ConnectorType.FINISH_START
    });
    this.selectPeriod(null); //This will reset both selected item and period.
  } else {
    this.selectedConnector_ = null;
  }
};


/**
 *
 * @param {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} fromItem - From item.
 * @param {?(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)=} opt_toItem - To Item.
 * @param {number=} opt_fromItemIndex - From item index.
 * @param {number=} opt_toItemIndex - To item index.
 * @param {number=} opt_fromPeriodIndex - From period index.
 * @param {number=} opt_toPeriodIndex - To period index.
 * @param {anychart.enums.ConnectorType=} opt_type - Connector type.
 * @return {boolean} - Whether connector with these parameters is selected.
 */
anychart.ganttModule.Selection.prototype.isConnectorSelected = function(fromItem, opt_toItem, opt_fromItemIndex, opt_toItemIndex, opt_fromPeriodIndex, opt_toPeriodIndex, opt_type) {
  if (this.selectedConnector_) {
    //TODO (A.Kudryavtsev): Do we need to check linear indexes of items?
    return (
        this.selectedConnector_.fromItem == fromItem &&
        this.selectedConnector_.toItem == opt_toItem &&
        this.selectedConnector_.connType == opt_type &&
        this.selectedConnector_.fromPeriodIndex == opt_fromPeriodIndex &&
        this.selectedConnector_.toPeriodIndex == opt_toPeriodIndex
    );
  }
  return false;
};


/**
 *
 * @return {?anychart.ganttModule.Selection.SelectedConnectorData}
 */
anychart.ganttModule.Selection.prototype.getSelectedConnectorData = function() {
  return this.selectedConnector_;
};


/**
 * Checks whether some connector is selected.
 * @return {boolean}
 */
anychart.ganttModule.Selection.prototype.hasSelectedConnector = function() {
  return !!this.selectedConnector_;
};


//endregion
//region -- Reset.
/**
 * Resets selection.
 */
anychart.ganttModule.Selection.prototype.reset = function() {
  this.selectPeriod(null); //Will nullify both row and period.
  this.selectedConnector_ = null;
};


// endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.Selection.prototype.disposeInternal = function() {
  this.reset();
  this.data_ = null;
  anychart.ganttModule.Selection.base(this, 'disposeInternal');
};

//endregion
