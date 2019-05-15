goog.provide('anychart.mekkoModule.Drawer');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Mekko drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.mekkoModule.Drawer = function(series) {
  anychart.mekkoModule.Drawer.base(this, 'constructor', series);
};
goog.inherits(anychart.mekkoModule.Drawer, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MEKKO] = anychart.mekkoModule.Drawer;


/** @inheritDoc */
anychart.mekkoModule.Drawer.prototype.type = anychart.enums.SeriesDrawerTypes.MEKKO;


/** @inheritDoc */
anychart.mekkoModule.Drawer.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
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
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.mekkoModule.Drawer.prototype.requiredShapes = (function() {
  var res = {};
  res['path'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.mekkoModule.Drawer.prototype.drawSubsequentPoint = function(point, state) {
  if (point.meta('missing')) return;
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state));
  this.drawPoint_(point, shapes);
};


/** @inheritDoc */
anychart.mekkoModule.Drawer.prototype.updatePointOnAnimate = function(point) {
  // this code can currently work with Bar series created with PerPoint shape managers.
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  for (var i in shapes)
    shapes[i].clear();
  this.drawPoint_(point, shapes, true);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @param {boolean=} opt_useMetaWidth
 * @private
 */
anychart.mekkoModule.Drawer.prototype.drawPoint_ = function(point, shapes, opt_useMetaWidth) {
  if (point.get('value') == 0 || !shapes) return;

  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));

  var pointWidth = opt_useMetaWidth ? /** @type {number} */(point.meta('pointWidth')) : this.pointWidth;
  point.meta('pointWidth', pointWidth);

  var pointsPadding = Math.abs(anychart.math.round(anychart.utils.normalizeSize(
      /** @type {number|string} */((/** @type {anychart.mekkoModule.Chart} */(this.series.chart)).getOption('pointsPadding')),
      pointWidth)));
  var width = pointWidth - pointsPadding * 2;
  var leftX = (x - width / 2);
  var rightX = leftX + width;

  var stroke = point.meta('stroke') ? point.meta('stroke') : shapes['path'].stroke();
  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(stroke));
  var halfThickness = thickness / 2;

  /* Alight top and bottom sides of point to ticks */
  if (this.isVertical) {
    leftX = anychart.utils.applyPixelShift(leftX, 1);
    rightX = anychart.utils.applyPixelShift(rightX, 1);
  } else {
    y = anychart.utils.applyPixelShift(y, 1);
    zero = anychart.utils.applyPixelShift(zero, 1);
  }

  leftX += halfThickness;
  rightX -= halfThickness;
  leftX = anychart.utils.applyPixelShift(leftX, thickness);
  rightX = anychart.utils.applyPixelShift(rightX, thickness);

  /*
  We change sign depending on it's position to avoid transparent pixels on ends:
    bottom and right round up,
    top and left round down.
  When position changes - bottom becomes left and top becomes right.
  With left and right coordinates there is no such problem.
  Left becomes top. Right becomes bottom.
  */
  y += this.isVertical ? -halfThickness : halfThickness;
  zero -= this.isVertical ? -halfThickness : halfThickness;
  y = anychart.utils.applyPixelShift(y, thickness);
  zero = anychart.utils.applyPixelShift(zero, thickness);

  if (pointsPadding) {
    // Adjust vertical padding depend on available space
    var height = Math.abs(zero - y);
    var vPadding = (height > pointsPadding * 2) ? pointsPadding : (height / 2 - 1);
    zero -= vPadding;
    y += vPadding;
  }

  var path = /** @type {acgraph.vector.Path} */(shapes['path']);
  anychart.core.drawers.move(path, this.isVertical, leftX, y);
  anychart.core.drawers.line(path, this.isVertical, rightX, y, rightX, zero, leftX, zero);
  path.close();
  path = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  anychart.core.drawers.move(path, this.isVertical, leftX, y);
  anychart.core.drawers.line(path, this.isVertical, rightX, y, rightX, zero, leftX, zero);
  path.close();
};


/** @inheritDoc */
anychart.mekkoModule.Drawer.prototype.updatePointInternal = function(point, state) {
  if (point.meta('missing')) return;
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  for (var i in shapes)
    shapes[i].clear();
  this.drawPoint_(point, shapes, true);
};
