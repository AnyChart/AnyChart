goog.provide('anychart.core.drawers.Area');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * Area drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Area = function(series) {
  anychart.core.drawers.Area.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Area, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.AREA] = anychart.core.drawers.Area;


/** @inheritDoc */
anychart.core.drawers.Area.prototype.type = anychart.enums.SeriesDrawerTypes.AREA;


/** @inheritDoc */
anychart.core.drawers.Area.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    0);


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @param {number} zero
 * @private
 */
anychart.core.drawers.Area.prototype.drawSegmentStart_ = function(shapes, x, y, zero) {
  shapes[anychart.opt.FILL]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.STROKE]
      .moveTo(x, y);
};


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @private
 */
anychart.core.drawers.Area.prototype.drawSegmentContinuation_ = function(shapes, x, y) {
  shapes[anychart.opt.FILL].lineTo(x, y);
  shapes[anychart.opt.HATCH_FILL].lineTo(x, y);
  shapes[anychart.opt.STROKE].lineTo(x, y);
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));


  if (this.series.planIsStacked()) {
    var nextZero = /** @type {number} */(point.meta(anychart.opt.NEXT_ZERO));
    var nextY = /** @type {number} */(point.meta(anychart.opt.NEXT_VALUE));
    if (!isNaN(nextZero) && !isNaN(nextY)) {
      shapes[anychart.opt.STROKE].moveTo(x, y).lineTo(x, y);
      this.drawSegmentStart_(shapes, x, nextY, nextZero);
      this.zeroesStack = [x, nextZero];
    } else {
      this.drawSegmentStart_(shapes, x, y, zero);
      this.zeroesStack = [x, zero];
    }
  } else {
    this.drawSegmentStart_(shapes, x, y, zero);
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  if (this.series.planIsStacked()) {
    var prevZero = /** @type {number} */(point.meta(anychart.opt.PREV_ZERO));
    var prevY = /** @type {number} */(point.meta(anychart.opt.PREV_VALUE));
    var nextZero = /** @type {number} */(point.meta(anychart.opt.NEXT_ZERO));
    var nextY = /** @type {number} */(point.meta(anychart.opt.NEXT_VALUE));
    if (!isNaN(prevZero) && !isNaN(prevY)) {
      this.drawSegmentContinuation_(shapes, x, prevY);
      this.zeroesStack.push(x, prevZero);
      this.finalizeSegment();
      this.drawSegmentStart_(shapes, x, y, zero);
      this.zeroesStack = [x, zero];
    }
    this.drawSegmentContinuation_(shapes, x, y);
    this.zeroesStack.push(x, zero);
    if (!isNaN(nextZero) && !isNaN(nextY)) {
      this.finalizeSegment();
      this.drawSegmentStart_(shapes, x, nextY, nextZero);
      this.zeroesStack = [x, nextZero];
    }
  } else {
    this.drawSegmentContinuation_(shapes, x, y);
    this.lastDrawnX = x;
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var path = shapes[anychart.opt.FILL];
  var hatchPath = shapes[anychart.opt.HATCH_FILL];
  if (this.zeroesStack) {
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i]);
      path.lineTo(x, y);
      hatchPath.lineTo(x, y);
    }
    path.close();
    hatchPath.close();
    this.zeroesStack = null;
  } else if (!isNaN(this.lastDrawnX)) {
    path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
    hatchPath
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  }
};
