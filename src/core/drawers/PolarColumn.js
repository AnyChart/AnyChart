goog.provide('anychart.core.drawers.PolarColumn');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.enums');



/**
 * PolarColumn drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Column}
 */
anychart.core.drawers.PolarColumn = function(series) {
  anychart.core.drawers.PolarColumn.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.PolarColumn, anychart.core.drawers.Column);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.POLAR_COLUMN] = anychart.core.drawers.PolarColumn;


/** @inheritDoc */
anychart.core.drawers.PolarColumn.prototype.type = anychart.enums.SeriesDrawerTypes.POLAR_COLUMN;


/** @inheritDoc */
anychart.core.drawers.PolarColumn.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.PolarColumn.base(this, 'startDrawing', shapeManager);

  var series = (/** @type {anychart.core.series.Polar} */(this.series));
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
anychart.core.drawers.PolarColumn.prototype.drawPointShape = function(point, shapes) {
  var zeroRatio = this.series.planIsStacked() ? /** @type {number} */(point.meta('zeroRatio')) : 0;
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var yRatio = /** @type {number} */(point.meta('valueRatio'));
  var leftXRatio = xRatio - this.pointWidthHalfRatio;
  var rightXRatio = xRatio + this.pointWidthHalfRatio;

  var leftSide = this.series.ratiosToPixelPairs(leftXRatio, [zeroRatio, yRatio]);
  var rightSide = this.series.ratiosToPixelPairs(rightXRatio, [zeroRatio, yRatio]);

  var path = /** @type {acgraph.vector.Path} */(shapes['path']);
  path.moveTo(leftSide[2], leftSide[3]);
  path.curveTo.apply(path, anychart.math.getPolarLineParamsSimple(
      leftSide[2], leftSide[3], leftXRatio, yRatio,
      rightSide[2], rightSide[3], rightXRatio, yRatio,
      this.cx, this.cy, this.radius, this.innerRadius, this.zeroAngle, false));
  path.lineTo(rightSide[0], rightSide[1]);
  path.curveTo.apply(path, anychart.math.getPolarLineParamsSimple(
      rightSide[0], rightSide[1], rightXRatio, zeroRatio,
      leftSide[0], leftSide[1], leftXRatio, zeroRatio,
      this.cx, this.cy, this.radius, this.innerRadius, this.zeroAngle, true));
  path.close();
  var hatch = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  hatch.deserialize(path.serializePathArgs());
};
