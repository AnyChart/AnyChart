goog.provide('anychart.animations.ColumnAnimation');
goog.require('anychart.animations.Animation');



/**
 * Bar/Column animation.
 * @param {*} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.ColumnAnimation = function(series, duration, opt_acc) {
  this.series_ = series;
  goog.base(this, [], [], duration, opt_acc);
};
goog.inherits(anychart.animations.ColumnAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onBegin = function() {
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
anychart.animations.ColumnAnimation.prototype.onAnimate = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setY(this.zero[index] - this.coords[index]).setHeight(this.coords[index]);
  }, this);
};


/** @inheritDoc */
anychart.animations.ColumnAnimation.prototype.onEnd = function() {
  this.series_.getRootElement().forEachChild(function(child, index) {
    child.setY(this.zero[index] - this.endPoint[index]).setHeight(this.endPoint[index]);
  }, this);
};
