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


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @param {number} zero
 * @private
 */
anychart.core.drawers.Area.prototype.drawSegmentStart_ = function(shapes, x, y, zero) {
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes['fill']), this.isVertical, x, zero);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['fill']), this.isVertical, x, y);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes['hatchFill']), this.isVertical, x, zero);
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


/** @inheritDoc */
anychart.core.drawers.Area.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));


  if (this.series.planIsStacked()) {
    var nextZero = /** @type {number} */(point.meta('nextZero'));
    var nextY = /** @type {number} */(point.meta('nextValue'));
    if (!isNaN(nextZero) && !isNaN(nextY)) {
      shapes['stroke'].moveTo(x, y).lineTo(x, y);
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
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));

  if (this.series.planIsStacked()) {
    var prevZero = /** @type {number} */(point.meta('prevZero'));
    var prevY = /** @type {number} */(point.meta('prevValue'));
    var nextZero = /** @type {number} */(point.meta('nextZero'));
    var nextY = /** @type {number} */(point.meta('nextValue'));
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
