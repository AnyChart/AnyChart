goog.provide('anychart.scales.Calendar');
goog.require('anychart.core.Base');
goog.require('anychart.format');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');



/**
 * Calendar representation class.
 * @param {anychart.scales.Calendar=} opt_parentCalendar
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.Calendar = function(opt_parentCalendar) {
  anychart.scales.Calendar.base(this, 'constructor');

  /**
   * Availabilities.
   * @type {Array.<anychart.scales.Calendar.AStorage>}
   * @private
   */
  this.availabilities_ = [];

  /**
   * Raw array of availabilities.
   * @type {Array.<anychart.scales.Calendar.Availability>}
   * @private
   */
  this.rawAvailabilities_ = [];

  /**
   * Parent calendar.
   * @type {anychart.scales.Calendar}
   * @private
   */
  this.parent_ = opt_parentCalendar || null;

  /**
   * Timezone offset for availabilities.
   * @type {number}
   * @private
   */
  this.tzOffset_ = 0;

  /**
   * Availabilities cache by day UTC ISO string.
   * @type {Object.<string, Array>}
   * @private
   */
  this.cache_ = {};

  /**
   * Weekend days as an array of 0-6 numbers.
   * @type {?Array.<number>}
   * @private
   */
  this.weekendRange_ = null;

  /**
   * If the weekendRange_ is default. Used in serialization.
   * @type {boolean}
   * @private
   */
  this.weekendRangeIsDefault_ = true;

  if (this.parent_) {
    this.parent_.listenSignals(this.handleParentSignals_, this);
  } else {
    var locale = anychart.format.getDateTimeLocale(anychart.format.outputLocale());
    this.weekendRange_ = goog.array.clone(locale['weekendRange']);
  }
};
goog.inherits(anychart.scales.Calendar, anychart.core.Base);


//region --- Consts and typedefs
//------------------------------------------------------------------------------
//
//  Consts and typedefs
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.scales.Calendar.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Supported signals.
 * @type {number}
 */
anychart.scales.Calendar.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * @typedef {{
 *    each: (anychart.enums.AvailabilityPeriod|undefined),
 *    on: (Date|number|string|undefined),
 *    from: (Date|number|string|undefined),
 *    to: (Date|number|string|undefined),
 *    starts: (Date|number|string|undefined),
 *    ends: (Date|number|string|undefined),
 *    isWorking: (boolean|undefined)
 * }}
 */
anychart.scales.Calendar.Availability;


/**
 * Represents one schedule item.
 * @typedef {{
 *   start: number,
 *   end: number,
 *   workingTime: Array.<Array.<number>>
 * }}
 */
anychart.scales.Calendar.ScheduleItem;


/**
 * Date format for ON clauses.
 * @type {string}
 * @private
 */
anychart.scales.Calendar.DATE_FORMAT_ = 'dd.MM';


/**
 * Base date for dates without year.
 * @type {Date}
 * @private
 */
anychart.scales.Calendar.BASE_DATE_ = new Date(Date.UTC(2000, 0));


/**
 * Milliseconds in minute const.
 * @const {number}
 * @private
 */
anychart.scales.Calendar.MS_IN_MINUTE_ = 60 * 1000;


/**
 * Milliseconds in minute const.
 * @const {number}
 * @private
 */
anychart.scales.Calendar.MS_IN_HOUR_ = 60 * 60 * 1000;


/**
 * Milliseconds in day const.
 * @const {number}
 * @private
 */
anychart.scales.Calendar.MS_IN_DAY_ = 24 * 60 * 60 * 1000;


/**
 * The first possible day, as far as this class is concerned.
 * @type {goog.date.UtcDateTime}
 */
anychart.scales.Calendar.MINIMUM_DATE = new goog.date.UtcDateTime(0, 0, 1);


/**
 * The last possible day, as far as this class is concerned.
 * @type {goog.date.UtcDateTime}
 */
anychart.scales.Calendar.MAXIMUM_DATE = new goog.date.UtcDateTime(9999, 11, 31);


/**
 * A 1-Day interval.
 * @const {goog.date.Interval}
 * @private
 */
anychart.scales.Calendar.DAY_ = new goog.date.Interval(0, 0, 1);


//endregion
//region --- Public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets regular weekend days.
 * @param {?Array.<number>=} opt_value
 * @return {anychart.scales.Calendar|Array.<number>|null}
 */
anychart.scales.Calendar.prototype.weekendRange = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var start, end, val;
    if (goog.isArray(opt_value)) {
      start = anychart.utils.normalizeToNaturalNumber(opt_value[0], NaN, true);
      start = goog.math.clamp(start, 0, 6);
      end = anychart.utils.normalizeToNaturalNumber(opt_value[0], NaN, true);
      end = goog.math.clamp(end, 0, 6);
      if (isNaN(start)) {
        if (isNaN(end)) {
          val = null;
        } else {
          val = [end, end];
        }
      } else {
        if (isNaN(end)) {
          val = [start, start];
        } else {
          if (start > end) {
            var tmp = start;
            start = end;
            end = tmp;
          }
          val = [start, end];
        }
      }
    } else {
      val = null;
    }
    this.weekendRangeIsDefault_ = false;
    this.weekendRange_ = val;
    this.dropCache_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.weekendRange_;
};


/**
 * Getter and setter for the availabilities timezone offset in minutes.
 * @param {number=} opt_value
 * @return {anychart.scales.Calendar|number}
 */
anychart.scales.Calendar.prototype.timezoneOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.tzOffset_ = anychart.utils.toNumber(opt_value);
    this.dropCache_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.tzOffset_;
};


/**
 * Gets or sets availabilities for the calendar.
 * @param {?Array.<anychart.scales.Calendar.Availability>=} opt_value
 * @return {?Array.<anychart.scales.Calendar.Availability>|anychart.scales.Calendar}
 */
anychart.scales.Calendar.prototype.availabilities = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rawAvailabilities_ = goog.isArray(opt_value) ? opt_value.slice() : [];
    this.createAvailabilities_();
    this.dropCache_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.rawAvailabilities_;
};


/**
 * todo: update the doclet.
 * Returns intervals of working days between two passed dates. The result is an array of whole day schedules for each
 * day in the passed range. Schedule for each day is represented as an array of tuples [startTime, endTime] each tuple
 * represents an interval of working time. The end of the day is considered at 23:59. All timestamps are shifted
 * according to the timezoneOffset of the calendar (so the day is considered starting at -$offset hours UTC and last for
 * exactly 24 hours).
 * @param {number|Date} startDate
 * @param {number|Date} endDate
 * @param {anychart.enums.Interval=} opt_unit
 * @param {number=} opt_count
 * @return {Array.<anychart.scales.Calendar.ScheduleItem>} An array of schedule items.
 */
anychart.scales.Calendar.prototype.getWorkingSchedule = function(startDate, endDate, opt_unit, opt_count) {
  return this.getWorkingScheduleInternal(
      anychart.utils.normalizeTimestamp(startDate),
      anychart.utils.normalizeTimestamp(endDate),
      anychart.utils.getIntervalFromInfo(
          /** @type {anychart.enums.Interval} */(anychart.enums.normalizeInterval(opt_unit, anychart.enums.Interval.DAY, true)),
          anychart.utils.normalizeToNaturalNumber(opt_count)));
};


/**
 * Returns working time between two dates (must be with clear time).
 * @param {number} start
 * @param {number} end
 * @return {Array.<Array.<number>>} An array of schedule items.
 */
anychart.scales.Calendar.prototype.getWorkingTime = function(start, end) {
  var d = new Date(start);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  var result = [];
  while (current.getTime() < end) {
    var daySchedule = this.getDaySchedule_(current);
    for (var i = 0; i < daySchedule.length; i++) {
      var time = daySchedule[i];
      result.push([
        time[0] - this.tzOffset_ * anychart.scales.Calendar.MS_IN_MINUTE_,
        time[1] - this.tzOffset_ * anychart.scales.Calendar.MS_IN_MINUTE_
      ]);
    }
    current.add(anychart.scales.Calendar.DAY_);
  }
  return result;
};


/**
 * Checks whether there is any working time between two dates in the calendar.
 * @param {number} start
 * @param {number} end
 * @return {boolean}
 */
anychart.scales.Calendar.prototype.hasWorkingTime = function(start, end) {
  var d = new Date(start);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  while (current.getTime() < end) {
    var daySchedule = this.getDaySchedule_(current);
    if (daySchedule.length)
      return true;
    current.add(anychart.scales.Calendar.DAY_);
  }
  return false;
};


//endregion
//region --- Internal methods
//------------------------------------------------------------------------------
//
//  Internal methods
//
//------------------------------------------------------------------------------
/**
 * Returns working time between two dates (must be with clear time).
 * @param {number} start
 * @param {number} end
 * @param {goog.date.Interval} interval
 * @param {boolean=} opt_addOnlyWorking
 * @return {Array.<anychart.scales.Calendar.ScheduleItem>} An array of schedule items.
 */
anychart.scales.Calendar.prototype.getWorkingScheduleInternal = function(start, end, interval, opt_addOnlyWorking) {
  if (isNaN(start) || isNaN(end))
    return [];
  var d = new Date(start);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  var groupStart = current.getTime();
  var result = [];
  while (groupStart < end) {
    current.add(interval);
    var groupEnd = current.getTime();
    var time = this.getWorkingTime(groupStart, groupEnd);
    if (!opt_addOnlyWorking || time.length)
      result.push({
        'start': groupStart,
        'end': groupEnd,
        'workingTime': time
      });
    groupStart = groupEnd;
  }
  return result;
};


/**
 * Returns the starting timestamp of the next working unit (that has at least
 * one working minute in it) starting at startDate.
 * @param {number} startDate
 * @param {goog.date.Interval} interval
 * @return {number}
 */
anychart.scales.Calendar.prototype.getNextWorkingUnitInternal = function(startDate, interval) {
  var d = new Date(startDate);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  if (!this.lastDate_) {
    var lastDate = anychart.scales.Calendar.MINIMUM_DATE.getTime();
    if (this.weekendRange_ && (this.weekendRange_[0] != 0 || this.weekendRange_[1] != 6)) {
      lastDate = anychart.scales.Calendar.MAXIMUM_DATE.getTime();
    } else {
      for (var i = 0; i < this.availabilities_.length; i++) {
        var avail = this.availabilities_[i];
        if (!avail.holidays) {
          lastDate = Math.max(lastDate, avail.ends.getTime());
        }
      }
    }
    this.lastDate_ = lastDate;
  }

  // todo(Anton Saukh): improve this infinite loop avoiding technique.
  var cycles = 5000; // looking at max 5000 intervals forward
  var prev = current.getTime();
  while (prev <= this.lastDate_ && --cycles) {
    current.add(interval);
    var currTime = current.getTime();
    if (this.hasWorkingTime(prev, currTime))
      return prev;
    prev = currTime;
  }
  return (cycles && this.parent_) ?
      this.parent_.getNextWorkingUnitInternal(current.getTime(), interval) :
      NaN;
};


/**
 * Returns the starting timestamp of the next working unit (that has at least
 * one working minute in it) starting at startDate. The interval should be
 * NEGATIVE!
 *
 * @param {number} startDate
 * @param {goog.date.Interval} interval
 * @return {number}
 */
anychart.scales.Calendar.prototype.getPrevWorkingUnitInternal = function(startDate, interval) {
  var d = new Date(startDate);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  if (!this.firstDate_) {
    var lastDate = anychart.scales.Calendar.MAXIMUM_DATE.getTime();
    if (this.weekendRange_ && (this.weekendRange_[0] != 0 || this.weekendRange_[1] != 6)) {
      lastDate = anychart.scales.Calendar.MINIMUM_DATE.getTime();
    } else {
      for (var i = 0; i < this.availabilities_.length; i++) {
        var avail = this.availabilities_[i];
        if (!avail.holidays) {
          lastDate = Math.min(lastDate, avail.starts.getTime());
        }
      }
    }
    this.firstDate_ = lastDate;
  }

  // todo(Anton Saukh): improve this infinite loop avoiding technique.
  var cycles = 5000; // looking at max 5000 intervals forward
  var prev = current.getTime();
  while (prev >= this.firstDate_ && --cycles) {
    current.add(interval);
    var currTime = current.getTime();
    if (this.hasWorkingTime(currTime, prev))
      return currTime;
    prev = currTime;
  }
  return (cycles && this.parent_) ?
      this.parent_.getPrevWorkingUnitInternal(current.getTime(), interval) :
      NaN;
};


/**
 * Returns day schedule.
 * @param {number} date
 * @return {Array} - An array of working intervals in that day.
 */
anychart.scales.Calendar.prototype.getDaySchedule = function(date) {
  var d = new Date(date);
  var obj = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return this.getDaySchedule_(obj);
};


/**
 * Returns day schedule.
 * @param {goog.date.UtcDateTime} date
 * @return {Array} - An array of working intervals in that day.
 * @private
 */
anychart.scales.Calendar.prototype.getDaySchedule_ = function(date) {
  // checking cache
  var cacheKey = goog.date.Date.prototype.toUTCIsoString.call(date);
  var res = this.cache_[cacheKey];
  if (goog.isDef(res))
    return res;

  res = null;
  // checking availability first
  for (var i = 0; i < this.availabilities_.length; i++) {
    res = this.availabilities_[i].applyToSchedule(res, date);
  }
  // checking weekend range, if it is set
  if (!res && this.weekendRange_) {
    res = [];
    // weekendRange zero is Monday, getUTCDay zero is Sunday - converting
    var day = (date.getUTCDay() + 6) % 7;
    if (day < this.weekendRange_[0] || day > this.weekendRange_[1]) {
      res.push([date.getTime(), date.getTime() + anychart.scales.Calendar.MS_IN_DAY_ - anychart.scales.Calendar.MS_IN_MINUTE_]);
    }
  }
  // checking parent
  if (!res && this.parent_) {
    res = this.parent_.getDaySchedule_(date);
  }
  // if still nothing - it is a resting day
  if (!res)
    res = [];
  // caching
  this.cache_[cacheKey] = res;
  return res;
};


/**
 * Drops schedule caches.
 * @private
 */
anychart.scales.Calendar.prototype.dropCache_ = function() {
  this.cache_ = {};
  this.lastDate_ = null;
  this.firstDate_ = null;
};


/**
 * Transforms raw availabilities to the real availabilities list.
 * @private
 */
anychart.scales.Calendar.prototype.createAvailabilities_ = function() {
  this.availabilities_.length = 0;
  for (var i = 0; i < this.rawAvailabilities_.length; i++) {
    this.availabilities_.push(new anychart.scales.Calendar.AStorage(this.rawAvailabilities_[i]));
  }
};


/**
 * Handles signals from parent calendar.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.scales.Calendar.prototype.handleParentSignals_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION) && !this.weekendRange_)
    this.dropCache_();
};



//endregion
//region --- anychart.scales.Calendar.AStorage
//------------------------------------------------------------------------------
//
//  anychart.scales.Calendar.AStorage
//
//------------------------------------------------------------------------------
/**
 * Stores availability info.
 * @param {anychart.scales.Calendar.Availability} availability
 * @constructor
 */
anychart.scales.Calendar.AStorage = function(availability) {
  var isWorking = availability['isWorking'];
  this.holidays = goog.isDef(isWorking) ? !isWorking : false;

  var period = anychart.enums.normalizeAvailabilityPeriod(availability['each']);
  switch (period) {
    case anychart.enums.AvailabilityPeriod.YEAR:
      this.initYearly_(availability['on'], availability['from'], availability['to']);
      break;
    case anychart.enums.AvailabilityPeriod.WEEK:
      this.initWeekly_(availability['on'], availability['from'], availability['to']);
      break;
    case anychart.enums.AvailabilityPeriod.DAY:
      this.initWeekly_(NaN, availability['from'], availability['to']);
      break;
    default:
      this.initNonPeriodic_(availability['on'], availability['from'], availability['to']);
  }

  if (period == anychart.enums.AvailabilityPeriod.NONE) {
    if (this.on_) {
      this.starts = this.on_.clone();
      this.ends = this.on_.clone();
      this.ends.add(anychart.scales.Calendar.DAY_);
    } else {
      this.starts = this.from_.clone();
      this.ends = this.to_.clone();
    }
  } else {
    var tmp = anychart.format.parseDateTime(availability['starts']);
    this.starts = tmp ?
        new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate()) :
        anychart.scales.Calendar.MINIMUM_DATE;

    tmp = anychart.format.parseDateTime(availability['ends']);
    if (tmp) {
      this.ends = new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate());
      this.ends.add(anychart.scales.Calendar.DAY_);
    } else {
      this.ends = anychart.scales.Calendar.MAXIMUM_DATE;
    }
  }
};


//region --- Properties
//------------------------------------------------------------------------------
//
//  Properties
//
//------------------------------------------------------------------------------
/**
 * If the passed availability is a holiday period.
 * @type {boolean}
 */
anychart.scales.Calendar.AStorage.prototype.holidays;


/**
 * When the availability starts to make effect.
 * @type {?goog.date.UtcDateTime}
 */
anychart.scales.Calendar.AStorage.prototype.starts;


/**
 * When the availability ends to make effect.
 * @type {?goog.date.UtcDateTime}
 */
anychart.scales.Calendar.AStorage.prototype.ends;


/**
 * @type {goog.date.UtcDateTime|null|number}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.on_;


/**
 * @type {Array.<number>|goog.date.UtcDateTime}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.from_;


/**
 * @type {Array.<number>|goog.date.UtcDateTime}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.to_;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 *
 * @param {Array} result
 * @param {goog.date.UtcDateTime} date
 * @return {Array}
 */
anychart.scales.Calendar.AStorage.prototype.applyToSchedule = function(result, date) {
  return this.applies_(date) ? this.merge_(result || [], date) : result;
};


//endregion
//region --- Private methods
//------------------------------------------------------------------------------
//
//  Private methods
//
//------------------------------------------------------------------------------
/**
 * Initializes this instance as a yearly-periodic availability.
 * @param {*} on
 * @param {*} from
 * @param {*} to
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.initYearly_ = function(on, from, to) {
  this.applies_ = this.appliesByDay_;
  on = anychart.format.parseDateTime(on, anychart.scales.Calendar.DATE_FORMAT_, anychart.scales.Calendar.BASE_DATE_);
  if (on) {
    this.merge_ = this.mergeTime_;
    this.on_ = new goog.date.UtcDateTime(2000, on.getUTCMonth(), on.getUTCDate());
    var timeRange = this.parseTime_(from, to);
    this.from_ = timeRange[0];
    this.to_ = timeRange[1];
  } else {
    this.merge_ = this.replaceDay_;
    this.on_ = null;
    var tmp = anychart.format.parseDateTime(from, anychart.scales.Calendar.DATE_FORMAT_, anychart.scales.Calendar.BASE_DATE_);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.scales.Calendar.MINIMUM_DATE;
    this.from_ = new goog.date.UtcDateTime(2000, tmp.getUTCMonth(), tmp.getUTCDate());
    tmp = anychart.format.parseDateTime(to, anychart.scales.Calendar.DATE_FORMAT_, anychart.scales.Calendar.BASE_DATE_);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.scales.Calendar.MAXIMUM_DATE;
    this.to_ = new goog.date.UtcDateTime(2000, tmp.getUTCMonth(), tmp.getUTCDate());
    this.to_.add(anychart.scales.Calendar.DAY_);
  }
};


/**
 * Initializes this instance as a weekly-periodic availability.
 * @param {*} on
 * @param {*} from
 * @param {*} to
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.initWeekly_ = function(on, from, to) {
  this.applies_ = this.appliesByWeekDay_;
  this.merge_ = this.mergeTime_;
  on = this.toElement_(on, 6, NaN);
  this.on_ = isNaN(on) ? null : on;
  var timeRange = this.parseTime_(from, to);
  this.from_ = timeRange[0];
  this.to_ = timeRange[1];
};


/**
 * Initializes this instance as a Nonperiodic-periodic availability.
 * @param {*} on
 * @param {*} from
 * @param {*} to
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.initNonPeriodic_ = function(on, from, to) {
  this.applies_ = this.withinRange_;
  on = anychart.format.parseDateTime(on);
  if (on) {
    this.merge_ = this.mergeTime_;
    this.on_ = new goog.date.UtcDateTime(on.getUTCFullYear(), on.getUTCMonth(), on.getUTCDate());
    var timeRange = this.parseTime_(from, to);
    this.from_ = timeRange[0];
    this.to_ = timeRange[1];
  } else {
    this.merge_ = this.replaceDay_;
    this.on_ = null;
    var tmp = anychart.format.parseDateTime(from);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.scales.Calendar.MINIMUM_DATE;
    this.from_ = new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate());
    tmp = anychart.format.parseDateTime(to);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.scales.Calendar.MAXIMUM_DATE;
    this.to_ = new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate());
    this.to_.add(anychart.scales.Calendar.DAY_);
  }
};


/**
 * Returns if the date is within the starts-ends range.
 * @param {goog.date.UtcDateTime} date
 * @return {boolean}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.withinRange_ = function(date) {
  return (date.getTime() >= this.starts.getTime() && date.getTime() <= this.ends.getTime());
};


/**
 * Checks applicability with on_ being a null or ISO weekday number (0-Monday).
 * @param {goog.date.UtcDateTime} date
 * @return {boolean}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.appliesByWeekDay_ = function(date) {
  return this.withinRange_(date) && (goog.isNull(this.on_) || ((date.getUTCDay() + 6) % 7) == this.on_);
};


/**
 * Checks applicability with on_ being a null or ISO weekday number (0-Monday).
 * @param {goog.date.UtcDateTime} date
 * @return {boolean}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.appliesByDay_ = function(date) {
  if (!this.withinRange_(date)) return false;
  if (this.on_) {
    return (date.getUTCMonth() == this.on_.getUTCMonth() &&
        date.getUTCDate() == this.on_.getUTCDate());
  } else {
    var year = date.getUTCFullYear();
    var time = date.getTime();
    var from = this.from_.clone();
    from.setUTCFullYear(year);
    var to = this.to_.clone();
    to.setUTCFullYear(year);
    return (time >= from.getTime() && time <= to.getTime());
  }
};


/**
 * Merges time range intervals in assumption that current interval has more priority.
 * @param {Array} prevResult
 * @param {goog.date.UtcDateTime} date
 * @return {Array}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.mergeTime_ = function(prevResult, date) {
  var tmp = /** @type {Array} */(this.from_);
  var from = date.getTime() +
      tmp[0] * anychart.scales.Calendar.MS_IN_HOUR_ +
      tmp[1] * anychart.scales.Calendar.MS_IN_MINUTE_;
  tmp = /** @type {Array} */(this.to_);
  var to = date.getTime() +
      tmp[0] * anychart.scales.Calendar.MS_IN_HOUR_ +
      tmp[1] * anychart.scales.Calendar.MS_IN_MINUTE_;
  var result = [];
  var i = 0;
  // skipping all ranges that are to the left of the current range
  while ((tmp = prevResult[i]) && tmp[1] < from) {
    result.push(tmp);
    i++;
  }
  if (i < prevResult.length) { // i-th prev range ends after the from
    // prevResult[i] is in tmp now
    if (tmp[0] > to) { // no overlap
      // if current range is a holiday - nothing changes
      // otherwise we just add it as is - it overlaps nothing
      if (!this.holidays) {
        result.push([from, to]);
      }
    } else { // current range overlaps at least one range of prevResult
      if (this.holidays) { // we should reduce that range
        if (tmp[0] < from) { // there is a segment in front
          result.push([tmp[0], from]);
        }
        from = to; // the next range would start at least at the end of the current range
      } else { // we should concat the ranges
        from = Math.min(from, tmp[0]);
      }
      // skipping parts that are completely inside the range
      // can be a noop, if i-th part contains the current range completely
      while (tmp && tmp[1] <= to) {
        i++;
        tmp = prevResult[i];
      }
      // if there is a part that overlaps the right end of the current range
      if (i < prevResult.length && tmp[0] <= to) {
        result.push([from, tmp[1]]);
        i++;
      }
    }
    // adding ranges that are completely to the right of the current range
    for (; i < prevResult.length; i++) {
      result.push(prevResult[i]);
    }
  } else if (!this.holidays) {
    result.push([from, to]);
  }
  return result;
};


/**
 * Merges result for situations when there is a full day set.
 * @param {Array} result
 * @param {goog.date.UtcDateTime} date
 * @return {Array}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.replaceDay_ = function(result, date) {
  result.length = 0;
  if (!this.holidays)
    result.push([date.getTime(), date.getTime() + anychart.scales.Calendar.MS_IN_DAY_ - anychart.scales.Calendar.MS_IN_MINUTE_]);
  return result;
};


/**
 * Parses passed from and to as a time period within a day.
 * @param {*} from
 * @param {*} to
 * @return {Array.<Array.<number>>}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.parseTime_ = function(from, to) {
  var resFrom, resTo, tmp;
  if (goog.isString(from)) {
    tmp = from.split(':', 2);
    resFrom = [
      this.toElement_(tmp[0], 23, 0),
      tmp.length == 2 ? this.toElement_(tmp[1], 59, 0) : 0
    ];
  } else if (goog.isNumber(from)) {
    resFrom = [
      Math.max(0, Math.min(23, Math.floor(from))),
      0
    ];
  } else {
    resFrom = null;
  }
  if (goog.isString(to)) {
    tmp = to.split(':', 2);
    resTo = [
      this.toElement_(tmp[0], 23, 23),
      tmp.length == 2 ? this.toElement_(tmp[1], 59, 0) : 0
    ];
  } else if (goog.isNumber(to) && !isNaN(to)) {
    resTo = [
      Math.max(0, Math.min(23, Math.floor(to))),
      0
    ];
  } else {
    resTo = null;
  }
  return (resFrom && resTo) ? [resFrom, resTo] : [[0, 0], [23, 59]];
};


/**
 * Returns an natural number between 0 and maxVal.
 * @param {*} str
 * @param {number} maxVal
 * @param {number} defVal
 * @return {number}
 * @private
 */
anychart.scales.Calendar.AStorage.prototype.toElement_ = function(str, maxVal, defVal) {
  return Math.min(anychart.utils.normalizeToNaturalNumber(str, defVal, true), maxVal);
};


//endregion
//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.Calendar.prototype.serialize = function() {
  var json = anychart.scales.Calendar.base(this, 'serialize');
  if (!this.weekendRangeIsDefault_)
    json['weekendRange'] = this.weekendRange_ ?
        [this.weekendRange_[0], this.weekendRange_[1]] : null;
  json['timezoneOffset'] = this.tzOffset_;
  json['availabilities'] = this.rawAvailabilities_.slice();
  return json;
};


/** @inheritDoc */
anychart.scales.Calendar.prototype.setupByJSON = function(config) {
  anychart.scales.Calendar.base(this, 'setupByJSON', config);
  this.weekendRange(config['weekendRange']);
  this.timezoneOffset(config['timezoneOffset']);
  this.availabilities(config['availabilities']);
};


/** @inheritDoc */
anychart.scales.Calendar.prototype.disposeInternal = function() {
  this.rawAvailabilities_ = null;
  if (this.parent_)
    this.parent_.unlistenSignals(this.handleParentSignals_, this);
  this.parent_ = null;
  anychart.scales.Calendar.base(this, 'disposeInternal');
};


//endregion


/**
 * Creates new calendar.
 * @param {anychart.scales.Calendar=} opt_parentCalendar
 * @return {!anychart.scales.Calendar}
 */
anychart.scales.calendar = function(opt_parentCalendar) {
  return new anychart.scales.Calendar(opt_parentCalendar);
};


//exports
(function() {
  var proto = anychart.scales.Calendar.prototype;
  goog.exportSymbol('anychart.scales.calendar', anychart.scales.calendar);
  proto['weekendRange'] = proto.weekendRange;
  proto['timezoneOffset'] = proto.timezoneOffset;
  proto['availabilities'] = proto.availabilities;
  proto['getWorkingSchedule'] = proto.getWorkingSchedule;
})();
