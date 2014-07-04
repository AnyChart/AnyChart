goog.provide('anychart.scales.DateTimeTicks');

goog.require('anychart.Base');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');



/**
 * Scale ticks.
 * @param {!anychart.scales.DateTime} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.Base}
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
goog.inherits(anychart.scales.DateTimeTicks, anychart.Base);


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
 * Gets or sets ticks interval value. Note, that interval value can be read only if it was set explicitly.
 * It is returned as NaN otherwise. If opt_value is defined but is not a number or less than 0, it defaults to NaN and
 * count() resets to 5.
 * @param {number|string=} opt_years Years or string representing date part or ISO 8601 interval string.
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
    else
      val = new goog.date.Interval(opt_years, opt_months, opt_days, opt_hours, opt_minutes, opt_seconds);
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
 * Gets or sets ticks count value. If opt_value is defined but not a number or less than 2, it defaults to 5.
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
 * @param {Array} ticks Explicit ticks array.
 * @return {!anychart.scales.DateTimeTicks} Returns itself for method chaining.
 */
anychart.scales.DateTimeTicks.prototype.set = function(ticks) {
  if (this.explicit_ != ticks) {
    this.count_ = NaN;
    this.interval_ = null;
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
anychart.scales.DateTimeTicks.prototype.get = function() {
  if (this.explicit_)
    return this.explicit_;
  this.scale_.calculate();
  return /** @type {!Array} */(this.autoTicks_);
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
 * Calculates ticks sequence and adjusts passed min and max to fit to it better if allowed. Returns an array of new
 * min and max values for the scale to adjust.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {number=} opt_originalMin Original min value (sometimes some minor ticks may be placed before the first major
 *    tick).
 * @param {number=} opt_originalMax Original max value (sometimes some minor ticks may be placed after the first major
 *    tick).
 */
anychart.scales.DateTimeTicks.prototype.setupAsMinor = function(min, max, opt_originalMin, opt_originalMax) {
  this.autoTicks_ = null;
  if (!this.explicit_) {
    var ticks = [];
    var interval = this.interval_ || this.calculateIntervals_(
        goog.isDef(opt_originalMin) ? opt_originalMin : min,
        goog.isDef(opt_originalMax) ? opt_originalMax : max,
        true);
    var date = new goog.date.UtcDateTime(new Date(min));
    var endDate = new goog.date.UtcDateTime(new Date(max));
    for (; goog.date.Date.compare(date, endDate) <= 0; date.add(interval))
      ticks.push(date.getTime());
    this.autoTicks_ = ticks;
  }
};


/**
 * Array of different ranges. Used by interval auto calculation.
 * @type {!Array.<number>}
 * @private
 */
anychart.scales.DateTimeTicks.RANGES_ = [
  1, //MS5_1MS
  5, //MS20_5MS
  20, //MS100_20MS
  100, //MS500_100MS
  500, //SECOND2_500MS
  60000 / 30, //SECOND10_2SECOND
  60000 / 6, //SECOND30_10SECOND
  0.5 * 60000, //MINUTE2_30SECOND
  2 * 60000, //MINUTE10_2MINUTE
  10 * 60000, //MINUTE30_10MINUTE
  30 * 60000, //HOUR_30MINUTE
  24 * 60 * 60 * 1000 / 24, //HOUR3_HOUR
  24 * 60 * 60 * 1000 / 4, //HOUR12_3HOUR
  0.5 * 24 * 60 * 60 * 1000, //DAY_12HOUR
  24 * 60 * 60 * 1000, //MONTH_DAY
  7 * 24 * 60 * 60 * 1000, //MONTH_7DAYS
  30 * 24 * 60 * 60 * 1000, //YEAR_MONTH
  60 * 24 * 60 * 60 * 1000, //YEAR_2MONTH
  90 * 24 * 60 * 60 * 1000, //YEAR_QUARTER
  180 * 24 * 60 * 60 * 1000 //YEAR_HALF
];


/**
 * Array of minor intervals, synced with RANGES_. Used by interval auto calculation.
 * @type {!Array.<!goog.date.Interval>}
 * @private
 */
anychart.scales.DateTimeTicks.MINOR_INTERVALS_ = [
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.001), // MS5_1MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.005), // MS20_5MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.020), // MS100_20MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.100), // MS500_100MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.500), // SECOND2_500MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 2), // SECOND10_2SECOND
  new goog.date.Interval(goog.date.Interval.SECONDS, 10), // SECOND30_10SECOND
  new goog.date.Interval(goog.date.Interval.SECONDS, 30), // MINUTE2_30SECOND
  new goog.date.Interval(goog.date.Interval.MINUTES, 2), // MINUTE10_2MINUTE
  new goog.date.Interval(goog.date.Interval.MINUTES, 10), // MINUTE30_10MINUTE
  new goog.date.Interval(goog.date.Interval.MINUTES, 30), // HOUR_30MINUTE
  new goog.date.Interval(goog.date.Interval.HOURS, 1), // HOUR3_HOUR
  new goog.date.Interval(goog.date.Interval.HOURS, 3), // HOUR12_3HOUR
  new goog.date.Interval(goog.date.Interval.HOURS, 12), // DAY_12HOUR
  new goog.date.Interval(goog.date.Interval.DAYS, 1), // MONTH_DAY
  new goog.date.Interval(goog.date.Interval.DAYS, 7), // MONTH_7DAYS
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // YEAR_MONTH
  new goog.date.Interval(goog.date.Interval.MONTHS, 2), // YEAR_2MONTH
  new goog.date.Interval(goog.date.Interval.MONTHS, 3), // YEAR_QUARTER
  new goog.date.Interval(goog.date.Interval.MONTHS, 6) // YEAR_HALF
];


/**
 * Array of major intervals, synced with RANGES_. Used by interval auto calculation.
 * @type {!Array.<!goog.date.Interval>}
 * @private
 */
anychart.scales.DateTimeTicks.MAJOR_INTERVALS_ = [
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.005), // MS5_1MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.020), // MS20_5MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.100), // MS100_20MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 0.500), // MS500_100MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 2), // SECOND2_500MS
  new goog.date.Interval(goog.date.Interval.SECONDS, 10), // SECOND10_2SECOND
  new goog.date.Interval(goog.date.Interval.SECONDS, 30), // SECOND30_10SECOND
  new goog.date.Interval(goog.date.Interval.MINUTES, 2), // MINUTE2_30SECOND
  new goog.date.Interval(goog.date.Interval.MINUTES, 10), // MINUTE10_2MINUTE
  new goog.date.Interval(goog.date.Interval.MINUTES, 30), // MINUTE30_10MINUTE
  new goog.date.Interval(goog.date.Interval.HOURS, 1), // HOUR_30MINUTE
  new goog.date.Interval(goog.date.Interval.HOURS, 3), // HOUR3_HOUR
  new goog.date.Interval(goog.date.Interval.HOURS, 12), // HOUR12_3HOUR
  new goog.date.Interval(goog.date.Interval.DAYS, 1), // DAY_12HOUR
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // MONTH_DAY
  new goog.date.Interval(goog.date.Interval.MONTHS, 1), // MONTH_7DAYS
  new goog.date.Interval(goog.date.Interval.YEARS, 1), // YEAR_MONTH
  new goog.date.Interval(goog.date.Interval.YEARS, 1), // YEAR_2MONTH
  new goog.date.Interval(goog.date.Interval.YEARS, 1), // YEAR_QUARTER
  new goog.date.Interval(goog.date.Interval.YEARS, 1) // YEAR_HALF
];


/**
 * @param {number} min .
 * @param {number} max .
 * @param {boolean} asMinor .
 * @return {!goog.date.Interval} .
 * @private
 */
anychart.scales.DateTimeTicks.prototype.calculateIntervals_ = function(min, max, asMinor) {
  var range = Math.abs(max - min) / (this.count_ * 2);
  var len = anychart.scales.DateTimeTicks.RANGES_.length;
  for (var i = 0; i < len; i++) {
    if (range < anychart.scales.DateTimeTicks.RANGES_[i]) {
      if (asMinor)
        return anychart.scales.DateTimeTicks.MINOR_INTERVALS_[i].clone();
      else
        return anychart.scales.DateTimeTicks.MAJOR_INTERVALS_[i].clone();
    }
  }
  // Math.ceil(range / (365 * 24 * 60 * 60 * 1000)) is always >= 0.5, because the last
  // anychart.scales.DateTimeTicks.RANGES_ is half a year, so there shouldn't be a situation when interval is 0.
  if (asMinor)
    return new goog.date.Interval(goog.date.Interval.YEARS, Math.ceil(range / (365 * 24 * 60 * 60 * 1000)));
  else
    return new goog.date.Interval(goog.date.Interval.YEARS, Math.ceil(range / (365 * 24 * 60 * 60 * 1000) * 2));
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
  } else if (interval.seconds) {
    seconds = anychart.utils.alignLeft(seconds, interval.seconds);
    return Date.UTC(years, months, days, hours, minutes, seconds);
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
