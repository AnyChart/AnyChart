goog.provide('anychart.core.scatter.series.Line');
goog.require('anychart.core.scatter.series.BaseWithMarkers');



/**
 * Define Line series type.<br/>
 * <b>Note:</b> Better for use methods {@link anychart.charts.Scatter#line}.
 * @example
 * anychart.core.scatter.series.line([1, 4, 7, 1]).container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.scatter.series.BaseWithMarkers}
 */
anychart.core.scatter.series.Line = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

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
  this.stroke(function() {
    return this['sourceColor'];
  });
  this.hoverStroke(function() {
    return anychart.color.darken(this['sourceColor']);
  });
};
goog.inherits(anychart.core.scatter.series.Line, anychart.core.scatter.series.BaseWithMarkers);
anychart.core.scatter.series.Base.SeriesTypesMap[anychart.enums.ScatterSeriesTypes.LINE] = anychart.core.scatter.series.Line;


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getLegendIconType = function() {
  return /** @type {anychart.enums.LegendItemIconType} */(anychart.enums.LegendItemIconType.LINE);
};


// ----------------------
// --- ContinuousBase ---
// ----------------------
/**
 * Draws all series points.
 */
anychart.core.scatter.series.Line.prototype.drawPoint = function() {
  if (this.enabled()) {
    var pointDrawn = this.drawSeriesPoint();
    if (pointDrawn) {
      this.drawMarker(false);
      this.drawLabel(false);
    }
    this.pointDrawn = (this.connectMissing && this.pointDrawn) || pointDrawn;
  }
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled())
    return;

  this.makeHoverable(this.path, true);

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
    this.colorizeShape(false);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer.parent(container);
    this.path.parent(this.rootLayer);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.finalizeDrawing = function() {
  goog.base(this, 'finalizeDrawing');
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.createPositionProvider = function() {
  var iterator = this.getIterator();
  return {'value': {'x': iterator.meta('x'), 'y': iterator.meta('y')}};
};


/**
 * Getter for connect missing points setting.
 * @return {boolean} Current setting.
 *//**
 * Setter for connect missing points setting.
 * @example
 * var chart = anychart.scatter();
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
 * chart.container(stage).draw();
 * @param {boolean=} opt_value [false] If set to <b>true</b>, the series will not be interrupted on missing points.<br/>
 *   Defaults to <b>false</b>. Markers will not be drawn for missing points in both cases.
 * @return {!anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value The value to be set.
 * @return {!anychart.core.scatter.series.Base|boolean} The setting, or itself for method chaining.
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
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.core.scatter.series.Line.prototype.colorizeShape = function(hover) {
  this.path.stroke(this.getFinalStroke(false, hover), 2);
  this.path.fill(null);
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.hoverSeries = function() {
  if (this.hoverStatus == -1) return this;
  if (this.hoverStatus >= 0) {
    if (this.getResetIterator().select(this.hoverStatus)) {
      this.drawMarker(false);
      this.drawLabel(false);
      this.hideTooltip();
    }
  } else {
    this.colorizeShape(true);
  }
  this.hoverStatus = -1;
  return this;
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.hoverPoint = function(index, event) {
  if (this.hoverStatus == index) {
    if (this.getIterator().select(index))
      this.showTooltip(event);
    return this;
  }
  if (this.hoverStatus >= 0 && this.getIterator().select(this.hoverStatus)) {
    this.drawMarker(false);
    this.drawLabel(false);
    this.hideTooltip();
  }
  // TODO(AntonKagakin): comment this to avoid series selection
  // waiting for a feedback about this action.
  if (isNaN(this.hoverStatus)) {
    this.colorizeShape(true);
  }
  if (this.getIterator().select(index)) {
    this.drawMarker(true);
    this.drawLabel(true);
    this.showTooltip(event);
    this.hoverStatus = index;
  } else {
    this.hoverStatus = -1;
  }
  return this;
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;

  if (this.hoverStatus >= 0 && this.getIterator().select(this.hoverStatus)) {
    this.drawMarker(false);
    this.drawLabel(false);
    this.hideTooltip();
  }
  this.colorizeShape(false);
  this.hoverStatus = NaN;
  return this;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Line.prototype.restoreDefaults = function() {
  var res = goog.base(this, 'restoreDefaults');

  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  labels.suspendSignalsDispatching();
  labels.enabled(false);
  labels.anchor('bottom');
  labels.resumeSignalsDispatching(false);

  return res;
};
// ----------------------
// --- end ContinuousBase ---
// ----------------------


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.drawSeriesPoint = function() {
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

    this.getIterator().meta('x', x).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getMarkerFill = function() {
  return this.getFinalStroke(false, false);
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getLegendIconFill = function() {
  return null;
};


/** @inheritDoc */
anychart.core.scatter.series.Line.prototype.getLegendIconHatchFill = function() {
  return null;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Line.prototype.getType = function() {
  return anychart.enums.ScatterSeriesTypes.LINE;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Line.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  // from ContinuousBase
  json['connectMissing'] = this.connectMissing;
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.scatter.series.Line.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', config);
  // from ContinuousBase
  this.connectMissingPoints(config['connectMissing']);
  this.resumeSignalsDispatching(false);
  return this;
};


//exports
anychart.core.scatter.series.Line.prototype['startDrawing'] = anychart.core.scatter.series.Line.prototype.startDrawing;//inherited
anychart.core.scatter.series.Line.prototype['hoverSeries'] = anychart.core.scatter.series.Line.prototype.hoverSeries;//inherited
anychart.core.scatter.series.Line.prototype['hoverPoint'] = anychart.core.scatter.series.Line.prototype.hoverPoint;//inherited
anychart.core.scatter.series.Line.prototype['unhover'] = anychart.core.scatter.series.Line.prototype.unhover;//inherited
anychart.core.scatter.series.Line.prototype['connectMissingPoints'] = anychart.core.scatter.series.Line.prototype.connectMissingPoints;
anychart.core.scatter.series.Line.prototype['stroke'] = anychart.core.scatter.series.Line.prototype.stroke;//inherited
anychart.core.scatter.series.Line.prototype['hoverStroke'] = anychart.core.scatter.series.Line.prototype.hoverStroke;//inherited
