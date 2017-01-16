goog.provide('anychart.core.sparkline.series.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.data');
goog.require('anychart.enums');



/**
 * Base class for all sparkline series.<br/>
 * Base class defines common methods, such as those for:
 * <ul>
 *   <li>Binding series to a scale: <i>xScale, yScale</i></li>
 *   <li>Base color settings: <i>color</i></li>
 * </ul>
 * You can also obtain <i>getIterator, getResetIterator</i> iterators here.
 * @param {!anychart.charts.Sparkline} chart Chart.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.sparkline.series.Base = function(chart) {
  this.suspendSignalsDispatching();
  /**
   * @type {anychart.core.utils.SeriesPointContextProvider}
   * @private
   */
  this.pointProvider_;
  anychart.core.sparkline.series.Base.base(this, 'constructor');

  /**
   * Chart instance.
   * @type {anychart.charts.Sparkline}
   * @protected
   */
  this.chart = chart;

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.sparkline.series.Base, anychart.core.VisualBaseWithBounds);


/**
 * Map of series constructors by type.
 * @type {Object.<string, Function>}
 */
anychart.core.sparkline.series.Base.SeriesTypesMap = {};


/**
 * @type {anychart.math.Rect}
 */
anychart.core.sparkline.series.Base.prototype.pixelBoundsCache = null;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.sparkline.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.sparkline.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_HATCH_FILL |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_MARKERS |
    anychart.ConsistencyState.SERIES_DATA;


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.sparkline.series.Base.ZINDEX_SERIES = 1;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.sparkline.series.Base.ZINDEX_HATCH_FILL = 2;


/**
 * Root layer.
 * @type {acgraph.vector.Layer}
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.rootLayer;


/**
 * @type {boolean}
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.firstPointDrawn = false;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.zeroY = 0;


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current iterator.
 */
anychart.core.sparkline.series.Base.prototype.getIterator = function() {
  return this.chart.getIterator();
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.core.sparkline.series.Base.prototype.getResetIterator = function() {
  return this.chart.getResetIterator();
};


/**
 * Returns chart.
 * @return {anychart.charts.Sparkline}
 */
anychart.core.sparkline.series.Base.prototype.getChart = function() {
  return this.chart;
};


/**
 * Interface function.
 * @return {boolean}
 */
anychart.core.sparkline.series.Base.prototype.isSizeBased = function() {
  return false;
};


/**
 * Gets an array of reference 'y' fields from the row iterator point to
 * and gets pixel values. Reference fields are defined using referenceValueNames and referenceValueMeanings.
 * If there is only one field - a value is returned.
 * If there are several - array.
 * If any of the two is undefined - returns null.
 *
 * @return {?Array.<number>} Array with values or null, any of the two is undefined.
 *    (we do so to avoid reiterating to check on missing).
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var yScale = /** @type {anychart.scales.Base} */(this.chart.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.chart.xScale());
  var iterator = this.getIterator();
  var fail = false;

  var xVal = iterator.get('x');
  var yVal = iterator.get('value');

  if (!goog.isDef(xVal) || !goog.isDef(yVal))
    return null;

  if (yScale.isMissing(yVal))
    yVal = NaN;

  var xPix = xScale.isMissing(xVal) ?
      NaN :
      this.applyRatioToBounds(xScale.transform(xVal, .5), true);
  var yPix = this.applyRatioToBounds(yScale.transform(yVal, .5), false);

  if (isNaN(xPix) || isNaN(yPix)) fail = true;

  return fail ? null : [xPix, yPix];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tester if the series is width based (column, rangeColumn).
 * @return {boolean}
 */
anychart.core.sparkline.series.Base.prototype.isWidthBased = function() {
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
 */
anychart.core.sparkline.series.Base.prototype.drawPoint = function() {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint();
    else
      this.firstPointDrawn = this.drawFirstPoint();
    if (this.firstPointDrawn) {
      this.drawLabel();
    }
  }

  if (this.enabled() && this.firstPointDrawn) {
    this.drawMarker();
  }
};


/**
 * This method is used by a parallel iterator in case series needs to
 * draw a missing point (given series has no such X, and other
 * series has it).
 */
anychart.core.sparkline.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
};


/** @inheritDoc */
anychart.core.sparkline.series.Base.prototype.remove = function() {
  this.chart.markers().container(null);

  if (this.rootLayer)
    this.rootLayer.remove();

  this.chart.labels().container(null);

  anychart.core.sparkline.series.Base.base(this, 'remove');
};


/**
 * Initializes sereis draw.<br/>
 * If scale is not explicitly set - creates a default one.
 */
anychart.core.sparkline.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;
  this.pixelBoundsCache = this.getPixelBounds();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
    this.registerDisposable(this.rootLayer);
  }

  this.checkDrawingNeeded();

  var labels = this.chart.getLabelsInternal();
  labels.suspendSignalsDispatching();
  labels.clear();
  labels.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  labels.parentBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));

  var markers = this.chart.getMarkersInternal();
  markers.suspendSignalsDispatching();

  var fillColor = this.getMarkerFill();
  markers.setAutoFill(fillColor);

  var strokeColor = /** @type {acgraph.vector.Stroke} */(this.getMarkerStroke());
  markers.setAutoStroke(strokeColor);

  markers.clear();
  markers.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  markers.parentBounds(this.pixelBoundsCache);
};


/**
 * Finishes series draw.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.core.sparkline.series.Base.prototype.finalizeDrawing = function() {
  var clip;
  var markers = this.chart.getMarkersInternal();
  markers.draw();

  clip = /** @type {!anychart.math.Rect} */(goog.isBoolean(this.chart.clip()) ?
      this.chart.clip() ?
          this.chart.getPixelBounds() :
          'none' :
      this.chart.clip());

  var markerDOM = markers.getDomElement();
  if (markerDOM) markerDOM.clip(/** @type {anychart.math.Rect} */(clip));

  markers.resumeSignalsDispatching(false);
  markers.markConsistent(anychart.ConsistencyState.ALL);

  var labels = this.chart.getLabelsInternal();
  labels.draw();

  var labelDOM = labels.getDomElement();
  if (labelDOM) labelDOM.clip(/** @type {anychart.math.Rect} */(clip));

  labels.resumeSignalsDispatching(false);

  if (labels)
    labels.markConsistent(anychart.ConsistencyState.ALL);
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
 */
anychart.core.sparkline.series.Base.prototype.createFormatProvider = function(opt_force) {
  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.core.utils.SeriesPointContextProvider(this, ['x', 'value'], false);
  this.pointProvider_.applyReferenceValues();
  return this.pointProvider_;
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.core.sparkline.series.Base.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.sparkline.series.Base.prototype.createPositionProvider = function(position) {
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
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.drawFirstPoint = function() {
  return this.drawSubsequentPoint();
};


/**
 * Draws subsequent point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
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


/**
 * Draws marker for a point.
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.drawLabel = function() {
  var label = this.chart.getFinalLabel(true);
  if (label)
    label.draw();
};


/**
 * Draws marker for the point.
 * @protected
 */
anychart.core.sparkline.series.Base.prototype.drawMarker = function() {
  var marker = this.chart.getFinalMarker(true);
  if (marker)
    marker.draw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Return marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 */
anychart.core.sparkline.series.Base.prototype.getMarkerFill = function() {
  return acgraph.vector.normalizeFill(/** @type {!acgraph.vector.Fill} */(
      this.chart.normalizeColor(/** @type {acgraph.vector.Fill|Function} */(this.chart.fill()))));
};


/**
 * Return marker color for series.
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)} Marker color for series.
 */
anychart.core.sparkline.series.Base.prototype.getMarkerStroke = function() {
  return anychart.color.darken(this.getMarkerFill());
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for series default settings.
 * @return {Object} Return settings object.
 */
anychart.core.sparkline.series.Base.prototype.getDefaults = function() {
  this.chart.getMarkersInternal().type('circle').size(1.8).position(anychart.enums.Position.CENTER);
  return {
    'labels': {
      'background': {
        enabled: false
      },
      'position': anychart.enums.Position.CENTER,
      'anchor': anychart.enums.Position.CENTER_BOTTOM
    },
    'color': '#4682B4'
  };
};

