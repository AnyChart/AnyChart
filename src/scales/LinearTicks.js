goog.provide('anychart.scales.LinearTicks');

goog.require('anychart.utils.Invalidatable');



/**
 * Scale ticks.
 * @param {!anychart.scales.Linear} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.scales.LinearTicks = function(scale) {
  goog.base(this);

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.Linear}
   * @private
   */
  this.scale_ = scale;
  this.scale_.listenInvalidation(this.scaleInvalidated_, this);
  this.silentlyInvalidate(anychart.utils.ConsistencyState.TICKS_SET);
};
goog.inherits(anychart.scales.LinearTicks, anychart.utils.Invalidatable);


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.scales.LinearTicks.prototype.DISPATCHED_CONSISTENCY_STATES = anychart.utils.ConsistencyState.TICKS_SET;


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.scales.LinearTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.utils.ConsistencyState.TICKS_SET;


/**
 * Fixed interval setting.
 * @type {number}
 * @private
 */
anychart.scales.LinearTicks.prototype.interval_ = NaN;


/**
 * Fixed ticks count settings.
 * @type {number}
 * @private
 */
anychart.scales.LinearTicks.prototype.count_ = 5;


/**
 * Explicit ticks array.
 * @type {Array}
 * @private
 */
anychart.scales.LinearTicks.prototype.explicit_ = null;


/**
 * Auto calculated ticks cache.
 * @type {Array}
 * @private
 */
anychart.scales.LinearTicks.prototype.autoTicks_ = null;


/**
 * Base value to arrange the scale range by.
 * @type {number}
 * @private
 */
anychart.scales.LinearTicks.prototype.base_ = 0;


/**
 * Gets or sets ticks interval value. Note, that interval value can be read only if it was set explicitly.
 * It is returned as NaN otherwise. If opt_value is defined but is not a number or less than 0, it defaults to NaN and
 * count() resets to 5.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.LinearTicks)} Interval value or itself for chaining.
 */
anychart.scales.LinearTicks.prototype.interval = function(opt_value) {
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
      this.invalidate(anychart.utils.ConsistencyState.TICKS_SET);
    }
    return this;
  }
  return this.interval_;
};


/**
 * Gets or sets ticks count value. If opt_value is defined but not a number or less than 2, it defaults to 5.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.LinearTicks)} Interval value or itself for chaining.
 */
anychart.scales.LinearTicks.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.count_ != opt_value) {
      this.interval_ = NaN;
      this.count_ = (isNaN(opt_value) || opt_value < 2) ? 5 : Math.ceil(+opt_value);
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.invalidate(anychart.utils.ConsistencyState.TICKS_SET);
    }
    return this;
  }
  return this.count_;
};


/**
 * Sets base value, by which auto ticks are arranged.
 * @param {number=} opt_value Base value, if used as a setter.
 * @return {(number|anychart.scales.LinearTicks)} Base value or itself for chaining.
 */
anychart.scales.LinearTicks.prototype.base = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.base_ != opt_value) {
      this.base_ = opt_value;
      this.autoTicks_ = null;
      if (!this.explicit_)
        this.invalidate(anychart.utils.ConsistencyState.TICKS_SET);
    }
    return this;
  }
  return this.base_;
};


/**
 * Setups ticks as an explicit array of fixed ticks.
 * @param {Array} ticks Explicit ticks array.
 * @return {!anychart.scales.LinearTicks} Returns itself for chaining.
 */
anychart.scales.LinearTicks.prototype.set = function(ticks) {
  if (this.explicit_ != ticks) {
    this.explicit_ = ticks;
    this.autoTicks_ = null;
    this.invalidate(anychart.utils.ConsistencyState.TICKS_SET);
  }
  return this;
};


/**
 * Returns an array of ticks. Each tick is a value in terms of data, to make a tick on.
 * @return {!Array} Array of ticks.
 */
anychart.scales.LinearTicks.prototype.get = function() {
  if (this.explicit_)
    return this.explicit_;
  if (!this.isConsistent()) {
    this.scale_.calculate();
  }
  return /** @type {!Array} */(this.autoTicks_);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {Array} values Values array. Should contain 2 values if this is major ticks object and an array of major
 *    ticks if this is a minor ticks object.
 * @param {boolean=} opt_canModifyMin If the maximum can be modified.
 * @param {boolean=} opt_canModifyMax If the maximum can be modified.
 * @return {!Array} Array of two values: [newMin, newMax].
 */
anychart.scales.LinearTicks.prototype.setup = function(values, opt_canModifyMin, opt_canModifyMax) {
  if (!values)
    return new Array(2);
  debugger;
  this.autoTicks_ = null;
  var result = [values[0], values[values.length - 1]];
  if (!this.explicit_) {
    values = values ? goog.array.clone(values) : [];
    opt_canModifyMin = !!opt_canModifyMin && (values.length == 2);
    opt_canModifyMax = !!opt_canModifyMax && (values.length == 2);
    var ticks = [];
    var min, max, lastVal = NaN;
    for (var i = 1; i < values.length; i++) {
      min = values[i - 1];
      max = values[i];
      var interval = this.interval_;
      if (isNaN(interval)) {
        // todo(Anton Saukh): Этот код может возвращать либо count интервалов, либо count+1 - надо это потом фиксить.
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
        //-------------------------------------------------
        // remains for future debugging purposes. DO NOT REMOVE
        //-------------------------------------------------
        //console.log(
        //    majorIntervalValuable10_1,
        //    majorIntervalValuable10_2,
        //    val_1, val_2);
        //console.log(interval,
        //    maxInterval,
        //    '|',
        //    anychart.utils.alignRight(interval, majorIntervalValuable10_1),
        //    anychart.utils.alignRight(interval, majorIntervalValuable10_2),
        //    anychart.utils.alignRight(interval, val_1),
        //    anychart.utils.alignRight(interval, val_2));
        //-------------------------------------------------
        interval = Math.min(
            anychart.utils.alignRight(interval, majorIntervalValuable10_1),
            anychart.utils.alignRight(interval, majorIntervalValuable10_2),
            anychart.utils.alignRight(interval, val_1),
            anychart.utils.alignRight(interval, val_2));
      }
      //var oldMin = min;
      //var oldMax = max;
      if (opt_canModifyMin)
        result[0] = min = anychart.math.round(anychart.utils.alignLeft(min, interval, this.base_), 7);
      if (opt_canModifyMax)
        result[1] = max = anychart.math.round(anychart.utils.alignRight(max, interval, this.base_), 7);
      //console.log(oldMin, oldMax, '|', interval, '|', min, max);
      for (var j = anychart.math.round(anychart.utils.alignRight(min, interval, this.base_), 7);
           j <= max;
           j = anychart.math.round(j + interval, 7)) {
        if (lastVal != j)
          ticks.push(j);
        lastVal = j;
      }
    }
    this.autoTicks_ = ticks;
  }
  this.markConsistent(anychart.utils.ConsistencyState.TICKS_SET);
  return result;
};


/**
 * Scale invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.scales.LinearTicks.prototype.scaleInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.SCALE_SETTINGS) ||
      event.invalidated(anychart.utils.ConsistencyState.SCALE_SETTINGS_HARD)) {
    this.invalidate(anychart.utils.ConsistencyState.TICKS_SET);
  }
};
