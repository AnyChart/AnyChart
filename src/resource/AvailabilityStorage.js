goog.provide('anychart.resourceModule.AvailabilityStorage');

goog.require('goog.date.UtcDateTime');



//region -- Constructor.
/**
 * Stores availability info.
 *
 * @param {anychart.resourceModule.Calendar.Availability} availability
 * @constructor
 */
anychart.resourceModule.AvailabilityStorage = function(availability) {
  /**
   * If the passed availability is a working period.
   * @type {boolean}
   * @private
   */
  this.isWorking_ = true;

  /**
   * When the availability starts to make effect.
   * @type {?goog.date.UtcDateTime}
   */
  this.starts = null;

  /**
   * When the availability ends to make effect.
   * @type {?goog.date.UtcDateTime}
   */
  this.ends = null;

  /**
   * @type {goog.date.UtcDateTime|null|number}
   * @private
   */
  this.on_ = null;

  /**
   * @type {Array.<number>|goog.date.UtcDateTime}
   * @private
   */
  this.from_ = null;

  /**
   * @type {Array.<number>|goog.date.UtcDateTime}
   * @private
   */
  this.to_ = null;

  this.processAvailability_(availability);
};


//endregion
//region -- Public methods.
/**
 *
 * @param {Array} result
 * @param {goog.date.UtcDateTime} date
 * @return {Array}
 */
anychart.resourceModule.AvailabilityStorage.prototype.applyToSchedule = function(result, date) {
  return this.applies_(date) ? this.merge_(result || [], date) : result;
};


//endregion
//region --- Private methods.
/**
 * Initial availability processor.
 *
 * @param {anychart.resourceModule.Calendar.Availability} availability - .
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.processAvailability_ = function(availability) {
  var isWorking = availability['isWorking'];
  this.isWorking_ = goog.isDef(isWorking) ? isWorking : true;

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
      this.ends.add(anychart.resourceModule.Calendar.DAY);
    } else {
      this.starts = this.from_.clone();
      this.ends = this.to_.clone();
    }
  } else {
    var tmp = anychart.format.parseDateTime(availability['starts']);
    this.starts = tmp ?
        new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate()) :
        anychart.resourceModule.Calendar.MINIMUM_DATE;

    tmp = anychart.format.parseDateTime(availability['ends']);
    if (tmp) {
      this.ends = new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate());
      this.ends.add(anychart.resourceModule.Calendar.DAY);
    } else {
      this.ends = anychart.resourceModule.Calendar.MAXIMUM_DATE;
    }
  }
};


/**
 * Initializes this instance as a yearly-periodic availability.
 * @param {*} on
 * @param {*} from
 * @param {*} to
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.initYearly_ = function(on, from, to) {
  this.applies_ = this.appliesByDay_;
  on = anychart.format.parseDateTime(on, anychart.resourceModule.Calendar.DATE_FORMAT, anychart.resourceModule.Calendar.BASE_DATE);
  if (on) {
    this.merge_ = this.mergeTime_;
    this.on_ = new goog.date.UtcDateTime(2000, on.getUTCMonth(), on.getUTCDate());
    var timeRange = this.parseTime_(from, to);
    this.from_ = timeRange[0];
    this.to_ = timeRange[1];
  } else {
    this.merge_ = this.replaceDay_;
    this.on_ = null;
    var tmp = anychart.format.parseDateTime(from, anychart.resourceModule.Calendar.DATE_FORMAT, anychart.resourceModule.Calendar.BASE_DATE);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.resourceModule.Calendar.MINIMUM_DATE;
    this.from_ = new goog.date.UtcDateTime(2000, tmp.getUTCMonth(), tmp.getUTCDate());
    tmp = anychart.format.parseDateTime(to, anychart.resourceModule.Calendar.DATE_FORMAT, anychart.resourceModule.Calendar.BASE_DATE);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.resourceModule.Calendar.MAXIMUM_DATE;
    this.to_ = new goog.date.UtcDateTime(2000, tmp.getUTCMonth(), tmp.getUTCDate());
    this.to_.add(anychart.resourceModule.Calendar.DAY);
  }
};


/**
 * Initializes this instance as a weekly-periodic availability.
 * @param {*} on
 * @param {*} from
 * @param {*} to
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.initWeekly_ = function(on, from, to) {
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
anychart.resourceModule.AvailabilityStorage.prototype.initNonPeriodic_ = function(on, from, to) {
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
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.resourceModule.Calendar.MINIMUM_DATE;
    this.from_ = new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate());
    tmp = anychart.format.parseDateTime(to);
    tmp = tmp ? new goog.date.UtcDateTime(tmp) : anychart.resourceModule.Calendar.MAXIMUM_DATE;
    this.to_ = new goog.date.UtcDateTime(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate());
    this.to_.add(anychart.resourceModule.Calendar.DAY);
  }
};


/**
 * Returns if the date is within the starts-ends range.
 * @param {goog.date.UtcDateTime} date
 * @return {boolean}
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.withinRange_ = function(date) {
  return (date.getTime() >= this.starts.getTime() && date.getTime() <= this.ends.getTime());
};


/**
 * Checks applicability with on_ being a null or ISO weekday number (0-Monday).
 * @param {goog.date.UtcDateTime} date
 * @return {boolean}
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.appliesByWeekDay_ = function(date) {
  return this.withinRange_(date) && (goog.isNull(this.on_) || ((date.getUTCDay() + 6) % 7) == this.on_);
};


/**
 * Checks applicability with on_ being a null or ISO weekday number (0-Monday).
 * @param {goog.date.UtcDateTime} date
 * @return {boolean}
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.appliesByDay_ = function(date) {
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
anychart.resourceModule.AvailabilityStorage.prototype.mergeTime_ = function(prevResult, date) {
  var tmp = /** @type {Array} */(this.from_);
  var from = date.getTime() +
      tmp[0] * anychart.resourceModule.Calendar.MS_IN_HOUR +
      tmp[1] * anychart.resourceModule.Calendar.MS_IN_MINUTE;
  tmp = /** @type {Array} */(this.to_);
  var to = date.getTime() +
      tmp[0] * anychart.resourceModule.Calendar.MS_IN_HOUR +
      tmp[1] * anychart.resourceModule.Calendar.MS_IN_MINUTE;
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
      if (this.isWorking_) {
        result.push([from, to]);
      }
    } else { // current range overlaps at least one range of prevResult
      if (!this.isWorking_) { // we should reduce that range
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
  } else if (this.isWorking_) {
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
anychart.resourceModule.AvailabilityStorage.prototype.replaceDay_ = function(result, date) {
  result.length = 0;
  if (this.isWorking_)
    result.push([date.getTime(), date.getTime() + anychart.resourceModule.Calendar.MS_IN_DAY - anychart.resourceModule.Calendar.MS_IN_MINUTE]);
  return result;
};


/**
 * Parses passed from and to as a time period within a day.
 * @param {*} from
 * @param {*} to
 * @return {Array.<Array.<number>>}
 * @private
 */
anychart.resourceModule.AvailabilityStorage.prototype.parseTime_ = function(from, to) {
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
anychart.resourceModule.AvailabilityStorage.prototype.toElement_ = function(str, maxVal, defVal) {
  return Math.min(anychart.utils.normalizeToNaturalNumber(str, defVal, true), maxVal);
};


//endregion.




