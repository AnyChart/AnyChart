goog.provide('anychart.cartesian.series.DiscreteBase');
goog.require('acgraph');
goog.require('anychart.cartesian.series.BaseWithMarkers');



/**
 * A base for all series with discrete points, like bars, sticks, columns, ohlc, etc.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.BaseWithMarkers}
 */
anychart.cartesian.series.DiscreteBase = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);
  this.markers().position(anychart.enums.Position.CENTER_TOP);
  this.labels().position(anychart.enums.Position.CENTER_TOP);
};
goog.inherits(anychart.cartesian.series.DiscreteBase, anychart.cartesian.series.BaseWithMarkers);


/**
 * @type {anychart.utils.TypedLayer}
 * @protected
 */
anychart.cartesian.series.DiscreteBase.prototype.rootElement = null;


/**
 * @type {anychart.utils.TypedLayer}
 * @protected
 */
anychart.cartesian.series.DiscreteBase.prototype.hatchFillRootElement = null;


/**
 * Discrete-pointed series are based on a typed layer, that constructs children by this initializer.
 * @return {!acgraph.vector.Element} Returns new instance of an element.
 * @protected
 */
anychart.cartesian.series.DiscreteBase.prototype.rootTypedLayerInitializer = function() {
  return acgraph.rect();
};


/** @inheritDoc */
anychart.cartesian.series.DiscreteBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);
    this.rootElement.zIndex(anychart.cartesian.series.Base.ZINDEX_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  var clip, bounds, axesLinesSpace;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.clip()) {
      if (goog.isBoolean(this.clip())) {
        bounds = this.pixelBounds();
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

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    if (!this.hatchFillRootElement) {
      this.hatchFillRootElement = new anychart.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.cartesian.series.Base.ZINDEX_HATCH_FILL);
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
anychart.cartesian.series.DiscreteBase.prototype.colorizeShape = function(hover) {
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
anychart.cartesian.series.DiscreteBase.prototype.applyHatchFill = function(hover) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, hover));
  }
};


/** @inheritDoc */
anychart.cartesian.series.DiscreteBase.prototype.hoverSeries = function() {
  this.unhover();
  return this;
};


/** @inheritDoc */
anychart.cartesian.series.DiscreteBase.prototype.hoverPoint = function(index, event) {
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
anychart.cartesian.series.DiscreteBase.prototype.unhover = function() {
  if (isNaN(this.hoverStatus)) return this;
  if (this.getIterator().select(this.hoverStatus)) {
    var rect = /** @type {acgraph.vector.Rect} */(this.getIterator().meta('shape'));
    if (goog.isDef(rect)) {
      this.colorizeShape(false);
      this.applyHatchFill(false);
      this.drawMarker(false);
      this.drawLabel(false);
    }
    this.hideTooltip();
  }
  this.hoverStatus = NaN;
  return this;
};


//exports
anychart.cartesian.series.DiscreteBase.prototype['hoverSeries'] = anychart.cartesian.series.DiscreteBase.prototype.hoverSeries;//inherited
anychart.cartesian.series.DiscreteBase.prototype['hoverPoint'] = anychart.cartesian.series.DiscreteBase.prototype.hoverPoint;//inherited
anychart.cartesian.series.DiscreteBase.prototype['unhover'] = anychart.cartesian.series.DiscreteBase.prototype.unhover;//inherited
