goog.provide('anychart.core.drawers.Bubble');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Bubble drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Bubble = function(series) {
  anychart.core.drawers.Bubble.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Bubble, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.BUBBLE] = anychart.core.drawers.Bubble;


/** @inheritDoc */
anychart.core.drawers.Bubble.prototype.type = anychart.enums.SeriesDrawerTypes.BUBBLE;


/** @inheritDoc */
anychart.core.drawers.Bubble.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
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
anychart.core.drawers.Bubble.prototype.requiredShapes = (function() {
  var res = {};
  res['circle'] = anychart.enums.ShapeType.CIRCLE;
  res['hatchFill'] = anychart.enums.ShapeType.CIRCLE;
  res['negative'] = anychart.enums.ShapeType.CIRCLE;
  res['negativeHatchFill'] = anychart.enums.ShapeType.CIRCLE;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Bubble.prototype.drawSubsequentPoint = function(point, state) {
  var size = /** @type {number} */(point.meta('size'));
  var name, hatchName;
  if (size < 0) {
    name = 'negative';
    hatchName = 'negativeHatchFill';
  } else {
    name = 'circle';
    hatchName = 'hatchFill';
  }
  var shapeNames = {};
  shapeNames[name] = true;
  shapeNames[hatchName] = true;
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state, shapeNames));
  this.drawPoint_(point, shapes);
};


/** @inheritDoc */
anychart.core.drawers.Bubble.prototype.updatePointOnAnimate = function(point) {
  // this code can currently work with Bar series created with PerPoint shape managers.
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  this.drawPoint_(point, shapes);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @private
 */
anychart.core.drawers.Bubble.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var size = /** @type {number} */(point.meta('size'));
  size = Math.abs(size);

  if (this.isVertical) {
    var tmp = x;
    x = y;
    y = tmp;
  }

  for (var i in shapes)
    shapes[i]
        .centerX(x)
        .centerY(y)
        .radius(size);
};
