goog.provide('anychart.math.Rect');

goog.require('acgraph.math.Rect');



/**
 * Класс, описывающий прямоугольник.
 * @param {number} x X-coordinate of top-left point.
 * @param {number} y Y-coordinate of top-left point.
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


/**
 * @return {Array.<number>}
 */
anychart.math.Rect.prototype.toCoordinateBox = function() {
  return [this.left, this.top,
    this.left + this.width, this.top,
    this.left + this.width, this.top + this.height,
    this.left, this.top + this.height];
};


/**
 * Serializes the rect.
 * @return {!Object}
 */
anychart.math.Rect.prototype.serialize = function() {
  return {
    'left': this.left,
    'top': this.top,
    'width': this.width,
    'height': this.height
  };
};


/**
 * Creates the rect and deserializes it from the config.
 * @param {Object} config
 * @return {anychart.math.Rect} Deserialized rect.
 */
anychart.math.Rect.deserialize = function(config) {
  return new anychart.math.Rect(
      +config['left'] || 0,
      +config['top'] || 0,
      +config['width'] || 0,
      +config['height'] || 0);
};
//endregion
