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


/**
 * Vertical line drawing.
 * @param {Object.<string>} names
 * @param {number} x
 * @param {number} y
 * @param {number} startY
 * @param {number} endY
 * @param {number} zeroX
 * @param {number} zeroY
 * @return {number}
 */
anychart.core.drawers.StepArea.prototype.drawVerticalLine = function(names, x, y, startY, endY, zeroX, zeroY) {
  var fill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
  var stroke = /** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]);
  var hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);

  var crossX;
  switch (this.direction_) {
    case anychart.enums.StepDirection.FORWARD:
      crossX = x;
      break;
    case anychart.enums.StepDirection.BACKWARD:
      crossX = this.prevX_;
      break;
    default:
      crossX = (x + this.prevX_) / 2;
  }

  anychart.core.drawers.line(fill, this.isVertical, crossX, startY, crossX, endY);
  anychart.core.drawers.line(hatchFill, this.isVertical, crossX, startY, crossX, endY);
  anychart.core.drawers.line(stroke, this.isVertical, crossX, startY, crossX, endY);

  return crossX;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.StepArea.base(this, 'startDrawing', shapeManager);
  this.direction_ = /** @type {anychart.enums.StepDirection} */ (this.series.getOption('stepDirection') || anychart.enums.StepDirection.CENTER);
};


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {Object.<string>} names
 * @param {number} x
 * @param {number} y
 * @param {number} zeroY
 * @private
 */
anychart.core.drawers.StepArea.prototype.drawSegmentStart_ = function(shapes, names, x, y, zeroY) {
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes[names.fill]), this.isVertical, x, zeroY);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes[names.fill]), this.isVertical, x, y);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes[names.hatchFill]), this.isVertical, x, zeroY);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes[names.hatchFill]), this.isVertical, x, y);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes[names.stroke]), this.isVertical, x, y);
};


/**
 * Draws area start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {Object.<string>} names
 * @param {number} value
 * @param {number} x
 * @param {number} y
 * @param {number} zeroX
 * @param {number} zeroY
 * @private
 */
anychart.core.drawers.StepArea.prototype.drawSegmentContinuation_ = function(shapes, names, value, x, y, zeroX, zeroY) {
  var fill, hatchFill, stroke;
  var crossY = this.prevY_;
  var crossX;

  if (shapes != this.currentShapes) {
    fill = /** @type {acgraph.vector.Path} */(this.currentShapes[this.prevShapeNames.fill]);
    hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[this.prevShapeNames.hatchFill]);

    var isBaselineIntersect = this.isBaselineIntersect(value);
    if (this.hasNegativeColoring && isBaselineIntersect) {
      crossY = zeroY;
      crossX = this.drawVerticalLine(this.prevShapeNames, x, y, this.prevY_, crossY, zeroX, zeroY);
    } else if (this.hasRisingFallingColoring && !this.hasNegativeColoring) {
      crossX = this.drawVerticalLine(this.prevShapeNames, x, y, this.prevY_, crossY, zeroX, zeroY);
      anychart.core.drawers.line(fill, this.isVertical, crossX, zeroY);
      anychart.core.drawers.line(hatchFill, this.isVertical, crossX, zeroY);
    } else {
      crossX = this.drawVerticalLine(this.prevShapeNames, x, y, this.prevY_, crossY, zeroX, zeroY);
      anychart.core.drawers.line(fill, this.isVertical, crossX, zeroY);
      anychart.core.drawers.line(hatchFill, this.isVertical, crossX, zeroY);
    }

    fill.close();
    hatchFill.close();

    this.currentShapes = shapes;

    fill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
    stroke = /** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]);
    hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);

    anychart.core.drawers.move(fill, this.isVertical, crossX, zeroY);
    anychart.core.drawers.line(fill, this.isVertical, crossX, crossY);
    anychart.core.drawers.move(hatchFill, this.isVertical, crossX, zeroY);
    anychart.core.drawers.line(hatchFill, this.isVertical, crossX, crossY);
    anychart.core.drawers.move(stroke, this.isVertical, crossX, crossY);
  }

  this.drawVerticalLine(names, x, y, crossY, y, zeroX, zeroY);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]), this.isVertical, x, y);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]), this.isVertical, x, y);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]), this.isVertical, x, y);
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawFirstPoint = function(point, state) {
  var value = point.get(this.series.getYValueNames()[0]);
  var shapesManager = this.shapesManager;
  var names = this.getShapeNames(value, this.prevValue);
  var shapeNames = {};
  shapeNames[names.stroke] = true;
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  var shapes = this.currentShapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var zeroX = /** @type {number} */(point.meta('zeroX'));
  var zeroY = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));


  if (this.series.planIsStacked()) {
    var nextZero = /** @type {number} */(point.meta('nextZero'));
    var nextY = /** @type {number} */(point.meta('nextValue'));
    if (!isNaN(nextZero) && !isNaN(nextY)) {
      var shape = /** @type {acgraph.vector.Path} */(shapes['stroke']);
      anychart.core.drawers.move(shape, this.isVertical, x, y);
      anychart.core.drawers.line(shape, this.isVertical, x, y);
      this.drawSegmentStart_(shapes, names, x, nextY, nextZero);
      this.zeroesStack = [x, nextZero];
      this.prevY_ = nextY;
    } else {
      this.drawSegmentStart_(shapes, names, x, y, zeroY);
      this.zeroesStack = [x, zeroY];
      this.prevY_ = y;
    }
  } else {
    this.drawSegmentStart_(shapes, names, x, y, zeroY);
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zeroY;
    this.prevY_ = y;
  }
  this.prevX_ = x;

  this.prevValue = value;
  this.prevZeroX = zeroX;
  this.prevZeroY = zeroY;
  this.prevShapeNames = names;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.drawSubsequentPoint = function(point, state) {
  var value = /** @type {number} */(point.get(this.series.getYValueNames()[0]));
  var shapesManager = this.shapesManager;
  var names = this.getShapeNames(value, this.prevValue);
  var shapeNames = {};
  shapeNames[names.stroke] = true;
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var zeroX = /** @type {number} */(point.meta('zeroX'));
  var zeroY = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));

  if (this.series.planIsStacked()) {
    var prevZero = /** @type {number} */(point.meta('prevZero'));
    var prevY = /** @type {number} */(point.meta('prevValue'));
    var nextZero = /** @type {number} */(point.meta('nextZero'));
    var nextY = /** @type {number} */(point.meta('nextValue'));
    if (!isNaN(prevZero) && !isNaN(prevY)) {
      this.drawSegmentContinuation_(shapes, names, value, x, prevY, zeroX, zeroY);
      this.zeroesStack.push(x, prevZero);
      this.prevX_ = x;
      this.prevY_ = prevY;
      this.finalizeSegment();
      this.drawSegmentStart_(shapes, names, x, y, zeroY);
      this.zeroesStack = [x, zeroY];
    } else {
      this.drawSegmentContinuation_(shapes, names, value, x, y, zeroX, zeroY);
      this.zeroesStack.push(x, zeroY);
    }
    if (!isNaN(nextZero) && !isNaN(nextY)) {
      anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes['stroke']), this.isVertical, x, y);
      this.finalizeSegment();
      this.drawSegmentStart_(shapes, names, x, nextY, nextZero);
      this.zeroesStack = [x, nextZero];
      this.prevY_ = nextY;
    } else {
      this.prevY_ = y;
    }
  } else {
    this.drawSegmentContinuation_(shapes, names, value, x, y, zeroX, zeroY);
    this.lastDrawnX = x;
    this.prevY_ = y;
  }
  this.prevX_ = x;

  this.prevValue = value;
  this.prevZeroX = zeroX;
  this.prevZeroY = zeroY;
  this.prevShapeNames = names;
};


/** @inheritDoc */
anychart.core.drawers.StepArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;

  var shapes = this.currentShapes;
  var name = this.prevShapeNames;
  var path = /** @type {acgraph.vector.Path} */(shapes[name.fill]);
  var hatchPath = /** @type {acgraph.vector.Path} */(shapes[name.hatchFill]);

  if (!isNaN(this.lastDrawnX)) {
    anychart.core.drawers.line(path, this.isVertical, this.lastDrawnX, this.zeroY);
    anychart.core.drawers.line(hatchPath, this.isVertical, this.lastDrawnX, this.zeroY);
    path.close();
    hatchPath.close();
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
            anychart.core.drawers.line(path, this.isVertical, prevX, y);
            anychart.core.drawers.line(hatchPath, this.isVertical, prevX, y);
            break;
          case anychart.enums.StepDirection.BACKWARD:
            anychart.core.drawers.line(path, this.isVertical, x, prevY);
            anychart.core.drawers.line(hatchPath, this.isVertical, x, prevY);
            break;
          default:
            var midX = (x + prevX) / 2;
            anychart.core.drawers.line(path, this.isVertical, midX, prevY, midX, y);
            anychart.core.drawers.line(hatchPath, this.isVertical, midX, prevY, midX, y);
        }
      }
      anychart.core.drawers.line(path, this.isVertical, x, y);
      anychart.core.drawers.line(hatchPath, this.isVertical, x, y);
      prevX = x;
      prevY = y;
    }
    path.close();
    hatchPath.close();
    this.zeroesStack = null;
  }
};
