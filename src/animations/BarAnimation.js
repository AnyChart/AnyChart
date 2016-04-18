goog.provide('anychart.animations.BarAnimation');
goog.require('anychart.animations.ColumnAnimation');



/**
 * Bar animation.
 * @param {anychart.core.series.Cartesian} series
 * @param {number} duration
 * @param {Function=} opt_acc
 * @constructor
 * @extends {anychart.animations.ColumnAnimation}
 */
anychart.animations.BarAnimation = function(series, duration, opt_acc) {
  anychart.animations.BarAnimation.base(this, 'constructor', series, duration, opt_acc);
  this.isBarAnimation = true;
};
goog.inherits(anychart.animations.BarAnimation, anychart.animations.ColumnAnimation);
