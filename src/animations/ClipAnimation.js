goog.provide('anychart.animations.ClipAnimation');
goog.require('anychart.animations.Animation');



/**
 * Animation for Continuous Based series.
 * @param {anychart.core.series.Cartesian} series Cartesian series.
 * @param {number} duration Animation duration.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.ClipAnimation = function(series, duration, opt_acc) {
  anychart.animations.ClipAnimation.base(this, 'constructor', series, [0, 0], [0, 0], duration, opt_acc);
};
goog.inherits(anychart.animations.ClipAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.update = function() {
  /**
   * Current series clip bounds.
   * @type {!anychart.math.Rect}
   * @private
   */
  this.clipBounds_ = this.series.calcFullClipBounds();

  this.startPoint[0] = this.clipBounds_.left;
  if (this.series.xScale().inverted())
    this.startPoint[0] += this.clipBounds_.width;
  this.startPoint[1] = 0;

  this.endPoint[0] = this.clipBounds_.left;
  this.endPoint[1] = this.clipBounds_.width;
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onAnimate = function() {
  this.clipBounds_.left = this.coords[0];
  this.clipBounds_.width = this.coords[1];
  this.series.applyClip(this.clipBounds_);
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onEnd = function() {
  this.clipBounds_.left = this.endPoint[0];
  this.clipBounds_.width = this.endPoint[1];
  this.series.applyClip(this.clipBounds_);
};
