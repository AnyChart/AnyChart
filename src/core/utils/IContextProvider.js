goog.provide('anychart.core.utils.IContextProvider');



/**
 * Context provider interface
 * @interface
 */
anychart.core.utils.IContextProvider = function() {
};


/**
 * Applies reference values.
 */
anychart.core.utils.IContextProvider.prototype.applyReferenceValues = function() {};


/**
 * Fetch statistics value by key.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.IContextProvider.prototype.getStat = function(opt_key) {};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.IContextProvider.prototype.getDataValue = function(key) {};
