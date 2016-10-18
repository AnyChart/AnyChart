goog.provide('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.core.utils.IIntervalGenerator');
goog.require('anychart.utils');



/**
 * Class representing a date/time interval. Used for date calculations.
 * This class is a combination of goog.date.Interval and goog.date.UtcDateTime with some performance improvements in
 * iteration by the interval - no new Date objects are created while adding - all manipulations are made in one Date
 * object and the result of iteration is a number timestamp.
 *
 * @param {string} unit Years or string representing date part.
 * @param {number} count Months or number of whatever date part specified
 *     by first parameter.
 * @constructor
 * @implements {anychart.core.utils.IIntervalGenerator}
 */
anychart.core.utils.DateTimeIntervalGenerator = function(unit, count) {
  /**
   * Interval unit.
   * @type {anychart.enums.Interval}
   * @private
   */
  this.unit_ = /** @type {anychart.enums.Interval} */(anychart.enums.normalizeInterval(unit));

  /**
   * Interval unit count.
   * @type {number}
   * @private
   */
  this.count_ = count || 1;

  /**
   * Internal date container.
   * @type {Date}
   * @private
   */
  this.date_ = new Date(0);

  switch (this.unit_) {
    case anychart.enums.Interval.YEAR:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25;
      this.align_ = this.alignYears_;
      this.next = this.nextYear_;
      return this;
    case anychart.enums.Interval.SEMESTER:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 2;
      this.align_ = this.alignSemesters_;
      this.next = this.nextSemester_;
      return this;
    case anychart.enums.Interval.QUARTER:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 4;
      this.align_ = this.alignQuarters_;
      this.next = this.nextQuarter_;
      return this;
    case anychart.enums.Interval.MONTH:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 12;
      this.align_ = this.alignMonths_;
      this.next = this.nextMonth_;
      return this;
    case anychart.enums.Interval.THIRD_OF_MONTH:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 36;
      this.align_ = this.alignThirdOfMonths_;
      this.next = this.nextThirdOfMonth_;
      return this;
    case anychart.enums.Interval.WEEK:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 7;
      this.align_ = this.alignWeeks_;
      this.next = this.nextWeek_;
      return this;
    case anychart.enums.Interval.DAY:
    default:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24;
      this.align_ = this.alignDays_;
      this.next = this.nextDay_;
      break;
    case anychart.enums.Interval.HOUR:
      this.range_ = this.count_ * 1000 * 60 * 60;
      this.align_ = this.alignHours_;
      this.next = this.nextHour_;
      break;
    case anychart.enums.Interval.MINUTE:
      this.range_ = this.count_ * 1000 * 60;
      this.align_ = this.alignMinutes_;
      this.next = this.nextMinute_;
      break;
    case anychart.enums.Interval.SECOND:
      this.range_ = this.count_ * 1000;
      this.align_ = this.alignSeconds_;
      this.next = this.nextSecond_;
      break;
    case anychart.enums.Interval.MILLISECOND:
      this.range_ = this.count_;
      this.align_ = this.alignMilliseconds_;
      this.next = this.nextMillisecond_;
      break;
  }
};


/**
 * Aligns current position to the left by current unit and count and shifts left for one interval.
 * @type {function(this:anychart.core.utils.DateTimeIntervalGenerator, Date=)}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.align_;


/**
 * Estimated interval in milliseconds.
 * @type {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.range_;


/**
 * Moves current generator timestamp to the next one and returns it.
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.next;


/**
 * Aligns passed dates to an interval.
 * @param {number} firstDate
 * @param {number} lastDate
 * @return {Array.<number>}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getAlignedBoundaries = function(firstDate, lastDate) {
  var res = [];
  this.setStart(firstDate);
  // the first version produces non expanded boundaries,
  // while the second one produces boundaries expanded by a half of the interval
  // do not remove commented-out part until the decision is made on how we handle
  // range distortions caused by grouping (DVF-
  //*
  res.push(this.next());
  var tmp = new Date(this.date_.getTime());
  this.date_.setTime(lastDate);
  this.align_(tmp);
  res.push(this.next());
  /*/
  var current = this.date_.getTime();
  res.push((this.next() + current) / 2);
  var tmp = new Date(this.date_.getTime());
  this.date_.setTime(lastDate);
  this.align_(tmp);
  res.push((this.next() + this.next()) / 2);
  //*/
  return res;
};


/**
 * Sets generator current position to the date previous to aligned passed value.
 * Known issue - for complex intervals like P2Y3D aligning works unstable.
 * @param {number} value Date to start iteration from.
 * @return {anychart.core.utils.DateTimeIntervalGenerator} this for chaining.
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.setStart = function(value) {
  this.date_.setTime(value);
  this.align_();
  return this;
};


/**
 * Aligns by years.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignYears_ = function(opt_baseDate) {
  var baseValue = opt_baseDate ? opt_baseDate.getUTCFullYear() : 2000;
  var year = anychart.utils.alignLeft(this.date_.getUTCFullYear(), this.count_, baseValue) - this.count_;
  this.date_.setTime(Date.UTC(year, 0));
};


/**
 * Aligns by semesters.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignSemesters_ = function(opt_baseDate) {
  var tmp = this.count_;
  this.count_ *= 6;
  this.alignMonths_(opt_baseDate);
  this.count_ = tmp;
};


/**
 * Aligns by quarters.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignQuarters_ = function(opt_baseDate) {
  var tmp = this.count_;
  this.count_ *= 3;
  this.alignMonths_(opt_baseDate);
  this.count_ = tmp;
};


/**
 * Aligns by months.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignMonths_ = function(opt_baseDate) {
  var baseValue = opt_baseDate ? (opt_baseDate.getUTCMonth() + opt_baseDate.getUTCFullYear() * 12) : (2000 * 12);
  var val = anychart.utils.alignLeft(
      this.date_.getUTCMonth() + this.date_.getUTCFullYear() * 12,
      this.count_,
      baseValue) - this.count_;
  var year = Math.floor(val / 12);
  var month = val % 12;
  if (month < 0) month += 12;
  this.date_.setTime(Date.UTC(year, month));
};


/**
 * Aligns by third of months.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignThirdOfMonths_ = function(opt_baseDate) {
  var baseValue = opt_baseDate ? this.getDecadeNumber_(opt_baseDate) : (2000 * 12 * 3);
  var decade = anychart.utils.alignLeft(
      this.getDecadeNumber_(this.date_),
      this.count_,
      baseValue) - this.count_;
  var year = Math.floor(decade / 36);
  decade %= 36;
  var month = Math.floor(decade / 3);
  if (month < 0) month += 12;
  decade = decade % 3;
  if (decade < 0) decade += 3;
  this.date_.setTime(Date.UTC(year, month, 1 + decade * 10));
};


/**
 * Aligns by weeks.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignWeeks_ = function(opt_baseDate) {
  // we align relative to the 2nd of Jan, 2000 because it's Sunday
  this.alignTime_(this.count_ * 1000 * 60 * 60 * 24 * 7, opt_baseDate || new Date(Date.UTC(2000, 0, 2)));
};


/**
 * Aligns by days.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignDays_ = function(opt_baseDate) {
  this.alignTime_(this.count_ * 1000 * 60 * 60 * 24, opt_baseDate);
};


/**
 * Aligns by hours.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignHours_ = function(opt_baseDate) {
  this.alignTime_(this.count_ * 1000 * 60 * 60, opt_baseDate);
};


/**
 * Aligns by minutes.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignMinutes_ = function(opt_baseDate) {
  this.alignTime_(this.count_ * 1000 * 60, opt_baseDate);
};


/**
 * Aligns by seconds.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignSeconds_ = function(opt_baseDate) {
  this.alignTime_(this.count_ * 1000, opt_baseDate);
};


/**
 * Aligns by milliseconds.
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignMilliseconds_ = function(opt_baseDate) {
  this.alignTime_(this.count_, opt_baseDate);
};


/**
 * This is an internal method that is used by other alignments.
 * @param {number} interval
 * @param {Date=} opt_baseDate
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignTime_ = function(interval, opt_baseDate) {
  var baseDate = opt_baseDate ? opt_baseDate.getTime() : Date.UTC(2000, 0);
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), interval, baseDate) - interval);
};


/**
 * Returns "absolute" decade number.
 * @param {Date} date
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getDecadeNumber_ = function(date) {
  var decade;
  var dayNumber = date.getUTCDate();
  if (dayNumber <= 10)
    decade = 0;
  else if (dayNumber <= 20)
    decade = 1;
  else
    decade = 2;
  return (date.getUTCFullYear() * 12 + date.getUTCMonth()) * 3 + decade;
};


/**
 * Returns next year from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextYear_ = function() {
  // we use this simple way because we assume that this.date_ is aligned by year.
  this.date_.setUTCFullYear(this.date_.getUTCFullYear() + this.count_);
  return this.date_.getTime();
};


/**
 * Returns next semester from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextSemester_ = function() {
  var month = this.date_.getUTCMonth() + this.count_ * 6;
  var year = this.date_.getUTCFullYear() + Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  this.date_.setUTCFullYear(year);
  this.date_.setUTCMonth(month);
  return this.date_.getTime();
};


/**
 * Returns next quarter from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextQuarter_ = function() {
  var month = this.date_.getUTCMonth() + this.count_ * 3;
  var year = this.date_.getUTCFullYear() + Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  this.date_.setUTCFullYear(year);
  this.date_.setUTCMonth(month);
  return this.date_.getTime();
};


/**
 * Returns next month from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextMonth_ = function() {
  var month = this.date_.getUTCMonth() + this.count_;
  var year = this.date_.getUTCFullYear() + Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  this.date_.setUTCFullYear(year);
  this.date_.setUTCMonth(month);
  return this.date_.getTime();
};


/**
 * Returns next third of month from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextThirdOfMonth_ = function() {
  var decade;
  var date = this.date_.getUTCDate();
  if (date <= 10)
    decade = 0;
  else if (date <= 20)
    decade = 1;
  else
    decade = 2;
  var val = (this.date_.getUTCFullYear() * 12 + this.date_.getUTCMonth()) * 3 + decade + this.count_;
  var year = Math.floor(val / 36);
  val %= 36;
  var month = Math.floor(val / 3);
  if (month < 0) month += 12;
  decade = val % 3;
  if (decade < 0) decade += 3;
  this.date_.setTime(Date.UTC(year, month, 1 + decade * 10));
  return this.date_.getTime();
};


/**
 * Returns next week from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextWeek_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60 * 60 * 24 * 7;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next day from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextDay_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60 * 60 * 24;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next hour from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextHour_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60 * 60;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next minute from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextMinute_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next second from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextSecond_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next millisecond from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextMillisecond_ = function() {
  var res = this.date_.getTime() + this.count_;
  this.date_.setTime(res);
  return res;
};


/**
 * Serializes anychart.core.utils.DateTimeIntervalGenerator.
 * @return {string}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getHash = function() {
  return this.unit_ + this.count_.toFixed(0);
};


/**
 * Returns interval unit.
 * @return {anychart.enums.Interval}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getUnit = function() {
  return this.unit_;
};


/**
 * Returns interval units count.
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns estimated interval of the generator in milliseconds.
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getRange = function() {
  return this.range_;
};


/**
 * Compares two generators.
 * @param {anychart.core.utils.DateTimeIntervalGenerator} a
 * @param {anychart.core.utils.DateTimeIntervalGenerator} b
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.comparator = function(a, b) {
  var res = a.getRange() - b.getRange();
  // if ranges are equal we consider the generator with greater unit (e.g. less units count) bigger
  return res ? res : b.count_ - a.count_;
};
