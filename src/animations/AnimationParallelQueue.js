goog.provide('anychart.animations.AnimationParallelQueue');
goog.require('goog.fx.AnimationParallelQueue');



/**
 * Animation parallel queue.
 * @constructor
 * @extends {goog.fx.AnimationParallelQueue}
 */
anychart.animations.AnimationParallelQueue = function() {
  goog.base(this);
};
goog.inherits(anychart.animations.AnimationParallelQueue, goog.fx.AnimationParallelQueue);


/**
 * Sets duration to animation queue.
 * @param {number} duration Duration in milliseconds.
 */
anychart.animations.AnimationParallelQueue.prototype.setDuration = function(duration) {
  goog.array.forEach(this.queue, function(animation) {
    (/** @type {anychart.animations.Animation} */(animation)).setDuration(duration);
  });
};
