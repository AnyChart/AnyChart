goog.provide('anychart.core.drawers.Stick');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



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
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


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
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta(anychart.opt.SHAPES));
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
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes[anychart.opt.STROKE].stroke()));
  if (this.crispEdges) {
    x = anychart.utils.applyPixelShift(x, thickness);
  }
  // y = anychart.utils.applyPixelShift(y, thickness);
  // zero = anychart.utils.applyPixelShift(zero, thickness);

  shapes[anychart.opt.STROKE].moveTo(x, y).lineTo(x, zero);
};
