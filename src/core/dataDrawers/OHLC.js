goog.provide('anychart.core.dataDrawers.OHLC');
goog.require('anychart.core.dataDrawers.Base');
goog.require('anychart.utils');



/**
 * OHLC drawer.
 * @constructor
 * @extends {anychart.core.dataDrawers.Base}
 */
anychart.core.dataDrawers.OHLC = function() {
  goog.base(this);
};
goog.inherits(anychart.core.dataDrawers.OHLC, anychart.core.dataDrawers.Base);


/**
 * Sets the drawer up.
 * @param {acgraph.vector.Path} risingPath
 * @param {acgraph.vector.Path} fallingPath
 * @param {boolean} crispEdges
 * @param {number} pointWidth
 * @param {number} risingThickness
 * @param {number} fallingThickness
 */
anychart.core.dataDrawers.OHLC.prototype.setup = function(risingPath, fallingPath, crispEdges, pointWidth,
    risingThickness, fallingThickness) {
  /**
   * Rising path to draw to.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.risingPath_ = risingPath;
  risingPath.clear();

  /**
   * Falling path to draw to.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.fallingPath_ = fallingPath;
  fallingPath.clear();

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
   * Thickness of the rising path stroke.
   * @type {number}
   * @private
   */
  this.risingThickness_ = risingThickness;

  /**
   * Thickness of the rising path stroke.
   * @type {number}
   * @private
   */
  this.fallingThickness_ = fallingThickness;
};


/**
 * Draws the first point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.OHLC.prototype.drawFirstPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {
  this.drawSubsequentPoint(xPixelValue, yValues, yPixelValues, zeroPixelValue);
};


/**
 * Draws subsequent point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.OHLC.prototype.drawSubsequentPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {
  var x = xPixelValue;
  var open = yPixelValues[0];
  var high = yPixelValues[1];
  var low = yPixelValues[2];
  var close = yPixelValues[3];

  var rising = yValues[0] < yValues[3];

  var path = rising ? this.risingPath_ : this.fallingPath_;

  var leftX = x - this.widthHalf_;
  var rightX = x + this.widthHalf_;
  if (this.crispEdges_) {
    var lineThickness = rising ? this.risingThickness_ : this.fallingThickness_;
    var pixelShift = lineThickness % 2 == 0 ? 0 : 0.5;
    leftX = anychart.utils.applyPixelShift(leftX, pixelShift);
    rightX = anychart.utils.applyPixelShift(rightX, pixelShift);
    x = Math.floor(x) + pixelShift;
    open = anychart.utils.applyPixelShift(open, pixelShift);
    close = anychart.utils.applyPixelShift(close, pixelShift);
    if (high < low) {
      high = Math.floor(high);
      low = Math.floor(low);
    } else if (high > low) {
      high = Math.ceil(high);
      low = Math.floor(low);
    } else {
      high = Math.round(high);
      low = Math.round(low);
    }
  }

  path
      .moveTo(x, high)
      .lineTo(x, low)
      .moveTo(leftX, open)
      .lineTo(x, open)
      .moveTo(rightX, close)
      .lineTo(x, close);
};


/**
 * Finalizes current segment.
 */
anychart.core.dataDrawers.OHLC.prototype.finalizeSegment = function() {};
