goog.provide('anychart.core.shapeManagers.PerPoint');
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
anychart.core.shapeManagers.PerPoint = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor) {
  anychart.core.shapeManagers.PerPoint.base(this, 'constructor', series, config, interactive, opt_shapesFieldName, opt_postProcessor);
};
goog.inherits(anychart.core.shapeManagers.PerPoint, anychart.core.shapeManagers.Base);
