goog.provide('anychart.animations.MapAnimationController');



/**
 * Map zoom animation.
 * @constructor
 * @param {anychart.charts.Map} map Target map.
 */
anychart.animations.MapAnimationController = function(map) {
  /**
   * Map chart.
   * @type {anychart.charts.Map}
   */
  this.map = map;

  /**
   * Current map animation status.
   * @type {number}
   */
  this.status = 0;

  /**
   * Timeout for animation end.
   * @type {?number}
   */
  this.timeout = null;

  /**
   * Animation end handler.
   * @type {Function}
   */
  this.handler = goog.bind(function(status) {
    this.status = status;
    this.map.dispatchEvent(anychart.enums.EventType.ANIMATION_END);
    this.timeout = null;
  }, this);
};


/**
 * Controller statuses.
 * @enum {number}
 */
anychart.animations.MapAnimationController.Status = {
  START: 1,
  FINISH: 0
};


/**
 * Update status.
 * @param {anychart.animations.MapAnimationController.Status} status .
 */
anychart.animations.MapAnimationController.prototype.updateStatus = function(status) {
  if (this.status ^ status) {
    if (this.timeout && status) {
      clearTimeout(this.timeout);
      this.timeout = null;
    } else if (status) {
      this.status = status;
      var root = this.map.getRootScene();

      //@todo (blackart) because in anychart.core.Base@430 parentEventTarget sets as null.
      if (this.map != root) this.map.setParentEventTarget(root);

      this.map.dispatchEvent(anychart.enums.EventType.ANIMATION_START);
    } else {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(this.handler, anychart.charts.Map.TIMINGS.ALL_ANIMATION_FINISHED_DELAY, status);
    }
  } else if (this.status && status && this.timeout) {
    clearTimeout(this.timeout);
    this.timeout = null;
  }
};
