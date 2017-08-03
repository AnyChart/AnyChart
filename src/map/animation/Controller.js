goog.provide('anychart.mapModule.animation.Controller');



/**
 * Map zoom animation.
 * @constructor
 * @param {anychart.mapModule.Chart} map Target map.
 */
anychart.mapModule.animation.Controller = function(map) {
  /**
   * Map chart.
   * @type {anychart.mapModule.Chart}
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
anychart.mapModule.animation.Controller.Status = {
  START: 1,
  FINISH: 0
};


/**
 * Update status.
 * @param {anychart.mapModule.animation.Controller.Status} status .
 */
anychart.mapModule.animation.Controller.prototype.updateStatus = function(status) {
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
      this.timeout = setTimeout(this.handler, anychart.mapModule.Chart.TIMINGS.ALL_ANIMATION_FINISHED_DELAY, status);
    }
  } else if (this.status && status && this.timeout) {
    clearTimeout(this.timeout);
    this.timeout = null;
  }
};
