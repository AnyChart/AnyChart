goog.provide('anychart.core.drawers.Stick');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Stick drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Stick = function(series) {
  anychart.core.drawers.Stick.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Stick, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.STICK] = anychart.core.drawers.Stick;


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.type = anychart.enums.SeriesDrawerTypes.STICK;


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.requiredShapes = (function() {
  var res = {};
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Stick.base(this, 'startDrawing', shapeManager);
  this.crispEdges = this.pointWidth > 2;
};


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state));
  this.drawPoint_(point, shapes);
};


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.updatePointOnAnimate = function(point) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  for (var i in shapes)
    shapes[i].clear();
  this.drawPoint_(point, shapes);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @private
 */
anychart.core.drawers.Stick.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes['stroke'].stroke()));
  if (this.crispEdges) {
    x = anychart.utils.applyPixelShift(x, thickness);
  }
  // y = anychart.utils.applyPixelShift(y, thickness);
  // zero = anychart.utils.applyPixelShift(zero, thickness);

  var path = /** @type {acgraph.vector.Path} */(shapes['stroke']);
  anychart.core.drawers.move(path, this.isVertical, x, y);
  anychart.core.drawers.line(path, this.isVertical, x, zero);
};
