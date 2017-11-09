goog.provide('anychart.data.IDataSource');


/**
 * @interface
 */
anychart.data.IDataSource = function() {
};


/**
 * @param {number} index
 * @return {*}
 */
anychart.data.IDataSource.prototype.getRow = function(index) {
};


/**
 * @return {number}
 */
anychart.data.IDataSource.prototype.getRowsCount = function() {
};


/**
 * Populates passed object with field names known to the storage and returns the new number of fields in it.
 * @param {Object} result
 * @param {number} resultLength
 * @return {number}
 */
anychart.data.IDataSource.prototype.populateObjWithKnownFields = function(result, resultLength) {
};
