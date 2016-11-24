goog.provide('anychart.core.drawers.StepArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



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
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.StepArea.base(this, 'startDrawing', shapeManager);
  this.direction_ = /** @type {anychart.enums.StepDirection} */ (this.series.getOption(anychart.opt.STEP_DIRECTION) || anychart.enums.StepDirection.CENTER);
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
anychart.core.drawers.StepArea.prototype.drawSegmentContinuation_ = function(shapes, x, y) {
  var fill = shapes[anychart.opt.FILL];
  var hatchFill = shapes[anychart.opt.HATCH_FILL];
  var stroke = shapes[anychart.opt.STROKE];

  switch (this.direction_) {
    case anychart.enums.StepDirection.FORWARD:
      fill.lineTo(x, this.prevY_);
      hatchFill.lineTo(x, this.prevY_);
      stroke.lineTo(x, this.prevY_);
      break;
    case anychart.enums.StepDirection.BACKWARD:
      fill.lineTo(this.prevX_, y);
      hatchFill.lineTo(this.prevX_, y);
      stroke.lineTo(this.prevX_, y);
      break;
    default:
      var midX = (x + this.prevX_) / 2;
      fill.lineTo(midX, this.prevY_).lineTo(midX, y);
      hatchFill.lineTo(midX, this.prevY_).lineTo(midX, y);
      stroke.lineTo(midX, this.prevY_).lineTo(midX, y);
  }

  fill.lineTo(x, y);
  hatchFill.lineTo(x, y);
  stroke.lineTo(x, y);
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawFirstPoint = function(point, state) {
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
      shapes[anychart.opt.STROKE].lineTo(x, y);
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
  var fill = shapes[anychart.opt.FILL];
  var hatchFill = shapes[anychart.opt.HATCH_FILL];

  if (!isNaN(this.lastDrawnX)) {
    fill.lineTo(this.lastDrawnX, this.zeroY).close();
    hatchFill.lineTo(this.lastDrawnX, this.zeroY).close();
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
            fill.lineTo(prevX, y);
            hatchFill.lineTo(prevX, y);
            break;
          case anychart.enums.StepDirection.BACKWARD:
            fill.lineTo(x, prevY);
            hatchFill.lineTo(x, prevY);
            break;
          default:
            var midX = (x + prevX) / 2;
            fill.lineTo(midX, prevY).lineTo(midX, y);
            hatchFill.lineTo(midX, prevY).lineTo(midX, y);
        }
      }
      fill.lineTo(x, y);
      hatchFill.lineTo(x, y);
      prevX = x;
      prevY = y;
    }
    fill.close();
    hatchFill.close();
    this.zeroesStack = null;
  }
};
