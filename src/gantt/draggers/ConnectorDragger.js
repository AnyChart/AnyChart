goog.provide('anychart.ganttModule.draggers.ConnectorDragger');

goog.require('goog.fx.Dragger');



/**
 * Edit connector dragger.
 * @param {anychart.ganttModule.TimeLine} timeline - Related TL.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {boolean=} opt_isStart - Whether it is a 'start'-connector. Otherwise - is 'finish'.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.draggers.ConnectorDragger = function(timeline, target, opt_isStart) {
  anychart.ganttModule.draggers.ConnectorDragger.base(this, 'constructor', target.domElement());

  /**
   * Related TL.
   * @type {anychart.ganttModule.TimeLine}
   */
  this.timeline = timeline;

  /**
   * Element.
   * @type {acgraph.vector.Element}
   */
  this.element = target;

  /**
   * Orientation of thumb.
   * @type {boolean}
   */
  this.isStart = !!opt_isStart;


  /**
   * Last tracked X coordinate from mouseEvent.
   * @type {number}
   */
  this.lastTrackedMouseX = NaN;


  /**
   * Last tracked Y coordinate from mouseEvent.
   * @type {number}
   */
  this.lastTrackedMouseY = NaN;
};
goog.inherits(anychart.ganttModule.draggers.ConnectorDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.draggers.ConnectorDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};
