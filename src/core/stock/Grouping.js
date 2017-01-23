goog.provide('anychart.core.stock.Grouping');
goog.require('anychart.core.Base');
goog.require('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * Grouping settings class.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.stock.Grouping = function() {
  anychart.core.stock.Grouping.base(this, 'constructor');

  /**
   * Enabled state.
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;

  /**
   * Forced grouping mode.
   * @type {boolean}
   * @private
   */
  this.forced_ = false;

  /**
   * Ranges list.
   * @type {!Array.<!anychart.core.utils.DateTimeIntervalGenerator>}
   * @private
   */
  this.intervals_ = [];

  /**
   * Max points per screen.
   * @type {number}
   * @private
   */
  this.maxPoints_ = 500;

  /**
   * Min pixels per point
   * @type {number}
   * @private
   */
  this.minPixels_ = NaN;

  // /**
  //  * X determining mode.
  //  * @type {anychart.enums.XGroupingMode|Function}
  //  * @private
  //  */
  // this.xMode_ = anychart.enums.XGroupingMode.FIRST;

  /**
   * @type {!anychart.core.stock.Grouping.Level}
   * @private
   */
  this.currentInterval_ = {'unit': anychart.enums.Interval.MILLISECOND, 'count': 1};

  /**
   * @type {boolean}
   * @private
   */
  this.isGrouped_ = false;
};
goog.inherits(anychart.core.stock.Grouping, anychart.core.Base);


/**
 * @typedef {{
 *   unit: anychart.enums.Interval,
 *   count: number
 * }}
 */
anychart.core.stock.Grouping.Level;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.stock.Grouping.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * If the grouping is enabled.
 * @param {boolean=} opt_value
 * @return {anychart.core.stock.Grouping|boolean}
 */
anychart.core.stock.Grouping.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.enabled_;
};


/**
 * Getter/setter for forced grouping setting.
 * @param {boolean=} opt_value
 * @return {anychart.core.stock.Grouping|boolean}
 */
anychart.core.stock.Grouping.prototype.forced = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.forced_ != opt_value) {
      this.forced_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.forced_;
};


/**
 * Grouping levels getter/setter.
 * @param {Array.<anychart.core.stock.Grouping.Level|string>=} opt_value
 * @return {anychart.core.stock.Grouping|Array.<anychart.core.stock.Grouping.Level>}
 */
anychart.core.stock.Grouping.prototype.levels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.parseLevels_(opt_value);
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.exportLevels_();
};


/**
 * Getter/setter for maximum visible points count. Mutually exclusive with minPixPerPoint settings.
 * @param {number=} opt_value
 * @return {anychart.core.stock.Grouping|number}
 */
anychart.core.stock.Grouping.prototype.maxVisiblePoints = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = Math.max(2, anychart.utils.toNumber(opt_value));
    if (!isNaN(opt_value) && this.maxPoints_ != opt_value) {
      this.maxPoints_ = opt_value;
      this.minPixels_ = NaN;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.maxPoints_;
};


/**
 * Getter/setter for minimum pixels per point count. Mutually exclusive with maxVisiblePoints settings.
 * @param {number=} opt_value
 * @return {anychart.core.stock.Grouping|number}
 */
anychart.core.stock.Grouping.prototype.minPixPerPoint = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = Math.max(0.1, anychart.utils.toNumber(opt_value));
    if (!isNaN(opt_value) && this.minPixels_ != opt_value) {
      this.minPixels_ = opt_value;
      this.maxPoints_ = NaN;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.minPixels_;
};


// /**
//  * Getter/setter for X grouping mode.
//  * @param {(anychart.enums.XGroupingMode|Function)=} opt_value
//  * @return {anychart.core.stock.Grouping|anychart.enums.XGroupingMode|Function}
//  */
// anychart.core.stock.Grouping.prototype.xMode = function(opt_value) {
//   if (goog.isDef(opt_value)) {
//     opt_value = anychart.enums.normalizeXGroupingMode(opt_value);
//     if (this.xMode_ != opt_value) {
//       this.xMode_ = opt_value;
//       this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
//     }
//     return this;
//   }
//   return this.xMode_;
// };


/**
 * Returns current grouping level.
 * @return {anychart.core.stock.Grouping.Level}
 */
anychart.core.stock.Grouping.prototype.getCurrentDataInterval = function() {
  return this.currentInterval_;
};


/**
 * Returns true or false depending on current grouping state of the data.
 * @return {boolean}
 */
anychart.core.stock.Grouping.prototype.isGrouped = function() {
  return this.isGrouped_;
};


/**
 * Chooses proper interval for passed range.
 * @param {number} startKey
 * @param {number} endKey
 * @param {number} pixelWidth
 * @param {!anychart.core.stock.Registry} mainRegistry
 * @return {?anychart.core.utils.DateTimeIntervalGenerator}
 */
anychart.core.stock.Grouping.prototype.chooseInterval = function(startKey, endKey, pixelWidth, mainRegistry) {
  var range = endKey - startKey;
  var mainRegistrySelection = mainRegistry.getSelection(startKey, endKey);
  var originalPointsCount = (mainRegistrySelection.lastIndex - mainRegistrySelection.firstIndex + 1) || 0;
  var minDistance = mainRegistrySelection.minDistance;
  var targetPointsCountMax = isNaN(this.maxPoints_) ? (pixelWidth / this.minPixels_) : this.maxPoints_;
  var index = -1;
  if (this.enabled_ && this.intervals_.length > 0 && minDistance && (this.forced_ || (originalPointsCount > targetPointsCountMax))) {
    index = this.getAcceptableIntervalIndex_(range / targetPointsCountMax, this.getFirstIntervalIndex_(minDistance));
  }
  var result;
  if (index < 0) {
    result = null;
    this.currentInterval_ = minDistance ?
        anychart.utils.estimateInterval(minDistance) :
        {'unit': anychart.enums.Interval.MILLISECOND, 'count': 1};
  } else {
    result = this.intervals_[index];
    this.currentInterval_ = this.exportLevel_(result);
  }
  this.isGrouped_ = !!result;
  return result;
};


/**
 * Returns aligned boundaries. Currently unused, but should remain.
 * @param {!anychart.core.stock.Registry} mainRegistry
 * @param {number} pixelWidth
 * @return {Array.<number>}
 */
anychart.core.stock.Grouping.prototype.getMaxBoundaries = function(mainRegistry, pixelWidth) {
  var registryBounds = mainRegistry.getBoundariesInfo();
  var startKey = registryBounds[0];
  var endKey = registryBounds[1];
  var result = [registryBounds[2], registryBounds[3]];
  if (!isNaN(startKey) && !isNaN(endKey) && endKey > startKey) {
    var range = endKey - startKey;
    var mainRegistrySelection = mainRegistry.getSelection(startKey, endKey);
    var originalPointsCount = (mainRegistrySelection.lastIndex - mainRegistrySelection.firstIndex + 1) || 0;
    var minDistance = mainRegistrySelection.minDistance;
    var targetPointsCountMax = isNaN(this.maxPoints_) ? (pixelWidth / this.minPixels_) : this.maxPoints_;
    if (this.enabled_ && this.intervals_.length > 0 && minDistance && (this.forced_ || (originalPointsCount > targetPointsCountMax))) {
      var firstIndex = this.getFirstIntervalIndex_(minDistance);
      var lastIndex = this.getAcceptableIntervalIndex_(range / targetPointsCountMax, firstIndex);
      if (lastIndex >= 0) {
        if (this.forced_) {
          result = this.intervals_[firstIndex].getAlignedBoundaries(startKey, endKey);
          firstIndex++;
        }
        for (var i = firstIndex; i <= lastIndex; i++) {
          var levelBounds = this.intervals_[i].getAlignedBoundaries(startKey, endKey);
          // console.log(this.intervals_[i].getHash(), new Date(levelBounds[0]), new Date(levelBounds[1]));
          result[0] = Math.min(result[0], levelBounds[0]);
          result[1] = Math.max(result[1], levelBounds[1]);
        }
      }
    }
  }
  return result;
};


/**
 * Returns an index of the first interval that can be used for approximation due to min distance between points.
 * @param {number} minDistance
 * @return {number}
 * @private
 */
anychart.core.stock.Grouping.prototype.getFirstIntervalIndex_ = function(minDistance) {
  var first = 0, len = this.intervals_.length;
  while (first < len && this.intervals_[first].getRange() <= minDistance) {
    first++;
  }
  return Math.max(first - 1, 0);
};


/**
 * Returns first interval that has a point range larger or equal to the minAcceptableRange
 * @param {number} minAcceptableRange
 * @param {number=} opt_first
 * @return {number}
 * @private
 */
anychart.core.stock.Grouping.prototype.getAcceptableIntervalIndex_ = function(minAcceptableRange, opt_first) {
  var first = opt_first || 0;
  var len = this.intervals_.length;
  var result = -1;
  for (var i = first; i < len; i++) {
    var interval = this.intervals_[i];
    if (interval.getRange() >= minAcceptableRange) {
      result = i;
      break;
    }
  }
  // we choose the largest of existing grouping levels that are larger than the original data
  if (result < 0 && first < len)
    result = len - 1;
  return result;
};


/**
 * Parses and applies passed levels array.
 * @param {Array.<anychart.core.stock.Grouping.Level|string>} intervals
 * @private
 */
anychart.core.stock.Grouping.prototype.parseLevels_ = function(intervals) {
  this.intervals_.length = 0;
  if (goog.isArray(intervals)) {
    var hashes = {};
    for (var i = 0; i < intervals.length; i++) {
      var intervalObj = intervals[i];
      var unit, count;
      if (goog.isString(intervalObj)) {
        unit = intervalObj;
        count = 1;
      } else if (goog.isObject(intervalObj)) {
        unit = String(intervalObj['unit']);
        count = anychart.utils.normalizeToNaturalNumber(intervalObj['count'], 1, false);
      }
      if (unit) {
        var interval = new anychart.core.utils.DateTimeIntervalGenerator(unit, /** @type {number} */(count));
        var hash = interval.getHash();
        if (!(hash in hashes)) {
          hashes[hash] = true;
          this.intervals_.push(interval);
        }
      }
    }
    goog.array.sort(this.intervals_, anychart.core.utils.DateTimeIntervalGenerator.comparator);
  }
};


/**
 * Returns current levels list as an array of objects.
 * @return {Array.<anychart.core.stock.Grouping.Level>}
 * @private
 */
anychart.core.stock.Grouping.prototype.exportLevels_ = function() {
  var result = [];
  for (var i = 0; i < this.intervals_.length; i++) {
    var interval = this.intervals_[i];
    result.push(this.exportLevel_(interval));
  }
  return result;
};


/**
 * Exports passed interval.
 * @param {!anychart.core.utils.DateTimeIntervalGenerator} interval
 * @return {!anychart.core.stock.Grouping.Level}
 * @private
 */
anychart.core.stock.Grouping.prototype.exportLevel_ = function(interval) {
  return {
    'unit': interval.getUnit(),
    'count': interval.getCount()
  };
};


/** @inheritDoc */
anychart.core.stock.Grouping.prototype.disposeInternal = function() {
  // delete this.xMode_;
  anychart.core.stock.Grouping.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.stock.Grouping.prototype.serialize = function() {
  var json = anychart.core.stock.Grouping.base(this, 'serialize');

  json['enabled'] = this.enabled_;
  json['forced'] = this.forced_;
  json['levels'] = this.exportLevels_();
  json['maxVisiblePoints'] = isNaN(this.maxPoints_) ? null : this.maxPoints_;
  json['minPixPerPoint'] = isNaN(this.minPixels_) ? null : this.minPixels_;
  // if (goog.isFunction(this.xMode_)) {
  //   anychart.core.reporting.warning(
  //       anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //       null,
  //       ['Stock grouping xMode']
  //   );
  // } else {
  //   json['x'_MODE] = this.xMode_;
  // }

  return json;
};


/** @inheritDoc */
anychart.core.stock.Grouping.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    this.enabled(!!arg0);
    return true;
  }
  if (goog.isArray(arg0)) {
    this.enabled(true);
    this.levels(arg0);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.stock.Grouping.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.stock.Grouping.base(this, 'setupByJSON', config, opt_default);

  this.enabled(config['enabled']);
  this.forced(config['forced']);
  this.levels(config['levels']);
  this.maxVisiblePoints(config['maxVisiblePoints']);
  this.minPixPerPoint(config['minPixPerPoint']);
  // this.xMode(config['x'_MODE]);
};


//exports
(function() {
  var proto = anychart.core.stock.Grouping.prototype;
  proto['enabled'] = proto.enabled;
  proto['forced'] = proto.forced;
  proto['levels'] = proto.levels;
  // proto['xMode'] = proto.xMode;
  proto['maxVisiblePoints'] = proto.maxVisiblePoints;
  proto['minPixPerPoint'] = proto.minPixPerPoint;
  proto['getCurrentDataInterval'] = proto.getCurrentDataInterval;
  proto['isGrouped'] = proto.isGrouped;
})();
