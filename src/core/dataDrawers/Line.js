goog.provide('anychart.core.dataDrawers.Line');
goog.require('anychart.core.dataDrawers.Base');



/**
 * Line drawer.
 * @constructor
 * @extends {anychart.core.dataDrawers.Base}
 */
anychart.core.dataDrawers.Line = function() {
  goog.base(this);
};
goog.inherits(anychart.core.dataDrawers.Line, anychart.core.dataDrawers.Base);


/**
 * Sets the drawer up.
 * @param {acgraph.vector.Path} path
 */
anychart.core.dataDrawers.Line.prototype.setup = function(path) {
  /**
   * Path to draw to.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = path;
  path.clear();
};


/**
 * Draws the first point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.Line.prototype.drawFirstPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {
  this.path_.moveTo(xPixelValue, yPixelValues[0]);
};


/**
 * Draws subsequent point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.Line.prototype.drawSubsequentPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {
  this.path_.lineTo(xPixelValue, yPixelValues[0]);
};


/**
 * Finalizes current segment.
 */
anychart.core.dataDrawers.Line.prototype.finalizeSegment = function() {};
