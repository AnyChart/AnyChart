goog.provide('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.core.shapeManagers.Base');



/**
 * Series paths manager.
 * @param {anychart.core.series.Base} series
 * @param {!Array.<anychart.core.shapeManagers.ShapeConfig>} config
 * @param {boolean} interactive
 * @param {?string=} opt_shapesFieldName
 * @param {?function(anychart.core.series.Base, Object.<string, acgraph.vector.Shape>, number)=} opt_postProcessor
 * @constructor
 * @extends {anychart.core.shapeManagers.Base}
 */
anychart.core.shapeManagers.PerSeries = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor) {
  anychart.core.shapeManagers.PerSeries.base(this, 'constructor', series, config, interactive, opt_shapesFieldName, opt_postProcessor);

  /**
   * Shapes.
   * @type {?Object.<string, acgraph.vector.Shape>}
   * @private
   */
  this.shapes_ = null;
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
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex) {
  // we generate all shapes for the first time, because we cannot afford to vary the set
  if (!this.shapes_) {
    this.shapes_ = anychart.core.shapeManagers.PerSeries.base(this, 'getShapesGroup', state, null, opt_baseZIndex);
  }
  return this.shapes_;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateZIndex = function(newBaseZIndex, opt_shapesGroup) {
  anychart.core.shapeManagers.PerSeries.base(this, 'updateZIndex', newBaseZIndex, this.shapes_);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateColors = function(state, opt_shapesGroup) {
  anychart.core.shapeManagers.PerSeries.base(this, 'updateColors', state, this.shapes_);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.disposeInternal = function() {
  this.shapes_ = null;
  anychart.core.shapeManagers.PerSeries.base(this, 'disposeInternal');
};
