goog.provide('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



/**
 * Spline drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Spline = function(series) {
  anychart.core.drawers.Spline.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.Spline, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.SPLINE] = anychart.core.drawers.Spline;


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.type = anychart.enums.SeriesDrawerTypes.SPLINE;


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.requiredShapes = (function() {
  var res = {};
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Spline.base(this, 'startDrawing', shapeManager);

  this.queue_.isVertical(this.isVertical);
  this.queue_.rtl(this.series.planIsXScaleInverted());
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.drawFirstPoint = function(point, state) {
  var value = /** @type {number} */(point.get(this.series.getYValueNames()[0]));
  var names = this.getShapeNames(value, this.prevValue);
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  var shapeNames = {};
  shapeNames[names.stroke] = true;

  this.currentShapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  this.queue_.setPaths([/** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke])]);
  this.queue_.resetDrawer(false);
  this.queue_.processPoint(x, y);

  this.prevY = y;
  this.prevValue = value;
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.drawSubsequentPoint = function(point, state) {
  var value = /** @type {number} */(point.get(this.series.getYValueNames()[0]));
  var shapesManager = this.shapesManager;
  var names = this.getShapeNames(value, this.prevValue);
  var shapeNames = {};
  shapeNames[names.stroke] = true;
  var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  this.queue_.processPoint(x, y);

  if (shapes != this.currentShapes) {
    var crossY, prevY;
    prevY = /** @type {number} */(this.prevY);

    var isBaselineIntersect = this.isBaselineIntersect(value);
    if (this.hasNegativeColoring && isBaselineIntersect) {
      crossY = /** @type {number} */(point.meta('zero'));
    } else if (this.hasRisingFallingColoring && !this.hasNegativeColoring) {
      crossY = prevY;
    } else {
      crossY = 'middle';
    }
    this.queue_.setBreak(crossY, [/** @type {acgraph.vector.Path} */(shapes[names.stroke])]);
    this.currentShapes = shapes;
  }

  this.prevY = y;
  this.prevValue = value;
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  this.queue_.finalizeProcessing();
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.disposeInternal = function() {
  this.queue_.setPaths(null);
  anychart.core.drawers.Spline.base(this, 'disposeInternal');
};
