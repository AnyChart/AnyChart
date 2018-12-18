goog.provide('anychart.stockModule.scales.IKeyIndexTransformer');
goog.provide('anychart.stockModule.scales.Scatter');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.scales.IXScale');
goog.require('anychart.stockModule.scales.ExplicitTicksIterator');
goog.require('anychart.stockModule.scales.ScatterTicksIterator');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.math');



//endregion
//region -- Constructor.
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
   * Minor ticks count.
   * @type {number}
   * @private
   */
  this.ticksCount_ = 6;

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
   * @type {Object.<string, {count: number, range: number}>}
   * @protected
   */
  this.intervals = {};

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
   * Major ticks for the scale.
   * @type {anychart.stockModule.scales.ExplicitTicksIterator}
   * @protected
   */
  this.explicitTicksIterator = null;

  /**
   * Ticks settings.
   * @type {anychart.stockModule.scales.Scatter.TicksSettingsRep}
   * @private
   */
  this.ranges_ = [];

  /**
   *
   * @type {?Object}
   * @private
   */
  this.minGapRange_ = null;

  /**
   *
   * @type {?Object}
   * @private
   */
  this.maxGapRange_ = null;

  /**
   *
   * @type {anychart.stockModule.scales.Scatter.GapConfig}
   */
  this.minGapConfig = this.normalizeGapConfig_(null);

  /**
   *
   * @type {anychart.stockModule.scales.Scatter.GapConfig}
   */
  this.maxGapConfig = this.normalizeGapConfig_(null);

  this.ticks(anychart.stockModule.scales.Scatter.DEFAULT_TICKS_);
};
goog.inherits(anychart.stockModule.scales.Scatter, anychart.core.Base);


//endregion
//region -- Type definitions.
/**
 * @typedef {{
 *    min: number,
 *    max: number,
 *    fullMin: number,
 *    fullMax: number,
 *    ticksCount: number,
 *    scale: anychart.stockModule.scales.Scatter
 * }}
 */
anychart.stockModule.scales.Scatter.TicksCallbackContext;


/**
 * @typedef {function(this: anychart.stockModule.scales.Scatter.TicksCallbackContext,
 * anychart.stockModule.scales.Scatter.TicksCallbackContext): Array.<(number|{value: number, isMinor: boolean})>}
 */
anychart.stockModule.scales.Scatter.TicksCallback;


/**
 * @typedef {Array<{minor:(string|{unit:anychart.enums.Interval,count:number}),major:(string|{unit:anychart.enums.Interval,count:number})}>}
 */
anychart.stockModule.scales.Scatter.TicksSettings;


/**
 * @typedef {Array<{range:number,minorUnit:anychart.enums.Interval,minorCount:number,majorUnit:anychart.enums.Interval,majorCount:number}>}
 */
anychart.stockModule.scales.Scatter.TicksSettingsRep;


/**
 * @typedef {{
 *    unitType: anychart.enums.Interval,
 *    unitCount: number,
 *    intervalsCount: number
 * }}
 */
anychart.stockModule.scales.Scatter.GapConfig;


//endregion
//region -- Signals.
/**
 * Supported signals set.
 * @type {number}
 */
anychart.stockModule.scales.Scatter.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEED_UPDATE_TICK_DEPENDENT |
    anychart.Signal.NEED_UPDATE_FULL_RANGE_ITEMS |
    anychart.Signal.DATA_CHANGED; // This signal means that gaps were changed. DVF-3076.


//endregion
/**
 * Return scale type.
 * @return {anychart.enums.ScaleTypes}
 */
anychart.stockModule.scales.Scatter.prototype.getType = function() {
  return anychart.enums.ScaleTypes.STOCK_SCATTER_DATE_TIME;
};


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
 * Desired minor ticks count.
 * @param {number=} opt_value
 * @return {number|anychart.stockModule.scales.Scatter}
 */
anychart.stockModule.scales.Scatter.prototype.ticksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, this.ticksCount_, false);
    if (this.ticksCount_ != val) {
      this.ticksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
    }
    return this;
  }
  return this.ticksCount_;
};


/**
 *
 * @param {?anychart.stockModule.scales.Scatter.GapConfig} val - Config to normalize.
 * @return {anychart.stockModule.scales.Scatter.GapConfig} - Normalized config.
 * @private
 */
anychart.stockModule.scales.Scatter.prototype.normalizeGapConfig_ = function(val) {
  /*
  This variable is always an instance of chart here because stock scroller doesn't have
  xScale() method exported, that's why this method is always called from chart's xScale.
  */
  var chart = /** @type {anychart.stockModule.Chart} */ (this.keyIndexTransformer);
  var defaultIntervalConfig = chart.grouping().getCurrentDataInterval();

  var norm = {
    'unitType': defaultIntervalConfig['unit'],
    'unitCount': defaultIntervalConfig['count'],
    'intervalsCount': 0
  };

  if (goog.typeOf(val) == 'object') {
    if (goog.isDefAndNotNull(val['unitType']))
      norm['unitType'] = anychart.enums.normalizeInterval(val['unitType']);
    if (val['unitCount'] > 0) //yes, undefined, zero and negative values are not allowed here.
      norm['unitCount'] = +val['unitCount'];
    if (val['intervalsCount'])
      norm['intervalsCount'] = Math.max(0, val['intervalsCount']);
  }
  return norm;
};


/**
 *
 * @param {anychart.stockModule.scales.Scatter.GapConfig=} opt_value - Gap config to set.
 *  NOTE: In config, if unitType or unitCount is not set, value will be taken from
 *  chart.grouping().getCurrentDataInterval(). If intervalsCount is not set, gap will be removed.
 * @return {anychart.stockModule.scales.Scatter.GapConfig|anychart.stockModule.scales.Scatter} - Value or itself for chaining.
 */
anychart.stockModule.scales.Scatter.prototype.minimumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = this.normalizeGapConfig_(opt_value);
    if (!goog.object.equals(this.minGapConfig, opt_value)) {
      this.minGapConfig = opt_value;
      this.dispatchSignal(anychart.Signal.DATA_CHANGED);
      return this;
    }
  }
  return this.minGapConfig;
};


/**
 *
 * @param {anychart.stockModule.scales.Scatter.GapConfig=} opt_value - Gap config to set.
 *  NOTE: In config, if unitType or unitCount is not set, value will be taken from
 *  chart.grouping().getCurrentDataInterval(). If intervalsCount is not set, gap will be removed.
 * @return {anychart.stockModule.scales.Scatter.GapConfig|anychart.stockModule.scales.Scatter} - Value or itself for chaining.
 */
anychart.stockModule.scales.Scatter.prototype.maximumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = this.normalizeGapConfig_(opt_value);
    if (!goog.object.equals(this.maxGapConfig, opt_value)) {
      this.maxGapConfig = opt_value;
      this.dispatchSignal(anychart.Signal.DATA_CHANGED);
      return this;
    }
  }
  return this.maxGapConfig;
};


/**
 * Sets minimum gap range to determine dummy data min interval.
 * @param {?number} min - Min value. Null value meas that maxGapRange_ must be nullified, otherwise opt_max value must be set.
 * @param {number=} opt_max - Max value in dummy data gap.
 */
anychart.stockModule.scales.Scatter.prototype.setMinGapRange = function(min, opt_max) {
  if (goog.isNumber(min)) {
    this.minGapRange_ = {min: min, max: opt_max};
  } else {
    this.minGapRange_ = null;
  }
};


/**
 * Sets maximum gap range to determine dummy data max interval.
 * @param {?number} min - Min value. Null value meas that maxGapRange_ must be nullified, otherwise opt_max value must be set.
 * @param {number=} opt_max - Max value in dummy data gap.
 */
anychart.stockModule.scales.Scatter.prototype.setMaxGapRange = function(min, opt_max) {
  if (goog.isNumber(min)) {
    this.maxGapRange_ = {min: min, max: opt_max};
  } else {
    this.maxGapRange_ = null;
  }
};


/**
 * Decides whether passed value belongs to dummy interval.
 * @param {number} val - Value to check.
 * @return {boolean}
 */
anychart.stockModule.scales.Scatter.prototype.isValueInDummyRange = function(val) {
  /*
    NOTE: val < this.minGapRange_.max is because this.minGapRange_.max belongs to real data as well as
          this.maxGapRange_.min belongs to real data as well.
  */
  return !!(
      (this.minGapRange_ && val < this.minGapRange_.max) ||
      (this.maxGapRange_ && val > this.maxGapRange_.min)
  );
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
 * @return {anychart.stockModule.scales.ScatterTicksIterator|anychart.stockModule.scales.ExplicitTicksIterator}
 */
anychart.stockModule.scales.Scatter.prototype.getTicks = function() {
  this.calculate();
  return this.ticksCallback_ ? this.explicitTicksIterator : this.ticksIterator;
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

  var pointsCount = this.maxIndex - this.minIndex + 1;
  var error = pointsCount * 0.25;
  var arr = [];

  goog.object.forEach(this.intervals, function(interval) {
    if (interval.count > error) {
      arr.push(interval);
    }
  });

  var targetInterval = goog.array.reduce(arr, function(rval, item) {
    var firstInt = anychart.utils.getIntervalRange(rval.unit, 1);
    var secondInt = anychart.utils.getIntervalRange(item.unit, 1);
    var maxInt, minInt, maxRange, minRange;
    if (firstInt >= secondInt) {
      maxInt = rval;
      minInt = item;
      maxRange = firstInt;
      minRange = secondInt;
    } else {
      maxInt = item;
      minInt = rval;
      maxRange = secondInt;
      minRange = firstInt;
    }

    return maxRange / minRange > 60 ? maxInt : minInt;
  }, arr[0]);

  var range;
  if (targetInterval) {
    range = targetInterval.range;
    var intervalRange = anychart.utils.getIntervalRange(targetInterval.unit, 1);
    goog.object.forEach(this.intervals, function(interval) {
      if (interval != targetInterval) {
        range += interval.count * intervalRange;
      }
    });
  } else {
    range = Math.abs(dataMaxKey - dataMinKey);
  }

  var minorTickRange = Math.abs(range) / this.ticksCount_;

  var last = this.ranges_.length - 1;
  var row;
  for (var i = 0; i < last; i++) {
    if (minorTickRange <= this.ranges_[i].range) {
      row = this.ranges_[i];
      break;
    }
  }
  // Math.ceil(range / (365 * 24 * 60 * 60 * 1000)) is always >= 0.5, because the last
  // this.RANGES is 2 years, so there shouldn't be a situation when interval is 0.
  if (!row) {
    row = this.ranges_[last];
    // var count = Math.ceil(minorTickRange / (365 * 24 * 60 * 60 * 1000));
    // row = {
    //   range: anychart.utils.getIntervalRange(anychart.enums.Interval.YEAR, count / 2),
    //   minorUnit: anychart.enums.Interval.YEAR,
    //   minorCount: count / 2,
    //   majorUnit: anychart.enums.Interval.YEAR,
    //   majorCount: count
    // };
  }

  if (this.ticksCallback_) {
    var context = {
      'fullMin': this.dataFullMinKey,
      'fullMax': this.dataFullMaxKey,
      'min': dataMinKey,
      'max': dataMaxKey,
      'ticksCount': this.ticksCount_,
      'scale': this
    };
    var customTicks = this.ticksCallback_.call(context, context);
    this.explicitTicksIterator.setup(customTicks);
  } else {
    this.ticksIterator.setup(
        dataMinKey,
        dataMaxKey,
        anychart.utils.getIntervalFromInfo(row.majorUnit, row.majorCount),
        anychart.utils.getIntervalFromInfo(row.minorUnit, row.minorCount),
        this.dataFullMinKey);
  }

  this.majorUnit_ = row.majorUnit;
  this.majorUnitCount_ = row.majorCount;
  this.minorUnit_ = row.minorUnit;
  this.minorUnitCount_ = row.minorCount;

  this.consistent = true;
};


/**
 * Ensures that the ticks iterator is created.
 */
anychart.stockModule.scales.Scatter.prototype.ensureTicksIteratorCreated = function() {
  if (!this.ticksIterator)
    this.ticksIterator = new anychart.stockModule.scales.ScatterTicksIterator();
  if (!this.explicitTicksIterator && this.ticksCallback_)
    this.explicitTicksIterator = new anychart.stockModule.scales.ExplicitTicksIterator();
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
 * @param {Object.<string, {count: number, range: number}>} intervals
 */
anychart.stockModule.scales.Scatter.prototype.setCurrentRange = function(startKey, endKey, unit, count, intervals) {
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
  this.intervals = intervals;
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
 * @param {anychart.stockModule.scales.Scatter.TicksCallback|anychart.stockModule.scales.Scatter.TicksSettings=} opt_value .
 * @return {anychart.stockModule.scales.Scatter.TicksCallback|anychart.stockModule.scales.Scatter.TicksSettings|anychart.stockModule.scales.Scatter}
 */
anychart.stockModule.scales.Scatter.prototype.ticks = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value)) {
      this.ticksCallback_ = opt_value;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
    } else {
      var value = this.normalizeTicks_(opt_value);
      var len = value.length;
      var same = len && (len == this.ranges_.length);
      for (var i = 0; same && i < len; i++) {
        var rangeA = value[i];
        var rangeB = this.ranges_[i];
        same = (
            rangeA.range == rangeB.range &&
            rangeA.minorUnit == rangeB.minorUnit &&
            rangeA.minorCount == rangeB.minorCount &&
            rangeA.majorUnit == rangeB.majorUnit &&
            rangeA.majorCount == rangeB.majorCount);
      }
      if (!same) {
        this.ranges_ = value;
        this.ticksCallback_ = null;
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
      }
    }
    return this;
  }
  return /** @type {anychart.stockModule.scales.Scatter.TicksCallback|anychart.stockModule.scales.Scatter.TicksSettings} */(this.ticksCallback_ ?
      this.ticksCallback_ :
      goog.array.map(this.ranges_, function(item) {
        return {
          'minor': {
            'unit': item.minorUnit,
            'count': item.minorCount
          },
          'major': {
            'unit': item.majorUnit,
            'count': item.majorCount
          }
        };
      }));
};


/**
 * Normalizes anychart.stockModule.scales.Scatter.TicksSettings-like representation to anychart.stockModule.scales.Scatter.TicksSettingsRep.
 * @param {*} value
 * @return {anychart.stockModule.scales.Scatter.TicksSettingsRep}
 * @private
 */
anychart.stockModule.scales.Scatter.prototype.normalizeTicks_ = function(value) {
  var res = [];
  if (goog.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      var val = value[i];
      if (goog.isObject(val)) {
        var minor = this.normalizeTicksRow_(val['minor']);
        var major = this.normalizeTicksRow_(val['major']);
        if (minor && major) {
          res.push({
            range: anychart.utils.getIntervalRange(/** @type {anychart.enums.Interval} */(minor[0]), /** @type {number} */(minor[1])),
            minorUnit: /** @type {anychart.enums.Interval} */(minor[0]),
            minorCount: /** @type {number} */(minor[1]),
            majorUnit: /** @type {anychart.enums.Interval} */(major[0]),
            majorCount: /** @type {number} */(major[1])
          });
        }
      }
    }
    res.sort(function(a, b) {
      return a.range - b.range;
    });
  }
  return res;
};


/**
 * Normalizes particular ticks array row.
 * @param {*} val
 * @return {?Array<anychart.enums.Interval|number>} Array of [unit, count] or null.
 * @private
 */
anychart.stockModule.scales.Scatter.prototype.normalizeTicksRow_ = function(val) {
  var unit = null, count;
  if (goog.isString(val)) {
    unit = anychart.enums.normalizeInterval(val, null);
    count = 1;
  } else if (goog.isObject(val)) {
    unit = anychart.enums.normalizeInterval(val['unit'], null);
    count = anychart.utils.normalizeToNaturalNumber(val['count']);
  }
  return unit ? [unit, count] : null;
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getKeyByIndex = function(index) {
  return this.keyIndexTransformer.getKeyByIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.scales.Scatter.prototype.getIndexByKey = function(key) {
  return this.keyIndexTransformer.getIndexByKey(key);
};



/**
 * Array of default tick settings.
 * @type {anychart.stockModule.scales.Scatter.TicksSettings}
 * @private
 */
anychart.stockModule.scales.Scatter.DEFAULT_TICKS_ = [
  {
    'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 1},
    'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 5}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 5},
    'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 20}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 20},
    'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 100}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 100},
    'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 500}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 500},
    'major': {'unit': anychart.enums.Interval.SECOND, 'count': 2}
  },
  {
    'minor': {'unit': anychart.enums.Interval.SECOND, 'count': 2},
    'major': {'unit': anychart.enums.Interval.SECOND, 'count': 10}
  },
  {
    'minor': {'unit': anychart.enums.Interval.SECOND, 'count': 10},
    'major': {'unit': anychart.enums.Interval.SECOND, 'count': 30}
  },
  {
    'minor': {'unit': anychart.enums.Interval.SECOND, 'count': 30},
    'major': {'unit': anychart.enums.Interval.MINUTE, 'count': 2}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MINUTE, 'count': 2},
    'major': {'unit': anychart.enums.Interval.MINUTE, 'count': 10}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MINUTE, 'count': 10},
    'major': {'unit': anychart.enums.Interval.MINUTE, 'count': 30}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MINUTE, 'count': 30},
    'major': {'unit': anychart.enums.Interval.HOUR, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.HOUR, 'count': 1},
    'major': {'unit': anychart.enums.Interval.HOUR, 'count': 3}
  },
  {
    'minor': {'unit': anychart.enums.Interval.HOUR, 'count': 3},
    'major': {'unit': anychart.enums.Interval.HOUR, 'count': 12}
  },
  {
    'minor': {'unit': anychart.enums.Interval.HOUR, 'count': 12},
    'major': {'unit': anychart.enums.Interval.DAY, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.DAY, 'count': 1},
    'major': {'unit': anychart.enums.Interval.WEEK, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.DAY, 'count': 2},
    'major': {'unit': anychart.enums.Interval.WEEK, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.WEEK, 'count': 1},
    'major': {'unit': anychart.enums.Interval.MONTH, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.MONTH, 'count': 1},
    'major': {'unit': anychart.enums.Interval.QUARTER, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.QUARTER, 'count': 1},
    'major': {'unit': anychart.enums.Interval.SEMESTER, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.SEMESTER, 'count': 1},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 1}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 1},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 2}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 2},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 4}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 3},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 6}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 4},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 8}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 5},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 10}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 6},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 12}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 7},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 14}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 8},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 16}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 9},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 18}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 10},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 20}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 20},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 40}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 25},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 100}
  },
  {
    'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 100},
    'major': {'unit': anychart.enums.Interval.YEAR, 'count': 500}
  }
];



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
  proto['ticks'] = proto.ticks;
  proto['ticksCount'] = proto.ticksCount;
  proto['getFullMinimum'] = proto.getFullMinimum;
  proto['getFullMaximum'] = proto.getFullMaximum;
  proto['getMinimum'] = proto.getMinimum;
  proto['getMaximum'] = proto.getMaximum;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
  proto['minimumGap'] = proto.minimumGap;
  proto['maximumGap'] = proto.maximumGap;
})();
