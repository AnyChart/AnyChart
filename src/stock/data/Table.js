goog.provide('anychart.stockModule.data.Table');
goog.require('anychart.core.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.format');
goog.require('anychart.stockModule.IIntervalGenerator');
goog.require('anychart.stockModule.data.TableAggregatedStorage');
goog.require('anychart.stockModule.data.TableComputer');
goog.require('anychart.stockModule.data.TableMainStorage');
goog.require('anychart.stockModule.data.TableMapping');
goog.require('anychart.stockModule.data.aggregators');
goog.require('goog.array');



/**
 * Stock data table constructor.
 * @param {(number|string)=} opt_keyColumn The number of the data column that contains the indexing field.
 * @param {string=} opt_dateTimePattern Key column parsing pattern.
 * @param {number=} opt_timeOffset Shifts all input dates timeOffset hours forward. Defaults to zero.
 * @param {(number|Date)=} opt_baseDate Base date for the key column.
 * @param {(string|anychart.format.Locale)=} opt_locale
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.stockModule.data.Table = function(opt_keyColumn, opt_dateTimePattern, opt_timeOffset, opt_baseDate, opt_locale) {
  anychart.stockModule.data.Table.base(this, 'constructor');

  /**
   * Main table storage.
   * @type {!anychart.stockModule.data.TableMainStorage}
   * @private
   */
  this.storage_ = new anychart.stockModule.data.TableMainStorage(this, opt_keyColumn, opt_dateTimePattern,
      opt_timeOffset, opt_baseDate, opt_locale);

  /**
   * Storage aggregates cache. Each cache may need to be updated before use. See Table.AggregateDescriptor description
   * for more info about cache update. Hash key is an datetime interval ISO string.
   * @type {!Object.<string, !anychart.stockModule.data.TableAggregatedStorage>}
   * @private
   */
  this.aggregates_ = {};

  /**
   * Map of column indexes by column definition hash.
   * @type {!Object.<string, number>}
   * @private
   */
  this.columnsMap_ = {};

  /**
   * Map of computed column aliases.
   * @type {!Object.<string, number>}
   * @private
   */
  this.computedColumnsAliases_ = {};

  /**
   * Count of registered computed columns.
   * @type {number}
   * @private
   */
  this.computedColumnsCount_ = 0;

  /**
   * Array of computed column indexes that can be reused.
   * @type {!Array.<number>}
   * @private
   */
  this.reusableComputedColumns_ = [];

  /**
   * Aggregators by column.
   * @type {!Array.<!anychart.stockModule.data.aggregators.Base>}
   * @private
   */
  this.aggregators_ = [];

  /**
   * An array of registered computers.
   * @type {!Array.<!anychart.stockModule.data.TableComputer>}
   * @private
   */
  this.computers_ = [];

  /**
   * For each computer designates the right-most calculated column it writes to.
   * @type {Array}
   * @private
   */
  this.computerRightMostFields_ = [];
};
goog.inherits(anychart.stockModule.data.Table, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.stockModule.data.Table.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Makes the table to enter transaction mode.
 * @return {!anychart.stockModule.data.Table}
 */
anychart.stockModule.data.Table.prototype.startTransaction = function() {
  this.storage_.startTransaction();
  return this;
};


/**
 * Commits all changes to the storage.
 * @return {!anychart.stockModule.data.Table}
 */
anychart.stockModule.data.Table.prototype.commit = function() {
  this.storage_.commit();
  return this;
};


/**
 * Makes transaction rollback.
 * @return {!anychart.stockModule.data.Table}
 */
anychart.stockModule.data.Table.prototype.rollback = function() {
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
 * @return {!anychart.stockModule.data.Table} Returns itself for chaining.
 */
anychart.stockModule.data.Table.prototype.addData = function(rawData, opt_removeFromStart, opt_csvSettings) {
  this.storage_.addData(rawData, opt_removeFromStart, opt_csvSettings);
  return this;
};


/**
 * Removes all items between start and end keys.
 * @param {(number|string|Date|null)=} opt_start
 * @param {(number|string|Date|null)=} opt_end
 * @return {!anychart.stockModule.data.Table} Returns itself for chaining.
 */
anychart.stockModule.data.Table.prototype.remove = function(opt_start, opt_end) {
  // normalizeTimestamp(undefined) === NaN
  this.storage_.remove(anychart.utils.normalizeTimestamp(opt_start), anychart.utils.normalizeTimestamp(opt_end));
  return this;
};


/**
 * Removes first opt_count rows from the storage also considering appended but not yet committed rows.
 * @param {number=} opt_count Defaults to 1.
 * @return {!anychart.stockModule.data.Table} Returns itself for chaining.
 */
anychart.stockModule.data.Table.prototype.removeFirst = function(opt_count) {
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
 * @return {!anychart.stockModule.data.TableMapping}
 */
anychart.stockModule.data.Table.prototype.mapAs = function(opt_fields) {
  var res = new anychart.stockModule.data.TableMapping(this, opt_fields);
  // we register mapping, to dispose it on table disposing
  this.registerDisposable(res);
  return res;
};


/**
 * Creates new computer with given input fields.
 * @param {(anychart.stockModule.data.TableMapping|Object.<
 *    ({column:(number|string),type:anychart.enums.AggregationType,weights:(number|string)}|number|string)
 *    >)=} opt_mappingSettingsOrMapping Input mapping settings for the computer.
 * @return {?anychart.stockModule.data.TableComputer}
 */
anychart.stockModule.data.Table.prototype.createComputer = function(opt_mappingSettingsOrMapping) {
  var mapping;
  if (anychart.utils.instanceOf(opt_mappingSettingsOrMapping, anychart.stockModule.data.TableMapping)) {
    mapping = /** @type {anychart.stockModule.data.TableMapping} */(opt_mappingSettingsOrMapping);
    if (mapping.getTable() != this) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.TABLE_MAPPING_DIFFERENT_TABLE);
      return null;
    }
  } else {
    mapping = this.mapAs(opt_mappingSettingsOrMapping);
  }
  var res = new anychart.stockModule.data.TableComputer(mapping, this.computers_.length);
  this.computers_.push(res);
  this.computerRightMostFields_.push(-1); // means that no field is written by this computer
  return res;
};


/**
 * Deregisters passed computer.
 * @param {anychart.stockModule.data.TableComputer} computer
 */
anychart.stockModule.data.Table.prototype.deregisterComputer = function(computer) {
  var index = computer.getIndex();
  this.computers_.splice(index, 1);
  var i;
  for (i = index; i < this.computers_.length; i++)
    this.computers_[i].setIndex(i);
  this.computerRightMostFields_.splice(index, 1);
  var fields = computer.getOutputFields();
  if (fields.length) {
    goog.array.sort(this.reusableComputedColumns_);
    // todo(Anton Saukh): maybe do something here to avoid quadratic performance
    var itemsToRemove = [];
    var minField = Number.POSITIVE_INFINITY;
    for (i = 0; i < fields.length; i++) {
      var field = ~fields[i];
      minField = Math.min(minField, field);
      this.reusableComputedColumns_.push(field);
      for (var j in this.computedColumnsAliases_) {
        if (this.computedColumnsAliases_[j] == fields[i]) {
          itemsToRemove.push(j);
          break;
        }
      }
    }
    goog.array.sort(this.reusableComputedColumns_);

    for (i = this.reusableComputedColumns_.length; i-- && this.reusableComputedColumns_[i] == this.computedColumnsCount_ - 1;) {
      this.computedColumnsCount_--;
      this.reusableComputedColumns_.pop();
    }

    for (i = 0; i < itemsToRemove.length; i++)
      delete this.computedColumnsAliases_[itemsToRemove[i]];

    minField--;
    this.storage_.lastComputedColumn = Math.min(this.storage_.lastComputedColumn, minField);
    for (var hash in this.aggregates_)
      this.aggregates_[hash].lastComputedColumn = Math.min(this.aggregates_[hash].lastComputedColumn, minField);
  }
};


/**
 * Registers a combination of aggregation type and source column and returns a number of column, where it will be placed.
 * If this combination was already registered - returns reused column index.
 * @param {number|string} sourceColumn
 * @param {anychart.enums.AggregationType|anychart.stockModule.data.TableMapping.CustomFieldType} type
 * @param {(number|string|*)=} opt_context
 * @return {number}
 */
anychart.stockModule.data.Table.prototype.registerField = function(sourceColumn, type, opt_context) {
  var hash = anychart.stockModule.data.aggregators.getHash(type, sourceColumn, opt_context);
  var result;
  if (hash in this.columnsMap_) {
    result = this.columnsMap_[hash];
  } else {
    var aggregator = anychart.stockModule.data.aggregators.create(type, sourceColumn, opt_context);
    this.columnsMap_[hash] = result = this.aggregators_.length;
    this.aggregators_.push(aggregator);
    this.setAggregatesDirty(anychart.stockModule.data.TableAggregatedStorage.DirtyState.COLUMNS_COUNT, false);
  }
  return result;
};


/**
 * Returns computed column index by alias. If the alias doesn't exist - returns NaN.
 * @param {string} alias
 * @return {number}
 */
anychart.stockModule.data.Table.prototype.getComputedColumnIndexByAlias = function(alias) {
  return this.computedColumnsAliases_[alias] || NaN;
};


/**
 * Registers new computed column. An alias name for the column can be passed. The alias should be unique for the table.
 * Returns an index of the new column or NaN in case of errors. The index is a negative integer, starting from -1 and
 * growing downwards.
 * @param {anychart.stockModule.data.TableComputer} computer
 * @param {string=} opt_name
 * @return {number}
 */
anychart.stockModule.data.Table.prototype.registerComputedField = function(computer, opt_name) {
  if (computer.getTable() != this) return NaN;
  var nextIndex;
  var indexReused = this.reusableComputedColumns_.length;
  if (indexReused) {
    nextIndex = ~this.reusableComputedColumns_[0];
  } else {
    nextIndex = ~this.computedColumnsCount_;
  }
  if (goog.isString(opt_name)) {
    if (opt_name in this.computedColumnsAliases_) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.TABLE_FIELD_NAME_DUPLICATE, undefined, [opt_name]);
      return NaN;
    }
    this.computedColumnsAliases_[opt_name] = nextIndex;
  }
  this.computerRightMostFields_[computer.getIndex()] = Math.max(this.computerRightMostFields_[computer.getIndex()], ~nextIndex);
  if (indexReused)
    this.reusableComputedColumns_.shift();
  else
    this.computedColumnsCount_++;
  return nextIndex;
};


/**
 * Returns requested aggregate over the table storage.
 * @param {anychart.stockModule.IIntervalGenerator=} opt_interval
 * @return {!anychart.stockModule.data.TableStorage}
 */
anychart.stockModule.data.Table.prototype.getStorage = function(opt_interval) {
  /** @type {!anychart.stockModule.data.TableStorage} */
  var result;
  if (opt_interval) {
    var intervalHash = opt_interval.getHash();
    if (intervalHash in this.aggregates_) {
      result = this.aggregates_[intervalHash];
    } else {
      this.aggregates_[intervalHash] = result = new anychart.stockModule.data.TableAggregatedStorage(this, opt_interval);
    }
  } else {
    result = this.storage_;
  }
  result.update();
  return result;
};


/**
 * Tells all table aggregates that they are dirty.
 * @param {number} dirtyState
 * @param {boolean} mainInvalidated
 */
anychart.stockModule.data.Table.prototype.setAggregatesDirty = function(dirtyState, mainInvalidated) {
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
 * @return {!Array.<!anychart.stockModule.data.aggregators.Base>}
 */
anychart.stockModule.data.Table.prototype.getAggregators = function() {
  return this.aggregators_;
};


/**
 * Returns computers array.
 * @return {!Array.<!anychart.stockModule.data.TableComputer>}
 */
anychart.stockModule.data.Table.prototype.getComputers = function() {
  return this.computers_;
};


/**
 * Returns the number of computed columns.
 * @return {number}
 */
anychart.stockModule.data.Table.prototype.getComputedColumnsCount = function() {
  return this.computedColumnsCount_;
};


/**
 * Returns what it says.
 * @param {number} index
 * @return {number}
 */
anychart.stockModule.data.Table.prototype.getRightMostFieldByComputerIndex = function(index) {
  return this.computerRightMostFields_[index];
};


/**
 * Returns a DT pattern used to parse X values of the table.
 * @return {string}
 */
anychart.stockModule.data.Table.prototype.getDTPatten = function() {
  return this.storage_.getDTPattern() || 'yyyy-MM-ddTHH:mm:ss.SSS';
};


/** @inheritDoc */
anychart.stockModule.data.Table.prototype.disposeInternal = function() {
  this.suspendSignalsDispatching();
  delete this.storage_;
  goog.disposeAll(this.aggregators_, this.computers_);
  this.aggregators_.length = 0;
  this.aggregates_ = {};
  this.computers_.length = 0;
  this.resumeSignalsDispatching(false);

  anychart.stockModule.data.Table.base(this, 'disposeInternal');
};


/**
 * Data table constructor function. Key column index defaults to zero column.
 * @param {number=} opt_keyColumnIndex Index of the column in which table index is located.
 * @param {string=} opt_dateTimePattern Key column parsing pattern.
 * @param {number=} opt_timeOffset Shifts all input dates timeOffset hours forward. Defaults to zero.
 * @param {(number|Date)=} opt_baseDate Base date for the key column.
 * @param {(string|anychart.format.Locale)=} opt_locale
 * @return {!anychart.stockModule.data.Table}
 */
anychart.data.table = function(opt_keyColumnIndex, opt_dateTimePattern, opt_timeOffset, opt_baseDate, opt_locale) {
  return new anychart.stockModule.data.Table(opt_keyColumnIndex, opt_dateTimePattern, opt_timeOffset, opt_baseDate, opt_locale);
};


//proto['startTransaction'] = proto.startTransaction;
//proto['rollback'] = proto.rollback;
//proto['commit'] = proto.commit;

//exports
(function() {
  var proto = anychart.stockModule.data.Table.prototype;
  goog.exportSymbol('anychart.data.table', anychart.data.table);
  proto['addData'] = proto.addData;
  proto['remove'] = proto.remove;
  proto['removeFirst'] = proto.removeFirst;
  proto['mapAs'] = proto.mapAs;
  proto['createComputer'] = proto.createComputer;
})();
