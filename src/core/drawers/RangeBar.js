goog.provide('anychart.core.drawers.RangeBar');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * RangeBar drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeBar = function(series) {
  anychart.core.drawers.RangeBar.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.RangeBar, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_BAR] = anychart.core.drawers.RangeBar;


/** @inheritDoc */
anychart.core.drawers.RangeBar.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_BAR;


/** @inheritDoc */
anychart.core.drawers.RangeBar.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeBar.prototype.yValueNames = ([anychart.opt.HIGH, anychart.opt.LOW]);


/** @inheritDoc */
anychart.core.drawers.RangeBar.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(state);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  var leftX = x - this.pointWidth / 2;
  var rightX = leftX + this.pointWidth;

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes[anychart.opt.PATH].stroke()));
  if (this.crispEdges) {
    leftX = anychart.utils.applyPixelShift(leftX, thickness);
    rightX = anychart.utils.applyPixelShift(rightX, thickness);
  }
  high = anychart.utils.applyPixelShift(high, thickness);
  low = anychart.utils.applyPixelShift(low, thickness);

  shapes[anychart.opt.PATH]
      .moveTo(high, leftX)
      .lineTo(low, leftX)
      .lineTo(low, rightX)
      .lineTo(high, rightX)
      .close();
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(high, leftX)
      .lineTo(low, leftX)
      .lineTo(low, rightX)
      .lineTo(high, rightX)
      .close();
};
