goog.provide('anychart.scales.GanttDateTime');

goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.format');

goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');
goog.require('goog.string.format');



/**
 * Gantt date time scale implementation.
 *
 * This scale is created totally separated from the other scales and does not extend common scale
 * classes (anychart.scales.Base or anychart.scales.ScatterBase or anychart.scales.DateTime) because here are
 * some critical differences in inherited methods usage.
 *
 * For example, gantt date time scale can't be inverted, transformed ticks can be out of [0..1] range etc.
 * Nevertheless, some method names are similar to methods of another scales and can be used in the same way.
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.GanttDateTime = function() {
  anychart.scales.GanttDateTime.base(this, 'constructor');

  /**
   * Currently visible min value.
   * @type {number}
   * @private
   */
  this.min_ = NaN;

  /**
   * Currently visible max value.;
   * @type {number}
   * @private
   */
  this.max_ = NaN;

  /**
   * Absolute minimum of scale.
   * @type {number}
   * @private
   */
  this.totalMin_ = NaN;

  /**
   * Absolute maximum of scale.
   * @type {number}
   * @private
   */
  this.totalMax_ = NaN;

  /**
   * Data minimum of scale.
   * @type {number}
   * @private
   */
  this.dataMin_ = NaN;

  /**
   * Data maximum of scale.
   * @type {number}
   * @private
   */
  this.dataMax_ = NaN;

  /**
   * Contains total min date without a timeline's gap value.
   * @type {number}
   */
  this.trackedDataMin = NaN;

  /**
   * Contains total max date without a timeline's gap value.
   * @type {number}
   */
  this.trackedDataMax = NaN;

  /**
   * Manually set scale's min.
   * Is more important than totalMin.
   * @type {number}
   * @private
   */
  this.manualMin_ = NaN;

  /**
   * Manually set scale's max.
   * Is more important than totalMax.
   * @type {number}
   * @private
   */
  this.manualMax_ = NaN;

  /**
   * Manually set scale's soft min.
   * Is more important than totalMin.
   * @type {number}
   * @private
   */
  this.softMin_ = NaN;

  /**
   * Manually set scale's soft max.
   * Is more important than totalMax.
   * @type {number}
   * @private
   */
  this.softMax_ = NaN;

  /**
   * Minimum gap.
   * @type {number}
   * @private
   */
  this.minimumGap_ = .01;

  /**
   * Maximum gap.
   * @type {number}
   * @private
   */
  this.maximumGap_ = .01;

  /**
   * Current date. Used for this.timestampToRatio('current') to make this method return the same on different calls.
   * @type {number}
   */
  this.currentDate = NaN;

  /**
   * Whether recalculation is required.
   * @type {boolean}
   */
  this.consistent = false;

  /**
   * Min for empty data.
   * @type {number}
   * @private
   */
  this.emptyMin_ = NaN;

  /**
   * Max for empty data.
   * @type {number}
   * @private
   */
  this.emptyMax_ = NaN;

};
goog.inherits(anychart.scales.GanttDateTime, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.GanttDateTime.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Amount of milliseconds in second.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_SECOND = 1000;


/**
 * Amount of milliseconds in minute.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE = anychart.scales.GanttDateTime.MILLISECONDS_IN_SECOND * 60;


/**
 * Amount of milliseconds in hour.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_HOUR = anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE * 60;


/**
 * Amount of milliseconds in day.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY = anychart.scales.GanttDateTime.MILLISECONDS_IN_HOUR * 24;


/**
 * Default zoom factor.
 * @type {number}
 */
anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR = 1.25;


/**
 * Creates function that returns formatted string by pattern.
 * @param {string} pattern - Pattern.
 * @param {string=} opt_template - Template to create a resulting string.
 *  Note: Template must be used to express date ranges, so it MUST contain two '%s' expressions. First one means
 *  formatted start date, second one means formatted end date.
 * @return {Function} - Formatter function.
 * @private
 */
anychart.scales.GanttDateTime.createTextFormatter_ = function(pattern, opt_template) {
  if (opt_template) {
    return function(startDate, endDate) {
      return goog.string.format(
          /** @type {string} */ (opt_template),
          anychart.format.dateTime(startDate, pattern),
          anychart.format.dateTime(endDate, pattern)
      );
    }
  } else {
    return function(startDate) {
      return anychart.format.dateTime(startDate, pattern);
    }
  }
};


/**
 * Millisecond ranges.
 * Literally this means that if current scale range suits to RANGES[i], than index i will be
 * used to select all the other settings from TOP_ - MID_ - LOW_INTERVALS and ..TEXT_FORMATTERS.
 * @type {Array.<number>}
 */
anychart.scales.GanttDateTime.RANGES = [
  (anychart.scales.GanttDateTime.MILLISECONDS_IN_HOUR * 4),       //0
  (anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY * 3),        //1
  (anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY * 31),       //2
  (anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY * 365),      //3
  (anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY * 365 * 10)  //4
];


/**
 * Top intervals.
 * @type {Array.<{unit: anychart.enums.Interval, count: number}>}
 */
anychart.scales.GanttDateTime.TOP_INTERVALS = [
  {unit: anychart.enums.Interval.DAY, count: 1},    //0
  {unit: anychart.enums.Interval.WEEK, count: 1},    //1
  {unit: anychart.enums.Interval.MONTH, count: 1},  //2
  {unit: anychart.enums.Interval.YEAR, count: 1},   //3
  {unit: anychart.enums.Interval.YEAR, count: 10}   //4
];


/**
 * Middle intervals.
 * @type {Array.<{unit: anychart.enums.Interval, count: number}>}
 */
anychart.scales.GanttDateTime.MID_INTERVALS = [
  {unit: anychart.enums.Interval.HOUR, count: 1},  //0
  {unit: anychart.enums.Interval.DAY, count: 1},   //1
  {unit: anychart.enums.Interval.WEEK, count: 1},   //2
  {unit: anychart.enums.Interval.QUARTER, count: 1}, //3
  {unit: anychart.enums.Interval.YEAR, count: 1}   //4
];


/**
 * Low intervals.
 * @type {Array.<{unit: anychart.enums.Interval, count: number}>}
 */
anychart.scales.GanttDateTime.LOW_INTERVALS = [
  {unit: anychart.enums.Interval.MINUTE, count: 10}, //0
  {unit: anychart.enums.Interval.HOUR, count: 2},    //1
  {unit: anychart.enums.Interval.DAY, count: 1},     //2
  {unit: anychart.enums.Interval.MONTH, count: 1},    //3
  {unit: anychart.enums.Interval.QUARTER, count: 1}    //4
];


/**
 * Whether scale is not configured.
 * Used for serialization purposes.
 * @return {boolean} - Whether scale is not configured.
 */
anychart.scales.GanttDateTime.prototype.isEmpty = function() {
  return isNaN(this.min_) && isNaN(this.max_) &&
      isNaN(this.dataMin_) && isNaN(this.dataMax_);
};


/**
 * Resets values.
 */
anychart.scales.GanttDateTime.prototype.reset = function() {
  this.min_ = NaN;
  this.max_ = NaN;
  this.totalMin_ = NaN;
  this.totalMax_ = NaN;
  this.dataMin_ = NaN;
  this.dataMax_ = NaN;
  this.consistent = false;
};


/**
 * Gets data range for empty data.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getEmptyRange = function() {
  var now = new Date();
  if (isNaN(this.emptyMin_))
    this.emptyMin_ = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (isNaN(this.emptyMax_))
    this.emptyMax_ = this.emptyMin_ + anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY;
  return {'min': this.emptyMin_, 'max': this.emptyMax_};
};


/**
 * Sets a minimum and maximum dates for the scale.
 * TODO (A.Kudryavtsev): Describe how min and max values are limited by total min and total max.
 * @param {*} min - Minimum value.
 * @param {*} max - Maximum value.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.setRange = function(min, max) {
  min = anychart.utils.normalizeTimestamp(min);
  max = anychart.utils.normalizeTimestamp(max);
  if ((this.min_ != min || this.max_ != max) && !isNaN(max) && !isNaN(min)) {
    this.min_ = min;
    this.max_ = max;
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/**
 * Sets a data minimum and maximum dates for the scale.
 * TODO (A.Kudryavtsev): Describe how min and max values are limited by total min and total max.
 * @param {*} min - Minimum value.
 * @param {*} max - Maximum value.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.setDataRange = function(min, max) {
  min = anychart.utils.normalizeTimestamp(min);
  max = anychart.utils.normalizeTimestamp(max);
  if (this.dataMin_ != min || this.dataMax_ != max) {
    this.dataMin_ = min;
    this.dataMax_ = max;
    this.totalMin_ = NaN;
    this.totalMax_ = NaN;
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/**
 * Gets minimum and maximum dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getRange = function() {
  this.calculate();
  return this.isEmpty() ? this.getEmptyRange() : {'min': this.min_, 'max': this.max_};
};


/**
 * Gets total minimum and maximum dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getTotalRange = function() {
  var range, gap;
  if (isNaN(this.totalMin_)) {
    if (isNaN(this.manualMin_)) {
      if (isNaN(this.softMin_)) {
        var max = (isNaN(this.manualMax_) ? (isNaN(this.softMax_) ? this.dataMax_ : Math.max(this.dataMax_, this.softMax_)) : this.manualMax_);
        range = max - this.dataMin_;
        gap = range * this.minimumGap_;
        this.totalMin_ = this.dataMin_ - gap;
      } else {
        this.totalMin_ = Math.min(this.softMin_, this.dataMin_);
      }
    } else {
      this.totalMin_ = this.manualMin_;
    }
  }

  if (isNaN(this.totalMax_)) {
    if (isNaN(this.manualMax_)) {
      if (isNaN(this.softMax_)) {
        var min = (isNaN(this.manualMin_) ? (isNaN(this.softMin_) ? this.dataMin_ : Math.min(this.dataMin_, this.softMin_)) : this.manualMin_);
        range = this.dataMax_ - min;
        gap = range * this.maximumGap_;
        this.totalMax_ = this.dataMax_ + gap;
      } else {
        this.totalMax_ = Math.max(this.softMax_, this.dataMax_);
      }
    } else {
      this.totalMax_ = this.manualMax_;
    }
  }

  return this.isEmpty() ? this.getEmptyRange() : {'min': this.totalMin_, 'max': this.totalMax_};
};


/**
 * Calculates and fits values.
 */
anychart.scales.GanttDateTime.prototype.calculate = function() {
  if (!this.consistent && !this.isEmpty()) {
    this.consistent = true;
    var totalRange = this.getTotalRange();
    var tMin = totalRange['min'];
    var tMax = totalRange['max'];
    if (isNaN(tMin)) {
      if (!isNaN(this.min_)) {
        this.dataMin_ = this.min_;
      }
    } else {
      if (isNaN(this.min_)) {
        this.min_ = tMin;
      } else {
        this.min_ = Math.max(this.min_, tMin);
      }
    }

    if (isNaN(tMax)) {
      if (!isNaN(this.max_)) {
        this.dataMax_ = this.max_;
      }
    } else {
      if (isNaN(this.max_)) {
        this.max_ = tMax;
      } else {
        this.max_ = Math.min(this.max_, tMax);
      }
    }

    if (this.min_ > this.max_) {
      var range = this.min_ - this.max_;
      this.min_ = Math.max(this.max_, tMin);
      this.max_ = Math.min(this.min_ + range, tMax);
    }
  }
};


/**
 * Fits scale to its total range.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.fitAll = function() {
  if (!this.isEmpty()) {
    var range = this.getTotalRange();
    return this.setRange(range['min'], range['max']);
  }
  return this;
};


/**
 * Manually sets scale's minimum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.minimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.manualMin_ != val) {
      this.manualMin_ = val;
      this.totalMin_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.manualMin_;
};


/**
 * Manually sets scale's maximum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.maximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.manualMax_ != val) {
      this.manualMax_ = val;
      this.totalMax_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.manualMax_;
};


/**
 * Manually sets scale's soft minimum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.softMinimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.softMin_ != val) {
      this.softMin_ = val;
      this.totalMin_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.softMin_;
};


/**
 * Manually sets scale's soft maximum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.softMaximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.softMax_ != val) {
      this.softMax_ = val;
      this.totalMax_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.softMax_;
};


/**
 * Gets/sets minimum gap.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.minimumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.minimumGap_ != opt_value) {
      this.minimumGap_ = opt_value;
      this.totalMin_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.minimumGap_;
};


/**
 * Gets/sets maximum gap.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.maximumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.maximumGap_ != opt_value) {
      this.maximumGap_ = opt_value;
      this.totalMax_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.maximumGap_;
};


/**
 * Calculates ticks depending on current scale settings and value passed.
 * @param {(number|Date|goog.date.UtcDateTime)} anchorDate - Value to be turned into a date (mills).
 * @param {goog.date.Interval} interval - Interval that definitely must cross the anchorDate.
 * @return {Array.<number>} - Array of ticks.
 */
anychart.scales.GanttDateTime.prototype.getTicks = function(anchorDate, interval) {
  var anchor = anychart.utils.normalizeTimestamp(anchorDate);
  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  if (interval.years || interval.months) {
    /*
      In this case the intervals have not the same length in milliseconds.
      (Duration of February != duration of July).

      To make sure that the anchor point is crossed, we have the only way:
      to go step by step from anchor point.
      In this case here are three ways:
        1) Anchor point is lefter than scale's minimum.
        2) Anchor point is between scale's min and max.
        3) Anchor point is righter than scale's maximum.
     */

    if (anchor <= min) {
      return this.seek_(anchorDate, interval);
    }

    if (anchor > min && anchor < max) {
      var foundLeft = this.seek_(anchorDate, interval, true);
      var foundRight = this.seek_(anchorDate, interval, false, true);
      return goog.array.concat(foundLeft, foundRight);
    }

    if (anchor >= max) {
      return this.seek_(anchorDate, interval, true);
    }
  } else {
    /*
      In this case interval has the same length in milliseconds.
      (Duration of March, 15 == duration of December, 2).

      In this case closest left anchor point can be calculated mathematically using the
      millisecond values.
     */

    var intervalLength = interval.days * anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY +
        interval.hours * anychart.scales.GanttDateTime.MILLISECONDS_IN_HOUR +
        interval.minutes * anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE +
        interval.seconds * anychart.scales.GanttDateTime.MILLISECONDS_IN_SECOND;

    var minAnchor, delta;
    if (anchor <= min) {
      delta = Math.floor((min - anchor) / intervalLength) * intervalLength;
      minAnchor = anchor + delta;
    } else {
      delta = Math.ceil((anchor - min) / intervalLength) * intervalLength;
      minAnchor = anchor - delta;
    }

    return this.seek_(minAnchor, interval);
  }

  return [];
};


/**
 * Performs step-by-step search.
 * @param {(number|Date|goog.date.UtcDateTime)} startDate - Start date.
 * @param {goog.date.Interval} interval - Step interval.
 * @param {boolean=} opt_inverted - If must use inverted interval.
 * @param {boolean=} opt_ignoreFirstFoundValue - Flag if first found value must be added to result.
 * @return {Array.<number>} - Array of dates.
 * @private
 */
anychart.scales.GanttDateTime.prototype.seek_ = function(startDate, interval, opt_inverted, opt_ignoreFirstFoundValue) {
  startDate = new goog.date.UtcDateTime(anychart.format.parseDateTime(startDate));
  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  var result = [];

  var firstFound = false;
  var secondFound = false;

  var anchorDate = startDate;

  var anchorMs, newAnchorMs, newAnchorDate;
  if (opt_inverted) {
    interval = interval.getInverse();
    while (!(firstFound && secondFound)) {
      anchorMs = anychart.utils.normalizeTimestamp(anchorDate);
      newAnchorDate = anchorDate.clone();
      newAnchorDate.add(interval);
      newAnchorMs = anychart.utils.normalizeTimestamp(newAnchorDate);

      if (!firstFound) {
        if (newAnchorMs < max) { // newAnchorMs <= max < anchorMs
          firstFound = true;
          if (!opt_ignoreFirstFoundValue) result.push(anchorMs);
        }
      } else {
        goog.array.insertAt(result, anchorMs, 0);
      }

      secondFound = newAnchorMs <= min;
      if (secondFound) result.push(newAnchorMs);
      anchorDate = newAnchorDate.clone();

    }
  } else {
    while (!(firstFound && secondFound)) {
      anchorMs = anychart.utils.normalizeTimestamp(anchorDate);
      newAnchorDate = anchorDate.clone();
      newAnchorDate.add(interval);
      newAnchorMs = anychart.utils.normalizeTimestamp(newAnchorDate);

      if (!firstFound) {
        if (min < newAnchorMs) { // anchorMs <= this.min_ < newAnchorMs
          firstFound = true;
          if (!opt_ignoreFirstFoundValue) result.push(anchorMs);
        }
      } else {
        result.push(anchorMs);
      }

      secondFound = max <= newAnchorMs;
      if (secondFound) result.push(newAnchorMs);
      anchorDate = newAnchorDate.clone();
    }
  }

  return result;
};


/**
 * Transforms a passed value into a ratio depending on current scale date range.
 * <b>Example: </b>
 * If current range is 12.00 - 13.00 ([0..1] in ratio expression), then
 *  12.30 -> 0.5
 *  12.15 -> 0.25
 *  14.00 -> 2
 *  11.00 -> -1
 *  11.30 -> -0.5
 *
 * @param {*} value - Value to transform.
 * @return {number} - Value transformed to ratio scope. Returns NaN if scale range is not set.
 */
anychart.scales.GanttDateTime.prototype.timestampToRatio = function(value) {
  this.calculate();
  var val;
  if (goog.isString(value)) {
    switch (value.toLowerCase()) { //Got string like 'current'.
      case anychart.enums.GanttDateTimeMarkers.CURRENT:
        if (isNaN(this.currentDate))
          this.currentDate = goog.now();
        val = this.currentDate;
        break;
      case anychart.enums.GanttDateTimeMarkers.START:
        val = this.trackedDataMin;
        break;
      case anychart.enums.GanttDateTimeMarkers.END:
        val = this.trackedDataMax;
    }

    if (!goog.isDef(val)) { //Got string representation of date.
      val = anychart.format.parseDateTime(value);
    }
  }

  val = goog.isDefAndNotNull(val) ? val : anychart.utils.normalizeTimestamp(value);

  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  //You will get this return expression if you draw a time axis and mark a values there.
  return (val - min) / (max - min);
};


/**
 * This method is added only for compatibility with line/range/text markers of gantt chart's timeline.
 * NOTE: Use timestampToRatio method instead.
 * TODO (A.Kudryavtsev): For reviewer: we have a method timestampToRatio because we also have ratioToTimestamp.
 * @param {*} value - Value to transform.
 * @param {number=} opt_subRangeRatio - This parameter will be completely ignored.
 * @return {number} - Value transformed to ratio scope. Returns NaN if scale range is not set.
 */
anychart.scales.GanttDateTime.prototype.transform = function(value, opt_subRangeRatio) {
  return this.timestampToRatio(value);
};


/**
 * Transforms a passed ratio value into a timestamp depending on current scale date range.
 * @param {number} value - Ratio.
 * @return {number} - Timestamp.
 */
anychart.scales.GanttDateTime.prototype.ratioToTimestamp = function(value) {
  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  //You will get this return expression if you draw a time axis and mark a values there.
  return Math.round(value * (max - min) + min);
};


/**
 * Makes level data.
 * @param {{unit: anychart.enums.Interval, count: number}} level
 * @param {{unit: anychart.enums.Interval, count: number}=} opt_parentLevel
 * @return {Object}
 * @private
 */
anychart.scales.GanttDateTime.prototype.makeLevelData_ = function(level, opt_parentLevel) {
  var interval = anychart.utils.getIntervalFromInfo(level.unit, level.count);
  var range = this.getRange();
  var intervalId = anychart.format.getIntervalIdentifier(level.unit, opt_parentLevel && opt_parentLevel.unit, 'timelineHeader');
  var format = anychart.format.getDateTimeFormat(intervalId, 0);

  return {
    'anchor': anychart.utils.alignDateLeft(range['min'], interval, 0),
    'interval': interval,
    'formatter': anychart.scales.GanttDateTime.createTextFormatter_(format)
  };
};


/**
 * Gets level settings for current scale state.
 * @return {Array|number}
 */
anychart.scales.GanttDateTime.prototype.getLevelsData = function() {
  this.calculate();
  var r = this.getRange();
  var min = r['min'];
  var max = r['max'];

  var range = max - min;
  var ranges = anychart.scales.GanttDateTime.RANGES;
  var index = -1;
  for (var i = 0; i < ranges.length; i++) {
    if (range <= ranges[i]) {
      index = i;
      break;
    }
  }

  if (index < 0) index = ranges.length - 1;

  var topLevelData = this.makeLevelData_(anychart.scales.GanttDateTime.TOP_INTERVALS[index]);
  var midLevelData = this.makeLevelData_(anychart.scales.GanttDateTime.MID_INTERVALS[index],
      anychart.scales.GanttDateTime.TOP_INTERVALS[index]);
  var lowLevelData = this.makeLevelData_(anychart.scales.GanttDateTime.LOW_INTERVALS[index],
      anychart.scales.GanttDateTime.MID_INTERVALS[index]);

  return [topLevelData, midLevelData, lowLevelData];
};


/**
 * If total min is visually reached.
 * @return {boolean}
 */
anychart.scales.GanttDateTime.prototype.minReached = function() {
  if (this.isEmpty())
    return true;
  else {
    var totalRange = this.getTotalRange();
    return this.min_ <= totalRange['min'];
  }
};


/**
 * If total max is visually reached.
 * @return {boolean}
 */
anychart.scales.GanttDateTime.prototype.maxReached = function() {
  if (this.isEmpty())
    return true;
  else {
    var totalRange = this.getTotalRange();
    return this.max_ >= totalRange['max'];
  }
};


/**
 * Zooms scale in.
 * @param {number=} opt_zoomFactor - Zoom in factor value. "opt_zoomFactor = 5" means 5 times closer.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomIn = function(opt_zoomFactor) {
  if (!this.isEmpty()) {
    opt_zoomFactor = opt_zoomFactor ? (1 / opt_zoomFactor) : (1 / anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR);
    var range = this.max_ - this.min_;
    var msInterval = Math.round(range * (opt_zoomFactor - 1) / 2);
    var newMin = this.min_ - msInterval;
    var newMax = this.max_ + msInterval;
    if (Math.abs(newMin - newMax) <= anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE) {
      var middle = (this.min_ + this.max_) / 2;
      newMin = middle - anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE / 2;
      newMax = middle + anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE / 2;
    }
    this.setRange(newMin, newMax);
  }

  return this;
};


/**
 * Zooms scale out.
 * @param {number=} opt_zoomFactor - Zoom out factor value. "opt_zoomFactor = 5" means 5 times further.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomOut = function(opt_zoomFactor) {
  if (!this.minReached() || !this.maxReached()) {
    opt_zoomFactor = opt_zoomFactor || anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR;
    var msInterval = Math.round((this.max_ - this.min_) * (opt_zoomFactor - 1) / 2);

    var newMin = this.min_ - msInterval;
    var newMax = this.max_ + msInterval;

    this.getTotalRange();

    if (newMin < this.totalMin_ || newMax > this.totalMax_) {
      if (newMin < this.totalMin_ && newMax > this.totalMax_) { //Total range overflow.
        this.setRange(this.totalMin_, this.totalMax_);
        return this;
      }

      if (newMin < this.totalMin_) {
        var minDiff = this.totalMin_ - newMin;
        this.setRange(this.totalMin_, newMax + minDiff); //This will extend range with total min anchor.
      }

      if (newMax > this.totalMax_) {
        var maxDiff = newMax - this.totalMax_;
        this.setRange(newMin - maxDiff, this.totalMax_); //This will extend range with total max anchor.
      }
    } else {
      this.setRange(newMin, newMax);
    }
  }
  return this;
};


/**
 * Zooms to the dates set.
 * Note:
 *  1) Start can't be set less than total start date, as well as end date can't be set more than total max.
 *  2) If end date is not set, current visible range will be used to calculate end.
 *  3) If start is less than total start, total min will be used as start, the range will be saved.
 *  4) If end is set more than total end, total max will be used as end, that range will be saved.
 *  5) In all this cases, this method can be used as safe scroller and zoomer.
 *  TODO (A.Kudryavtsev): Pretty bad english, fix this.
 *
 * @param {number|anychart.enums.Interval} startOrUnit - Start date timestamp or interval unit.
 * @param {number=} opt_endOrCount - End date timestamp or interval units count.
 * @param {anychart.enums.GanttRangeAnchor=} opt_anchor - Anchor to zoom from.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomTo = function(startOrUnit, opt_endOrCount, opt_anchor) {
  var range;
  var start, end;
  this.calculate();
  if (goog.isString(startOrUnit)) {
    if (opt_endOrCount === 0) {
      return this;
    } else {
      var anchor = anychart.enums.normalizeGanttRangeAnchor(opt_anchor);
      var unit = /** @type {anychart.enums.Interval} */ (anychart.enums.normalizeInterval(startOrUnit, anychart.enums.Interval.DAY));
      var interval = anychart.utils.getIntervalFromInfo(unit, opt_endOrCount || 1);

      var startDate;
      var anchorDate;

      switch (anchor) {
        case anychart.enums.GanttRangeAnchor.FIRST_DATE:
          anchorDate = this.dataMin_;
          break;
        case anychart.enums.GanttRangeAnchor.LAST_DATE:
          anchorDate = this.dataMax_;
          interval = interval.getInverse();
          break;
        case anychart.enums.GanttRangeAnchor.LAST_VISIBLE_DATE:
          anchorDate = this.max_;
          interval = interval.getInverse();
          break;
        case anychart.enums.GanttRangeAnchor.FIRST_VISIBLE_DATE:
          anchorDate = this.min_;
      }
      startDate = new goog.date.UtcDateTime(anychart.format.parseDateTime(anchorDate));
      var startMs = anychart.utils.normalizeTimestamp(startDate);
      startDate.add(interval);
      var endMs = anychart.utils.normalizeTimestamp(startDate);
      start = Math.min(startMs, endMs);
      end = Math.max(startMs, endMs);
      range = end - start;
    }
  } else {
    start = startOrUnit;
    end = opt_endOrCount;
    if (goog.isDef(opt_endOrCount)) {
      range = opt_endOrCount - startOrUnit;
    } else {
      range = this.max_ - this.min_;
      end = startOrUnit + range;
    }
  }

  var totalRange = this.getTotalRange();

  var totalDiff = totalRange['max'] - totalRange['min'];
  range = Math.min(totalDiff, range);

  if (end > totalRange['max']) {
    end = totalRange['max'];
    start = end - range;
  }

  if (start < totalRange['min']) {
    start = totalRange['min'];
    end = start + range;
  }

  return this.setRange(start, end);
};


/**
 * Performs scroll by ratio passed.
 * @param {number} ratio - Ratio.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.ratioScroll = function(ratio) {
  if (ratio && !this.isEmpty()) {
    var totalRange = this.getTotalRange();
    var msInterval = Math.round((this.max_ - this.min_) * ratio);
    var interval = 0;
    if (msInterval >= 0) {
      interval = Math.min(totalRange['max'] - this.max_, msInterval);
    } else {
      interval = Math.max(totalRange['min'] - this.min_, msInterval);
    }

    this.setRange(this.min_ + interval, this.max_ + interval);
  }
  return this;
};


/**
 * Performs force scroll by ratio passed. Extends total range.
 * @param {number} ratio - Ratio.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.ratioForceScroll = function(ratio) {
  if (ratio && !this.isEmpty()) {
    this.getTotalRange();

    var msInterval = Math.round((this.max_ - this.min_) * ratio);
    var newMin = this.min_ + msInterval;
    var newMax = this.max_ + msInterval;

    if ((!isNaN(this.manualMin_) && newMin < this.manualMin_) || (!isNaN(this.manualMax_) && newMax > this.manualMax_))
      return this;

    this.dataMin_ = Math.min(this.dataMin_, newMin);
    this.min_ = newMin;
    this.dataMax_ = Math.max(this.dataMax_, newMax);
    this.max_ = newMax;

    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/** @inheritDoc */
anychart.scales.GanttDateTime.prototype.serialize = function() {
  var json = anychart.scales.GanttDateTime.base(this, 'serialize');

  if (!isNaN(this.min_))
    json['visibleMinimum'] = this.min_;

  if (!isNaN(this.max_))
    json['visibleMaximum'] = this.max_;

  if (!isNaN(this.manualMin_))
    json['minimum'] = this.manualMin_;

  if (!isNaN(this.manualMax_))
    json['maximum'] = this.manualMax_;

  if (!isNaN(this.softMin_))
    json['softMinimum'] = this.softMin_;

  if (!isNaN(this.softMax_))
    json['softMaximum'] = this.softMax_;

  if (!isNaN(this.dataMin_))
    json['dataMinimum'] = this.dataMin_;

  if (!isNaN(this.dataMax_))
    json['dataMaximum'] = this.dataMax_;

  json['minimumGap'] = this.minimumGap_;
  json['maximumGap'] = this.maximumGap_;

  return json;
};


/** @inheritDoc */
anychart.scales.GanttDateTime.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.GanttDateTime.base(this, 'setupByJSON', config, opt_default);

  this.minimumGap(config['minimumGap']);
  this.maximumGap(config['maximumGap']);

  if ('minimum' in config)
    this.minimum(config['minimum']);

  if ('maximum' in config)
    this.maximum(config['maximum']);

  if ('softMinimum' in config)
    this.softMinimum(config['softMinimum']);

  if ('softMaximum' in config)
    this.softMaximum(config['softMaximum']);

  var recalc = false;
  if ('dataMinimum' in config) {
    this.dataMin_ = config['dataMinimum'];
    recalc = true;
  }

  if ('dataMaximum' in config) {
    this.dataMax_ = config['dataMaximum'];
    recalc = true;
  }

  if ('visibleMinimum' in config) {
    this.min_ = config['visibleMinimum'];
    recalc = true;
  }

  if ('visibleMaximum' in config) {
    this.max_ = config['visibleMaximum'];
    recalc = true;
  }

  if (recalc) {
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
};


//exports
(function() {
  var proto = anychart.scales.GanttDateTime.prototype;
  proto['minimumGap'] = proto.minimumGap;
  proto['maximumGap'] = proto.maximumGap;
  proto['minimum'] = proto.minimum;
  proto['maximum'] = proto.maximum;
  proto['softMinimum'] = proto.softMinimum;
  proto['softMaximum'] = proto.softMaximum;
  // proto['zoomIn'] = proto.zoomIn;
  // proto['zoomOut'] = proto.zoomOut;
  // proto['zoomTo'] = proto.zoomTo;
  // proto['fitAll'] = proto.fitAll;
})();
