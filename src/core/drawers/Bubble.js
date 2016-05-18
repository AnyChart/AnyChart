goog.provide('anychart.core.drawers.Bubble');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



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
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/**
 * Reference list that are required by this drawer.
 * @type {Array.<string>}
 */
anychart.core.drawers.Bubble.prototype.referenceNames = ([anychart.opt.VALUE, anychart.opt.SIZE]);


/**
 * Returns reference value names. Needed to include bubble size.
 * @return {Array.<string>}
 */
anychart.core.drawers.Bubble.prototype.getReferenceNames = function() {
  return this.referenceNames;
};


/** @inheritDoc */
anychart.core.drawers.Bubble.prototype.drawSubsequentPoint = function(point, state) {
  var size = /** @type {number} */(point.meta(anychart.opt.SIZE));
  var name, hatchName;
  if (size < 0) {
    name = anychart.opt.NEGATIVE;
    hatchName = anychart.opt.NEGATIVE_HATCH_FILL;
  } else {
    name = anychart.opt.CIRCLE;
    hatchName = anychart.opt.HATCH_FILL;
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
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(point.meta(anychart.opt.SHAPES));
  this.drawPoint_(point, shapes);
};


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @private
 */
anychart.core.drawers.Bubble.prototype.drawPoint_ = function(point, shapes) {
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));
  var size = /** @type {number} */(point.meta(anychart.opt.SIZE));
  size = Math.abs(size);

  for (var i in shapes)
    shapes[i]
        .centerX(x)
        .centerY(y)
        .radius(size);
};
