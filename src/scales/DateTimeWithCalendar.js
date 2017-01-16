goog.provide('anychart.scales.DateTimeWithCalendar');
goog.require('anychart.enums');
goog.require('anychart.scales.Calendar');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.utils');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');



/**
 * Date scale with calendar support.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.DateTimeWithCalendar = function() {
  anychart.scales.DateTimeWithCalendar.base(this, 'constructor');

  /**
   * Calendar.
   * @type {anychart.scales.Calendar}
   * @private
   */
  this.calendar_ = null;

  /**
   * If the holidays should be skipped by the scale.
   * @type {boolean}
   * @private
   */
  this.skipHolidays_ = false;

  /**
   * Scale unit pix size.
   * @type {number|string}
   * @private
   */
  this.unitPixSize_ = 60;

  /**
   * Scale unit.
   * @type {anychart.enums.Interval}
   * @private
   */
  this.unit_ = anychart.enums.Interval.DAY;

  /**
   * Scale unit count.
   * @type {number}
   * @private
   */
  this.count_ = 1;
  //
  // /**
  //  * Scale pix start.
  //  * @type {number}
  //  * @private
  //  */
  // this.pixStart_ = 0;
  //
  // /**
  //  * Scale pix end.
  //  * @type {number}
  //  * @private
  //  */
  // this.pixEnd_ = 1;

  /**
   * The timestamp that corresponds to the pix start position.
   * @type {number}
   * @private
   */
  this.startDate_ = Date.UTC(2000, 0);

  /**
   * Grids storage.
   * @type {Object.<anychart.scales.DateTimeWithCalendar.TSGrid>}
   * @private
   */
  this.tsGrids_ = {};

  /**
   * Current grid.
   * @type {anychart.scales.DateTimeWithCalendar.TSGrid}
   * @private
   */
  this.tsGrid_ = null;

  /**
   * startDate timestamp units position.
   * @type {number}
   * @private
   */
  this.startUnit_ = 0;
};
goog.inherits(anychart.scales.DateTimeWithCalendar, anychart.scales.ScatterBase);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.scales.DateTimeWithCalendar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.DTWC_TS_GRID |
    anychart.ConsistencyState.DTWC_TS_GRID_ZERO;


/**
 * Supported signals.
 * @type {number}
 */
anychart.scales.DateTimeWithCalendar.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.NEEDS_RECALCULATION;


//endregion
//region --- Typedefs
//------------------------------------------------------------------------------
//
//  Typedefs
//
//------------------------------------------------------------------------------
/**
 * @typedef {{
 *   start: number,
 *   end: number,
 *   holiday: boolean
 * }}
 */
anychart.scales.DateTimeWithCalendar.Tick;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for the scale calendar.
 * @param {anychart.scales.Calendar=} opt_value
 * @return {anychart.scales.Calendar|anychart.scales.DateTimeWithCalendar}
 */
anychart.scales.DateTimeWithCalendar.prototype.calendar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.calendar_ != opt_value) {
      if (this.calendar_)
        this.calendar_.unlistenSignals(this.handleCalendarSignal_, this);
      this.calendar_ = opt_value;
      if (this.calendar_)
        this.calendar_.listenSignals(this.handleCalendarSignal_, this);
      this.dropGrids_();
      this.invalidate(
          anychart.ConsistencyState.DTWC_TS_GRID,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  if (!this.calendar_) {
    this.calendar_ = new anychart.scales.Calendar();
    this.calendar_.listenSignals(this.handleCalendarSignal_, this);
  }
  return this.calendar_;
};


/**
 * Getter/setter for skipHolidays.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.scales.DateTimeWithCalendar}
 */
anychart.scales.DateTimeWithCalendar.prototype.skipHolidays = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.skipHolidays_ != opt_value) {
      this.skipHolidays_ = opt_value;
      this.dropGrids_();
      this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.skipHolidays_;
};


/**
 * Getter/setter for unitPixSize.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.scales.DateTimeWithCalendar}
 */
anychart.scales.DateTimeWithCalendar.prototype.unitPixSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumberOrString(opt_value);
    if (this.unitPixSize_ != opt_value) {
      this.unitPixSize_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID_ZERO, anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.unitPixSize_;
};


/**
 * Getter/setter for unit.
 * @param {anychart.enums.Interval=} opt_value
 * @return {anychart.enums.Interval|anychart.scales.DateTimeWithCalendar}
 */
anychart.scales.DateTimeWithCalendar.prototype.unit = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {anychart.enums.Interval} */(anychart.enums.normalizeInterval(opt_value, anychart.enums.Interval.DAY, true));
    if (this.unit_ != opt_value) {
      this.unit_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID, anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.unit_;
};


/**
 * Getter/setter for count.
 * @param {number=} opt_value
 * @return {number|anychart.scales.DateTimeWithCalendar}
 */
anychart.scales.DateTimeWithCalendar.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value);
    if (this.count_ != opt_value) {
      this.count_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID, anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.count_;
};


// /**
//  * Getter/setter for pixStart.
//  * @param {number=} opt_value
//  * @return {number|anychart.scales.DateTimeWithCalendar}
//  */
// anychart.scales.DateTimeWithCalendar.prototype.pixStart = function(opt_value) {
//   if (goog.isDef(opt_value)) {
//     opt_value = anychart.utils.toNumber(opt_value);
//     if (this.pixStart_ != opt_value) {
//       this.pixStart_ = opt_value;
//     }
//     return this;
//   }
//   return this.pixStart_;
// };
//
//
// /**
//  * Getter/setter for pixStart.
//  * @param {number=} opt_value
//  * @return {number|anychart.scales.DateTimeWithCalendar}
//  */
// anychart.scales.DateTimeWithCalendar.prototype.pixEnd = function(opt_value) {
//   if (goog.isDef(opt_value)) {
//     opt_value = anychart.utils.toNumber(opt_value);
//     if (this.pixEnd_ != opt_value) {
//       this.pixEnd_ = opt_value;
//     }
//     return this;
//   }
//   return this.pixEnd_;
// };


/**
 * Getter/setter for startDate.
 * @param {number|Date=} opt_value
 * @return {number|anychart.scales.DateTimeWithCalendar}
 */
anychart.scales.DateTimeWithCalendar.prototype.startDate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeTimestamp(opt_value);
    if (this.startDate_ != opt_value) {
      this.startDate_ = opt_value;
      this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID_ZERO, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.startDate_;
};


/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.getType = function() {
  return anychart.enums.ScaleTypes.DATE_TIME_WITH_CALENDAR;
};


//endregion
//region --- Transformation functions
//------------------------------------------------------------------------------
//
//  Transformation functions
//
//------------------------------------------------------------------------------
/**
 * Transforms date to pixels.
 * @param {number|Date} date
 * @return {number}
 */
anychart.scales.DateTimeWithCalendar.prototype.dateToPix = function(date) {
  this.calculate_();
  var units = this.tsGrid_.dateToUnits(anychart.utils.normalizeTimestamp(date));
  return (units - this.startUnit_) * this.unitPixSize_;
};


/**
 * Transforms pixels to date.
 * @param {number} pix
 * @return {number}
 */
anychart.scales.DateTimeWithCalendar.prototype.pixToDate = function(pix) {
  this.calculate_();
  var units = pix / this.unitPixSize_ + this.startUnit_;
  return this.tsGrid_.unitsToDate(units);
};


/**
 * Returns ticks array (even indexes are left borders, odd indexes are right borders of the tick)
 * with passed interval. Ticks fill space from the fromPix pixel to the toPix pixel (if available).
 * @param {number} fromPix
 * @param {number} toPix
 * @param {anychart.enums.Interval=} opt_unit
 * @param {number=} opt_count
 * @return {Array.<anychart.scales.DateTimeWithCalendar.Tick>}
 */
anychart.scales.DateTimeWithCalendar.prototype.getTicks = function(fromPix, toPix, opt_unit, opt_count) {
  this.calculate_();
  var res = [];
  var start = anychart.utils.alignDateLeftByUnit(this.pixToDate(fromPix), opt_unit || this.unit_, opt_count || this.count_, 2000);
  var end = this.pixToDate(toPix);
  var current = new goog.date.UtcDateTime(new Date(start));
  var interval = anychart.utils.getIntervalFromInfo(opt_unit || this.unit_, opt_count || this.count_);
  var curr = current.getTime();
  while (curr < end) {
    var prev = curr;
    current.add(interval);
    curr = current.getTime();
    var working = this.calendar_.hasWorkingTime(prev, curr);
    if (!this.skipHolidays_ || working)
      res.push({
        'start': prev,
        'end': curr,
        'holiday': !working
      });
  }
  return res;
};


/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.transform = function() {
  return NaN;
};


/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.inverseTransform = function() {
  return NaN;
};


//endregion
//region --- Internal calculations
//------------------------------------------------------------------------------
//
//  Internal calculations
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.calculate = function() {
  if (this.consistent) return;

  anychart.scales.DateTimeWithCalendar.base(this, 'calculate');

  if (this.minimumModeAuto)
    this.min = anychart.utils.alignDateLeftByUnit(this.min, this.unit_, this.count_, 2000);
  if (this.maximumModeAuto) {
    this.max = anychart.utils.alignDateLeftByUnit(this.max, this.unit_, this.count_, 2000);
    // the worst
    var date = new goog.date.UtcDateTime(new Date(this.max));
    date.add(anychart.utils.getIntervalFromInfo(this.unit_, this.count_));
    this.max = date.getTime();
  }
};


/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    anychart.scales.DateTimeWithCalendar.base(this, 'extendDataRange', anychart.format.parseDateTime(arguments[i]));
  }
  return this;
};


/**
 * Calculates timestamp grids for the scale. This is an internal DateTimeWithCalendar
 * calculate_ that is independent of the ScatterBase calculate. These results are needed
 * to actually make transformations and calculate ticks, those results are needed for
 * global minimum and maximum calculations.
 * @private
 */
anychart.scales.DateTimeWithCalendar.prototype.calculate_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.DTWC_TS_GRID)) {
    var hash = this.unit_ + this.count_.toFixed(0);
    this.tsGrid_ = this.tsGrids_[hash];
    if (!this.tsGrid_) {
      this.tsGrids_[hash] = this.tsGrid_ =
          new anychart.scales.DateTimeWithCalendar.TSGrid(this);
    }
    this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID_ZERO);
    this.markConsistent(anychart.ConsistencyState.DTWC_TS_GRID);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.DTWC_TS_GRID_ZERO)) {
    this.startUnit_ = this.tsGrid_.dateToUnits(this.startDate_);
    this.markConsistent(anychart.ConsistencyState.DTWC_TS_GRID_ZERO);
  }
};


/**
 * Drops ts grids cache.
 * @private
 */
anychart.scales.DateTimeWithCalendar.prototype.dropGrids_ = function() {
  this.tsGrids_ = {};
  this.tsGrid_ = null;
};


//endregion
//region --- Signals handling
//------------------------------------------------------------------------------
//
//  Signals handling
//
//------------------------------------------------------------------------------
/**
 * Handles calendar signals.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.scales.DateTimeWithCalendar.prototype.handleCalendarSignal_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dropGrids_();
    this.invalidate(anychart.ConsistencyState.DTWC_TS_GRID, anychart.Signal.NEEDS_REAPPLICATION);
  }
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.serialize = function() {
  var json = anychart.scales.DateTimeWithCalendar.base(this, 'serialize');
  json['skipHolidays'] = this.skipHolidays_;
  return json;
};


/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.setupByJSON = function(config) {
  anychart.scales.DateTimeWithCalendar.base(this, 'setupByJSON', config);
  this.skipHolidays(config['skipHolidays']);
};


/** @inheritDoc */
anychart.scales.DateTimeWithCalendar.prototype.disposeInternal = function() {
  goog.dispose(this.calendar_);
  this.calendar_ = null;
  anychart.scales.DateTimeWithCalendar.base(this, 'disposeInternal');
};



//endregion
//region --- TSGrid
//------------------------------------------------------------------------------
//
//  TSGrid
//
//------------------------------------------------------------------------------
/**
 * Time stamps grid.
 * @param {anychart.scales.DateTimeWithCalendar} scale
 * @constructor
 */
anychart.scales.DateTimeWithCalendar.TSGrid = function(scale) {
  this.calendar_ = /** @type {anychart.scales.Calendar} */(scale.calendar());
  this.skipHolidays_ = /** @type {boolean} */(scale.skipHolidays());
  var unit = /** @type {anychart.enums.Interval} */(scale.unit());
  var count = /** @type {number} */(scale.count());
  var startDate = /** @type {number} */(scale.startDate());

  this.easyMode_ = (anychart.scales.DateTimeWithCalendar.TSGrid.FIXED_TIME_RANGES_[unit] * count) || NaN;

  if (!this.skipHolidays_ && this.easyMode_) { // simple totally linear case
    this.zeroDate_ = anychart.utils.alignDateLeftByUnit(startDate, unit, count, 2000);
  } else {
    this.easyMode_ = NaN;
    this.fwdInterval_ = anychart.utils.getIntervalFromInfo(unit, count);
    this.interval_ = this.fwdInterval_;
    this.bwdInterval_ = this.fwdInterval_.times(-1);
    if (this.skipHolidays_) {
      startDate = anychart.utils.alignDateLeft(startDate, this.fwdInterval_, 2000);
      this.zeroDate_ = this.calendar_.getNextWorkingUnitInternal(startDate, this.fwdInterval_);
      var prevDate;
      if (isNaN(this.zeroDate_)) {
        this.zeroDate_ = this.calendar_.getPrevWorkingUnitInternal(startDate, this.bwdInterval_);
        this.fwdInterval_ = null;
      }
      if (isNaN(this.zeroDate_)) { // collapsed calendar
        this.fwdGrid_ = this.lastFwdDate_ = null;
        prevDate = NaN;
      } else {
        this.lastFwdDate_ = new goog.date.UtcDateTime(new Date(this.zeroDate_));
        this.lastFwdDate_.add(this.interval_);
        this.fwdGrid_ = [this.zeroDate_, this.lastFwdDate_.getTime()];
        prevDate = this.calendar_.getPrevWorkingUnitInternal(this.zeroDate_, this.bwdInterval_);
      }
      if (isNaN(prevDate)) {
        this.bwdInterval_ = this.lastBwdDate_ = this.bwdGrid_ = null;
      } else {
        var tmpDate = new goog.date.UtcDateTime(new Date(prevDate));
        tmpDate.add(this.interval_);
        this.bwdGrid_ = [tmpDate.getTime(), prevDate];
        this.lastBwdDate_ = new goog.date.UtcDateTime(new Date(prevDate));
      }
    } else {
      this.zeroDate_ = anychart.utils.alignDateLeftByUnit(startDate, unit, count, 2000);
      this.lastFwdDate_ = new goog.date.UtcDateTime(new Date(this.zeroDate_));
      this.lastFwdDate_.add(this.fwdInterval_);
      this.fwdGrid_ = [this.zeroDate_, this.lastFwdDate_.getTime()];
      this.lastBwdDate_ = new goog.date.UtcDateTime(new Date(this.zeroDate_));
      this.lastBwdDate_.add(this.bwdInterval_);
      this.bwdGrid_ = [this.zeroDate_, this.lastBwdDate_.getTime()];
    }
  }
};


//region --- Private properties
//------------------------------------------------------------------------------
//
//  Private properties
//
//------------------------------------------------------------------------------
/**
 * Fixed date-time ranges with the corresponding range values.
 * @const {Object<anychart.enums.Interval, number>}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.FIXED_TIME_RANGES_ = (function() {
  var res = {};
  res[anychart.enums.Interval.MILLISECOND] = 1;
  res[anychart.enums.Interval.SECOND] = res[anychart.enums.Interval.MILLISECOND] * 1000;
  res[anychart.enums.Interval.MINUTE] = res[anychart.enums.Interval.SECOND] * 60;
  res[anychart.enums.Interval.HOUR] = res[anychart.enums.Interval.MINUTE] * 60;
  res[anychart.enums.Interval.DAY] = res[anychart.enums.Interval.HOUR] * 24;
  res[anychart.enums.Interval.WEEK] = res[anychart.enums.Interval.DAY] * 7;
  return res;
})();


/**
 * Calendar.
 * @type {anychart.scales.Calendar}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.calendar_ = null;


/**
 * Skip holidays flag.
 * @type {boolean}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.skipHolidays_ = false;


/**
 * Last date used in fwdGrid.
 * @type {goog.date.UtcDateTime}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.lastFwdDate_ = null;


/**
 * Last date used in bwdGrid.
 * @type {goog.date.UtcDateTime}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.lastBwdDate_ = null;


/**
 * If this is not NaN, than the grid is in easy mode - no grid needed at all -
 * just totally linear order over all the date-time plane.
 * @type {number}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.easyMode_ = NaN;


/**
 * Internal scale interval holder.
 * @type {goog.date.Interval}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.fwdInterval_ = null;


/**
 * Reference to a fwdInterval_. Unlike fwdInterval_ itself cannot be nulled, so it
 * can be used for bwd calculations even when the fwd direction collapsed.
 * @type {goog.date.Interval}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.interval_ = null;


/**
 * Internal scale interval holder for backward walking.
 * @type {goog.date.Interval}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.bwdInterval_ = null;


/**
 * Timestamps forward grid.
 * @type {Array.<number>}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.fwdGrid_ = null;


/**
 * Timestamps backward grid.
 * @type {Array.<number>}
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.bwdGrid_ = null;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Transforms date to units.
 * @param {number} date
 * @return {number}
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.dateToUnits = function(date) {
  if (this.easyMode_)
    return (date - this.zeroDate_) / this.easyMode_;

  var index;
  this.ensureDateHandled_(date);
  if (!this.fwdGrid_)
    return NaN; // means the calendar collapsed into a non-working plane
  if (date == this.zeroDate_) {
    return 0;
  } else if (date > this.zeroDate_) { // in fwdGrid
    if (this.lastFwdDate_.getTime() <= date) {
      return this.fwdGrid_.length / 2; // the right edge of the scale in units
    } else {
      index = goog.array.binarySearch(this.fwdGrid_, date);
      if (index >= 0) { // exactly in some edge
        return Math.round(index / 2);
      } else { // between pivots
        index = ~index;
        if (!!(index & 1)) { // between a start and an end
          return (index >> 1) + (date - this.fwdGrid_[index - 1]) / (this.fwdGrid_[index] - this.fwdGrid_[index - 1]);
        } else { // between an end and a start
          return (index >> 1); // equals to Math.floor(index / 2)
        }
      }
    }
  } else { // in bwdGrid
    if (!this.bwdGrid_)
      return 0; // left part collapsed to zero
    if (this.lastBwdDate_.getTime() >= date) {
      return -(this.bwdGrid_.length / 2);
    } else {
      index = goog.array.binarySearch(this.bwdGrid_, date, anychart.utils.compareNumericDesc);
      if (index >= 0) { // exactly in some edge
        return -Math.round(index / 2) || 0;
      } else { // between pivots
        index = ~index;
        if (!!(index & 1)) { // between a start and an end
          return -((index >> 1) + (date - this.bwdGrid_[index - 1]) / (this.bwdGrid_[index] - this.bwdGrid_[index - 1]));
        } else { // between an end and a start
          return -(index >> 1) || 0; // equals to Math.floor(index / 2)
        }
      }
    }
  }
};


/**
 * Transforms units to date.
 * @param {number} units
 * @return {number}
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.unitsToDate = function(units) {
  if (this.easyMode_)
    return Math.floor(units * this.easyMode_ + this.zeroDate_);

  this.ensureUnitHandled_(units);
  var grid;
  if (units < 0) {
    units = -units;
    grid = this.bwdGrid_;
  } else {
    grid = this.fwdGrid_;
  }
  var index = Math.floor(units);
  var ratio = units - index;
  index *= 2;
  if (grid) {
    if (grid.length > index)
      return Math.floor(grid[index] + (ratio && ((grid[index + 1] - grid[index]) * ratio)));
    return grid[grid.length - 1];
  }
  return this.zeroDate_;
};


//endregion
//region --- Internal methods
//------------------------------------------------------------------------------
//
//  Internal methods
//
//------------------------------------------------------------------------------
/**
 * Ensures that passed date is handled by the grid.
 * @param {number} date
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.ensureDateHandled_ = function(date) {
  if (!this.fwdGrid_ || this.easyMode_) // collapsed calendar
    return;
  var sch, prev, curr, i, info;
  if (date >= this.zeroDate_) {
    if (this.fwdInterval_ && this.lastFwdDate_.getTime() < date) {
      if (this.skipHolidays_) {
        sch = this.calendar_.getWorkingScheduleInternal(this.lastFwdDate_.getTime(), date, this.fwdInterval_, true);
        for (i = 0; i < sch.length; i++) {
          info = sch[i];
          this.fwdGrid_.push(info['start'], info['end']);
        }
        if (sch.length)
          this.lastFwdDate_.setTime(sch[sch.length - 1]['end']);
        if (this.lastFwdDate_.getTime() < date) {
          // last working time interval in calendar is to the left of the requested date -
          // marking the fwd direction collapsed to avoid looking there again
          this.fwdInterval_ = null;
        }
      } else {
        curr = this.lastFwdDate_.getTime();
        do {
          prev = curr;
          this.lastFwdDate_.add(this.fwdInterval_);
          curr = this.lastFwdDate_.getTime();
          this.fwdGrid_.push(prev, curr);
        } while (curr < date);
      }
    }
  } else if (this.bwdGrid_ && this.bwdInterval_ && this.lastBwdDate_.getTime() > date) {
    if (this.skipHolidays_) {
      sch = this.calendar_.getWorkingScheduleInternal(date, this.lastBwdDate_.getTime() - 1, this.interval_, true);
      for (i = sch.length; i--;) {
        info = sch[i];
        this.bwdGrid_.push(info['end'], info['start']);
      }
      if (sch.length)
        this.lastBwdDate_.setTime(sch[0]['start']);
      if (this.lastBwdDate_.getTime() > date) {
        // first working time interval in calendar is to the right of the requested date -
        // marking the bwd direction collapsed to avoid looking there again
        this.bwdInterval_ = null;
      }
    } else {
      curr = this.lastBwdDate_.getTime();
      do {
        prev = curr;
        this.lastBwdDate_.add(this.bwdInterval_);
        curr = this.lastBwdDate_.getTime();
        this.bwdGrid_.push(prev, curr);
      } while (curr > date);
    }
  }
};


/**
 * Ensures that passed unit is handled by the grid.
 * @param {number} unit
 * @private
 */
anychart.scales.DateTimeWithCalendar.TSGrid.prototype.ensureUnitHandled_ = function(unit) {
  if (!this.fwdGrid_ || this.easyMode_) // collapsed calendar
    return;
  var workingDate, prev, curr, targetIndex;
  if (unit >= 0) {
    targetIndex = Math.ceil(unit) * 2 + 2;
    if (this.fwdInterval_) {
      if (this.skipHolidays_) {
        while (this.fwdGrid_.length < targetIndex) {
          workingDate = this.calendar_.getNextWorkingUnitInternal(this.lastFwdDate_.getTime(), this.fwdInterval_);
          if (isNaN(workingDate)) {
            this.fwdInterval_ = null;
            break;
          } else {
            this.lastFwdDate_.setTime(workingDate);
            this.lastFwdDate_.add(this.fwdInterval_);
            this.fwdGrid_.push(workingDate, this.lastFwdDate_.getTime());
          }
        }
      } else {
        curr = this.lastFwdDate_.getTime();
        while (this.fwdGrid_.length < targetIndex) {
          prev = curr;
          this.lastFwdDate_.add(this.fwdInterval_);
          curr = this.lastFwdDate_.getTime();
          this.fwdGrid_.push(prev, curr);
        }
      }
    }
  } else if (this.bwdGrid_ && this.bwdInterval_) {
    targetIndex = Math.ceil(-unit) * 2 + 2;
    if (this.skipHolidays_) {
      while (this.bwdGrid_.length < targetIndex) {
        workingDate = this.calendar_.getPrevWorkingUnitInternal(this.lastBwdDate_.getTime() - 1, this.bwdInterval_);
        if (isNaN(workingDate)) {
          this.bwdInterval_ = null;
          break;
        } else {
          this.lastBwdDate_.setTime(workingDate);
          this.lastBwdDate_.add(this.interval_);
          this.bwdGrid_.push(this.lastBwdDate_.getTime(), workingDate);
          this.lastBwdDate_.setTime(workingDate);
        }
      }
    } else {
      curr = this.lastBwdDate_.getTime();
      while (this.bwdGrid_.length < targetIndex) {
        prev = curr;
        this.lastBwdDate_.add(this.bwdInterval_);
        curr = this.lastBwdDate_.getTime();
        this.bwdGrid_.push(prev, curr);
      }
    }
  }
};


//endregion
//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
// proto['pixStart'] = proto.pixStart;
// proto['pixEnd'] = proto.pixEnd;
//exports
(function() {
  var proto = anychart.scales.DateTimeWithCalendar.prototype;
  proto['dateToPix'] = proto.dateToPix;
  proto['pixToDate'] = proto.pixToDate;
  proto['calendar'] = proto.calendar;
  proto['skipHolidays'] = proto.skipHolidays;
  proto['unitPixSize'] = proto.unitPixSize;
  proto['unit'] = proto.unit;
  proto['count'] = proto.count;
  proto['startDate'] = proto.startDate;
  proto['getTicks'] = proto.getTicks;
  proto['softMinimum'] = proto.softMinimum;
  proto['softMaximum'] = proto.softMaximum;
  proto['minimumGap'] = proto.minimumGap;
  proto['maximumGap'] = proto.maximumGap;
  proto['minimum'] = proto.minimum;
  proto['maximum'] = proto.maximum;
})();


//endregion
