goog.provide('anychart.ganttModule.draggers.BaselineProgressDragger');

goog.require('anychart.ganttModule.draggers.ProgressDragger');



/**
 * Progress dragger.
 * @param {acgraph.vector.Path} target - Target element.
 * @constructor
 * @extends {anychart.ganttModule.draggers.ProgressDragger}
 */
anychart.ganttModule.draggers.BaselineProgressDragger = function(target) {
  anychart.ganttModule.draggers.BaselineProgressDragger.base(this, 'constructor', target);
};
goog.inherits(anychart.ganttModule.draggers.BaselineProgressDragger, anychart.ganttModule.draggers.ProgressDragger);


/**
 * @inheritDoc
 */
anychart.ganttModule.draggers.BaselineProgressDragger.prototype.getProgressValue = function() {
  var dataItem = this.element.tag.item;
  var progressValue = dataItem.get(anychart.enums.GanttDataFields.BASELINE_PROGRESS_VALUE) || 0;
  return anychart.utils.normalizeToRatio(progressValue);
};
