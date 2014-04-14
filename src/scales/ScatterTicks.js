goog.provide('anychart.scales.ScatterTicks');
goog.provide('anychart.scales.ScatterTicksMode');

goog.require('anychart.Base');


/**
 * Scatter ticks mode enum.
 * @enum {string}
 */
anychart.scales.ScatterTicksMode = {
  /**
   * Scatter ticks go with linear interval, e.g. [1, 2, 3, 4, 5]
   */
  LINEAR: 'linear',
  /**
   * Scatter ticks go with log-linear interval, e.g. [0.1, 1, 10, 100, 1000]
   */
  LOGARITHMIC: 'logarithmic'
};



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
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
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
 * @type {anychart.scales.ScatterTicksMode|string}
 * @private
 */
anychart.scales.ScatterTicks.prototype.mode_ = anychart.scales.ScatterTicksMode.LINEAR;


/**
 * Gets or sets ticks interval value. Note, that interval value can be read only if it was set explicitly.
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
 * Gets or sets ticks count value. If opt_value is defined but not a number or less than 2, it defaults to 5.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.ScatterTicks)} Interval value or itself for chaining.
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
 * @return {!anychart.scales.ScatterTicks} Returns itself for chaining.
 */
anychart.scales.ScatterTicks.prototype.set = function(ticks) {
  if (!goog.array.equals(this.explicit_, ticks)) {
    this.count_ = NaN;
    this.interval_ = NaN;
    this.explicit_ = ticks;
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
 * @param {(anychart.scales.ScatterTicksMode|string)=} opt_value Value to set.
 * @return {anychart.scales.ScatterTicksMode|anychart.scales.ScatterTicks} Value or itself.
 */
anychart.scales.ScatterTicks.prototype.mode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = ('' + opt_value).toLowerCase();
    if (opt_value == 'log' || opt_value == anychart.scales.ScatterTicksMode.LOGARITHMIC)
      opt_value = anychart.scales.ScatterTicksMode.LOGARITHMIC;
    else
      opt_value = anychart.scales.ScatterTicksMode.LINEAR;
    if (this.mode_ != opt_value) {
      this.autoTicks_ = null;
      this.mode_ = opt_value;
      if (!this.explicit_)
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return /** @type {anychart.scales.ScatterTicksMode} */(this.mode_);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {boolean=} opt_canModifyMin If the maximum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two values: [newMin, newMax].
 */
anychart.scales.ScatterTicks.prototype.setup = function(min, max, opt_canModifyMin, opt_canModifyMax) {
  if (this.mode_ == anychart.scales.ScatterTicksMode.LOGARITHMIC)
    return this.setupLogarithmic_(min, max, opt_canModifyMin, opt_canModifyMax);
  else
    return this.setupLinear_(min, max, opt_canModifyMin, opt_canModifyMax);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {!Array} values Values array. Should contain 2 values if this is major ticks object and an array of major
 *    ticks if this is a minor ticks object.
 * @param {number=} opt_originalMin Original min value (sometimes some minor ticks may be placed before the first major
 *    tick).
 * @param {number=} opt_originalMax Original max value (sometimes some minor ticks may be placed after the first major
 *    tick).
 */
anychart.scales.ScatterTicks.prototype.setupAsMinor = function(values, opt_originalMin, opt_originalMax) {
  if (!goog.isDef(opt_originalMin)) opt_originalMin = values[0];
  if (!goog.isDef(opt_originalMax)) opt_originalMax = values[values.length - 1];
  if (this.mode_ == anychart.scales.ScatterTicksMode.LOGARITHMIC)
    this.setupLogarithmicAsMinor_(values, opt_originalMin, opt_originalMax);
  else
    this.setupLinearAsMinor_(values, opt_originalMin, opt_originalMax);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {boolean=} opt_canModifyMin If the maximum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two values: [newMin, newMax].
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLinear_ = function(min, max, opt_canModifyMin, opt_canModifyMax) {
  this.autoTicks_ = null;
  var result = [min, max];
  if (!this.explicit_) {
    var ticks = [];
    var interval = this.interval_;
    if (isNaN(interval)) {
      // todo(Anton Saukh): Этот код может возвращать либо count интервалов, либо count+1 - надо это потом фиксить.
      var count = this.count_ - 1; // it should be valid here
      var range = max - min;
      interval = range / count;
      // Здесь можно дописывать разные другие варианты округления интервала и выбирать лучший
      // Например на дробных значениях степени двойки дают лучший результат, потому что делят интервал на 2, 4, 8, а на
      // больших значениях лучше использовать степени десятки и т.п.
      var log = Math.log(interval);
      var majorIntervalValuable10_1 = Math.pow(10, Math.floor(log / Math.LN10));
      var majorIntervalValuable10_2 = Math.pow(10, Math.ceil(log / Math.LN10));
      log = Math.log(interval / majorIntervalValuable10_2);
      var val_1 = Math.pow(2, Math.floor(log)) * majorIntervalValuable10_2;
      var val_2 = Math.pow(2, Math.ceil(log)) * majorIntervalValuable10_2;
      interval = Math.min(
          anychart.utils.alignRight(interval, majorIntervalValuable10_1),
          anychart.utils.alignRight(interval, majorIntervalValuable10_2),
          anychart.utils.alignRight(interval, val_1),
          anychart.utils.alignRight(interval, val_2));
    }
    interval = Math.max(interval, 1e-7);
    if (opt_canModifyMin)
      result[0] = min = anychart.math.round(anychart.utils.alignLeft(min, interval, this.base_), 7);
    if (opt_canModifyMax)
      result[1] = max = anychart.math.round(anychart.utils.alignRight(max, interval, this.base_), 7);
    for (var j = anychart.math.round(anychart.utils.alignRight(min, interval, this.base_), 7);
         j <= max;
         j = anychart.math.round(j + interval, 7)) {
      ticks.push(j);
    }
    this.autoTicks_ = ticks;
  }
  return result;
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {boolean=} opt_canModifyMin If the maximum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two values: [newMin, newMax].
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLogarithmic_ = function(min, max, opt_canModifyMin, opt_canModifyMax) {
  this.autoTicks_ = null;
  var result = [min, max];
  min = anychart.math.log(Math.max(min, Math.pow(10, -7))) * Math.LOG10E;
  max = anychart.math.log(Math.max(max, Math.pow(10, -7))) * Math.LOG10E;
  if (!this.explicit_) {
    var ticks = [];
    var interval = this.interval_;
    if (isNaN(interval)) {
      // calculating the interval here
      var count = this.count_ - 1; // it should be valid here
      var range = max - min;
      interval = range / count;
      // Здесь можно дописывать разные другие варианты округления интервала и выбирать лучший
      // Например на дробных значениях степени двойки дают лучший результат, потому что делят интервал на 2, 4, 8, а на
      // больших значениях лучше использовать степени десятки и т.п.
      var log = Math.log(interval);
      var majorIntervalValuable10_1 = Math.pow(10, Math.floor(log / Math.LN10));
      var majorIntervalValuable10_2 = Math.pow(10, Math.ceil(log / Math.LN10));
      log = Math.log(interval / majorIntervalValuable10_2);
      var val_1 = Math.pow(2, Math.floor(log)) * majorIntervalValuable10_2;
      var val_2 = Math.pow(2, Math.ceil(log)) * majorIntervalValuable10_2;
      interval = Math.min(
          anychart.utils.alignRight(interval, majorIntervalValuable10_1),
          anychart.utils.alignRight(interval, majorIntervalValuable10_2),
          anychart.utils.alignRight(interval, val_1),
          anychart.utils.alignRight(interval, val_2));
    }
    interval = Math.max(interval, 1e-7);
    if (opt_canModifyMin) {
      min = anychart.math.round(anychart.utils.alignLeft(min, interval, this.base_), 7);
      result[0] = anychart.math.round(Math.pow(10, min), 7);
    }
    if (opt_canModifyMax) {
      max = anychart.math.round(anychart.utils.alignRight(max, interval, this.base_), 7);
      result[1] = anychart.math.round(Math.pow(10, max), 7);
    }
    for (var j = anychart.math.round(min, 7);
         j <= max;
         j = anychart.math.round(j + interval, 7)) {
      ticks.push(anychart.math.round(Math.pow(10, j), 7));
    }
    this.autoTicks_ = ticks;
  }
  return result;
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {Array} values Values array. Should contain 2 values if this is major ticks object and an array of major
 *    ticks if this is a minor ticks object.
 * @param {number} originalMin Original min value (sometimes some minor ticks may be placed before the first major
 *    tick).
 * @param {number} originalMax Original max value (sometimes some minor ticks may be placed after the first major
 *    tick).
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLinearAsMinor_ = function(values, originalMin, originalMax) {
  this.autoTicks_ = null;
  if (!this.explicit_) {
    var ticks = [];
    var min, max, lastVal = NaN, j;
    for (var i = 1; i < values.length; i++) {
      min = values[i - 1];
      max = values[i];
      var interval = this.interval_;
      if (isNaN(interval)) {
        var count = this.count_ - 1; // it should be valid here
        var range = max - min;
        interval = range / count;
      }
      interval = Math.max(interval, 1e-7);
      var start = anychart.math.round(isNaN(lastVal) ? originalMin : min, 7);
      for (j = start; j <= max; j = anychart.math.round(j + interval, 7)) {
        if (lastVal != j)
          ticks.push(j);
        lastVal = j;
      }
    }
    for (j = max; j <= originalMax; j = anychart.math.round(j + interval, 7)) {
      if (lastVal != j)
        ticks.push(j);
      lastVal = j;
    }
    this.autoTicks_ = ticks;
  }
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {!Array} values Values array. Should contain 2 values if this is major ticks object and an array of major
 *    ticks if this is a minor ticks object.
 * @param {number} originalMin Original min value (sometimes some minor ticks may be placed before the first major
 *    tick).
 * @param {number} originalMax Original max value (sometimes some minor ticks may be placed after the first major
 *    tick).
 * @private
 */
anychart.scales.ScatterTicks.prototype.setupLogarithmicAsMinor_ = function(values, originalMin, originalMax) {
  this.autoTicks_ = null;
  if (!this.explicit_) {
    originalMin = anychart.math.log(Math.max(originalMin, 1e-7)) * Math.LOG10E;
    originalMax = anychart.math.log(Math.max(originalMax, 1e-7)) * Math.LOG10E;
    var ticks = [];
    var min, max, lastVal = NaN;
    for (var i = 1; i < values.length; i++) {
      min = anychart.math.log(Math.max(values[i - 1], 1e-7)) * Math.LOG10E;
      max = anychart.math.log(Math.max(values[i], 1e-7)) * Math.LOG10E;
      var interval = this.interval_;
      if (isNaN(interval)) {
        var count = this.count_ - 1; // it should be valid here
        var range = max - min;
        interval = range / count;
      }
      interval = Math.max(interval, 1e-7);
      var start = anychart.math.round(isNaN(lastVal) ? originalMin : min, 7);
      for (var j = start; j <= max; j = anychart.math.round(j + interval, 7)) {
        if (lastVal != j)
          ticks.push(anychart.math.round(Math.pow(10, j), 7));
        lastVal = j;
      }
    }
    for (j = max; j <= originalMax; j = anychart.math.round(j + interval, 7)) {
      if (lastVal != j)
        ticks.push(anychart.math.round(Math.pow(10, j), 7));
      lastVal = j;
    }
    this.autoTicks_ = ticks;
  }
};
