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
  this.stage_ = stage;
  var start = series.getPixelBounds().clone();
  var end = start.toArray();
  start.width = 0;
  start = start.toArray();

  this.series_ = series;
  this.seriesRootLayer_ = series.getRootLayer();
  this.markersRootLayer_ = series.markers().getRootLayer();
  this.labelsRootLayer_ = series.labels().getRootLayer();

  goog.base(this, start, end, duration, opt_acc);
};
goog.inherits(anychart.animations.ClipAnimation, anychart.animations.Animation);


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onBegin = function() {
  if (!this.clip_)
    this.clip_ = this.stage_.createClip();

  this.oldClipSeries_ = this.seriesRootLayer_.clip();
  this.oldClipMarkers_ = this.markersRootLayer_.clip();
  this.oldClipLabels_ = this.labelsRootLayer_.clip();
  this.seriesRootLayer_.clip(this.clip_);
  this.markersRootLayer_.clip(this.clip_);
  this.labelsRootLayer_.clip(this.clip_);
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onAnimate = function() {
  this.clip_.bounds(anychart.math.Rect.fromArray(this.coords));
};


/** @inheritDoc */
anychart.animations.ClipAnimation.prototype.onEnd = function() {
  this.seriesRootLayer_.clip(this.oldClipSeries_);
  this.markersRootLayer_.clip(this.oldClipMarkers_);
  this.labelsRootLayer_.clip(this.oldClipLabels_);
  this.clip_.dispose();
  this.clip_ = null;
  this.oldClipSeries_ = null;
  this.oldClipMarkers_ = null;
  this.oldClipLabels_ = null;
};
