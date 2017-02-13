goog.provide('anychart.core.series.Cartesian');
goog.require('anychart.core.BubblePoint');
goog.require('anychart.core.SeriesPoint');
goog.require('anychart.core.series.Base');
goog.require('anychart.core.utils.DrawingPlanIterator');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.IInteractiveSeries');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Base}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.core.series.Cartesian = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.Cartesian.base(this, 'constructor', chart, plot, type, config);

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  /**
   * If the series should expect drawing plan data to be sorted by X field.
   * @type {boolean}
   * @private
   */
  this.sortedMode_ = sortedMode;

  this.data(null);
};
goog.inherits(anychart.core.series.Cartesian, anychart.core.series.Base);


//region --- Typedefs
//------------------------------------------------------------------------------
//
//  Typedefs
//
//------------------------------------------------------------------------------
/**
 * @typedef {{
 *   series: anychart.core.series.Cartesian,
 *   data: Array.<Object>,
 *   stacked: (boolean|undefined),
 *   firstIndex: (number|undefined),
 *   lastIndex: (number|undefined),
 *   hasPointMarkers: (boolean|undefined),
 *   hasPointLabels: (boolean|undefined),
 *   hasPointErrors: (boolean|undefined),
 *   hasPointOutliers: (boolean|undefined),
 *   xHashMap: (Object.<number>|undefined),
 *   xArray: (Array|undefined)
 * }}
 */
anychart.core.series.Cartesian.DrawingPlan;


//endregion
//region --- Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @protected
 */
anychart.core.series.Cartesian.prototype.rawData;


/**
 * @type {!anychart.data.View}
 * @protected
 */
anychart.core.series.Cartesian.prototype.dataInternal;


/**
 * @type {anychart.data.View}
 * @protected
 */
anychart.core.series.Cartesian.prototype.parentView;


/**
 * @type {goog.Disposable}
 * @protected
 */
anychart.core.series.Cartesian.prototype.parentViewToDispose;


/**
 * Selection mode.
 * @type {?anychart.enums.SelectionMode}
 * @private
 */
anychart.core.series.Cartesian.prototype.selectionMode_;


/**
 * Selection mode.
 * @type {anychart.enums.HoverMode}
 * @private
 */
anychart.core.series.Cartesian.prototype.hoverMode_;


/**
 * @type {anychart.core.utils.SeriesPointContextProvider}
 * @private
 */
anychart.core.series.Cartesian.prototype.pointProvider_;


//endregion
//region --- Series setup
//----------------------------------------------------------------------------------------------------------------------
//
//  Series setup
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Cartesian.prototype.applyDefaultsToElements = function(defaults, opt_resetLegendItem, opt_default) {
  anychart.core.series.Cartesian.base(this, 'applyDefaultsToElements', defaults, opt_resetLegendItem, opt_default);

  this.selectionMode(defaults['selectionMode']);
};


//endregion
//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Cartesian.prototype.getCategoryWidth = function() {
  return (this.xScale().getPointWidthRatio() || (this.xScale().getZoomFactor() / this.getIterator().getRowsCount())) *
      (this.getOption('isVertical') ? this.pixelBoundsCache.height : this.pixelBoundsCache.width);
};


/**
 * Getter/setter for xScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.series.Cartesian)} Series X Scale or itself for chaining call.
 */
anychart.core.series.Cartesian.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.Base))
      opt_value = null;
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.scaleInvalidated, this);
      this.xScale_ = opt_value;
      if (this.xScale_)
        this.xScale_.listenSignals(this.scaleInvalidated, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_ || /** @type {anychart.scales.Base} */(this.chart.xScale());
  }
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.getXScale = function() {
  return /** @type {anychart.scales.Base} */(this.xScale());
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.getPointState = function(index) {
  return this.state.getPointStateByIndex(index);
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.getSeriesState = function() {
  var state = this.state.getSeriesState();
  if (state || this.isDiscreteBased() || this.hoverMode() != anychart.enums.HoverMode.SINGLE) return state;
  if (this.state.hasPointState(anychart.PointState.SELECT))
    return anychart.PointState.SELECT;
  else if (this.state.hasPointState(anychart.PointState.HOVER))
    return anychart.PointState.HOVER;
  return anychart.PointState.NORMAL;
};


//endregion
//region --- Drawing data
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing data
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Cartesian.prototype.prepareData = function() {
  if (this.data().checkFieldExist('selected')) {
    var iterator = this.getDetachedIterator();
    var indexes = [];
    while (iterator.advance()) {
      if (iterator.get('selected'))
        indexes.push(iterator.getIndex());
    }
    if (indexes.length) {
      this.selectPoint(indexes);
    }
  }
  anychart.core.series.Cartesian.base(this, 'prepareData');
};


//endregion
//region --- Path manager interface methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Path manager interface methods
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Cartesian.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings) {
  var source = opt_baseColor || this.getOption('color') || 'blue';
  if (this.supportsPointSettings()) {
    var iterator = !!opt_ignorePointSettings ? this.getDetachedIterator() : this.getIterator();
    return {
      'index': iterator.getIndex(),
      'sourceColor': source,
      'iterator': iterator
    };
  }
  return {
    'sourceColor': source
  };
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var source = this.getAutoHatchFill();
  if (this.supportsPointSettings()) {
    var iterator = !!opt_ignorePointSettings ? this.getDetachedIterator() : this.getIterator();
    return {
      'index': iterator.getIndex(),
      'sourceHatchFill': source,
      'iterator': iterator
    };
  }
  return {
    'sourceHatchFill': source
  };
};


//endregion
//region --- Working with data
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series mapping.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.core.series.Cartesian|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.series.Cartesian.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData !== opt_value) {
      this.rawData = opt_value;
      goog.dispose(this.parentViewToDispose); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.parentView = this.parentViewToDispose = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.parentView = this.parentViewToDispose = opt_value.mapAs();
      else
        this.parentView = (this.parentViewToDispose = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.dataInternal = this.parentView;
      this.dataInternal.listenSignals(this.dataInvalidated_, this);
      // DATA is supported only in Bubble, so we invalidate only for it.
      this.invalidate(anychart.ConsistencyState.SERIES_POINTS | anychart.ConsistencyState.SERIES_DATA,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
    }
    return this;
  }
  return this.dataInternal;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.series.Cartesian.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS | anychart.ConsistencyState.SERIES_DATA,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Returns a new reset iterator that is not attached to the series.
 * @return {!anychart.data.IIterator} New iterator.
 */
anychart.core.series.Cartesian.prototype.getDetachedIterator = function() {
  if (this.drawingPlan)
    return new anychart.core.utils.DrawingPlanIterator(this);
  else
    return this.data().getIterator();
};


/**
 * Returns stacked value. Published method.
 * @param {number} index
 * @return {number|undefined}
 */
anychart.core.series.Cartesian.prototype.getBubblePixelRadius = function(index) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    if (point) {
      return /** @type {number|undefined} */(point.meta['size']);
    } else {
      return undefined;
    }
  }
  return this.data().meta(index, 'size');
};


/**
 * Returns stacked zero. Published method.
 * @param {number} index
 * @return {*}
 */
anychart.core.series.Cartesian.prototype.getStackedZero = function(index) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    if (point) {
      return this.drawingPlan.stacked ? point.meta['stackedZero'] : 0;
    } else {
      return undefined;
    }
  }
  return this.data().meta(index, 'zero');
};


/**
 * Returns stacked value. Published method.
 * @param {number} index
 * @return {*}
 */
anychart.core.series.Cartesian.prototype.getStackedValue = function(index) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    if (point) {
      return this.drawingPlan.stacked ? point.meta['stackedValue'] : point.data['value'];
    } else {
      return undefined;
    }
  }
  return this.data().meta(index, 'value');
};


/**
 * Gets asked value.
 * @param {number} index
 * @param {string} name
 * @return {*}
 */
anychart.core.series.Cartesian.prototype.getValueInternal = function(index, name) {
  if (this.drawingPlan) {
    var res = undefined;
    var point = this.drawingPlan.data[index];
    if (point) {
      var data = point.data;
      if (name in data) {
        res = data[name];
      } else {
        var rawIndex = point.meta['rawIndex'];
        var row;
        var view = /** @type {anychart.data.View} */(this.data());
        if (goog.isDef(rawIndex))
          row = view.row(rawIndex);
        else
          return res;//undefined
        res = view.getRowMapping(rawIndex).getInternal(row, rawIndex, name);
        data[name] = res;
      }
    }
    return res;
  }
  return this.data().get(index, name);
};


/**
 * Sets value.
 * @param {number} index
 * @param {string} name
 * @param {*} value
 */
anychart.core.series.Cartesian.prototype.setValueInternal = function(index, name, value) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    index = point && point.meta['rawIndex'];
  }
  this.data().set(index, name, value);
};


/**
 * Excludes points at passed indexes.
 * @param {number|Array.<number>} indexes Point indexes.
 * @return {boolean} If anything changed.
 */
anychart.core.series.Cartesian.prototype.excludePoint = function(indexes) {
  if (!this.excludedPoints_)
    this.excludedPoints_ = [];
  if (!goog.isArray(indexes))
    indexes = [indexes];
  var doInvalidate = false;
  for (var i = 0; i < indexes.length; i++) {
    doInvalidate = goog.array.binaryInsert(this.excludedPoints_, indexes[i]) || doInvalidate;
  }
  if (doInvalidate)
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
  return doInvalidate;
};


/**
 * Includes excluded points at passed indexes.
 * @param {number|Array.<number>} indexes Point indexes.
 * @return {boolean} If anything changed.
 */
anychart.core.series.Cartesian.prototype.includePoint = function(indexes) {
  if (!this.excludedPoints_)
    return false;
  if (!goog.isArray(indexes))
    indexes = [indexes];
  var doInvalidate = false;
  for (var i = 0; i < indexes.length; i++) {
    doInvalidate = goog.array.binaryRemove(this.excludedPoints_, indexes[i]) || doInvalidate;
  }
  if (doInvalidate)
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
  return doInvalidate;
};


/**
 * Returns an array of excluded points.
 * @return {Array.<number>}
 */
anychart.core.series.Cartesian.prototype.getExcludedIndexesInternal = function() {
  return this.excludedPoints_ || [];
};


/**
 * Returns an array of excluded points.
 * @return {Array.<anychart.core.Point>}
 */
anychart.core.series.Cartesian.prototype.getExcludedPoints = function() {
  return goog.array.map(this.excludedPoints_ || [], this.getPoint, this);
};


/**
 * Keep only passed points.
 * @param {number|Array.<number>} indexes Point index.
 */
anychart.core.series.Cartesian.prototype.keepOnlyPoints = function(indexes) {
  this.excludedPoints_ ? this.excludedPoints_.length = 0 : this.excludedPoints_ = [];
  var pointsCount = this.getIterator().getRowsCount();
  for (var i = 0; i < pointsCount; i++) {
    this.excludedPoints_.push(i);
  }
  this.includePoint(indexes);
};


/**
 * Includes all points.
 * @return {boolean} If anything changed.
 */
anychart.core.series.Cartesian.prototype.includeAllPoints = function() {
  if (this.excludedPoints_ && this.excludedPoints_.length) {
    this.excludedPoints_.length = 0;
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


//endregion
//region --- Drawing plan related checkers
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing plan -related checkers
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Cartesian.prototype.planHasPointLabels = function() {
  return this.drawingPlan ? this.drawingPlan.hasPointLabels : true;
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.planHasPointMarkers = function() {
  return this.drawingPlan ? this.drawingPlan.hasPointMarkers : true;
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.planHasPointOutliers = function() {
  return this.drawingPlan ? this.drawingPlan.hasPointOutliers : true;
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.planHasPointErrors = function() {
  return this.drawingPlan ? this.drawingPlan.hasPointErrors : true;
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.planIsStacked = function() {
  return this.drawingPlan ? this.drawingPlan.stacked : true;
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.planIsXScaleInverted = function() {
  return /** @type {boolean} */(this.xScale().inverted());
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.isPointVisible = function(point) {
  var index = point.getIndex();
  return (index >= this.drawingPlan.firstIndex && index <= this.drawingPlan.lastIndex);
};


//endregion
//region --- Drawing plan generation
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing plan generation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {Array} data
 * @param {Function} dataPusher
 * @param {Function} xNormalizer
 * @param {Function} xMissingChecker
 * @param {string=} opt_nameField
 * @return {anychart.core.series.Cartesian.DrawingPlan}
 * @private
 */
anychart.core.series.Cartesian.prototype.getDrawingData_ = function(data, dataPusher, xNormalizer, xMissingChecker, opt_nameField) {
  // anychart.performance.start('Drawing plan calc');
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  var hasXErrors = false;
  var hasYErrors = false;
  var checkSize = this.isSizeBased();

  var additionalNames = [];
  if (checkSize) {
    additionalNames.push('size');
  }
  if (this.supportsOutliers()) {
    additionalNames.push('outliers');
  }
  if (this.supportsError()) {
    if (anychart.core.utils.Error.supportsErrorForScale(/** @type {anychart.scales.Base} */(this.xScale()))) {
      if (dataSource.checkFieldExist('xError')) {
        additionalNames.push('xError');
        hasXErrors = true;
      }
      if (dataSource.checkFieldExist('xLowerError')) {
        additionalNames.push('xLowerError');
        hasXErrors = true;
      }
      if (dataSource.checkFieldExist('xUpperError')) {
        additionalNames.push('xUpperError');
        hasXErrors = true;
      }
    }
    if (anychart.core.utils.Error.supportsErrorForScale(/** @type {anychart.scales.Base} */(this.yScale()))) {
      if (dataSource.checkFieldExist('valueError')) {
        additionalNames.push('valueError');
        hasYErrors = true;
      }
      if (dataSource.checkFieldExist('valueLowerError')) {
        additionalNames.push('valueLowerError');
        hasYErrors = true;
      }
      if (dataSource.checkFieldExist('valueUpperError')) {
        additionalNames.push('valueUpperError');
        hasYErrors = true;
      }
    }
  }
  if (opt_nameField && dataSource.checkFieldExist(opt_nameField))
    additionalNames.push(opt_nameField);

  while (iterator.advance()) {
    var xValue = xNormalizer(iterator.get('x'));
    if (xMissingChecker(xValue)) // we do not add missings for points that have undefined X
      continue;
    var pointData = {};
    pointData['x'] = xValue;
    var i, len, name, val, missing = false;
    var yValueNames = this.getYValueNames();
    for (i = 0, len = yValueNames.length; i < len; i++) {
      name = yValueNames[i];
      val = iterator.get(name);
      missing = missing || yScale.isMissing(val);
      pointData[name] = val;
    }
    for (i = 0, len = additionalNames.length; i < len; i++) {
      name = additionalNames[i];
      pointData[name] = iterator.get(name);
    }
    if (checkSize) {
      var size = anychart.utils.toNumber(pointData['size'] = iterator.get('size'));
      if (isNaN(size) || (size < 0 && !this.getOption('displayNegative')))
        missing = true;
    }

    var meta = {};
    meta['missing'] = missing ? anychart.core.series.PointAbsenceReason.VALUE_FIELD_MISSING : 0;
    meta['rawIndex'] = iterator.getIndex();

    var point = {
      data: pointData,
      meta: meta
    };
    dataPusher(data, point);
  }

  // anychart.performance.end('Drawing plan calc');
  this.invalidate(anychart.ConsistencyState.SERIES_DATA);
  return this.drawingPlan = {
    data: data,
    series: this,
    hasPointLabels: this.supportsLabels() &&
        (
            dataSource.checkFieldExist('label') ||
            dataSource.checkFieldExist('hoverLabel') ||
            dataSource.checkFieldExist('selectLabel')
        ),
    hasPointMarkers: this.supportsMarkers() &&
        (
            dataSource.checkFieldExist('marker') ||
            dataSource.checkFieldExist('hoverMarker') ||
            dataSource.checkFieldExist('selectMarker')
        ),
    hasPointOutliers: this.supportsOutliers() &&
        (
            dataSource.checkFieldExist('outliers') ||
            dataSource.checkFieldExist('outlierMarker') ||
            dataSource.checkFieldExist('hoverOutlierMarker') ||
            dataSource.checkFieldExist('selectOutlierMarker')
        ),
    hasPointXErrors: hasXErrors,
    hasPointYErrors: hasYErrors,
    hasPointErrors: hasXErrors || hasYErrors
  };
};


/**
 * @param {boolean} sorted
 * @param {boolean} dateTimeMode
 * @return {anychart.core.series.Cartesian.DrawingPlan}
 */
anychart.core.series.Cartesian.prototype.getScatterDrawingPlan = function(sorted, dateTimeMode) {
  var dataPusher;
  if (sorted) {
    var xMap = {};
    var prevX = -Infinity;
    // dataPusher must return a point that was replaced by the point pushed (if any)
    dataPusher = function(data, point) {
      var result;
      var xValue = point.data['x'];
      if (xValue in xMap) {
        result = data[xMap[xValue]];
        data[xMap[xValue]] = point;
      } else {
        xMap[xValue] = data.length;
        data.push(point);
        if (xValue < prevX)
          needsSorting = true;
        prevX = xValue;
      }
      return result || null;
    };
  } else {
    dataPusher = function(data, point) {
      data.push(point);
      return null;
    };
  }
  var needsSorting = false;
  var xNormalizer = dateTimeMode ?
      function(a) {
        var res = anychart.format.parseDateTime(a);
        return res ? res.getTime() : NaN;
      } :
      function(a) {
        return a;
      };
  var xMissingChecker = isNaN;

  var result = this.getDrawingData_([], dataPusher, xNormalizer, xMissingChecker);
  if (needsSorting)
    goog.array.sort(result.data, anychart.core.series.Cartesian.comparePointsXNumericAsc);
  return result;
};


/**
 * @param {Object.<string, number>} xHashMap
 * @param {Array.<*>} xArray
 * @param {boolean} restrictX
 * @param {string=} opt_namesField
 * @return {anychart.core.series.Cartesian.DrawingPlan}
 */
anychart.core.series.Cartesian.prototype.getOrdinalDrawingPlan = function(xHashMap, xArray, restrictX, opt_namesField) {
  var dataPusher;
  if (restrictX) {
    // dataPusher must return a point that was replaced by the point pushed (if any)
    dataPusher = function(data, point) {
      var result;
      var xHash = anychart.utils.hash(point.data['x']);
      if (xHash in xHashMap) {
        result = data[xHashMap[xHash]];
        data[xHashMap[xHash]] = point;
      }
      return result || null;
    };
  } else {
    dataPusher = function(data, point) {
      var result;
      var xValue = point.data['x'];
      var xHash = anychart.utils.hash(xValue);
      if (xHash in xHashMap) {
        result = data[xHashMap[xHash]];
        data[xHashMap[xHash]] = point;
      } else {
        xHashMap[xHash] = xArray.length;
        xArray.push(xValue);
        data.push(point);
      }
      return result || null;
    };
  }
  var xNormalizer = function(a) {
    return a;
  };
  var xMissingChecker = function(a) {
    return a === undefined;
  };

  var result = this.getDrawingData_(new Array(xArray.length), dataPusher, xNormalizer, xMissingChecker, opt_namesField);
  var data = result.data;
  for (var i = 0; i < data.length; i++) {
    if (!data[i])
      data[i] = anychart.core.series.Cartesian.makeMissingPoint(xArray[i]);
  }
  result.xHashMap = xHashMap;
  result.xArray = xArray;
  return result;
};


/**
 * Creates missing point with passed X.
 * @param {*} x
 * @return {{data: Object, meta: Object}}
 */
anychart.core.series.Cartesian.makeMissingPoint = function(x) {
  var meta = {};
  meta['missing'] = anychart.core.series.PointAbsenceReason.ARTIFICIAL_POINT;
  return {
    data: {'x': x},
    meta: meta
  };
};


/**
 * Compares points from drawing plan, assuming their X'es are numeric.
 * @param {Object} a
 * @param {Object} b
 * @return {number}
 */
anychart.core.series.Cartesian.comparePointsXNumericAsc = function(a, b) {
  return anychart.utils.compareNumericAsc(a.data['x'], b.data['x']);
};


/**
 * @param {*} fieldValue
 * @return {number}
 */
anychart.core.series.Cartesian.prototype.findX = function(fieldValue) {
  var res;
  if (this.drawingPlan) { // no plan yet - strange situation, falling back to data view search
    if (this.drawingPlan.xHashMap) { // ordinal plan
      res = this.drawingPlan.xHashMap[anychart.utils.hash(fieldValue)];
      return isNaN(res) ? -1 : res;
    } else if (this.drawingPlan.data.length) { // scatter case - plan.data should be sorted by X field
      res = goog.array.binarySelect(this.drawingPlan.data, function(val) {
        return /** @type {number} */(fieldValue) - val.data['x'];
      });
      if (res < 0) {
        res = ~res;
        if (res > 0) {
          if (res == this.drawingPlan.data.length) {
            res--;
          } else {
            var right = this.drawingPlan.data[res].data;
            var left = this.drawingPlan.data[res - 1].data;
            if (right['x'] - /** @type {number} */(fieldValue) > /** @type {number} */(fieldValue) - left['x']) {
              res--;
            }
          }
        }
      }
      return res;
    } else {
      return -1;
    }
  } else {
    return this.dataInternal.find('x', fieldValue);
  }
};


/**
 * This method is a legacy method for BySpot CartesianBase behaviour. That behaviour should be completely rewritten.
 * @param {*} minValue
 * @param {*} maxValue
 * @return {Array.<number>}
 */
anychart.core.series.Cartesian.prototype.findInRangeByX = function(minValue, maxValue) {
  if (this.drawingPlan) { // no plan yet - strange situation, falling back to data view search
    var res = [];
    var i, start, end;
    if (this.drawingPlan.xHashMap) { // ordinal plan
      start = this.drawingPlan.xHashMap[anychart.utils.hash(minValue)];
      end = this.drawingPlan.xHashMap[anychart.utils.hash(maxValue)];
    } else { // scatter case - plan.data should be sorted by X field
      start = goog.array.binarySelect(this.drawingPlan.data, function(val) {
        return /** @type {number} */(minValue) - val.data['x'];
      });
      if (start < 0) start = ~start;
      end = goog.array.binarySelect(this.drawingPlan.data, function(val) {
        return /** @type {number} */(maxValue) - val.data['x'];
      });
      if (end < 0) end = ~end;
    }
    if (!isNaN(start) && !isNaN(end)) {
      if (start > end) {
        var tmp = start;
        start = end;
        end = tmp;
      }
      end = Math.min(end, this.drawingPlan.data.length - 1);
      for (i = start; i <= end; i++)
        res.push(i);
    }
    return res;
  } else {
    var xScale = this.xScale();
    var isOrdinal = xScale instanceof anychart.scales.Ordinal;
    if (isOrdinal) {
      minValue = xScale.getIndexByValue(minValue);
      maxValue = xScale.getIndexByValue(maxValue);
    }
    return this.dataInternal.findInRangeByX(/** @type {number} */(minValue), /** @type {number} */(maxValue), isOrdinal);
  }
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.series.Cartesian.prototype.applyAppearanceToPoint = function(pointState) {
  var iterator = this.getIterator();
  if (this.isDiscreteBased()) {
    this.shapeManager.updateColors(pointState,
        /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
  }
  if (this.supportsOutliers()) {
    this.drawPointOutliers(iterator, pointState);
  }
  this.drawer.updatePoint(iterator, pointState);
  this.drawMarker(iterator, pointState);
  this.drawLabel(iterator, pointState);
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.core.series.Cartesian.prototype.finalizePointAppearance = goog.nullFunction;


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.series.Cartesian.prototype.applyAppearanceToSeries = function(pointState) {
  var iterator = this.getIterator();
  this.shapeManager.updateColors(pointState,
      /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
  this.drawer.updatePoint(iterator, pointState);
  if (this.supportsOutliers()) {
    this.drawPointOutliers(iterator, pointState);
  }
};


/**
 * @param {(anychart.enums.SelectionMode|string|null)=} opt_value Selection mode.
 * @return {anychart.core.series.Cartesian|anychart.enums.SelectionMode|null} .
 */
anychart.core.series.Cartesian.prototype.selectionMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeSelectMode(opt_value);
    if (opt_value != this.selectionMode_) {
      this.selectionMode_ = opt_value;
    }
    return this;
  }
  return /** @type {anychart.enums.SelectionMode}*/(this.selectionMode_);
};


/**
 * @param {(anychart.enums.HoverMode|string)=} opt_value Hover mode.
 * @return {anychart.core.series.Cartesian|anychart.enums.HoverMode} .
 */
anychart.core.series.Cartesian.prototype.hoverMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    return this;
  }
  return /** @type {anychart.enums.HoverMode} */((/** @type {anychart.core.CartesianBase}*/(this.chart)).interactivity().hoverMode());
};


/**
 * If index is passed, hovers a point of the series by its index, else hovers all points of the series.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.core.series.Cartesian}  {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.series.Cartesian.prototype.hover = function(opt_indexOrIndexes) {
  if (goog.isDef(opt_indexOrIndexes))
    this.hoverPoint(opt_indexOrIndexes);
  else
    this.hoverSeries();

  return this;
};


/**
 * Removes hover from the series or point by index.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.series.Cartesian.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) || !this.enabled())
    return this;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);

  return this;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @return {!anychart.core.series.Cartesian}  {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.series.Cartesian.prototype.hoverPoint = function(index) {
  if (!this.enabled())
    return this;

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
  }
  return this;
};


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.core.series.Cartesian} An instance of the {@link anychart.core.series.Cartesian} class for method chaining.
 */
anychart.core.series.Cartesian.prototype.hoverSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.HOVER);

  return this;
};


/**
 * Imitates selects a point of the series by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.series.Cartesian.prototype.select = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  if (goog.isDef(opt_indexOrIndexes))
    this.selectPoint(opt_indexOrIndexes);
  else
    this.selectSeries();

  return this;
};


/**
 * Deselects all points or points by index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.series.Cartesian.prototype.unselect = function(opt_indexOrIndexes) {
  if (!this.enabled())
    return this;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.SELECT, index);

  return this;
};


/**
 * Selects a point of the series by its index.
 * @param {number|Array<number>} indexOrIndexes Index of the point to select.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point selecting.
 * @return {!anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.series.Cartesian.prototype.selectPoint = function(indexOrIndexes, opt_event) {
  if (!this.enabled())
    return this;

  var unselect = !(opt_event && opt_event.shiftKey);

  if (goog.isArray(indexOrIndexes)) {
    if (!opt_event)
      this.unselect();

    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  } else if (goog.isNumber(indexOrIndexes)) {
    this.state.setPointState(anychart.PointState.SELECT, indexOrIndexes, unselect ? anychart.PointState.HOVER : undefined);
  }

  return this;
};


/**
 * Selects all points of the series. Use <b>unselect</b> method for unselect series.
 * @return {!anychart.core.series.Cartesian} An instance of the {@link anychart.core.series.Cartesian} class for method chaining.
 */
anychart.core.series.Cartesian.prototype.selectSeries = function() {
  if (!this.enabled())
    return this;

  this.state.setPointState(anychart.PointState.SELECT);

  return this;
};


//endregion
//region --- Events
//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Cartesian.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.core.series.Cartesian.base(this, 'makeBrowserEvent', e);

  if (this.isDiscreteBased()) {
    res['pointIndex'] = anychart.utils.toNumber(anychart.utils.extractTag(res['domTarget']).index);
  } else if (this.sortedMode_) {
    var bounds = this.pixelBoundsCache || anychart.math.rect(0, 0, 0, 0);
    var x, min, range;
    var value, index;

    if (/** @type {boolean} */(this.getOption('isVertical'))) {
      x = res['clientY'];
      min = bounds.top + this.container().getStage().getClientPosition().y + bounds.height;
      range = -bounds.height;
    } else {
      x = res['clientX'];
      min = bounds.left + this.container().getStage().getClientPosition().x;
      range = bounds.width;
    }
    value = this.xScale().inverseTransform((x - min) / range);

    index = this.findX(value);

    if (index < 0) index = NaN;

    res['pointIndex'] = /** @type {number} */(index);
  }

  return res;
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.series.Cartesian.prototype.makePointEvent = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
    case acgraph.events.EventType.TOUCHSTART:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var pointIndex;
  if (event['target'] == this.outlierMarkers() && !isNaN(event['markerIndex'])) {
    pointIndex = this.getPointIndexByOutlierIndex(event['markerIndex']);
  } else if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);
  event['pointIndex'] = pointIndex;

  var iter = this.getDetachedIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'series': this,
    'iterator': iter,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


//endregion
//region --- Different public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Different public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets wrapped point by index.
 * @param {number} index Point index.
 * @return {anychart.core.SeriesPoint} Wrapped point.
 */
anychart.core.series.Cartesian.prototype.getPoint = function(index) {
  var point;
  if (this.isSizeBased()) {
    point = new anychart.core.BubblePoint(this, index);
  } else {
    point = new anychart.core.SeriesPoint(this, index);
  }

  this.chart.ensureStatisticsReady();
  var chartStat = (/** @type {anychart.core.CartesianBase} */ (this.chart)).statistics;
  var isRangeSeries = this.check(anychart.core.drawers.Capabilities.IS_RANGE_BASED | anychart.core.drawers.Capabilities.IS_OHLC_BASED);

  var val = /** @type {number} */ (isRangeSeries ? (/** @type {number} */ (point.get('high')) - /** @type {number} */ (point.get('low'))) :
      point.get('value'));

  point.statistics[anychart.enums.Statistics.INDEX] = index;
  if (goog.isDef(val)) point.statistics[anychart.enums.Statistics.VALUE] = val;

  var size = /** @type {number} */ (point.get('size')); //Bubble.
  var v;

  if (goog.isNumber(chartStat[anychart.enums.Statistics.DATA_PLOT_X_SUM])) {
    v = val / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_X_SUM]);
    point.statistics[anychart.enums.Statistics.X_PERCENT_OF_TOTAL] = v * 100;
  }

  if (goog.isNumber(this.statistics(anychart.enums.Statistics.SERIES_X_SUM))) {
    v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_X_SUM));
    point.statistics[anychart.enums.Statistics.X_PERCENT_OF_SERIES] = v * 100;
  }

  if (goog.isNumber(this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM))) {
    v = size / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_BUBBLE_SIZE_SUM));
    point.statistics[anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_SERIES] = v * 100;
    v = size / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_BUBBLE_SIZE_SUM]);
    point.statistics[anychart.enums.Statistics.BUBBLE_SIZE_PERCENT_OF_TOTAL] = v * 100;
    point.statistics[anychart.enums.Statistics.BUBBLE_SIZE] = size;
  }

  var sumArr = isRangeSeries ?
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM_ARR_) :
      this.statistics(anychart.enums.Statistics.CATEGORY_Y_SUM_ARR_);
  var x = /** @type {number} */ (point.get('x'));

  if (sumArr) {
    point.statistics[anychart.enums.Statistics.CATEGORY_NAME] = x;
    var catSum = sumArr[index];

    if (isRangeSeries) {
      v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_Y_RANGE_SUM));
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_SERIES] = v * 100;
      v = val / chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM];
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_TOTAL] = v * 100;
      v = val / catSum;
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY] = v * 100;
      v = catSum / chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL] = v * 100;
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_SUM] = catSum;
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MAX_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MIN_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_AVERAGE] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_AVG_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MEDIAN_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_RANGE_MODE_ARR_)[index];
    } else {
      v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_SERIES] = v * 100;
      v = val / chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM];
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_TOTAL] = v * 100;
      v = val / catSum;
      point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_CATEGORY] = v * 100;
      v = catSum / chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_PERCENT_OF_TOTAL] = v * 100;
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_SUM] = catSum;
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MAX] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_MAX_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MIN] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_MIN_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_AVERAGE] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_AVG_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MEDIAN] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_MEDIAN_ARR_)[index];
      point.statistics[anychart.enums.Statistics.CATEGORY_Y_MODE] = this.statistics(anychart.enums.Statistics.CATEGORY_Y_MODE_ARR_)[index];
    }
  } else {
    v = x / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_X_SUM));
    point.statistics[anychart.enums.Statistics.X_PERCENT_OF_SERIES] = v * 100;
    v = val / /** @type {number} */ (this.statistics(anychart.enums.Statistics.SERIES_Y_SUM));
    point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_SERIES] = v * 100;
    v = x / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_X_SUM]);
    point.statistics[anychart.enums.Statistics.X_PERCENT_OF_TOTAL] = v * 100;
    v = val / /** @type {number} */ (chartStat[anychart.enums.Statistics.DATA_PLOT_Y_SUM]);
    point.statistics[anychart.enums.Statistics.Y_PERCENT_OF_TOTAL] = v * 100;

  }

  return point;
};


//endregion
//region --- Serialization/Deserialization/Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization/Deserialization/Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.series.Cartesian.prototype.serialize = function() {
  var json = anychart.core.series.Cartesian.base(this, 'serialize');

  if (this.drawingPlan) {
    var arr = [];
    var view = /** @type {!anychart.data.View} */(this.data());
    var iterator = new anychart.core.utils.DrawingPlanIterator(this);
    while (iterator.advance()) {
      var index = iterator.getRawDataIndex();
      if (isNaN(index)) { // not a best solution
        arr.push({'x': iterator.get('x')});
      } else {
        arr.push(view.serializeRow(index));
      }
    }
    json['data'] = arr;
  } else {
    json['data'] = this.data().serialize();
  }

  if (goog.isDef(this.selectionMode()))
    json['selectionMode'] = this.selectionMode();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.series.Cartesian.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.series.Cartesian.base(this, 'setupByJSON', config, opt_default);

  if ('data' in config)
    this.data(config['data'] || null);

  this.selectionMode(config['selectionMode']);
};


/** @inheritDoc */
anychart.core.series.Cartesian.prototype.disposeInternal = function() {
  goog.dispose(this.parentViewToDispose);
  delete this.dataInternal;
  this.parentView = this.parentView = this.parentViewToDispose = null;

  this.xScale_ = this.drawingPlan = this.state = null;

  anychart.core.series.Cartesian.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.core.series.Cartesian.prototype;
  proto['data'] = proto.data;
  proto['xScale'] = proto.xScale;

  proto['hover'] = proto.hover;
  proto['unhover'] = proto.unhover;
  proto['select'] = proto.select;
  proto['unselect'] = proto.unselect;
  proto['selectionMode'] = proto.selectionMode;

  proto['getPoint'] = proto.getPoint;
  proto['excludePoint'] = proto.excludePoint;
  proto['includePoint'] = proto.includePoint;
  proto['keepOnlyPoints'] = proto.keepOnlyPoints;
  proto['includeAllPoints'] = proto.includeAllPoints;
  proto['getExcludedPoints'] = proto.getExcludedPoints;
})();
//endregion
