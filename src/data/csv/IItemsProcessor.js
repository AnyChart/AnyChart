goog.provide('anychart.data.csv.IItemsProcessor');



/**
 * CSV Items processor interface.
 * @interface
 */
anychart.data.csv.IItemsProcessor = function() { };


/**
 * Processes the row.
 */
anychart.data.csv.IItemsProcessor.prototype.processRow = function() {};


/**
 * Processes row item.
 * @param {number} colIndex column index.
 * @param {?string} item item text.
 */
anychart.data.csv.IItemsProcessor.prototype.processRowItem = function(colIndex, item) {};


/**
 * This method should be called before processing is started.
 */
anychart.data.csv.IItemsProcessor.prototype.start = function() {};


/**
 * Indicates current progress.
 * @param {number} current smth.
 */
anychart.data.csv.IItemsProcessor.prototype.progress = function(current) {};


/**
 * This method should be called after processing is complete.
 */
anychart.data.csv.IItemsProcessor.prototype.finish = function() {};
