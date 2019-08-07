goog.provide('anychart.stockModule.data.TableSelectable');
goog.provide('anychart.stockModule.data.TableSelectable.RowProxy');
goog.require('anychart.data.IRowInfo');
goog.require('anychart.stockModule.IntervalGenerator');
goog.require('anychart.stockModule.data.TableIterator');



/**
 * Table mapping proxy that supports selection
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @constructor
 */
anychart.stockModule.data.TableSelectable = function(mapping) {
  /**
   * Mapping reference.
   * @type {!anychart.stockModule.data.TableMapping}
   * @private
   */
  this.mapping_ = mapping;

  /**
   * Currently selected storage.
   * @type {!anychart.stockModule.data.TableStorage}
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
   * @type {!anychart.stockModule.data.TableStorage.Selection}
   * @private
   */
  this.currentSelection_ = this.currentStorage_.selectAll();

  /**
   * Controller reference. Can be set using this.setController() method.
   * @type {anychart.stockModule.data.TableSelectable.IController}
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
anychart.stockModule.data.TableSelectable.prototype.resetMeta_ = function() {
  var len = this.controller_ ? this.controller_.getGlobalPointsCountForCurrentGrouping() : this.currentStorage_.getRowsCount();
  while (this.metaData_.length < len)
    this.metaData_.push({});
};


/**
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.prototype.getFullPointsCount = function() {
  return this.currentStorage_.getRowsCount();
};


/**
 * Searches asked key with asked mode and returns an object that allows values fetching.
 * @param {number|string|Date} key
 * @param {anychart.enums.TableSearchMode=} opt_mode
 * @return {anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.search = function(key, opt_mode) {
  return this.getAtIndex(this.currentStorage_.searchIndex(anychart.utils.normalizeTimestamp(key), anychart.enums.normalizeTableSearchMode(opt_mode)));
};


/**
 * Returns a from current storage row at index.
 * @param {number} index
 * @return {anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getAtIndex = function(index) {
  var row = this.currentStorage_.getRow(index);
  if (row)
    return new anychart.stockModule.data.TableSelectable.RowProxy(row, this.mapping_, !this.currentStorageIsMain_, index, this.metaData_[index]);
  else
    return null;
};


/**
 * Selects asked range.
 * @param {number|string|Date} startDate
 * @param {number|string|Date} endDate
 * @param {anychart.enums.Interval=} opt_intervalUnit
 * @param {number=} opt_intervalCount
 * @return {!anychart.stockModule.data.TableSelectable}
 */
anychart.stockModule.data.TableSelectable.prototype.select = function(startDate, endDate, opt_intervalUnit, opt_intervalCount) {
  var interval = goog.isDef(opt_intervalUnit) ?
      new anychart.stockModule.IntervalGenerator(
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
 * @return {!anychart.stockModule.data.TableSelectable}
 */
anychart.stockModule.data.TableSelectable.prototype.selectAll = function(opt_intervalUnit, opt_intervalCount) {
  var interval = goog.isDef(opt_intervalUnit) ?
      new anychart.stockModule.IntervalGenerator(
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
 * @return {!anychart.stockModule.data.TableIterator}
 */
anychart.stockModule.data.TableSelectable.prototype.getIterator = function() {
  return this.getIteratorInternal(true);
};


/**
 * Selects asked range. It's internal because of IIntervalGenerator.
 * @param {number} startKey
 * @param {number} endKey
 * @param {anychart.stockModule.IIntervalGenerator=} opt_interval
 * @return {!anychart.stockModule.data.TableSelectable}
 */
anychart.stockModule.data.TableSelectable.prototype.selectInternal = function(startKey, endKey, opt_interval) {
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
 * @param {anychart.stockModule.data.TableRow} row
 * @param {number} rowIndexInStorage
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 * @private
 */
anychart.stockModule.data.TableSelectable.prototype.wrapRow_ = function(row, rowIndexInStorage) {
  if (row) {
    var globalIndex = this.controller_ ? this.controller_.getIndexByKey(row.key) : rowIndexInStorage;
    return new anychart.stockModule.data.TableSelectable.RowProxy(
        row,
        this.mapping_,
        !this.currentStorageIsMain_,
        globalIndex,
        this.metaData_[globalIndex] || {}
    );
  }
  return null;
};


/**
 * Returns a row before the first one in current selection if there is one.
 * @return {anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getPreFirstRow = function() {
  return this.wrapRow_(this.currentSelection_.preFirstRow, this.currentSelection_.preFirstIndex);
};


/**
 * Returns a row after the last one in current selection if there is one.
 * @return {anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getPostLastRow = function() {
  return this.wrapRow_(this.currentSelection_.postLastRow, this.currentSelection_.postLastIndex);
};


/**
 * Returns the last row in current selection if there is one.
 * @param {string=} opt_fieldName
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getLastVisibleRow = function(opt_fieldName) {
  var row = this.currentSelection_.lastRow;
  var index = this.currentSelection_.lastIndex;
  if (goog.isDef(opt_fieldName)) {
    var column = this.currentStorageIsMain_ ?
        this.mapping_.getSourceColumn(opt_fieldName) :
        this.mapping_.getAggregateColumn(opt_fieldName);
    while (row && row != this.currentSelection_.preFirstRow && isNaN(row.getValue(column))) {
      row = row.prev;
      index--;
    }
  }
  if (row == this.currentSelection_.preFirstRow)
    row = null;
  return this.wrapRow_(row, index);
};


/**
 * Returns the first row in current selection if there is one.
 * @param {string=} opt_fieldName
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getFirstVisibleRow = function(opt_fieldName) {
  var row = this.currentSelection_.firstRow;
  var index = this.currentSelection_.firstIndex;
  if (goog.isDef(opt_fieldName)) {
    var column = this.currentStorageIsMain_ ?
        this.mapping_.getSourceColumn(opt_fieldName) :
        this.mapping_.getAggregateColumn(opt_fieldName);
    while (row && row != this.currentSelection_.postLastRow && isNaN(row.getValue(column))) {
      row = row.next;
      index++;
    }
  }
  if (row == this.currentSelection_.postLastRow)
    row = null;
  return this.wrapRow_(row, index);
};


/**
 * Returns a row wrapper from main storage if it exists. If no key passed - returns first row in storage.
 * WARNING: row wrappers returned by this method do not have valid meta data.
 * @param {number=} opt_key
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getRowFromMainStorage = function(opt_key) {
  var mainStorage = this.mapping_.getTable().getStorage();
  var index = goog.isDef(opt_key) ? mainStorage.searchIndex(opt_key, anychart.enums.TableSearchMode.EXACT) : 0;
  var row = mainStorage.getRow(index);
  return row ? new anychart.stockModule.data.TableSelectable.RowProxy(row, this.mapping_, false, index, null) : null;
};


/**
 * Returns a first row from main storage if it exists.
 * @param {string=} opt_fieldName This means that the first row will be returned in which there is a significant value
 * for this field.
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getFirstRowFromMainStorage = function(opt_fieldName) {
  var mainStorage = this.mapping_.getTable().getStorage();
  var row;
  if (goog.isDef(opt_fieldName)) {
    var column = this.mapping_.getSourceColumn(opt_fieldName);
    for (var i = 0, len = mainStorage.getRowsCount(); i < len; i++) {
      row = mainStorage.getRow(i);
      if (!isNaN(row.getValue(column)))
        break;
    }
  } else {
    row = mainStorage.getRow(0);
  }
  return row ? new anychart.stockModule.data.TableSelectable.RowProxy(row, this.mapping_, false, 0, null) : null;
};


/**
 * Returns a last row from main storage if it exists.
 * @param {string=} opt_fieldName This means that the last row will be returned in which there is a significant value
 * for this field.
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getLastRowFromMainStorage = function(opt_fieldName) {
  var mainStorage = this.mapping_.getTable().getStorage();
  var row;
  if (goog.isDef(opt_fieldName)) {
    var column = this.mapping_.getSourceColumn(opt_fieldName);
    for (var i = mainStorage.getRowsCount(); i--;) {
      row = mainStorage.getRow(i);
      if (!isNaN(row.getValue(column)))
        break;
    }
  } else {
    row = mainStorage.getRow(mainStorage.getRowsCount() - 1);
  }
  return row ? new anychart.stockModule.data.TableSelectable.RowProxy(row, this.mapping_, false, 0, null) : null;
};


/**
 * Returns data row.
 * @param {anychart.enums.ComparisonDataSource|number} dataSource .
 * @param {string=} opt_fieldName .
 * @return {?anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.prototype.getRowByDataSource = function(dataSource, opt_fieldName) {
  /** @type {?anychart.stockModule.data.TableSelectable.RowProxy} */
  var row;
  if (dataSource == anychart.enums.ComparisonDataSource.FIRST_VISIBLE) {
    row = this.getFirstVisibleRow(opt_fieldName);
  } else if (dataSource == anychart.enums.ComparisonDataSource.LAST_VISIBLE) {
    row = this.getLastVisibleRow(opt_fieldName);
  } else if (dataSource == anychart.enums.ComparisonDataSource.SERIES_START) {
    row = this.getFirstRowFromMainStorage(opt_fieldName);
  } else if (dataSource == anychart.enums.ComparisonDataSource.SERIES_END) {
    row = this.getLastRowFromMainStorage(opt_fieldName);
  } else {
    row = this.getRowFromMainStorage(/** @type {number} */(dataSource));
  }
  return row;
};


/**
 * Returns minimum value of the field  (includes only the visible range).
 * @param {string} field
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.prototype.getMin = function(field) {
  return this.getColumnMin(this.getFieldColumn(field));
};


/**
 * Returns maximum value of the field (includes only the visible range).
 * @param {string} field
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.prototype.getMax = function(field) {
  return this.getColumnMax(this.getFieldColumn(field));
};


/**
 * Returns an index of the column mapped by the passed field name.
 * @param {string} field
 * @return {number|string}
 */
anychart.stockModule.data.TableSelectable.prototype.getFieldColumn = function(field) {
  return this.currentStorageIsMain_ ?
      this.mapping_.getSourceColumn(field) :
      this.mapping_.getAggregateColumn(field);
};


/**
 * Returns associated mapping.
 * @return {!anychart.stockModule.data.TableMapping}
 */
anychart.stockModule.data.TableSelectable.prototype.getMapping = function() {
  return this.mapping_;
};


/**
 * Returns minimum value of the column  (includes only the visible range).
 * @param {number|string} column
 * @param {boolean=} opt_onlyVisible
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.prototype.getColumnMin = function(column, opt_onlyVisible) {
  var res = (goog.isNumber(column) && column < 0) ?
      (opt_onlyVisible ? this.currentSelection_.visibleCalcMins[~column] : this.currentSelection_.calcMins[~column]) :
      (opt_onlyVisible ? this.currentSelection_.visibleMins[column] : this.currentSelection_.mins[column]);
  return goog.isDef(res) ? res : NaN;
};


/**
 * Returns maximum value of the column (includes only the visible range).
 * @param {number|string} column
 * @param {boolean=} opt_onlyVisible
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.prototype.getColumnMax = function(column, opt_onlyVisible) {
  var res = (goog.isNumber(column) && column < 0) ?
      (opt_onlyVisible ? this.currentSelection_.visibleCalcMaxs[~column] : this.currentSelection_.calcMaxs[~column]) :
      (opt_onlyVisible ? this.currentSelection_.visibleMaxs[column] : this.currentSelection_.maxs[column]);
  return goog.isDef(res) ? res : NaN;
};


/**
 * Almost the same as this.getIterator(), but allows to pass a coIterator to the new TableIterator.
 * We can't publish this method, because a user cannot get an instance of any coIterator from compiled code.
 * @param {boolean=} opt_passCoIterator
 * @param {boolean=} opt_getFullRangeCoIterator
 * @return {!anychart.stockModule.data.TableIterator}
 */
anychart.stockModule.data.TableSelectable.prototype.getIteratorInternal = function(opt_passCoIterator, opt_getFullRangeCoIterator) {
  return new anychart.stockModule.data.TableIterator(this.mapping_, this.currentSelection_, this.metaData_, !this.currentStorageIsMain_,
      (opt_passCoIterator && this.controller_) ? this.controller_.getCoIterator(!!opt_getFullRangeCoIterator) : null);
};


/**
 * Returns exporting iterator.
 * Always on full range data.
 * Used in csv grouped data generation.
 * @return {!anychart.stockModule.data.TableIterator}
 */
anychart.stockModule.data.TableSelectable.prototype.getExportingIterator = function() {
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
    calcMins: [],
    visibleMins: {},
    visibleMaxs: {},
    visibleCalcMins: [],
    visibleCalcMaxs: []
  };
  return new anychart.stockModule.data.TableIterator(this.mapping_, selection, this.metaData_, !this.currentStorageIsMain_, coIterator);
};


/**
 * Sets controller reference.
 * @param {anychart.stockModule.data.TableSelectable.IController} value
 */
anychart.stockModule.data.TableSelectable.prototype.setController = function(value) {
  this.controller_ = value;
};


/**
 * Selects asked range.
 * @param {number} startKey
 * @param {number} endKey
 * @param {number} preFirstIndex
 * @param {number} postLastIndex
 * @param {anychart.stockModule.IIntervalGenerator=} opt_interval
 * @return {!anychart.stockModule.data.TableSelectable}
 */
anychart.stockModule.data.TableSelectable.prototype.selectFast = function(startKey, endKey, preFirstIndex, postLastIndex, opt_interval) {
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
anychart.stockModule.data.TableSelectable.prototype.invalidateSelection = function() {
  this.selectionInvalid_ = true;
};



/**
 * Controller interface.
 * @interface
 */
anychart.stockModule.data.TableSelectable.IController = function() {};


/**
 * @param {boolean} fullRange
 * @param {boolean=} opt_exportingData
 * @param {boolean=} opt_force
 * @return {anychart.stockModule.data.TableIterator.ICoIterator}
 */
anychart.stockModule.data.TableSelectable.IController.prototype.getCoIterator = function(fullRange, opt_exportingData, opt_force) {};


/**
 * @param {number} key
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.IController.prototype.getIndexByKey = function(key) {};


/**
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.IController.prototype.getGlobalPointsCountForCurrentGrouping = function() {};



/**
 * Represents table row with associated mapping. Allows fetching rows values.
 * @param {!anychart.stockModule.data.TableRow} row
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {boolean} aggregated
 * @param {number} index
 * @param {Object} metaObj
 * @constructor
 * @implements {anychart.data.IRowInfo}
 */
anychart.stockModule.data.TableSelectable.RowProxy = function(row, mapping, aggregated, index, metaObj) {
  /**
   * @type {!anychart.stockModule.data.TableRow}
   */
  this.row = row;

  /**
   * @type {!anychart.stockModule.data.TableMapping}
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
anychart.stockModule.data.TableSelectable.RowProxy.prototype.get = function(field) {
  return this.getColumn(this.aggregated_ ? this.mapping_.getAggregateColumn(field) : this.mapping_.getSourceColumn(field));
};


/**
 * Returns current column value.
 * @param {number|string} column
 * @return {*}
 */
anychart.stockModule.data.TableSelectable.RowProxy.prototype.getColumn = function(column) {
  return this.row.getValue(column);
};


/**
 * Returns index of the item in the selection that have created this item.
 * @return {number}
 */
anychart.stockModule.data.TableSelectable.RowProxy.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Returns current row value that is considered to be X.
 * @return {*}
 */
anychart.stockModule.data.TableSelectable.RowProxy.prototype.getX = function() {
  return this.row.key;
};


/**
 * Getter-setter for row meta. This row meta is valid only for the current Table
 * @param {string} name
 * @param {*=} opt_value
 * @return {*|anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableSelectable.RowProxy.prototype.meta = function(name, opt_value) {
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
anychart.stockModule.data.TableSelectable.RowProxy.prototype.getKey = function() {
  return this.row.key;
};


/**
 * Returns aggregated state.
 * @return {boolean}
 */
anychart.stockModule.data.TableSelectable.RowProxy.prototype.isAggregated = function() {
  return this.aggregated_;
};


//proto['getFieldColumn'] = proto.getFieldColumn;
//proto['getMin'] = proto.getMin;
//proto['getMax'] = proto.getMax;
//proto['getColumnMin'] = proto.getColumnMin;
//proto['getColumnMax'] = proto.getColumnMax;
//proto['getMapping'] = proto.getMapping;

//exports
(function() {
  var proto = anychart.stockModule.data.TableSelectable.prototype;
  proto['search'] = proto.search;
  proto['select'] = proto.select;
  proto['selectAll'] = proto.selectAll;
  proto['getIterator'] = proto.getIterator;

  proto = anychart.stockModule.data.TableSelectable.RowProxy.prototype;
  proto['meta'] = proto.meta;
  proto['get'] = proto.get;
  proto['getKey'] = proto.getKey;
  proto['getColumn'] = proto.getColumn;
  proto['getIndex'] = proto.getIndex;
})();
