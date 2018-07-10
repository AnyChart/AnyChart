goog.provide('anychart.core.drawers.RangeStick');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Stick drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeStick = function(series) {
  anychart.core.drawers.RangeStick.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.RangeStick, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_STICK] = anychart.core.drawers.RangeStick;


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_STICK;


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
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
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.requiredShapes = (function() {
  var res = {};
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeStick.base(this, 'startDrawing', shapeManager);
  this.crispEdges = this.pointWidth > 2;
};


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.yValueNames = (function () { return ['low', 'high']; })();


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.valueFieldName = 'high';


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.drawSubsequentPoint = function(point, state) {
  var valueNames = this.series.getYValueNames();

  var highValue = point.get(valueNames[1]);
  var lowValue = point.get(valueNames[0]);

  var shapeNames = {};
  var name = 'stroke';
  if (highValue > lowValue) {
    if (this.hasHighColoring) {
      name = 'highStroke';
    }
  } else {
    if (this.hasLowColoring) {
      name = 'lowStroke';
    }
  }
  shapeNames[name] = true;
  point.meta('name', name);

  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state, shapeNames));
  this.drawPoint_(point, shapes, name);
};


/** @inheritDoc */
anychart.core.drawers.RangeStick.prototype.updatePointOnAnimate = function(point) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  var name = /** @type {string} */(point.meta('name'));
  for (var i in shapes)
    shapes[i].clear();
  this.drawPoint_(point, shapes, name);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @param {string} name
 * @private
 */
anychart.core.drawers.RangeStick.prototype.drawPoint_ = function(point, shapes, name) {
  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes[name].stroke()));
  if (this.crispEdges) {
    x = anychart.utils.applyPixelShift(x, thickness);
  }
  high = anychart.utils.applyPixelShift(high, thickness);
  low = anychart.utils.applyPixelShift(low, thickness);

  var path = /** @type {acgraph.vector.Path} */(shapes[name]);
  anychart.core.drawers.move(path, this.isVertical, x, low);
  anychart.core.drawers.line(path, this.isVertical, x, high);
};
