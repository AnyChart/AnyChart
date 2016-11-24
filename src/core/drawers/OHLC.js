goog.provide('anychart.core.drawers.OHLC');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * OHLC drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.OHLC = function(series) {
  anychart.core.drawers.OHLC.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.OHLC, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.OHLC] = anychart.core.drawers.OHLC;


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.type = anychart.enums.SeriesDrawerTypes.OHLC;


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.yValueNames = ([anychart.opt.OPEN, anychart.opt.HIGH, anychart.opt.LOW, anychart.opt.CLOSE]);


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.drawSubsequentPoint = function(point, state) {
  var rising = Number(point.get('open')) < Number(point.get('close'));
  var name = rising ? anychart.opt.RISING : anychart.opt.FALLING;
  var shapeNames = {};
  shapeNames[name] = true;
  var shapes = this.shapesManager.getShapesGroup(state, shapeNames);

  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var open = /** @type {number} */(point.meta(anychart.opt.OPEN));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));
  var close = /** @type {number} */(point.meta(anychart.opt.CLOSE));

  var widthHalf = this.pointWidth / 2;

  shapes[name]
      .moveTo(x, high)
      .lineTo(x, low)
      .moveTo(x - widthHalf, open)
      .lineTo(x, open)
      .moveTo(x + widthHalf, close)
      .lineTo(x, close);
};
