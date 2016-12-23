goog.provide('anychart.core.drawers.Box');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * Box drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Box = function(series) {
  anychart.core.drawers.Box.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Box, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.BOX] = anychart.core.drawers.Box;


/** @inheritDoc */
anychart.core.drawers.Box.prototype.type = anychart.enums.SeriesDrawerTypes.BOX;


/** @inheritDoc */
anychart.core.drawers.Box.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    // anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
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
anychart.core.drawers.Box.prototype.requiredShapes = (function() {
  var res = {};
  res[anychart.opt.PATH] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.HATCH_FILL] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.MEDIAN] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.STEM] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.WHISKER] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Box.prototype.yValueNames = ([anychart.opt.LOWEST, anychart.opt.Q1, anychart.opt.MEDIAN, anychart.opt.Q3, anychart.opt.HIGHEST]);


/** @inheritDoc */
anychart.core.drawers.Box.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(state);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var low = /** @type {number} */(point.meta(anychart.opt.LOWEST));
  var q1 = /** @type {number} */(point.meta(anychart.opt.Q1));
  var median = /** @type {number} */(point.meta(anychart.opt.MEDIAN));
  var q3 = /** @type {number} */(point.meta(anychart.opt.Q3));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGHEST));

  var whiskerWidthHalf = this.series.getWhiskerWidth(point, state) / 2;
  var halfPointWidth = this.pointWidth / 2;

  var path = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.PATH]);
  anychart.core.drawers.move(path, this.isVertical, x - halfPointWidth, q1);
  anychart.core.drawers.line(path, this.isVertical,
      x + halfPointWidth, q1,
      x + halfPointWidth, q3,
      x - halfPointWidth, q3);
  path.close();
  path = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]);
  anychart.core.drawers.move(path, this.isVertical, x - halfPointWidth, q1);
  anychart.core.drawers.line(path, this.isVertical,
      x + halfPointWidth, q1,
      x + halfPointWidth, q3,
      x - halfPointWidth, q3);
  path.close();
  path = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.MEDIAN]);
  anychart.core.drawers.move(path, this.isVertical, x - halfPointWidth, median);
  anychart.core.drawers.line(path, this.isVertical, x + halfPointWidth, median);
  path = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.STEM]);
  anychart.core.drawers.move(path, this.isVertical, x, low);
  anychart.core.drawers.line(path, this.isVertical, x, q1);
  anychart.core.drawers.move(path, this.isVertical, x, q3);
  anychart.core.drawers.line(path, this.isVertical, x, high);
  path = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.WHISKER]);
  anychart.core.drawers.move(path, this.isVertical, x - whiskerWidthHalf, low);
  anychart.core.drawers.line(path, this.isVertical, x + whiskerWidthHalf, low);
  anychart.core.drawers.move(path, this.isVertical, x - whiskerWidthHalf, high);
  anychart.core.drawers.line(path, this.isVertical, x + whiskerWidthHalf, high);
};


/** @inheritDoc */
anychart.core.drawers.Box.prototype.updatePointInternal = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta(anychart.opt.SHAPES));
  // this can happen before first draw in Cartesian.prepareData()
  if (shapes) {
    var x = /** @type {number} */(point.meta(anychart.opt.X));
    var low = /** @type {number} */(point.meta(anychart.opt.LOWEST));
    var high = /** @type {number} */(point.meta(anychart.opt.HIGHEST));
    var whiskerWidthHalf = this.series.getWhiskerWidth(point, state) / 2;
    var path = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.WHISKER]);
    path.clear();
    anychart.core.drawers.move(path, this.isVertical, x - whiskerWidthHalf, low);
    anychart.core.drawers.line(path, this.isVertical, x + whiskerWidthHalf, low);
    anychart.core.drawers.move(path, this.isVertical, x - whiskerWidthHalf, high);
    anychart.core.drawers.line(path, this.isVertical, x + whiskerWidthHalf, high);
  }
};
