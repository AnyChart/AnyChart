goog.provide('anychart.scales.IXScale');



/**
 * Common interface for scales that are compatible with anychart.core.series.Base method of X values transformation.
 * @interface
 */
anychart.scales.IXScale = function() {};


/**
 * Inverse transform.
 * @param {number} ratio
 * @return {*}
 */
anychart.scales.IXScale.prototype.inverseTransform = function(ratio) {};


/**
 * Should transform passed value to ratio in O(1) time.
 * @param {*} value Value to transform.
 * @param {number} index Point index.
 * @param {number=} opt_subRangeRatio Subrange ratio.
 * @return {number}
 */
anychart.scales.IXScale.prototype.transformInternal = function(value, index, opt_subRangeRatio) {};


/**
 * Public transform method.
 * @param {*} value Value to transform.
 * @param {number=} opt_subRangeRatio Subrange ratio.
 * @return {number}
 */
anychart.scales.IXScale.prototype.transform = function(value, opt_subRangeRatio) {};


/**
 * Checks if passed value will be treated as missing by this scale.
 * @param {*} value
 * @return {boolean}
 */
anychart.scales.IXScale.prototype.isMissing = function(value) {};
