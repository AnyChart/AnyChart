goog.provide('anychart.animations.AnimationParallelQueue');
goog.require('goog.fx.AnimationParallelQueue');



/**
 * Animation parallel queue.
 * @constructor
 * @extends {goog.fx.AnimationParallelQueue}
 */
anychart.animations.AnimationParallelQueue = function() {
  anychart.animations.AnimationParallelQueue.base(this, 'constructor');
};
goog.inherits(anychart.animations.AnimationParallelQueue, goog.fx.AnimationParallelQueue);


/**
 * Updates all animations.
 */
anychart.animations.AnimationParallelQueue.prototype.update = function() {
  var now = goog.now();
  for (var i = 0; i < this.queue.length; i++) {
    var anim = (/** @type {anychart.animations.Animation} */(this.queue[i]));
    anim.update();
    anim.cycle(now);
  }
};
