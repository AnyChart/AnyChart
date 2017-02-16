goog.provide('anychart.data.TableSelectable');
goog.provide('anychart.data.TableSelectable.RowProxy');
goog.require('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.data.IRowInfo');
goog.require('anychart.data.TableIterator');



/**
 * Table mapping proxy that supports selection
 * @param {!anychart.data.TableMapping} mapping
 * @constructor
 */
anychart.data.TableSelectable = function(mapping) {
  /**
   * Mapping reference.
   * @type {!anychart.data.TableMapping}
   * @private
   */
  this.mapping_ = mapping;

  /**
   * Currently selected storage.
   * @type {!anychart.data.TableStorage}
   * @private
   */
  this.currentStorage_ = mapping.getTable().getStorage();

  /**
   * If true - currentStorage_ is a TableMainStorage or a TableAggregatedStorage otherwise.
   * @type {boolean}
   * @private
   */
  this.currentStorageIsMain_ = true;

  /**
   * Currently selected data.
   * @type {!anychart.data.TableStorage.Selection}
   * @private
   */
  this.currentSelection_ = this.currentStorage_.selectAll();

  /**
   * Controller reference. Can be set using this.setController() method.
   * @type {anychart.data.TableSelectable.IController}
   * @private
   */
  this.controller_ = null;

  /**
   * If the next selection should reacquire data from storage.
   * @type {boolean}
   * @private
   */
  this.selectionInvalid_ = false;

  /**
   * Array of meta.
   * @type {Array.<Object>}
   * @private
   */
  this.metaData_ = [];

  this.resetMeta_();
};


/**
 * Resets meta information. Currently when meta is reset we assume that the series would write correct values to the
 * meta prior to reading them from it. That's why we do not recreate those objects on each reselect.
 * //todo (Anton Saukh): Implement meta division to persistent/non-persistent.
 * @private
 */
anychart.data.TableSelectable.prototype.resetMeta_ = function() {
  var len = this.controller_ ? this.controller_.getGlobalPointsCountForCurrentGrouping() : this.currentStorage_.getRowsCount();
  while (this.metaData_.length < len)
    this.metaData_.push({});
};


/**
 * Searches asked key with asked mode and returns an object that allows values fetching.
 * @param {number} key
 * @param {anychart.enums.TableSearchMode=} opt_mode
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.search = function(key, opt_mode) {
  var index = this.currentStorage_.searchIndex(key, anychart.enums.normalizeTableSearchMode(opt_mode));
  var row = this.currentStorage_.getRow(index);
  if (row)
    return new anychart.data.TableSelectable.RowProxy(row, this.mapping_, !this.currentStorageIsMain_, index, this.metaData_[index]);
  else
    return null;
};


/**
 * Selects asked range.
 * @param {number|string|Date} startDate
 * @param {number|string|Date} endDate
 * @param {anychart.enums.Interval=} opt_intervalUnit
 * @param {number=} opt_intervalCount
 * @return {!anychart.data.TableSelectable}
 */
anychart.data.TableSelectable.prototype.select = function(startDate, endDate, opt_intervalUnit, opt_intervalCount) {
  var interval = goog.isDef(opt_intervalUnit) ?
      new anychart.core.utils.DateTimeIntervalGenerator(
          /** @type {string} */(opt_intervalUnit),
          anychart.utils.toNumber(opt_intervalCount)) :
      undefined;
  return this.selectInternal(
      anychart.utils.normalizeTimestamp(startDate),
      anychart.utils.normalizeTimestamp(endDate),
      interval
  );
};


/**
 * Selects the full range of the storage.
 * @param {anychart.enums.Interval=} opt_intervalUnit
 * @param {number=} opt_intervalCount
 * @return {!anychart.data.TableSelectable}
 */
anychart.data.TableSelectable.prototype.selectAll = function(opt_intervalUnit, opt_intervalCount) {
  var interval = goog.isDef(opt_intervalUnit) ?
      new anychart.core.utils.DateTimeIntervalGenerator(
          /** @type {string} */(opt_intervalUnit),
          anychart.utils.toNumber(opt_intervalCount)) :
      undefined;
  var storage = this.mapping_.getTable().getStorage(interval);
  this.currentStorage_ = storage;
  this.currentStorageIsMain_ = !interval; // currently equals the check (storage == table.getStorage())
  this.currentSelection_ = storage.selectAll();
  this.resetMeta_();
  return this;
};


/**
 * Returns a new iterator for current selection.
 * @return {!anychart.data.TableIterator}
 */
anychart.data.TableSelectable.prototype.getIterator = function() {
  return this.getIteratorInternal(true);
};


/**
 * Selects asked range. It's internal because of IIntervalGenerator.
 * @param {number} startKey
 * @param {number} endKey
 * @param {anychart.core.utils.IIntervalGenerator=} opt_interval
 * @return {!anychart.data.TableSelectable}
 */
anychart.data.TableSelectable.prototype.selectInternal = function(startKey, endKey, opt_interval) {
  if (startKey > endKey) { // if any of it is NaN, condition fails
    var tmp = startKey;
    startKey = endKey;
    endKey = tmp;
  }
  var storage = this.mapping_.getTable().getStorage(opt_interval);
  if (this.selectionInvalid_ ||
      storage != this.currentStorage_ ||
      this.currentSelection_.startKey != startKey ||
      this.currentSelection_.endKey != endKey) {
    this.selectionInvalid_ = false;
    this.currentStorage_ = storage;
    this.currentStorageIsMain_ = !opt_interval; // currently equals the check (storage == table.getStorage())
    this.currentSelection_ = storage.select(startKey, endKey);
    this.resetMeta_();
  }
  return this;
};


/**
 * Wraps passed TableRow to a RowProxy.
 * @param {anychart.data.TableRow} row
 * @param {number} rowIndexInStorage
 * @return {?anychart.data.TableSelectable.RowProxy}
 * @private
 */
anychart.data.TableSelectable.prototype.wrapRow_ = function(row, rowIndexInStorage) {
  if (row) {
    var globalIndex = this.controller_ ? this.controller_.getIndexByKey(row.key) : rowIndexInStorage;
    return new anychart.data.TableSelectable.RowProxy(
        row,
        this.mapping_,
        !this.currentStorageIsMain_,
        globalIndex,
        this.metaData_[globalIndex]
    );
  }
  return null;
};


/**
 * Returns a row before the first one in current selection if there is one.
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getPreFirstRow = function() {
  return this.wrapRow_(this.currentSelection_.preFirstRow, this.currentSelection_.preFirstIndex);
};


/**
 * Returns a row after the last one in current selection if there is one.
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getPostLastRow = function() {
  return this.wrapRow_(this.currentSelection_.postLastRow, this.currentSelection_.postLastIndex);
};


/**
 * Returns the last row in current selection if there is one.
 * @return {?anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getLastVisibleRow = function() {
  return this.wrapRow_(this.currentSelection_.lastRow, this.currentSelection_.lastIndex);
};


/**
 * Returns the first row in current selection if there is one.
 * @return {?anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getFirstVisibleRow = function() {
  return this.wrapRow_(this.currentSelection_.firstRow, this.currentSelection_.firstIndex);
};


/**
 * Returns a row wrapper from main storage if it exists. If no key passed - returns first row in storage.
 * WARNING: row wrappers returned by this method do not have valid meta data.
 * @param {number=} opt_key
 * @return {?anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getRowFromMainStorage = function(opt_key) {
  var mainStorage = this.mapping_.getTable().getStorage();
  var index = goog.isDef(opt_key) ? mainStorage.searchIndex(opt_key, anychart.enums.TableSearchMode.EXACT) : 0;
  var row = mainStorage.getRow(index);
  return row ? new anychart.data.TableSelectable.RowProxy(row, this.mapping_, false, index, null) : null;
};


/**
 * Returns minimum value of the field  (includes only the visible range).
 * @param {string} field
 * @return {number}
 */
anychart.data.TableSelectable.prototype.getMin = function(field) {
  return this.getColumnMin(this.getFieldColumn(field));
};


/**
 * Returns maximum value of the field (includes only the visible range).
 * @param {string} field
 * @return {number}
 */
anychart.data.TableSelectable.prototype.getMax = function(field) {
  return this.getColumnMax(this.getFieldColumn(field));
};


/**
 * Returns an index of the column mapped by the passed field name.
 * @param {string} field
 * @return {number|string}
 */
anychart.data.TableSelectable.prototype.getFieldColumn = function(field) {
  return this.currentStorageIsMain_ ?
      this.mapping_.getSourceColumn(field) :
      this.mapping_.getAggregateColumn(field);
};


/**
 * Returns associated mapping.
 * @return {!anychart.data.TableMapping}
 */
anychart.data.TableSelectable.prototype.getMapping = function() {
  return this.mapping_;
};


/**
 * Returns minimum value of the column  (includes only the visible range).
 * @param {number|string} column
 * @return {number}
 */
anychart.data.TableSelectable.prototype.getColumnMin = function(column) {
  var res = (goog.isNumber(column) && column < 0) ?
      this.currentSelection_.calcMins[~column] :
      this.currentSelection_.mins[column];
  return goog.isDef(res) ? res : NaN;
};


/**
 * Returns maximum value of the column (includes only the visible range).
 * @param {number|string} column
 * @return {number}
 */
anychart.data.TableSelectable.prototype.getColumnMax = function(column) {
  var res = (goog.isNumber(column) && column < 0) ?
      this.currentSelection_.calcMaxs[~column] :
      this.currentSelection_.maxs[column];
  return goog.isDef(res) ? res : NaN;
};


/**
 * Almost the same as this.getIterator(), but allows to pass a coIterator to the new TableIterator.
 * We can't publish this method, because a user cannot get an instance of any coIterator from compiled code.
 * @param {boolean=} opt_passCoIterator
 * @param {boolean=} opt_getFullRangeCoIterator
 * @return {!anychart.data.TableIterator}
 */
anychart.data.TableSelectable.prototype.getIteratorInternal = function(opt_passCoIterator, opt_getFullRangeCoIterator) {
  return new anychart.data.TableIterator(this.mapping_, this.currentSelection_, this.metaData_, !this.currentStorageIsMain_,
      (opt_passCoIterator && this.controller_) ? this.controller_.getCoIterator(!!opt_getFullRangeCoIterator) : null);
};


/**
 * Returns exporting iterator.
 * Always on full range data.
 * Used in csv grouped data generation.
 * @return {!anychart.data.TableIterator}
 */
anychart.data.TableSelectable.prototype.getExportingIterator = function() {
  var coIterator = this.controller_ ? this.controller_.getCoIterator(false, true) : null;
  var storage = this.currentStorage_.getStorageInternal();
  var firstIndex, lastIndex, firstRow, lastRow;
  if (storage.length) {
    firstIndex = 0;
    lastIndex = storage.length - 1;
    firstRow = storage[firstIndex];
    lastRow = storage[lastIndex];
  } else {
    firstIndex = lastIndex = NaN;
    firstRow = lastRow = null;
  }
  var selection = {
    startKey: NaN,
    endKey: NaN,
    preFirstIndex: NaN,
    firstIndex: firstIndex,
    lastIndex: lastIndex,
    postLastIndex: NaN,
    preFirstRow: null,
    firstRow: firstRow,
    lastRow: lastRow,
    postLastRow: null,
    mins: {},
    maxs: {},
    calcMaxs: [],
    calcMins: []
  };
  return new anychart.data.TableIterator(this.mapping_, selection, this.metaData_, !this.currentStorageIsMain_, coIterator);
};


/**
 * Sets controller reference.
 * @param {anychart.data.TableSelectable.IController} value
 */
anychart.data.TableSelectable.prototype.setController = function(value) {
  this.controller_ = value;
};


/**
 * Selects asked range.
 * @param {number} startKey
 * @param {number} endKey
 * @param {number} preFirstIndex
 * @param {number} postLastIndex
 * @param {anychart.core.utils.IIntervalGenerator=} opt_interval
 * @return {!anychart.data.TableSelectable}
 */
anychart.data.TableSelectable.prototype.selectFast = function(startKey, endKey, preFirstIndex, postLastIndex, opt_interval) {
  var storage = this.mapping_.getTable().getStorage(opt_interval);
  if (this.selectionInvalid_ ||
      storage != this.currentStorage_ ||
      this.currentSelection_.startKey != startKey ||
      this.currentSelection_.endKey != endKey) {
    this.selectionInvalid_ = false;
    this.currentStorage_ = storage;
    this.currentStorageIsMain_ = !opt_interval; // currently equals the check (storage == table.getStorage())
    this.currentSelection_ = storage.selectFast(startKey, endKey, preFirstIndex, postLastIndex);
    this.resetMeta_();
  }
  return this;
};


/**
 * Forces next selection to reacquire data from storage.
 */
anychart.data.TableSelectable.prototype.invalidateSelection = function() {
  this.selectionInvalid_ = true;
};



/**
 * Controller interface.
 * @interface
 */
anychart.data.TableSelectable.IController = function() {};


/**
 * @param {boolean} fullRange
 * @param {boolean=} opt_exportingData
 * @return {anychart.data.TableIterator.ICoIterator}
 */
anychart.data.TableSelectable.IController.prototype.getCoIterator = function(fullRange, opt_exportingData) {};


/**
 * @param {number} key
 * @return {number}
 */
anychart.data.TableSelectable.IController.prototype.getIndexByKey = function(key) {};


/**
 * @return {number}
 */
anychart.data.TableSelectable.IController.prototype.getGlobalPointsCountForCurrentGrouping = function() {};



/**
 * Represents table row with associated mapping. Allows fetching rows values.
 * @param {!anychart.data.TableRow} row
 * @param {!anychart.data.TableMapping} mapping
 * @param {boolean} aggregated
 * @param {number} index
 * @param {Object} metaObj
 * @constructor
 * @implements {anychart.data.IRowInfo}
 */
anychart.data.TableSelectable.RowProxy = function(row, mapping, aggregated, index, metaObj) {
  /**
   * @type {!anychart.data.TableRow}
   */
  this.row = row;

  /**
   * @type {!anychart.data.TableMapping}
   * @private
   */
  this.mapping_ = mapping;

  /**
   * @type {boolean}
   * @private
   */
  this.aggregated_ = aggregated;

  /**
   * @type {number}
   * @private
   */
  this.index_ = index;

  /**
   * @type {Object}
   * @private
   */
  this.meta_ = metaObj;
};


/**
 * Returns current field values.
 * @param {string} field
 * @return {*}
 */
anychart.data.TableSelectable.RowProxy.prototype.get = function(field) {
  return this.getColumn(this.aggregated_ ? this.mapping_.getAggregateColumn(field) : this.mapping_.getSourceColumn(field));
};


/**
 * Returns current column value.
 * @param {number|string} column
 * @return {*}
 */
anychart.data.TableSelectable.RowProxy.prototype.getColumn = function(column) {
  var result;
  if (goog.isNumber(column) && column < 0) {
    if (this.row.computedValues)
      result = this.row.computedValues[~column];
  } else {
    result = this.row.values[column];
  }
  return result; // may by undefined
};


/**
 * Returns index of the item in the selection that have created this item.
 * @return {number}
 */
anychart.data.TableSelectable.RowProxy.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Returns current row value that is considered to be X.
 * @return {*}
 */
anychart.data.TableSelectable.RowProxy.prototype.getX = function() {
  return this.row.key;
};


/**
 * Getter-setter for row meta. This row meta is valid only for the current Table
 * @param {string} name
 * @param {*=} opt_value
 * @return {*|anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.RowProxy.prototype.meta = function(name, opt_value) {
  if (arguments.length > 1) {
    if (this.meta_)
      this.meta_[name] = opt_value;
    return this;
  }
  return this.meta_ ? this.meta_[name] : undefined;
};


/**
 * Returns item key.
 * @return {number}
 */
anychart.data.TableSelectable.RowProxy.prototype.getKey = function() {
  return this.row.key;
};


//proto['getFieldColumn'] = proto.getFieldColumn;
//proto['getMin'] = proto.getMin;
//proto['getMax'] = proto.getMax;
//proto['getColumnMin'] = proto.getColumnMin;
//proto['getColumnMax'] = proto.getColumnMax;
//proto['getMapping'] = proto.getMapping;

//exports
(function() {
  var proto = anychart.data.TableSelectable.prototype;
  proto['search'] = proto.search;
  proto['select'] = proto.select;
  proto['selectAll'] = proto.selectAll;
  proto['getIterator'] = proto.getIterator;

  proto = anychart.data.TableSelectable.RowProxy.prototype;
  proto['meta'] = proto.meta;
  proto['get'] = proto.get;
  proto['getKey'] = proto.getKey;
  proto['getColumn'] = proto.getColumn;
  proto['getIndex'] = proto.getIndex;
})();
