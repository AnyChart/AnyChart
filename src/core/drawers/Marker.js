goog.provide('anychart.core.drawers.Marker');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * Marker drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Marker = function(series) {
  anychart.core.drawers.Marker.base(this, 'constructor', series);

  /**
   * @type {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
   * @private
   */
  this.typeGetter_ = anychart.core.series.Base.getSettingsResolver(
      ['type', 'hoverType', 'selectType'],
      anychart.core.settings.markerTypeNormalizer);
  /**
   * @type {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
   * @private
   */
  this.sizeGetter_ = anychart.core.series.Base.getSettingsResolver(
      ['markerSize', 'hoverMarkerSize', 'selectMarkerSize'],
      anychart.core.settings.numberNormalizer,
      ['size', 'hoverSize', 'selectSize']);
};
goog.inherits(anychart.core.drawers.Marker, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MARKER] = anychart.core.drawers.Marker;


/** @inheritDoc */
anychart.core.drawers.Marker.prototype.type = anychart.enums.SeriesDrawerTypes.MARKER;


/** @inheritDoc */
anychart.core.drawers.Marker.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Marker.prototype.requiredShapes = (function() {
  var res = {};
  res['path'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Marker.prototype.updatePointInternal = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta('shapes'));
  // this can happen before first draw in Cartesian.prepareData()
  if (shapes) {
    shapes['path'].clear();
    shapes['hatchFill'].clear();
    this.drawPoint_(point, state, shapes);
  }
};


/** @inheritDoc */
anychart.core.drawers.Marker.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(state);
  this.drawPoint_(point, state, shapes);
};


/**
 * Draws subsequent point in segment.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @private
 */
anychart.core.drawers.Marker.prototype.drawPoint_ = function(point, state, shapes) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var type = /** @type {anychart.enums.MarkerType|Function} */(this.typeGetter_(this.series, point, state));
  var size = /** @type {number} */(this.sizeGetter_(this.series, point, state));
  var drawer = goog.isFunction(type) ? type : anychart.utils.getMarkerDrawer(type);
  if (this.isVertical) {
    var tmp = x;
    x = y;
    y = tmp;
  }

  drawer(shapes['path'], x, y, size);
  drawer(shapes['hatchFill'], x, y, size);
};
