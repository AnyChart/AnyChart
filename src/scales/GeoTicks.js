goog.provide('anychart.scales.GeoTicks');

goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * Scale ticks.
 * @param {!anychart.scales.Geo} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.GeoTicks = function(scale) {
  anychart.scales.GeoTicks.base(this, 'constructor');

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.Geo}
   * @private
   */
  this.scale_ = scale;
};
goog.inherits(anychart.scales.GeoTicks, anychart.core.Base);


//region --- Properties
/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.GeoTicks.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Fixed interval setting.
 * @type {number}
 * @private
 */
anychart.scales.GeoTicks.prototype.interval_ = NaN;


/**
 * Fixed ticks count settings.
 * @type {number}
 * @private
 */
anychart.scales.GeoTicks.prototype.minCount_ = 4;


/**
 * Fixed ticks count settings.
 * @type {number}
 * @private
 */
anychart.scales.GeoTicks.prototype.maxCount_ = 6;


/**
 * Explicit ticks array.
 * @type {Array}
 * @private
 */
anychart.scales.GeoTicks.prototype.explicit_ = null;


/**
 * Auto calculated ticks cache.
 * @type {Array}
 * @private
 */
anychart.scales.GeoTicks.prototype.autoTicks_ = null;


/**
 * Base value to arrange the scale range by.
 * @type {number}
 * @private
 */
anychart.scales.GeoTicks.prototype.base_ = 0;


//endregion
/**
 * Setter for tick orientation.
 * @param {anychart.enums.Layout} value Ticks orientation.
 */
anychart.scales.GeoTicks.prototype.setOrientation = function(value) {
  this.orientation_ = value;
};


/**
 * Getter/setter for interval.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.GeoTicks)} Interval value or itself for chaining.
 */
anychart.scales.GeoTicks.prototype.interval = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
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
 * @return {(Array.<number>|anychart.scales.GeoTicks)} Interval value or itself for method chaining.
 */
anychart.scales.GeoTicks.prototype.count = function(opt_valueOrMinValue, opt_maxValue) {
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
 * Getter/setter for base.
 * @param {number=} opt_value Base value for ticks.
 * @return {(number|anychart.scales.GeoTicks)} Base value or itself for chaining.
 */
anychart.scales.GeoTicks.prototype.base = function(opt_value) {
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
 * @return {!anychart.scales.GeoTicks} Returns itself for method chaining.
 */
anychart.scales.GeoTicks.prototype.set = function(ticks) {
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
anychart.scales.GeoTicks.prototype.get = function() {
  var ticks = this.getInternal();
  var transformator = this.orientation_ == anychart.enums.Layout.HORIZONTAL ? this.scale_.transformX : this.scale_.transformY;
  return goog.array.filter(ticks, function(el) {
    var val = transformator.call(this, parseFloat(el));
    return val >= 0 && val <= 1;
  }, this.scale_);
};


/**
 * Unfiltered ticks getter.
 * @return {!Array}
 */
anychart.scales.GeoTicks.prototype.getInternal = function() {
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
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {boolean=} opt_canModifyMin If the minimum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two values: [newMin, newMax].
 */
anychart.scales.GeoTicks.prototype.setupAsMajor = function(min, max, opt_canModifyMin, opt_canModifyMax) {
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
    var minCount = this.minCount_;
    var maxCount = this.maxCount_;
    if (!isNaN(interval) && ((max - min) / interval) > /** @type {number} */(this.scale_.maxTicksCount())) {
      if (!this.scale_.threwTooManyTicksWarning_) {
        anychart.core.reporting.warning(anychart.enums.WarningCode.TOO_MANY_TICKS, null, [max - min, interval]);
        this.scale_.threwTooManyTicksWarning_ = true;
      }
      interval = NaN;
      minCount = 4;
      maxCount = 6;
    }
    if (isNaN(interval)) {
      var currentInterval = NaN, currentDiff = NaN;
      for (var q = minCount; q <= maxCount; q++) {
        var count = q - 1; // it should be valid here
        var range = max - min;
        currentInterval = range / count;
        //console.log(currentInterval);
        // Here we can add other interval rounding options and choose the best
        // For example, with fractional values powers of 2 give better result because they divide interval in 2, 4, 8,
        // with big values: powers of 10 work better, and so long.
        var log = Math.log(currentInterval);
        var val1 = Math.pow(10, Math.floor(log * Math.LOG10E));
        var val2 = Math.pow(10, Math.ceil(log * Math.LOG10E));
        var val3 = (currentInterval < val1 + val1) ? val1 / 2 : Number.POSITIVE_INFINITY;
        log = anychart.math.log(currentInterval / val2, 2);
        var val5 = Math.pow(2, Math.floor(log)) * val2;
        var val6 = Math.pow(2, Math.ceil(log)) * val2;
        //console.log(val1, val2, val3, val5, val6);
        //console.log(anychart.utils.alignRight(currentInterval, val1),
        //    anychart.utils.alignRight(currentInterval, val2),
        //    anychart.utils.alignRight(currentInterval, val3),
        //    anychart.utils.alignRight(currentInterval, val5),
        //    anychart.utils.alignRight(currentInterval, val6));
        currentInterval = Math.min(
            anychart.utils.alignRight(currentInterval, val1),
            anychart.utils.alignRight(currentInterval, val2),
            anychart.utils.alignRight(currentInterval, val3),
            anychart.utils.alignRight(currentInterval, val5),
            anychart.utils.alignRight(currentInterval, val6));
        var tmpDiff1 = anychart.math.specialRound(anychart.utils.alignLeft(min, currentInterval, this.base_)) - min;
        tmpDiff1 *= tmpDiff1;
        var tmpDiff2 = anychart.math.specialRound(anychart.utils.alignRight(max, currentInterval, this.base_)) - max;
        tmpDiff2 *= tmpDiff2;
        var tmpDiff = tmpDiff1 + tmpDiff2;
        //console.log(currentInterval, tmpDiff);
        if (isNaN(currentDiff) || tmpDiff < currentDiff) {
          currentDiff = tmpDiff;
          interval = currentInterval;
        }
      }
    }
    interval = Math.max(interval, 1e-7);
    var desiredMin = anychart.math.specialRound(anychart.utils.alignLeft(min, interval, this.base_));
    if (opt_canModifyMin) {
      result[0] = min = desiredMin;
    } else if (min - desiredMin > 1e-7) {
      ticks.push(min);
      result[2] = desiredMin;
    }
    var desiredMax = anychart.math.specialRound(anychart.utils.alignRight(max, interval, this.base_));
    if (opt_canModifyMax) {
      result[1] = max = desiredMax;
    } else if (desiredMax - max > 1e-7) {
      result[3] = desiredMax;
    }
    for (var j = anychart.math.specialRound(anychart.utils.alignRight(min, interval, this.base_));
         j <= max;
         j = anychart.math.specialRound(j + interval)) {
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
 * @param {!Array} values Values array. Should contain 2 values if this is major ticks object and an array of major
 *    ticks if this is a minor ticks object.
 * @param {number=} opt_majorDesiredMin If major minimum was explicit and interval was auto, there could be a situation,
 *    when minimum doesn't contain interval. We need to know the value that major interval calculator desired to be the
 *    minimum in that case, to correctly calculate the interval on the part from explicit minimum (which is values[0] in
 *    that case) and first aligned tick (values[1]), as there should be less than this.minCount_ minor ticks.
 * @param {number=} opt_majorDesiredMax If major maximum was explicit and interval was auto, there could be a situation,
 *    when maximum doesn't contain interval. We need to know the value that major interval calculator desired to be the
 *    maximum in that case, to correctly calculate the interval on the part from last aligned tick (which is
 *    values[values.length - 2] in that case) and the explicit maximum (which is the last value in values).
 */
anychart.scales.GeoTicks.prototype.setupAsMinor = function(values, opt_majorDesiredMin, opt_majorDesiredMax) {
  if (this.explicit_) {
    this.autoTicks_ = null;
  } else {
    if (this.autoTicks_)
      this.autoTicks_.length = 0;
    else
      this.autoTicks_ = [];
    if (values.length < 2) return;
    var adder = this.addMinorLinearTicksPortion_;
    var min, max;
    var end = values.length - 1;
    var backupInterval = this.interval_;
    var backupMinCount = this.minCount_;
    if (!isNaN(this.interval_)) {
      max = values[end];
      min = values[0];
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
      adder.call(this, min, max, opt_majorDesiredMin, max);
      start = 1;
    } else
      start = 0;
    if (goog.isDef(opt_majorDesiredMax))
      end--;
    for (var i = start; i <= end - 1; i++) {
      min = values[i];
      max = values[i + 1];
      adder.call(this, min, max, min, max);
    }
    if (goog.isDef(opt_majorDesiredMax)) {
      min = values[end];
      max = values[end + 1];
      adder.call(this, min, max, min, opt_majorDesiredMax);
    }
    this.interval_ = backupInterval;
    this.minCount_ = backupMinCount;
  }
};


/**
 * Adds a portion of ticks to this.autoTicks_. Just an optimisation.
 * @param {number} min Min of range where ticks should be placed.
 * @param {number} max Max of range where ticks should be placed.
 * @param {number} rangeMin Min for interval calculation.
 * @param {number} rangeMax Max for interval calculation.
 * @private
 */
anychart.scales.GeoTicks.prototype.addMinorLinearTicksPortion_ = function(min, max, rangeMin, rangeMax) {
  var interval = this.interval_;
  if (isNaN(interval)) {
    var range = rangeMax - rangeMin;
    interval = range / (this.minCount_ - 1);
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


//region --- Serialize & Deserialize
/** @inheritDoc */
anychart.scales.GeoTicks.prototype.serialize = function() {
  var json = anychart.scales.GeoTicks.base(this, 'serialize');
  // json['base'] = this.base_;
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
anychart.scales.GeoTicks.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isArray(args[0])) {
    this.set(args[0]);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.scales.GeoTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.GeoTicks.base(this, 'setupByJSON', config, opt_default);
  // this.base(config['base']);
  this.explicit_ = config['explicit'] || null;
  if (this.explicit_) {
    goog.array.forEach(this.explicit_, function(elem, index, arr) {
      arr[index] = parseFloat(elem);
    });
  }
  this.minCount_ = config['count'] || config['minCount'] || NaN;
  this.maxCount_ = config['count'] || config['maxCount'] || NaN;
  this.interval_ = config['interval'] || NaN;
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


//endregion
//region --- Exports
(function() {
  var proto = anychart.scales.GeoTicks.prototype;
  proto['interval'] = proto.interval;
  proto['count'] = proto.count;
  proto['set'] = proto.set;
  proto['get'] = proto.get;
})();
//endregion
