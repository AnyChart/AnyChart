goog.provide('anychart.data.IRowInfo');



/**
 * Info extractor interface. Supports extracting data and meta from a row.
 * @interface
 */
anychart.data.IRowInfo = function() {};


/**
 * Returns DATA value for passed field name.
 * @param {string} name
 * @return {*}
 */
anychart.data.IRowInfo.prototype.get = function(name) {};


/**
 * Returns DATA value for passed column identifier. This identifier may be obtained from the overlaying data entity.
 * For some data structures it can be faster to obtain the column identifier first and than to ask the row info
 * extractor about the field using its column identifier.
 * @param {string|number} column
 * @return {*}
 */
anychart.data.IRowInfo.prototype.getColumn = function(column) {};


/**
 * Gets or sets META value for current row.
 * @param {string} name
 * @param {*=} opt_value
 * @return {anychart.data.IRowInfo|*}
 */
anychart.data.IRowInfo.prototype.meta = function(name, opt_value) {};


/**
 * Returns current row index.
 * @return {number}
 */
anychart.data.IRowInfo.prototype.getIndex = function() {};


/**
 * Returns current row value that is considered to be X.
 * @return {*}
 */
anychart.data.IRowInfo.prototype.getX = function() {};
