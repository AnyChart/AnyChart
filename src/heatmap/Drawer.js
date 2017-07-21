goog.provide('anychart.heatmapModule.Drawer');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.math.Rect');



/**
 * HeatMap drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.heatmapModule.Drawer = function(series) {
  anychart.heatmapModule.Drawer.base(this, 'constructor', series);
};
goog.inherits(anychart.heatmapModule.Drawer, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.HEAT_MAP] = anychart.heatmapModule.Drawer;


/** @inheritDoc */
anychart.heatmapModule.Drawer.prototype.type = anychart.enums.SeriesDrawerTypes.HEAT_MAP;


/** @inheritDoc */
anychart.heatmapModule.Drawer.prototype.flags = (
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
anychart.heatmapModule.Drawer.prototype.yValueNames = (function () { return ['y']; })();


/** @inheritDoc */
anychart.heatmapModule.Drawer.prototype.requiredShapes = (function() {
  var res = {};
  res['rect'] = anychart.enums.ShapeType.RECT;
  res['hatchRect'] = anychart.enums.ShapeType.RECT;
  return res;
})();


/** @inheritDoc */
anychart.heatmapModule.Drawer.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Rect>} */(this.shapesManager.getShapesGroup(state));
  this.drawPoint_(point, state, shapes);
};


/** @inheritDoc */
anychart.heatmapModule.Drawer.prototype.updatePointInternal = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Rect>} */(point.meta('shapes'));
  this.drawPoint_(point, state, shapes);
};


/**
 * @param {anychart.data.IRowInfo} point
 * @param {number} state
 * @param {Object.<acgraph.vector.Rect>} shapes
 * @private
 */
anychart.heatmapModule.Drawer.prototype.drawPoint_ = function(point, state, shapes) {
  if (!shapes) return;
  var prefix;
  if (state == anychart.PointState.NORMAL) {
    prefix = 'normal';
  } else if (state == anychart.PointState.HOVER) {
    prefix = 'hover';
  } else {
    prefix = 'select';
  }
  var x = /** @type {number} */(point.meta(prefix + 'X'));
  var y = /** @type {number} */(point.meta(prefix + 'Y'));
  var width = /** @type {number} */(point.meta(prefix + 'Width'));
  var height = /** @type {number} */(point.meta(prefix + 'Height'));
  var rect = new anychart.math.Rect(x, y, width, height);
  shapes['rect'].setBounds(rect);
  shapes['hatchRect'].setBounds(rect);
};
