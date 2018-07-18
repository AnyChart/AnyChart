goog.provide('anychart.polarModule.drawers.Column');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.enums');



/**
 * PolarColumn drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Column}
 */
anychart.polarModule.drawers.Column = function(series) {
  anychart.polarModule.drawers.Column.base(this, 'constructor', series);
};
goog.inherits(anychart.polarModule.drawers.Column, anychart.core.drawers.Column);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.POLAR_COLUMN] = anychart.polarModule.drawers.Column;


/** @inheritDoc */
anychart.polarModule.drawers.Column.prototype.type = anychart.enums.SeriesDrawerTypes.POLAR_COLUMN;


/** @inheritDoc */
anychart.polarModule.drawers.Column.prototype.startDrawing = function(shapeManager) {
  anychart.polarModule.drawers.Column.base(this, 'startDrawing', shapeManager);

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
anychart.polarModule.drawers.Column.prototype.drawPointShape = function(point, path, hatchFill) {
  var zeroRatio = /** @type {number} */(point.meta('zeroRatio'));
  var xRatio = /** @type {number} */(point.meta('xRatio'));
  var yRatio = /** @type {number} */(point.meta('valueRatio'));
  var leftXRatio = xRatio - this.pointWidthHalfRatio;
  var rightXRatio = xRatio + this.pointWidthHalfRatio;

  var leftSide = this.series.ratiosToPixelPairs(leftXRatio, [zeroRatio, yRatio]);
  var rightSide = this.series.ratiosToPixelPairs(rightXRatio, [zeroRatio, yRatio]);

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
  hatchFill.deserialize(path.serializePathArgs());
};
