goog.provide('anychart.animations.BarAnimation');
goog.require('anychart.animations.Animation');



/**
 * Bar/Column animation.
 * @param {*} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.BarAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  goog.base(this, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.BarAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onBegin = function() {
  this.startPoint = [];
  this.endPoint = [];
  this.zero = [];
  var iterator = this.series_.getResetIterator();
  while (iterator.advance()) {
    var y = iterator.meta('y');
    var zero = iterator.meta('zero');
    this.startPoint.push(0);
    this.endPoint.push(zero - y);
    this.zero.push(zero);
  }
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onAnimate = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setX(this.zero[index] - this.coords[index]).setWidth(this.coords[index]);
  }, this);
};


/** @inheritDoc */
anychart.animations.BarAnimation.prototype.onEnd = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setX(this.zero[index] - this.endPoint[index]).setWidth(this.endPoint[index]);
  }, this);
};
