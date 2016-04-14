goog.provide('anychart.data.TableSelectable');
goog.provide('anychart.data.TableSelectable.RowProxy');
goog.require('anychart.core.utils.DateTimeIntervalGenerator');
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
};


/**
 * Searches asked key with asked mode and returns an object that allows values fetching.
 * @param {number} key
 * @param {anychart.enums.TableSearchMode=} opt_mode
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.search = function(key, opt_mode) {
  var row = this.currentStorage_.search(key, anychart.enums.normalizeTableSearchMode(opt_mode));
  if (row)
    return new anychart.data.TableSelectable.RowProxy(row, this.mapping_, !this.currentStorageIsMain_);
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
  var storage = this.mapping_.getTable().getStorage(opt_interval);
  if (this.selectionInvalid_ ||
      storage != this.currentStorage_ ||
      this.currentSelection_.startKey != startKey ||
      this.currentSelection_.endKey != endKey) {
    this.selectionInvalid_ = false;
    this.currentStorage_ = storage;
    this.currentStorageIsMain_ = !opt_interval; // currently equals the check (storage == table.getStorage())
    this.currentSelection_ = storage.select(startKey, endKey);
  }
  return this;
};


/**
 * Returns a row before the first one in current selection if there is one.
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getPreFirstRow = function() {
  return this.currentSelection_.preFirstRow ?
      new anychart.data.TableSelectable.RowProxy(
          this.currentSelection_.preFirstRow,
          this.mapping_,
          this.currentStorageIsMain_) :
      null;
};


/**
 * Returns a row after the last one in current selection if there is one.
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getPostLastRow = function() {
  return this.currentSelection_.postLastRow ?
      new anychart.data.TableSelectable.RowProxy(
          this.currentSelection_.postLastRow,
          this.mapping_,
          this.currentStorageIsMain_) :
      null;
};


/**
 * Returns the last row in current selection if there is one.
 * @return {anychart.data.TableSelectable.RowProxy}
 */
anychart.data.TableSelectable.prototype.getLastRow = function() {
  return this.currentSelection_.lastRow ?
      new anychart.data.TableSelectable.RowProxy(
          this.currentSelection_.lastRow,
          this.mapping_,
          !this.currentStorageIsMain_) :
      null;
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
 * Returns minimum keys distance for the selection. If selection contains less than 2 points, returns NaN.
 * @return {number}
 */
anychart.data.TableSelectable.prototype.getMinDistance = function() {
  return this.currentSelection_.minDistance;
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
  return new anychart.data.TableIterator(this.mapping_, this.currentSelection_, !this.currentStorageIsMain_,
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
  var firstRow = storage.length ? storage[0] : null;
  var lastRow = storage.length ? storage[storage.length - 1] : null;
  var selection = {
    startKey: NaN,
    endKey: NaN,
    firstIndex: 0,
    firstRow: firstRow,
    lastRow: lastRow,
    preFirstRow: null,
    postLastRow: null,
    mins: {},
    maxs: {},
    calcMaxs: [],
    calcMins: [],
    minDistance: NaN
  };
  return new anychart.data.TableIterator(this.mapping_, selection, !this.currentStorageIsMain_, coIterator);
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
 * @param {number} startIndex
 * @param {number} endIndex
 * @param {anychart.core.utils.IIntervalGenerator=} opt_interval
 * @return {!anychart.data.TableSelectable}
 */
anychart.data.TableSelectable.prototype.selectFast = function(startKey, endKey, startIndex, endIndex, opt_interval) {
  var storage = this.mapping_.getTable().getStorage(opt_interval);
  if (this.selectionInvalid_ ||
      storage != this.currentStorage_ ||
      this.currentSelection_.startKey != startKey ||
      this.currentSelection_.endKey != endKey) {
    this.selectionInvalid_ = false;
    this.currentStorage_ = storage;
    this.currentStorageIsMain_ = !opt_interval; // currently equals the check (storage == table.getStorage())
    this.currentSelection_ = storage.selectFast(startKey, endKey, startIndex, endIndex);
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
anychart.data.TableSelectable.IController.prototype.getCoIterator;



/**
 * Represents table row with associated mapping. Allows fetching rows values.
 * @param {!anychart.data.TableRow} row
 * @param {!anychart.data.TableMapping} mapping
 * @param {boolean} aggregated
 * @constructor
 */
anychart.data.TableSelectable.RowProxy = function(row, mapping, aggregated) {
  /**
   * @type {!anychart.data.TableRow}
   * @protected
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
 * Returns item key.
 * @return {number}
 */
anychart.data.TableSelectable.RowProxy.prototype.getKey = function() {
  return this.row.key;
};


//anychart.data.TableSelectable.prototype['getFieldColumn'] = anychart.data.TableSelectable.prototype.getFieldColumn;
//anychart.data.TableSelectable.prototype['getMin'] = anychart.data.TableSelectable.prototype.getMin;
//anychart.data.TableSelectable.prototype['getMax'] = anychart.data.TableSelectable.prototype.getMax;
//anychart.data.TableSelectable.prototype['getColumnMin'] = anychart.data.TableSelectable.prototype.getColumnMin;
//anychart.data.TableSelectable.prototype['getColumnMax'] = anychart.data.TableSelectable.prototype.getColumnMax;
//anychart.data.TableSelectable.prototype['getMinDistance'] = anychart.data.TableSelectable.prototype.getMinDistance;
//anychart.data.TableSelectable.prototype['getMapping'] = anychart.data.TableSelectable.prototype.getMapping;

//exports
anychart.data.TableSelectable.prototype['search'] = anychart.data.TableSelectable.prototype.search;
anychart.data.TableSelectable.prototype['select'] = anychart.data.TableSelectable.prototype.select;
anychart.data.TableSelectable.prototype['selectAll'] = anychart.data.TableSelectable.prototype.selectAll;
anychart.data.TableSelectable.prototype['getIterator'] = anychart.data.TableSelectable.prototype.getIterator;

anychart.data.TableSelectable.RowProxy.prototype['get'] = anychart.data.TableSelectable.RowProxy.prototype.get;
anychart.data.TableSelectable.RowProxy.prototype['getKey'] = anychart.data.TableSelectable.RowProxy.prototype.getKey;
anychart.data.TableSelectable.RowProxy.prototype['getColumn'] = anychart.data.TableSelectable.RowProxy.prototype.getColumn;
