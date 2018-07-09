goog.provide('anychart.core.drawers.RangeArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * RangeArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeArea = function(series) {
  anychart.core.drawers.RangeArea.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.RangeArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_AREA] = anychart.core.drawers.RangeArea;


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.flags = (
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
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['lowStroke'] = anychart.enums.ShapeType.PATH;
  res['highStroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.yValueNames = (function() { return ['low', 'high']; })();


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.valueFieldName = 'high';


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.getShapeNames = function(var_args) {
  var high = /** @type {number} */(arguments[0]);
  var low = /** @type {number} */(arguments[1]);

  var names = {};
  var fillName = 'fill', hatchFillName = 'hatchFill';

  if (high > low) {
    if (this.hasHighFill) {
      fillName = 'highFill';
      hatchFillName = 'highHatchFill';
    }
  } else {
    if (this.hasLowFill) {
      fillName = 'lowFill';
      hatchFillName = 'lowHatchFill';
    }
  }

  names.highStroke = 'highStroke';
  names.lowStroke = 'lowStroke';
  names.fill = fillName;
  names.hatchFill = hatchFillName;

  return names;
};


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.drawFirstPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var valueNames = this.series.getYValueNames();

  var highValue = point.get(valueNames[1]);
  var lowValue = point.get(valueNames[0]);

  var names = this.getShapeNames(highValue, lowValue);

  var shapeNames = {};
  shapeNames[names.highStroke] = true;
  shapeNames[names.lowStroke] = true;

  var strokeShapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);
  this.hightStrokeShape = /** @type {acgraph.vector.Path} */(strokeShapes[names.highStroke]);
  this.lowStrokeShape = /** @type {acgraph.vector.Path} */(strokeShapes[names.lowStroke]);

  shapeNames = {};
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  this.currentShapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  var fill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
  var hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);

  anychart.core.drawers.move(fill, this.isVertical, x, low);
  anychart.core.drawers.line(fill, this.isVertical, x, high);
  anychart.core.drawers.move(hatchFill, this.isVertical, x, low);
  anychart.core.drawers.line(hatchFill, this.isVertical, x, high);
  anychart.core.drawers.move(this.hightStrokeShape, this.isVertical, x, high);

  this.lowsStack = [x, low, fill, hatchFill];

  this.prevX_ = x;
  this.prevHigh_ = high;
  this.prevLow_ = low;
  this.prevNames_ = names;
};


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var valueNames = this.series.getYValueNames();

  var highValue = point.get(valueNames[1]);
  var lowValue = point.get(valueNames[0]);

  var names = this.getShapeNames(highValue, lowValue, true);

  var shapeNames = {};
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  var fill, hatchFill;

  var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  if (this.currentShapes != shapes) {
    var crossPoint = anychart.math.intersectLineLine(
        this.prevX_, this.prevHigh_,
        x, high,
        this.prevX_, this.prevLow_,
        x, low);

    if (crossPoint) {
      fill = /** @type {acgraph.vector.Path} */(this.currentShapes[this.prevNames_.fill]);
      hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[this.prevNames_.hatchFill]);

      anychart.core.drawers.line(fill, this.isVertical, crossPoint.x, crossPoint.y);
      anychart.core.drawers.line(hatchFill, this.isVertical, crossPoint.x, crossPoint.y);

      this.lowsStack.push(crossPoint.x, crossPoint.y, fill, hatchFill);

      this.currentShapes = shapes;

      fill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
      hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);

      anychart.core.drawers.move(fill, this.isVertical, crossPoint.x, crossPoint.y);
      anychart.core.drawers.move(hatchFill, this.isVertical, crossPoint.x, crossPoint.y);

      this.lowsStack.push(crossPoint.x, crossPoint.y, fill, hatchFill);
    }
  }

  fill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
  hatchFill = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);

  anychart.core.drawers.line(fill, this.isVertical, x, high);
  anychart.core.drawers.line(hatchFill, this.isVertical, x, high);
  anychart.core.drawers.line(this.hightStrokeShape, this.isVertical, x, high);

  this.lowsStack.push(x, low, fill, hatchFill);

  this.prevX_ = x;
  this.prevHigh_ = high;
  this.prevLow_ = low;
  this.prevNames_ = names;
};


/** @inheritDoc */
anychart.core.drawers.RangeArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  if (this.lowsStack) {
    var first = true;
    var prevShape = null;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 4) {
      var x = this.lowsStack[i - 3];
      var y = this.lowsStack[i - 2];
      var fill = this.lowsStack[i - 1];
      var hatchFill = this.lowsStack[i];

      if (prevShape && fill != prevShape) {
        anychart.core.drawers.move(fill, this.isVertical, x, y);
        anychart.core.drawers.move(hatchFill, this.isVertical, x, y);
      } else {
        anychart.core.drawers.line(fill, this.isVertical, x, y);
        anychart.core.drawers.line(hatchFill, this.isVertical, x, y);
      }

      if (first) {
        anychart.core.drawers.move(this.lowStrokeShape, this.isVertical, x, y);
        first = false;
      } else {
        anychart.core.drawers.line(this.lowStrokeShape, this.isVertical, x, y);
      }

      prevShape = fill;
    }
    this.lowsStack = null;
  }
};
