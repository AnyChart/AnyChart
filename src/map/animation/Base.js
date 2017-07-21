goog.provide('anychart.mapModule.animation.Base');
goog.require('goog.fx.Animation');



/**
 * Map zoom animation.
 * @param {anychart.mapModule.Chart} map
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} duration .
 * @param {boolean=} opt_silentMode .
 * @param {Function=} opt_acc .
 * @constructor
 * @extends {goog.fx.Animation}
 */
anychart.mapModule.animation.Base = function(map, start, end, duration, opt_silentMode, opt_acc) {
  /**
   * Map chart.
   * @type {anychart.mapModule.Chart}
   * @protected
   */
  this.map = map;

  /**
   * Silent mode.
   * @type {boolean}
   * @protected
   */
  this.silentMode = !!opt_silentMode;

  anychart.mapModule.animation.Base.base(this, 'constructor', start, end, duration, opt_acc);
};
goog.inherits(anychart.mapModule.animation.Base, goog.fx.Animation);


/** @inheritDoc */
anychart.mapModule.animation.Base.prototype.onBegin = function() {
  if (!this.silentMode)
    this.map.mapAnimationController.updateStatus(anychart.mapModule.animation.Controller.Status.START);
  anychart.mapModule.animation.Base.base(this, 'onBegin');
};


/** @inheritDoc */
anychart.mapModule.animation.Base.prototype.onEnd = function() {
  if (!this.silentMode)
    this.map.mapAnimationController.updateStatus(anychart.mapModule.animation.Controller.Status.FINISH);
  anychart.mapModule.animation.Base.base(this, 'onEnd');
};


/** @inheritDoc */
anychart.mapModule.animation.Base.prototype.disposeInternal = function() {
  anychart.mapModule.animation.Base.base(this, 'disposeInternal');

  this.map = null;
};
