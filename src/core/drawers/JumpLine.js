goog.provide('anychart.core.drawers.JumpLine');

goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Column drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.JumpLine = function(series) {
  anychart.core.drawers.JumpLine.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.JumpLine, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.JUMP_LINE] = anychart.core.drawers.JumpLine;


/** @inheritDoc */
anychart.core.drawers.JumpLine.prototype.type = anychart.enums.SeriesDrawerTypes.JUMP_LINE;


/** @inheritDoc */
anychart.core.drawers.JumpLine.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.JumpLine.prototype.requiredShapes = (function() {
  var res = {};
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.JumpLine.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state));
  this.drawPoint_(point, shapes);
};


/** @inheritDoc */
anychart.core.drawers.JumpLine.prototype.updatePointOnAnimate = function(point) {
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
anychart.core.drawers.JumpLine.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  var leftX = x - this.pointWidth / 2;
  var rightX = leftX + this.pointWidth;

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes['stroke'].stroke()));
  leftX = anychart.utils.applyPixelShift(leftX, thickness);
  rightX = anychart.utils.applyPixelShift(rightX, thickness);
  y = anychart.utils.applyPixelShift(y, thickness);

  var path = /** @type {acgraph.vector.Path} */(shapes['stroke']);
  anychart.core.drawers.move(path, this.isVertical, leftX, y);
  anychart.core.drawers.line(path, this.isVertical, rightX, y);
};
