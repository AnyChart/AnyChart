goog.provide('anychart.scales.ScatterTicks');
goog.require('anychart.Base');
goog.require('anychart.enums');



/**
 * Scale ticks.
 * @param {!anychart.scales.Linear} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.scales.ScatterTicks = function(scale) {
  goog.base(this);

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.Linear}
   * @private
   */
  this.scale_ = scale;
};
goog.inherits(anychart.scales.ScatterTicks, anychart.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.ScatterTicks.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Fixed interval setting.
 * @type {number}
 * @private
 */
anychart.scales.ScatterTicks.prototype.interval_ = NaN;


/**
 * Fixed ticks count settings.
 * @type {number}
 * @private
 */
anychart.scales.ScatterTicks.prototype.count_ = 5;


/**
 * Explicit ticks array.
 * @type {Array}
 * @private
 */
anychart.scales.ScatterTicks.prototype.explicit_ = null;


/**
 * Auto calculated ticks cache.
 * @type {Array}
 * @private
 */
anychart.scales.ScatterTicks.prototype.autoTicks_ = null;


/**
 * Base value to arrange the scale range by.
 * @type {number}
 * @private
 */
anychart.scales.ScatterTicks.prototype.base_ = 0;


/**
 * Ticks mode.
 * @type {anychart.enums.ScatterTicksMode|string}
 * @private
 */
anychart.scales.ScatterTicks.prototype.mode_ = anychart.enums.ScatterTicksMode.LINEAR;


/**
 * Gets or sets ticks interval value. Note that interval value can be read only if it was set explicitly.
 * It is returned as NaN otherwise. If opt_value is defined but is not a number or less than 0, it defaults to NaN and
 * count() resets to 5.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.ScatterTicks)} Interval value or itself for chaining.
 */
anychart.scales.ScatterTicks.prototype.interval = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.interval_ != opt_value) {
      if (goog.isNull(opt_value) || isNaN(opt_value) || opt_value < 0) {
        this.count_ = 5;
        this.interval_ = NaN;
      } else {
        this.count_ = NaN;
        this.interval_ = +opt_value;
      }
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.interval_;
};


/**
 * Gets or sets ticks count value. If opt_value is defined, but not a number or less than 2, it defaults to 5.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.ScatterTicks)} Interval value or itself for method chaining.
 */
anychart.scales.ScatterTicks.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.count_ != opt_value) {
      this.interval_ = NaN;
      this.count_ = (isNaN(opt_value) || opt_value < 2) ? 5 : Math.ceil(+opt_value);
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.count_;
};


/**
 * Sets base value, by which auto ticks are arranged.
 * @param {number=} opt_value Base value, if used as a setter.
 * @return {(number|anychart.scales.ScatterTicks)} Base value or itself for chaining.
 */
anychart.scales.ScatterTicks.prototype.base = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.base_ != opt_value) {
      this.base_ = opt_value;
      this.autoTicks_ = null;
      if (!this.explicit_)
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.base_;
};


/**
 * Setups ticks as an explicit array of fixed ticks.
 * @param {Array} ticks Explicit ticks array.
 * @return {!anychart.scales.ScatterTicks} Returns itself for method chaining.
 */
anychart.scales.ScatterTicks.prototype.set = function(ticks) {
  if (!goog.array.equals(this.explicit_, ticks)) {
    this.count_ = NaN;
    this.interval_ = NaN;
    this.explicit_ = goog.array.slice(ticks, 0);
    goog.array.sort(this.explicit_, anychart.utils.compareNumericAsc);
    this.autoTicks_ = null;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Returns an array of ticks. Each tick is a value in terms of data, to make a tick on.
 * @return {!Array} Array of ticks.
 */
anychart.scales.ScatterTicks.prototype.get = function() {
  if (this.explicit_)
    return this.explicit_;
  this.scale_.calculate();
  return /** @type {!Array} */(this.autoTicks_);
};


/**
 * Scatter ticks mode. Linear or logarithmic.
 * @param {(anychart.enums.ScatterTicksMode|string)=} opt_value Value to set.
 * @return {anychart.enums.ScatterTicksMode|anychart.scales.ScatterTicks} Value or itself.
 */
anychart.scales.ScatterTicks.prototype.mode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = ('' + opt_value).toLowerCase();
    if (opt_value == 'log' || opt_value == anychart.enums.ScatterTicksMode.LOGARITHMIC)
      opt_value = anychart.enums.ScatterTicksMode.LOGARITHMIC;
    else
      opt_value = anychart.enums.ScatterTicksMode.LINEAR;
    if (this.mode_ != opt_value) {
      this.autoTicks_ = null;
      this.mode_ = opt_value;
      if (!this.explicit_)
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return /** @type {anychart.enums.ScatterTicksMode} */(this.mode_);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {boolean=} opt_canModifyMin If the minimum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @param {number=} opt_logBase Log base value for logarithmic scales. Defaults to 10.
 * @return {!Array} Array of two values: [newMin, newMax].
 */
anychart.scales.ScatterTicks.prototype.setup = function(min, max, opt_canModifyMin, opt_canModifyMax, opt_logBase) {
  if (this.mode_ == anychart.enums.ScatterTicksMode.LOGARITHMIC)
    return this.setupLogarithmic_(min, max, opt_logBase || 10, opt_canModifyMin, opt_canModifyMax);
  else
    return this.setupLinear_(min, max, opt_canModifyMin, opt_canModifyMax);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {!Array} values Values array. Should contain 2 values if this is major ticks object and an array of major
 *    ticks if this is a minor ticks object.
 * @param {number=} opt_logBase Log base value for logarithmic scales. Defaults to 10.
 * @param {number=} opt_majorDesiredMin If major minimum was explicit and interval was auto, there could be a situation,
 *    when minimum doesn't contain interval. We need to know the value that major interval calculator desired to be the
 *    minimum in that case, to correctly calculate the interval on the part from explicit minimum (which is values[0] in
 *    that case) and first aligned tick (values[1]), as there should be less than this.count_ minor ticks.
 * @param {number=} opt_majorDesiredMax If major maximum was explicit and interval was auto, there could be a situation,
 *    when maximum doesn't contain interval. We need to know the value that major interval calculator desired to be the
 *    maximum in that case, to correctly calculate the interval on the part from last aligned tick (which is
 *    values[values.length - 2] in that case) and the explicit maximum (which is the last value in values).
 */
anychart.scales.ScatterTicks.prototype.setupAsMinor = function(values, opt_logBase, opt_majorDesiredMin, opt_majorDesiredMax) {
  if (this.explicit_) {
    this.autoTicks_ = null;
  } else {
    if (this.autoTicks_)
      this.autoTicks_.lenght = 0;
    else
      this.autoTicks_ = [];
    if (values.length < 2) return;
    opt_logBase = opt_logBase || 10;
    var adder = (this.mode_ == anychart.enums.ScatterTicksMode.LOGARITHMIC) ?
        this.addMinorLogarithmicTicksPortion_ :
        this.addMinorLinearTicksPortion_;
    var min, max;
    var start;
    if (goog.isDef(opt_majorDesiredMin)) {
      min = values[0];
      max = values[1];
      adder.call(this, min, max, opt_majorDesiredMin, max, opt_logBase);
      start = 1;
    } else
      start = 0;
    var end = values.length - 1;
    if (goog.isDef(opt_majorDesiredMax))
      end--;
    for (var i = start; i <= end - 1; i++) {
      min = values[i];
      max = values[i + 1];
      adder.call(this, min, max, min, max, opt_logBase);
    }
    if (goog.isDef(opt_majorDesiredMax)) {
      min = values[end];
      max = values[end + 1];
      adder.call(this, min, max, min, opt_majorDesiredMax, opt_logBase);
    }
  }
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {boolean=} opt_canModifyMin If the minimum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two to four values: [newMin, newMax, opt_desiredMin, opt_desiredMax]. Desired values can
 *    be absent.
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLinear_ = function(min, max, opt_canModifyMin, opt_canModifyMax) {
  this.autoTicks_ = null;
  var result = [min, max];
  if (this.explicit_) {
    if (opt_canModifyMin)
      result[0] = Math.min(min, this.explicit_[0] || 0);
    if (opt_canModifyMax)
      result[1] = Math.max(max, this.explicit_[this.explicit_.length - 1] || 0);
  } else {
    var ticks = [];
    var interval = this.interval_;
    if (isNaN(interval)) {
      // TODO(Anton Saukh): this code can return either count of intervals, or count+1 because of range bounds aligning.
      var count = this.count_ - 1; // it should be valid here
      var range = max - min;
      interval = range / count;
      // Here we can add other interval rounding options and choose the best
      // For example, with fractional values powers of 2 give better result because they divide interval in 2, 4, 8,
      // with big values: powers of 10 work better, and so long.
      var log = Math.log(interval);
      var val1 = Math.pow(10, Math.floor(log * Math.LOG10E));
      var val2 = Math.pow(10, Math.ceil(log * Math.LOG10E));
      //var val3 = Math.pow(2, Math.floor(log * Math.LOG2E));
      //var val4 = Math.pow(2, Math.ceil(log * Math.LOG2E));
      log = anychart.math.log(interval / val2, 2);
      var val5 = Math.pow(2, Math.floor(log)) * val2;
      var val6 = Math.pow(2, Math.ceil(log)) * val2;
      //var val5 = val1 / 2;
      //var val6 = val1 / 4;
      //var val7 = val1 / 8;
      interval = Math.min(
          anychart.utils.alignRight(interval, val1),
          anychart.utils.alignRight(interval, val2),
          //anychart.utils.alignRight(interval, val3),
          //anychart.utils.alignRight(interval, val4),
          anychart.utils.alignRight(interval, val5),
          anychart.utils.alignRight(interval, val6)
          );
    }
    interval = Math.max(interval, 1e-7);
    var desiredMin = anychart.math.round(anychart.utils.alignLeft(min, interval, this.base_), 7);
    if (opt_canModifyMin)
      result[0] = min = desiredMin;
    else if (min - desiredMin > 1e-7) {
      ticks.push(min);
      result[2] = desiredMin;
    }
    var desiredMax = anychart.math.round(anychart.utils.alignRight(max, interval, this.base_), 7);
    if (opt_canModifyMax)
      result[1] = max = desiredMax;
    else if (desiredMax - max > 1e-7) {
      result[3] = desiredMax;
    }
    for (var j = anychart.math.round(anychart.utils.alignRight(min, interval, this.base_), 7);
         j <= max;
         j = anychart.math.round(j + interval, 7)) {
      ticks.push(j);
    }
    if (3 in result)
      ticks.push(max);
    this.autoTicks_ = ticks;
  }
  return result;
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {number} logBase Log base value.
 * @param {boolean=} opt_canModifyMin If the minimum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two values: [newMin, newMax].
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLogarithmic_ = function(min, max, logBase, opt_canModifyMin, opt_canModifyMax) {
  this.autoTicks_ = null;
  var result = [min, max];
  if (this.explicit_) {
    if (opt_canModifyMin)
      result[0] = Math.min(min, this.explicit_[0] || 0);
    if (opt_canModifyMax)
      result[1] = Math.max(max, this.explicit_[this.explicit_.length - 1] || 0);
  } else {
    min = anychart.math.log(min, logBase);
    max = anychart.math.log(max, logBase);
    var ticks = [];
    var interval = this.interval_;
    if (isNaN(interval)) {
      // calculating the interval here
      var count = this.count_ - 1; // it should be valid here
      var range = max - min;
      interval = range / count;
      // Here we can add other interval rounding options and choose the best
      // All interval aligners are rounded, because we cannot show pretty intervals with non-round powers of logBase
      // Because of that, this algorithm produces from 2 to count+1 ticks here:(
      var log = Math.log(interval);
      var val1 = Math.ceil(Math.pow(10, Math.floor(log * Math.LOG10E)));
      var val2 = Math.ceil(Math.pow(10, Math.ceil(log * Math.LOG10E)));
      var val3 = Math.ceil(Math.pow(2, Math.floor(log * Math.LOG2E)));
      var val4 = Math.ceil(Math.pow(2, Math.ceil(log * Math.LOG2E)));
      var val5 = Math.ceil(val1 / 2);
      var val6 = Math.ceil(val1 / 4);
      var val7 = Math.ceil(val1 / 8);
      interval = Math.min(
          anychart.utils.alignRight(interval, val1),
          anychart.utils.alignRight(interval, val2),
          anychart.utils.alignRight(interval, val3),
          anychart.utils.alignRight(interval, val4),
          anychart.utils.alignRight(interval, val5),
          anychart.utils.alignRight(interval, val6),
          anychart.utils.alignRight(interval, val7));
    }
    interval = Math.max(interval, 1e-7);

    var desiredMin = anychart.math.round(anychart.utils.alignLeft(min, interval, this.base_), 7);
    if (opt_canModifyMin) {
      min = desiredMin;
      result[0] = anychart.math.pow(logBase, desiredMin);
    } else if (min - desiredMin > 1e-7) {
      ticks.push(anychart.math.pow(logBase, min));
      result[2] = anychart.math.pow(logBase, desiredMin);
    }
    var desiredMax = anychart.math.round(anychart.utils.alignRight(max, interval, this.base_), 7);
    if (opt_canModifyMax) {
      max = desiredMax;
      result[1] = anychart.math.pow(logBase, desiredMax);
    } else if (desiredMax - max > 1e-7) {
      result[3] = anychart.math.pow(logBase, desiredMax);
    }
    for (var j = anychart.math.round(anychart.utils.alignRight(min, interval, this.base_), 7);
         j <= max;
         j = anychart.math.round(j + interval, 7)) {
      ticks.push(anychart.math.pow(logBase, j));
    }
    if (3 in result)
      ticks.push(anychart.math.pow(logBase, max));
    this.autoTicks_ = ticks;
  }
  return result;
};


/**
 * Adds a portion of ticks to this.autoTicks_. Just an optimisation.
 * @param {number} min Min of range where ticks should be placed.
 * @param {number} max Max of range where ticks should be placed.
 * @param {number} rangeMin Min for interval calculation.
 * @param {number} rangeMax Max for interval calculation.
 * @private
 */
anychart.scales.ScatterTicks.prototype.addMinorLinearTicksPortion_ = function(min, max, rangeMin, rangeMax) {
  var interval = this.interval_;
  if (isNaN(interval)) {
    var range = rangeMax - rangeMin;
    interval = range / (this.count_ - 1);
  }
  interval = Math.max(interval, 1e-7);
  /** @type {number|undefined} */
  var lastVal = this.autoTicks_[this.autoTicks_.length - 1];
  max = anychart.math.round(max, 7);
  for (var i = anychart.math.round(min, 7); i <= max; i = anychart.math.round(i + interval, 7)) {
    if (lastVal != i)
      this.autoTicks_.push(i);
    lastVal = i;
  }
};


/**
 * Adds a portion of ticks to this.autoTicks_. Just an optimisation.
 * @param {number} min Min of range where ticks should be placed.
 * @param {number} max Max of range where ticks should be placed.
 * @param {number} rangeMin Min for interval calculation.
 * @param {number} rangeMax Max for interval calculation.
 * @param {number} logBase
 * @private
 */
anychart.scales.ScatterTicks.prototype.addMinorLogarithmicTicksPortion_ = function(min, max, rangeMin, rangeMax, logBase) {
  var interval = this.interval_;
  min = anychart.math.log(min, logBase);
  max = anychart.math.log(max, logBase);
  rangeMin = anychart.math.log(rangeMin, logBase);
  rangeMax = anychart.math.log(rangeMax, logBase);
  if (isNaN(interval)) {
    var range = rangeMax - rangeMin;
    interval = range / (this.count_ - 1);
  }
  interval = Math.max(interval, 1e-7);
  /** @type {number|undefined} */
  var lastVal = this.autoTicks_[this.autoTicks_.length - 1];
  max = anychart.math.round(max, 7);
  for (var i = anychart.math.round(min, 7); i <= max; i = anychart.math.round(i + interval, 7)) {
    if (lastVal != i)
      this.autoTicks_.push(anychart.math.pow(logBase, i));
    lastVal = i;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.ScatterTicks.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['mode'] = this.mode();
  data['base'] = this.base();
  data['explicit'] = this.explicit_;
  data['count'] = this.count_;
  data['interval'] = this.interval_;
  return data;
};


/** @inheritDoc */
anychart.scales.ScatterTicks.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', value);
  this.mode(value['mode']);
  this.base(value['base']);
  this.explicit_ = value['explicit'] || null;
  this.count_ = goog.isNull(value['count']) ? NaN : Math.max(2, Math.ceil(value['count']));
  this.interval_ = goog.isNull(value['interval']) ? NaN : value['interval'];
  this.resumeSignalsDispatching(true);
  return this;
};


//exports
anychart.scales.ScatterTicks.prototype['interval'] = anychart.scales.ScatterTicks.prototype.interval;
anychart.scales.ScatterTicks.prototype['count'] = anychart.scales.ScatterTicks.prototype.count;
anychart.scales.ScatterTicks.prototype['base'] = anychart.scales.ScatterTicks.prototype.base;
anychart.scales.ScatterTicks.prototype['set'] = anychart.scales.ScatterTicks.prototype.set;
anychart.scales.ScatterTicks.prototype['get'] = anychart.scales.ScatterTicks.prototype.get;
anychart.scales.ScatterTicks.prototype['mode'] = anychart.scales.ScatterTicks.prototype.mode;
