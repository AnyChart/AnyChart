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
  goog.base(this);

  /**
   * Numeric value of minDate in this.dateRange_;
   * @type {number}
   * @private
   */
  this.min_ = NaN;

  /**
   * Numeric value of maxDate in this.dateRange_;
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
   * Contains total min date without a timeline's gap value.
   * @type {number}
   */
  this.trackedTotalMin = NaN;

  /**
   * Contains total max date without a timeline's gap value.
   * @type {number}
   */
  this.trackedTotalMax = NaN;

  /**
   * Current date. Used for this.timestampToRatio('current') to make this method return the same on different calls.
   * @type {number}
   */
  this.currentDate = NaN;

};
goog.inherits(anychart.scales.GanttDateTime, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.GanttDateTime.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION |
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
 * @type {Array.<goog.date.Interval>}
 */
anychart.scales.GanttDateTime.TOP_INTERVALS = [
  new goog.date.Interval(goog.date.Interval.DAYS, 1),    //0
  new goog.date.Interval(goog.date.Interval.DAYS, 7),    //1
  new goog.date.Interval(goog.date.Interval.MONTHS, 1),  //2
  new goog.date.Interval(goog.date.Interval.YEARS, 1),   //3
  new goog.date.Interval(goog.date.Interval.YEARS, 10)   //4
];


/**
 * Middle intervals.
 * @type {Array.<goog.date.Interval>}
 */
anychart.scales.GanttDateTime.MID_INTERVALS = [
  new goog.date.Interval(goog.date.Interval.HOURS, 1),  //0
  new goog.date.Interval(goog.date.Interval.DAYS, 1),   //1
  new goog.date.Interval(goog.date.Interval.DAYS, 7),   //2
  new goog.date.Interval(goog.date.Interval.MONTHS, 3), //3
  new goog.date.Interval(goog.date.Interval.YEARS, 1)   //4
];


/**
 * Low intervals.
 * @type {Array.<goog.date.Interval>}
 */
anychart.scales.GanttDateTime.LOW_INTERVALS = [
  new goog.date.Interval(goog.date.Interval.MINUTES, 10), //0
  new goog.date.Interval(goog.date.Interval.HOURS, 2),    //1
  new goog.date.Interval(goog.date.Interval.DAYS, 1),     //2
  new goog.date.Interval(goog.date.Interval.DAYS, 14),    //3
  new goog.date.Interval(goog.date.Interval.MONTHS, 3)    //4
];


/**
 * Array of top level text formatters.
 * @type {Array.<function(number):string>}
 */
anychart.scales.GanttDateTime.TOP_TEXT_FORMATTERS = [
  anychart.scales.GanttDateTime.createTextFormatter_('EE, MM/dd/yyyy'), //'Tue, 06/13/2001'
  anychart.scales.GanttDateTime.createTextFormatter_('MM/dd/yyyy', '%s - %s'), //'Week 06/31/2014 - 07/-6/2014'
  anychart.scales.GanttDateTime.createTextFormatter_('MMMM, yyyy'), //'January, 2014'
  anychart.scales.GanttDateTime.createTextFormatter_('yyyy'), //'2014'
  anychart.scales.GanttDateTime.createTextFormatter_('yyyy', '%s - %s') //'2014 - 2024'
];


/**
 * Array of mid level text formatters.
 * @type {Array.<function(number):string>}
 */
anychart.scales.GanttDateTime.MID_TEXT_FORMATTERS = [
  anychart.scales.GanttDateTime.createTextFormatter_('KKa'), //'10AM'
  anychart.scales.GanttDateTime.createTextFormatter_('EEEE, MM/dd'), //'Monday, 01/31'
  anychart.scales.GanttDateTime.createTextFormatter_('MM/dd/yy', '%s - %s'), //'Week 06/31/2014 - 07/-6/2014'
  anychart.scales.GanttDateTime.createTextFormatter_('QQQQ'), //'1st quarter'
  anychart.scales.GanttDateTime.createTextFormatter_('yyyy') //'2014'
];


/**
 * Array of low level text formatters.
 * @type {Array.<function(number):string>}
 */
anychart.scales.GanttDateTime.LOW_TEXT_FORMATTERS = [
  anychart.scales.GanttDateTime.createTextFormatter_('mm'), //'15' - minutes
  anychart.scales.GanttDateTime.createTextFormatter_('KKa'), //'07PM'
  anychart.scales.GanttDateTime.createTextFormatter_('EE, d'), //'Mon, 2'
  anychart.scales.GanttDateTime.createTextFormatter_('d MMM'), //'3 Jan'
  anychart.scales.GanttDateTime.createTextFormatter_('Q') //'Q1'
];


/**
 * Whether scale is not configured.
 * Used for serialization purposes.
 * @return {boolean} - Whether scale is not configured.
 */
anychart.scales.GanttDateTime.prototype.isEmpty = function() {
  return isNaN(this.min_) && isNaN(this.totalMin_) && isNaN(this.max_) && isNaN(this.totalMax_);
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
  var needsRecalculation = false;
  if ((this.min_ != min || this.max_ != max) && !isNaN(max) && !isNaN(min)) {
    if (isNaN(this.min_)) this.min_ = min;
    if (isNaN(this.max_)) this.max_ = max;
    if (isNaN(this.totalMin_)) this.totalMin_ = min;
    if (isNaN(this.totalMax_)) this.totalMax_ = max;

    if (min < this.totalMax_) {
      this.min_ = Math.max(this.totalMin_, min);
      needsRecalculation = true;
    }

    if (max > this.totalMin_) {
      this.max_ = Math.min(this.totalMax_, max);
      needsRecalculation = true;
    }

    if (needsRecalculation) this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/**
 * Sets a total minimum and maximum dates for the scale.
 * TODO (A.Kudryavtsev): Describe how min and max values are limited by total min and total max.
 * @param {*} min - Minimum value.
 * @param {*} max - Maximum value.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.setTotalRange = function(min, max) {
  min = anychart.utils.normalizeTimestamp(min);
  max = anychart.utils.normalizeTimestamp(max);
  if (this.totalMin_ != min || this.totalMax_ != max) {
    if (isNaN(this.min_)) this.min_ = min;
    if (isNaN(this.max_)) this.max_ = max;
    if (isNaN(this.totalMin_)) this.totalMin_ = min;
    if (isNaN(this.totalMax_)) this.totalMax_ = max;

    if (this.max_ < min && this.min_ > max) { //Ranges don't cross each other: choose newly set range.
      this.min_ = min;
      this.max_ = max;
    } else {
      this.min_ = Math.max(this.min_, min);
      this.max_ = Math.min(this.max_, max);
    }

    this.totalMin_ = min;
    this.totalMax_ = max;

    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/**
 * Gets minimum and maximum dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getRange = function() {
  return {'min': this.min_, 'max': this.max_};
};


/**
 * Gets total minimum and maximum dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getTotalRange = function() {
  return {'min': this.totalMin_, 'max': this.totalMax_};
};


/**
 * Fits scale to its total range.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.fitAll = function() {
  return this.setRange(this.totalMin_, this.totalMax_);
};


/**
 * Calculates ticks depending on current scale settings and value passed.
 * @param {(number|Date|goog.date.UtcDateTime)} anchorDate - Value to be turned into a date (mills).
 * @param {goog.date.Interval} interval - Interval that definitely must cross the anchorDate.
 * @return {Array.<number>} - Array of ticks.
 */
anychart.scales.GanttDateTime.prototype.getTicks = function(anchorDate, interval) {
  var anchor = anychart.utils.normalizeTimestamp(anchorDate);

  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

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

    if (anchor <= this.min_) {
      return this.seek_(anchorDate, interval);
    }

    if (anchor > this.min_ && anchor < this.max_) {
      var foundLeft = this.seek_(anchorDate, interval, true);
      var foundRight = this.seek_(anchorDate, interval, false, true);
      return goog.array.concat(foundLeft, foundRight);
    }

    if (anchor >= this.max_) {
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
    if (anchor <= this.min_) {
      delta = Math.floor((this.min_ - anchor) / intervalLength) * intervalLength;
      minAnchor = anchor + delta;
    } else {
      delta = Math.ceil((anchor - this.min_) / intervalLength) * intervalLength;
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
  //if (goog.isNumber(startDate)) startDate = new goog.date.UtcDateTime(new Date(startDate));
  //if (startDate instanceof Date) startDate = new goog.date.UtcDateTime(startDate);

  //startDate = new goog.date.UtcDateTime(anychart.format.parseDateTime(startDate));
  startDate = new goog.date.UtcDateTime(anychart.format.parseDateTime(startDate));

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
        if (newAnchorMs < this.max_) { // newAnchorMs <= this.max_ < anchorMs
          firstFound = true;
          if (!opt_ignoreFirstFoundValue) result.push(anchorMs);
        }
      } else {
        goog.array.insertAt(result, anchorMs, 0);
      }

      secondFound = newAnchorMs <= this.min_;
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
        if (this.min_ < newAnchorMs) { // anchorMs <= this.min_ < newAnchorMs
          firstFound = true;
          if (!opt_ignoreFirstFoundValue) result.push(anchorMs);
        }
      } else {
        result.push(anchorMs);
      }

      secondFound = this.max_ <= newAnchorMs;
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
  var val;
  if (goog.isString(value)) {
    switch (value.toLowerCase()) { //Got string like 'current'.
      case anychart.enums.GanttDateTimeMarkers.CURRENT:
        if (isNaN(this.currentDate))
          this.currentDate = goog.now();
        val = this.currentDate;
        break;
      case anychart.enums.GanttDateTimeMarkers.START:
        val = this.trackedTotalMin;
        break;
      case anychart.enums.GanttDateTimeMarkers.END:
        val = this.trackedTotalMax;
    }

    if (!goog.isDef(val)) { //Got string representation of date.
      val = anychart.format.parseDateTime(value);
    }
  }

  val = goog.isDefAndNotNull(val) ? val : anychart.utils.normalizeTimestamp(value);

  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

  //You will get this return expression if you draw a time axis and mark a values there.
  return (val - this.min_) / (this.max_ - this.min_);
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
  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

  //You will get this return expression if you draw a time axis and mark a values there.
  return Math.round(value * (this.max_ - this.min_) + this.min_);
};


/**
 * Aligns passed timestamp to the left according to the passed interval.
 * @param {number} date - Date to align.
 * @param {goog.date.Interval} interval - Interval to align by.
 * @param {number} flagDateValue - Flag date to align within years scope.
 * @return {number} - Aligned timestamp.
 * @private
 */
anychart.scales.GanttDateTime.prototype.alignDateLeft_ = function(date, interval, flagDateValue) {
  var dateObj = new Date(date);

  var years = dateObj.getUTCFullYear();
  var months = dateObj.getUTCMonth();
  var days = dateObj.getUTCDate();
  var hours = dateObj.getUTCHours();
  var minutes = dateObj.getUTCMinutes();

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
  } else {
    return date;
  }
};


/**
 * Gets level settings for current scale state.
 * @return {Array|number}
 */
anychart.scales.GanttDateTime.prototype.getLevelsData = function() {
  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

  var range = this.max_ - this.min_;
  var ranges = anychart.scales.GanttDateTime.RANGES;
  var index = -1;
  for (var i = 0; i < ranges.length; i++) {
    if (range <= ranges[i]) {
      index = i;
      break;
    }
  }

  if (index < 0) index = ranges.length - 1;

  return [
    {
      'anchor': this.alignDateLeft_(this.min_, anychart.scales.GanttDateTime.TOP_INTERVALS[index], 0),
      'interval': anychart.scales.GanttDateTime.TOP_INTERVALS[index],
      'formatter': anychart.scales.GanttDateTime.TOP_TEXT_FORMATTERS[index]
    },

    {
      'anchor': this.alignDateLeft_(this.min_, anychart.scales.GanttDateTime.MID_INTERVALS[index], 0),
      'interval': anychart.scales.GanttDateTime.MID_INTERVALS[index],
      'formatter': anychart.scales.GanttDateTime.MID_TEXT_FORMATTERS[index]
    },

    {
      'anchor': this.alignDateLeft_(this.min_, anychart.scales.GanttDateTime.LOW_INTERVALS[index], 0),
      'interval': anychart.scales.GanttDateTime.LOW_INTERVALS[index],
      'formatter': anychart.scales.GanttDateTime.LOW_TEXT_FORMATTERS[index]
    }
  ];

};


/**
 * If total min is visually reached.
 * @return {boolean}
 */
anychart.scales.GanttDateTime.prototype.minReached = function() {
  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

  return this.min_ <= this.totalMin_;
};


/**
 * If total max is visually reached.
 * @return {boolean}
 */
anychart.scales.GanttDateTime.prototype.maxReached = function() {
  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

  return this.max_ >= this.totalMax_;
};


/**
 * Zooms scale in.
 * @param {number=} opt_zoomFactor - Zoom in factor value. "opt_zoomFactor = 5" means 5 times closer.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomIn = function(opt_zoomFactor) {
  if (isNaN(this.min_) || isNaN(this.max_))
    this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

  opt_zoomFactor = opt_zoomFactor ? (1 / opt_zoomFactor) : (1 / anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR);
  var msInterval = Math.round((this.max_ - this.min_) * (opt_zoomFactor - 1) / 2);
  this.setRange(this.min_ - msInterval, this.max_ + msInterval);

  return this;
};


/**
 * Zooms scale out.
 * @param {number=} opt_zoomFactor - Zoom out factor value. "opt_zoomFactor = 5" means 5 times further.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomOut = function(opt_zoomFactor) {
  if (!this.minReached() || !this.maxReached()) {
    if (isNaN(this.min_) || isNaN(this.max_))
      this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

    opt_zoomFactor = opt_zoomFactor || anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR;
    var msInterval = Math.round((this.max_ - this.min_) * (opt_zoomFactor - 1) / 2);

    var newMin = this.min_ - msInterval;
    var newMax = this.max_ + msInterval;

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
 * @param {number} start - Start date timestamp.
 * @param {number=} opt_end - End date timestamp.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomTo = function(start, opt_end) {
  var range;
  if (goog.isDef(opt_end)) {
    range = opt_end - start;
  } else {
    range = this.max_ - this.min_;
    opt_end = start + range;
  }

  var totalRange = this.totalMax_ - this.totalMin_;
  range = Math.min(totalRange, range);

  if (opt_end > this.totalMax_) {
    opt_end = this.totalMax_;
    start = opt_end - range;
  }

  if (start < this.totalMin_) {
    start = this.totalMin_;
    opt_end = start + range;
  }

  return this.setRange(start, opt_end);
};


/**
 * Performs scroll by ratio passed.
 * @param {number} ratio - Ratio.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.ratioScroll = function(ratio) {
  if (ratio) {
    if (isNaN(this.min_) || isNaN(this.max_))
      this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

    var msInterval = Math.round((this.max_ - this.min_) * ratio);
    var interval = 0;
    if (msInterval >= 0) {
      interval = Math.min(this.totalMax_ - this.max_, msInterval);
    } else {
      interval = Math.max(this.totalMin_ - this.min_, msInterval);
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
  if (ratio) {
    if (isNaN(this.min_) || isNaN(this.max_))
      this.setRange(anychart.core.gantt.Controller.GANTT_BIRTH_DATE, anychart.core.gantt.Controller.GANTT_DEATH_DATE);

    var msInterval = Math.round((this.max_ - this.min_) * ratio);

    var newMin = this.min_ + msInterval;
    var newMax = this.max_ + msInterval;

    this.totalMin_ = Math.min(this.totalMin_, newMin);
    this.min_ = newMin;
    this.totalMax_ = Math.max(this.totalMax_, newMax);
    this.max_ = newMax;

    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/** @inheritDoc */
anychart.scales.GanttDateTime.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  if (!isNaN(this.min_) && !isNaN(this.max_)) json['range'] = this.getRange();
  if (!isNaN(this.totalMin_) && !isNaN(this.totalMax_)) json['totalRange'] = this.getTotalRange();

  return json;
};


/** @inheritDoc */
anychart.scales.GanttDateTime.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  if ('range' in config) {
    var range = config['range'];
    this.setRange(range['min'], range['max']);
  }

  if ('totalRange' in config) {
    var totalRange = config['totalRange'];
    this.setTotalRange(totalRange['min'], totalRange['max']);
  }

};
