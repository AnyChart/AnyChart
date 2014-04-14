goog.provide('anychart.scales.OrdinalTicks');

goog.require('anychart.Base');
goog.require('goog.array');



/**
 * Scale ticks.
 * @param {!anychart.scales.Ordinal} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.scales.OrdinalTicks = function(scale) {
  goog.base(this);

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.Ordinal}
   * @private
   */
  this.scale_ = scale;
};
goog.inherits(anychart.scales.OrdinalTicks, anychart.Base);


/**
 * Маска состояний рассинхронизации, которые умеет отправлять этот объект.
 * @type {number}
 */
anychart.scales.OrdinalTicks.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Fixed interval setting.
 * @type {number}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.interval_ = 1;


/**
 * Names for ticks.
 * @type {Array.<string>}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.names_ = null;


/**
 * Explicit ticks array.
 * @type {Array}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.explicit_ = null;


/**
 * Explicit indexes ticks array.
 * @type {Array.<number>}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.explicitIndexes_ = null;


/**
 * Auto calculated ticks cache.
 * @type {Array}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.autoTicks_ = null;


/**
 * Auto calculated tick names cache.
 * @type {Array}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.autoNames_ = null;


/**
 * Gets or sets ticks interval value. Passed value as rounded and defaults to 1 in case of incorrect settings.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.OrdinalTicks)} Interval value or itself for chaining.
 */
anychart.scales.OrdinalTicks.prototype.interval = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = Math.round(opt_value) || 1;
    if (this.interval_ != opt_value) {
      this.interval_ = opt_value;
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.autoNames_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.interval_;
};


/**
 * Setups ticks as an explicit array of fixed ticks IN TERMS OF SCALE VALUE INDEXES.
 * Each
 * @param {Array} ticks Explicit ticks array.
 * @return {!anychart.scales.OrdinalTicks} Returns itself for chaining.
 */
anychart.scales.OrdinalTicks.prototype.set = function(ticks) {
  if (!goog.array.equals(this.explicitIndexes_, ticks)) {
    this.explicitIndexes_ = goog.array.clone(ticks);
    goog.array.sort(this.explicitIndexes_);
    goog.array.removeDuplicates(this.explicitIndexes_);
    this.explicitIndexes_[0] = 0;
    this.explicit_ = null;
    this.autoTicks_ = null;
    this.autoNames_ = null;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Getter and setter for tick names.
 * @param {Array=} opt_values An array of tick aliases.
 * @return {!(anychart.scales.OrdinalTicks|Array)} Names or this for chaining.
 */
anychart.scales.OrdinalTicks.prototype.names = function(opt_values) {
  if (goog.isDef(opt_values)) {
    if (this.names_ != opt_values) {
      this.names_ = opt_values;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  if (!this.names_ && !this.autoNames_) {
    var values = this.get();
    this.autoNames_ = [];
    for (var i = 0; i < values.length; i++) {
      var val = values[i];
      this.autoNames_.push(goog.isArray(val) ? val[0] : val);
    }
  }
  return /** @type {!Array} */(this.names_ || this.autoNames_);
};


/**
 * Returns an array of ticks. Each tick can be:
 *    1) A value in terms of data, to make a tick on.
 *    2) An array of two values to make the tick from the first one to the second one.
 * @return {!Array} Array of ticks.
 */
anychart.scales.OrdinalTicks.prototype.get = function() {
  if (this.explicit_)
    return this.explicit_;
  if (this.explicitIndexes_)
    return this.explicit_ = this.makeValues_(this.explicitIndexes_);
  if (!this.autoTicks_) {
    var res = [];
    for (var i = 0, len = this.scale_.values().length; i < len; i += this.interval_) {
      res.push(i);
    }
    this.autoTicks_ = this.makeValues_(res);
  }
  return /** @type {!Array} */(this.autoTicks_);
};


/**
 * Makes an array of scale value indexes to become an array of scale values.
 * @param {!Array.<number>} indexes An array of scale value indexes.
 * @return {!Array} An array of scale values.
 * @private
 */
anychart.scales.OrdinalTicks.prototype.makeValues_ = function(indexes) {
  var len = indexes.length || 0;
  if (!len) return [];
  var values = this.scale_.values();
  var result = [];
  for (var i = 0; i < len - 1; i++) {
    var curr = indexes[i];
    var next = indexes[i + 1] - 1;
    result.push(curr == next ? values[curr] : [values[curr], values[next]]);
  }
  var last = indexes[len - 1];
  result[len - 1] = (last == values.length - 1) ? values[last] : [values[last], values[values.length - 1]];
  return result;
};


/**
 * Invalidation method used by the scale.
 */
anychart.scales.OrdinalTicks.prototype.markInvalid = function() {
  this.explicit_ = null;
  this.autoTicks_ = null;
  this.autoNames_ = null;
};
