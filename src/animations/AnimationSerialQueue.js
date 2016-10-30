goog.provide('anychart.animations.AnimationSerialQueue');
goog.require('goog.fx.AnimationSerialQueue');



/**
 * Animation serial queue.
 * @constructor
 * @extends {goog.fx.AnimationSerialQueue}
 */
anychart.animations.AnimationSerialQueue = function() {
  anychart.animations.AnimationSerialQueue.base(this, 'constructor');
};
goog.inherits(anychart.animations.AnimationSerialQueue, goog.fx.AnimationSerialQueue);


/**
 * Updates all animations.
 */
anychart.animations.AnimationSerialQueue.prototype.update = function() {
  for (var i = 0; i < this.queue.length; i++) {
    var anim = (/** @type {anychart.animations.Animation} */(this.queue[i]));
    anim.update();
  }
  if (this.queue.length)
    (/** @type {anychart.animations.Animation} */ (this.queue[0])).cycle(goog.now());
};
