goog.provide('anychart.ganttModule.edit.Controller');

//region -- Requirements.
goog.require('goog.Disposable');



//endregion
//region -- Constructor.
/**
 *
 * NOTE: THis class is left for a while for future gantt live edit refactoring.
 *
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.ganttModule.edit.Controller = function(timeline) {

  /**
   *
   * @type {anychart.ganttModule.TimeLine}
   */
  this.timeline = timeline;

  /**
   * Controller service flags.
   * @type {anychart.ganttModule.edit.Controller.Flags}
   */
  this.flags = {

  };

  /**
   * Draggers storage.
   * @type {anychart.ganttModule.edit.Controller.Draggers}
   */
  this.draggers = {

  };

  /**
   * Edit paths storage.
   * @type {anychart.ganttModule.edit.Controller.EditControls}
   */
  this.controls = {

  };


};
goog.inherits(anychart.ganttModule.edit.Controller, goog.Disposable);


//endregion
//region -- Type definitions.
/**
 * @typedef {{
 *  preventClickAfterDrag: boolean,
 *  tooltipEnabledBackup: boolean,
 *  draggingPreview: boolean
 * }}
 */
anychart.ganttModule.edit.Controller.Flags;


/**
 * @typedef {{
 *   leftThumb: acgraph.vector.Path,
 *   rightThumb: acgraph.vector.Path,
 *   startConnector: acgraph.vector.Path,
 *   finishConnector: acgraph.vector.Path,
 *   preview: acgraph.vector.Path,
 * }}
 */
anychart.ganttModule.edit.Controller.EditControls;


/**
 * @typedef {{
 *   currentThumb: goog.fx.Dragger
 * }}
 */
anychart.ganttModule.edit.Controller.Draggers;


//endregion

//TODO (A.Kudryavtsev): Add delete key handler here.


//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.edit.Controller.prototype.disposeInternal = function() {
  //TODO (A.Kudryavtsev): Add.
  anychart.ganttModule.edit.Controller.base(this, 'disposeInternal');
};

//endregion


