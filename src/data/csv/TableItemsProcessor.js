goog.provide('anychart.data.csv.TableItemsProcessor');
goog.require('anychart.data.csv.IItemsProcessor');



/**
 * @param {!anychart.data.TableMainStorage} mainStorage
 * @constructor
 * @implements {anychart.data.csv.IItemsProcessor}
 */
anychart.data.csv.TableItemsProcessor = function(mainStorage) {
  /**
   * Table reference
   * @type {!anychart.data.TableMainStorage}
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
anychart.data.csv.TableItemsProcessor.prototype.processRow = function() {
  this.storage_.addInternal(this.row_);
  // since addInternal copies passed array we can avoid additional arrays creation
  this.row_.length = 0;
};


/**
 * Processes row item.
 * @param {number} colIndex column index.
 * @param {?string} item item text.
 */
anychart.data.csv.TableItemsProcessor.prototype.processRowItem = function(colIndex, item) {
  this.row_.push(item);
  this.count_++;
};


/**
 * This method should be called before processing is started.
 */
anychart.data.csv.TableItemsProcessor.prototype.start = function() {
  this.row_.length = 0;
  this.count_ = 0;
};


/**
 * Indicates current progress.
 * @param {number} current smth.
 */
anychart.data.csv.TableItemsProcessor.prototype.progress = goog.nullFunction;


/**
 * This method should be called after processing is complete.
 */
anychart.data.csv.TableItemsProcessor.prototype.finish = function() {
  if (this.row_.length)
    this.processRow();
};


/**
 * Returns the count of rows passed to the table during parsing.
 * @return {number}
 */
anychart.data.csv.TableItemsProcessor.prototype.getCount = function() {
  return this.count_;
};
