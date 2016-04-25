goog.provide('anychart.core.stock.IKeyIndexTransformer');



/**
 * An interface that is used by Stock scales.
 * @interface
 */
anychart.core.stock.IKeyIndexTransformer = function() {};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.IKeyIndexTransformer.prototype.getKeyByIndex = function(index) {};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.IKeyIndexTransformer.prototype.getIndexByKey = function(key) {};
