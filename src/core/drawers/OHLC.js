goog.provide('anychart.core.drawers.OHLC');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



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
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.requiredShapes = (function() {
  var res = {};
  res['rising'] = anychart.enums.ShapeType.PATH;
  res['falling'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.yValueNames = (['open', 'high', 'low', 'close']);


/** @inheritDoc */
anychart.core.drawers.OHLC.prototype.drawSubsequentPoint = function(point, state) {
  var rising = Number(point.get('open')) < Number(point.get('close'));
  var name = rising ? 'rising' : 'falling';
  var shapeNames = {};
  shapeNames[name] = true;
  var shapes = this.shapesManager.getShapesGroup(state, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var open = /** @type {number} */(point.meta('open'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));
  var close = /** @type {number} */(point.meta('close'));

  var widthHalf = this.pointWidth / 2;

  var path = /** @type {acgraph.vector.Path} */(shapes[name]);
  anychart.core.drawers.move(path, this.isVertical, x, high);
  anychart.core.drawers.line(path, this.isVertical, x, low);
  anychart.core.drawers.move(path, this.isVertical, x - widthHalf, open);
  anychart.core.drawers.line(path, this.isVertical, x, open);
  anychart.core.drawers.move(path, this.isVertical, x + widthHalf, close);
  anychart.core.drawers.line(path, this.isVertical, x, close);
};
