goog.provide('anychart.core.scatter.series.Line');
goog.require('anychart.core.scatter.series.BaseWithMarkers');



/**
 * Define Line series type.<br/>
 * Get instance by methods {@link anychart.charts.Scatter#line}.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.scatter.series.BaseWithMarkers}
 */
anychart.core.scatter.series.Line = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // --- ContinuousBase ---

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.path.zIndex(anychart.core.scatter.series.Base.ZINDEX_SERIES);

  /**
   * @type {boolean}
   * @protected
   */
  this.connectMissing = false;

  // --- end ContinuousBase ---
};
goog.inherits(anychart.core.scatter.series.Line, anychart.core.scatter.series.BaseWithMarkers);
anychart.core.scatter.series.Base.SeriesTypesMap[anychart.enums.ScatterSeriesType.LINE] = anychart.core.scatter.series.Line;


// ----------------------
// --- ContinuousBase ---
// ----------------------
/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.drawPoint = function(pointState) {
  if (this.enabled()) {
    var pointDrawn = this.drawSeriesPoint(pointState);
    if (pointDrawn) {
      this.drawMarker(pointState);
      this.drawLabel(pointState);
      if (this.supportsError() && this.error().hasAnyErrorValues())
        this.drawError();
    }
    this.pointDrawn = (this.connectMissing && this.pointDrawn) || pointDrawn;
  }
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled())
    return;

  this.makeInteractive(this.path, true);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var clip, bounds, axesLinesSpace;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.clip()) {
      if (goog.isBoolean(this.clip())) {
        bounds = this.pixelBoundsCache;
        axesLinesSpace = this.axesLinesSpace();
        clip = axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds));
      } else {
        clip = /** @type {!anychart.math.Rect} */(this.clip());
      }
      this.rootLayer.clip(clip);
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.path.clear();

    var seriesState = this.state.seriesState;
    var state = anychart.PointState.NORMAL;
    if (this.state.hasPointState(anychart.PointState.SELECT))
      state = anychart.PointState.SELECT;
    else if (this.state.hasPointState(anychart.PointState.HOVER))
      state = anychart.PointState.HOVER;

    this.colorizeShape(seriesState | state);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer.parent(container);
    this.path.parent(this.rootLayer);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
};


/**
 * Getter/setter for connectMissingPoints.
 * @param {boolean=} opt_value The value to be set.
 * @return {anychart.core.scatter.series.Line|boolean} The setting, or itself for method chaining.
 */
anychart.core.scatter.series.Line.prototype.connectMissingPoints = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.connectMissing != opt_value) {
      this.connectMissing = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectMissing;
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.scatter.series.Line.prototype.colorizeShape = function(pointState) {
  this.path.stroke(this.getFinalStroke(false, pointState), 2);
  this.path.fill(null);
};
// ----------------------
// --- end ContinuousBase ---
// ----------------------


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.drawSeriesPoint = function(pointState) {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var y = referenceValues[1];

    if (this.pointDrawn)
      this.path.lineTo(x, y);
    else
      this.path.moveTo(x, y);

    this.getIterator().meta('x', x).meta('value', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, anychart.PointState.NORMAL);
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getFinalHatchFill = function(usePointSettings, pointState) {
  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */ (/** @type {Object} */ (null));
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getType = function() {
  return anychart.enums.ScatterSeriesType.LINE;
};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.scatter.series.Line.prototype.applyAppearanceToPoint = function(pointState) {
  this.drawMarker(pointState);
  this.drawLabel(pointState);
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.scatter.series.Line.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeShape(pointState);
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Line.prototype.getIndexByEvent = function(event) {
  var bounds = this.pixelBoundsCache || anychart.math.rect(0, 0, 0, 0);
  var x = event['clientX'];
  var min, range;
  var value, index;

  min = bounds.left + goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container())).x;
  range = bounds.width;
  var ratio = (x - min) / range;
  value = this.xScale().inverseTransform(ratio);
  index = this.data().find('x', value);
  if (index < 0) index = NaN;

  return /** @type {number} */(index);
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['connectMissingPoints'] = this.connectMissingPoints();
  return json;
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.connectMissingPoints(config['connectMissingPoints']);
};

//anychart.core.scatter.series.Line.prototype['startDrawing'] = anychart.core.scatter.series.Line.prototype.startDrawing;//inherited
//exports
anychart.core.scatter.series.Line.prototype['connectMissingPoints'] = anychart.core.scatter.series.Line.prototype.connectMissingPoints;//doc|ex
anychart.core.scatter.series.Line.prototype['stroke'] = anychart.core.scatter.series.Line.prototype.stroke;//inherited
anychart.core.scatter.series.Line.prototype['hoverStroke'] = anychart.core.scatter.series.Line.prototype.hoverStroke;//inherited
anychart.core.scatter.series.Line.prototype['selectStroke'] = anychart.core.scatter.series.Line.prototype.selectStroke;
anychart.core.scatter.series.Line.prototype['getType'] = anychart.core.scatter.series.Line.prototype.getType;
