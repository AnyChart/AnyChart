goog.provide('anychart.core.drawers.Area');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



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
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Area.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


//region --- Internal drawing variants
//------------------------------------------------------------------------------
//
//  Internal drawing variants
//
//------------------------------------------------------------------------------
/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @param {number} zeroX
 * @param {number} zero
 * @private
 */
anychart.core.drawers.Area.prototype.drawSegmentStart_ = function(shapes, x, y, zeroX, zero) {
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes['fill']), this.isVertical, zeroX, zero);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['fill']), this.isVertical, x, y);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes['hatchFill']), this.isVertical, zeroX, zero);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['hatchFill']), this.isVertical, x, y);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes['stroke']), this.isVertical, x, y);
};


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @private
 */
anychart.core.drawers.Area.prototype.drawSegmentContinuation_ = function(shapes, x, y) {
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['fill']), this.isVertical, x, y);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['hatchFill']), this.isVertical, x, y);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['stroke']), this.isVertical, x, y);
};


/**
 * Draws the first point in segment assuming that the zero line is also a complex line.
 * @param {anychart.data.IRowInfo} point
 * @param {number} x
 * @param {number} y
 * @param {number} zeroX
 * @param {number} zeroY
 * @private
 */
anychart.core.drawers.Area.prototype.drawFirstPointMultiZero_ = function(point, x, y, zeroX, zeroY) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var nextZeroX = /** @type {number} */(point.meta('nextZeroX'));
  var nextZero = /** @type {number} */(point.meta('nextZero'));
  var nextX = /** @type {number} */(point.meta('nextValueX'));
  var nextY = /** @type {number} */(point.meta('nextValue'));
  if (!isNaN(nextZero) && !isNaN(nextY)) {
    var shape = /** @type {acgraph.vector.Path} */(shapes['stroke']);
    anychart.core.drawers.move(shape, this.isVertical, x, y);
    anychart.core.drawers.line(shape, this.isVertical, x, y);
    this.drawSegmentStart_(shapes, nextX, nextY, nextZeroX, nextZero);
    this.zeroesStack = [nextZeroX, nextZero];
  } else {
    this.drawSegmentStart_(shapes, x, y, zeroX, zeroY);
    this.zeroesStack = [zeroX, zeroY];
  }
};


/**
 * Draws the first point in segment assuming that the zero line is a simple straight line or single point.
 * @param {anychart.data.IRowInfo} point
 * @param {number} x
 * @param {number} y
 * @param {number} zeroX
 * @param {number} zeroY
 * @private
 */
anychart.core.drawers.Area.prototype.drawFirstPointSingleZero_ = function(point, x, y, zeroX, zeroY) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  this.drawSegmentStart_(shapes, x, y, zeroX, zeroY);
  /** @type {number} */
  this.lastDrawnX = x;
  /** @type {number} */
  this.zeroY = zeroY;
};


/**
 * Draws the first point in segment assuming that the zero line is also a complex line.
 * @param {anychart.data.IRowInfo} point
 * @param {number} x
 * @param {number} y
 * @param {number} zeroX
 * @param {number} zeroY
 * @private
 */
anychart.core.drawers.Area.prototype.drawSubsequentPointMultiZero_ = function(point, x, y, zeroX, zeroY) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var prevZeroX = /** @type {number} */(point.meta('prevZeroX'));
  var prevZero = /** @type {number} */(point.meta('prevZero'));
  var prevX = /** @type {number} */(point.meta('prevValueX'));
  var prevY = /** @type {number} */(point.meta('prevValue'));
  if (!isNaN(prevZero) && !isNaN(prevY)) {
    this.drawSegmentContinuation_(shapes, prevX, prevY);
    this.zeroesStack.push(prevZeroX, prevZero);
    this.finalizeSegment();
    this.drawSegmentStart_(shapes, x, y, zeroX, zeroY);
    this.zeroesStack = [zeroX, zeroY];
  }
  this.drawSegmentContinuation_(shapes, x, y);
  this.zeroesStack.push(zeroX, zeroY);
  var nextZeroX = /** @type {number} */(point.meta('nextZeroX'));
  var nextZero = /** @type {number} */(point.meta('nextZero'));
  var nextX = /** @type {number} */(point.meta('nextValueX'));
  var nextY = /** @type {number} */(point.meta('nextValue'));
  if (!isNaN(nextZero) && !isNaN(nextY)) {
    this.finalizeSegment();
    this.drawSegmentStart_(shapes, nextX, nextY, nextZeroX, nextZero);
    this.zeroesStack = [nextZeroX, nextZero];
  }
};


/**
 * Draws the first point in segment assuming that the zero line is a simple straight line or single point.
 * @param {anychart.data.IRowInfo} point
 * @param {number} x
 * @param {number} y
 * @param {number} zeroX
 * @param {number} zeroY
 * @private
 */
anychart.core.drawers.Area.prototype.drawSubsequentPointSingleZero_ = function(point, x, y, zeroX, zeroY) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  this.drawSegmentContinuation_(shapes, x, y);
  this.lastDrawnX = zeroX;
};
//endregion


/** @inheritDoc */
anychart.core.drawers.Area.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Area.base(this, 'startDrawing', shapeManager);

  /**
   * If the line should be closed to its first point.
   * @type {boolean}
   * @private
   */
  this.closed_ = !!this.series.getOption('closed');
  /**
   * If the first point is missing (for the closed mode).
   * @type {boolean}
   * @private
   */
  this.firstPointMissing_ = false;
  /**
   * First non-missing point X coord (for the closed mode).
   * @type {number}
   * @private
   */
  this.firstPointX_ = NaN;
  /**
   * First non-missing point Y coord (for the closed mode).
   * @type {number}
   * @private
   */
  this.firstPointY_ = NaN;
  /**
   * First non-missing point Zero X coord (for the closed mode).
   * @type {number}
   * @private
   */
  this.firstPointZeroX_ = NaN;
  /**
   * First non-missing point Zero coord (for the closed mode).
   * @type {number}
   * @private
   */
  this.firstPointZero_ = NaN;

  if (this.series.hasComplexZero()) {
    this.drawFirstPoint_ = this.drawFirstPointMultiZero_;
    this.drawSubsequentPoint_ = this.drawSubsequentPointMultiZero_;
  } else {
    this.drawFirstPoint_ = this.drawFirstPointSingleZero_;
    this.drawSubsequentPoint_ = this.drawSubsequentPointSingleZero_;
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawMissingPoint = function(point, state) {
  if (isNaN(this.firstPointX_))
    this.firstPointMissing_ = true;
  anychart.core.drawers.Area.base(this, 'drawMissingPoint', point, state);
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawFirstPoint = function(point, state) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var zeroX = /** @type {number} */(point.meta('zeroX'));
  var zero = /** @type {number} */(point.meta('zero'));

  this.drawFirstPoint_(point, x, y, zeroX, zero);

  if (isNaN(this.firstPointX_)) {
    this.firstPointX_ = x;
    this.firstPointY_ = y;
    this.firstPointZeroX_ = zeroX;
    this.firstPointZero_ = zero;
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawSubsequentPoint = function(point, state) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var zeroX = /** @type {number} */(point.meta('zeroX'));
  var zero = /** @type {number} */(point.meta('zero'));

  this.drawSubsequentPoint_(point, x, y, zeroX, zero);
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var path = /** @type {acgraph.vector.Path} */(shapes['fill']);
  var hatchPath = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  if (this.zeroesStack) {
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i]);
      anychart.core.drawers.line(path, this.isVertical, x, y);
      anychart.core.drawers.line(hatchPath, this.isVertical, x, y);
    }
    path.close();
    hatchPath.close();
    this.zeroesStack = null;
  } else if (!isNaN(this.lastDrawnX)) {
    anychart.core.drawers.line(path, this.isVertical, this.lastDrawnX, this.zeroY);
    anychart.core.drawers.line(hatchPath, this.isVertical, this.lastDrawnX, this.zeroY);
    path.close();
    hatchPath.close();
  }
};


/** @inheritDoc */
anychart.core.drawers.Area.prototype.finalizeDrawing = function() {
  if (this.closed_ && !isNaN(this.firstPointX_) && (this.connectMissing || this.prevPointDrawn && !this.firstPointMissing_)) {
    var shapes = this.shapesManager.getShapesGroup(this.seriesState);
    this.drawSegmentContinuation_(shapes, this.firstPointX_, this.firstPointY_);
    if (this.series.planIsStacked())
      this.zeroesStack.push(this.firstPointZeroX_, this.firstPointZero_);
    else
      this.lastDrawnX = this.firstPointZeroX_;
  }
  anychart.core.drawers.Area.base(this, 'finalizeDrawing');
};
