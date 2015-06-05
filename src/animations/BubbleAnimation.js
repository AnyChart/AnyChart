goog.provide('anychart.animations.BubbleAnimation');
goog.require('anychart.animations.Animation');



/**
 * Animation for bubble series.
 * @param {anychart.core.cartesian.series.Bubble} series Bubble series.
 * @param {number} duration Animation duration.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.BubbleAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  goog.base(this, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.BubbleAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onBegin = function() {
  this.startPoint = [];
  this.endPoint = [];
  this.series_.getRootElement().forEachChild(function(child) {
    this.startPoint.push(0);
    this.endPoint.push(child.radius());
  }, this);
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onAnimate = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.radius(this.coords[index]);
  }, this);
};


/** @inheritDoc */
anychart.animations.BubbleAnimation.prototype.onEnd = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.radius(this.endPoint[index]);
  }, this);
};
