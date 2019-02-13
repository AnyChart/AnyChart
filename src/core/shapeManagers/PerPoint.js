goog.provide('anychart.core.shapeManagers.PerPoint');
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
anychart.core.shapeManagers.PerPoint = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling) {
  anychart.core.shapeManagers.PerPoint.base(this, 'constructor', series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling);
};
goog.inherits(anychart.core.shapeManagers.PerPoint, anychart.core.shapeManagers.Base);


/** @inheritDoc */
anychart.core.shapeManagers.PerPoint.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  var iterator = this.series.getIterator();
  var zIndex = opt_baseZIndex || 0;
  if (this.series.isDiscreteBased() && this.series.supportsPointSettings()) {
    /*
      Can take value for zIndex configured by state.
      Actually, issue starts from DVF-4178.
     */
    zIndex += Number(iterator.meta('stateZIndex')) || Number(iterator.get('zIndex')) || 0;
  }
  var res = anychart.core.shapeManagers.PerPoint.base(this, 'getShapesGroup', state, opt_only, zIndex, opt_shape);
  iterator.meta(this.shapesFieldName, res);
  return res;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerPoint.prototype.updateZIndex = function(newBaseZIndex, opt_shapesGroup) {
  var iterator = this.series.getIterator();
  newBaseZIndex += this.series.supportsPointSettings() && Number(iterator.get('zIndex')) || 0;
  anychart.core.shapeManagers.PerPoint.base(this, 'updateZIndex', newBaseZIndex, opt_shapesGroup);
};


/**
 * @param {number} state
 * @param {Object.<string, acgraph.vector.Shape>} shapesGroup
 */
anychart.core.shapeManagers.PerPoint.prototype.updateMarkersColors = function(state, shapesGroup) {
  var iterator = this.series.getIterator();
  var markerFill, markerStroke;
  for (var name in shapesGroup) {
    var descriptor = this.defs[name];

    if (descriptor && !descriptor.isHatchFill) {
      var markerDescFill = /** @type {acgraph.vector.Fill} */(descriptor.fill(this.series, +state, void 0, void 0, 'fill'));
      var markerDescStroke = /** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, +state, void 0, void 0, 'stroke'));

      if (markerDescFill && anychart.color.isNotNullColor(markerDescFill))
        markerFill = markerDescFill;
      if (markerDescStroke && anychart.color.isNotNullColor(markerDescStroke))
        markerStroke = markerDescStroke;
    }
  }

  iterator.meta('markerFill', markerFill);
  iterator.meta('markerStroke', markerStroke);
};

