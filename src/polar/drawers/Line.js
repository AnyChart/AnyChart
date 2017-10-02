goog.provide('anychart.polarModule.drawers.Line');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.math');
goog.require('goog.math');



/**
 * PolarLine drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Line}
 */
anychart.polarModule.drawers.Line = function(series) {
  anychart.polarModule.drawers.Line.base(this, 'constructor', series);
};
goog.inherits(anychart.polarModule.drawers.Line, anychart.core.drawers.Line);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.POLAR_LINE] = anychart.polarModule.drawers.Line;


/** @inheritDoc */
anychart.polarModule.drawers.Line.prototype.type = anychart.enums.SeriesDrawerTypes.POLAR_LINE;


/** @inheritDoc */
anychart.polarModule.drawers.Line.prototype.startDrawing = function(shapeManager) {
  anychart.polarModule.drawers.Line.base(this, 'startDrawing', shapeManager);

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
  this.counterClockwise = this.series.planIsXScaleInverted();
};


/** @inheritDoc */
anychart.polarModule.drawers.Line.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var yRatio = /** @type {number} */(point.meta('valueRatio'));
  (/** @type {acgraph.vector.Path} */(shapes['stroke'])).moveTo(x, y);
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
anychart.polarModule.drawers.Line.prototype.drawSubsequentPoint = function(point, state) {
  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var yRatio = /** @type {number} */(point.meta('valueRatio'));
  this.lineTo_(x, y, xRatio, yRatio);
};


/** @inheritDoc */
anychart.polarModule.drawers.Line.prototype.additionalFinalize = function() {
  if (this.closed && !isNaN(this.firstPointX) && (this.connectMissing || this.prevPointDrawn && !this.firstPointMissing)) {
    this.lineTo_(this.firstPointX, this.firstPointY, this.firstPointXRatio, this.firstPointYRatio);
  }
};


/**
 * Draws polar line to from last coords to passed position.
 * @param {number} x
 * @param {number} y
 * @param {number} xRatio
 * @param {number} yRatio
 * @private
 */
anychart.polarModule.drawers.Line.prototype.lineTo_ = function(x, y, xRatio, yRatio) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var path = /** @type {acgraph.vector.Path} */(shapes['stroke']);
  var params = anychart.math.getPolarLineParams(this.lastX, this.lastY, this.lastXRatio, this.lastYRatio,
      x, y, xRatio, yRatio, this.cx, this.cy, this.radius, this.innerRadius, this.zeroAngle, this.counterClockwise);
  if (this.suppressNextNewPath_ && params.length)
    params[0] = 0;
  this.suppressNextNewPath_ = false;
  var prevX = this.lastX;
  var prevY = this.lastY;
  for (var i = 0; i < params.length; i += 7) {
    if (params[i]) {
      shapes = this.shapesManager.addShapesGroup(this.seriesState);
      path = /** @type {acgraph.vector.Path} */(shapes['stroke']);
      path.moveTo(prevX, prevY);
    }
    path.curveTo(params[i + 1], params[i + 2], params[i + 3], params[i + 4], prevX = params[i + 5], prevY = params[i + 6]);
  }
  this.lastX = x;
  this.lastY = y;
  this.lastXRatio = xRatio;
  this.lastYRatio = yRatio;
};
