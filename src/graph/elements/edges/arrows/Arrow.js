goog.provide('anychart.graphModule.elements.arrows.Arrow');


goog.require('acgraph.vector.Path');
goog.require('anychart.core.Base');
goog.require('anychart.core.ui.OptimizedText');
goog.require('goog.math.Coordinate');


/**
 * Drawable arrow element.
 *
 * @constructor
 *
 * @param {anychart.graphModule.elements.arrows.Controller} controller Arrows controller used to resolve arrow settings.
 *
 * @extends {anychart.core.Base}
 */
anychart.graphModule.elements.arrows.Arrow = function(controller) {
  anychart.graphModule.elements.arrows.Arrow.base(this, 'constructor');

  this.controller_ = controller;

  this.path_ = new acgraph.vector.Path();
};
goog.inherits(anychart.graphModule.elements.arrows.Arrow, anychart.core.Base);


/**
 * Returns coordinates that used for arrow drawing.
 *
 * @param {!goog.math.Coordinate} pointerPosition
 * @param {number} angle
 *
 * @return {!Array.<!goog.math.Coordinate>}
 */
anychart.graphModule.elements.arrows.Arrow.prototype.getArrowPoints = function(pointerPosition, angle) {
  var size = this.controller_.getArrowSize(this);

  var arrowRightCenter = pointerPosition.clone();
  var arrowLeftTop = new goog.math.Coordinate(arrowRightCenter.x - size, arrowRightCenter.y - (size / 2));
  var arrowLeftBottom = new goog.math.Coordinate(arrowRightCenter.x - size, arrowRightCenter.y + (size / 2));

  arrowLeftTop.rotateDegrees(angle, arrowRightCenter);
  arrowLeftBottom.rotateDegrees(angle, arrowRightCenter);

  return [arrowRightCenter, arrowLeftTop, arrowLeftBottom];
};


/**
 * Draw arrow head.
 *
 * @param {!Array.<!goog.math.Coordinate>} points
 */
anychart.graphModule.elements.arrows.Arrow.prototype.drawArrowHead = function(points) {
  this.path_.clear();
  this.path_.moveTo(points[0].x, points[0].y);
  this.path_.lineTo(points[1].x, points[1].y);
  this.path_.lineTo(points[2].x, points[2].y);
  this.path_.close();
};


/**
 * Colorize arrow path.
 *
 */
anychart.graphModule.elements.arrows.Arrow.prototype.applyArrowColor = function() {
  this.path_.fill(this.controller_.getArrowFill(this));
  this.path_.stroke(this.controller_.getArrowStroke(this));
};


/**
 * Getter/Setter for edge arrow belong.
 *
 * @param {anychart.graphModule.Chart.Edge=} opt_edge
 * @return {anychart.graphModule.Chart.Edge}
 */
anychart.graphModule.elements.arrows.Arrow.prototype.edge = function(opt_edge) {
  if (opt_edge) {
    this.edge_ = opt_edge;
  }

  return this.edge_;
};


/**
 * Draw arrow shape and append it on parent container.
 */
anychart.graphModule.elements.arrows.Arrow.prototype.draw = function() {
  if (this.controller_.getArrowEnabledState(this)) {
    var position = this.controller_.getArrowPointerPosition(this);
    var rotationAngle = this.controller_.getArrowRotation(this);
    var arrowPoints = this.getArrowPoints(position, rotationAngle);

    this.path_.parent(this.container());

    this.drawArrowHead(arrowPoints);
    this.applyArrowColor();
  } else {
    this.path_.parent(null);
  }
};


/**
 * Getter/Setter for container.
 *
 * @param {acgraph.vector.Layer=} opt_container
 * @return {acgraph.vector.Layer}
 */
anychart.graphModule.elements.arrows.Arrow.prototype.container = function(opt_container) {
  if (goog.isDef(opt_container)) {
    this.container_ = opt_container;
  }

  return this.container_;
};


/** @inheritDoc */
anychart.graphModule.elements.arrows.Arrow.prototype.disposeInternal = function() {
  goog.dispose(this.path_);
  this.path_ = null;

  anychart.graphModule.elements.arrows.Arrow.base(this, 'disposeInternal');
};
