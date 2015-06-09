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


/**
 * Draws all series points.
 */
anychart.core.cartesian.series.ContinuousBase.prototype.drawPoint = function() {
  if (this.enabled()) {
    var pointDrawn;
    if (this.firstPointDrawn)
      pointDrawn = this.drawSubsequentPoint();
    else
      pointDrawn = this.drawFirstPoint();
    if (pointDrawn) {
      this.drawMarker(this.hoverStatus == this.getIterator().getIndex());
      this.drawLabel(this.hoverStatus == this.getIterator().getIndex());
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
    this.makeHoverable(this.paths[i], true);
  }

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
    for (i = 0; i < len; i++)
      this.paths[i].clear();
    this.colorizeShape(!isNaN(this.hoverStatus));
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
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('y')}};
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
 * Getter for connect missing points setting.
 * @return {boolean} Current setting.
 *//**
 * Setter for connect missing points setting.
 * @example <t>lineChart</t>
 * var blueLine = chart.line([
 *    ['A1', 1],
 *    ['A2', 1.6],
 *    ['A3', 'missing'],
 *    ['A4', 1.1],
 *    ['A5', 1.9]
 * ]).connectMissingPoints(false);
 * var redLine = chart.line([
 *    ['A1', 2],
 *    ['A2', 2.6],
 *    ['A3', 'missing'],
 *    ['A4', 2.1],
 *    ['A5', 2.9]
 * ]).connectMissingPoints(true);
 * @param {boolean=} opt_value [false] If set to <b>true</b>, the series will not be interrupted on missing points.<br/>
 *   Defaults to <b>false</b>. Markers will not be drawn for missing points in both cases.
 * @return {!anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
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
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.core.cartesian.series.ContinuousBase.prototype.colorizeShape = function(hover) {
  this.path.stroke(this.getFinalStroke(false, hover), 2);
  this.path.fill(null);
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.core.cartesian.series.ContinuousBase.prototype.applyHatchFill = function(hover) {
  if (this.hatchFillPath) {
    this.hatchFillPath.stroke(null);
    this.hatchFillPath.fill(this.getFinalHatchFill(false, hover));
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.hoverSeries = function() {
  if (this.hoverStatus == -1) return this;

  //hide tooltip in any case
  this.hideTooltip();

  //unhover current point if any
  if (this.hoverStatus >= 0 && this.getResetIterator().select(this.hoverStatus)) {
    this.drawMarker(false);
    this.drawLabel(false);
    this.hideTooltip();
  }

  //hover all points
  this.applyHatchFill(true);
  this.colorizeShape(true);

  this.hoverStatus = -1;
  return this;
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


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.hoverPoint = function(index, opt_event) {
  if (this.hoverStatus == index) {
    if (this.getIterator().select(index))
      if (opt_event) this.showTooltip(opt_event);
      return this;
  }
  if (this.hoverStatus >= 0 && this.getIterator().select(this.hoverStatus)) {
    this.drawMarker(false);
    this.drawLabel(false);
    this.hideTooltip();
  }
  if (isNaN(this.hoverStatus)) {
    this.applyHatchFill(true);
    this.colorizeShape(true);
  }
  if (this.getIterator().select(index)) {
    this.drawMarker(true);
    this.drawLabel(true);
    if (opt_event) this.showTooltip(opt_event);
    this.hoverStatus = index;
  } else {
    this.hoverStatus = -1;
  }
  return this;
};


/** @inheritDoc */
anychart.core.cartesian.series.ContinuousBase.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;

  //hide tooltip in any case
  this.hideTooltip();

  if (this.hoverStatus >= 0) {
    if (this.getIterator().select(this.hoverStatus)) {
      this.drawMarker(false);
      this.drawLabel(false);
    }
  }

  this.applyHatchFill(false);
  this.colorizeShape(false);
  this.hoverStatus = NaN;
  return this;
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


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.ContinuousBase.prototype.restoreDefaults = function() {
  var res = goog.base(this, 'restoreDefaults');

  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  labels.suspendSignalsDispatching();
  labels.enabled(false);
  labels.anchor('bottom');
  labels.resumeSignalsDispatching(false);

  return res;
};


//anychart.core.cartesian.series.ContinuousBase.prototype['startDrawing'] = anychart.core.cartesian.series.ContinuousBase.prototype.startDrawing;//inherited
//anychart.core.cartesian.series.ContinuousBase.prototype['drawMissing'] = anychart.core.cartesian.series.ContinuousBase.prototype.drawMissing;//inherited
//exports
anychart.core.cartesian.series.ContinuousBase.prototype['connectMissingPoints'] = anychart.core.cartesian.series.ContinuousBase.prototype.connectMissingPoints;//doc|ex
anychart.core.cartesian.series.ContinuousBase.prototype['unhover'] = anychart.core.cartesian.series.ContinuousBase.prototype.unhover;
