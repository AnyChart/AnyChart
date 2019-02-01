goog.provide('anychart.sparklineModule.series.ContinuousBase');
goog.require('acgraph');
goog.require('anychart.sparklineModule.series.Base');



/**
 * A base for all continuous series, like lines, splines, areas, etc.
 * @param {!anychart.sparklineModule.Chart} chart Chart.
 * @constructor
 * @extends {anychart.sparklineModule.series.Base}
 */
anychart.sparklineModule.series.ContinuousBase = function(chart) {
  anychart.sparklineModule.series.ContinuousBase.base(this, 'constructor', chart);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.path.zIndex(anychart.sparklineModule.series.Base.ZINDEX_SERIES);

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.hatchFillPath = null;

  /**
   * @type {Array.<!acgraph.vector.Path>}
   * @protected
   */
  this.paths = [this.path];
};
goog.inherits(anychart.sparklineModule.series.ContinuousBase, anychart.sparklineModule.series.Base);


/**
 * Draws all series points.
 */
anychart.sparklineModule.series.ContinuousBase.prototype.drawPoint = function() {
  if (this.enabled()) {
    var pointDrawn;
    if (this.firstPointDrawn)
      pointDrawn = this.drawSubsequentPoint();
    else
      pointDrawn = this.drawFirstPoint();
    if (pointDrawn) {
      this.drawMarker();
      this.drawLabel();
    }
    // if connectMissing == true, firstPointDrawn will never be false when drawing.
    this.firstPointDrawn = (/** @type {boolean} */ (this.chart.getOption('connectMissingPoints')) && this.firstPointDrawn) || pointDrawn;
  }
};


/** @inheritDoc */
anychart.sparklineModule.series.ContinuousBase.prototype.startDrawing = function() {
  anychart.sparklineModule.series.ContinuousBase.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.chart.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;

  this.zeroY = this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false);

  var i;
  var len = this.paths.length;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var clip;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.chart.clip()) {
      if (goog.isBoolean(this.chart.clip())) {
        clip = this.pixelBoundsCache;
      } else {
        clip = /** @type {!anychart.math.Rect} */(this.chart.clip());
      }
      this.rootLayer.clip(clip);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    for (i = 0; i < len; i++)
      this.paths[i].clear();
    this.colorizeShape();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer.parent(container);
    for (i = 0; i < len; i++)
      this.paths[i].parent(this.rootLayer);
    if (this.hatchFillPath)
      this.hatchFillPath.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (!this.hatchFillPath) {
      this.hatchFillPath = acgraph.path();
      this.hatchFillPath.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillPath.zIndex(anychart.sparklineModule.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillPath.disablePointerEvents(true);
    }
  }
};


/** @inheritDoc */
anychart.sparklineModule.series.ContinuousBase.prototype.drawMissing = function() {
  if (!this.chart.getOption('connectMissingPoints')) {
    anychart.sparklineModule.series.ContinuousBase.base(this, 'drawMissing');
    this.finalizeSegment();
  }
};


/** @inheritDoc */
anychart.sparklineModule.series.ContinuousBase.prototype.finalizeDrawing = function() {
  this.finalizeSegment();
  this.finalizeHatchFill();
  anychart.sparklineModule.series.ContinuousBase.base(this, 'finalizeDrawing');
};


/** @inheritDoc */
anychart.sparklineModule.series.ContinuousBase.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
};


/**
 * Finalizes continuous segment drawing.
 * @protected
 */
anychart.sparklineModule.series.ContinuousBase.prototype.finalizeSegment = goog.nullFunction;


/**
 * Finalizes hatch fill element.
 * @protected
 */
anychart.sparklineModule.series.ContinuousBase.prototype.finalizeHatchFill = goog.nullFunction;


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @protected
 */
anychart.sparklineModule.series.ContinuousBase.prototype.colorizeShape = function() {
  this.path.stroke(this.chart.getFinalStroke(), 1);
  this.path.fill(null);
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @protected
 */
anychart.sparklineModule.series.ContinuousBase.prototype.applyHatchFill = function() {
  if (this.hatchFillPath) {
    this.hatchFillPath.stroke(null);
    this.hatchFillPath.fill(this.chart.normalizeHatchFill(
        /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(this.chart.getOption('hatchFill'))));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.sparklineModule.series.ContinuousBase.prototype.getDefaults = function() {
  return anychart.sparklineModule.series.ContinuousBase.base(this, 'getDefaults');
};
