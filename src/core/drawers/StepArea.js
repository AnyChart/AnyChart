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
    0);


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  shapes[anychart.opt.FILL]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.HATCH_FILL]
      .moveTo(x, zero)
      .lineTo(x, y);
  shapes[anychart.opt.STROKE]
      .moveTo(x, y);

  if (this.series.planIsStacked()) {
    /** @type {Array.<number|boolean>} */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
  }

  /**
   * @type {number}
   * @private
   */
  this.prevX_ = x;
  /**
   * @type {number}
   * @private
   */
  this.prevY_ = y;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  var midX = (x + this.prevX_) / 2;
  shapes[anychart.opt.FILL]
      .lineTo(midX, this.prevY_)
      .lineTo(midX, y)
      .lineTo(x, y);
  shapes[anychart.opt.HATCH_FILL]
      .lineTo(midX, this.prevY_)
      .lineTo(midX, y)
      .lineTo(x, y);
  shapes[anychart.opt.STROKE]
      .lineTo(midX, this.prevY_)
      .lineTo(midX, y)
      .lineTo(x, y);

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    this.lastDrawnX = x;
  }

  this.prevX_ = x;
  this.prevY_ = y;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  if (!isNaN(this.lastDrawnX)) {
    shapes[anychart.opt.FILL]
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
    shapes[anychart.opt.HATCH_FILL]
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  } else if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i]);
      if (isMissing && !prevWasMissing && !isNaN(prevX)) {
        shapes[anychart.opt.FILL].lineTo(prevX, y);
        shapes[anychart.opt.HATCH_FILL].lineTo(prevX, y);
      } else if (prevWasMissing && !isNaN(prevY)) {
        shapes[anychart.opt.FILL].lineTo(x, prevY);
        shapes[anychart.opt.HATCH_FILL].lineTo(x, prevY);
      } else if (!isNaN(prevY)) {
        var midX = (x + prevX) / 2;
        shapes[anychart.opt.FILL]
            .lineTo(midX, prevY)
            .lineTo(midX, y);
        shapes[anychart.opt.HATCH_FILL]
            .lineTo(midX, prevY)
            .lineTo(midX, y);
      }
      shapes[anychart.opt.FILL].lineTo(x, y);
      shapes[anychart.opt.HATCH_FILL].lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    shapes[anychart.opt.FILL].close();
    shapes[anychart.opt.HATCH_FILL].close();
    this.zeroesStack = null;
  }
};
