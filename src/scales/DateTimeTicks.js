goog.provide('anychart.scales.DateTimeTicks');

goog.require('anychart.core.Base');
goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');



/**
 * Scale ticks.
 * @param {!anychart.scales.DateTime} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.DateTimeTicks = function(scale) {
  goog.base(this);

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.DateTime}
   * @private
   */
  this.scale_ = scale;
};
goog.inherits(anychart.scales.DateTimeTicks, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.DateTimeTicks.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Fixed interval setting.
 * @type {goog.date.Interval}
 * @private
 */
anychart.scales.DateTimeTicks.prototype.interval_ = null;


/**
 * Fixed ticks count settings.
 * @type {number}
 * @private
 */
anychart.scales.DateTimeTicks.prototype.count_ = 4;


/**
 * Explicit ticks array.
 * @type {Array}
 * @private
 */
anychart.scales.DateTimeTicks.prototype.explicit_ = null;


/**
 * Auto calculated ticks cache.
 * @type {Array}
 * @private
 */
anychart.scales.DateTimeTicks.prototype.autoTicks_ = null;


/**
 * Getter for ticks interval value.<br/>
 * <b>Note:</b> you can get interval value only if it was set explicitly, otherwise its returns NaN.
 * @return {string} Current interval value in  ISO 8601 interval string.
 *//**
 * Setter for ticks interval value by string representing date part or ISO 8601 interval string.
 * @example
 * var chart = anychart.financial();
 * chart.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks().interval('P2D');
 * chart.container(stage).draw();
 * @param {string=} opt_isodate Value to set.
 * @return {!anychart.scales.DateTimeTicks} An instance of {@link anychart.scales.DateTimeTicks} class for method chaining.
 *//**
 * Setter for ticks interval value by unit.
 * @example
 * var chart = anychanychart.financial* chart.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks().interval('d', 2);
 * chart.container(stage).draw();
 * @param {anychart.enums.Interval=} opt_unit Set unit by first letter. 'year' is 'y', 'month' is 'm' etc.<br/>
 * <b>Note:</b> 'minutes' is 'n'.
 * @param {number=} opt_count Any positive value.
 * @return {!anychart.scales.DateTimeTicks} An instance of {@link anychart.scales.DateTimeTicks} class for method chaining.
 *//**
 * Setter for ticks interval value.<br/>
 * <b>Note:</b> If any passed value is defined but is not a number or less than 0, it defaults to NaN and count() resets to 5.
 * @example
 * var chart = anychart.fanychart.financialrt.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks().interval(0,0,0,12);
 * chart.container(stage).draw();
 * @param {number=} opt_years Any positive value.
 * @param {number=} opt_months Any positive value.
 * @param {number=} opt_days Any positive value.
 * @param {number=} opt_hours Any positive value.
 * @param {number=} opt_minutes Any positive value.
 * @param {number=} opt_seconds Any positive value.
 * @return {!anychart.scales.DateTimeTicks} An instance of {@link anychart.scales.DateTimeTicks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|anychart.enums.Interval)=} opt_years Years or string representing date part or ISO 8601 interval string.
 * @param {number=} opt_months Months or number of whatever date part specified
 *     by first parameter.
 * @param {number=} opt_days Days.
 * @param {number=} opt_hours Hours.
 * @param {number=} opt_minutes Minutes.
 * @param {number=} opt_seconds Seconds.
 * @return {(string|anychart.scales.DateTimeTicks)} Interval value or itself for chaining.
 */
anychart.scales.DateTimeTicks.prototype.interval = function(opt_years, opt_months, opt_days, opt_hours, opt_minutes,
    opt_seconds) {
  if (goog.isDef(opt_years)) {
    var val;
    if (goog.isNull(opt_years))
      val = null;
    else if (goog.isString(opt_years) && arguments.length == 1)
      val = goog.date.Interval.fromIsoString(opt_years);
    else {
      if (goog.isString(opt_years))
        opt_years = anychart.enums.normalizeInterval(opt_years);
      val = new goog.date.Interval(opt_years, opt_months, opt_days, opt_hours, opt_minutes, opt_seconds);
    }
    if (!((val && this.interval_ && this.interval_.equals(val)) || (!val && !this.interval_))) {
      if (!val) {
        this.count_ = 4;
        this.interval_ = null;
      } else {
        this.count_ = NaN;
        this.interval_ = val;
      }
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.interval_.toIsoString(false);
};


/**
 * Getter for ticks count value.
 * @return {number} Current ticks count value.
 *//**
 * Setter for ticks count value.
 * @example
 * var chart = anychart.financanychart.financiallc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks().count(3);
 * chart.container(stage).draw();
 * @param {number=} opt_value Ticks count value.<br/>
 * <b>Note:</b> If value is defined, but not a number or less than 2, it defaults to 5.
 * @return {!anychart.scales.DateTimeTicks} An instance of {@link anychart.scales.DateTimeTicks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.DateTimeTicks)} Interval value or itself for method chaining.
 */
anychart.scales.DateTimeTicks.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.count_ != opt_value) {
      this.interval_ = null;
      this.count_ = (isNaN(opt_value) || opt_value < 2) ? 4 : Math.ceil(+opt_value);
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.count_;
};


/**
 * Setups ticks as an explicit array of fixed ticks.
 * @example
 * var chart = anychart.financialChanychart.financial *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks().set([1188172800000, 1188432000000, 1188604800000]);
 * chart.container(stage).draw();
 * @param {Array} ticks Explicit ticks array.
 * @return {!anychart.scales.DateTimeTicks} Returns itself for method chaining.
 */
anychart.scales.DateTimeTicks.prototype.set = function(ticks) {
  if (this.explicit_ != ticks) {
    this.count_ = NaN;
    this.interval_ = null;
    this.explicit_ = goog.array.clone(ticks);
    goog.array.removeDuplicates(this.explicit_);
    this.autoTicks_ = null;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Returns an array of ticks. Each tick is a value in terms of data, to make a tick on.<br/>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or after <b>chart.draw()</b>
 * @example
 * var chart = anychart.financialChart();
 * chart.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.container(stage).draw();
 * var currentTicks = chart.xScale().ticks().get();
 * // Returns [1188172800000, 1188259200000, 1188345600000, 1188432000000, 1188518400000, 1188604800000].
 * @return {!Array} Array of ticks.
 */
anychart.scales.DateTimeTicks.prototype.get = function() {
  if (this.explicit_) {
    return goog.array.filter(this.explicit_, function(el) {
      return !(el < this.scale_.minimum() || el > this.scale_.maximum());
    }, this);
  }
  this.scale_.calculate();
  return /** @type {!Array} */(this.autoTicks_);
};


/**
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {number} adjustedMin Adjusted minimum.
 * @param {number} adjustedMax Adjusted maximum.
 */
anychart.scales.DateTimeTicks.prototype.setupAsMinor = function(min, max, adjustedMin, adjustedMax) {
  this.autoTicks_ = null;
  if (!this.explicit_) {
    var ticks = [];
    var interval = this.interval_ || this.calculateIntervals_(min, max, true);
    var date = new goog.date.UtcDateTime(new Date(adjustedMin));
    var endDate = new goog.date.UtcDateTime(new Date(adjustedMax));
    for (; goog.date.Date.compare(date, endDate) <= 0; date.add(interval))
      ticks.push(date.getTime());
    this.autoTicks_ = ticks;
  }
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
anychart.scales.DateTimeTicks.prototype.setup = function(min, max, opt_canModifyMin, opt_canModifyMax) {
  this.autoTicks_ = null;
  var result = [min, max];
  if (!this.explicit_) {
    var ticks = [];
    var interval = this.interval_ || this.calculateIntervals_(min, max, false);
    if (opt_canModifyMin)
      result[0] = min = this.alignDateLeft_(min, interval, 0);
    var date = new goog.date.UtcDateTime(new Date(min));
    var endDate = new goog.date.UtcDateTime(new Date(max));
    for (; goog.date.Date.compare(date, endDate) <= 0; date.add(interval))
      ticks.push(date.getTime());
    if (opt_canModifyMax && goog.date.Date.compare(date, endDate) > 0)
      ticks.push(result[1] = date.getTime());
    this.autoTicks_ = ticks;
  }
  return result;
};


/**
 * Array of different ranges. Used by interval auto calculation.
 * @type {!Array.<number>}
 * @private
 */
anychart.scales.DateTimeTicks.RANGES_ = [
  1,
  2,
  5,
  10,
  20,
  50,
  100,
  200,
  500,
  1000,
  1000 * 2,
  1000 * 5,
  1000 * 10,
  1000 * 20,
  1000 * 30,
  1000 * 60,
  1000 * 60 * 2,
  1000 * 60 * 5,
  1000 * 60 * 10,
  1000 * 60 * 20,
  1000 * 60 * 30,
  1000 * 60 * 60,
  1000 * 60 * 60 * 2,
  1000 * 60 * 60 * 3,
  1000 * 60 * 60 * 6,
  1000 * 60 * 60 * 8,
  1000 * 60 * 60 * 12,
  1000 * 60 * 60 * 16,
  1000 * 60 * 60 * 24,
  1000 * 60 * 60 * 24 * 2,
  1000 * 60 * 60 * 24 * 7,
  1000 * 60 * 60 * 24 * 10,
  1000 * 60 * 60 * 24 * 14,
  1000 * 60 * 60 * 24 * 21,
  1000 * 60 * 60 * 24 * 28,
  1000 * 60 * 60 * 24 * 365 / 12,
  1000 * 60 * 60 * 24 * 365 / 12 * 2,
  1000 * 60 * 60 * 24 * 365 / 12 * 3,
  1000 * 60 * 60 * 24 * 365 / 12 * 4,
  1000 * 60 * 60 * 24 * 365 / 12 * 6,
  1000 * 60 * 60 * 24 * 365,
  1000 * 60 * 60 * 24 * 365 * 2
];


/**
 * Array of minor intervals, synced with RANGES_. Used by interval auto calculation.
 * @type {!Array.<!goog.date.Interval>}
 * @private
 */
anychart.scales.DateTimeTicks.MINOR_INTERVALS_ = [
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.001), // 1
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.001), // 2
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.001), // 3
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.005), // 4
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.005), // 5
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.010), // 6
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.020), // 7
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.040), // 8
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.100), // 9
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.200), // 10
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.500), // 11
  new goog.date.Interval(goog.date.Interval.SECONDS, 1), // 12
  new goog.date.Interval(goog.date.Interval.SECONDS, 2), // 13
  new goog.date.Interval(goog.date.Interval.SECONDS, 5), // 14
  new goog.date.Interval(goog.date.Interval.SECONDS, 10), // 15
  new goog.date.Interval(goog.date.Interval.SECONDS, 20), // 16
  new goog.date.Interval(goog.date.Interval.SECONDS, 30), // 17
  new goog.date.Interval(goog.date.Interval.MINUTES, 1), // 18
  new goog.date.Interval(goog.date.Interval.MINUTES, 1), // 19
  new goog.date.Interval(goog.date.Interval.MINUTES, 5), // 20
  new goog.date.Interval(goog.date.Interval.MINUTES, 10), // 21
  new goog.date.Interval(goog.date.Interval.MINUTES, 20), // 22
  new goog.date.Interval(goog.date.Interval.MINUTES, 30), // 23
  new goog.date.Interval(goog.date.Interval.HOURS, 1), // 24
  new goog.date.Interval(goog.date.Interval.HOURS, 2), // 25
  new goog.date.Interval(goog.date.Interval.HOURS, 2), // 26
  new goog.date.Interval(goog.date.Interval.HOURS, 3), // 27
  new goog.date.Interval(goog.date.Interval.HOURS, 4), // 28
  new goog.date.Interval(goog.date.Interval.HOURS, 8), // 29
  new goog.date.Interval(goog.date.Interval.HOURS, 12), // 30
  new goog.date.Interval(goog.date.Interval.DAYS, 1), // 31
  new goog.date.Interval(goog.date.Interval.DAYS, 2), // 32
  new goog.date.Interval(goog.date.Interval.DAYS, 7), // 33
  new goog.date.Interval(goog.date.Interval.DAYS, 7), // 34
  new goog.date.Interval(goog.date.Interval.DAYS, 7), // 35
  new goog.date.Interval(goog.date.Interval.DAYS, 7), // 36
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // 37
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // 38
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // 39
  new goog.date.Interval(goog.date.Interval.MONTHS, 2), // 40
  new goog.date.Interval(goog.date.Interval.MONTHS, 4), // 41
  new goog.date.Interval(goog.date.Interval.MONTHS, 6) // 42
];


/**
 * Array of major intervals, synced with RANGES_. Used by interval auto calculation.
 * @type {!Array.<!goog.date.Interval>}
 * @private
 */
anychart.scales.DateTimeTicks.MAJOR_INTERVALS_ = [
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.001), // 1
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.002), // 2
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.005), // 3
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.010), // 4
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.020), // 5
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.050), // 6
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.100), // 7
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.200), // 8
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.500), // 9
  new goog.date.Interval(goog.date.Interval.SECONDS, 1), // 10
  new goog.date.Interval(goog.date.Interval.SECONDS, 2), // 11
  new goog.date.Interval(goog.date.Interval.SECONDS, 5), // 12
  new goog.date.Interval(goog.date.Interval.SECONDS, 10), // 13
  new goog.date.Interval(goog.date.Interval.SECONDS, 20), // 14
  new goog.date.Interval(goog.date.Interval.SECONDS, 30), // 15
  new goog.date.Interval(goog.date.Interval.MINUTES, 1), // 16
  new goog.date.Interval(goog.date.Interval.MINUTES, 2), // 17
  new goog.date.Interval(goog.date.Interval.MINUTES, 5), // 18
  new goog.date.Interval(goog.date.Interval.MINUTES, 10), // 19
  new goog.date.Interval(goog.date.Interval.MINUTES, 20), // 20
  new goog.date.Interval(goog.date.Interval.MINUTES, 30), // 21
  new goog.date.Interval(goog.date.Interval.HOURS, 1), // 22
  new goog.date.Interval(goog.date.Interval.HOURS, 2), // 23
  new goog.date.Interval(goog.date.Interval.HOURS, 3), // 24
  new goog.date.Interval(goog.date.Interval.HOURS, 6), // 25
  new goog.date.Interval(goog.date.Interval.HOURS, 8), // 26
  new goog.date.Interval(goog.date.Interval.HOURS, 12), // 27
  new goog.date.Interval(goog.date.Interval.HOURS, 16), // 28
  new goog.date.Interval(goog.date.Interval.DAYS, 1), // 29
  new goog.date.Interval(goog.date.Interval.DAYS, 2), // 30
  new goog.date.Interval(goog.date.Interval.DAYS, 7), // 31
  new goog.date.Interval(goog.date.Interval.DAYS, 10), // 32
  new goog.date.Interval(goog.date.Interval.DAYS, 14), // 33
  new goog.date.Interval(goog.date.Interval.DAYS, 21), // 34
  new goog.date.Interval(goog.date.Interval.DAYS, 28), // 35
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // 36
  new goog.date.Interval(goog.date.Interval.MONTHS, 2), // 37
  new goog.date.Interval(goog.date.Interval.MONTHS, 3), // 38
  new goog.date.Interval(goog.date.Interval.MONTHS, 4), // 39
  new goog.date.Interval(goog.date.Interval.MONTHS, 6), // 40
  new goog.date.Interval(goog.date.Interval.YEARS, 1), // 41
  new goog.date.Interval(goog.date.Interval.YEARS, 2) // 42
];


/**
 * @param {number} min .
 * @param {number} max .
 * @param {boolean} asMinor .
 * @return {!goog.date.Interval} .
 * @private
 */
anychart.scales.DateTimeTicks.prototype.calculateIntervals_ = function(min, max, asMinor) {
  var range = Math.abs(max - min) / (this.count_);
  var len = anychart.scales.DateTimeTicks.RANGES_.length;
  for (var i = 0; i < len; i++) {
    if (range <= anychart.scales.DateTimeTicks.RANGES_[i]) {
      if (asMinor)
        return anychart.scales.DateTimeTicks.MINOR_INTERVALS_[i].clone();
      else
        return anychart.scales.DateTimeTicks.MAJOR_INTERVALS_[i].clone();
    }
  }
  // Math.ceil(range / (365 * 24 * 60 * 60 * 1000)) is always >= 0.5, because the last
  // anychart.scales.DateTimeTicks.RANGES_ is half a year, so there shouldn't be a situation when interval is 0.
  if (asMinor)
    return new goog.date.Interval(goog.date.Interval.YEARS, Math.ceil(range / (365 * 24 * 60 * 60 * 1000)) / 4);
  else
    return new goog.date.Interval(goog.date.Interval.YEARS, Math.ceil(range / (365 * 24 * 60 * 60 * 1000)));
};


/**
 * Aligns passed timestamp to the left according to the passed interval.
 * @param {number} date Date to align.
 * @param {goog.date.Interval} interval Interval to align by.
 * @param {number} flagDateValue Flag date to align within years scope.
 * @return {number} Aligned timestamp.
 * @private
 */
anychart.scales.DateTimeTicks.prototype.alignDateLeft_ = function(date, interval, flagDateValue) {
  var dateObj = new Date(date);

  var years = dateObj.getUTCFullYear();
  var months = dateObj.getUTCMonth();
  var days = dateObj.getUTCDate();
  var hours = dateObj.getUTCHours();
  var minutes = dateObj.getUTCMinutes();
  var seconds = dateObj.getUTCSeconds();
  var milliseconds = dateObj.getUTCMilliseconds();

  if (interval.years) {
    var flagDate = new Date(flagDateValue);
    var flagYear = flagDate.getUTCFullYear();
    years = anychart.utils.alignLeft(years, interval.years, flagYear);
    return Date.UTC(years, 0);
  } else if (interval.months) {
    months = anychart.utils.alignLeft(months, interval.months);
    return Date.UTC(years, months);
  } else if (interval.days) {
    days = anychart.utils.alignLeft(days, interval.days);
    return Date.UTC(years, months, days);
  } else if (interval.hours) {
    hours = anychart.utils.alignLeft(hours, interval.hours);
    return Date.UTC(years, months, days, hours);
  } else if (interval.minutes) {
    minutes = anychart.utils.alignLeft(minutes, interval.minutes);
    return Date.UTC(years, months, days, hours, minutes);
  } else if (interval.seconds >= 1) {
    seconds = anychart.utils.alignLeft(seconds, interval.seconds);
    return Date.UTC(years, months, days, hours, minutes, seconds);
  } else if (interval.seconds) {
    milliseconds = anychart.utils.alignLeft(milliseconds, interval.seconds * 1000);
    return Date.UTC(years, months, days, hours, minutes, seconds, milliseconds);
  } else {
    return date;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.DateTimeTicks.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['explicit'] = this.explicit_;
  data['count'] = this.count_;
  data['interval'] = this.interval_;
  return data;
};


/** @inheritDoc */
anychart.scales.DateTimeTicks.prototype.deserialize = function(value) {
  this.explicit_ = value['explicit'] || null;
  this.count_ = goog.isNull(value['count']) ? NaN : Math.max(2, Math.ceil(value['count']));
  this.interval_ = goog.isNull(value['interval']) ? NaN : value['interval'];
  return goog.base(this, 'deserialize', value);
};


//exports
anychart.scales.DateTimeTicks.prototype['interval'] = anychart.scales.DateTimeTicks.prototype.interval;//doc|ex
anychart.scales.DateTimeTicks.prototype['count'] = anychart.scales.DateTimeTicks.prototype.count;//doc|ex
anychart.scales.DateTimeTicks.prototype['set'] = anychart.scales.DateTimeTicks.prototype.set;//doc|ex
anychart.scales.DateTimeTicks.prototype['get'] = anychart.scales.DateTimeTicks.prototype.get;//doc|ex
