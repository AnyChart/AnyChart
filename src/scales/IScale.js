goog.provide('anychart.scales.IGeoScale');



/**
 * Common interface for scales that are compatible with anychart.core.series.Base method of X values transformation.
 * @interface
 */
anychart.scales.IGeoScale = function() {};


/**
 * Transform coords in pixel value to degrees values (lon/lat).
 * @param {number} x X value to transform.
 * @param {number} y Y value to transform.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.scales.IGeoScale.prototype.inverseTransform = function(x, y) {};


/**
 * Transform lat/lon coords to pixel values.
 * @param {number} lon Longitude in degrees.
 * @param {number} lat Latitude in degrees.
 * @param {?string=} opt_txName Name of TX.
 * @return {Array.<number>} Transformed value adjust bounds [x, y].
 */
anychart.scales.IGeoScale.prototype.transform = function(lon, lat, opt_txName) {};

