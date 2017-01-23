goog.provide('anychart.core.drawers.StepArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * StepArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.StepArea = function(series) {
  anychart.core.drawers.StepArea.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.StepArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.STEP_AREA] = anychart.core.drawers.StepArea;


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.type = anychart.enums.SeriesDrawerTypes.STEP_AREA;


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.StepArea.base(this, 'startDrawing', shapeManager);
  this.direction_ = /** @type {anychart.enums.StepDirection} */ (this.series.getOption('stepDirection') || anychart.enums.StepDirection.CENTER);
};


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @param {number} zero
 * @private
 */
anychart.core.drawers.StepArea.prototype.drawSegmentStart_ = function(shapes, x, y, zero) {
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
anychart.core.drawers.StepArea.prototype.drawSegmentContinuation_ = function(shapes, x, y) {
  var fill = /** @type {acgraph.vector.Path} */(shapes['fill']);
  var hatchFill = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  var stroke = /** @type {acgraph.vector.Path} */(shapes['stroke']);

  switch (this.direction_) {
    case anychart.enums.StepDirection.FORWARD:
      anychart.core.drawers.line(fill, this.isVertical, x, this.prevY_);
      anychart.core.drawers.line(hatchFill, this.isVertical, x, this.prevY_);
      anychart.core.drawers.line(stroke, this.isVertical, x, this.prevY_);
      break;
    case anychart.enums.StepDirection.BACKWARD:
      anychart.core.drawers.line(fill, this.isVertical, this.prevX_, y);
      anychart.core.drawers.line(hatchFill, this.isVertical, this.prevX_, y);
      anychart.core.drawers.line(stroke, this.isVertical, this.prevX_, y);
      break;
    default:
      var midX = (x + this.prevX_) / 2;
      anychart.core.drawers.line(fill, this.isVertical, midX, this.prevY_, midX, y);
      anychart.core.drawers.line(hatchFill, this.isVertical, midX, this.prevY_, midX, y);
      anychart.core.drawers.line(stroke, this.isVertical, midX, this.prevY_, midX, y);
  }

  anychart.core.drawers.line(fill, this.isVertical, x, y);
  anychart.core.drawers.line(hatchFill, this.isVertical, x, y);
  anychart.core.drawers.line(stroke, this.isVertical, x, y);
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawFirstPoint = function(point, state) {
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
      this.prevY_ = nextY;
    } else {
      this.drawSegmentStart_(shapes, x, y, zero);
      this.zeroesStack = [x, zero];
      this.prevY_ = y;
    }
  } else {
    this.drawSegmentStart_(shapes, x, y, zero);
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
    this.prevY_ = y;
  }
  this.prevX_ = x;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawSubsequentPoint = function(point, state) {
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
      this.prevX_ = x;
      this.prevY_ = prevY;
      this.finalizeSegment();
      this.drawSegmentStart_(shapes, x, y, zero);
      this.zeroesStack = [x, zero];
    } else {
      this.drawSegmentContinuation_(shapes, x, y);
      this.zeroesStack.push(x, zero);
    }
    if (!isNaN(nextZero) && !isNaN(nextY)) {
      anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['stroke']), this.isVertical, x, y);
      this.finalizeSegment();
      this.drawSegmentStart_(shapes, x, nextY, nextZero);
      this.zeroesStack = [x, nextZero];
      this.prevY_ = nextY;
    } else {
      this.prevY_ = y;
    }
  } else {
    this.drawSegmentContinuation_(shapes, x, y);
    this.lastDrawnX = x;
    this.prevY_ = y;
  }
  this.prevX_ = x;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var fill = /** @type {acgraph.vector.Path} */(shapes['fill']);
  var hatchFill = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);

  if (!isNaN(this.lastDrawnX)) {
    anychart.core.drawers.line(fill, this.isVertical, this.lastDrawnX, this.zeroY);
    fill.close();
    anychart.core.drawers.line(hatchFill, this.isVertical, this.lastDrawnX, this.zeroY);
    hatchFill.close();
  } else if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;

    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 2) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i]);
      if (!isNaN(prevY)) {
        switch (this.direction_) {
          case anychart.enums.StepDirection.FORWARD:
            anychart.core.drawers.line(fill, this.isVertical, prevX, y);
            anychart.core.drawers.line(hatchFill, this.isVertical, prevX, y);
            break;
          case anychart.enums.StepDirection.BACKWARD:
            anychart.core.drawers.line(fill, this.isVertical, x, prevY);
            anychart.core.drawers.line(hatchFill, this.isVertical, x, prevY);
            break;
          default:
            var midX = (x + prevX) / 2;
            anychart.core.drawers.line(fill, this.isVertical, midX, prevY, midX, y);
            anychart.core.drawers.line(hatchFill, this.isVertical, midX, prevY, midX, y);
        }
      }
      anychart.core.drawers.line(fill, this.isVertical, x, y);
      anychart.core.drawers.line(hatchFill, this.isVertical, x, y);
      prevX = x;
      prevY = y;
    }
    fill.close();
    hatchFill.close();
    this.zeroesStack = null;
  }
};
