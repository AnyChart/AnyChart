goog.provide('anychart.animations.Animation');
goog.require('goog.fx.Animation');



/**
 * Animation class.
 * @param {Array.<number>} start Array for start coordinates.
 * @param {Array.<number>} end Array for end coordinates.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {goog.fx.Animation}
 */
anychart.animations.Animation = function(start, end, duration, opt_acc) {
  goog.base(this, start, end, duration, opt_acc);
};
goog.inherits(anychart.animations.Animation, goog.fx.Animation);


/**
 * Sets new duration to animation.
 * @param {number} duration Duration in milliseconds.
 */
anychart.animations.Animation.prototype.setDuration = function(duration) {
  if (this.isStopped())
    this.duration = duration;
};
