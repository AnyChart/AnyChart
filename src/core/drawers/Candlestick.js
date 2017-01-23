goog.provide('anychart.core.drawers.Candlestick');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Candlestick drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Candlestick = function(series) {
  anychart.core.drawers.Candlestick.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Candlestick, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.CANDLESTICK] = anychart.core.drawers.Candlestick;


/** @inheritDoc */
anychart.core.drawers.Candlestick.prototype.type = anychart.enums.SeriesDrawerTypes.CANDLESTICK;


/** @inheritDoc */
anychart.core.drawers.Candlestick.prototype.flags = (
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
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    //anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Candlestick.prototype.requiredShapes = (function() {
  var res = {};
  res['rising'] = anychart.enums.ShapeType.PATH;
  res['risingHatchFill'] = anychart.enums.ShapeType.PATH;
  res['falling'] = anychart.enums.ShapeType.PATH;
  res['fallingHatchFill'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Candlestick.prototype.yValueNames = (['open', 'high', 'low', 'close']);


/** @inheritDoc */
anychart.core.drawers.Candlestick.prototype.drawSubsequentPoint = function(point, state) {
  var rising = Number(point.get('open')) < Number(point.get('close'));
  var name, hatchName;
  if (rising) {
    name = 'rising';
    hatchName = 'risingHatchFill';
  } else {
    name = 'falling';
    hatchName = 'fallingHatchFill';
  }
  var shapeNames = {};
  shapeNames[name] = true;
  shapeNames[hatchName] = true;
  var shapes = this.shapesManager.getShapesGroup(state, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var open = /** @type {number} */(point.meta('open'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));
  var close = /** @type {number} */(point.meta('close'));

  var widthHalf = this.pointWidth / 2;

  var path = /** @type {acgraph.vector.Path} */(shapes[name]);
  anychart.core.drawers.move(path, this.isVertical, x, high);
  anychart.core.drawers.line(path, this.isVertical, x, rising ? close : open);
  anychart.core.drawers.move(path, this.isVertical, x - widthHalf, open);
  anychart.core.drawers.line(path, this.isVertical,
      x + widthHalf, open,
      x + widthHalf, close,
      x - widthHalf, close,
      x - widthHalf, open);
  anychart.core.drawers.move(path, this.isVertical, x, low);
  anychart.core.drawers.line(path, this.isVertical, x, rising ? open : close);

  path = /** @type {acgraph.vector.Path} */(shapes[hatchName]);
  anychart.core.drawers.move(path, this.isVertical, x, high);
  anychart.core.drawers.line(path, this.isVertical, x, rising ? close : open);
  anychart.core.drawers.move(path, this.isVertical, x - widthHalf, open);
  anychart.core.drawers.line(path, this.isVertical,
      x + widthHalf, open,
      x + widthHalf, close,
      x - widthHalf, close,
      x - widthHalf, open);
  anychart.core.drawers.move(path, this.isVertical, x, low);
  anychart.core.drawers.line(path, this.isVertical, x, rising ? open : close);
};
