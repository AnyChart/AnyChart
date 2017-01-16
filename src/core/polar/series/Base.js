goog.provide('anychart.core.polar.series.Base');
goog.require('acgraph');
goog.require('anychart.core.SeriesBase');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');


/**
 * Namespace anychart.core.polar
 * @namespace
 * @name anychart.core.polar
 */



/**
 * Base class for all polar series.<br/>
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
anychart.core.polar.series.Base = function(opt_data, opt_csvSettings) {
  anychart.core.polar.series.Base.base(this, 'constructor', opt_data, opt_csvSettings);
  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;
};
goog.inherits(anychart.core.polar.series.Base, anychart.core.SeriesBase);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.polar.series.Base.SeriesTypesMap = {};


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.polar.series.Base.prototype.pixelBoundsCache;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.polar.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeriesBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.polar.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeriesBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.polar.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.polar.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Series start angle.
 * @type {number}
 * @private
 */
anychart.core.polar.series.Base.prototype.startAngle_;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.polar.series.Base.prototype.firstPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.polar.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.core.polar.series.Base.prototype.xScale_ = null;


/**
 * @type {number}
 * @protected
 */
anychart.core.polar.series.Base.prototype.radius;


/**
 * @type {number}
 * @protected
 */
anychart.core.polar.series.Base.prototype.cx;


/**
 * @type {number}
 * @protected
 */
anychart.core.polar.series.Base.prototype.cy;


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.core.polar.series.Base)} .
 */
anychart.core.polar.series.Base.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Gets an array of reference 'y' fields from the row iterator points to.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {*} Fetches significant scale values from current data row.
 */
anychart.core.polar.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var iterator = this.getIterator();
  var yScale = this.yScale();

  var val = iterator.get('value');
  if (yScale.isMissing(val)) return null;

  return val;
};


/**
 * Approximate curve.
 * @param {Array.<number>} startPoint .
 * @param {Array.<number>} endPoint .
 * @param {boolean} newSegment .
 * @protected
 * @return {Array.<number>} .
 */
anychart.core.polar.series.Base.prototype.approximateCurve = function(startPoint, endPoint, newSegment) {
  //x coord, y coord, angle, raduis
  var Ax, Ay, Aa, Ar;
  var Bx, By, Ba, Br;
  var Cx, Cy, Ca, Cr;
  var Dx, Dy, Da, Dr;


  var xScale = /** @type {anychart.scales.Base} */(this.xScale());

  if (startPoint) {
    Ax = startPoint[0];
    Ay = startPoint[1];
    Aa = startPoint[2];
    Ar = startPoint[3];
  } else {
    Ax = NaN;
    Ay = NaN;
    Ar = NaN;
    Aa = NaN;
  }

  if (endPoint) {
    Dx = endPoint[0];
    Dy = endPoint[1];
    Da = endPoint[2];
    Dr = endPoint[3];
  } else {
    Dx = NaN;
    Dy = NaN;
    Dr = NaN;
    Da = NaN;
  }

  var zeroAngle = goog.math.modulo(goog.math.toRadians(this.startAngle_ - 90), Math.PI * 2);

  //Angle of point A relative zero angle.
  var AaRZ = goog.math.modulo(Aa - zeroAngle, Math.PI * 2);
  var rounded2Pi = anychart.math.round(Math.PI * 2, 4);
  var roundedARZ = anychart.math.round(AaRZ, 4);

  if (roundedARZ == rounded2Pi || !roundedARZ)
    AaRZ = 0;

  //Angle of point D relative zero angle.
  var DaRZ = goog.math.modulo(Da - zeroAngle, Math.PI * 2);
  var roundedDRZ = anychart.math.round(DaRZ, 4);
  if (roundedDRZ == rounded2Pi || !roundedDRZ)
    DaRZ = 0;

  var isAcrossZeroLine = xScale.inverted() ? AaRZ < DaRZ && AaRZ > 0 : AaRZ > DaRZ && DaRZ > 0;

  var sweep, i;
  if (xScale.inverted()) {
    if (Da > Aa) Da -= Math.PI * 2;
    sweep = Aa - Da;
  } else {
    if (Aa > Da) Aa -= Math.PI * 2;
    sweep = Da - Aa;
  }

  sweep = isNaN(sweep) ? sweep : anychart.math.round(sweep, 4);
  if (!sweep && !isNaN(sweep)) return null;

  var a90 = Math.PI / 2;
  a90 = anychart.math.round(a90, 4);

  var parts = Math.ceil(sweep / a90);
  var isSegmentOverA90 = parts > 1;

  var angles, angle, angleStep, segments;

  if (isAcrossZeroLine) {
    angles = [];
    segments = [];
    var firstSweep, secondSweep;
    if (isAcrossZeroLine) {
      if (xScale.inverted()) {
        firstSweep = AaRZ;
        secondSweep = Math.PI * 2 - DaRZ;
      } else {
        firstSweep = Math.PI * 2 - AaRZ;
        secondSweep = DaRZ;
      }
    }

    parts = firstSweep ? Math.ceil(firstSweep / a90) : 0;
    for (i = 0; i < parts; i++) {
      angleStep = (i == parts - 1 && firstSweep % a90 != 0) ? firstSweep % a90 : a90;
      angle = xScale.inverted() ? -angleStep : angleStep;
      angles.push(angle);
      segments.push(false);
    }

    parts = secondSweep ? Math.ceil(secondSweep / a90) : 0;
    for (i = 0; i < parts; i++) {
      angleStep = (i == parts - 1 && secondSweep % a90 != 0) ? secondSweep % a90 : a90;
      angle = xScale.inverted() ? -angleStep : angleStep;
      angles.push(angle);
      segments.push(!i);
    }
  } else if (isSegmentOverA90) {
    angles = [];
    for (i = 0; i < parts; i++) {
      angleStep = (i == parts - 1 && sweep % a90 != 0) ? sweep % a90 : a90;
      angle = xScale.inverted() ? -angleStep : angleStep;
      angles.push(angle);
    }
  }

  var res = [];
  var P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y;
  if (angles) {
    var Sx = Ax, Sy = Ay, Sa = Aa, Sr = Ar;
    var Ex, Ey, Ea, Er;
    var sPoint, ePoint;

    for (i = 0; i < angles.length; i++) {
      Ea = Sa + angles[i];
      Er = (Ea - Sa) * (Dr - Sr) / (Da - Sa) + Sr;
      Ex = this.cx + Er * Math.cos(Ea);
      Ey = this.cy + Er * Math.sin(Ea);

      sPoint = [Sx, Sy, Sa, Sr];
      ePoint = [Ex, Ey, Ea, Er];

      res.push.apply(res, this.approximateCurve(sPoint, ePoint, segments ? segments[i] : false));

      Sx = Ex; Sy = Ey; Sa = Ea; Sr = Er;
    }
  } else {
    angleStep = sweep / 3;

    if (xScale.inverted()) {
      Ba = Da + angleStep;
      Br = (Ba - Da) * (Ar - Dr) / (Aa - Da) + Dr;
      Bx = this.cx + Br * Math.cos(Ba);
      By = this.cy + Br * Math.sin(Ba);

      Ca = Da + angleStep * 2;
      Cr = (Ca - Da) * (Ar - Dr) / (Aa - Da) + Dr;
      Cx = this.cx + Cr * Math.cos(Ca);
      Cy = this.cy + Cr * Math.sin(Ca);

      P2x = (2 * Dx - 9 * Bx + 18 * Cx - 5 * Ax) / 6;
      P2y = (2 * Dy - 9 * By + 18 * Cy - 5 * Ay) / 6;

      P3x = (-5 * Dx + 18 * Bx - 9 * Cx + 2 * Ax) / 6;
      P3y = (-5 * Dy + 18 * By - 9 * Cy + 2 * Ay) / 6;
    } else {
      Ba = Aa + angleStep;
      Br = (Ba - Aa) * (Dr - Ar) / (Da - Aa) + Ar;
      Bx = this.cx + Br * Math.cos(Ba);
      By = this.cy + Br * Math.sin(Ba);

      Ca = Aa + angleStep * 2;
      Cr = (Ca - Aa) * (Dr - Ar) / (Da - Aa) + Ar;
      Cx = this.cx + Cr * Math.cos(Ca);
      Cy = this.cy + Cr * Math.sin(Ca);

      P2x = (-5 * Ax + 18 * Bx - 9 * Cx + 2 * Dx) / 6;
      P2y = (-5 * Ay + 18 * By - 9 * Cy + 2 * Dy) / 6;

      P3x = (2 * Ax - 9 * Bx + 18 * Cx - 5 * Dx) / 6;
      P3y = (2 * Ay - 9 * By + 18 * Cy - 5 * Dy) / 6;
    }

    P1x = Ax;
    P1y = Ay;

    P4x = Dx;
    P4y = Dy;

    res.push(Aa == zeroAngle || newSegment, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y);
  }

  return res;
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
anychart.core.polar.series.Base.prototype.getValuePointCoords = function() {
  if (!this.enabled())
    return null;

  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;

  var xVal = iterator.get('x');
  var yVal = iterator.get('value');

  if (!goog.isDef(xVal) || !goog.isDef(yVal))
    return null;

  if (yScale.isMissing(yVal))
    yVal = NaN;

  //x coord, y coord, angle, raduis
  var Dx, Dy, Da, Dr;

  var xRatio = xScale.transform(xVal, 0);
  var yRatio = yScale.transform(yVal, .5);

  Da = goog.math.modulo(goog.math.toRadians(this.startAngle_ - 90 + 360 * xRatio), Math.PI * 2);
  Dr = this.radius * yRatio;
  Dx = xScale.isMissing(xVal) ? NaN : this.cx + Dr * Math.cos(Da);
  Dy = this.cy + Dr * Math.sin(Da);

  if (isNaN(Dx) || isNaN(Dy)) fail = true;

  var res = this.approximateCurve(this.prevValuePointCoords, [Dx, Dy, Da, Dr], false);

  if (!fail) {
    if (!this.prevValuePointCoords)
      this.prevValuePointCoords = [];

    this.prevValuePointCoords[0] = Dx;
    this.prevValuePointCoords[1] = Dy;
    this.prevValuePointCoords[2] = Da;
    this.prevValuePointCoords[3] = Dr;
  }

  return fail ? null : res;
};


/**
 * Transforms values to pix coords.
 * @param {*} xVal
 * @param {*} yVal
 * @return {Object.<string, number>} Pix values.
 */
anychart.core.polar.series.Base.prototype.transformXY = function(xVal, yVal) {
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());

  //x coord, y coord, angle, raduis
  var pixX, pixY, angle, radius;

  var xRatio = xScale.transform(xVal, 0);
  var yRatio = yScale.transform(yVal, .5);

  angle = goog.math.modulo(goog.math.toRadians(this.startAngle_ - 90 + 360 * xRatio), Math.PI * 2);
  radius = this.radius * yRatio;
  pixX = xScale.isMissing(xVal) ? NaN : this.cx + radius * Math.cos(angle);
  pixY = this.cy + radius * Math.sin(angle);

  return {'x': pixX, 'y': pixY};
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
anychart.core.polar.series.Base.prototype.supportsMarkers = function() {
  return false;
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.polar.series.Base.prototype.isDiscreteBased = function() {
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
anychart.core.polar.series.Base.prototype.drawPoint = function(pointState) {
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


/** @inheritDoc */
anychart.core.polar.series.Base.prototype.remove = function() {
  if (this.rootLayer)
    this.rootLayer.remove();

  this.labels().container(null);

  anychart.core.polar.series.Base.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.polar.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;
  this.prevValuePointCoords = null;

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.bindHandlersToGraphics(this.rootLayer);
    this.registerDisposable(this.rootLayer);
  }

  this.pixelBoundsCache = this.getPixelBounds();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = /** @type {anychart.math.Rect} */(this.pixelBoundsCache);
    this.radius = Math.min(bounds.width, bounds.height) / 2;
    this.cx = Math.round(bounds.left + bounds.width / 2);
    this.cy = Math.round(bounds.top + bounds.height / 2);
  }

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
anychart.core.polar.series.Base.prototype.finalizeDrawing = function() {
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
anychart.core.polar.series.Base.prototype.createFormatProvider = function(opt_force) {
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
anychart.core.polar.series.Base.prototype.createPositionProvider = function(position) {
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
anychart.core.polar.series.Base.prototype.drawFirstPoint = function(pointState) {
  return this.drawSubsequentPoint(pointState);
};


/**
 * Draws subsequent point in continuous series.
 * @param {anychart.PointState|number} pointState Point state.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.polar.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|!anychart.core.polar.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.core.polar.series.Base.prototype.xScale = function(opt_value) {
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
 * @return {(anychart.scales.Base|!anychart.core.polar.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.polar.series.Base.prototype.yScale = function(opt_value) {
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
anychart.core.polar.series.Base.prototype.scaleInvalidated_ = function(event) {
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
anychart.core.polar.series.Base.prototype.calculateStatistics = function() {
  var seriesMax = -Infinity;
  var seriesMin = Infinity;
  var seriesSum = 0;
  var seriesPointsCount = 0;

  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var values = this.getReferenceScaleValues();
    if (values) {
      var y = anychart.utils.toNumber(values);
      if (!isNaN(y)) {
        seriesMax = Math.max(seriesMax, y);
        seriesMin = Math.min(seriesMin, y);
        seriesSum += y;
      }
    }
    seriesPointsCount++;
  }
  var seriesAverage = seriesSum / seriesPointsCount;

  this.statistics(anychart.enums.Statistics.SERIES_MAX, seriesMax);
  this.statistics(anychart.enums.Statistics.SERIES_Y_MAX, seriesMax);
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
anychart.core.polar.series.Base.prototype.setAutoMarkerType = function(value) {
  this.autoMarkerType = value;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.polar.series.Base.prototype.getEnableChangeSignals = function() {
  return anychart.core.polar.series.Base.base(this, 'getEnableChangeSignals') | anychart.Signal.DATA_CHANGED | anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEED_UPDATE_LEGEND;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.polar.series.Base.prototype.serialize = function() {
  var json = anychart.core.polar.series.Base.base(this, 'serialize');
  json['seriesType'] = this.getType();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.polar.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.polar.series.Base.base(this, 'setupByJSON', config, opt_default);
};


//proto['drawPoint'] = proto.drawPoint;
//proto['startDrawing'] = proto.startDrawing;
//proto['finalizeDrawing'] = proto.finalizeDrawing;
//proto['getIterator'] = proto.getIterator;
//proto['getResetIterator'] = proto.getResetIterator;
//exports
(function() {
  var proto = anychart.core.polar.series.Base.prototype;
  proto['xScale'] = proto.xScale;//need-ex
  proto['yScale'] = proto.yScale;//need-ex
  proto['transformXY'] = proto.transformXY;
})();
