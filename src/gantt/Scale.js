goog.provide('anychart.ganttModule.Scale');

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
anychart.ganttModule.Scale = function() {
  anychart.ganttModule.Scale.base(this, 'constructor');

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

  /**
   * @type {anychart.ganttModule.Scale.ZoomLevelsSettingsRep}
   * @private
   */
  this.ranges_ = this.normalizeLevels_(anychart.ganttModule.Scale.DEFAULT_LEVELS);
};
goog.inherits(anychart.ganttModule.Scale, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.ganttModule.Scale.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * @typedef {Array.<Array.<(anychart.enums.Interval|{unit:anychart.enums.Interval,count:number})>>}
 */
anychart.ganttModule.Scale.ZoomLevelsSettings;


/**
 * @typedef {Array<{range:number,levels:Array.<{unit:anychart.enums.Interval,count:number}>}>}
 */
anychart.ganttModule.Scale.ZoomLevelsSettingsRep;


/**
 * Amount of milliseconds in second.
 * @type {number}
 */
anychart.ganttModule.Scale.MILLISECONDS_IN_SECOND = 1000;


/**
 * Amount of milliseconds in minute.
 * @type {number}
 */
anychart.ganttModule.Scale.MILLISECONDS_IN_MINUTE = anychart.ganttModule.Scale.MILLISECONDS_IN_SECOND * 60;


/**
 * Amount of milliseconds in hour.
 * @type {number}
 */
anychart.ganttModule.Scale.MILLISECONDS_IN_HOUR = anychart.ganttModule.Scale.MILLISECONDS_IN_MINUTE * 60;


/**
 * Amount of milliseconds in day.
 * @type {number}
 */
anychart.ganttModule.Scale.MILLISECONDS_IN_DAY = anychart.ganttModule.Scale.MILLISECONDS_IN_HOUR * 24;


/**
 * Default zoom factor.
 * @type {number}
 */
anychart.ganttModule.Scale.DEFAULT_ZOOM_FACTOR = 1.25;


/**
 * @return {anychart.enums.ScaleTypes}
 */
anychart.ganttModule.Scale.prototype.getType = function() {
  return anychart.enums.ScaleTypes.GANTT;
};


/**
 * Creates function that returns formatted string by pattern.
 * @param {string} pattern - Pattern.
 * @param {string=} opt_template - Template to create a resulting string.
 *  Note: Template must be used to express date ranges, so it MUST contain two '%s' expressions. First one means
 *  formatted start date, second one means formatted end date.
 * @return {Function} - Formatter function.
 * @private
 */
anychart.ganttModule.Scale.createFormat_ = function(pattern, opt_template) {
  if (opt_template) {
    return function(startDate, endDate) {
      return goog.string.format(
          /** @type {string} */ (opt_template),
          anychart.format.dateTime(startDate, pattern),
          anychart.format.dateTime(endDate, pattern)
      );
    };
  } else {
    return function(startDate) {
      return anychart.format.dateTime(startDate, pattern);
    };
  }
};


/**
 *
 * @type {anychart.ganttModule.Scale.ZoomLevelsSettings}
 */
anychart.ganttModule.Scale.DEFAULT_LEVELS = [
  [{'unit': anychart.enums.Interval.MINUTE, 'count': 10}, {'unit': anychart.enums.Interval.HOUR, 'count': 1}, {'unit': anychart.enums.Interval.DAY, 'count': 1}],
  [{'unit': anychart.enums.Interval.HOUR, 'count': 2}, {'unit': anychart.enums.Interval.DAY, 'count': 1}, {'unit': anychart.enums.Interval.MONTH, 'count': 1}],
  [{'unit': anychart.enums.Interval.DAY, 'count': 1}, {'unit': anychart.enums.Interval.WEEK, 'count': 1}, {'unit': anychart.enums.Interval.MONTH, 'count': 1}],
  [{'unit': anychart.enums.Interval.MONTH, 'count': 1}, {'unit': anychart.enums.Interval.QUARTER, 'count': 1}, {'unit': anychart.enums.Interval.YEAR, 'count': 1}],
  [{'unit': anychart.enums.Interval.QUARTER, 'count': 1}, {'unit': anychart.enums.Interval.YEAR, 'count': 1}, {'unit': anychart.enums.Interval.YEAR, 'count': 10}]
];


/**
 * Whether scale is not configured.
 * Used for serialization purposes.
 * @return {boolean} - Whether scale is not configured.
 */
anychart.ganttModule.Scale.prototype.isEmpty = function() {
  return isNaN(this.min_) && isNaN(this.max_) &&
      isNaN(this.dataMin_) && isNaN(this.dataMax_);
};


/**
 * Resets values.
 */
anychart.ganttModule.Scale.prototype.reset = function() {
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
anychart.ganttModule.Scale.prototype.getEmptyRange = function() {
  var now = new Date();
  if (isNaN(this.emptyMin_))
    this.emptyMin_ = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (isNaN(this.emptyMax_))
    this.emptyMax_ = this.emptyMin_ + anychart.ganttModule.Scale.MILLISECONDS_IN_DAY;
  return {'min': this.emptyMin_, 'max': this.emptyMax_};
};


/**
 * Sets a minimum and maximum dates for the scale.
 * TODO (A.Kudryavtsev): Describe how min and max values are limited by total min and total max.
 * @param {*} min - Minimum value.
 * @param {*} max - Maximum value.
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.setRange = function(min, max) {
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
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.setDataRange = function(min, max) {
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
 * Gets minimum and maximum visible dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.ganttModule.Scale.prototype.getRange = function() {
  this.calculate();
  return this.isEmpty() ? this.getEmptyRange() : {'min': this.min_, 'max': this.max_};
};


/**
 * Gets total minimum and maximum dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.ganttModule.Scale.prototype.getTotalRange = function() {
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
anychart.ganttModule.Scale.prototype.calculate = function() {
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
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.fitAll = function() {
  if (!this.isEmpty()) {
    var range = this.getTotalRange();
    return this.setRange(range['min'], range['max']);
  }
  return this;
};


/**
 * Manually sets scale's minimum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.Scale} - Current value or itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.minimum = function(opt_value) {
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
 * @return {number|anychart.ganttModule.Scale} - Current value or itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.maximum = function(opt_value) {
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
 * @return {number|anychart.ganttModule.Scale} - Current value or itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.softMinimum = function(opt_value) {
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
 * @return {number|anychart.ganttModule.Scale} - Current value or itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.softMaximum = function(opt_value) {
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
 * @return {number|anychart.ganttModule.Scale} - Current value or itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.minimumGap = function(opt_value) {
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
 * @return {number|anychart.ganttModule.Scale} - Current value or itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.maximumGap = function(opt_value) {
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
 * @param {number} pixStart
 * @param {number} pixEnd
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @return {Array.<{start:number,end:number,holiday:(boolean|undefined)}>}
 */
anychart.ganttModule.Scale.prototype.getTicks = function(pixStart, pixEnd, unit, count) {
  var range = this.getRange();
  var start = anychart.utils.alignDateLeftByUnit(range['min'], unit, count, 2000);
  var end = range['max'];
  var res = [];
  var current = new goog.date.UtcDateTime(new Date(start));
  var interval = anychart.utils.getIntervalFromInfo(unit, count);
  var curr = current.getTime();
  while (curr < end) {
    var prev = curr;
    current.add(interval);
    curr = current.getTime();
    res.push({
      'start': prev,
      'end': curr
    });
  }
  return res;
};


/**
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @return {Array.<number>}
 */
anychart.ganttModule.Scale.prototype.getSimpleTicks = function(unit, count) {
  return goog.array.map(this.getTicks(NaN, NaN, unit, count), function(item) {
    return item['end'];
  });
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
anychart.ganttModule.Scale.prototype.timestampToRatio = function(value) {
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
 * @param {*} value - Value to transform.
 * @return {number} - Value transformed to ratio scope. Returns NaN if scale range is not set.
 */
anychart.ganttModule.Scale.prototype.transform = function(value) {
  return this.timestampToRatio(value);
};


/**
 * This method is added only for compatibility with line/range/text markers of gantt chart's timeline.
 * @param {number} ratio - Ratio to transform.
 * @return {number} - Ratio transformed to datetime.
 */
anychart.ganttModule.Scale.prototype.inverseTransform = function(ratio) {
  return this.ratioToTimestamp(ratio);
};


/**
 * Transforms a passed ratio value into a timestamp depending on current scale date range.
 * @param {number} value - Ratio.
 * @return {number} - Timestamp.
 */
anychart.ganttModule.Scale.prototype.ratioToTimestamp = function(value) {
  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  //You will get this return expression if you draw a time axis and mark a values there.
  return Math.round(value * (max - min) + min);
};


/**
 * Gets level settings for current scale state.
 * @return {Array.<anychart.ganttBaseModule.TimeLineHeader.Level>}
 */
anychart.ganttModule.Scale.prototype.getLevelsData = function() {
  this.calculate();
  var r = this.getRange();
  var min = r['min'];
  var max = r['max'];

  var minorTickRange = (max - min) / 20;
  var last = this.ranges_.length - 1;
  var row;
  for (var i = 0; i < last; i++) {
    if (minorTickRange <= this.ranges_[i]['range']) {
      row = this.ranges_[i];
      break;
    }
  }
  if (!row) {
    row = this.ranges_[last];
  }

  return /** @type {Array.<anychart.ganttBaseModule.TimeLineHeader.Level>} */(row['levels']);
};


/**
 * If total min is visually reached.
 * @return {boolean}
 * @private
 */
anychart.ganttModule.Scale.prototype.minReached_ = function() {
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
 * @private
 */
anychart.ganttModule.Scale.prototype.maxReached_ = function() {
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
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.zoomIn = function(opt_zoomFactor) {
  if (!this.isEmpty()) {
    opt_zoomFactor = opt_zoomFactor ? (1 / opt_zoomFactor) : (1 / anychart.ganttModule.Scale.DEFAULT_ZOOM_FACTOR);
    var range = this.max_ - this.min_;
    var msInterval = Math.round(range * (opt_zoomFactor - 1) / 2);
    var newMin = this.min_ - msInterval;
    var newMax = this.max_ + msInterval;
    if (Math.abs(newMin - newMax) <= anychart.ganttModule.Scale.MILLISECONDS_IN_MINUTE) {
      var middle = (this.min_ + this.max_) / 2;
      newMin = middle - anychart.ganttModule.Scale.MILLISECONDS_IN_MINUTE / 2;
      newMax = middle + anychart.ganttModule.Scale.MILLISECONDS_IN_MINUTE / 2;
    }
    this.setRange(newMin, newMax);
  }

  return this;
};


/**
 * Zooms scale out.
 * @param {number=} opt_zoomFactor - Zoom out factor value. "opt_zoomFactor = 5" means 5 times further.
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.zoomOut = function(opt_zoomFactor) {
  if (!this.minReached_() || !this.maxReached_()) {
    opt_zoomFactor = opt_zoomFactor || anychart.ganttModule.Scale.DEFAULT_ZOOM_FACTOR;
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
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.zoomTo = function(startOrUnit, opt_endOrCount, opt_anchor) {
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
 * Zoom levels settings.
 * @param {anychart.ganttModule.Scale.ZoomLevelsSettings=} opt_value
 * @return {anychart.ganttModule.Scale.ZoomLevelsSettings|anychart.ganttModule.Scale}
 */
anychart.ganttModule.Scale.prototype.zoomLevels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var newZoomLevels = this.normalizeLevels_(opt_value);
    var same = newZoomLevels.length == this.ranges_.length &&
        goog.array.every(newZoomLevels, function(newZoomLevel, index) {
          var oldZoomLevelLevels = this.ranges_[index]['levels'];
          return newZoomLevel['levels'].length == oldZoomLevelLevels.length &&
              goog.array.every(newZoomLevel['levels'], function(item, index) {
                return item['unit'] == oldZoomLevelLevels[index]['unit'] &&
                    item['count'] == oldZoomLevelLevels[index]['count'];
              });
        }, this);
    if (!same) {
      this.ranges_ = newZoomLevels;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return /** @type {anychart.ganttModule.Scale.ZoomLevelsSettings} */(
      goog.array.map(this.ranges_, function(item) {
        return goog.array.map(item['levels'], function(level) {
          return {
            'unit': level['unit'],
            'count': level['count']
          };
        });
      }));
};


/**
 * Normalizes anychart.ganttModule.Scale.ZoomLevelsSettings-like representation to anychart.ganttModule.Scale.ZoomLevelsSettingsRep.
 * @param {*} value
 * @return {anychart.ganttModule.Scale.ZoomLevelsSettingsRep}
 * @private
 */
anychart.ganttModule.Scale.prototype.normalizeLevels_ = function(value) {
  var res = [];
  if (goog.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      var zoomLevel = value[i];
      if (goog.isArray(zoomLevel)) {
        var levels = [];
        for (var j = 0; j < zoomLevel.length; j++) {
          var val = zoomLevel[j];
          var unit = null,
              count;
          if (goog.isString(val)) {
            unit = anychart.enums.normalizeInterval(val, null);
            count = 1;
          } else if (goog.isObject(val)) {
            unit = anychart.enums.normalizeInterval(val['unit'], null);
            count = anychart.utils.normalizeToNaturalNumber(val['count']);
          }
          if (unit) {
            levels.push({
              'unit': unit,
              'count': count
            });
          }
        }
        if (levels.length) {
          res.push({
            'range': anychart.utils.getIntervalRange(/** @type {anychart.enums.Interval} */(levels[0]['unit']), /** @type {number} */(levels[0]['count'])),
            'levels': levels
          });
        }
      }
    }
    res.sort(function(a, b) {
      return a['range'] - b['range'];
    });
  }
  return res;
};


/**
 * Performs scroll by ratio passed.
 * @param {number} ratio - Ratio.
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.ratioScroll = function(ratio) {
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
 * @return {anychart.ganttModule.Scale} - Itself for method chaining.
 */
anychart.ganttModule.Scale.prototype.ratioForceScroll = function(ratio) {
  if (ratio && !this.isEmpty()) {
    this.getTotalRange();

    var msInterval = Math.round((this.max_ - this.min_) * ratio);
    var newMin = this.min_ + msInterval;
    var newMax = this.max_ + msInterval;

    if ((!isNaN(this.manualMin_) && newMin < this.manualMin_) || (!isNaN(this.manualMax_) && newMax > this.manualMax_))
      return this;

    // this.dataMin_ = Math.min(this.dataMin_, newMin);
    this.dataMin_ = NaN;
    this.min_ = newMin;
    // this.dataMax_ = Math.max(this.dataMax_, newMax);
    this.dataMax_ = NaN;
    this.max_ = newMax;

    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/** @inheritDoc */
anychart.ganttModule.Scale.prototype.serialize = function() {
  var json = anychart.ganttModule.Scale.base(this, 'serialize');

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
  json['zoomLevels'] = this.zoomLevels();

  return json;
};


/** @inheritDoc */
anychart.ganttModule.Scale.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.Scale.base(this, 'setupByJSON', config, opt_default);

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

  if ('zoomLevels' in config)
    this.zoomLevels(config['zoomLevels']);

  if (recalc) {
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
};


//exports
(function() {
  var proto = anychart.ganttModule.Scale.prototype;
  proto['minimumGap'] = proto.minimumGap;
  proto['maximumGap'] = proto.maximumGap;
  proto['minimum'] = proto.minimum;
  proto['maximum'] = proto.maximum;
  proto['softMinimum'] = proto.softMinimum;
  proto['softMaximum'] = proto.softMaximum;
  proto['getRange'] = proto.getRange;
  proto['getTotalRange'] = proto.getTotalRange;
  proto['zoomLevels'] = proto.zoomLevels;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
  // proto['zoomIn'] = proto.zoomIn;
  // proto['zoomOut'] = proto.zoomOut;
  // proto['zoomTo'] = proto.zoomTo;
  // proto['fitAll'] = proto.fitAll;
})();
