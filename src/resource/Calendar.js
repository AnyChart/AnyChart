goog.provide('anychart.resourceModule.Calendar');

goog.require('anychart.core.Base');
goog.require('anychart.format');
goog.require('anychart.resourceModule.AvailabilityStorage');
goog.require('anychart.utils');

goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');



/**
 * Calendar representation class.
 * @param {anychart.resourceModule.Calendar=} opt_parentCalendar
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.resourceModule.Calendar = function(opt_parentCalendar) {
  anychart.resourceModule.Calendar.base(this, 'constructor');

  /**
   * Availabilities.
   * @type {Array.<anychart.resourceModule.AvailabilityStorage>}
   * @private
   */
  this.availabilities_ = [];

  /**
   * Raw array of availabilities.
   * @type {Array.<anychart.resourceModule.Calendar.Availability>}
   * @private
   */
  this.rawAvailabilities_ = [];

  /**
   * Parent calendar.
   * @type {anychart.resourceModule.Calendar}
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
goog.inherits(anychart.resourceModule.Calendar, anychart.core.Base);


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
anychart.resourceModule.Calendar.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.Calendar.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * @typedef {{
 *    each: (anychart.enums.AvailabilityPeriod|undefined),
 *    on: (Date|number|string|undefined),
 *    from: (Date|number|string|undefined),
 *    to: (Date|number|string|undefined),
 *    starts: (Date|number|string|undefined),
 *    ends: (Date|number|string|undefined),
 *    isWorking: (boolean|undefined),
 *    isHoliday: (boolean|undefined)
 * }}
 */
anychart.resourceModule.Calendar.Availability;


/**
 * Represents one schedule item.
 * @typedef {{
 *   start: number,
 *   end: number,
 *   workingTime: Array.<Array.<number>>
 * }}
 */
anychart.resourceModule.Calendar.ScheduleItem;


/**
 * Date format for ON clauses.
 * @type {string}
 */
anychart.resourceModule.Calendar.DATE_FORMAT = 'dd.MM';


/**
 * Base date for dates without year.
 * @type {Date}
 */
anychart.resourceModule.Calendar.BASE_DATE = new Date(Date.UTC(2000, 0));


/**
 * Milliseconds in minute const.
 * @const {number}
 */
anychart.resourceModule.Calendar.MS_IN_MINUTE = 60 * 1000;


/**
 * Milliseconds in minute const.
 * @const {number}
 */
anychart.resourceModule.Calendar.MS_IN_HOUR = 60 * 60 * 1000;


/**
 * Milliseconds in day const.
 * @const {number}
 */
anychart.resourceModule.Calendar.MS_IN_DAY = 24 * 60 * 60 * 1000;


/**
 * The first possible day, as far as this class is concerned.
 * @type {goog.date.UtcDateTime}
 */
anychart.resourceModule.Calendar.MINIMUM_DATE = new goog.date.UtcDateTime(0, 0, 1);


/**
 * The last possible day, as far as this class is concerned.
 * @type {goog.date.UtcDateTime}
 */
anychart.resourceModule.Calendar.MAXIMUM_DATE = new goog.date.UtcDateTime(9999, 11, 31);


/**
 * A 1-Day interval.
 * @const {goog.date.Interval}
 */
anychart.resourceModule.Calendar.DAY = new goog.date.Interval(0, 0, 1);


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
 * @return {anychart.resourceModule.Calendar|Array.<number>|null}
 */
anychart.resourceModule.Calendar.prototype.weekendRange = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var start, end, val;
    if (goog.isArray(opt_value)) {
      start = anychart.utils.normalizeToNaturalNumber(opt_value[0], NaN, true);
      start = goog.math.clamp(start, 0, 6);
      end = anychart.utils.normalizeToNaturalNumber(opt_value[1], NaN, true);
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
 * @return {anychart.resourceModule.Calendar|number}
 */
anychart.resourceModule.Calendar.prototype.timezoneOffset = function(opt_value) {
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
 * @param {?Array.<anychart.resourceModule.Calendar.Availability>=} opt_value
 * @return {?Array.<anychart.resourceModule.Calendar.Availability>|anychart.resourceModule.Calendar}
 */
anychart.resourceModule.Calendar.prototype.availabilities = function(opt_value) {
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
 * @return {Array.<anychart.resourceModule.Calendar.ScheduleItem>} An array of schedule items.
 */
anychart.resourceModule.Calendar.prototype.getWorkingSchedule = function(startDate, endDate, opt_unit, opt_count) {
  var start = anychart.utils.normalizeTimestamp(startDate);
  var end = anychart.utils.normalizeTimestamp(endDate);
  var unit = /** @type {anychart.enums.Interval} */(anychart.enums.normalizeInterval(opt_unit, anychart.enums.Interval.DAY, true));
  var count = anychart.utils.normalizeToNaturalNumber(opt_count);
  var interval = anychart.utils.getIntervalFromInfo(unit, count);
  return this.getWorkingScheduleInternal(start, end, interval);
};


/**
 * Returns working time between two dates (must be with clear time).
 * @param {number} start
 * @param {number} end
 * @return {Array.<Array.<number>>} An array of schedule items.
 */
anychart.resourceModule.Calendar.prototype.getWorkingTime = function(start, end) {
  var d = new Date(start);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  var result = [];
  while (current.getTime() < end) {
    var daySchedule = this.getDaySchedule_(current);
    for (var i = 0; i < daySchedule.length; i++) {
      var time = daySchedule[i];
      result.push([
        time[0] - this.tzOffset_ * anychart.resourceModule.Calendar.MS_IN_MINUTE,
        time[1] - this.tzOffset_ * anychart.resourceModule.Calendar.MS_IN_MINUTE
      ]);
    }
    current.add(anychart.resourceModule.Calendar.DAY);
  }
  return result;
};


/**
 * Checks whether there is any working time between two dates in the calendar.
 * @param {number} start
 * @param {number} end
 * @return {boolean}
 */
anychart.resourceModule.Calendar.prototype.hasWorkingTime = function(start, end) {
  var d = new Date(start);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  while (current.getTime() < end) {
    var daySchedule = this.getDaySchedule_(current);
    if (daySchedule.length)
      return true;
    current.add(anychart.resourceModule.Calendar.DAY);
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
 * @return {Array.<anychart.resourceModule.Calendar.ScheduleItem>} An array of schedule items.
 */
anychart.resourceModule.Calendar.prototype.getWorkingScheduleInternal = function(start, end, interval, opt_addOnlyWorking) {
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
anychart.resourceModule.Calendar.prototype.getNextWorkingUnitInternal = function(startDate, interval) {
  var d = new Date(startDate);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  if (!this.lastDate_) {
    var lastDate = anychart.resourceModule.Calendar.MINIMUM_DATE.getTime();
    if (this.weekendRange_ && (this.weekendRange_[0] != 0 || this.weekendRange_[1] != 6)) {
      lastDate = anychart.resourceModule.Calendar.MAXIMUM_DATE.getTime();
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
anychart.resourceModule.Calendar.prototype.getPrevWorkingUnitInternal = function(startDate, interval) {
  var d = new Date(startDate);
  var current = new goog.date.UtcDateTime(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  if (!this.firstDate_) {
    var lastDate = anychart.resourceModule.Calendar.MAXIMUM_DATE.getTime();
    if (this.weekendRange_ && (this.weekendRange_[0] != 0 || this.weekendRange_[1] != 6)) {
      lastDate = anychart.resourceModule.Calendar.MINIMUM_DATE.getTime();
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
anychart.resourceModule.Calendar.prototype.getDaySchedule = function(date) {
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
anychart.resourceModule.Calendar.prototype.getDaySchedule_ = function(date) {
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
      res.push([date.getTime(), date.getTime() + anychart.resourceModule.Calendar.MS_IN_DAY - anychart.resourceModule.Calendar.MS_IN_MINUTE]);
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
anychart.resourceModule.Calendar.prototype.dropCache_ = function() {
  this.cache_ = {};
  this.lastDate_ = null;
  this.firstDate_ = null;
};


/**
 * Transforms raw availabilities to the real availabilities list.
 * @private
 */
anychart.resourceModule.Calendar.prototype.createAvailabilities_ = function() {
  this.availabilities_.length = 0;
  for (var i = 0; i < this.rawAvailabilities_.length; i++) {
    this.availabilities_.push(new anychart.resourceModule.AvailabilityStorage(this.rawAvailabilities_[i]));
  }
};


/**
 * Handles signals from parent calendar.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Calendar.prototype.handleParentSignals_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION) && !this.weekendRange_)
    this.dropCache_();
};



//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.resourceModule.Calendar.prototype.serialize = function() {
  var json = anychart.resourceModule.Calendar.base(this, 'serialize');
  if (!this.weekendRangeIsDefault_)
    json['weekendRange'] = this.weekendRange_ ?
        [this.weekendRange_[0], this.weekendRange_[1]] : null;
  json['timezoneOffset'] = this.tzOffset_;
  json['availabilities'] = this.rawAvailabilities_.slice();
  return json;
};


/** @inheritDoc */
anychart.resourceModule.Calendar.prototype.setupByJSON = function(config) {
  anychart.resourceModule.Calendar.base(this, 'setupByJSON', config);
  this.weekendRange(config['weekendRange']);
  this.timezoneOffset(config['timezoneOffset']);
  this.availabilities(config['availabilities']);
};


/** @inheritDoc */
anychart.resourceModule.Calendar.prototype.disposeInternal = function() {
  this.rawAvailabilities_ = null;
  if (this.parent_)
    this.parent_.unlistenSignals(this.handleParentSignals_, this);
  this.parent_ = null;
  anychart.resourceModule.Calendar.base(this, 'disposeInternal');
};


//endregion
/**
 * Creates new calendar.
 * @param {anychart.resourceModule.Calendar=} opt_parentCalendar
 * @return {!anychart.resourceModule.Calendar}
 */
anychart.scales.calendar = function(opt_parentCalendar) {
  return new anychart.resourceModule.Calendar(opt_parentCalendar);
};


//exports
(function() {
  var proto = anychart.resourceModule.Calendar.prototype;
  goog.exportSymbol('anychart.scales.calendar', anychart.scales.calendar);
  proto['weekendRange'] = proto.weekendRange;
  proto['timezoneOffset'] = proto.timezoneOffset;
  proto['availabilities'] = proto.availabilities;
  proto['getWorkingSchedule'] = proto.getWorkingSchedule;
})();
