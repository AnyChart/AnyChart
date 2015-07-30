goog.provide('anychart.data.csv.TreeItemsProcessor');

goog.require('anychart.data.csv.IItemsProcessor');



/**
 * Tree CSV items processor.
 * @constructor
 * @implements {anychart.data.csv.IItemsProcessor}
 */
anychart.data.csv.TreeItemsProcessor = function() {

  /**
   * @type {Array.<string>}
   * @private
   */
  this.mapping_ = [];

};


/**
 * Array of raw objects prepared to be processed into a tree structure with anychart.enums.TreeFillingMethod.AS_TABLE method.
 * @type {!Array.<Object>}
 * @private
 */
anychart.data.csv.TreeItemsProcessor.prototype.data_;


/**
 * Currently parsed values.
 * @type {Object}
 * @private
 */
anychart.data.csv.TreeItemsProcessor.prototype.row_;


/**
 * @type {boolean}
 * @private
 */
anychart.data.csv.TreeItemsProcessor.prototype.hasRow_;


/**
 * Gets/sets current fields mapping.
 * @param {Object=} opt_value
 * @return {(anychart.data.csv.TreeItemsProcessor|Object)} - Current value or itself for method chaining.
 */
anychart.data.csv.TreeItemsProcessor.prototype.mapping = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value)) {
      /*
        Here we've got mapping object that looks like
          <code>
            {
              'id': 0,
              'name': 1,
              'value': 15
            }
          </code>

        It means that 'id'-field must be taken from first column, 'name'-field from second, etc.
        But in parsing process we get the column's index only (@see {processRowItem}). That's why we turn incoming
        mapping object into array: we need to know a field name associated to index.
        Inner mapping looks like
          <code>
            [
              0: 'id',
              1: 'name',
              2-14: undefined,
              15: 'value'
            ]
          </code>
       */
      this.mapping_.length = 0;
      for (var key in opt_value) {
        var val = opt_value[key];
        if (goog.isNumber(val)) this.mapping_[val] = key;
      }
    }
    return this;
  }
  return this.mapping_;
};


/**
 * Returns parsed data.
 * @return {!Array.<Object>} Parsed data.
 */
anychart.data.csv.TreeItemsProcessor.prototype.getData = function() {
  return this.data_;
};


/**
 * Processes the row.
 */
anychart.data.csv.TreeItemsProcessor.prototype.processRow = function() {
  this.data_.push(this.row_);
  this.row_ = {};
  this.hasRow_ = false;
};


/**
 * Processes row item.
 * @param {number} colIndex - Column index.
 * @param {?string} item - Item text.
 */
anychart.data.csv.TreeItemsProcessor.prototype.processRowItem = function(colIndex, item) {
  var mapValue = this.mapping_[colIndex];
  var field = goog.isDef(mapValue) ? mapValue : 'column' + colIndex;
  if (!goog.isNull(item))
    this.row_[field] = item;
  this.hasRow_ = true;
};


/**
 * This method should be called before processing is started.
 */
anychart.data.csv.TreeItemsProcessor.prototype.start = function() {
  this.data_ = [];
  this.row_ = {};
  this.hasRow_ = false;
};


/**
 * Indicates current progress.
 * @param {number} current smth.
 */
anychart.data.csv.TreeItemsProcessor.prototype.progress = goog.nullFunction;


/**
 * This method should be called after processing is complete.
 */
anychart.data.csv.TreeItemsProcessor.prototype.finish = function() {
  if (this.hasRow_) this.processRow();
};
