goog.provide('anychart.stockModule.scales.IKeyIndexTransformer');
goog.provide('anychart.stockModule.scales.Scatter');
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.scales.IXScale');
goog.require('anychart.stockModule.scales.ScatterTicksIterator');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Stock scatter datetime scale class.
 * @param {!anychart.stockModule.scales.IKeyIndexTransformer} chartOrScroller
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.scales.IXScale}
 */
anychart.stockModule.scales.Scatter = function(chartOrScroller) {
  anychart.stockModule.scales.Scatter.base(this, 'constructor');
  /**
   * Threshold ticks count.
   * @type {number}
   * @private
   */
  this.maxTicksCount_ = 1000;

  /**
   * Chart reference. Used for key<->index transformations.
   * @type {!anychart.stockModule.scales.IKeyIndexTransformer}
   * @protected
   */
  this.keyIndexTransformer = chartOrScroller;

  /**
   * Auto calculated full scale minimum key.
   * @type {number}
   * @protected
   */
  this.alignedFullMinKey = NaN;

  /**
   * Auto calculated full scale maximum key.
   * @type {number}
   * @protected
   */
  this.alignedFullMaxKey = NaN;

  /**
   * Auto calculated full data minimum key.
   * @type {number}
   * @protected
   */
  this.dataFullMinKey = NaN;

  /**
   * Auto calculated full data maximum key.
   * @type {number}
   * @protected
   */
  this.dataFullMaxKey = NaN;

  /**
   * Current scale minimum key.
   * @type {number}
   * @protected
   */
  this.minKey = NaN;

  /**
   * Current scale maximum key.
   * @type {number}
   * @protected
   */
  this.maxKey = NaN;

  /**
   * Current scale minimum index.
   * @type {number}
   * @protected
   */
  this.minIndex = NaN;

  /**
   * Current scale maximum index.
   * @type {number}
   * @protected
   */
  this.maxIndex = NaN;

  /**
   * Consistency flag. Easier to use than Base consistency here.
   * @type {boolean}
   */
  this.consistent = false;

  /**
   * Major ticks for the scale.
   * @type {anychart.stockModule.scales.ScatterTicksIterator}
   * @protected
   */
  this.ticksIterator = null;

  /**
   * Array of minor intervals, synced with RANGES_. Used by interval auto calculation.
   * @type {!Array.<!Array>}
   * @protected
   */
  this.MINOR_INTERVALS = anychart.stockModule.scales.Scatter.MINOR_INTERVALS_;

  /**
   * Array of minor intervals, synced with RANGES_. Used by interval auto calculation.
   * @type {!Array.<!Array>}
   * @protected
   */
  this.MAJOR_INTERVALS = anychart.stockModule.scales.Scatter.MAJOR_INTERVALS_;

  /**
   * Array of different ranges. Used by interval auto calculation.
   * @type {!Array.<number>}
   * @protected
   */
  this.RANGES = anychart.stockModule.scales.Scatter.RANGES_;
};
goog.inherits(anychart.stockModule.scales.Scatter, anychart.core.Base);


/**
 * Supported signals set.
 * @type {number}
 */
anychart.stockModule.scales.Scatter.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEED_UPDATE_TICK_DEPENDENT |
    anychart.Signal.NEED_UPDATE_FULL_RANGE_ITEMS;


/**
 * Max ticks count for interval-mode ticks calculation.
 * @param {number=} opt_value
 * @return {number|anychart.stockModule.scales.Scatter}
 */
anychart.stockModule.scales.Scatter.prototype.maxTicksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, 1000, false);
    if (this.maxTicksCount_ != val) {
      this.maxTicksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
    }
    return this;
  }
  return this.maxTicksCount_;
};


/**
 * Full scale minimum getter.
 * @return {number|anychart.stockModule.scales.Scatter}
 */
anychart.stockModule.scales.Scatter.prototype.getFullMinimum = function() {
  return this.alignedFullMinKey;
};


/**
 * Full scale maximum getter.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getFullMaximum = function() {
  return this.alignedFullMaxKey;
};


/**
 * Current scale minimum getter.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getMinimum = function() {
  return this.minKey;
};


/**
 * Current scale maximum getter.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getMaximum = function() {
  return this.maxKey;
};


/**
 * Current scale minimum getter.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getMinimumIndex = function() {
  return this.minIndex;
};


/**
 * Current scale maximum getter.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getMaximumIndex = function() {
  return this.maxIndex;
};


/**
 * Gets current major interval unit.
 * @return {anychart.enums.Interval}
 */
anychart.stockModule.scales.Scatter.prototype.getMajorIntervalUnit = function() {
  return this.majorUnit_;
};


/**
 * Gets current major interval unit count.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getMajorIntervalUnitCount = function() {
  return this.majorUnitCount_;
};


/**
 * Gets current minor interval unit.
 * @return {anychart.enums.Interval}
 */
anychart.stockModule.scales.Scatter.prototype.getMinorIntervalUnit = function() {
  return this.minorUnit_;
};


/**
 * Gets current minor interval unit count.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getMinorIntervalUnitCount = function() {
  return this.minorUnitCount_;
};


/**
 * Checks if passed value will be treated as missing by this scale.
 * @param {*} value
 * @return {boolean}
 */
anychart.stockModule.scales.Scatter.prototype.isMissing = function(value) {
  return isNaN(anychart.utils.normalizeTimestamp(value));
};


/**
 * Transforms values to ratio.
 * @param {*} value
 * @param {number=} opt_subrangeRatio
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.transform = function(value, opt_subrangeRatio) {
  return this.transformInternal(value, NaN);
};


/**
 * Processes reverse transformation of the ratio backward to value.
 * @param {number} ratio
 * @return {number} Returns timestamp.
 */
anychart.stockModule.scales.Scatter.prototype.inverseTransform = function(ratio) {
  return Math.round(ratio * (this.maxKey - this.minKey) + this.minKey);
};


/** @inheritDoc */
anychart.stockModule.scales.Scatter.prototype.checkWeights = function() {
  return false;
};


/**
 * Returns ticks iterator.
 * @return {anychart.stockModule.scales.ScatterTicksIterator}
 */
anychart.stockModule.scales.Scatter.prototype.getTicks = function() {
  this.calculate();
  return this.ticksIterator;
};


/**
 * Aligns passed date by the chart points mesh.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.alignByIndex = function(key) {
  return this.keyIndexTransformer.getKeyByIndex(Math.ceil(this.keyIndexTransformer.getIndexByKey(key)));
};


/**
 * Calculates ticks. Internal
 */
anychart.stockModule.scales.Scatter.prototype.calculate = function() {
  if (this.consistent) return;

  this.ensureTicksIteratorCreated();

  var dataMinKey, dataMaxKey;
  if (this.maxKey <= this.dataFullMinKey || this.minKey >= this.dataFullMaxKey) {
    dataMinKey = this.minKey;
    dataMaxKey = this.maxKey;
  } else {
    dataMinKey = goog.math.clamp(this.minKey, this.dataFullMinKey, this.dataFullMaxKey);
    dataMaxKey = goog.math.clamp(this.maxKey, this.dataFullMinKey, this.dataFullMaxKey);
  }

  var range = Math.abs(dataMaxKey - dataMinKey) / 6;
  if (isNaN(range)) {
    this.ticksIterator.setup(
        NaN,
        NaN,
        anychart.utils.getIntervalFromInfo(anychart.enums.Interval.YEAR, 1),
        anychart.utils.getIntervalFromInfo(anychart.enums.Interval.YEAR, 1),
        NaN);
  }

  var len = this.RANGES.length;
  var minorInterval, majorInterval;
  for (var i = 0; i < len; i++) {
    if (range <= this.RANGES[i]) {
      majorInterval = this.MAJOR_INTERVALS[i];
      minorInterval = this.MINOR_INTERVALS[i];
      break;
    }
  }
  // Math.ceil(range / (365 * 24 * 60 * 60 * 1000)) is always >= 0.5, because the last
  // this.RANGES is 2 years, so there shouldn't be a situation when interval is 0.
  if (!minorInterval || !majorInterval) {
    var count = Math.ceil(range / (365 * 24 * 60 * 60 * 1000));
    majorInterval = [anychart.enums.Interval.YEAR, count];
    minorInterval = [anychart.enums.Interval.YEAR, count / 2];
  }

  this.ticksIterator.setup(
      dataMinKey,
      dataMaxKey,
      anychart.utils.getIntervalFromInfo(majorInterval[0], majorInterval[1]),
      anychart.utils.getIntervalFromInfo(minorInterval[0], minorInterval[1]),
      this.dataFullMinKey);

  this.majorUnit_ = majorInterval[0];
  this.majorUnitCount_ = majorInterval[1];
  this.minorUnit_ = minorInterval[0];
  this.minorUnitCount_ = minorInterval[1];

  this.consistent = true;
};


/**
 * Ensures that the ticks iterator is created.
 */
anychart.stockModule.scales.Scatter.prototype.ensureTicksIteratorCreated = function() {
  if (!this.ticksIterator)
    this.ticksIterator = new anychart.stockModule.scales.ScatterTicksIterator();
};


/**
 * Transforms values to ratio.
 * @param {*} key Key of the point to transform.
 * @param {number} index Point index. If it is needed but not passed it would be retrieved automatically.
 * @param {number=} opt_subRangeRatio Subrange ratio. Doesn't mean anything for stock for now.
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.transformInternal = function(key, index, opt_subRangeRatio) {
  return (anychart.utils.normalizeTimestamp(key) - this.minKey) / (this.maxKey - this.minKey);
};


/**
 * Transforms the key for axes, grids, etc.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.transformAligned = function(key) {
  return this.transform(key);
};


/**
 * Sets full range.
 * @param {number} alignedMinKey
 * @param {number} alignedMaxKey
 * @param {number} dataMinKey
 * @param {number} dataMaxKey
 */
anychart.stockModule.scales.Scatter.prototype.setAutoFullRange = function(alignedMinKey, alignedMaxKey, dataMinKey, dataMaxKey) {
  this.alignedFullMinKey = alignedMinKey;
  this.alignedFullMaxKey = alignedMaxKey;
  this.dataFullMinKey = dataMinKey;
  this.dataFullMaxKey = dataMaxKey;
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_FULL_RANGE_ITEMS);
};


/**
 * Sets current range.
 * @param {number} startKey
 * @param {number} endKey
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 */
anychart.stockModule.scales.Scatter.prototype.setCurrentRange = function(startKey, endKey, unit, count) {
  startKey = goog.math.clamp(startKey, this.alignedFullMinKey, this.alignedFullMaxKey);
  endKey = goog.math.clamp(endKey, this.alignedFullMinKey, this.alignedFullMaxKey);
  var startIndex = this.keyIndexTransformer.getIndexByKey(startKey);
  var endIndex = this.keyIndexTransformer.getIndexByKey(endKey);
  if (isNaN(startIndex) || isNaN(endIndex)) {
    this.minKey = NaN;
    this.maxKey = NaN;
  } else {
    this.minKey = startKey;
    this.maxKey = endKey;
  }
  this.minIndex = startIndex;
  this.maxIndex = endIndex;
  this.unit = unit;
  this.count = count;
  this.consistent = false;
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.stockModule.scales.Scatter.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
  }
};


/**
 * Returns true if passed string indicates Scatter scale.
 * @param {string} type
 * @return {boolean}
 */
anychart.stockModule.scales.Scatter.askedForScatter = function(type) {
  type = (type + '').toLowerCase();
  switch (type) {
    case 'linear':
    case 'scatter':
    case 'datetime':
    case 'simple':
      return true;
    default:
      return false;
  }
};


/**
 * Array of different ranges. Used by interval auto calculation.
 * Multiplying by 4 to get rid of count.
 * @type {!Array.<number>}
 * @private
 */
anychart.stockModule.scales.Scatter.RANGES_ = [
  1,
  5,
  20,
  100,
  500,
  1000 * 2,
  1000 * 10,
  1000 * 30,
  1000 * 60 * 2,
  1000 * 60 * 10,
  1000 * 60 * 30,
  1000 * 60 * 60,
  1000 * 60 * 60 * 3,
  1000 * 60 * 60 * 12,
  1000 * 60 * 60 * 24,
  1000 * 60 * 60 * 24 * 7,
  1000 * 60 * 60 * 24 * 365 / 12,
  1000 * 60 * 60 * 24 * 365 / 12 * 2,
  1000 * 60 * 60 * 24 * 365 / 12 * 3,
  1000 * 60 * 60 * 24 * 365 / 12 * 6,
  1000 * 60 * 60 * 24 * 365,
  1000 * 60 * 60 * 24 * 365 * 2
];


/**
 * Array of minor intervals, synced with RANGES_. Used by interval auto calculation.
 * @type {!Array.<!Array>}
 * @private
 */
anychart.stockModule.scales.Scatter.MINOR_INTERVALS_ = [
  [anychart.enums.Interval.MILLISECOND, 1],
  [anychart.enums.Interval.MILLISECOND, 5],
  [anychart.enums.Interval.MILLISECOND, 20],
  [anychart.enums.Interval.MILLISECOND, 100],
  [anychart.enums.Interval.MILLISECOND, 500],
  [anychart.enums.Interval.SECOND, 2],
  [anychart.enums.Interval.SECOND, 10],
  [anychart.enums.Interval.SECOND, 30],
  [anychart.enums.Interval.MINUTE, 2],
  [anychart.enums.Interval.MINUTE, 10],
  [anychart.enums.Interval.MINUTE, 30],
  [anychart.enums.Interval.HOUR, 1],
  [anychart.enums.Interval.HOUR, 3],
  [anychart.enums.Interval.HOUR, 12],
  [anychart.enums.Interval.DAY, 1],
  [anychart.enums.Interval.WEEK, 1],
  [anychart.enums.Interval.MONTH, 1],
  [anychart.enums.Interval.MONTH, 1],
  [anychart.enums.Interval.QUARTER, 1],
  [anychart.enums.Interval.SEMESTER, 1],
  [anychart.enums.Interval.YEAR, 1],
  [anychart.enums.Interval.YEAR, 2]
];


/**
 * Array of major intervals, synced with RANGES_. Used by interval auto calculation.
 * @type {!Array.<!Array>}
 * @private
 */
anychart.stockModule.scales.Scatter.MAJOR_INTERVALS_ = [
  [anychart.enums.Interval.MILLISECOND, 5],
  [anychart.enums.Interval.MILLISECOND, 20],
  [anychart.enums.Interval.MILLISECOND, 100],
  [anychart.enums.Interval.MILLISECOND, 500],
  [anychart.enums.Interval.SECOND, 2],
  [anychart.enums.Interval.SECOND, 10],
  [anychart.enums.Interval.SECOND, 30],
  [anychart.enums.Interval.MINUTE, 2],
  [anychart.enums.Interval.MINUTE, 10],
  [anychart.enums.Interval.MINUTE, 30],
  [anychart.enums.Interval.HOUR, 1],
  [anychart.enums.Interval.HOUR, 3],
  [anychart.enums.Interval.HOUR, 12],
  [anychart.enums.Interval.DAY, 1],
  [anychart.enums.Interval.WEEK, 1],
  [anychart.enums.Interval.MONTH, 1],
  [anychart.enums.Interval.MONTH, 2],
  [anychart.enums.Interval.QUARTER, 1],
  [anychart.enums.Interval.SEMESTER, 1],
  [anychart.enums.Interval.YEAR, 1],
  [anychart.enums.Interval.YEAR, 2],
  [anychart.enums.Interval.YEAR, 4]
];


//proto['getTicks'] = proto.getTicks;
//proto['getMajorIntervalUnit'] = proto.getMajorIntervalUnit;
//proto['getMajorIntervalUnitCount'] = proto.getMajorIntervalUnitCount;
//proto['getMinorIntervalUnit'] = proto.getMinorIntervalUnit;
//proto['getMinorIntervalUnitCount'] = proto.getMinorIntervalUnitCount;



/**
 * An interface that is used by Stock scales.
 * @interface
 */
anychart.stockModule.scales.IKeyIndexTransformer = function() {
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.stockModule.scales.IKeyIndexTransformer.prototype.getKeyByIndex = function(index) {
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.scales.IKeyIndexTransformer.prototype.getIndexByKey = function(key) {
};


//exports
(function() {
  var proto = anychart.stockModule.scales.Scatter.prototype;
  proto['getFullMinimum'] = proto.getFullMinimum;
  proto['getFullMaximum'] = proto.getFullMaximum;
  proto['getMinimum'] = proto.getMinimum;
  proto['getMaximum'] = proto.getMaximum;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
})();
