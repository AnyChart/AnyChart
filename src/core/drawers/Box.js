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
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


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

  shapes[anychart.opt.PATH]
      .moveTo(x - halfPointWidth, q1)
      .lineTo(x + halfPointWidth, q1)
      .lineTo(x + halfPointWidth, q3)
      .lineTo(x - halfPointWidth, q3)
      .close();
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(x - halfPointWidth, q1)
      .lineTo(x + halfPointWidth, q1)
      .lineTo(x + halfPointWidth, q3)
      .lineTo(x - halfPointWidth, q3)
      .close();
  shapes[anychart.opt.MEDIAN]
      .moveTo(x - halfPointWidth, median)
      .lineTo(x + halfPointWidth, median);
  shapes[anychart.opt.STEM]
      .moveTo(x, low)
      .lineTo(x, q1)
      .moveTo(x, q3)
      .lineTo(x, high);
  shapes[anychart.opt.WHISKER]
      .moveTo(x - whiskerWidthHalf, low)
      .lineTo(x + whiskerWidthHalf, low)
      .moveTo(x - whiskerWidthHalf, high)
      .lineTo(x + whiskerWidthHalf, high);
};


/** @inheritDoc */
anychart.core.drawers.Box.prototype.updatePoint = function(point, state) {
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta(anychart.opt.SHAPES));
  // this can happen before first draw in Cartesian.prepareData()
  if (shapes) {
    var x = /** @type {number} */(point.meta(anychart.opt.X));
    var low = /** @type {number} */(point.meta(anychart.opt.LOWEST));
    var high = /** @type {number} */(point.meta(anychart.opt.HIGHEST));
    var whiskerWidthHalf = this.series.getWhiskerWidth(point, state) / 2;
    shapes[anychart.opt.WHISKER]
        .clear()
        .moveTo(x - whiskerWidthHalf, low)
        .lineTo(x + whiskerWidthHalf, low)
        .moveTo(x - whiskerWidthHalf, high)
        .lineTo(x + whiskerWidthHalf, high);
  }
};
