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
  var shapesManager = this.shapesManager;
  var value = point.get(this.series.getYValueNames()[0]);
  var names = this.getShapeNames(value, this.prevValue);

  var shapeNames = {};
  shapeNames[names.stroke] = true;

  point.meta('names', names);

  var shapes = /** @type {Object.<acgraph.vector.Path>} */(shapesManager.getShapesGroup(state, shapeNames));

  this.drawPoint_(point, shapes, names);

  this.prevValue = value;
};


/** @inheritDoc */
anychart.core.drawers.Stick.prototype.updatePointOnAnimate = function(point) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  var names = /** @type {Object} */(point.meta('names'));
  for (var i in shapes)
    shapes[i].clear();
  this.drawPoint_(point, shapes, names);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @param {Object} names
 * @private
 */
anychart.core.drawers.Stick.prototype.drawPoint_ = function(point, shapes, names) {
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes[names.stroke].stroke()));
  if (this.crispEdges) {
    x = anychart.utils.applyPixelShift(x, thickness);
  }

  // align stick bottom (or top in case of baseline being above start value) line end to tick
  zero = anychart.utils.applyPixelShift(zero, 1);
  zero = zero < y ? Math.floor(zero) : Math.ceil(zero);

  var path = /** @type {acgraph.vector.Path} */(shapes[names.stroke]);
  anychart.core.drawers.move(path, this.isVertical, x, y);
  anychart.core.drawers.line(path, this.isVertical, x, zero);
};
