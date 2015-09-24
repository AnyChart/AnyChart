goog.provide('anychart.core.dataDrawers.Column');
goog.require('anychart.core.dataDrawers.Base');
goog.require('anychart.utils');



/**
 * Column drawer.
 * @constructor
 * @extends {anychart.core.dataDrawers.Base}
 */
anychart.core.dataDrawers.Column = function() {
  goog.base(this);
};
goog.inherits(anychart.core.dataDrawers.Column, anychart.core.dataDrawers.Base);


/**
 * Sets the drawer up.
 * @param {acgraph.vector.Path} fillPath
 * @param {acgraph.vector.Path} strokePath
 * @param {boolean} crispEdges
 * @param {number} pointWidth
 * @param {number} strokeThickness
 */
anychart.core.dataDrawers.Column.prototype.setup = function(fillPath, strokePath, crispEdges, pointWidth, strokeThickness) {
  /**
   * Fill path to draw to.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.fillPath_ = fillPath;
  fillPath.clear();

  /**
   * Stroke path to draw to.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.strokePath_ = strokePath;
  strokePath.clear();

  /**
   * Whether to draw edges sharp.
   * @type {boolean}
   * @private
   */
  this.crispEdges_ = crispEdges;

  /**
   * Point width half.
   * @type {number}
   * @private
   */
  this.widthHalf_ = pointWidth / 2;

  /**
   * If the crisp edges logic needs to shift all strokes by half a pixel.
   * @type {number}
   * @private
   */
  this.strokeThickness_ = strokeThickness;
};


/**
 * Draws the first point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.Column.prototype.drawFirstPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {
  this.drawSubsequentPoint(xPixelValue, yValues, yPixelValues, zeroPixelValue);
};


/**
 * Draws subsequent point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.Column.prototype.drawSubsequentPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {
  var value = yPixelValues[0];

  var leftX = xPixelValue - this.widthHalf_;
  var rightX = xPixelValue + this.widthHalf_;
  if (this.crispEdges_) {
    leftX = anychart.utils.applyPixelShift(leftX, this.strokeThickness_);
    rightX = anychart.utils.applyPixelShift(rightX, this.strokeThickness_);
    value = anychart.utils.applyPixelShift(value, this.strokeThickness_);
  }

  this.fillPath_
      .moveTo(leftX, value)
      .lineTo(rightX, value)
      .lineTo(rightX, zeroPixelValue)
      .lineTo(leftX, zeroPixelValue)
      .close();

  this.strokePath_
      .moveTo(leftX, value)
      .lineTo(rightX, value)
      .lineTo(rightX, zeroPixelValue)
      .lineTo(leftX, zeroPixelValue)
      .close();
};


/**
 * Finalizes current segment.
 */
anychart.core.dataDrawers.Column.prototype.finalizeSegment = function() {};
