goog.provide('anychart.core.map.series.DiscreteBase');
goog.require('acgraph');
goog.require('anychart.core.map.series.BaseWithMarkers');
goog.require('anychart.core.utils.TypedLayer');



/**
 * A base for all series with discrete points, like bars, sticks, columns, ohlc, etc.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.map.series.BaseWithMarkers}
 */
anychart.core.map.series.DiscreteBase = function(opt_data, opt_csvSettings) {
  anychart.core.map.series.DiscreteBase.base(this, 'constructor', opt_data, opt_csvSettings);
  this.markers().position(anychart.enums.Position.CENTER_TOP);
  this.labels().position(anychart.enums.Position.CENTER_TOP);

  this.needSelfLayer = true;
};
goog.inherits(anychart.core.map.series.DiscreteBase, anychart.core.map.series.BaseWithMarkers);


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.map.series.DiscreteBase.prototype.rootElement = null;


/**
 * Gets rootElement of the series.
 * @return {anychart.core.utils.TypedLayer}
 */
anychart.core.map.series.DiscreteBase.prototype.getRootElement = function() {
  return this.rootElement;
};


/**
 * @type {anychart.core.utils.TypedLayer}
 * @protected
 */
anychart.core.map.series.DiscreteBase.prototype.hatchFillRootElement = null;


/** @inheritDoc */
anychart.core.map.series.DiscreteBase.prototype.rootTypedLayerInitializer = function() {
  var path = acgraph.path();
  path.disableStrokeScaling(true);
  return path;
};


/** @inheritDoc */
anychart.core.map.series.DiscreteBase.prototype.startDrawing = function() {
  anychart.core.map.series.DiscreteBase.base(this, 'startDrawing');

  if (this.isConsistent() || !this.enabled()) return;

  if (!this.rootElement) {
    this.rootElement = new anychart.core.utils.TypedLayer(
        this.rootTypedLayerInitializer,
        function(path) {
          if (path) {
            path.clear();
            path.parent(null);
            path.removeAllListeners();
            path.setTransformationMatrix(1, 0, 0, 1, 0, 0);
            delete path.tag;
          }
        });
    this.rootElement.zIndex(anychart.core.map.series.Base.ZINDEX_SERIES);
    this.registerDisposable(this.rootElement);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    /** @type {acgraph.vector.Element} */(this.rootLayer).zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE))
    this.rootElement.clear();

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var needHatchFill = this.needDrawHatchFill();
    if (!this.hatchFillRootElement && needHatchFill) {
      this.hatchFillRootElement = new anychart.core.utils.TypedLayer(
          this.rootTypedLayerInitializer,
          goog.nullFunction);

      this.hatchFillRootElement.parent(/** @type {acgraph.vector.ILayer} */(this.rootLayer));
      this.hatchFillRootElement.zIndex(anychart.charts.Map.ZINDEX_HATCH_FILL);
      this.hatchFillRootElement.disablePointerEvents(true);
    }
    if (this.hatchFillRootElement) this.hatchFillRootElement.clear();
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
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.map.series.DiscreteBase.prototype.colorizeShape = function(pointState) {
  var shape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('shape'));
  if (goog.isDef(shape)) {
    shape.stroke(this.getFinalStroke(true, pointState));
    shape.fill(this.getFinalFill(true, pointState));
  }
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {anychart.PointState|number} pointState If the point is hovered.
 * @protected
 */
anychart.core.map.series.DiscreteBase.prototype.applyHatchFill = function(pointState) {
  var hatchFillShape = /** @type {acgraph.vector.Shape} */(this.getIterator().meta('hatchFillShape'));
  if (goog.isDefAndNotNull(hatchFillShape)) {
    hatchFillShape
        .stroke(null)
        .fill(this.getFinalHatchFill(true, pointState));
  }
};


/** @inheritDoc */
anychart.core.map.series.DiscreteBase.prototype.isDiscreteBased = function() {
  return true;
};


/** @inheritDoc */
anychart.core.map.series.DiscreteBase.prototype.needDrawHatchFill = function() {
  return !!(this.hatchFill() || this.hoverHatchFill() || this.selectHatchFill());
};


/** @inheritDoc */
anychart.core.map.series.DiscreteBase.prototype.applyAppearanceToPoint = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
  this.drawMarker(pointState);
  this.drawLabel(pointState);
};


/** @inheritDoc */
anychart.core.map.series.DiscreteBase.prototype.applyAppearanceToSeries = function(pointState) {
  this.colorizeShape(pointState);
  this.applyHatchFill(pointState);
};
