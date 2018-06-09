goog.provide('anychart.ganttModule.draggers.ThumbDragger');

goog.require('goog.fx.Dragger');



/**
 * Edit time interval dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {boolean=} opt_isLeft - Whether it is a left-oriented thumb. Otherwise - is right.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.draggers.ThumbDragger = function(target, opt_isLeft) {
  anychart.ganttModule.draggers.ThumbDragger.base(this, 'constructor', target.domElement());

  /**
   * Element.
   * @type {acgraph.vector.Element}
   */
  this.element = target;

  /**
   * Orientation of thumb.
   * @type {boolean}
   */
  this.isLeft = !!opt_isLeft;

};
goog.inherits(anychart.ganttModule.draggers.ThumbDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.draggers.ThumbDragger.prototype.limitY = function(y) {
  return 0;
};
