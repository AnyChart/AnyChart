goog.provide('anychart.data.Table');
goog.require('anychart.core.Base');
goog.require('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.core.utils.IIntervalGenerator');
goog.require('anychart.data.TableAggregatedStorage');
goog.require('anychart.data.TableMainStorage');
goog.require('anychart.data.TableMapping');
goog.require('anychart.data.TableRow');
goog.require('anychart.data.aggregators');
goog.require('anychart.data.csv.Parser');
goog.require('anychart.data.csv.TableItemsProcessor');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Stock data table constructor.
 * @param {(number|string)=} opt_keyColumn The number of the data column that contains the indexing field.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.data.Table = function(opt_keyColumn) {
  goog.base(this);

  /**
   * Main table storage.
   * @type {!anychart.data.TableMainStorage}
   * @private
   */
  this.storage_ = new anychart.data.TableMainStorage(this, opt_keyColumn);

  /**
   * Storage aggregates cache. Each cache may need to be updated before use. See Table.AggregateDescriptor description
   * for more info about cache update. Hash key is an datetime interval ISO string.
   * @type {!Object.<string, !anychart.data.TableAggregatedStorage>}
   * @private
   */
  this.aggregates_ = {};

  /**
   * Map of column indexes by column definition hash.
   * @type {Object.<string, number>}
   * @private
   */
  this.columnsMap_ = {};

  /**
   * Aggregators by column.
   * @type {!Array.<!anychart.data.aggregators.Base>}
   * @private
   */
  this.aggregators_ = [];
};
goog.inherits(anychart.data.Table, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.data.Table.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Makes the table to enter transaction mode.
 * @return {!anychart.data.Table}
 */
anychart.data.Table.prototype.startTransaction = function() {
  this.storage_.startTransaction();
  return this;
};


/**
 * Commits all changes to the storage.
 * @return {!anychart.data.Table}
 */
anychart.data.Table.prototype.commit = function() {
  this.storage_.commit();
  return this;
};


/**
 * Makes transaction rollback.
 * @return {!anychart.data.Table}
 */
anychart.data.Table.prototype.rollback = function() {
  this.storage_.rollback();
  return this;
};


/**
 * Adds data to the table. Replaces all rows with duplicating keys by the last seen row with that key.
 * @param {!(Array|string)} rawData Array of arrays of data or CSV string.
 * @param {(boolean|number)=} opt_removeFromStart Removes passed count of rows from the beginning of the storage. If
 *      true is passed - removes N rows, where N is the number of rows, passed as rawData (doesn't count duplicates, so
 *      if you pass two rows with same key value - it will remove two rows, not one). Note that removing is made AFTER
 *      the adding, so it can remove some rows that were added by itself.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {!anychart.data.Table} Returns itself for chaining.
 */
anychart.data.Table.prototype.addData = function(rawData, opt_removeFromStart, opt_csvSettings) {
  this.storage_.addData(rawData, opt_removeFromStart, opt_csvSettings);
  return this;
};


/**
 * Removes all items between start and end keys.
 * @param {number} startKey
 * @param {number} endKey
 * @return {!anychart.data.Table} Returns itself for chaining.
 */
anychart.data.Table.prototype.remove = function(startKey, endKey) {
  this.storage_.remove(startKey, endKey);
  return this;
};


/**
 * Removes first opt_count rows from the storage also considering appended but not yet committed rows.
 * @param {number=} opt_count Defaults to 1.
 * @return {!anychart.data.Table} Returns itself for chaining.
 */
anychart.data.Table.prototype.removeFirst = function(opt_count) {
  this.storage_.removeFirst(opt_count);
  return this;
};


/**
 * Returns a new mapping for the table. You can add fields to table mappings after the mapping is created
 * using it's addField() method.
 * @param {Object.<({column:(number|string), type:anychart.enums.AggregationType, weights:(number|string)}|number|string)>=} opt_fields An
 *   object where keys are field names and values are
 *   objects with fields:
 *      - 'column': (number|string) - Column index or object field name, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': (number|string) - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or (numbers|strings) - just the field name to get values from. In this case the grouping type will be determined from
 *      field name.
 * @return {!anychart.data.TableMapping}
 */
anychart.data.Table.prototype.mapAs = function(opt_fields) {
  return new anychart.data.TableMapping(this, opt_fields);
};


/**
 * Registers a combination of aggregation type and source column and returns a number of column, where it will be placed.
 * If this combination was already registered - returns reused column index.
 * @param {number|string} sourceColumn
 * @param {string=} opt_aggregatorType
 * @param {(number|string)=} opt_weightsColumn
 * @return {number}
 */
anychart.data.Table.prototype.registerField = function(sourceColumn, opt_aggregatorType, opt_weightsColumn) {
  var type = anychart.enums.normalizeAggregationType(opt_aggregatorType);
  var hash = anychart.data.aggregators.getHash(type, sourceColumn, opt_weightsColumn);
  var result;
  if (hash in this.columnsMap_) {
    result = this.columnsMap_[hash];
  } else {
    var aggregator = anychart.data.aggregators.create(type, sourceColumn, opt_weightsColumn);
    this.columnsMap_[hash] = result = this.aggregators_.length;
    this.aggregators_.push(aggregator);
    this.setAggregatesDirty(anychart.data.TableAggregatedStorage.DirtyState.COLUMNS_COUNT, false);
  }
  return result;
};


/**
 * Returns requested aggregate over the table storage.
 * @param {anychart.core.utils.IIntervalGenerator=} opt_interval
 * @return {!anychart.data.TableStorage}
 */
anychart.data.Table.prototype.getStorage = function(opt_interval) {
  if (opt_interval) {
    var intervalHash = opt_interval.getHash();
    /** @type {!anychart.data.TableAggregatedStorage} */
    var result;
    if (intervalHash in this.aggregates_) {
      result = this.aggregates_[intervalHash];
    } else {
      result = new anychart.data.TableAggregatedStorage(this, opt_interval);
      this.aggregates_[intervalHash] = result;
    }
    result.update();
    return result;
  } else {
    return this.storage_;
  }
};


/**
 * Tells all table aggregates that they are dirty.
 * @param {number} dirtyState
 * @param {boolean} mainInvalidated
 */
anychart.data.Table.prototype.setAggregatesDirty = function(dirtyState, mainInvalidated) {
  var doDispatch = mainInvalidated;
  for (var hash in this.aggregates_)
    doDispatch = this.aggregates_[hash].setDirty(dirtyState) || doDispatch;
  if (doDispatch) {
    anychart.globalLock.lock();
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
    anychart.globalLock.unlock();
  }
};


/**
 * Returns table aggregators list. Used in TableAggregatesStorage.update() method.
 * @return {!Array.<!anychart.data.aggregators.Base>}
 */
anychart.data.Table.prototype.getAggregators = function() {
  return this.aggregators_;
};


/** @inheritDoc */
anychart.data.Table.prototype.disposeInternal = function() {
  delete this.storage_;
  delete this.aggregators_;
  delete this.aggregates_;

  goog.base(this, 'disposeInternal');
};


/**
 * Data table constructor function. Key column index defaults to zero column.
 * @param {number=} opt_keyColumnIndex Index of the column in which table index is located.
 * @return {!anychart.data.Table}
 */
anychart.data.table = function(opt_keyColumnIndex) {
  return new anychart.data.Table(opt_keyColumnIndex);
};


//anychart.data.Table.prototype['startTransaction'] = anychart.data.Table.prototype.startTransaction;
//anychart.data.Table.prototype['rollback'] = anychart.data.Table.prototype.rollback;
//anychart.data.Table.prototype['commit'] = anychart.data.Table.prototype.commit;

//exports
goog.exportSymbol('anychart.data.table', anychart.data.table);
anychart.data.Table.prototype['addData'] = anychart.data.Table.prototype.addData;
anychart.data.Table.prototype['remove'] = anychart.data.Table.prototype.remove;
anychart.data.Table.prototype['removeFirst'] = anychart.data.Table.prototype.removeFirst;
anychart.data.Table.prototype['mapAs'] = anychart.data.Table.prototype.mapAs;
