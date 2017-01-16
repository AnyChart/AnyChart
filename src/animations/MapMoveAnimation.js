goog.provide('anychart.animations.MapMoveAnimation');
goog.require('anychart.animations.MapAnimation');



/**
 * Map zoom animation.
 * @param {anychart.charts.Map} map
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} duration
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.MapAnimation}
 */
anychart.animations.MapMoveAnimation = function(map, start, end, duration, opt_silentMode, opt_acc) {
  anychart.animations.MapMoveAnimation.base(this, 'constructor', map, start, end, duration, opt_silentMode, opt_acc);
};
goog.inherits(anychart.animations.MapMoveAnimation, anychart.animations.MapAnimation);


/**
 * Does move.
 * @param {number} dx .
 * @param {number} dy .
 * @private
 */
anychart.animations.MapMoveAnimation.prototype.doMove_ = function(dx, dy) {
  var tx = this.map.getMapLayer().getSelfTransformation();
  this.map.getMapLayer().setTransformationMatrix(tx.getScaleX(), 0, 0, tx.getScaleY(), dx, dy);

  this.map.scale().setMapZoom(tx.getScaleX());
  this.map.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

  this.map.updateSeriesOnZoomOrMove();
};


/** @inheritDoc */
anychart.animations.MapMoveAnimation.prototype.onAnimate = function() {
  var currDx = this.coords[0];
  var currDy = this.coords[1];
  this.doMove_(currDx, currDy);
  anychart.animations.MapMoveAnimation.base(this, 'onAnimate');
};


/** @inheritDoc */
anychart.animations.MapMoveAnimation.prototype.onFinish = function() {
  var currDx = this.coords[0];
  var currDy = this.coords[1];
  this.doMove_(currDx, currDy);
  anychart.animations.MapMoveAnimation.base(this, 'onFinish');
};


/** @inheritDoc */
anychart.animations.MapMoveAnimation.prototype.onEnd = function() {
  anychart.animations.MapMoveAnimation.base(this, 'onEnd');
  this.map.zoomAnimation = null;
  this.map = null;
  this.dispose();
};
