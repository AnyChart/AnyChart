goog.provide('anychart.core.drawers.Column');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * Column drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Column = function(series) {
  anychart.core.drawers.Column.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Column, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.COLUMN] = anychart.core.drawers.Column;


/** @inheritDoc */
anychart.core.drawers.Column.prototype.type = anychart.enums.SeriesDrawerTypes.COLUMN;


/** @inheritDoc */
anychart.core.drawers.Column.prototype.flags = (
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
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.Column.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state));
  this.drawPoint_(point, shapes);
};


/** @inheritDoc */
anychart.core.drawers.Column.prototype.updatePointOnAnimate = function(point) {
  // this code can currently work with Bar series created with PerPoint shape managers.
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
anychart.core.drawers.Column.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  var leftX = x - this.pointWidth / 2;
  var rightX = leftX + this.pointWidth;

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes[anychart.opt.PATH].stroke()));
  if (this.crispEdges) {
    leftX = anychart.utils.applyPixelShift(leftX, thickness);
    rightX = anychart.utils.applyPixelShift(rightX, thickness);
  }
  y = anychart.utils.applyPixelShift(y, thickness);
  zero = anychart.utils.applyPixelShift(zero, thickness);

  shapes[anychart.opt.PATH]
      .moveTo(leftX, y)
      .lineTo(rightX, y)
      .lineTo(rightX, zero)
      .lineTo(leftX, zero)
      .close();
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(leftX, y)
      .lineTo(rightX, y)
      .lineTo(rightX, zero)
      .lineTo(leftX, zero)
      .close();
};
