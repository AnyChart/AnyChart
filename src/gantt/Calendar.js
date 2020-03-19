goog.provide('anychart.ganttModule.Calendar');


//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.format');
goog.require('anychart.utils');

goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');
goog.require('goog.object');



//endregion
//region -- Constructor.
/**
 * Gantt chart specific calendar class.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.Calendar = function() {
  anychart.ganttModule.Calendar.base(this, 'constructor');


  /**
   * Internal normalized representation of working schedule.
   *
   * @type {?Array.<?anychart.ganttModule.Calendar.DailyWorkingSchedule>}
   * @private
   */
  this.schedule_ = null;


  /**
   * Internal normalized representation of holidays.
   *
   * @type {?Array.<anychart.ganttModule.Calendar.Holiday>}
   * @private
   */
  this.holidays_ = null;


  /**
   * Internal processed holidays data.
   * Used for quick calculations of working schedule.
   *
   * @type {anychart.ganttModule.Calendar.HolidaysData}
   * @private
   */
  this.holidaysData_ = {
    yearly: {},
    custom: {}
  };


  var locale = anychart.format.getDateTimeLocale(anychart.format.outputLocale());

  /**
   * Weekend range taken from locale.
   *
   * NOTE: locale weekend range is represented as array of two numbers.
   * First number is weekend start, second one is weekend end.
   * This way presumes that weekend is is exactly the range: weekend can't be
   * monday and friday.
   *
   * Weekend range is organized a little bit another way than UTC week days:
   *  - weekend range zero day is Monday.
   *  - UTC week zero day is Sunday.
   *
   * @type {Array.<number>}
   * @private
   */
  this.localeWeekendRange_ = goog.array.clone(locale['weekendRange']);


  /**
   * Actual weekends. Can be overridden by working schedule.
   *
   * NOTE: this.actualWeekends_ is a map of exact holidays set:
   * { '0': true, '1': true, '3': true, '5': true } means that sunday, monday,
   * wednesday and friday are weekend days.
   *
   * @type {Object.<boolean>}
   * @private
   */
  this.actualWeekends_ = this.turnWeekendRangeToExactDays_(this.localeWeekendRange_);


  /**
   * Daily info cache.
   *
   * @type {Object.<anychart.ganttModule.Calendar.DailyScheduleData>}
   * @private
   */
  this.dailyCache_ = {};
};
goog.inherits(anychart.ganttModule.Calendar, anychart.core.Base);


//endregion
//region -- Supported signals.
/**
 * Supported signals.
 *
 * @type {number}
 */
anychart.ganttModule.Calendar.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


//endregion
//region -- Type definitions.
/**
 * Represents working interval of a single day.
 * from: 10, to: 18 means that working hours are from 10:00 to 18:00.
 *
 * @typedef {{
 *  from: (number|undefined),
 *  to: (number|undefined)
 * }}
 */
anychart.ganttModule.Calendar.DailyWorkingSchedule;


/**
 * Holiday info type definition.
 * day-field is a day of month, month is a number of month in year (0 is January).
 * If year-field is defined, it means exact-date holiday.
 * If year-field is not set, it means yearly holiday.
 * Label is optional and is not used in any visual appearance in current (24 Feb 2020)
 * implementation.
 *
 * @typedef {{
 *  day: number,
 *  month: number,
 *  year: (number|undefined),
 *  label: (string|undefined)
 * }}
 */
anychart.ganttModule.Calendar.Holiday;


/**
 * Holidays data cache calculated for current calendar setup.
 * Contains data about yearly and custom holidays.
 *
 * @typedef {{
 *  yearly: Object,
 *  custom: Object
 * }}
 */
anychart.ganttModule.Calendar.HolidaysData;


/**
 * Full working daily info.
 *
 * @typedef {{
 *  isWeekend: boolean,
 *  isHoliday: boolean,
 *  workingIntervals: Array.<anychart.ganttModule.Calendar.DailyWorkingSchedule>,
 *  notWorkingIntervals: Array.<anychart.ganttModule.Calendar.DailyWorkingSchedule>,
 *  start: number,
 *  end: number
 * }}
 */
anychart.ganttModule.Calendar.DailyScheduleData;


//endregion
//region -- Constants.
/**
 * Single day interval.
 *
 * @const
 * @type {goog.date.Interval}
 */
anychart.ganttModule.Calendar.DAY_INTERVAL = new goog.date.Interval(0, 0, 1);


/**
 * Single hour interval.
 *
 * @const
 * @type {goog.date.Interval}
 */
anychart.ganttModule.Calendar.HOUR_INTERVAL = new goog.date.Interval(0, 0, 0, 1);


//endregion
//region -- Internal and private API.
/**
 * Creates key by date, year and month for caching purposes.
 *
 * @param {number|string} date - Date to be added to resulting hash-key.
 * @param {number|string} month - Month to be added to resulting hash-key.
 * @param {(number|string)=} opt_year - Year to be added to resulting hash-key.
 * @return {string} - Date hash key.
 * @private
 */
anychart.ganttModule.Calendar.prototype.getDateKey_ = function(date, month, opt_year) {
  var year = goog.isDef(opt_year) ? (opt_year + '-') : '';
  return year + month + '-' + date;
};


/**
 * Drops cache on any schedule changes.
 *
 * @private
 */
anychart.ganttModule.Calendar.prototype.dropCache_ = function() {
  this.dailyCache_ = {};
};


/**
 * Drops holidays data on any holidays changes.
 * TODO (A.Kudryavtsev): Yes, it's kind of code duplication (@see constructor), but here I let it be.
 *
 * @private
 */
anychart.ganttModule.Calendar.prototype.dropHolidaysData_ = function() {
  this.holidaysData_ = {
    yearly: {},
    custom: {}
  };
  this.dropCache_();
};


/**
 * Turns weekend range to exact values in some tricky way:
 *  1) weekendRange zero is Monday.
 *  2) UTC zero is Sunday.
 *  3) range where zero is Monday needs to be converted to map where zero is Sunday like
 *      [3, 6] -> to exact weekends like { 3, 4, 5, 6 }.
 *
 *     See table below:
 *
 *      Indexes of weekday | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
 *      -------------------+---+---+---+---+---+---+---|
 *      Weekend Range      | M | T | W | T | F | S | S |
 *      -------------------+---+---+---+---+---+---+---|
 *      UTC days indexes   | S | M | T | W | T | F | S |
 *
 *     It means that 0 needs to be converted to 1
 *                   1 needs to be converted to 2
 *                   ...
 *                   6 needs to be converted to 0
 *
 * @param {Array.<number>} range - Weekend range.
 * @return {Object.<boolean>} - Exact weekends map.
 * @private
 */
anychart.ganttModule.Calendar.prototype.turnWeekendRangeToExactDays_ = function(range) {
  var weekendRangeStart = range[0];
  var weekendRangeEnd = range[1];

  var rv = {};
  for (var i = weekendRangeStart; i <= weekendRangeEnd; i++) {
    var converted = (i + 1) % 7;
    rv[String(converted)] = true;
  }

  return rv;
};


/**
 * Normalizes custom user-input schedule to strict one.
 * Can be normalized to null if everything goes bad.
 *
 * @param {?anychart.ganttModule.Calendar.DailyWorkingSchedule} val - Day to check.
 * @private
 * @return {?anychart.ganttModule.Calendar.DailyWorkingSchedule}
 */
anychart.ganttModule.Calendar.prototype.normalizeValidWorkingDay_ = function(val) {
  if (goog.typeOf(val) === 'object' && ('from' in val) && ('to' in val)) {
    var from = +val['from'];
    var to = +val['to'];

    // This comparison considers NaN values.
    if (from < to && (from >= 0 && from < 24) && (to > 0 && to <= 24)) {
      // TODO (A.Kudryavtsev): Should we round these values?
      return {
        'from': from,
        'to': to
      };
    }
  }
  return null;
};


/**
 *
 * @param {anychart.ganttModule.Calendar.Holiday} holiday - Single holiday config object.
 * @return {?anychart.ganttModule.Calendar.Holiday} - Normalized holiday object.
 *  Returns null if here are some unacceptable values.
 * @private
 */
anychart.ganttModule.Calendar.prototype.normalizeSingleHoliday_ = function(holiday) {
  if (goog.typeOf(holiday) === 'object' && ('day' in holiday) && ('month' in holiday)) {
    var day = +holiday['day'];
    var month = +holiday['month'];

    if (!isNaN(day) && (month >= 0 && month < 12)) { // Month comparison also considers NaNs.
      // TODO (A.Kudryavtsev): Should we round these values?
      var rv = /** @type {anychart.ganttModule.Calendar.Holiday} */ ({
        'day': day,
        'month': month
      });

      if ('year' in holiday) {
        var year = +holiday['year'];
        if (!isNaN(year)) {
          rv['year'] = year;
        }
      }

      if ('label' in holiday) {
        rv['label'] = String(holiday['label']);
      }

      return rv;
    }
  }
  return null;
};


/**
 * Normalizes potentially incorrect user input to valid suitable internal representation
 * of working schedule.
 *
 * @param {Array.<?anychart.ganttModule.Calendar.DailyWorkingSchedule>} schedule - Working
 *  schedule to be normalized.
 * @return {?Array.<?anychart.ganttModule.Calendar.DailyWorkingSchedule>} - Normalized
 *  schedule or null for miss-configuration case.
 * @private
 */
anychart.ganttModule.Calendar.prototype.normalizeWorkingSchedule_ = function(schedule) {
  if (goog.typeOf(schedule) === 'array') {
    var rv = [];
    for (var i = 0; i < 7; i++) { // Iterating 0..6 days of week for utc-day, 0 is Sunday, 6 is Saturday.
      var scheduleDay = schedule[i];
      var day = this.normalizeValidWorkingDay_(scheduleDay);
      rv.push(day); // day can be null.
    }
    return rv.length ? rv : null;
  }
  return null;
};


/**
 * Normalizes holidays values.
 *
 * @param {Array.<anychart.ganttModule.Calendar.Holiday>} holidays - Raw holidays data.
 * @private
 * @return {?Array.<anychart.ganttModule.Calendar.Holiday>} - Normalized holidays.
 */
anychart.ganttModule.Calendar.prototype.normalizeHolidays_ = function(holidays) {
  if (goog.typeOf(holidays) === 'array') {
    var rv = [];
    for (var i = 0; i < holidays.length; i++) {
      var holiday = holidays[i];
      var day = this.normalizeSingleHoliday_(holiday);
      if (day) {
        rv.push(day);
      }
    }
    return rv.length ? rv : null;
  }
  return null;
};


/**
 * Defines actual weekend range.
 * Method must be called after new used schedule is defined.
 *
 * @private
 */
anychart.ganttModule.Calendar.prototype.defineWeekendRange_ = function() {
  this.actualWeekends_ = {};
  if (this.schedule_) {
    for (var i = 0; i < this.schedule_.length; i++) {
      var day = this.schedule_[i];
      if (!day) { // null in normalized this.schedule_ is a weekend.
        this.actualWeekends_[String(i)] = true;
      }
    }
  } else {
    this.actualWeekends_ = this.turnWeekendRangeToExactDays_(this.localeWeekendRange_);
  }
};


/**
 * Collects and builds structure of this.holidaysData_.
 * Will contain records like
 *  {code}
 *    this.holidaysData_ = {
 *      yearly: {
 *        '2-15': true, // Each year 15 Mar is holiday.
 *        '10-2': true  // Each year 02 Nov is holiday.
 *      },
 *      custom: {
 *        '2020-4-9': true,  // 09 May 2020 is holiday.
 *        '2020-11-15': true // 15 Dec 2020 is holiday.
 *      }
 *    };
 *  {code}
 *
 * @private
 */
anychart.ganttModule.Calendar.prototype.buildHolidaysData_ = function() {
  if (this.holidays_) {
    for (var i = 0; i < this.holidays_.length; i++) {
      var holiday = this.holidays_[i];
      var year = holiday['year'];

      // These values must be defined because this.holidays_ must be normalized.
      var month = String(holiday['month']);
      var day = String(holiday['day']);

      var holidayKey = this.getDateKey_(day, month, year);
      if (goog.isDef(year)) {
        this.holidaysData_.custom[holidayKey] = true;
      } else {
        this.holidaysData_.yearly[holidayKey] = true;
      }
    }
  }
};


//endregion
//region -- Public API.
/**
 * Getter/setter for user defined daily working schedule. This method sets weekly working days, weekends and working time.
 * See API for more explanation.
 *
 * @param {Array.<?anychart.ganttModule.Calendar.DailyWorkingSchedule>=} opt_value - User defined working schedule.
 * @return {?Array.<?anychart.ganttModule.Calendar.DailyWorkingSchedule>|anychart.ganttModule.Calendar}
 */
anychart.ganttModule.Calendar.prototype.schedule = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.schedule_ = this.normalizeWorkingSchedule_(opt_value);
    this.dropCache_();
    this.defineWeekendRange_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.schedule_;
};


/**
 * Setter for user defined holidays. This method sets exact-date or yearly holidays.
 * See API for more explanation.
 *
 * @param {Array.<anychart.ganttModule.Calendar.Holiday>=} opt_value - User defined holidays.
 * @return {(?Array.<anychart.ganttModule.Calendar.Holiday>)|anychart.ganttModule.Calendar}
 */
anychart.ganttModule.Calendar.prototype.holidays = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.holidays_ = this.normalizeHolidays_(opt_value);
    this.dropHolidaysData_();
    this.buildHolidaysData_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.holidays_;
};

/**
 * Fills data-object with working/not working intervals.
 *
 * @param {number} start - Interval start timestamp.
 * @param {goog.date.UtcDateTime} dateUTC - UtcDateTime object that we deal with.
 *  This object is modified during this function execution.
 * @param {number} duration - In current implementation must be an integer representation a number of hours in interval.
 * @param {Array.<anychart.ganttModule.Calendar.DailyWorkingSchedule>} fillingIntervals - Array in daily working schedule to be filled
 *  with calculated values.
 * @return {number} - End date of current iteratin for dates chaining.
 * @private
 */
anychart.ganttModule.Calendar.prototype.fillInterval_ = function(start, dateUTC, duration, fillingIntervals) {
  var interval = anychart.ganttModule.Calendar.HOUR_INTERVAL.times(duration);
  dateUTC.add(interval);
  var end = dateUTC.getTime();

  fillingIntervals.push({
    'from': start,
    'to': end - 1
  });

  return end;
};


/**
 * Fills passed working and not working data arrays with working and not working data.
 * TODO (A.Kudryavtsev): Yes, I know here are too many parameters. But it's already calculated, no need to recalculate it.
 *
 * @param {anychart.ganttModule.Calendar.DailyScheduleData} data - Single schedule data item to fill
 *  workingIntervals and notWorkingIntervals.
 * @param {number} year - Year.
 * @param {number} month - UTC month (0 is Jan, 11 is Dec).
 * @param {number} date - Date.
 * @param {number} dayOfWeek - UTC day of week, 0 is Sunday, 6 is Saturday.
 * @private
 */
anychart.ganttModule.Calendar.prototype.fillWorkingIntervals_ = function(data, year, month, date, dayOfWeek) {
  if (this.schedule_) {
    var dateUTC = new goog.date.UtcDateTime(year, month, date);
    var daySchedule = this.schedule_[dayOfWeek];
    if (daySchedule) { // By idea, if must be always defined, but who knows...
      var fromHour = daySchedule['from'];
      var toHour = daySchedule['to'];
      var start = dateUTC.getTime();

      // creates interval [0..fromHour] hours, length is (fromHour - 0) hours.
      start = this.fillInterval_(start, dateUTC, fromHour, data['notWorkingIntervals']);

      // creates interval [fromHour..toHour] hours, length is (toHour - fromHour) hours.
      start = this.fillInterval_(start, dateUTC, toHour - fromHour, data['workingIntervals']);

      // creates interval [toHour..24] hours, length is (24 - toHour) hours.
      this.fillInterval_(start, dateUTC, 24 - toHour, data['notWorkingIntervals']);
    }
  }
};


/**
 *
 * @param {number} start - Day start UTC-timestamp. Must come here as 00:00 hours.
 * @param {number} end - Day end UTC-timestamp.
 * @return {anychart.ganttModule.Calendar.DailyScheduleData} - Daily full info.
 * @private
 */
anychart.ganttModule.Calendar.prototype.getDailyInfo_ = function(start, end) {
  var d = new Date(start);

  var year = d.getUTCFullYear();
  var month = d.getUTCMonth();
  var date = d.getUTCDate();
  var weekDay = d.getUTCDay();

  var cacheKey = this.getDateKey_(date, month, year);
  var yearlyKey = this.getDateKey_(date, month);
  var res = this.dailyCache_[cacheKey];
  if (goog.isDef(res))
    return res;

  var isHoliday = !!(this.holidaysData_.yearly[yearlyKey] || this.holidaysData_.custom[cacheKey]);
  var isWeekend = !!(this.actualWeekends_[weekDay]);

  res = /** @type {anychart.ganttModule.Calendar.DailyScheduleData} */ ({
    'isHoliday': isHoliday,
    'isWeekend': isWeekend,
    'start': start,
    'end': end,
    'workingIntervals': [],
    'notWorkingIntervals': []
  });

  if (isWeekend) {
    res['notWorkingIntervals'].push({
      'from': start,
      'to': end
    });
  } else {
    this.fillWorkingIntervals_(res, year, month, date, weekDay);
  }

  this.dailyCache_[cacheKey] = res;
  return res;
};


/**
 * Returns intervals of working days between two passed dates.
 *
 * @param {number|Date} startDate - Start date for getting schedule info.
 *  UTC-timestamp is preferred to avoid timezone shift.
 * @param {number|Date} endDate - End date for getting schedule info.
 *  UTC-timestamp is preferred to avoid timezone shift as well.
 * @return {Array.<anychart.ganttModule.Calendar.DailyScheduleData>}
 *
 */
anychart.ganttModule.Calendar.prototype.getWorkingSchedule = function(startDate, endDate) {
  var start = anychart.utils.normalizeTimestamp(startDate);
  var end = anychart.utils.normalizeTimestamp(endDate);
  var rv = [];

  if (isNaN(start) || isNaN(end))
    return rv;

  start = anychart.utils.alignDateLeftByUnit(start, anychart.enums.Interval.DAY, 1, start);
  var date = new Date(start);
  var current = new goog.date.UtcDateTime(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  var dayStartTimestamp = current.getTime();

  while (dayStartTimestamp < end) {
    current.add(anychart.ganttModule.Calendar.DAY_INTERVAL);
    var dayEndTimestamp = current.getTime();
    var dailyInfo = this.getDailyInfo_(dayStartTimestamp, dayEndTimestamp - 1000); // Minus one second.
    rv.push(dailyInfo);
    dayStartTimestamp = dayEndTimestamp;
  }

  return rv;
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.Calendar.prototype.serialize = function() {
  var json = anychart.ganttModule.Calendar.base(this, 'serialize');

  /*
    NOTE:
    JSON-operations is the easiest way to process 'null'-values to be suitable for chart.toXml() conversion.
   */
  if (this.schedule_ && !goog.object.isEmpty(this.schedule_)) {
    json['schedule'] = JSON.parse(JSON.stringify(this.schedule_));
  }

  if (this.holidays_ && !goog.object.isEmpty(this.holidays_)) {
    json['holidays'] = JSON.parse(JSON.stringify(this.holidays_));
  }

  return json;
};


/** @inheritDoc */
anychart.ganttModule.Calendar.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.Calendar.base(this, 'setupByJSON', config, opt_default);

  if ('schedule' in config) {
    this.schedule(config['schedule']);
  }

  if ('holidays' in config) {
    this.holidays(config['holidays']);
  }
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.Calendar.prototype;
  proto['schedule'] = proto.schedule;
  proto['holidays'] = proto.holidays;
  proto['getWorkingSchedule'] = proto.getWorkingSchedule;
})();

//endregion
