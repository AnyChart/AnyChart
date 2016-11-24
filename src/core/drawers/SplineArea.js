goog.provide('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * SplineArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.SplineArea = function(series) {
  anychart.core.drawers.SplineArea.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.SplineArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.SPLINE_AREA] = anychart.core.drawers.SplineArea;


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.type = anychart.enums.SeriesDrawerTypes.SPLINE_AREA;


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.flags = (
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
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.SplineArea.base(this, 'startDrawing', shapeManager);
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  this.queue_.rtl(this.series.planIsXScaleInverted());
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.forwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.STROKE])];
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.backwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]),
    /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL])];
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawMissingPoint = function(point, state) {
  if (this.connectMissing) {
    if (this.series.planIsStacked()) {
      var x = /** @type {number} */(point.meta(anychart.opt.X));
      var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
      var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
      this.zeroesStack.push(x, zero, zeroMissing);
    }
  } else {
    this.finalizeSegment();
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  this.queue_.setPaths(this.forwardPaths_);
  this.queue_.resetDrawer(false);
  (/** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]))
      .moveTo(x, zero)
      .lineTo(x, y);
  (/** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]))
      .moveTo(x, zero)
      .lineTo(x, y);
  (/** @type {acgraph.vector.Path} */(shapes[anychart.opt.STROKE]))
      .moveTo(x, y);
  this.queue_.processPoint(x, y);

  if (this.series.planIsStacked()) {
    /** @type {Array.<number|boolean>} */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawSubsequentPoint = function(point, state) {
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var zero = /** @type {number} */(point.meta(anychart.opt.ZERO));
  var zeroMissing = /** @type {boolean} */(point.meta(anychart.opt.ZERO_MISSING));
  var y = /** @type {number} */(point.meta(anychart.opt.VALUE));

  this.queue_.processPoint(x, y);

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    this.lastDrawnX = x;
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  this.queue_.finalizeProcessing();
  if (!isNaN(this.lastDrawnX)) {
    this.backwardPaths_[0]
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
    this.backwardPaths_[1]
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  } else if (this.zeroesStack) {
    this.queue_.setPaths(this.backwardPaths_);
    this.queue_.resetDrawer(true);
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i]);
      if (firstPoint) {
        this.backwardPaths_[0].lineTo(x, y);
        this.backwardPaths_[1].lineTo(x, y);
        if (!isMissing)
          this.queue_.processPoint(x, y);
        firstPoint = false;
      } else if (isMissing && prevWasMissing) {
        this.backwardPaths_[0].lineTo(x, y);
        this.backwardPaths_[1].lineTo(x, y);
      } else if (isMissing) {
        this.queue_.finalizeProcessing();
        this.queue_.resetDrawer(true);
        this.backwardPaths_[0]
            .lineTo(prevX, y)
            .lineTo(x, y);
        this.backwardPaths_[1]
            .lineTo(prevX, y)
            .lineTo(x, y);
      } else if (prevWasMissing) {
        this.backwardPaths_[0]
            .lineTo(x, prevY)
            .lineTo(x, y);
        this.backwardPaths_[1]
            .lineTo(x, prevY)
            .lineTo(x, y);
        this.queue_.processPoint(x, y);
      } else {
        this.queue_.processPoint(x, y);
      }
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.queue_.finalizeProcessing();
    this.zeroesStack = null;
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.disposeInternal = function() {
  this.queue_.setPaths(null);
  anychart.core.drawers.SplineArea.base(this, 'disposeInternal');
};
