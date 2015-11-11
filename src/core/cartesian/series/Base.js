goog.provide('anychart.core.cartesian.series.Base');
goog.require('acgraph');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');
goog.require('anychart.scales.Linear');
goog.require('anychart.scales.Ordinal');
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
};
goog.inherits(anychart.core.cartesian.series.Base, anychart.core.SeriesBase);


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
anychart.core.cartesian.series.Base.prototype.firstPointDrawn = false;


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


/**
 * Field names certain type of series needs from data set.
 * For example ['x', 'value']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * @type {!Array.<string>}
 */
anychart.core.cartesian.series.Base.prototype.referenceValueNames;


/**
 * Attributes names list from referenceValueNames. Must be the same length as referenceValueNames.
 * For example ['x', 'y']. Must be created in constructor. getReferenceCoords() doesn't work without this.
 * Possible values:
 *    'x' - transforms through xScale,
 *    'y' - transforms through yScale,
 *    'z' - gets as zero Y.
 * NOTE: if we need zeroY, you need to ask for it prior toall 'y' values.
 * @type {!Array.<string>}
 */
anychart.core.cartesian.series.Base.prototype.referenceValueMeanings;


/**
 * Whether getReferenceCoords() must support stacking.
 * @type {boolean}
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.referenceValuesSupportStack = true;


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.core.cartesian.series.Base.prototype.supportsStack = function() {
  return this.referenceValuesSupportStack;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * DO NOT PUBLISH.
 */
anychart.core.cartesian.series.Base.prototype.resetCategorisation = function() {
  if (this.dataInternal != this.parentView)
    goog.dispose(this.dataInternal);
  this.dataInternal = /** @type {!anychart.data.View} */(this.parentView);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.core.cartesian.series.Base.prototype.categoriseData = function(categories) {
  this.dataInternal = this.parentView.prepare('x', categories);
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<*>|null} Fetches significant scale values from current data row.
 */
anychart.core.cartesian.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  var yScale = /** @type {anychart.scales.Base} */ (this.yScale());
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (yScale.isMissing(val)) return null;
    res.push(val);
  }

  if (anychart.core.utils.Error.isErrorAvailableForScale(yScale) && this.isErrorAvailable()) {
    var errValues = this.getErrorValues(false);
    errValues[0] = +res[0] - errValues[0];
    errValues[1] = +res[0] + errValues[1];
    res = res.concat(errValues);
  }
  return res;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {Array.<number>|null} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  var stacked = yScale.stackMode() != anychart.enums.ScaleStackMode.NONE;
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var val = iterator.get(this.referenceValueNames[i]);

    if (!goog.isDef(val)) {
      if (stacked && this.referenceValuesSupportStack)
        fail = true;
      else
        return null;
    }

    var pix;

    switch (this.referenceValueMeanings[i]) {
      case 'x':
        if (xScale.isMissing(val))
          pix = NaN;
        else {
          var ratio0 = xScale.transform(val, 0);
          var ratio1 = xScale.transform(val, 1);
          if (ratio0 < 0 && ratio1 < 0 || ratio0 > 1 && ratio1 > 1) {
            pix = NaN;
          } else
            pix = this.applyRatioToBounds(xScale.transform(val, /** @type {number} */(this.xPointPosition())), true);
        }
        break;
      case 'y':
        iterator.meta('stackZero', yScale.getPrevVal(val));
        if (this.referenceValuesSupportStack)
          val = yScale.applyStacking(val);
        else if (yScale.isMissing(val))
          val = NaN;
        iterator.meta('stackValue', val);
        pix = this.applyRatioToBounds(yScale.transform(val, 0.5), false);
        break;
      case 'z':
        if (stacked) {
          if (this.referenceValuesSupportStack)
            val = yScale.getPrevVal(val);
          else if (yScale.isMissing(val))
            val = NaN;
          pix = this.applyRatioToBounds(goog.math.clamp(yScale.transform(val, 0.5), 0, 1), false);
        } else {
          pix = this.zeroY;
        }
        break;
      case 'n':
        pix = /** @type {number} */(+val);
        break;
    }

    if (isNaN(pix)) fail = true;

    res.push(pix);
  }
  return fail ? null : res;
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
 * Tester if the series can have an error. (All except range series, OHLC, Bubble).
 * @return {boolean}
 */
anychart.core.cartesian.series.Base.prototype.isErrorAvailable = function() {
  return true;
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
anychart.core.cartesian.series.Base.prototype.draw = function() {
  this.suspendSignalsDispatching();
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  var iterator;
  var value;
  var scale;
  if (!(scale = this.xScale()))
    this.xScale(scale = new anychart.scales.Ordinal());
  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = iterator.get('x');
      if (goog.isDef(value))
        scale.extendDataRange(value);
    }
    scale.finishAutoCalc();
  }
  this.categoriseData(scale.getCategorisation());
  if (!(scale = this.yScale()))
    this.yScale(scale = new anychart.scales.Linear());
  if (scale.needsAutoCalc()) {
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = this.getReferenceScaleValues();
      if (value)
        scale.extendDataRange.apply(/** @type {anychart.scales.Base} */(scale), value);
    }
    scale.finishAutoCalc();
  }

  iterator = this.getResetIterator();
  this.startDrawing();

  while (iterator.advance()) {
    var index = iterator.getIndex();
    if (iterator.get('selected'))
      this.state.setPointState(anychart.PointState.SELECT, index);

    this.drawPoint(this.state.getPointStateByIndex(index));
  }
  this.finalizeDrawing();

  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);

  return this;
};


/**
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.core.cartesian.series.Base.prototype.drawPoint = function(pointState) {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint(pointState | this.state.getSeriesState());
    else
      this.firstPointDrawn = this.drawFirstPoint(pointState | this.state.getSeriesState());
    if (this.firstPointDrawn) {
      this.drawLabel(pointState);
      if (this.isErrorAvailable())
        this.drawError();
    }
  }
};


/**
 * This method is used by a parallel iterator in case series needs to
 * draw a missing point (given series has no such X, and other
 * series has it).
 */
anychart.core.cartesian.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
  if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE && this.referenceValuesSupportStack) {
    for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
      if (this.referenceValueMeanings[i] == 'y')
        this.yScale().applyStacking(NaN);
    }
  }
};


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
  this.firstPointDrawn = false;
  this.pixelBoundsCache = this.getPixelBounds();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;

  this.zeroY = this.applyAxesLinesSpace(this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false));

  this.checkDrawingNeeded();
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.resetErrorPaths();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
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
  // This check need to prevent finalizeDrawing to mark CONTAINER consistency state in case when series was disabled by
  // series.enabled(false).
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.markConsistent(anychart.ConsistencyState.ALL & !anychart.ConsistencyState.CONTAINER);
  } else {
    this.markConsistent(anychart.ConsistencyState.ALL);
  }
};


/**
 * Create base series format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, this.referenceValueNames,
        this.isErrorAvailable() && anychart.core.utils.Error.isErrorAvailableForScale(this.xScale_));
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
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.cartesian.series.Base.prototype.drawFirstPoint = function(pointState) {
  return this.drawSubsequentPoint(pointState);
};


/**
 * Draws subsequent point in continuous series.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {boolean} Returns true if point was successfully drawn.
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
  if (!(this.rootLayer.clip() instanceof acgraph.vector.Clip)) {
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
  }
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
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.cartesian.series.Base.prototype.calculateStatistics = function() {
  var seriesMax = -Infinity;
  var seriesMin = Infinity;
  var seriesSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var values = this.getReferenceScaleValues();
    if (values) {
      var y = anychart.utils.toNumber(values[0]);
      if (!isNaN(y)) {
        seriesMax = Math.max(seriesMax, y);
        seriesMin = Math.min(seriesMin, y);
        seriesSum += y;
      }
    }
    seriesPointsCount++;
  }
  var seriesAverage = seriesSum / seriesPointsCount;

  this.statistics('seriesMax', seriesMax);
  this.statistics('seriesMin', seriesMin);
  this.statistics('seriesSum', seriesSum);
  this.statistics('seriesAverage', seriesAverage);
  this.statistics('seriesPointsCount', seriesPointsCount);
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
 * @return {anychart.enums.CartesianSeriesType} Series type.
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
anychart.core.cartesian.series.Base.prototype['clip'] = anychart.core.cartesian.series.Base.prototype.clip;//doc|ex
anychart.core.cartesian.series.Base.prototype['xPointPosition'] = anychart.core.cartesian.series.Base.prototype.xPointPosition;//doc|ex
anychart.core.cartesian.series.Base.prototype['xScale'] = anychart.core.cartesian.series.Base.prototype.xScale;//doc|ex
anychart.core.cartesian.series.Base.prototype['yScale'] = anychart.core.cartesian.series.Base.prototype.yScale;//doc|ex
anychart.core.cartesian.series.Base.prototype['error'] = anychart.core.cartesian.series.Base.prototype.error;
anychart.core.cartesian.series.Base.prototype['transformX'] = anychart.core.cartesian.series.Base.prototype.transformX;
anychart.core.cartesian.series.Base.prototype['transformY'] = anychart.core.cartesian.series.Base.prototype.transformY;
anychart.core.cartesian.series.Base.prototype['getPixelPointWidth'] = anychart.core.cartesian.series.Base.prototype.getPixelPointWidth;
