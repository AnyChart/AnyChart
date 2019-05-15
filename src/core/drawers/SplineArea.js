goog.provide('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



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
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.SplineArea.base(this, 'startDrawing', shapeManager);

  this.queue_.isVertical(this.isVertical);
  this.queue_.rtl(this.series.planIsXScaleInverted());
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawMissingPoint = function(point, state) {
  if (this.connectMissing) {
    if (this.series.planIsStacked()) {
      var x = /** @type {number} */(point.meta('x'));
      var zero = /** @type {number} */(point.meta('zero'));
      var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
      this.zeroesStack.push(x, zero, zeroMissing);
    }
  } else {
    this.finalizeSegment();
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawFirstPoint = function(point, state) {
  var value = /** @type {number} */(point.get(this.series.getYValueNames()[0]));
  var names = this.getShapeNames(value, this.prevValue);

  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
  var y = /** @type {number} */(point.meta('value'));

  zero = anychart.utils.applyPixelShiftToYCoodrinate(zero);
  y = anychart.utils.applyPixelShiftToYCoodrinate(y);

  this.queue_.resetDrawer(false);
  this.queue_.baseline(zero);
  this.queue_.processPoint(x, y);

  var shapeNames = {};
  shapeNames[names.stroke] = true;
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  this.currentShapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var fillShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
  fillShape.baselineDepened = true;
  var hatchShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);
  hatchShape.baselineDepened = true;
  var strokeShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]);
  strokeShape.baselineDepened = false;

  this.queue_.setPaths([fillShape, strokeShape, hatchShape]);

  if (this.series.planIsStacked()) {
    /** @type {Array.<number|boolean>} */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
  }

  this.prevY = y;
  this.prevValue = value;
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var value = /** @type {number} */(point.get(this.series.getYValueNames()[0]));
  var names = this.currentNames = this.getShapeNames(value, this.prevValue);

  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
  var y = /** @type {number} */(point.meta('value'));

  zero = anychart.utils.applyPixelShiftToYCoodrinate(zero);
  y = anychart.utils.applyPixelShiftToYCoodrinate(y);

  this.queue_.processPoint(x, y);

  var shapeNames = {};
  shapeNames[names.stroke] = true;
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  if (shapes != this.currentShapes) {
    var crossY, prevY;
    prevY = /** @type {number} */(this.prevY);

    var isBaselineIntersect = this.isBaselineIntersect(value);
    if (this.hasNegativeColoring && isBaselineIntersect) {
      crossY = zero;
    } else if (this.hasRisingFallingColoring && !this.hasNegativeColoring) {
      crossY = prevY;
    } else {
      crossY = 'middle';
    }
    var fillShape = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
    fillShape.baselineDepened = true;
    var hatchShape = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);
    hatchShape.baselineDepened = true;
    var strokeShape = /** @type {acgraph.vector.Path} */(shapes[names.stroke]);
    strokeShape.baselineDepened = false;

    this.queue_.setBreak(crossY, [fillShape, strokeShape, hatchShape]);
    this.queue_.baseline(zero);
    this.currentShapes = shapes;
  }

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    this.lastDrawnX = x;
  }

  this.prevY = y;
  this.prevValue = value;
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  this.queue_.finalizeProcessing();

  if (this.zeroesStack) {
    var names = this.currentNames;

    var shapeNames = {};
    shapeNames[names.stroke] = true;
    shapeNames[names.fill] = true;
    shapeNames[names.hatchFill] = true;

    this.currentShapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

    var fillShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
    fillShape.baselineDepened = false;
    var hatchShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);
    hatchShape.baselineDepened = false;
    var strokeShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]);
    strokeShape.baselineDepened = false;

    this.queue_.setPaths([fillShape, strokeShape, hatchShape]);
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
        anychart.core.drawers.line(fillShape, this.isVertical, x, y);
        anychart.core.drawers.line(hatchShape, this.isVertical, x, y);
        if (!isMissing)
          this.queue_.processPoint(x, y);
        firstPoint = false;
      } else if (isMissing && prevWasMissing) {
        anychart.core.drawers.line(fillShape, this.isVertical, x, y);
        anychart.core.drawers.line(hatchShape, this.isVertical, x, y);
      } else if (isMissing) {
        this.queue_.finalizeProcessing();
        this.queue_.resetDrawer(true);
        anychart.core.drawers.line(fillShape, this.isVertical, prevX, y, x, y);
        anychart.core.drawers.line(hatchShape, this.isVertical, prevX, y, x, y);
      } else if (prevWasMissing) {
        anychart.core.drawers.line(fillShape, this.isVertical, x, prevY, x, y);
        anychart.core.drawers.line(hatchShape, this.isVertical, x, prevY, x, y);
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
