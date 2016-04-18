goog.provide('anychart.core.drawers.StepLine');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * StepLine drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.StepLine = function(series) {
  anychart.core.drawers.StepLine.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.StepLine, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.STEP_LINE] = anychart.core.drawers.StepLine;


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.type = anychart.enums.SeriesDrawerTypes.STEP_LINE;


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  shapes[anychart.opt.STROKE].moveTo(x, y);

  /**
   * @type {number}
   * @private
   */
  this.prevX_ = x;
  /**
   * @type {number}
   * @private
   */
  this.prevY_ = y;
};


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  var midX = (x + this.prevX_) / 2;
  shapes[anychart.opt.STROKE]
      .lineTo(midX, this.prevY_)
      .lineTo(midX, y)
      .lineTo(x, y);

  this.prevX_ = x;
  this.prevY_ = y;
};
