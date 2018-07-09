goog.provide('anychart.polarModule.drawers.RangeColumn');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.RangeColumn');
goog.require('anychart.enums');



/**
 * PolarRangeColumn drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.RangeColumn}
 */
anychart.polarModule.drawers.RangeColumn = function(series) {
  anychart.polarModule.drawers.RangeColumn.base(this, 'constructor', series);
};
goog.inherits(anychart.polarModule.drawers.RangeColumn, anychart.core.drawers.RangeColumn);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.POLAR_RANGE_COLUMN] = anychart.polarModule.drawers.RangeColumn;


/** @inheritDoc */
anychart.polarModule.drawers.RangeColumn.prototype.type = anychart.enums.SeriesDrawerTypes.POLAR_RANGE_COLUMN;


/** @inheritDoc */
anychart.polarModule.drawers.RangeColumn.prototype.startDrawing = function(shapeManager) {
  anychart.polarModule.drawers.RangeColumn.base(this, 'startDrawing', shapeManager);

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
   * @type {number}
   * @protected
   */
  this.pointWidthHalfRatio = this.pointWidth / 720;
};


/** @inheritDoc */
anychart.polarModule.drawers.RangeColumn.prototype.drawSubsequentPoint = function(point, state) {
  var valueNames = this.series.getYValueNames();

  var highValue = point.get(valueNames[1]);
  var lowValue = point.get(valueNames[0]);

  var names = this.getShapeNames(highValue, lowValue);

  var shapeNames = {};
  shapeNames[names.path] = true;
  shapeNames[names.hatchFill] = true;

  point.meta('name', names.path);

  var shapes = this.shapesManager.getShapesGroup(state, shapeNames);

  var lowRatio = /** @type {number} */(point.meta('lowRatio'));
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var highRatio = /** @type {number} */(point.meta('highRatio'));
  var leftXRatio = xRatio - this.pointWidthHalfRatio;
  var rightXRatio = xRatio + this.pointWidthHalfRatio;

  var leftSide = this.series.ratiosToPixelPairs(leftXRatio, [lowRatio, highRatio]);
  var rightSide = this.series.ratiosToPixelPairs(rightXRatio, [lowRatio, highRatio]);

  var path = /** @type {acgraph.vector.Path} */(shapes[names.path]);
  path.moveTo(leftSide[2], leftSide[3]);
  path.curveTo.apply(path, anychart.math.getPolarLineParamsSimple(
      leftSide[2], leftSide[3], leftXRatio, highRatio,
      rightSide[2], rightSide[3], rightXRatio, highRatio,
      this.cx, this.cy, this.radius, this.innerRadius, this.zeroAngle, false));
  path.lineTo(rightSide[0], rightSide[1]);
  path.curveTo.apply(path, anychart.math.getPolarLineParamsSimple(
      rightSide[0], rightSide[1], rightXRatio, lowRatio,
      leftSide[0], leftSide[1], leftXRatio, lowRatio,
      this.cx, this.cy, this.radius, this.innerRadius, this.zeroAngle, true));
  path.close();
  var hatch = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);
  hatch.deserialize(path.serializePathArgs());
};
