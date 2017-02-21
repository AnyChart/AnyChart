goog.provide('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



/**
 * RangeSplineArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeSplineArea = function(series) {
  anychart.core.drawers.RangeSplineArea.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.RangeSplineArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA] = anychart.core.drawers.RangeSplineArea;


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['low'] = anychart.enums.ShapeType.PATH;
  res['high'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.yValueNames = (['low', 'high']);


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeSplineArea.base(this, 'startDrawing', shapeManager);
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  this.queue_.isVertical(this.isVertical);
  this.queue_.rtl(this.series.planIsXScaleInverted());
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.forwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes['fill']),
    /** @type {acgraph.vector.Path} */(shapes['hatchFill']),
    /** @type {acgraph.vector.Path} */(shapes['high'])];
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.backwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes['fill']),
    /** @type {acgraph.vector.Path} */(shapes['hatchFill']),
    /** @type {acgraph.vector.Path} */(shapes['low'])];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawFirstPoint = function(point, state) {
  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  this.queue_.setPaths(this.forwardPaths_);
  this.queue_.resetDrawer(false);
  anychart.core.drawers.move(this.forwardPaths_[0], this.isVertical, x, low);
  anychart.core.drawers.line(this.forwardPaths_[0], this.isVertical, x, high);
  anychart.core.drawers.move(this.forwardPaths_[1], this.isVertical, x, low);
  anychart.core.drawers.line(this.forwardPaths_[1], this.isVertical, x, high);
  anychart.core.drawers.move(this.forwardPaths_[2], this.isVertical, x, high);
  this.queue_.processPoint(x, high);

  /** @type {Array.<number>} */
  this.lowsStack = [x, low];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawSubsequentPoint = function(point, state) {
  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  this.queue_.processPoint(x, high);

  this.lowsStack.push(x, low);
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  this.queue_.finalizeProcessing();
  if (this.lowsStack) {
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.lowsStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.lowsStack[i]);
      if (firstPoint) {
        this.queue_.setPaths(this.backwardPaths_);
        this.queue_.resetDrawer(true);
        anychart.core.drawers.line(this.backwardPaths_[0], this.isVertical, x, y);
        anychart.core.drawers.line(this.backwardPaths_[1], this.isVertical, x, y);
        anychart.core.drawers.move(this.backwardPaths_[2], this.isVertical, x, y);
        firstPoint = false;
      }
      this.queue_.processPoint(x, y);
    }
    this.queue_.finalizeProcessing();
    this.lowsStack = null;
  }
};
