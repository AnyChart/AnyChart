goog.provide('anychart.data.csv.DefaultItemsProcessor');

goog.require('anychart.data.csv.IItemsProcessor');



/**
 * @constructor
 * @implements {anychart.data.csv.IItemsProcessor}
 */
anychart.data.csv.DefaultItemsProcessor = function() {
};


/**
 * All data.
 * @type {!Array.<!Array>}
 * @private
 */
anychart.data.csv.DefaultItemsProcessor.prototype.data_;


/**
 * Currently parsed values.
 * @type {Array}
 * @private
 */
anychart.data.csv.DefaultItemsProcessor.prototype.row_;


/**
 * Returns parsed data.
 * @return {!Array.<!Array>} Parsed data.
 */
anychart.data.csv.DefaultItemsProcessor.prototype.getData = function() {
  return this.data_;
};


/**
 * Processes the row.
 */
anychart.data.csv.DefaultItemsProcessor.prototype.processRow = function() {
  this.data_.push(this.row_ || []);
  this.row_ = [];
};


/**
 * Processes row item.
 * @param {number} colIndex column index.
 * @param {?string} item item text.
 */
anychart.data.csv.DefaultItemsProcessor.prototype.processRowItem = function(colIndex, item) {
  this.row_.push(item);
};


/**
 * This method should be called before processing is started.
 */
anychart.data.csv.DefaultItemsProcessor.prototype.start = function() {
  this.data_ = [];
  this.row_ = [];
};


/**
 * Indicates current progress.
 * @param {number} current smth.
 */
anychart.data.csv.DefaultItemsProcessor.prototype.progress = goog.nullFunction;


/**
 * This method should be called after processing is complete.
 */
anychart.data.csv.DefaultItemsProcessor.prototype.finish = function() {
  if (this.row_ && this.row_.length)
    this.processRow();
};
