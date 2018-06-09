goog.provide('anychart.ganttModule.draggers.BarDragger');

goog.require('goog.fx.Dragger');



/**
 * Bar dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.draggers.BarDragger = function(target) {
  anychart.ganttModule.draggers.BarDragger.base(this, 'constructor', target.domElement());

  this.element = target;

  /**
   * X.
   * @type {number}
   */
  this.x = 0;

  /**
   * Y.
   * @type {number}
   */
  this.y = 0;
};
goog.inherits(anychart.ganttModule.draggers.BarDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.draggers.BarDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.ganttModule.draggers.BarDragger.prototype.defaultAction = function(x, y) {
  this.element.setTransformationMatrix(1, 0, 0, 1, x, 0);
};


/**
 * @override
 */
anychart.ganttModule.draggers.BarDragger.prototype.limitY = function(y) {
  return 0;
};
