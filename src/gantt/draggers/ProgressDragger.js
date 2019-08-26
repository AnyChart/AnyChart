goog.provide('anychart.ganttModule.draggers.ProgressDragger');

goog.require('goog.fx.Dragger');



/**
 * Progress dragger.
 * @param {acgraph.vector.Path} target - Target element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.draggers.ProgressDragger = function(target) {
  anychart.ganttModule.draggers.ProgressDragger.base(this, 'constructor', target.domElement());

  /**
   * Element.
   * @type {acgraph.vector.Path}
   */
  this.element = target;

  /**
   * Progress value to be applied after edit.
   * @type {number}
   */
  this.progress = NaN;
};
goog.inherits(anychart.ganttModule.draggers.ProgressDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.draggers.ProgressDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.ganttModule.draggers.ProgressDragger.prototype.defaultAction = function(x, y) {
  this.element.setTransformationMatrix(1, 0, 0, 1, x, 0);
  var progressLeft = x - this.limits.left;
  this.progress = progressLeft / this.limits.width;
};


/**
 * Gets progress value.
 * @return {number}
 */
anychart.ganttModule.draggers.ProgressDragger.prototype.getProgressValue = function() {
  var dataItem = this.element.tag.item;

  var progressValue = goog.isDef(dataItem.meta('progressValue')) ?
      dataItem.meta('progressValue') :
      dataItem.meta('autoProgress');

  return /** @type {number} */ (progressValue || 0);
};


/**
 * @override
 */
anychart.ganttModule.draggers.ProgressDragger.prototype.limitX = function(x) {
  var b = this.element.tag.bounds;
  var progressValue = this.getProgressValue();
  var progress = b.width * progressValue;
  this.limits.left = -progress;
  this.limits.width = b.width;

  return goog.math.clamp(x, -progress, b.width - progress);
};


/**
 * @override
 */
anychart.ganttModule.draggers.ProgressDragger.prototype.limitY = function(y) {
  return 0;
};
