goog.provide('anychart.polarModule.drawers.Area');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.math');
goog.require('goog.math');



/**
 * PolarArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.polarModule.drawers.Area = function(series) {
  anychart.polarModule.drawers.Area.base(this, 'constructor', series);
};
goog.inherits(anychart.polarModule.drawers.Area, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.POLAR_AREA] = anychart.polarModule.drawers.Area;


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.type = anychart.enums.SeriesDrawerTypes.POLAR_AREA;


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.flags = (
    // in fact it doesn't need zero, because polar zero is always in the middle, but marker positioning requires it
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
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
anychart.polarModule.drawers.Area.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/**
 * Draws PolarArea start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @param {number} x
 * @param {number} y
 * @private
 */
anychart.polarModule.drawers.Area.prototype.drawSegmentStart_ = function(shapes, x, y) {
  var stroke = /** @type {acgraph.vector.Path} */(shapes['stroke']);
  var fill = /** @type {acgraph.vector.Path} */(shapes['fill']);
  var hatch = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  stroke.moveTo(x, y);
  fill.moveTo(this.cx, this.cy).lineTo(x, y);
  hatch.moveTo(this.cx, this.cy).lineTo(x, y);
};


/**
 * Draws PolarArea start.
 * @param {number} x
 * @param {number} y
 * @param {number} xRatio
 * @param {number} yRatio
 * @private
 */
anychart.polarModule.drawers.Area.prototype.drawSegmentContinuation_ = function(x, y, xRatio, yRatio) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var stroke = /** @type {acgraph.vector.Path} */(shapes['stroke']);
  var fill = /** @type {acgraph.vector.Path} */(shapes['fill']);
  var hatch = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  var params = anychart.math.getPolarLineParams(this.lastX, this.lastY, this.lastXRatio, this.lastYRatio,
      x, y, xRatio, yRatio, this.cx, this.cy, this.radius, this.innerRadius, this.zeroAngle, this.counterClockwise);
  if (this.suppressNextNewPath_ && params.length)
    params[0] = 0;
  this.suppressNextNewPath_ = false;
  var prevX = this.lastX;
  var prevY = this.lastY;
  for (var i = 0; i < params.length; i += 7) {
    if (params[i]) {
      this.drawSegmentFinish_(shapes);
      shapes = this.shapesManager.addShapesGroup(this.seriesState);
      stroke = /** @type {acgraph.vector.Path} */(shapes['stroke']);
      fill = /** @type {acgraph.vector.Path} */(shapes['fill']);
      hatch = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
      this.drawSegmentStart_(shapes, prevX, prevY);
    }
    stroke.curveTo(params[i + 1], params[i + 2], params[i + 3], params[i + 4], params[i + 5], params[i + 6]);
    fill.curveTo(params[i + 1], params[i + 2], params[i + 3], params[i + 4], params[i + 5], params[i + 6]);
    hatch.curveTo(params[i + 1], params[i + 2], params[i + 3], params[i + 4], params[i + 5], params[i + 6]);
    prevX = params[i + 5];
    prevY = params[i + 6];
  }
  this.lastX = x;
  this.lastY = y;
  this.lastXRatio = xRatio;
  this.lastYRatio = yRatio;
};


/**
 * Draws PolarArea start.
 * @param {Object.<string, acgraph.vector.Shape>} shapes
 * @private
 */
anychart.polarModule.drawers.Area.prototype.drawSegmentFinish_ = function(shapes) {
  var fill = /** @type {acgraph.vector.Path} */(shapes['fill']);
  var hatch = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  fill.lineTo(this.cx, this.cy);
  hatch.lineTo(this.cx, this.cy);
};


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.startDrawing = function(shapeManager) {
  anychart.polarModule.drawers.Area.base(this, 'startDrawing', shapeManager);
  var series = (/** @type {anychart.polarModule.Series} */(this.series));
  /**
   * @type {number}
   * @protected
   */
  this.cx = series.cx;
  /**
   * @type {number}
   * @protected
   */
  this.cy = series.cy;
  /**
   * @type {number}
   * @protected
   */
  this.radius = series.radius;
  /**
   * @type {number}
   * @protected
   */
  this.innerRadius = series.innerRadius;
  /**
   * @type {number}
   * @protected
   */
  this.zeroAngle = goog.math.toRadians(goog.math.modulo((/** @type {number} */(series.getOption('startAngle'))) - 90, 360));
  /**
   * @type {boolean}
   * @protected
   */
  this.counterClockwise = series.planIsXScaleInverted();
  /**
   * If the line should be closed to its first point.
   * @type {boolean}
   * @protected
   */
  this.closed = !!series.getOption('closed');
  /**
   * If the first point is missing (for the closed mode).
   * @type {boolean}
   * @protected
   */
  this.firstPointMissing = false;
  /**
   * First non-missing point X coord (for the closed mode).
   * @type {number}
   * @protected
   */
  this.firstPointX = NaN;
  /**
   * First non-missing point Y coord (for the closed mode).
   * @type {number}
   * @protected
   */
  this.firstPointY = NaN;
  /**
   * @type {number}
   * @protected
   */
  this.firstPointXRatio = NaN;
  /**
   * @type {number}
   * @protected
   */
  this.firstPointYRatio = NaN;
};


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.drawMissingPoint = function(point, state) {
  if (isNaN(this.firstPointX))
    this.firstPointMissing = true;
  anychart.polarModule.drawers.Area.base(this, 'drawMissingPoint', point, state);
};


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var yRatio = /** @type {number} */(point.meta('valueRatio'));
  this.drawSegmentStart_(shapes, x, y);
  if (isNaN(this.firstPointX)) {
    this.firstPointX = x;
    this.firstPointY = y;
    this.firstPointXRatio = xRatio;
    this.firstPointYRatio = yRatio;
  }
  this.lastX = x;
  this.lastY = y;
  this.lastXRatio = xRatio;
  this.lastYRatio = yRatio;
  this.suppressNextNewPath_ = true;
};


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.drawSubsequentPoint = function(point, state) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var yRatio = /** @type {number} */(point.meta('valueRatio'));
  this.drawSegmentContinuation_(x, y, xRatio, yRatio);
};


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.finalizeSegment = function() {
  if (this.prevPointDrawn)
    this.drawSegmentFinish_(this.shapesManager.getShapesGroup(this.seriesState));
};


/** @inheritDoc */
anychart.polarModule.drawers.Area.prototype.finalizeDrawing = function() {
  if (this.closed && !isNaN(this.firstPointX) && (this.connectMissing || this.prevPointDrawn && !this.firstPointMissing)) {
    this.drawSegmentContinuation_(this.firstPointX, this.firstPointY, this.firstPointXRatio, this.firstPointYRatio);
  }
  anychart.polarModule.drawers.Area.base(this, 'finalizeDrawing');
};
