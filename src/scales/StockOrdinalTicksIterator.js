goog.provide('anychart.scales.StockOrdinalTicksIterator');
goog.require('anychart.scales.StockScatterTicksIterator');
goog.require('goog.date.UtcDateTime');



/**
 * Ordinal ticks iterator.
 * @param {anychart.scales.StockScatterDateTime} scale - A scale to be able to align ticks.
 * @constructor
 * @extends {anychart.scales.StockScatterTicksIterator}
 */
anychart.scales.StockOrdinalTicksIterator = function(scale) {
  anychart.scales.StockOrdinalTicksIterator.base(this, 'constructor');

  /**
   * @type {anychart.scales.StockScatterDateTime}
   * @private
   */
  this.scale_ = scale;

  // Ordinal ticks are always minor
  this.currentIsMinor = true;
};
goog.inherits(anychart.scales.StockOrdinalTicksIterator, anychart.scales.StockScatterTicksIterator);


/** @inheritDoc */
anychart.scales.StockOrdinalTicksIterator.prototype.reset = function() {
  this.currentMajor = new goog.date.UtcDateTime(new Date(this.alignedStart));

  this.preFirstMajor = NaN;
  if (this.alignedStart < this.start) {
    this.preFirstMajor = this.advanceDate_(this.currentMajor, this.majorInterval);
    if (this.preFirstMajor > this.end)
      this.preFirstMajor = NaN;
  }

  this.currentMinor = new goog.date.UtcDateTime(new Date(this.alignedStart));

  while (this.currentMinor.getTime() < this.start)
    this.currentMinor.add(this.minorInterval);
};


/** @inheritDoc */
anychart.scales.StockOrdinalTicksIterator.prototype.advance = function() {
  var major = this.currentMajor.getTime();
  var minor = this.advanceDate_(this.currentMinor, this.minorInterval);

  this.current = minor;
  this.currentIsMajor = major <= minor;

  var result = this.current <= this.end;
  if (result && this.currentIsMajor)
    this.advanceDate_(this.currentMajor, this.majorInterval);
  return result;
};


/**
 * Advances passed value by the interval until it starts to matter.
 * Returns the last timestamp before the advance happened. MODIFIES passed value.
 * @param {goog.date.UtcDateTime} value
 * @param {goog.date.Interval} interval
 * @return {number}
 * @private
 */
anychart.scales.StockOrdinalTicksIterator.prototype.advanceDate_ = function(value, interval) {
  var aligned = this.scale_.alignByIndex(value.getTime());
  var prevVal, curr = value.getTime();
  do {
    prevVal = curr;
    value.add(interval);
    curr = value.getTime();
  } while (curr < this.end && this.scale_.alignByIndex(curr) == aligned);
  return prevVal;
};
