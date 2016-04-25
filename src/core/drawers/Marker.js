goog.provide('anychart.core.drawers.Marker');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



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
      [anychart.opt.TYPE, anychart.opt.HOVER_TYPE, anychart.opt.SELECT_TYPE],
      anychart.core.series.Base.markerTypeNormalizer);
  /**
   * @type {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
   * @private
   */
  this.sizeGetter_ = anychart.core.series.Base.getSettingsResolver(
      [anychart.opt.MARKER_SIZE, anychart.opt.HOVER_MARKER_SIZE, anychart.opt.SELECT_MARKER_SIZE],
      anychart.core.series.Base.numberNormalizer,
      [anychart.opt.SIZE, anychart.opt.HOVER_SIZE, anychart.opt.SELECT_SIZE]);
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
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.Marker.prototype.updatePoint = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta(anychart.opt.SHAPES));
  // this can happen before first draw in Cartesian.prepareData()
  if (shapes) {
    shapes[anychart.opt.PATH].clear();
    shapes[anychart.opt.HATCH_FILL].clear();
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
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));
  var type = /** @type {anychart.enums.MarkerType|Function} */(this.typeGetter_(this.series, point, state));
  var size = /** @type {number} */(this.sizeGetter_(this.series, point, state));
  var drawer = goog.isFunction(type) ? type : anychart.enums.getMarkerDrawer(type);

  drawer(shapes[anychart.opt.PATH], x, y, size);
  drawer(shapes[anychart.opt.HATCH_FILL], x, y, size);
};
