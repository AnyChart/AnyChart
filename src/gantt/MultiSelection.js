goog.provide('anychart.ganttModule.MultiSelection');

//region -- Requirements.
goog.require('goog.Disposable');



//endregion
//region -- Constructor.
/**
 * Gantt selection controller.
 * TODO (A.Kudryavtsev): Do we need to add interactivity handler signal dispatching on API items select?
 *
 *
 *   N       N   OOOOOO   TTTTTTTTT  EEEEEEEE
 *   N N     N  O      O      T      E
 *   N  N    N  O      O      T      E
 *   N   N   N  O      O      T      EEEEEE   : Works on Qlik specific interactivity only.
 *   N    N  N  O      O      T      E
 *   N     N N  O      O      T      E
 *   N       N   OOOOOO       T      EEEEEEEE
 *
 *
 * @param {anychart.ganttModule.Chart} handler - Handler. TODO (A.Kudryavtsev): Describe.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.ganttModule.MultiSelection = function(handler) {

  /**
   *
   * @type {anychart.ganttModule.Chart}
   * @private
   */
  this.handler_ = handler;

  /**
   *
   * @type {Object.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
   * @private
   */
  this.selectedItemsMap_ = {};

};
goog.inherits(anychart.ganttModule.MultiSelection, goog.Disposable);


//region -- Private API.
/**
 * Gets item's uid.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item related.
 * @private
 * @return {string} - UID.
 */
anychart.ganttModule.MultiSelection.prototype.getUid_ = function(item) {
  return 'i' + String(goog.getUid(item));
};


//endregion
//region -- Internal API.
/**
 * Synchronizes item meta 'selected' state and state recorded to this controller.
 * DEV NOTE: item.meta('selected') must always have actual state!
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item related.
 * @return {string} - Checked item UID.
 */
anychart.ganttModule.MultiSelection.prototype.syncSelection = function(item) {
  var isMetaSelected = !!item.meta('selected');
  var uid = this.getUid_(item);
  if (isMetaSelected) {
    this.selectedItemsMap_[uid] = item;
  } else {
    delete this.selectedItemsMap_[uid];
  }
  return uid;
};


/**
 * Internal selection. Use it in development.
 * TODO (A.Kudryavtsev): Only in current implementation selecting the same row unselects it.
 * TODO (A.Kudryavtsev): Further improvements must make more complex and flexible.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item to select/unselect.
 */
anychart.ganttModule.MultiSelection.prototype.selectInternal = function(item) {
  var tree = item.tree();
  tree.suspendSignalsDispatching();
  item.meta('selected', !item.meta('selected'));
  tree.resumeSignalsDispatching(false);
  this.syncSelection(item);
};


//endregion
//region -- API.
/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Item related to row to check whether it is selected.
 * @return {boolean}
 */
anychart.ganttModule.MultiSelection.prototype.isRowSelected = function(item) {
  var uid = this.syncSelection(item);
  return uid in this.selectedItemsMap_;
};


/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>} items - Single item or set of items.
 * @param {boolean=} opt_only - Whether to leave only passed items selected.
 * @return {anychart.ganttModule.MultiSelection} - Self for chaining.
 */
anychart.ganttModule.MultiSelection.prototype.select = function(items, opt_only) {
  if (opt_only) {
    for (var key in this.selectedItemsMap_) {
      //This inverts selected state and clears this.selectedItemsMap_.
      this.selectInternal(this.selectedItemsMap_[key]);
    }
  }
  var it = goog.isArray(items) ? items : [items];
  for (var i = 0; i < it.length; i++) {
    var item = it[i];
    var tree = item.tree();
    tree.suspendSignalsDispatching();
    item.meta('selected', true);
    tree.resumeSignalsDispatching(false);
    this.syncSelection(item);
  }
  this.handler_.refreshSelection();
  return this;
};


/**
 * Gets currently selected items.
 * TODO (A.Kudryavtsev): Maybe cache this value?
 * @return {Array.<anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem>}
 */
anychart.ganttModule.MultiSelection.prototype.getSelectedItems = function() {
  var res = [];
  for (var key in this.selectedItemsMap_) {
    if (this.selectedItemsMap_.hasOwnProperty(key))
      res.push(this.selectedItemsMap_[key]);
  }
  return res;
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.MultiSelection.prototype.disposeInternal = function() {
  //TODO (A.Kudryavtsev): Implement.
  this.select([], true);
  anychart.ganttModule.MultiSelection.base(this, 'disposeInternal');
};


//endregion
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.MultiSelection.prototype;
  proto['select'] = proto.select;
  proto['getSelectedItems'] = proto.getSelectedItems;
  proto['isRowSelected'] = proto.isRowSelected;
})();
