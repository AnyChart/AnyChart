goog.provide('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');
goog.require('anychart.opt');



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
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.yValueNames = ([anychart.opt.HIGH, anychart.opt.LOW]);


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeSplineArea.base(this, 'startDrawing', shapeManager);
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  this.queue_.rtl(this.series.planIsXScaleInverted());
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.forwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HIGH])];
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.backwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.LOW])];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawFirstPoint = function(point, state) {
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  this.queue_.setPaths(this.forwardPaths_);
  this.queue_.resetDrawer(false);
  this.forwardPaths_[0]
      .moveTo(x, low)
      .lineTo(x, high);
  this.forwardPaths_[1]
      .moveTo(x, low)
      .lineTo(x, high);
  this.forwardPaths_[2].moveTo(x, high);
  this.queue_.processPoint(x, high);

  /** @type {Array.<number>} */
  this.lowsStack = [x, low];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawSubsequentPoint = function(point, state) {
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

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
        this.backwardPaths_[0].lineTo(x, y);
        this.backwardPaths_[1].lineTo(x, y);
        this.backwardPaths_[2].moveTo(x, y);
        firstPoint = false;
      }
      this.queue_.processPoint(x, y);
    }
    this.queue_.finalizeProcessing();
    this.lowsStack = null;
  }
};
