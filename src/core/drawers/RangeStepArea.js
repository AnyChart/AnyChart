goog.provide('anychart.core.drawers.RangeStepArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * RangeStepArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeStepArea = function(series) {
  anychart.core.drawers.RangeStepArea.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.RangeStepArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA] = anychart.core.drawers.RangeStepArea;


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.flags = (
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
    // anychart.core.drawers.Capabilities.IS_BAR_BASED |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.yValueNames = ([anychart.opt.HIGH, anychart.opt.LOW]);


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeStepArea.base(this, 'startDrawing', shapeManager);
  this.direction_ = /** @type {anychart.enums.StepDirection} */ (this.series.getOption(anychart.opt.STEP_DIRECTION) || anychart.enums.StepDirection.CENTER);
};


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  shapes[anychart.opt.FILL]
      .moveTo(x, low)
      .lineTo(x, high);
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(x, low)
      .lineTo(x, high);
  shapes[anychart.opt.HIGH]
      .moveTo(x, high);

  /** @type {number} */
  this.prevX_ = x;
  /** @type {number} */
  this.prevY_ = high;
  /** @type {Array.<number>} */
  this.lowsStack = [x, low];
};


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  var fill = shapes[anychart.opt.FILL];
  var hatchFill = shapes[anychart.opt.HATCH_FILL];
  var highShape = shapes[anychart.opt.HIGH];

  switch (this.direction_) {
    case anychart.enums.StepDirection.FORWARD:
      fill.lineTo(x, this.prevY_);
      hatchFill.lineTo(x, this.prevY_);
      highShape.lineTo(x, this.prevY_);
      break;
    case anychart.enums.StepDirection.BACKWARD:
      fill.lineTo(this.prevX_, high);
      hatchFill.lineTo(this.prevX_, high);
      highShape.lineTo(this.prevX_, high);
      break;
    default:
      var midX = (x + this.prevX_) / 2;
      fill.lineTo(midX, this.prevY_).lineTo(midX, high);
      hatchFill.lineTo(midX, this.prevY_).lineTo(midX, high);
      highShape.lineTo(midX, this.prevY_).lineTo(midX, high);
  }

  fill.lineTo(x, high);
  hatchFill.lineTo(x, high);
  highShape.lineTo(x, high);

  this.prevX_ = x;
  this.prevY_ = high;

  this.lowsStack.push(x, low);
};


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  if (this.lowsStack) {
    var shapes = this.shapesManager.getShapesGroup(this.seriesState);
    var fill = shapes[anychart.opt.FILL];
    var hatchFill = shapes[anychart.opt.HATCH_FILL];
    var low = shapes[anychart.opt.LOW];

    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    var first = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      var x = this.lowsStack[i - 1];
      var y = this.lowsStack[i];
      if (first) {
        low.moveTo(x, y);
        first = false;
      } else {
        switch (this.direction_) {
          case anychart.enums.StepDirection.FORWARD:
            fill.lineTo(prevX, y);
            hatchFill.lineTo(prevX, y);
            low.lineTo(prevX, y);
            break;
          case anychart.enums.StepDirection.BACKWARD:
            fill.lineTo(x, prevY);
            hatchFill.lineTo(x, prevY);
            low.lineTo(x, prevY);
            break;
          default:
            var midX = (x + prevX) / 2;
            fill.lineTo(midX, prevY).lineTo(midX, y);
            hatchFill.lineTo(midX, prevY).lineTo(midX, y);
            low.lineTo(midX, prevY).lineTo(midX, y);
        }
      }
      fill.lineTo(x, y);
      hatchFill.lineTo(x, y);
      low.lineTo(x, y);
      prevX = x;
      prevY = y;
    }
    fill.close();
    hatchFill.close();
    this.lowsStack = null;
  }
};
