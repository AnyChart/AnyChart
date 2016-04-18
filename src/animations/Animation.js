goog.provide('anychart.animations.Animation');
goog.require('goog.fx.Animation');



/**
 * Animation class.
 * @param {anychart.core.series.Cartesian} series Series reference.
 * @param {Array.<number>} start Array for start coordinates.
 * @param {Array.<number>} end Array for end coordinates.
 * @param {number} duration Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @extends {goog.fx.Animation}
 */
anychart.animations.Animation = function(series, start, end, duration, opt_acc) {
  anychart.animations.Animation.base(this, 'constructor', start, end, duration, opt_acc);

  /**
   * Series reference.
   * @type {anychart.core.series.Cartesian}
   * @protected
   */
  this.series = series;
};
goog.inherits(anychart.animations.Animation, goog.fx.Animation);


/**
 * Updates animation params.
 */
anychart.animations.Animation.prototype.update = function() {};


/** @inheritDoc */
anychart.animations.Animation.prototype.onPlay = function() {
  this.update();
};


/** @inheritDoc */
anychart.animations.Animation.prototype.disposeInternal = function() {
  this.series = null;
  anychart.animations.Animation.base(this, 'disposeInternal');
};
