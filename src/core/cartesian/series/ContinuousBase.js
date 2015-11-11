goog.provide('anychart.core.cartesian.series.ContinuousBase');
goog.require('acgraph');
goog.require('anychart.core.cartesian.series.BaseWithMarkers');



/**
 * A base for all continuous series, like lines, splines, areas, etc.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.BaseWithMarkers}
 */
anychart.core.cartesian.series.ContinuousBase = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.path.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES);

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

  /**
   * @type {boolean}
   * @protected
   */
  this.connectMissing = false;
};
goog.inherits(anychart.core.cartesian.series.ContinuousBase, anychart.core.cartesian.series.BaseWithMarkers);


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.drawPoint = function(pointState) {
  if (this.enabled()) {
    var pointDrawn;
    if (this.firstPointDrawn)
      pointDrawn = this.drawSubsequentPoint(pointState);
    else
      pointDrawn = this.drawFirstPoint(pointState);
    if (pointDrawn) {
      this.drawMarker(pointState);
      this.drawLabel(pointState);
      if (this.isErrorAvailable())
        this.drawError();
    }
    // if connectMissing == true, firstPointDrawn will never be false when drawing.
    this.firstPointDrawn = (this.connectMissing && this.firstPointDrawn) || pointDrawn;
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  var i;
  var len = this.paths.length;
  for (i = 0; i < len; i++) {
    this.makeInteractive(this.paths[i], true);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    for (i = 0; i < len; i++)
      this.paths[i].clear();

    var seriesState = this.state.seriesState;
    this.colorizeShape(seriesState | this.state.getSeriesState());
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
      this.hatchFillPath.zIndex(anychart.core.cartesian.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillPath.disablePointerEvents(true);
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.drawMissing = function() {
  if (!this.connectMissing) {
    goog.base(this, 'drawMissing');
    this.finalizeSegment();
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.finalizeDrawing = function() {
  this.finalizeSegment();
  this.finalizeHatchFill();
  goog.base(this, 'finalizeDrawing');
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.createPositionProvider = function(position) {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('value')}};
};


/**
 * Finalizes continuous segment drawing.
 * @protected
 */
anychart.core.cartesian.series.ContinuousBase.prototype.finalizeSegment = goog.nullFunction;


/**
 * Finalizes hatch fill element.
 * @protected
 */
anychart.core.cartesian.series.ContinuousBase.prototype.finalizeHatchFill = goog.nullFunction;


/**
 * Getter/setter for connectMissingPoints.
 * @param {boolean=} opt_value The value to be set.
 * @return {!anychart.core.cartesian.series.Base|boolean} The setting, or itself for method chaining.
 */
anychart.core.cartesian.series.ContinuousBase.prototype.connectMissingPoints = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.connectMissing != opt_value) {
      this.connectMissing = opt_value;
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
anychart.core.cartesian.series.ContinuousBase.prototype.colorizeShape = function(pointState) {
  this.path.stroke(this.getFinalStroke(false, pointState), 2);
  this.path.fill(null);
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.cartesian.series.ContinuousBase.prototype.applyHatchFill = function(pointState) {
  if (this.hatchFillPath) {
    this.hatchFillPath.stroke(null);
    this.hatchFillPath.fill(this.getFinalHatchFill(false, pointState));
  }
};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.core.cartesian.series.ContinuousBase.prototype.applyAppearanceToPoint = function(pointState) {
  this.drawMarker(pointState);
  this.drawLabel(pointState);
};


/**
 * Apply appearance to series.
 * @param {anychart.PointState|number} pointState .
 */
anychart.core.cartesian.series.ContinuousBase.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousBase.prototype.getIndexByEvent = function(event) {
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


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['connectMissingPoints'] = this.connectMissingPoints();
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousBase.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.connectMissingPoints(config['connectMissingPoints']);
};


//anychart.core.cartesian.series.ContinuousBase.prototype['startDrawing'] = anychart.core.cartesian.series.ContinuousBase.prototype.startDrawing;//inherited
//anychart.core.cartesian.series.ContinuousBase.prototype['drawMissing'] = anychart.core.cartesian.series.ContinuousBase.prototype.drawMissing;//inherited
//exports
anychart.core.cartesian.series.ContinuousBase.prototype['connectMissingPoints'] = anychart.core.cartesian.series.ContinuousBase.prototype.connectMissingPoints;//doc|ex
