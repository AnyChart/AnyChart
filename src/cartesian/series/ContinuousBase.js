goog.provide('anychart.cartesian.series.ContinuousBase');

goog.require('anychart.cartesian.series.BaseWithMarkers');



/**
 * A base for all continuous series, like lines, splines, areas, etc.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.BaseWithMarkers}
 */
anychart.cartesian.series.ContinuousBase = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  /**
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();

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
goog.inherits(anychart.cartesian.series.ContinuousBase, anychart.cartesian.series.BaseWithMarkers);


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.remove = function() {
  for (var i = this.paths.length; i--;)
    this.paths[i].remove();
};


/**
 * Draws all series points.
 */
anychart.cartesian.series.ContinuousBase.prototype.drawPoint = function() {
  if (this.enabled()) {
    var pointDrawn;
    if (this.firstPointDrawn)
      pointDrawn = this.drawSubsequentPoint();
    else
      pointDrawn = this.drawFirstPoint();
    if (pointDrawn) {
      this.drawMarker(false);
      this.drawLabel(false);
    }
    // if connectMissing == true, то firstPointDrawn уже не станет false в процессе рисования.
    this.firstPointDrawn = (this.connectMissing && this.firstPointDrawn) || pointDrawn;
  }
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  var i;
  var len = this.paths.length;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    for (i = 0; i < len; i++)
      this.paths[i].zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = /** @type {!anychart.math.Rect} */(this.pixelBounds());
    for (i = 0; i < len; i++)
      this.paths[i].clip(bounds);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    for (i = 0; i < len; i++)
      this.paths[i].clear();
    this.colorizeShape(false);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    for (i = 0; i < len; i++)
      this.paths[i].parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.drawMissing = function() {
  if (!this.connectMissing) {
    goog.base(this, 'drawMissing');
    this.finalizeSegment();
  }
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.finalizeDrawing = function() {
  this.finalizeSegment();
  goog.base(this, 'finalizeDrawing');
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  return {x: iterator.meta('x'), y: iterator.meta('y')};
};


/**
 * Finalizes continuous segment drawing.
 * @protected
 */
anychart.cartesian.series.ContinuousBase.prototype.finalizeSegment = goog.nullFunction;


/**
 * Getter and setter for connect missing points setting.
 * If set to true, the series will not be interrupted on missing points.
 * Defaults to false. Markers will not be drawn for missing points in both cases.
 * @param {boolean=} opt_value The value to be set.
 * @return {!anychart.cartesian.series.Base|boolean} The setting, or itself for chaining.
 */
anychart.cartesian.series.ContinuousBase.prototype.connectMissingPoints = function(opt_value) {
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
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.cartesian.series.ContinuousBase.prototype.colorizeShape = function(hover) {
  this.path.stroke(this.getFinalStroke(false, hover), 2);
  this.path.fill(null);
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.hoverSeries = function() {
  if (this.hoverStatus == -1) return this;
  if (this.hoverStatus >= 0) {
    if (this.getResetIterator().select(this.hoverStatus)) {
      this.drawMarker(false);
      this.drawLabel(false);
    }
  } else {
    this.colorizeShape(true);
  }
  this.hoverStatus = -1;
  return this;
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.hoverPoint = function(index, event) {
  if (this.hoverStatus == index) return this;
  if (this.hoverStatus >= 0 && this.getResetIterator().select(this.hoverStatus)) {
    this.drawMarker(false);
    this.drawLabel(false);
  }
  if (isNaN(this.hoverStatus)) {
    this.colorizeShape(true);
  }
  if (this.getResetIterator().select(index)) {
    this.drawMarker(true);
    this.drawLabel(true);
    this.hoverStatus = index;
  } else {
    this.hoverStatus = -1;
  }
  return this;
};


/** @inheritDoc */
anychart.cartesian.series.ContinuousBase.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;

  if (this.hoverStatus >= 0 && this.getResetIterator().select(this.hoverStatus)) {
    this.drawMarker(false);
    this.drawLabel(false);
  }
  this.colorizeShape(false);
  this.hoverStatus = NaN;
  return this;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.ContinuousBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['connectMissing'] = this.connectMissing;
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.ContinuousBase.prototype.deserialize = function(config) {
  var connectMissing = config['connectMissing'];
  this.suspendSignalsDispatching();
  if (connectMissing) this.connectMissingPoints(connectMissing);
  this.resumeSignalsDispatching(false);
  return goog.base(this, 'deserialize', config);
};
