goog.provide('anychart.animations.MapAnimation');
goog.require('goog.fx.Animation');



/**
 * Map zoom animation.
 * @param {anychart.charts.Map} map
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} duration .
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc .
 * @constructor
 * @extends {goog.fx.Animation}
 */
anychart.animations.MapAnimation = function(map, start, end, duration, opt_silentMode, opt_acc) {
  /**
   * Map chart.
   * @type {anychart.charts.Map}
   * @protected
   */
  this.map = map;

  /**
   * Silent mode.
   * @type {boolean}
   * @protected
   */
  this.silentMode = !!opt_silentMode;

  anychart.animations.MapAnimation.base(this, 'constructor', start, end, duration, opt_acc);
};
goog.inherits(anychart.animations.MapAnimation, goog.fx.Animation);


/** @inheritDoc */
anychart.animations.MapAnimation.prototype.onBegin = function() {
  if (!this.silentMode)
    this.map.mapAnimationController.updateStatus(anychart.animations.MapAnimationController.Status.START);
  anychart.animations.MapAnimation.base(this, 'onBegin');
};


/** @inheritDoc */
anychart.animations.MapAnimation.prototype.onEnd = function() {
  if (!this.silentMode)
    this.map.mapAnimationController.updateStatus(anychart.animations.MapAnimationController.Status.FINISH);
  anychart.animations.MapAnimation.base(this, 'onEnd');
};


/** @inheritDoc */
anychart.animations.MapAnimation.prototype.disposeInternal = function() {
  anychart.animations.MapAnimation.base(this, 'disposeInternal');

  this.map = null;
};
