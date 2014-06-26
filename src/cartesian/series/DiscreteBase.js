goog.provide('anychart.cartesian.series.DiscreteBase');

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
  this.markers().position(anychart.utils.NinePositions.TOP);
  this.labels().position(anychart.utils.NinePositions.TOP);
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
 * @return {!acgraph.vector.IElement} Returns a new instance of element.
 * @protected
 */
anychart.cartesian.series.DiscreteBase.prototype.rootTypedLayerInitializer = function() {
  return acgraph.rect();
};


/**
 * Remove all element content from container.
 */
anychart.cartesian.series.DiscreteBase.prototype.remove = function() {
  if (this.rootElement)
    this.rootElement.remove();
};


/** @inheritDoc */
anychart.cartesian.series.DiscreteBase.prototype.createPositionProvider = function(position) {
  var shape = this.getIterator().meta('shape');
  if (shape) {
    var shapeBounds = shape.getBounds();
    return anychart.utils.getCoordinateByAnchor(shapeBounds, position);
  } else {
    var iterator = this.getIterator();
    return {x: iterator.meta('x'), y: iterator.meta('y')};
  }
};


/** @inheritDoc */
anychart.cartesian.series.DiscreteBase.prototype.startDrawing = function() {
  goog.base(this, 'startDrawing');
  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement)
    this.rootElement = new anychart.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        goog.nullFunction);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */(this.zIndex()));
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.zIndex(/** @type {number} */(this.zIndex() + 1));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.rootElement.clip(/** @type {!anychart.math.Rect} */(this.pixelBounds()));
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.rootElement.clear();

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    if (this.hatchFillRootElement)
      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL)) {
    var fill = this.getFinalHatchFill(false, false);
    if (!this.hatchFillRootElement && !anychart.utils.isNone(fill)) {
      this.hatchFillRootElement = new anychart.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillRootElement.zIndex(/** @type {number} */(this.zIndex() + 1));
      this.hatchFillRootElement.pointerEvents('none');
    }

    if (this.hatchFillRootElement)
      this.hatchFillRootElement.clear();
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
  if (this.hoverStatus == index) return this;
  this.unhover();
  if (this.getResetIterator().select(index)) {
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
  if (this.getResetIterator().select(this.hoverStatus)) {
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
