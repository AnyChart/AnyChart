goog.provide('anychart.waterfallModule.Drawer');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.enums');



/**
 * Waterfall drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Column}
 */
anychart.waterfallModule.Drawer = function(series) {
  anychart.waterfallModule.Drawer.base(this, 'constructor', series);
  this.calculatePxShiftInversion = false;
};
goog.inherits(anychart.waterfallModule.Drawer, anychart.core.drawers.Column);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.WATERFALL] = anychart.waterfallModule.Drawer;


/** @inheritDoc */
anychart.waterfallModule.Drawer.prototype.type = anychart.enums.SeriesDrawerTypes.WATERFALL;


/** @inheritDoc */
anychart.waterfallModule.Drawer.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
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
anychart.waterfallModule.Drawer.prototype.requiredShapes = (function() {
  var res = {};
  res['rising'] = anychart.enums.ShapeType.PATH;
  res['risingHatchFill'] = anychart.enums.ShapeType.PATH;
  res['falling'] = anychart.enums.ShapeType.PATH;
  res['fallingHatchFill'] = anychart.enums.ShapeType.PATH;
  res['path'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.waterfallModule.Drawer.prototype.updatePointOnAnimate = function(point) {
  // this code can currently work with Bar series created with PerPoint shape managers.
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  for (var i in shapes)
    shapes[i].clear();
  var rising = /** @type {number} */(point.meta('diff')) >= 0;
  var isTotal = /** @type {boolean} */(point.meta('isTotal'));
  var name, hatchName;
  if (isTotal) {
    name = 'path';
    hatchName = 'hatchFill';
  } else if (rising) {
    name = 'rising';
    hatchName = 'risingHatchFill';
  } else {
    name = 'falling';
    hatchName = 'fallingHatchFill';
  }
  this.drawPointShape(point, shapes[name], shapes[hatchName]);
};


/** @inheritDoc */
anychart.waterfallModule.Drawer.prototype.drawSubsequentPoint = function(point, state) {
  var rising = /** @type {number} */(point.meta('diff')) >= 0;
  var isTotal = /** @type {boolean} */(point.meta('isTotal'));
  var name, hatchName;
  if (isTotal) {
    name = 'path';
    hatchName = 'hatchFill';
  } else if (rising) {
    name = 'rising';
    hatchName = 'risingHatchFill';
  } else {
    name = 'falling';
    hatchName = 'fallingHatchFill';
  }
  var shapeNames = {};
  shapeNames[name] = shapeNames[hatchName] = true;
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(this.shapesManager.getShapesGroup(state, shapeNames));
  this.drawPointShape(point, shapes[name], shapes[hatchName]);
};
