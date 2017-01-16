goog.provide('anychart.core.radar.series.Base');
goog.require('acgraph');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');


/**
 * Namespace anychart.core.radar
 * @namespace
 * @name anychart.core.radar
 */



/**
 * Base class for all radar series.<br/>
 * Base class defines common methods, such as those for:
 * <ul>
 *   <li>Binding series to a scale: <i>xScale, yScale</i></li>
 *   <li>Base color settings: <i>color</i></li>
 * </ul>
 * You can also obtain <i>getIterator, getResetIterator</i> iterators here
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.SeriesBase}
 */
anychart.core.radar.series.Base = function(opt_data, opt_csvSettings) {
  anychart.core.radar.series.Base.base(this, 'constructor', opt_data, opt_csvSettings);
  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;
};
goog.inherits(anychart.core.radar.series.Base, anychart.core.SeriesBase);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.radar.series.Base.SeriesTypesMap = {};


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.radar.series.Base.prototype.pixelBoundsCache;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.radar.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeriesBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.radar.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeriesBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.radar.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.radar.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * @type {anychart.core.utils.Padding}
 * @private
 */
anychart.core.radar.series.Base.prototype.axesLinesSpace_;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.radar.series.Base.prototype.firstPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.radar.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.radar.series.Base.prototype.xScale_ = null;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.core.radar.series.Base.prototype.zeroY = 0;


/**
 * @type {number}
 * @protected
 */
anychart.core.radar.series.Base.prototype.radius;


/**
 * @type {number}
 * @protected
 */
anychart.core.radar.series.Base.prototype.cx;


/**
 * @type {number}
 * @protected
 */
anychart.core.radar.series.Base.prototype.cy;


/**
 * Whether getReferenceCoords() must support stacking.
 * @type {boolean}
 * @protected
 */
anychart.core.radar.series.Base.prototype.referenceValuesSupportStack = true;


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.core.radar.series.Base.prototype.supportsStack = function() {
  return this.referenceValuesSupportStack;
};


/**
 * @type {anychart.enums.MarkerType}
 * @protected
 */
anychart.core.radar.series.Base.prototype.autoMarkerType;


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.radar.series.Base)} .
 */
anychart.core.radar.series.Base.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * DO NOT PUBLISH.
 */
anychart.core.radar.series.Base.prototype.resetCategorisation = function() {
  if (this.dataInternal != this.parentView)
    goog.dispose(this.dataInternal);
  this.dataInternal = /** @type {!anychart.data.View} */(this.parentView);
};


/**
 * DO NOT PUBLISH.
 * @param {!Array.<*>|boolean} categories If Array - ordinal scale, if false - scatter scale with numbers,
 *    true - datetime scale.
 */
anychart.core.radar.series.Base.prototype.categoriseData = function(categories) {
  this.dataInternal = this.parentView.prepare('x', categories);
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {*} Fetches significant scale values from current data row.
 */
anychart.core.radar.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var iterator = this.getIterator();
  var yScale = this.yScale();
  var val = iterator.get('value');
  if (yScale.isMissing(val)) return null;
  return val;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<number>} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.radar.series.Base.prototype.getValuePointCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  var stacked = yScale.stackMode() != anychart.enums.ScaleStackMode.NONE;

  var xVal = iterator.get('x');
  var yVal = iterator.get('value');

  if (!goog.isDef(xVal) || !goog.isDef(yVal)) {
    if (stacked && this.referenceValuesSupportStack)
      fail = true;
    else
      return null;
  }

  if (this.referenceValuesSupportStack)
    yVal = yScale.applyStacking(yVal);
  else if (yScale.isMissing(yVal))
    yVal = NaN;

  var xRatio = xScale.transform(xVal, 0);
  var yRatio = yScale.transform(yVal, .5);
  var angleRad = goog.math.toRadians(this.startAngle_ - 90 + 360 * xRatio);
  var currRadius = this.radius * yRatio;
  var xPix, yPix;

  xPix = xScale.isMissing(xVal) ? NaN : this.cx + currRadius * Math.cos(angleRad);
  yPix = this.cy + currRadius * Math.sin(angleRad);

  if (isNaN(xPix) || isNaN(yPix)) fail = true;
  res.push(xPix, yPix);

  return fail ? null : res;
};


/**
 * Transforms values to pix coords.
 * @param {*} xVal
 * @param {*} yVal
 * @param {number=} opt_xSubRangeRatio
 * @return {Object.<string, number>} Pix values.
 */
anychart.core.radar.series.Base.prototype.transformXY = function(xVal, yVal, opt_xSubRangeRatio) {
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());

  var xRatio = xScale.transform(xVal, opt_xSubRangeRatio || 0);
  var yRatio = yScale.transform(yVal, .5);
  var angleRad = goog.math.toRadians(this.startAngle_ - 90 + 360 * xRatio);
  var currRadius = this.radius * yRatio;
  var xPix, yPix;

  xPix = xScale.isMissing(xVal) ? NaN : this.cx + currRadius * Math.cos(angleRad);
  yPix = this.cy + currRadius * Math.sin(angleRad);
  return {'x': xPix, 'y': yPix};
};


/**
 * @return {?Array.<number>} .
 * @protected
 */
anychart.core.radar.series.Base.prototype.getZeroPointCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  var stacked = yScale.stackMode() != anychart.enums.ScaleStackMode.NONE;

  var xVal = iterator.get('x');
  var yVal = iterator.get('value');

  if (!goog.isDef(xVal) || !goog.isDef(yVal)) {
    if (stacked && this.referenceValuesSupportStack)
      fail = true;
    else
      return null;
  }

  var yRatio;
  var xRatio = xScale.transform(xVal, 0);

  if (stacked) {
    if (this.referenceValuesSupportStack) {
      if (isNaN(yVal)) yVal = 1;  //scale hack!
      yVal = yScale.getPrevVal(yVal);
    } else if (yScale.isMissing(yVal))
      yVal = NaN;
    yRatio = goog.math.clamp(yScale.transform(yVal, 0.5), 0, 1);
  } else {
    yRatio = yScale.transform(0);
    if (isNaN(yRatio)) yRatio = 0;
    yRatio = goog.math.clamp(yRatio, 0, 1);
  }

  var angleRad = goog.math.toRadians(this.startAngle_ - 90 + 360 * xRatio);
  var currRadius = this.radius * yRatio;
  var xPix, yPix;

  xPix = xScale.isMissing(xVal) ? NaN : this.cx + currRadius * Math.cos(angleRad);
  yPix = this.cy + currRadius * Math.sin(angleRad);


  if (isNaN(xPix) || isNaN(yPix)) fail = true;
  res.push(xPix, yPix);

  return fail ? null : res;
};


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.core.radar.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {anychart.math.Rect} */
  var bounds = this.pixelBoundsCache;
  var min, range;
  if (horizontal) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.radar.series.Base.prototype.supportsMarkers = function() {
  return false;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.radar.series.Base.prototype.isDiscreteBased = function() {
  return false;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws a pint iterator points to.<br/>
 * Closes polygon in a correct way if missing occured;
 * @param {anychart.PointState|number} pointState Point state.
 */
anychart.core.radar.series.Base.prototype.drawPoint = function(pointState) {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint(pointState | this.state.getSeriesState());
    else
      this.firstPointDrawn = this.drawFirstPoint(pointState | this.state.getSeriesState());
    if (this.firstPointDrawn) {
      this.drawLabel(pointState);
    }
  }
};


/**
 * This method is used by a parallel iterator in case series needs to
 * draw a missing point (given series has no such X, and other
 * series has it).
 */
anychart.core.radar.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
  if (this.yScale().stackMode() != anychart.enums.ScaleStackMode.NONE && this.referenceValuesSupportStack)
    this.yScale().applyStacking(NaN);
};


/** @inheritDoc */
anychart.core.radar.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  anychart.core.radar.series.Base.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.radar.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  this.pixelBoundsCache = this.getPixelBounds();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = this.pixelBoundsCache;
    this.radius = Math.min(bounds.width, bounds.height) / 2;
    this.cx = Math.round(bounds.left + bounds.width / 2);
    this.cy = Math.round(bounds.top + bounds.height / 2);
  }

  /** @type {anychart.scales.Base} */
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = yScale.transform(0);
  if (isNaN(res))
    res = 0;
  var ratio = goog.math.clamp(res, 0, 1);
  var angleRad = goog.math.toRadians(360 * ratio);

  this.zeroY = this.cy + this.radius * ratio * Math.sin(angleRad);

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.selectLabels().suspendSignalsDispatching();
  this.labels().clear();
  this.labels().container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.labels().parentBounds(this.pixelBoundsCache);

  this.drawA11y();
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.radar.series.Base.prototype.finalizeDrawing = function() {
  this.labels().draw();
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
anychart.core.radar.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, ['x', 'value'], false);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.radar.series.Base.prototype.createPositionProvider = function(position) {
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
anychart.core.radar.series.Base.prototype.drawFirstPoint = function(pointState) {
  return this.drawSubsequentPoint(pointState);
};


/**
 * Draws subsequent point in continuous series.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.radar.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.radar.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.radar.series.Base.prototype.xScale = function(opt_value) {
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
 * @return {(anychart.scales.Base|!anychart.core.radar.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.radar.series.Base.prototype.yScale = function(opt_value) {
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
anychart.core.radar.series.Base.prototype.scaleInvalidated_ = function(event) {
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
/**
 * Calculate series statisctics.
 */
anychart.core.radar.series.Base.prototype.calculateStatistics = function() {
  var seriesMax = -Infinity;
  var seriesMin = Infinity;
  var seriesSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var value = this.getReferenceScaleValues();
    if (value) {
      var y = anychart.utils.toNumber(value);
      if (!isNaN(y)) {
        seriesMax = Math.max(seriesMax, y);
        seriesMin = Math.min(seriesMin, y);
        seriesSum += y;
      }
    }
    seriesPointsCount++;
  }
  var seriesAverage = seriesSum / seriesPointsCount;

  this.statistics(anychart.enums.Statistics.SERIES_Y_MAX, seriesMax);
  this.statistics(anychart.enums.Statistics.SERIES_MAX, seriesMax);
  this.statistics(anychart.enums.Statistics.SERIES_MIN, seriesMin);
  this.statistics(anychart.enums.Statistics.SERIES_Y_MIN, seriesMin);
  this.statistics(anychart.enums.Statistics.SERIES_SUM, seriesSum);
  this.statistics(anychart.enums.Statistics.SERIES_AVERAGE, seriesAverage);
  this.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT, seriesPointsCount);
  this.statistics(anychart.enums.Statistics.SERIES_POINT_COUNT, seriesPointsCount);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.radar.series.Base.prototype.setAutoMarkerType = function(value) {
  this.autoMarkerType = value;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.radar.series.Base.prototype.getEnableChangeSignals = function() {
  return anychart.core.radar.series.Base.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED | anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//------------------------------------------- ---------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.radar.series.Base.prototype.serialize = function() {
  var json = anychart.core.radar.series.Base.base(this, 'serialize');
  json['seriesType'] = this.getType();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.radar.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.radar.series.Base.base(this, 'setupByJSON', config, opt_default);
};


//proto['drawPoint'] = proto.drawPoint;
//proto['drawMissing'] = proto.drawMissing;
//proto['startDrawing'] = proto.startDrawing;
//proto['finalizeDrawing'] = proto.finalizeDrawing;
//proto['getIterator'] = proto.getIterator;
//proto['getResetIterator'] = proto.getResetIterator;
//exports
(function() {
  var proto = anychart.core.radar.series.Base.prototype;
  proto['color'] = proto.color;//doc|ex
  proto['name'] = proto.name;//doc|ex
  proto['meta'] = proto.meta;//doc|ex
  proto['data'] = proto.data;//doc|ex
  proto['labels'] = proto.labels;//doc|ex
  proto['hoverLabels'] = proto.hoverLabels;
  proto['xScale'] = proto.xScale;//need-ex
  proto['yScale'] = proto.yScale;//need-ex
  proto['hover'] = proto.hover;
  proto['transformXY'] = proto.transformXY;
})();
