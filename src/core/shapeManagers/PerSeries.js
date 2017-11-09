goog.provide('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.core.shapeManagers.Base');



/**
 * Series paths manager.
 * @param {anychart.core.IShapeManagerUser} series
 * @param {!Array.<anychart.core.shapeManagers.ShapeConfig>} config
 * @param {boolean} interactive
 * @param {?string=} opt_shapesFieldName
 * @param {?function(anychart.core.IShapeManagerUser, Object.<string, acgraph.vector.Shape>, number)=} opt_postProcessor
 * @param {boolean=} opt_disableStrokeScaling
 * @constructor
 * @extends {anychart.core.shapeManagers.Base}
 */
anychart.core.shapeManagers.PerSeries = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling) {
  anychart.core.shapeManagers.PerSeries.base(this, 'constructor', series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling);

  /**
   * Shapes.
   * @type {?Object.<string, acgraph.vector.Shape>}
   * @private
   */
  this.shapes_ = null;

  /**
   * All shape groups, if there are more than one group.
   * @type {?Array.<Object.<string, acgraph.vector.Shape>>}
   * @private
   */
  this.prevShapes_ = null;
};
goog.inherits(anychart.core.shapeManagers.PerSeries, anychart.core.shapeManagers.Base);


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.setupInteractivity = function(shape, nonInteractive, indexOrGlobal) {
  anychart.core.shapeManagers.PerSeries.base(this, 'setupInteractivity', shape, nonInteractive, true);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.clearShapes = function() {
  anychart.core.shapeManagers.PerSeries.base(this, 'clearShapes');
  this.shapes_ = null;
  this.prevShapes_ = null;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  // we generate all shapes for the first time, because we cannot afford to vary the set
  if (!this.shapes_) {
    this.shapes_ = anychart.core.shapeManagers.PerSeries.base(this, 'getShapesGroup', state, null);
  }
  return this.shapes_;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.addShapesGroup = function(state) {
  if (this.shapes_) {
    if (this.prevShapes_) {
      this.prevShapes_.push(this.shapes_);
    } else {
      this.prevShapes_ = [this.shapes_];
    }
    this.shapes_ = null;
  }
  return this.getShapesGroup(state);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateZIndex = function(newBaseZIndex) {
  if (this.prevShapes_) {
    anychart.core.shapeManagers.PerSeries.base(this, 'updateZIndex', newBaseZIndex, this.prevShapes_);
  }
  anychart.core.shapeManagers.PerSeries.base(this, 'updateZIndex', newBaseZIndex, this.shapes_);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateColors = function(state, opt_shapesGroup) {
  if (this.prevShapes_) {
    anychart.core.shapeManagers.PerSeries.base(this, 'updateColors', state, this.prevShapes_);
  }
  anychart.core.shapeManagers.PerSeries.base(this, 'updateColors', state, this.shapes_);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.disposeInternal = function() {
  this.shapes_ = null;
  this.prevShapes_ = null;
  anychart.core.shapeManagers.PerSeries.base(this, 'disposeInternal');
};
