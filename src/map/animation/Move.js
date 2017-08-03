goog.provide('anychart.mapModule.animation.Move');
goog.require('anychart.mapModule.animation.Base');



/**
 * Map zoom animation.
 * @param {anychart.mapModule.Chart} map
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} duration
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.mapModule.animation.Base}
 */
anychart.mapModule.animation.Move = function(map, start, end, duration, opt_silentMode, opt_acc) {
  anychart.mapModule.animation.Move.base(this, 'constructor', map, start, end, duration, opt_silentMode, opt_acc);
};
goog.inherits(anychart.mapModule.animation.Move, anychart.mapModule.animation.Base);


/**
 * Does move.
 * @param {number} dx .
 * @param {number} dy .
 * @private
 */
anychart.mapModule.animation.Move.prototype.doMove_ = function(dx, dy) {
  var tx = this.map.getMapLayer().getSelfTransformation();
  this.map.getMapLayer().setTransformationMatrix(tx.getScaleX(), 0, 0, tx.getScaleY(), dx, dy);

  this.map.scale().setMapZoom(tx.getScaleX());
  this.map.scale().setOffsetFocusPoint(tx.getTranslateX(), tx.getTranslateY());

  this.map.updateSeriesOnZoomOrMove();
};


/** @inheritDoc */
anychart.mapModule.animation.Move.prototype.onAnimate = function() {
  var currDx = this.coords[0];
  var currDy = this.coords[1];
  this.doMove_(currDx, currDy);
  anychart.mapModule.animation.Move.base(this, 'onAnimate');
};


/** @inheritDoc */
anychart.mapModule.animation.Move.prototype.onFinish = function() {
  var currDx = this.coords[0];
  var currDy = this.coords[1];
  this.doMove_(currDx, currDy);
  anychart.mapModule.animation.Move.base(this, 'onFinish');
};


/** @inheritDoc */
anychart.mapModule.animation.Move.prototype.onEnd = function() {
  anychart.mapModule.animation.Move.base(this, 'onEnd');
  this.map.zoomAnimation = null;
  this.map = null;
  this.dispose();
};
