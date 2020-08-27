goog.provide('anychart.scales.ScatterTicks');
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * Scale ticks.
 * @param {!anychart.scales.ScatterBase} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.ScatterTicks = function(scale) {
  anychart.scales.ScatterTicks.base(this, 'constructor');

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.ScatterBase}
   * @private
   */
  this.scale_ = scale;

  /**
   * Whether to allow fractional ticks calculation.
   * NOTE: Logarithmic mode always turns this flag to true.
   * @type {boolean}
   * @private
   */
  this.allowFractional_;
};
goog.inherits(anychart.scales.ScatterTicks, anychart.core.Base);


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
anychart.scales.ScatterTicks.prototype.minCount_ = 4;


/**
 * Fixed ticks count settings.
 * @type {number}
 * @private
 */
anychart.scales.ScatterTicks.prototype.maxCount_ = 6;


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
 * Whether to allow fractional values in ticks.
 * @param {boolean=} opt_value - Value to set.
 * @return {anychart.scales.ScatterTicks|boolean}
 */
anychart.scales.ScatterTicks.prototype.allowFractional = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.allowFractional_ != opt_value) {
      this.allowFractional_ = opt_value;
      if (this.mode_ != anychart.enums.ScatterTicksMode.LOGARITHMIC)
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.allowFractional_;
};


/**
 * Getter/setter for interval.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.ScatterTicks)} Interval value or itself for chaining.
 */
anychart.scales.ScatterTicks.prototype.interval = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.interval_ != opt_value) {
      opt_value = anychart.utils.toNumber(opt_value);
      if (opt_value <= 0) {
        this.minCount_ = 4;
        this.maxCount_ = 6;
        this.interval_ = NaN;
      } else {
        this.minCount_ = NaN;
        this.maxCount_ = NaN;
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
 * Getter/setter for count.
 * @param {number=} opt_valueOrMinValue Ticks count value if used as a setter.
 * @param {number=} opt_maxValue Ticks count value if used as a setter.
 * @return {(Array.<number>|anychart.scales.ScatterTicks)} Interval value or itself for method chaining.
 */
anychart.scales.ScatterTicks.prototype.count = function(opt_valueOrMinValue, opt_maxValue) {
  if (goog.isDef(opt_valueOrMinValue)) {
    if (this.minCount_ != opt_valueOrMinValue) {
      this.interval_ = NaN;
      this.minCount_ = Math.ceil(anychart.utils.toNumber(opt_valueOrMinValue));
      this.maxCount_ = Math.ceil(anychart.utils.toNumber(opt_maxValue));
      // NaN checks included! DO NOT INVERT
      if (!(this.minCount_ >= 2)) this.minCount_ = 4;
      if (!(this.maxCount_ >= this.minCount_)) this.maxCount_ = this.minCount_;
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return [this.minCount_, this.maxCount_];
};


/**
 * Round passed value to the closest tick value.
 * If no ticks presented return passed value.
 *
 * @param {number} value - Value need to be rounded.
 *
 * @return {number} - Rounded value.
 */
anychart.scales.ScatterTicks.prototype.valueToClosestTick = function(value) {
  var ticks = this.getInternal();

  if (ticks.length) {
    var currentTick = ticks[0];
    var nextTick = currentTick;
    var minTick = Math.min.apply(null, ticks);
    var maxTick = Math.max.apply(null, ticks);

    var clampValue = goog.math.clamp(value, minTick, maxTick);

    // All values that is greater then maximum tick or less then minimum tick.
    if (clampValue != value) {
      return clampValue;
    }

    for (var i = 0; i < ticks.length - 1; i++) {
      currentTick = ticks[i];
      nextTick = ticks[i + 1];
      var interval = nextTick - currentTick;

      var halfInterval = interval / 2;

      var left = currentTick - halfInterval;
      var right = currentTick + halfInterval;

      if (value >= left && value < right) {
        return currentTick;
      }
    }
  }
  return value;
};


/**
 * Getter/setter for base.
 * @param {number=} opt_value Base value for ticks.
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
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.9, 1.1, 1.4, 1.2, 1.9]);
 * chart.yScale().ticks().set([0,2,4,6]);
 * @param {Array} ticks Explicit ticks array.
 * @return {!anychart.scales.ScatterTicks} Returns itself for method chaining.
 */
anychart.scales.ScatterTicks.prototype.set = function(ticks) {
  if (!goog.array.equals(this.explicit_, ticks)) {
    this.minCount_ = NaN;
    this.maxCount_ = NaN;
    this.interval_ = NaN;
    this.explicit_ = goog.array.slice(ticks, 0);
    goog.array.removeDuplicates(this.explicit_);
    goog.array.sort(this.explicit_, anychart.utils.compareNumericAsc);
    this.autoTicks_ = null;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Returns an array of ticks. Each tick is a value in terms of data, to make a tick on.<br/>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or after <b>chart.draw()</b>
 * @example <t>lineChart</t>
 * chart.line([-2, 11, 2, 4]);
 * chart.container(stage).draw();
 * var currentTicks = chart.yScale().ticks().get();
 * // Returns [-4, 0, 4, 8, 12, 16].
 * @return {!Array} Array of ticks.
 */
anychart.scales.ScatterTicks.prototype.get = function() {
  var ticks = this.getInternal();
  return goog.array.filter(ticks, function(el) {
    var val = this.transform(el);
    return val >= 0 && val <= 1;
  }, this.scale_);
};


/**
 * Unfiltered ticks getter.
 * @return {!Array}
 */
anychart.scales.ScatterTicks.prototype.getInternal = function() {
  var ticks;
  if (this.explicit_) {
    ticks = this.explicit_;
  } else {
    this.scale_.calculate();
    ticks = this.autoTicks_;
  }
  return ticks || [];
};


/**
 * Getter/setter for mode.
 * @param {(anychart.enums.ScatterTicksMode|string)=} opt_value Value to set.
 * @return {anychart.enums.ScatterTicksMode|anychart.scales.ScatterTicks} Value or itself.
 */
anychart.scales.ScatterTicks.prototype.mode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value).toLowerCase();
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
 * @param {number=} opt_borderLog Log of non-linear border value for logarithmic scales. Defaults to 0.
 * @return {Array} Array of two values: [newMin, newMax].
 */
anychart.scales.ScatterTicks.prototype.setupAsMajor = function(min, max, opt_canModifyMin, opt_canModifyMax, opt_logBase, opt_borderLog) {
  var result;
  if (this.explicit_) {
    this.autoTicks_ = null;
    result = [min, max];
    if (opt_canModifyMin)
      result[0] = Math.min(min, this.explicit_[0] || 0);
    if (opt_canModifyMax)
      result[1] = Math.max(max, this.explicit_[this.explicit_.length - 1] || 0);
  } else {
    var tmp;
    if (this.mode_ == anychart.enums.ScatterTicksMode.LOGARITHMIC) {
      tmp = this.setupLogarithmic_(min, max, opt_logBase || 10, opt_borderLog || 0, !!opt_canModifyMin, !!opt_canModifyMax);
    } else {
      tmp = this.setupLinear_(min, max, !!opt_canModifyMin, !!opt_canModifyMax, this.allowFractional_, this.base_);
    }
    this.autoTicks_ = tmp.ticks;
    result = tmp.result;
  }
  return result;
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
 *    that case) and first aligned tick (values[1]), as there should be less than this.minCount_ minor ticks.
 * @param {number=} opt_majorDesiredMax If major maximum was explicit and interval was auto, there could be a situation,
 *    when maximum doesn't contain interval. We need to know the value that major interval calculator desired to be the
 *    maximum in that case, to correctly calculate the interval on the part from last aligned tick (which is
 *    values[values.length - 2] in that case) and the explicit maximum (which is the last value in values).
 * @param {number=} opt_borderLog
 */
anychart.scales.ScatterTicks.prototype.setupAsMinor = function(values, opt_logBase, opt_majorDesiredMin, opt_majorDesiredMax, opt_borderLog) {
  if (this.explicit_) {
    this.autoTicks_ = null;
  } else {
    if (this.autoTicks_)
      this.autoTicks_.length = 0;
    else
      this.autoTicks_ = [];
    if (values.length < 2) return;
    opt_logBase = opt_logBase || 10;
    var logMode = (this.mode_ == anychart.enums.ScatterTicksMode.LOGARITHMIC);
    var adder = logMode ?
        this.addMinorLogarithmicTicksPortion_ :
        this.addMinorLinearTicksPortion_;
    var min, max;
    var end = values.length - 1;
    var backupInterval = this.interval_;
    var backupMinCount = this.minCount_;
    if (!isNaN(this.interval_)) {
      max = values[end];
      min = values[0];
      if (logMode) {
        min = anychart.math.log(min, opt_logBase);
        max = anychart.math.log(max, opt_logBase);
      }
      if ((max - min) / this.interval_ > this.scale_.maxTicksCount()) {
        anychart.core.reporting.warning(anychart.enums.WarningCode.TOO_MANY_TICKS, null, [max - min, this.interval_]);
        this.interval_ = NaN;
        this.minCount_ = 4;
      }
    }
    var start;
    if (goog.isDef(opt_majorDesiredMin)) {
      min = values[0];
      max = values[1];
      adder.call(this, min, max, opt_majorDesiredMin, max, this.minCount_, opt_logBase, opt_borderLog || 0, true);
      start = 1;
    } else
      start = 0;
    if (goog.isDef(opt_majorDesiredMax))
      end--;
    for (var i = start; i <= end - 1; i++) {
      min = values[i];
      max = values[i + 1];
      adder.call(this, min, max, min, max, this.minCount_, opt_logBase, opt_borderLog || 0);
    }
    if (goog.isDef(opt_majorDesiredMax)) {
      min = values[end];
      max = values[end + 1];
      adder.call(this, min, max, min, opt_majorDesiredMax, this.minCount_, opt_logBase, opt_borderLog || 0);
    }
    this.interval_ = backupInterval;
    this.minCount_ = backupMinCount;
  }
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {number} logBase Log base value.
 * @param {number} borderLog
 * @param {boolean} canModifyMin If the minimum can be modified.
 * @param {boolean} canModifyMax If the maximum can be modified.
 * @return {{ticks: Array.<number>, result: Array.<number>}}
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLogarithmic_ = function(min, max, logBase, borderLog, canModifyMin, canModifyMax) {
  var minLog = anychart.math.log(Math.abs(min), logBase);
  var maxLog = anychart.math.log(Math.abs(max), logBase);
  var minMaxProd = min * max;
  var result;
  var pow = function(x) {
    return anychart.math.pow(logBase, x);
  };
  var negatePow = function(x) {
    return -pow(x);
  };
  var func = function(x) {
    return (x < 0) ?
        -pow(-x + borderLog - 1) :
        (x ?
            pow(x + borderLog - 1) :
            0);
  };
  var reverse = false;
  if (minMaxProd > 0) {
    if (min > 0) {
      result = this.setupLinear_(minLog, maxLog, canModifyMin, canModifyMax);
      func = pow;
      borderLog = result.result[0];
    } else {
      result = this.setupLinear_(maxLog, minLog, canModifyMin, canModifyMax);
      func = negatePow;
      reverse = true;
      borderLog = result.result[1];
    }
  } else if (minMaxProd < 0) {
    maxLog -= borderLog - 1;
    minLog -= borderLog - 1;
    result = this.setupLinear_(-minLog, maxLog, canModifyMin, canModifyMax);
  } else {
    // min max interval touches zero with either side
    if (max) {
      maxLog -= borderLog - 1;
      result = this.setupLinear_(0, maxLog, canModifyMin, canModifyMax);
    } else {
      minLog -= borderLog - 1;
      result = this.setupLinear_(-minLog, 0, canModifyMin, canModifyMax);
    }
  }
  result.ticks = goog.array.map(result.ticks, func);
  result.result = goog.array.map(result.result, func);
  if (reverse) {
    result.ticks.reverse();
    var tmp = result.result[0];
    result.result[0] = result.result[1];
    result.result[1] = tmp;
    tmp = result.result[2];
    result.result[2] = result.result[3];
    result.result[3] = tmp;
  }
  result.result[4] = borderLog;
  return result;
};


/**
 * @param {number} min
 * @param {number} max
 * @param {boolean} canModifyMin
 * @param {boolean} canModifyMax
 * @param {boolean=} opt_allowFractionalTicks
 * @param {number=} opt_base
 * @return {{ticks: Array.<number>, result: Array.<number>}}
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLinear_ = function(min, max, canModifyMin, canModifyMax, opt_allowFractionalTicks, opt_base) {
  opt_base = opt_base || 0;
  var interval = this.interval_;
  var minCount = this.minCount_;
  var maxCount = this.maxCount_;
  var range = max - min;
  if (!isNaN(interval) && (range / interval) > /** @type {number} */(this.scale_.maxTicksCount())) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.TOO_MANY_TICKS, null, [range, interval]);
    interval = NaN;
    minCount = 4;
    maxCount = 6;
  }
  if (isNaN(interval)) {
    var currentInterval = NaN,
        currentDiff = NaN;
    for (var q = minCount; q <= maxCount; q++) {
      var count = q - 1; // it should be valid here
      currentInterval = anychart.math.specialRound(range / count);
      if (currentInterval == 0)
        currentInterval = anychart.math.specialRound(range / count, 10);

      // Here we can add other interval rounding options and choose the best
      // For example, with fractional values powers of 2 give better result because they divide interval in 2, 4, 8,
      // with big values: powers of 10 work better, and so long.
      var log = Math.log(currentInterval);
      var floorPow10 = Math.pow(10, Math.floor(log * Math.LOG10E));
      var ceilPow10 = Math.pow(10, Math.ceil(log * Math.LOG10E));
      var log2 = anychart.math.log(currentInterval / ceilPow10, 2);
      var intervals = [
        floorPow10,
        ceilPow10,
        (currentInterval < floorPow10 + floorPow10) ? floorPow10 / 2 : Infinity,
        Math.pow(2, Math.floor(log2)) * ceilPow10,
        Math.pow(2, Math.ceil(log2)) * ceilPow10
      ];

      intervals = goog.array.map(intervals, function(x) {
        return anychart.utils.alignRight(currentInterval, x, 0, 10) || Infinity;
      });

      if (!opt_allowFractionalTicks) {
        intervals = goog.array.map(intervals, function(x) {
          return (isFinite(x) && ~~x == x) ? x : Infinity;
        });
      }

      var alignedMin = Math.min.apply(null, intervals);

      //Here we can't allow currentInterval to be zero and Infinity.
      if (alignedMin && isFinite(alignedMin)) {
        currentInterval = alignedMin;
      } else if (!opt_allowFractionalTicks) {
        currentInterval = Math.round(currentInterval) || 1;
      }

      var tmpDiff1 = anychart.math.specialRound(anychart.utils.alignLeft(min, currentInterval, opt_base)) - min;
      tmpDiff1 *= tmpDiff1;
      var tmpDiff2 = anychart.math.specialRound(anychart.utils.alignRight(max, currentInterval, opt_base)) - max;
      tmpDiff2 *= tmpDiff2;
      var tmpDiff = tmpDiff1 + tmpDiff2;

      if (isNaN(currentDiff) || tmpDiff < currentDiff) {
        currentDiff = tmpDiff;
        interval = currentInterval;
      }
    }
  }

  if (isNaN(interval)) {
    // This should never happen but if interval is still NaN browser crashes
    interval = 0.5;
  }

  var result = [min, max];
  var ticks = [];

  var precision = anychart.math.getPrecision(interval);
  var desiredMin = anychart.math.specialRound(anychart.utils.alignLeft(min, interval, opt_base, precision), precision);
  if (canModifyMin)
    result[0] = min = desiredMin;
  else if (min - desiredMin > 1e-7) {
    ticks.push(min);
    result[2] = desiredMin;
  }
  var desiredMax = anychart.math.specialRound(anychart.utils.alignRight(max, interval, opt_base, precision), precision);
  if (canModifyMax)
    result[1] = max = desiredMax;
  else if (desiredMax - max > 1e-7) {
    result[3] = desiredMax;
  }

  for (var j = anychart.math.specialRound(anychart.utils.alignRight(min, interval, opt_base, precision), precision);
       j <= max;
       j = anychart.math.specialRound(j + interval, precision)) {
    ticks.push(j);
  }

  if (3 in result)
    ticks.push(max);

  return {ticks: ticks, result: result};
};


/**
 * Adds a portion of ticks to this.autoTicks_. Just an optimisation.
 * @param {number} min Min of range where ticks should be placed.
 * @param {number} max Max of range where ticks should be placed.
 * @param {number} rangeMin Min for interval calculation.
 * @param {number} rangeMax Max for interval calculation.
 * @param {number} count
 * @param {number} logBase
 * @param {number} borderLog
 * @param {boolean=} opt_isInitial
 * @private
 */
anychart.scales.ScatterTicks.prototype.addMinorLinearTicksPortion_ = function(min, max, rangeMin, rangeMax, count, logBase, borderLog, opt_isInitial) {
  var interval = this.getLinearInterval_(rangeMin, rangeMax, count);
  var skipVal = this.autoTicks_[this.autoTicks_.length - 1];
  var result = this.autoTicks_;
  this.putLinearTicks_(min, max, interval, skipVal, result, opt_isInitial);
};


/**
 * @param {number} min
 * @param {number} max
 * @param {number} interval
 * @param {number} skipVal
 * @param {Array.<number>=} opt_res
 * @param {boolean=} opt_isInitial
 * @return {Array.<number>}
 * @private
 */
anychart.scales.ScatterTicks.prototype.putLinearTicks_ = function(min, max, interval, skipVal, opt_res, opt_isInitial) {
  var res = opt_res || [];
  max = anychart.math.round(max, 7);
  var prev, i, iter = 0;

  if (opt_isInitial && max <= this.base_) {
    /*
      This if (opt_isInitial && max <= this.base_) condition fixes
      https://anychart.atlassian.net/browse/DVF-4292 by
      adding tick not from min to base_ value, but from base_ to min.
     */
    for (i = prev = anychart.math.round(max, 7); i >= min; i = anychart.math.round(i - interval, 7)) {
      if (skipVal != i)
        goog.array.insertAt(res, i);
      if (iter && prev == i)
        break;
      iter++;
    }
  } else {
    for (i = prev = anychart.math.round(min, 7); i <= max; i = anychart.math.round(i + interval, 7)) {
      if (skipVal != i)
        res.push(i);
      if (iter && prev == i)
        break;
      iter++;
    }
  }
  return res;
};


/**
 * @param {number} min
 * @param {number} max
 * @param {number} count
 * @return {number}
 * @private
 */
anychart.scales.ScatterTicks.prototype.getLinearInterval_ = function(min, max, count) {
  var interval = this.interval_;
  if (isNaN(interval)) {
    var range = max - min;
    interval = range / (count - 1);
  }
  return Math.max(interval, 1e-7);
};


/**
 * Adds a portion of ticks to this.autoTicks_. Just an optimisation.
 * @param {number} min Min of range where ticks should be placed.
 * @param {number} max Max of range where ticks should be placed.
 * @param {number} rangeMin Min for interval calculation.
 * @param {number} rangeMax Max for interval calculation.
 * @param {number} count
 * @param {number} logBase
 * @param {number} borderLog
 * @private
 */
anychart.scales.ScatterTicks.prototype.addMinorLogarithmicTicksPortion_ = function(min, max, rangeMin, rangeMax, count, logBase, borderLog) {
  var pow = function(x) {
    return anychart.math.pow(logBase, x);
  };
  var negatePow = function(x) {
    return -pow(x);
  };
  var func = function(x) {
    return (x < 0) ?
        -pow(-x + borderLog - 1) :
        (x ?
            pow(x + borderLog - 1) :
            0);
  };
  var rangeMinLog = anychart.math.log(Math.abs(rangeMin), logBase);
  var rangeMaxLog = anychart.math.log(Math.abs(rangeMax), logBase);
  var minLog = anychart.math.log(Math.abs(min), logBase);
  var maxLog = anychart.math.log(Math.abs(max), logBase);
  var minMaxProd = rangeMin * rangeMax;

  var result, interval;
  var reverse = false;
  if (minMaxProd > 0) {
    if (min > 0) {
      func = pow;
    } else {
      var tmp = rangeMaxLog;
      rangeMaxLog = rangeMinLog;
      rangeMinLog = tmp;
      tmp = maxLog;
      maxLog = minLog;
      minLog = tmp;
      func = negatePow;
      reverse = true;
    }
  } else {
    minLog = -(minLog - borderLog + 1);
    maxLog -= borderLog - 1;
    rangeMinLog = -(rangeMinLog - borderLog + 1);
    rangeMaxLog -= borderLog - 1;
    if (!minMaxProd) {
      // min max interval touches zero with either side
      if (max) {
        rangeMinLog = 0;
        minLog = 0;
      } else {
        rangeMaxLog = 0;
        maxLog = 0;
      }
    }
  }
  interval = this.getLinearInterval_(rangeMinLog, rangeMaxLog, count);
  result = this.putLinearTicks_(minLog, maxLog, interval, NaN);
  result = goog.array.map(result, func);
  if (reverse) {
    result.reverse();
  }
  if (this.autoTicks_[this.autoTicks_.length - 1] == result[0])
    result.shift();
  this.autoTicks_ = goog.array.concat(this.autoTicks_, result);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.ScatterTicks.prototype.serialize = function() {
  var json = anychart.scales.ScatterTicks.base(this, 'serialize');
  json['mode'] = this.mode_;
  json['base'] = this.base_;
  json['allowFractional'] = this.allowFractional_;
  if (this.explicit_)
    json['explicit'] = this.explicit_;
  else {
    if (this.minCount_ == this.maxCount_) {
      if (!isNaN(this.minCount_)) json['count'] = this.minCount_;
    } else {
      if (!isNaN(this.minCount_)) json['minCount'] = this.minCount_;
      if (!isNaN(this.maxCount_)) json['maxCount'] = this.maxCount_;
    }
    if (!isNaN(this.interval_)) json['interval'] = this.interval_;
  }
  return json;
};


/** @inheritDoc */
anychart.scales.ScatterTicks.prototype.setupSpecial = function(isDefault, var_args) {
  var arg0 = arguments[1];
  if (goog.isArray(arg0)) {
    this.set(arg0);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.scales.ScatterTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.ScatterTicks.base(this, 'setupByJSON', config, opt_default);
  this.mode(config['mode']);
  this.base(config['base']);
  this.explicit_ = config['explicit'] || null;
  this.minCount_ = anychart.utils.toNumber(config['count']) || anychart.utils.toNumber(config['minCount']) || NaN;
  this.maxCount_ = anychart.utils.toNumber(config['count']) || anychart.utils.toNumber(config['maxCount']) || NaN;
  this.interval_ = anychart.utils.toNumber(config['interval']) || NaN;
  this.allowFractional(config['allowFractional']);
  if (this.explicit_) {
    this.minCount_ = this.maxCount_ = this.interval_ = NaN;
  } else if (this.interval_) {
    this.minCount_ = this.maxCount_ = NaN;
  } else {
    this.minCount_ = Math.ceil(anychart.utils.toNumber(this.minCount_));
    this.maxCount_ = Math.ceil(anychart.utils.toNumber(this.maxCount_));
    // NaN checks included! DO NOT INVERT
    if (!(this.minCount_ >= 2)) this.minCount_ = 4;
    if (!(this.maxCount_ >= this.minCount_)) this.maxCount_ = this.minCount_;
  }
};


//exports
(function() {
  var proto = anychart.scales.ScatterTicks.prototype;
  proto['interval'] = proto.interval;//doc|ex
  proto['allowFractional'] = proto.allowFractional;
  proto['count'] = proto.count;//doc|ex
  proto['base'] = proto.base;//doc|ex
  proto['set'] = proto.set;//doc|ex
  proto['get'] = proto.get;//doc|ex
  proto['mode'] = proto.mode;//doc|ex
})();
