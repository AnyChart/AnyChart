goog.provide('anychart.core.utils.Animation');
goog.require('anychart.core.Base');



/**
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Animation = function() {
  anychart.core.utils.Animation.base(this, 'constructor');

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
goog.inherits(anychart.core.utils.Animation, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Animation.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Turns on animations.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.utils.Animation}
 */
anychart.core.utils.Animation.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.enabled_;
  }
};


/**
 * Set animation duration.
 * @param {number=} opt_value
 * @return {number|anychart.core.utils.Animation}
 */
anychart.core.utils.Animation.prototype.duration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.duration_, true);
    if (this.duration_ != opt_value) {
      this.duration_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.duration_;
  }
};


/** @inheritDoc */
anychart.core.utils.Animation.prototype.serialize = function() {
  return {
    'enabled': this.enabled_,
    'duration': this.duration_
  };
};


/**
 * @inheritDoc
 */
anychart.core.utils.Animation.prototype.setupByJSON = function(json, opt_default) {
  this.enabled(json['enabled']);
  this.duration(json['duration']);
};


/**
 * Special objects to setup current instance.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args
 * @return {boolean} If passed values were recognized as special setup values.
 * @protected
 */
anychart.core.utils.Animation.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    var arg1 = arguments[1];
    if (goog.isDef(arg1)) this.duration(arg1);
    return true;
  }

  if (!isNaN(+arg0)) {
    this.enabled(true);
    this.duration(+arg0);
    return true;
  }

  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


//exports
(function() {
  var proto = anychart.core.utils.Animation.prototype;
  proto['enabled'] = proto.enabled;
  proto['duration'] = proto.duration;
})();
