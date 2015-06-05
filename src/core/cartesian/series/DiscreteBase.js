goog.provide('anychart.core.cartesian.series.DiscreteBase');
goog.require('acgraph');
goog.require('anychart.core.cartesian.series.BaseWithMarkers');



/**
 * A base for all series with discrete points, like bars, sticks, columns, ohlc, etc.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.BaseWithMarkers}
 */
anychart.core.cartesian.series.DiscreteBase = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);
  this.markers().position(anychart.enums.Position.CENTER_TOP);
  this.labels().position(anychart.enums.Position.CENTER_TOP);
};
goog.inherits(anychart.core.cartesian.series.DiscreteBase, anychart.core.cartesian.series.BaseWithMarkers);


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.cartesian.series.DiscreteBase.prototype.rootElement = null;


/**
 * Gets rootElement of the series.
 * @return {anychart.core.utils.TypedLayer}
 */
anychart.core.cartesian.series.DiscreteBase.prototype.getRootElement = function() {
  return this.rootElement;
};


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.cartesian.series.DiscreteBase.prototype.hatchFillRootElement = null;


/**
 * Discrete-pointed series are based on a typed layer, that constructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.core.cartesian.series.DiscreteBase.prototype.rootTypedLayerInitializer = function() {
  return acgraph.rect();
};


/** @inheritDoc */
anychart.core.cartesian.series.DiscreteBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.core.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);
    this.rootElement.zIndex(anychart.core.cartesian.series.Base.ZINDEX_SERIES);
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

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.rootElement.clear();

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    if (!this.hatchFillRootElement) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.core.cartesian.series.Base.ZINDEX_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
    this.hatchFillRootElement.clear();
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.core.cartesian.series.DiscreteBase.prototype.colorizeShape = function(hover) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    shape.stroke(this.getFinalStroke(true, hover));
    shape.fill(this.getFinalFill(true, hover));
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.core.cartesian.series.DiscreteBase.prototype.applyHatchFill = function(hover) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, hover));
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.DiscreteBase.prototype.hoverSeries = function() {
  if (this.hoverStatus == -1) return this;
  if (this.hoverStatus >= 0) {
    if (this.getResetIterator().select(this.hoverStatus)) {
      this.drawMarker(false);
      this.drawLabel(false);
      this.hideTooltip();
    }
  } else {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.colorizeShape(true);
      this.applyHatchFill(true);
    }
  }
  this.hoverStatus = -1;
  return this;
};


/** @inheritDoc */
anychart.core.cartesian.series.DiscreteBase.prototype.hoverPoint = function(index, event) {
  if (this.hoverStatus == index) {
    if (this.getIterator().select(index))
      this.showTooltip(event);
    return this;
  }
  this.unhover();
  if (this.getIterator().select(index)) {
    this.colorizeShape(true);
    this.applyHatchFill(true);
    this.drawMarker(true);
    this.drawLabel(true);
    this.showTooltip(event);
  }
  this.hoverStatus = index;
  return this;
};


/** @inheritDoc */
anychart.core.cartesian.series.DiscreteBase.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;
  if (this.hoverStatus >= 0 && this.getIterator().select(this.hoverStatus)) {
    var rect = /** @type {acgraph.vector.Rect} */(this.getIterator().meta('shape'));
    if (goog.isDef(rect)) {
      this.colorizeShape(false);
      this.applyHatchFill(false);
      this.drawMarker(false);
      this.drawLabel(false);
    }
    this.hideTooltip();
  } else {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.colorizeShape(false);
      this.applyHatchFill(false);
    }
  }
  this.hoverStatus = NaN;
  return this;
};


//anychart.core.cartesian.series.DiscreteBase.prototype['hoverSeries'] = anychart.core.cartesian.series.DiscreteBase.prototype.hoverSeries;//inherited
//anychart.core.cartesian.series.DiscreteBase.prototype['hoverPoint'] = anychart.core.cartesian.series.DiscreteBase.prototype.hoverPoint;//inherited
//anychart.core.cartesian.series.DiscreteBase.prototype['unhover'] = anychart.core.cartesian.series.DiscreteBase.prototype.unhover;//inherited
//exports
