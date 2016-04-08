goog.provide('anychart.animations.ClipAnimation');
goog.require('anychart.animations.Animation');



/**
 * Animation for Continuous Based series.
 * @param {acgraph.vector.Stage} stage Stage for clip.
 * @param {anychart.core.cartesian.series.BaseWithMarkers} series Cartesian series.
 * @param {number} duration Animation duration.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {anychart.animations.Animation}
 */
anychart.animations.ClipAnimation = function(stage, series, duration, opt_acc) {
  /**
   * Stage reference.
   * @type {acgraph.vector.Stage}
   * @private
   */
  this.stage_ = stage;

  /**
   * Series reference.
   * @type {anychart.core.cartesian.series.BaseWithMarkers}
   * @private
   */
  this.series_ = series;

  /**
   * @type {acgraph.vector.Clip}
   * @private
   */
  this.clip_;

  goog.base(this, [0, 0, 0, 0], [0, 0, 0, 0], duration, opt_acc);
};
goog.inherits(anychart.animations.ClipAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onBegin = function() {
  if (!this.clip_)
    this.clip_ = this.stage_.createClip();

  this.series_.getRootLayer().clip(this.clip_);
  this.series_.markers().getRootLayer().clip(this.clip_);
  this.series_.labels().getRootLayer().clip(this.clip_);
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.cycle = function(now) {
  var bounds = this.series_.getPixelBounds();

  if (this.series_.is3d) {
    var x3dShift = this.series_.getChart().x3dShift;
    var y3dShift = this.series_.getChart().y3dShift;
    bounds.top -= y3dShift;
    bounds.height += y3dShift;
    bounds.width += x3dShift;
  }

  this.startPoint[0] = bounds.left;
  this.startPoint[1] = bounds.top;
  this.startPoint[2] = 0;
  this.startPoint[3] = bounds.height;
  this.endPoint[0] = bounds.left;
  this.endPoint[1] = bounds.top;
  this.endPoint[2] = bounds.width;
  this.endPoint[3] = bounds.height;

  goog.base(this, 'cycle', now);
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onAnimate = function() {
  this.clip_.shape.apply(this.clip_, this.coords);
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onEnd = function() {
  this.series_.getRootLayer().clip(null);
  this.series_.markers().getRootLayer().clip(null);
  this.series_.labels().getRootLayer().clip(null);
  this.series_.doClip();

  goog.dispose(this.clip_);
  this.clip_ = null;
};
