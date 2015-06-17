goog.provide('anychart.core.utils.Animation');
goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
anychart.core.utils.Animation = function() {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = false;

  /**
   * @type {number}
   * @private
   */
  this.duration_ = 1000;
};
goog.inherits(anychart.core.utils.Animation, goog.events.EventTarget);


/**
 * @enum {string}
 */
anychart.core.utils.Animation.EventType = {
  ENABLED_CHANGE: goog.events.getUniqueId('enabledChange'),
  DURATION_CHANGE: goog.events.getUniqueId('durationChange')
};


/**
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.utils.Animation}
 */
anychart.core.utils.Animation.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.dispatchEvent(anychart.core.utils.Animation.EventType.ENABLED_CHANGE);
    }
    return this;
  } else {
    return this.enabled_;
  }
};


/**
 * @param {number=} opt_value
 * @return {number|anychart.core.utils.Animation}
 */
anychart.core.utils.Animation.prototype.duration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!isNaN(opt_value) && opt_value > 0 && this.duration_ != opt_value) {
      this.duration_ = opt_value;
      this.dispatchEvent(anychart.core.utils.Animation.EventType.DURATION_CHANGE);
    }
    return this;
  } else {
    return this.duration_;
  }
};


/**
 * @return {Object}
 */
anychart.core.utils.Animation.prototype.serialize = function() {
  return {
    'enabled': this.enabled_,
    'duration': this.duration_
  };
};


/**
 * Setter/getter for animation setting.
 * @param {boolean|Object=} opt_enabled_or_json Whether to enable animation.
 * @param {number=} opt_duration A Duration in milliseconds.
 * @return {anychart.core.utils.Animation} Animations settings object or self for chaining.
 */
anychart.core.utils.Animation.prototype.setup = function(opt_enabled_or_json, opt_duration) {
  if (goog.isBoolean(opt_enabled_or_json)) {
    this.enabled(opt_enabled_or_json);
    if (goog.isDef(opt_duration))
      this.duration(opt_duration);
  } else if (goog.isObject(opt_enabled_or_json)) {
    this.enabled(opt_enabled_or_json['enabled']);
    this.duration(opt_enabled_or_json['duration']);
  }

  return this;
};





