goog.provide('anychart.math.Rect');

goog.require('acgraph.math.Rect');



/**
 * Rectangle class.
 * @param {number} x X-coordinate.
 * @param {number} y Y-coordinate.
 * @param {number} w Width.
 * @param {number} h Height.
 * @constructor
 */
anychart.math.Rect = acgraph.math.Rect;


//region --- Declarations for IDEA ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Declarations for IDEA
//
//----------------------------------------------------------------------------------------------------------------------
// Prevents IDEA from throwing warnings about undefined fields.
/**
 * @type {number}
 */
anychart.math.Rect.prototype.left;


/**
 * @type {number}
 */
anychart.math.Rect.prototype.top;


/**
 * @type {number}
 */
anychart.math.Rect.prototype.width;


/**
 * @type {number}
 */
anychart.math.Rect.prototype.height;


/**
 * @return {!anychart.math.Rect} A copy of a rectangle.
 */
anychart.math.Rect.prototype.clone;
//endregion
