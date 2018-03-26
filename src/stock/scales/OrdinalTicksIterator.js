goog.provide('anychart.stockModule.scales.OrdinalTicksIterator');
goog.require('anychart.stockModule.scales.ScatterTicksIterator');
goog.require('goog.date.UtcDateTime');



/**
 * Ordinal ticks iterator.
 * @param {anychart.stockModule.scales.Scatter} scale - A scale to be able to align ticks.
 * @constructor
 * @extends {anychart.stockModule.scales.ScatterTicksIterator}
 */
anychart.stockModule.scales.OrdinalTicksIterator = function(scale) {
  anychart.stockModule.scales.OrdinalTicksIterator.base(this, 'constructor');

  /**
   * @type {anychart.stockModule.scales.Scatter}
   * @private
   */
  this.scale_ = scale;

  // Ordinal ticks are always minor
  this.currentIsMinor = true;
};
goog.inherits(anychart.stockModule.scales.OrdinalTicksIterator, anychart.stockModule.scales.ScatterTicksIterator);


/** @inheritDoc */
anychart.stockModule.scales.OrdinalTicksIterator.prototype.reset = function() {
  var startAlignedByMajor = anychart.utils.alignDateLeft(this.start, this.majorInterval, this.globalStart);
  var startAlignedByMinor = anychart.utils.alignDateLeft(this.start, this.minorInterval, this.globalStart);

  this.currentMajor = new goog.date.UtcDateTime(new Date(startAlignedByMajor));

  this.preFirstMajor = NaN;
  if (this.currentMajor.getTime() < this.start) {
    this.preFirstMajor = this.advanceDate_(this.currentMajor, this.majorInterval);
    if (this.preFirstMajor > this.end)
      this.preFirstMajor = NaN;
  }

  this.currentMinor = new goog.date.UtcDateTime(new Date(startAlignedByMinor));

  while (this.currentMinor.getTime() < this.start)
    this.currentMinor.add(this.minorInterval);
};


/** @inheritDoc */
anychart.stockModule.scales.OrdinalTicksIterator.prototype.advance = function() {
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
anychart.stockModule.scales.OrdinalTicksIterator.prototype.advanceDate_ = function(value, interval) {
  var aligned = this.scale_.alignByIndex(value.getTime());
  var curr = value.getTime();

  value.add(interval);
  var next = value.getTime();
  if (next <= aligned) {
    next = aligned;
    curr = anychart.utils.alignDateLeft(next, interval, curr);
    value.setTime(curr);
    value.add(interval);
  }

  return curr;
};
