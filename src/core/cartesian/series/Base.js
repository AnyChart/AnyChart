goog.provide('anychart.core.cartesian.series.Base');
goog.require('acgraph');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.utils.DrawingPlanIterator');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.utils');


/**
 * Namespace anychart.core.cartesian
 * @namespace
 * @name anychart.core.cartesian
 */



/**
 * Base class for all cartesian series.<br/>
 * Base class defines common methods, such as those for:
 * <ul>
 *   <li>Binding series to a scale: <i>xScale, yScale</i></li>
 *   <li>Base color settings: <i>color</i></li>
 * </ul>
 * You can also obtain <i>getIterator, getResetIterator</i> iterators here.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.SeriesBase}
 * @implements {anychart.core.utils.ISeriesWithError}
 */
anychart.core.cartesian.series.Base = function(opt_data, opt_csvSettings) {
  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;
  goog.base(this, opt_data, opt_csvSettings);

  /**
   * Error paths dictionary by stroke object hash.
   * @type {Object.<string, !acgraph.vector.Path>}
   * @private
   */
  this.errorPaths_ = null;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.pathsPool_ = null;

  // series fields definition
  /**
   * Whether the series should ignore missing points.
   * @type {boolean}
   * @protected
   */
  this.connectMissing = false;

  /**
   * Whether the series needs zero value support.
   * @type {boolean}
   * @protected
   */
  this.needsZero = false;

  /**
   * Whether the series supports stacking.
   * @type {boolean}
   * @protected
   */
  this.seriesSupportsStack = true;

  /**
   * Whether the series supports errors.
   * @type {boolean}
   * @protected
   */
  this.seriesSupportsError = true;

  /**
   * Names of Y scale fields, used by the series.
   * @type {!Array.<string>}
   */
  this.yValueNames = ['value'];

  /**
   * If we should check "outliers" field.
   * @type {boolean}
   */
  this.checkOutliers = false;

  /**
   * If we should check size field.
   * @type {boolean}
   */
  this.checkSize = false;

  /**
   * Additional names to be pre-fetched to the plan.
   * @type {!Array.<string>}
   */
  this.additionalNames = ['label'];

  /**
   * Error names to be fetched.
   * @type {!Array.<string>}
   */
  this.xErrorNames = ['xError', 'xLowerError', 'xUpperError'];

  /**
   * Error names to be fetched.
   * @type {!Array.<string>}
   */
  this.yErrorNames = ['valueError', 'valueLowerError', 'valueUpperError'];
};
goog.inherits(anychart.core.cartesian.series.Base, anychart.core.SeriesBase);


/**
 * @typedef {{
 *   series: anychart.core.cartesian.series.Base,
 *   data: Array.<Object>,
 *   stacked: (boolean|undefined),
 *   firstIndex: (number|undefined),
 *   lastIndex: (number|undefined),
 *   hasPointMarkers: (boolean|undefined),
 *   hasPointLabels: (boolean|undefined),
 *   hasPointErrors: (boolean|undefined),
 *   xHashMap: (Object.<number>|undefined),
 *   xArray: (Array|undefined)
 * }}
 */
anychart.core.cartesian.series.Base.DrawingPlan;


/**
 * Compares points from drawing plan, assuming their X'es are numeric.
 * @param {Object} a
 * @param {Object} b
 * @return {number}
 */
anychart.core.cartesian.series.Base.comparePointsXNumericAsc = function(a, b) {
  return anychart.utils.compareNumericAsc(a['x'], b['x']);
};


/**
 * Link to incoming raw data.
 * Used to avoid data reapplication on same data sets.
 * NOTE: If is disposable entity, should be disposed from the source, not from this class.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.rawData_;


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.cartesian.series.Base.SeriesTypesMap = {};


/**
 * Map of 3d series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.cartesian.series.Base.Series3dTypesMap = {};


/**
 * Series is 3D series.
 * @type {boolean}
 */
anychart.core.cartesian.series.Base.prototype.is3d = false;


/**
 * For internal use.
 * @param {number} value Calculated bar width ratio.
 */
anychart.core.cartesian.series.Base.prototype.setAutoBarWidth = goog.nullFunction;


/**
 * Calculates size scale for the series. If opt_minMax is passed, also compares with opt_minMax members.
 * @param {Array.<number>=} opt_minMax Array of two values: [min, max].
 */
anychart.core.cartesian.series.Base.prototype.calculateSizeScale = goog.nullFunction;


/**
 * @param {number} min .
 * @param {number} max .
 * @param {number|string} minSize
 * @param {number|string} maxSize
 */
anychart.core.cartesian.series.Base.prototype.setAutoSizeScale = goog.nullFunction;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.pixelBoundsCache = null;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.cartesian.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.cartesian.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.cartesian.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Error path z-index in series root layer.
 * @type {number}
 */
anychart.core.cartesian.series.Base.ZINDEX_ERROR_PATH = 3;


/**
 * Series clip.
 * @type {boolean|anychart.math.Rect}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.clip_ = false;


/**
 * Root layer.
 * @type {acgraph.vector.Layer}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.rootLayer;


/**
 * Gets root layer of series.
 * @return {acgraph.vector.Layer}
 */
anychart.core.cartesian.series.Base.prototype.getRootLayer = function() {
  return this.rootLayer;
};


/**
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.axesLinesSpace_;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.prevPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.xScale_ = null;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.pointPosition_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.autoPointPosition_ = 0.5;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.zeroY = 0;


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.getResetIterator = function() {
  if (this.drawingPlan)
    this.iterator = new anychart.core.utils.DrawingPlanIterator(this.drawingPlan, /** @type {!anychart.data.View} */(this.data()));
  else
    this.iterator = this.data().getIterator();
  return this.iterator;
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.getValueInternal = function(index, name) {
  if (this.drawingPlan) {
    var res = undefined;
    var point = this.drawingPlan.data[index];
    if (point) {
      if (name in point) {
        res = point[name];
      } else {
        var rawIndex = point['rawIndex'];
        var row;
        var view = /** @type {anychart.data.View} */(this.data());
        if (goog.isDef(rawIndex))
          row = view.row(rawIndex);
        else
          return res;//undefined
        res = view.getRowMapping(rawIndex).getInternal(row, rawIndex, name);
      }
    }
    return res;
  }
  return anychart.core.cartesian.series.Base.base(this, 'getValueInternal', index, name);
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.setValueInternal = function(index, name, value) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    index = point && point['rawIndex'];
  }
  anychart.core.cartesian.series.Base.base(this, 'setValueInternal', index, name, value);
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.getStackedZero = function(index) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    if (point) {
      return this.drawingPlan.stacked ? point['stackedZero'] : point['zero'];
    } else {
      return undefined;
    }
  }
  return anychart.core.cartesian.series.Base.base(this, 'getStackedZero', index);
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.getStackedValue = function(index) {
  if (this.drawingPlan) {
    var point = this.drawingPlan.data[index];
    if (point) {
      return this.drawingPlan.stacked ? point['stackedValue'] : point['value'];
    } else {
      return undefined;
    }
  }
  return anychart.core.cartesian.series.Base.base(this, 'getStackedValue', index);
};


/**
 * @param {Array} data
 * @param {Function} dataPusher
 * @param {Function} xNormalizer
 * @param {Function} xMissingChecker
 * @param {Array.<string>=} opt_additionalFields
 * @return {anychart.core.cartesian.series.Base.DrawingPlan}
 * @private
 */
anychart.core.cartesian.series.Base.prototype.getDrawingData_ = function(data, dataPusher, xNormalizer, xMissingChecker, opt_additionalFields) {
  anychart.performance.start('Drawing plan calc');
  this.drawingPlan = null;
  var iterator = this.getResetIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  var seriesMin = Infinity;
  var seriesMax = -Infinity;
  var seriesSum = 0;
  var pointLabelsCount = 0;
  var pointMarkersCount = 0;
  var hasXErrors = false;
  var hasYErrors = false;
  var hasSelectedPoints = false;
  while (iterator.advance()) {
    var xValue = xNormalizer(iterator.get('x'));
    if (xMissingChecker(xValue)) // we do not add missings for points that have undefined X
      continue;
    var point = {
      'x': xValue
    };
    var i, len, name, val, missing = false;
    for (i = 0, len = this.yValueNames.length; i < len; i++) {
      name = this.yValueNames[i];
      val = iterator.get(name);
      missing = missing || yScale.isMissing(val);
      point[name] = val;
    }
    for (i = 0, len = this.additionalNames.length; i < len; i++) {
      name = this.additionalNames[i];
      val = iterator.get(name);
      point[name] = val;
    }
    if (this.checkSize)
      missing = missing || isNaN(point['size']);
    if (this.seriesSupportsError) {
      if (anychart.core.utils.Error.isErrorAvailableForScale(/** @type {anychart.scales.Base} */(this.xScale()))) {
        for (i = 0, len = this.xErrorNames.length; i < len; i++) {
          name = this.xErrorNames[i];
          val = iterator.get(name);
          if (goog.isDef(val))
            hasXErrors = true;
          point[name] = val;
        }
      }
      if (anychart.core.utils.Error.isErrorAvailableForScale(/** @type {anychart.scales.Base} */(this.yScale()))) {
        for (i = 0, len = this.yErrorNames.length; i < len; i++) {
          name = this.yErrorNames[i];
          val = iterator.get(name);
          if (goog.isDef(val))
            hasYErrors = true;
          point[name] = val;
        }
      }
    }
    if (opt_additionalFields && opt_additionalFields.length) {
      for (i = 0, len = opt_additionalFields.length; i < len; i++) {
        name = opt_additionalFields[i];
        val = iterator.get(name);
        point[name] = val;
      }
    }
    point['missing'] = missing;
    point['rawIndex'] = iterator.getIndex();

    if (!missing) {
      val = point['value'];
      seriesSum += val;
      if (seriesMax < val)
        seriesMax = val;
      if (seriesMin > val)
        seriesMin = val;
      // we count marker point settings
      if (point['marker'])
        pointMarkersCount++;
      // we count label point settings
      if (point['label'])
        pointLabelsCount++;
      if (!!iterator.get('selected')) {
        point['selected'] = hasSelectedPoints = true;
      }
    }
    point = dataPusher(data, point);
    // if the new point replaced a point, we should decrease labels and markers counters
    if (point) {
      if (!point['missing']) {
        if (point['marker'])
          pointMarkersCount--;
        if (point['label'])
          pointLabelsCount--;
      }
    }
  }
  this.statistics('seriesMax', seriesMax);
  this.statistics('seriesMin', seriesMin);
  this.statistics('seriesSum', seriesSum);
  anychart.performance.end('Drawing plan calc');
  return this.drawingPlan = {
    data: data,
    series: this,
    hasPointLabels: pointLabelsCount > 0,
    hasPointMarkers: pointMarkersCount > 0,
    hasPointXErrors: hasXErrors,
    hasPointYErrors: hasYErrors,
    hasPointErrors: hasXErrors || hasYErrors,
    hasSelectedPoints: hasSelectedPoints
  };
};


/**
 * @param {boolean} sorted
 * @param {boolean} dateTimeMode
 * @return {anychart.core.cartesian.series.Base.DrawingPlan}
 */
anychart.core.cartesian.series.Base.prototype.getScatterDrawingPlan = function(sorted, dateTimeMode) {
  var dataPusher;
  if (sorted) {
    var xMap = {};
    var prevX = -Infinity;
    // dataPusher must return a point that was replaced by the point pushed (if any)
    dataPusher = function(data, point) {
      var result;
      var xValue = point['x'];
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
  var xNormalizer = dateTimeMode ? anychart.utils.normalizeTimestamp : function(a) { return a; };
  var xMissingChecker = isNaN;

  var result = this.getDrawingData_([], dataPusher, xNormalizer, xMissingChecker);
  if (needsSorting)
    goog.array.sort(result.data, anychart.core.cartesian.series.Base.comparePointsXNumericAsc);
  return result;
};


/**
 * @param {Object.<string, number>} xHashMap
 * @param {Array.<*>} xArray
 * @param {boolean} restrictX
 * @param {string=} opt_namesField
 * @return {anychart.core.cartesian.series.Base.DrawingPlan}
 */
anychart.core.cartesian.series.Base.prototype.getOrdinalDrawingPlan = function(xHashMap, xArray, restrictX, opt_namesField) {
  var dataPusher;
  if (restrictX) {
    // dataPusher must return a point that was replaced by the point pushed (if any)
    dataPusher = function(data, point) {
      var result;
      var xHash = anychart.utils.hash(point['x']);
      if (xHash in xHashMap) {
        result = data[xHashMap[xHash]];
        data[xHashMap[xHash]] = point;
      }
      return result || null;
    };
  } else {
    dataPusher = function(data, point) {
      var result;
      var xValue = point['x'];
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
  var xNormalizer = function(a) { return a; };
  var xMissingChecker = function(a) { return a === undefined; };

  var result = this.getDrawingData_(new Array(xArray.length), dataPusher, xNormalizer, xMissingChecker, opt_namesField ? [opt_namesField] : []);
  var data = result.data;
  for (var i = 0; i < data.length; i++) {
    if (!data[i])
      data[i] = {
        'x': xArray[i],
        'missing': true,
        'rawIndex': NaN
      };
  }
  result.xHashMap = xHashMap;
  result.xArray = xArray;
  return result;
};


/**
 * Calculates and puts all needed coords to meta.
 * @return {boolean} If the point is not missing.
 */
anychart.core.cartesian.series.Base.prototype.calcSeriesCoords = function() {
  var i;
  var iterator = this.iterator;
  if (iterator.get('missing') ||
      iterator.getIndex() < this.drawingPlan.firstIndex ||
      iterator.getIndex() > this.drawingPlan.lastIndex) {
    iterator.meta('x', undefined);
    for (i = 0; i < this.yValueNames.length; i++) {
      iterator.meta(this.yValueNames[i], undefined);
    }
    return false;
  }

  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());

  iterator.meta('x',
      this.applyRatioToBounds(
          xScale.transform(
              iterator.get('x'),
              /** @type {number} */(this.xPointPosition())), true));

  if (this.drawingPlan.stacked) {
    iterator.meta('value', this.applyRatioToBounds(yScale.transform(iterator.get('stackedValue'), 0.5), false));
    iterator.meta('zero', this.applyRatioToBounds(yScale.transform(iterator.get('stackedZero'), 0.5), false));
    iterator.meta('zeroMissing', iterator.get('stackedMissing'));
  } else {
    if (this.needsZero) {
      iterator.meta('zero', this.zeroY);
      iterator.meta('zeroMissing', false);
    }
    for (i = 0; i < this.yValueNames.length; i++) {
      var name = this.yValueNames[i];
      iterator.meta(name, this.applyRatioToBounds(yScale.transform(iterator.get(name), 0.5), false));
    }
  }
  return true;
};


/**
 * Transforms x to pix coords.
 * @param {*} value
 * @param {number=} opt_subRangeRatio
 * @return {number} Pix value.
 */
anychart.core.cartesian.series.Base.prototype.transformX = function(value, opt_subRangeRatio) {
  return this.applyRatioToBounds(this.xScale().transform(value, opt_subRangeRatio), true);
};


/**
 * Transforms y to pix coords.
 * @param {*} value
 * @param {number=} opt_subRangeRatio
 * @return {number} Pix value.
 */
anychart.core.cartesian.series.Base.prototype.transformY = function(value, opt_subRangeRatio) {
  return this.applyRatioToBounds(this.yScale().transform(value, opt_subRangeRatio), false);
};


/**
 * Get point width in case of width-based series.
 * @return {number} Point width.
 */
anychart.core.cartesian.series.Base.prototype.getPixelPointWidth = function() {
  if ((this.isWidthBased() || this.isBarBased()) && goog.isFunction(this.getPointWidth))
    return this.getPointWidth();
  else
    return 0;
};


/**
 * @param {*} fieldValue
 * @return {number}
 */
anychart.core.cartesian.series.Base.prototype.findX = function(fieldValue) {
  var res;
  if (this.drawingPlan) { // no plan yet - strange situation, falling back to data view search
    if (this.drawingPlan.xHashMap) { // ordinal plan
      res = this.drawingPlan.xHashMap[anychart.utils.hash(fieldValue)];
      return isNaN(res) ? -1 : res;
    } else { // scatter case - plan.data should be sorted by X field
      res = goog.array.binarySelect(this.drawingPlan.data, function(val) { return /** @type {number} */(fieldValue) - val['x']; });
      if (res < 0) {
        res = ~res;
        if (res > 0) {
          if (res == this.drawingPlan.data.length) {
            res--;
          } else {
            var right = this.drawingPlan.data[res];
            var left = this.drawingPlan.data[res - 1];
            if (right['x'] - /** @type {number} */(fieldValue) > /** @type {number} */(fieldValue) - left['x']) {
              res--;
            }
          }
        }
      }
      return res;
    }
  } else {
    return this.dataInternal.find('x', fieldValue);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xPointPosition.
 * @param {number=} opt_position [0.5] Point position (in 0 to 1 range).
 * @return {number|anychart.core.cartesian.series.Base} .
 */
anychart.core.cartesian.series.Base.prototype.xPointPosition = function(opt_position) {
  if (goog.isDef(opt_position)) {
    if (this.pointPosition_ != +opt_position) {
      this.pointPosition_ = +opt_position;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return isNaN(this.pointPosition_) ? this.autoPointPosition_ : this.pointPosition_;
};


/**
 * Works for autopositioning by a plot, if external value is set - it is not overwritten.
 * @param {number} position .
 * @return {anychart.core.cartesian.series.Base} .
 */
anychart.core.cartesian.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoPointPosition_ = +position;
  return this;
};


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.isDiscreteBased = function() {
  return false;
};


/**
 * Tester if the series is width based (column, rangeColumn).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isWidthBased = function() {
  return false;
};


/**
 * Tester if the series is bar based (bar, rangeBar).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isBarBased = function() {
  return false;
};


/**
 * Tester if the series is area based (area, area3d).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isAreaBased = function() {
  return false;
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.hasMarkers = function() {
  return false;
};


/**
 * Tester if the series has outlierMarkers() method.
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.hasOutlierMarkers = function() {
  return false;
};


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.core.cartesian.series.Base.prototype.supportsStack = function() {
  return this.seriesSupportsStack;
};


/**
 * Tester if the series can have an error. (All except range series, OHLC, Bubble).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isErrorAvailable = function() {
  return this.seriesSupportsError;
};


/**
 * This method is here for compatability.
 * @ignoreDoc
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.cartesian.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.outlierMarkers = function(opt_value) {
  return this;
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.cartesian.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws series into the current container. If series has no scales - creates them.
 * @return {anychart.core.cartesian.series.Base} An instance of {@link anychart.core.cartesian.series.Base} class for method chaining.
 */
anychart.core.cartesian.series.Base.prototype.drawPlan = function() {
  this.suspendSignalsDispatching();

  this.startDrawing();
  if (this.enabled()) {
    var iterator = this.getResetIterator();

    /**
     * @type {boolean}
     * @protected
     */
    this.shouldDrawLabels = (this.labels().enabled() !== false) || this.drawingPlan.hasPointLabels;
    /**
     * @type {boolean}
     * @protected
     */
    this.shouldDrawMarkers = !this.hasMarkers() || (this.markers().enabled() !== false) || this.drawingPlan.hasPointMarkers;
    /**
     * @type {boolean}
     * @protected
     */
    this.shouldDrawErrors = this.seriesSupportsError && (this.drawingPlan.hasPointErrors || this.error().hasGlobalErrorValues());

    if (this.drawingPlan.hasSelectedPoints) {
      while (iterator.advance()) {
        if (iterator.get('selected'))
          this.state.setPointState(anychart.PointState.SELECT, iterator.getIndex());
      }
      iterator.reset();
    }

    while (iterator.advance()) {
      this.drawPoint(this.state.getPointStateByIndex(iterator.getIndex()));
    }
  }
  this.finalizeDrawing();

  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL & ~anychart.ConsistencyState.CONTAINER);

  return this;
};


/**
 * Draws the point currently selected by the iterator. This is the ONLY entry point to the drawing of the point.
 * @param {anychart.PointState|number} pointState Point state.
 * @final
 */
anychart.core.cartesian.series.Base.prototype.drawPoint = function(pointState) {
  if (this.calcSeriesCoords()) {
    if (this.prevPointDrawn)
      this.drawSubsequentPoint(pointState | this.state.getSeriesState());
    else
      this.drawFirstPoint(pointState | this.state.getSeriesState());
    this.drawPointElements(pointState);
    this.prevPointDrawn = true;
  } else {
    this.drawMissing();
    this.prevPointDrawn = this.connectMissing;
  }
};


/**
 * Draws additional point elements like label, marker or error.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.cartesian.series.Base.prototype.drawPointElements = function(pointState) {
  if (this.shouldDrawLabels)
    this.drawLabel(pointState);
  if (this.shouldDrawErrors && this.error().hasAnyErrorValues())
    this.drawError();
};


/**
 * This method is used to handle a missing point. Used only in continuous series.
 */
anychart.core.cartesian.series.Base.prototype.drawMissing = goog.nullFunction;


/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  goog.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.cartesian.series.Base.prototype.startDrawing = function() {
  this.prevPointDrawn = false;
  this.pixelBoundsCache = this.getPixelBounds();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res;
  if (scale) {
    res = scale.transform(0);
    if (isNaN(res))
      res = 0;
  } else {
    res = 0;
  }
  this.zeroY = this.applyAxesLinesSpace(this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false));

  if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED))
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.SERIES_HATCH_FILL |
        anychart.ConsistencyState.SERIES_LABELS);
  this.checkDrawingNeeded();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.resetErrorPaths();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().parentBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getBottom() - +this.axesLinesSpace().bottom();
  var min = bounds.getTop() + +this.axesLinesSpace().top();

  return goog.math.clamp(value, min, max);
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.cartesian.series.Base.prototype.finalizeDrawing = function() {
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().draw();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.doClip();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.selectLabels().resumeSignalsDispatching(false);

  this.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.hoverLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.selectLabels().markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, this.yValueNames, this.seriesSupportsError);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  var shape = iterator.meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    position = anychart.enums.normalizeAnchor(position);
    return {'value': anychart.utils.getCoordinateByAnchor(shapeBounds, position)};
  } else {
    return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
  }
};


/**
 * Draws first point in continuous series.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.drawFirstPoint = function(pointState) {
  this.drawSubsequentPoint(pointState);
};


/**
 * Draws subsequent point in continuous series.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 */
anychart.core.cartesian.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  var min, range;
  if (horizontal) {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  } else {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Clip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Makes proper clipping. Considered internal.
 */
anychart.core.cartesian.series.Base.prototype.doClip = function() {
  var clip, bounds, axesLinesSpace;
  clip = /** @type {!anychart.math.Rect|boolean} */ (this.clip());
  if (goog.isBoolean(clip)) {
    if (clip) {
      bounds = this.pixelBoundsCache;
      axesLinesSpace = this.axesLinesSpace();
      clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));
    }
  }

  this.rootLayer.clip(/** @type {anychart.math.Rect} */ (clip || null));
  var labelDOM = this.labels().getDomElement();
  if (labelDOM) labelDOM.clip(/** @type {anychart.math.Rect} */(clip || null));
};


/**
 * Getter/setter for clip.
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart] Enable/disable series clip.
 * @return {anychart.core.cartesian.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.cartesian.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.clip_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.cartesian.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_;
  }
};


/**
 * Getter/setter for yScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.cartesian.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.cartesian.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated_, this);
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  else
    this.dispatchSignal(signal);
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.getEnableChangeSignals = function() {
  return goog.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED | anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


/**
 * Returns type of current series.
 * @return {anychart.enums.CartesianSeriesType|anychart.enums.Cartesian3dSeriesType} Series type.
 */
anychart.core.cartesian.series.Base.prototype.getType = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Error.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/Setter for an error for series.
 * @param {(Object|null|boolean|string)=} opt_value Error.
 * @return {(anychart.core.utils.Error|anychart.core.cartesian.series.Base)} Series error or self for chaining.
 */
anychart.core.cartesian.series.Base.prototype.error = function(opt_value) {
  if (!this.isErrorAvailable())
    anychart.utils.warning(anychart.enums.WarningCode.SERIES_DOESNT_SUPPORT_ERROR, undefined, [this.getType()]);
  if (!this.error_) {
    this.error_ = new anychart.core.utils.Error(this);
    this.registerDisposable(this.error_);
    this.error_.listenSignals(this.onErrorSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.error_.setup(opt_value);
    return this;
  }

  return this.error_;
};


/**
 * Listener for error invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.cartesian.series.Base.prototype.onErrorSignal_ = function(event) {
  var state = anychart.ConsistencyState.APPEARANCE;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  }
  this.invalidate(state, signal);
};


/**
 * Removes all error paths and clears hashes.
 */
anychart.core.cartesian.series.Base.prototype.resetErrorPaths = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.errorPaths_) {
    for (var hash in this.errorPaths_) {
      var path = this.errorPaths_[hash];
      path.clear();
      path.parent(null);
      delete this.errorPaths_[hash];
    }
  } else
    this.errorPaths_ = {};
};


/**
 * Returns error path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 */
anychart.core.cartesian.series.Base.prototype.getErrorPath = function(stroke) {
  var hash = '' + this.getIterator().getIndex() + anychart.utils.hash(stroke);
  if (hash in this.errorPaths_)
    return this.errorPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        /** @type {!acgraph.vector.Path} */ (acgraph.path().zIndex(anychart.core.cartesian.series.Base.ZINDEX_ERROR_PATH));

    this.rootLayer.addChild(path);
    this.makeInteractive(path);
    path.stroke(stroke);
    path.fill(null);
    this.errorPaths_[hash] = path;
    return path;
  }
};


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number, number>} Array of lower and upper errors value.
 */
anychart.core.cartesian.series.Base.prototype.getErrorValues = function(horizontal) {
  return this.error().getErrorValues(horizontal);
};


/**
 * Draws an error.
 */
anychart.core.cartesian.series.Base.prototype.drawError = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var error = this.error();
    var errorMode = error.mode();
    var isBarBased = this.isBarBased();

    switch (errorMode) {
      case anychart.enums.ErrorMode.NONE:
        break;
      case anychart.enums.ErrorMode.X:
        error.draw(true, isBarBased);
        break;
      case anychart.enums.ErrorMode.VALUE:
        error.draw(false, isBarBased);
        break;
      case anychart.enums.ErrorMode.BOTH:
        error.draw(true, isBarBased);
        error.draw(false, isBarBased);
        break;
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.serializeData = function() {
  if (this.drawingPlan) {
    var arr = [];
    var view = /** @type {!anychart.data.View} */(this.data());
    var iterator = new anychart.core.utils.DrawingPlanIterator(this.drawingPlan, view);
    while (iterator.advance()) {
      var index = iterator.getRawDataIndex();
      if (isNaN(index)) { // not a best solution
        arr.push({'x': iterator.get('x')});
      } else {
        arr.push(view.serializeRow(index));
      }
    }
    return arr;
  } else {
    return anychart.core.cartesian.series.Base.base(this, 'serializeData');
  }
};


// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = this.getType();
  if (!isNaN(this.pointPosition_))
    json['xPointPosition'] = this.pointPosition_;
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;
  if (this.isErrorAvailable())
    json['error'] = this.error().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Base.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  if (this.isErrorAvailable())
    this.error(config['error']);
  this.xPointPosition(config['xPointPosition']);
  this.clip(config['clip']);
};


//anychart.core.cartesian.series.Base.prototype['draw'] = anychart.core.cartesian.series.Base.prototype.draw;//doc|ex
//anychart.core.cartesian.series.Base.prototype['drawPoint'] = anychart.core.cartesian.series.Base.prototype.drawPoint;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['drawMissing'] = anychart.core.cartesian.series.Base.prototype.drawMissing;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['startDrawing'] = anychart.core.cartesian.series.Base.prototype.startDrawing;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['finalizeDrawing'] = anychart.core.cartesian.series.Base.prototype.finalizeDrawing;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['getIterator'] = anychart.core.cartesian.series.Base.prototype.getIterator;//doc|need-ex
//anychart.core.cartesian.series.Base.prototype['getResetIterator'] = anychart.core.cartesian.series.Base.prototype.getResetIterator;//doc|need-ex
//exports
anychart.core.cartesian.series.Base.prototype['clip'] = anychart.core.cartesian.series.Base.prototype.clip;
anychart.core.cartesian.series.Base.prototype['xPointPosition'] = anychart.core.cartesian.series.Base.prototype.xPointPosition;
anychart.core.cartesian.series.Base.prototype['xScale'] = anychart.core.cartesian.series.Base.prototype.xScale;
anychart.core.cartesian.series.Base.prototype['yScale'] = anychart.core.cartesian.series.Base.prototype.yScale;
anychart.core.cartesian.series.Base.prototype['error'] = anychart.core.cartesian.series.Base.prototype.error;
anychart.core.cartesian.series.Base.prototype['transformX'] = anychart.core.cartesian.series.Base.prototype.transformX;
anychart.core.cartesian.series.Base.prototype['transformY'] = anychart.core.cartesian.series.Base.prototype.transformY;
anychart.core.cartesian.series.Base.prototype['getPixelPointWidth'] = anychart.core.cartesian.series.Base.prototype.getPixelPointWidth;
