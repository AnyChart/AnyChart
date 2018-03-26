goog.provide('anychart.stockModule.scales.ScatterTicksIterator');
goog.require('anychart.utils');
goog.require('goog.date.UtcDateTime');



/**
 * Scatter ticks iterator.
 * @constructor
 */
anychart.stockModule.scales.ScatterTicksIterator = function() {
};


/**
 * @param {number} start
 * @param {number} end
 * @param {!goog.date.Interval} majorInterval
 * @param {!goog.date.Interval} minorInterval
 * @param {number} globalStart
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.setup = function(start, end, majorInterval, minorInterval,
    globalStart) {
  /**
   * @type {number}
   * @protected
   */
  this.start = start;

  /**
   * @type {number}
   * @protected
   */
  this.globalStart = globalStart;

  /**
   * @type {number}
   * @protected
   */
  this.end = end;

  /**
   * @type {!goog.date.Interval}
   * @protected
   */
  this.majorInterval = majorInterval;

  /**
   * @type {!goog.date.Interval}
   * @protected
   */
  this.minorInterval = minorInterval;

  /**
   * .toArray() cache.
   * @type {Array.<number>}
   * @private
   */
  this.majorTicksArrayCache_ = null;

  /**
   * .toArray() cache.
   * @type {Array.<number>}
   * @private
   */
  this.minorTicksArrayCache_ = null;

  this.reset();
};


/**
 * Resets the iterator to the pre-first position.
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.reset = function() {
  var startAlignedByMajor = anychart.utils.alignDateLeft(this.start, this.majorInterval, this.globalStart);
  var startAlignedByMinor = anychart.utils.alignDateLeft(this.start, this.minorInterval, this.globalStart);

  /**
   * @type {goog.date.UtcDateTime}
   * @protected
   */
  this.currentMajor = new goog.date.UtcDateTime(new Date(startAlignedByMajor));

  /**
   * @type {number}
   * @protected
   */
  this.preFirstMajor = NaN;

  if (this.currentMajor.getTime() < this.start) {
    this.preFirstMajor = this.currentMajor.getTime();
    if (this.preFirstMajor > this.end)
      this.preFirstMajor = NaN;
    this.currentMajor.add(this.majorInterval);
  }

  /**
   * @type {goog.date.UtcDateTime}
   * @protected
   */
  this.currentMinor = new goog.date.UtcDateTime(new Date(startAlignedByMinor));

  while (this.currentMinor.getTime() < this.start)
    this.currentMinor.add(this.minorInterval);
};


/**
 * Advances to the next position.
 * @return {boolean}
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.advance = function() {
  var major = this.currentMajor.getTime();
  var minor = this.currentMinor.getTime();

  /**
   * @type {number}
   * @protected
   */
  this.current = Math.min(major, minor);

  /**
   * @type {boolean}
   * @protected
   */
  this.currentIsMajor = major == this.current;

  /**
   * @type {boolean}
   * @protected
   */
  this.currentIsMinor = minor == this.current;

  var result = this.current <= this.end;
  if (result) {
    if (this.currentIsMajor)
      this.currentMajor.add(this.majorInterval);
    if (this.currentIsMinor)
      this.currentMinor.add(this.minorInterval);
  }
  return result;
};


/**
 * Returns true if current tick value is major and false otherwise. A tick can be both major and minor at the same time.
 * @return {boolean}
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.getCurrentIsMajor = function() {
  return this.currentIsMajor;
};


/**
 * Returns true if current tick value is minor and false otherwise. A tick can be both major and minor at the same time.
 * @return {boolean}
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.getCurrentIsMinor = function() {
  return this.currentIsMinor;
};


/**
 * Returns current tick value.
 * @return {number}
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.getCurrent = function() {
  return this.current;
};


/**
 * Returns hanging major tick value.
 * @return {number}
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.getPreFirstMajor = function() {
  return this.preFirstMajor;
};


/**
 * Returns array of asked ticks.
 * @param {boolean} major
 * @return {!Array.<number>}
 */
anychart.stockModule.scales.ScatterTicksIterator.prototype.toArray = function(major) {
  if (major) {
    if (this.majorTicksArrayCache_)
      return this.majorTicksArrayCache_;
  } else {
    if (this.minorTicksArrayCache_)
      return this.minorTicksArrayCache_;
  }

  var result = [];
  this.reset();
  while (this.advance()) {
    if ((major && this.currentIsMajor) || (!major && this.currentIsMinor))
      result.push(this.current);
  }

  if (major)
    this.majorTicksArrayCache_ = result;
  else
    this.minorTicksArrayCache_ = result;

  return result;
};
