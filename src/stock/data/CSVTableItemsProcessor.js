goog.provide('anychart.stockModule.data.CSVTableItemsProcessor');
goog.require('anychart.data.csv.IItemsProcessor');



/**
 * @param {!anychart.stockModule.data.TableMainStorage} mainStorage
 * @constructor
 * @implements {anychart.data.csv.IItemsProcessor}
 */
anychart.stockModule.data.CSVTableItemsProcessor = function(mainStorage) {
  /**
   * Table reference
   * @type {!anychart.stockModule.data.TableMainStorage}
   * @private
   */
  this.storage_ = mainStorage;

  /**
   * Currently parsed row.
   * @type {!Array}
   * @private
   */
  this.row_ = [];

  /**
   * Counts the number of passed rows.
   * @type {number}
   * @private
   */
  this.count_ = 0;
};


/**
 * Processes the row.
 */
anychart.stockModule.data.CSVTableItemsProcessor.prototype.processRow = function() {
  this.storage_.addInternal(this.row_);
  // since addInternal copies passed array we can avoid additional arrays creation
  this.row_.length = 0;
};


/**
 * Processes row item.
 * @param {number} colIndex column index.
 * @param {?string} item item text.
 */
anychart.stockModule.data.CSVTableItemsProcessor.prototype.processRowItem = function(colIndex, item) {
  this.row_.push(item);
  this.count_++;
};


/**
 * This method should be called before processing is started.
 */
anychart.stockModule.data.CSVTableItemsProcessor.prototype.start = function() {
  this.row_.length = 0;
  this.count_ = 0;
};


/**
 * Indicates current progress.
 * @param {number} current smth.
 */
anychart.stockModule.data.CSVTableItemsProcessor.prototype.progress = goog.nullFunction;


/**
 * This method should be called after processing is complete.
 */
anychart.stockModule.data.CSVTableItemsProcessor.prototype.finish = function() {
  if (this.row_.length)
    this.processRow();
};


/**
 * Returns the count of rows passed to the table during parsing.
 * @return {number}
 */
anychart.stockModule.data.CSVTableItemsProcessor.prototype.getCount = function() {
  return this.count_;
};
