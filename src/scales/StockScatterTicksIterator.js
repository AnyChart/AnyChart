goog.provide('anychart.scales.StockScatterTicksIterator');
goog.require('anychart.utils');
goog.require('goog.date.UtcDateTime');



/**
 * Scatter ticks iterator.
 * @constructor
 */
anychart.scales.StockScatterTicksIterator = function() {
};


/**
 * @param {number} start
 * @param {number} end
 * @param {!goog.date.Interval} majorInterval
 * @param {!goog.date.Interval} minorInterval
 * @param {number} globalStart
 */
anychart.scales.StockScatterTicksIterator.prototype.setup = function(start, end, majorInterval, minorInterval,
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
  this.alignedStart = anychart.utils.alignDateLeft(start, majorInterval, globalStart);

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
anychart.scales.StockScatterTicksIterator.prototype.reset = function() {
  /**
   * @type {goog.date.UtcDateTime}
   * @protected
   */
  this.currentMajor = new goog.date.UtcDateTime(new Date(this.alignedStart));

  /**
   * @type {number}
   * @protected
   */
  this.preFirstMajor = NaN;

  if (this.alignedStart < this.start) {
    this.preFirstMajor = this.currentMajor.getTime();
    if (this.preFirstMajor > this.end)
      this.preFirstMajor = NaN;
    this.currentMajor.add(this.majorInterval);
  }

  /**
   * @type {goog.date.UtcDateTime}
   * @protected
   */
  this.currentMinor = new goog.date.UtcDateTime(new Date(this.alignedStart));

  while (this.currentMinor.getTime() < this.start)
    this.currentMinor.add(this.minorInterval);
};


/**
 * Advances to the next position.
 * @return {boolean}
 */
anychart.scales.StockScatterTicksIterator.prototype.advance = function() {
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
anychart.scales.StockScatterTicksIterator.prototype.getCurrentIsMajor = function() {
  return this.currentIsMajor;
};


/**
 * Returns true if current tick value is minor and false otherwise. A tick can be both major and minor at the same time.
 * @return {boolean}
 */
anychart.scales.StockScatterTicksIterator.prototype.getCurrentIsMinor = function() {
  return this.currentIsMinor;
};


/**
 * Returns current tick value.
 * @return {number}
 */
anychart.scales.StockScatterTicksIterator.prototype.getCurrent = function() {
  return this.current;
};


/**
 * Returns hanging major tick value.
 * @return {number}
 */
anychart.scales.StockScatterTicksIterator.prototype.getPreFirstMajor = function() {
  return this.preFirstMajor;
};


/**
 * Returns array of asked ticks.
 * @param {boolean} major
 * @return {!Array.<number>}
 */
anychart.scales.StockScatterTicksIterator.prototype.toArray = function(major) {
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
