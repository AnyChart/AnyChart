goog.provide('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



/**
 * RangeSplineArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeSplineArea = function(series) {
  anychart.core.drawers.RangeSplineArea.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.strokeQueue_ = new anychart.core.drawers.SplineDrawer();

  /**
   * Stroke spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.fillQueue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.RangeSplineArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA] = anychart.core.drawers.RangeSplineArea;


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.flags = (
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
anychart.core.drawers.RangeSplineArea.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['lowStroke'] = anychart.enums.ShapeType.PATH;
  res['highStroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.yValueNames = (function () { return ['low', 'high']; })();


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.getShapeNames = function(var_args) {
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
anychart.core.drawers.RangeSplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeSplineArea.base(this, 'startDrawing', shapeManager);
  this.strokeQueue_.isVertical(this.isVertical);
  this.strokeQueue_.rtl(this.series.planIsXScaleInverted());
  this.fillQueue_.isVertical(this.isVertical);
  this.fillQueue_.rtl(this.series.planIsXScaleInverted());

  this.highSplineCoords = [];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawFirstPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var valueNames = this.series.getYValueNames();

  var highValue = point.get(valueNames[1]);
  var lowValue = point.get(valueNames[0]);

  var shapeNames = {};
  shapeNames['highStroke'] = true;
  shapeNames['lowStroke'] = true;

  var strokeShapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);
  this.hightStrokeShape = strokeShapes['highStroke'];
  this.lowStrokeShape = strokeShapes['lowStroke'];

  var names = this.getShapeNames(highValue, lowValue, true);
  shapeNames = {};
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;
  shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  this.strokeQueue_.resetDrawer(false);
  this.strokeQueue_.setPaths([this.hightStrokeShape]);
  var splineCoords = this.strokeQueue_.processPoint(x, high);

  if (splineCoords)
    this.highSplineCoords.push.apply(this.highSplineCoords, splineCoords);

  var row = this.series.getIterator().current();
  var index = this.series.getIterator().getIndex();
  this.lowsStack = [x, low, highValue, lowValue, row, index];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var valueNames = this.series.getYValueNames();

  var highValue = point.get(valueNames[1]);
  var lowValue = point.get(valueNames[0]);

  var names = this.getShapeNames(highValue, lowValue, true);
  var shapeNames = {};
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;
  shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));
  var low = /** @type {number} */(point.meta('low'));

  var splineCoords = this.strokeQueue_.processPoint(x, high);
  if (splineCoords)
    this.highSplineCoords.push.apply(this.highSplineCoords, splineCoords);

  var row = this.series.getIterator().current();
  var index = this.series.getIterator().getIndex();
  this.lowsStack.push(x, low, highValue, lowValue, row, index);
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.finalizeSegment = function() {
  var shapesManager = this.shapesManager;

  if (!this.prevPointDrawn) return;
  var splineCoords = this.strokeQueue_.finalizeProcessing();
  if (splineCoords)
    this.highSplineCoords.push.apply(this.highSplineCoords, splineCoords);

  this.strokeQueue_.setPaths([this.lowStrokeShape]);
  this.strokeQueue_.resetDrawer(true);
  this.fillQueue_.resetDrawer(true);

  var fill, hatchFill;
  var highCoords = [];

  if (this.lowsStack) {
    /** @type {boolean} */
    var firstPoint = true;
    var step = 6;
    var iterator = this.series.getDetachedIterator();
    for (var i = this.lowsStack.length - 1; i >= 0; i -= step) {
      var pointIndex = this.lowsStack[i];
      var row = this.lowsStack[i - 1];
      var lowValue = this.lowsStack[i - 2];
      var highValue = this.lowsStack[i - 3];
      var low = this.lowsStack[i - 4];
      var x = this.lowsStack[i - 5];

      iterator.specialSelect(row, pointIndex);

      var names = this.getShapeNames(highValue, lowValue, true);
      var shapes = shapesManager.getShapesGroup(this.seriesState, /** @type {Object} */(iterator.meta('shapeNames')));

      this.fillQueue_.processPoint(x, low);
      this.strokeQueue_.processPoint(x, low);

      if (firstPoint) {
        this.currentShapes = shapes;

        fill = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
        hatchFill = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);

        this.fillQueue_.setPaths([fill, hatchFill]);
        firstPoint = false;
      } else {
        var count = (i == this.lowsStack.length - (step + 1) || i == step - 1) ? 6 : 12;
        var coords = goog.array.splice(this.highSplineCoords, this.highSplineCoords.length - count, count);
        goog.array.insertArrayAt(highCoords, coords);

        if (this.currentShapes != shapes) {
          fill = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
          hatchFill = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);

          this.fillQueue_.setBreak(highCoords.slice(), [fill, hatchFill]);

          highCoords.length = 0;
          this.currentShapes = shapes;
        }
      }
    }

    goog.array.insertArrayAt(this.fillQueue_.tail, highCoords);

    this.fillQueue_.finalizeProcessing();
    this.strokeQueue_.finalizeProcessing();
    this.lowsStack = null;
  }
};
