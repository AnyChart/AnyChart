goog.provide('anychart.core.utils.DateTimeIntervalsList');
goog.require('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * Intervals list management and choosing.
 * @param {!Array.<!anychart.core.utils.DateTimeIntervalGenerator>=} opt_ranges
 * @param {number=} opt_maxPoints
 * @constructor
 */
anychart.core.utils.DateTimeIntervalsList = function(opt_ranges, opt_maxPoints) {
  /**
   * Ranges list.
   * @type {!Array.<!anychart.core.utils.DateTimeIntervalGenerator>}
   * @private
   */
  this.intervals_ = [];

  /**
   * Max points list. If element is zero - should use default maxPoints.
   * @type {!Array.<number>}
   * @private
   */
  this.maxPointsArr_ = [];

  /**
   * Max points default.
   * @type {number}
   * @private
   */
  this.maxPoints_ = opt_maxPoints || 500;

  if (goog.isArray(opt_ranges)) {
    for (var i = 0; i < opt_ranges.length; i++) {
      this.addInterval(opt_ranges[i]);
    }
  }

  if (!this.intervals_.length) {
    // intervals list should contain at least one interval
    this.addInterval(anychart.enums.Interval.MILLISECOND, 1);
  }
};


/**
 * Adds interval to the list.
 * @param {string|anychart.core.utils.DateTimeIntervalGenerator} unitOrInterval
 * @param {number=} opt_count
 * @param {number=} opt_maxPoints
 */
anychart.core.utils.DateTimeIntervalsList.prototype.addInterval = function(unitOrInterval, opt_count, opt_maxPoints) {
  var interval = goog.isString(unitOrInterval) ?
      new anychart.core.utils.DateTimeIntervalGenerator(unitOrInterval, opt_count || 1) :
      /** @type {anychart.core.utils.DateTimeIntervalGenerator} */(unitOrInterval);
  var index = goog.array.binarySearch(this.intervals_, interval,
      anychart.core.utils.DateTimeIntervalGenerator.comparator);
  if (index < 0) {
    index = ~index;
    goog.array.insertAt(this.intervals_, interval, index);
    goog.array.insertAt(this.maxPointsArr_, opt_maxPoints || 0, index);
  } else {
    this.maxPointsArr_[index] = opt_maxPoints || 0;
  }
};


/**
 * Chooses proper interval from the list to fit the range. Returns the biggest aggregation interval if no else fits.
 * @param {number} range
 * @param {number=} opt_pointsCount
 * @return {!anychart.core.utils.DateTimeIntervalGenerator}
 */
anychart.core.utils.DateTimeIntervalsList.prototype.chooseInterval = function(range, opt_pointsCount) {
  var i, len = this.intervals_.length - 1;
  // we do not want to test the last item in list - we just return it
  for (i = 0; i < len; i++) {
    var interval = this.intervals_[i];
    var pointsCount = opt_pointsCount || this.maxPointsArr_[i] || this.maxPoints_;
    if (interval.getRange() * pointsCount >= range)
      return interval;
  }
  // there always at least one element in this list
  return this.intervals_[len];
};
