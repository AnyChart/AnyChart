goog.provide('anychart.core.dataDrawers.Base');



/**
 * Base data drawer interface. A drawer is just an instrument to draw. It doesn't have any state.
 * @constructor
 */
anychart.core.dataDrawers.Base = function() {

  this.markers_ = null;
};


/**
 * Draws the first point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.Base.prototype.drawFirstPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {};


/**
 * Draws subsequent point in segment.
 * @param {number} xPixelValue
 * @param {!Array.<*>} yValues
 * @param {!Array.<number>} yPixelValues
 * @param {number} zeroPixelValue
 */
anychart.core.dataDrawers.Base.prototype.drawSubsequentPoint = function(xPixelValue, yValues, yPixelValues, zeroPixelValue) {};


/**
 * Finalizes current segment.
 */
anychart.core.dataDrawers.Base.prototype.finalizeSegment = function() {};
