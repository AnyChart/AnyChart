goog.provide('anychart.ganttModule.MultiSelection');

//region -- Requirements.
goog.require('goog.Disposable');



//endregion
//region -- Constructor.
/**
 * Gantt selection controller.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.ganttModule.MultiSelection = function() {


};
goog.inherits(anychart.ganttModule.MultiSelection, goog.Disposable);


//region -- Private API.
/**
 * Synchronizes item meta 'selected' state and state recorded to this controller.
 * @param {anychart.treeDataModule.Tree.DataItem} item - Item related.
 * @private
 */
anychart.ganttModule.MultiSelection.prototype.syncSelection_ = function(item) {

};

//endregion
//region -- Internal API.


//endregion
//region -- API.
/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem} item - Item related to row to check whether it is selected.
 * @return {boolean}
 */
anychart.ganttModule.MultiSelection.prototype.rowIsSelected = function(item) {

};


/**
 *
 * @param {anychart.treeDataModule.Tree.DataItem|Array.<anychart.treeDataModule.Tree.DataItem>} items - Single item or set of items.
 * @param {boolean=} opt_only - Whether to leave only passed items selected.
 */
anychart.ganttModule.MultiSelection.prototype.select = function(items, opt_only) {

};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.MultiSelection.prototype.disposeInternal = function() {
  //TODO (A.Kudryavtsev): Implement.
  anychart.ganttModule.MultiSelection.base(this, 'disposeInternal');
};

//endregion
