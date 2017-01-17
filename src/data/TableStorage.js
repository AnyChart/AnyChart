goog.provide('anychart.data.TableAggregatedStorage');
goog.provide('anychart.data.TableMainStorage');
goog.provide('anychart.data.TableStorage');

goog.require('anychart.core.reporting');
goog.require('anychart.data.TableRow');
goog.require('anychart.data.csv.Parser');
goog.require('anychart.data.csv.TableItemsProcessor');
goog.require('anychart.format');
goog.require('goog.array');



//region anychart.data.TableStorage
/**
 * Table storage representation.
 * @param {!anychart.data.Table} table Table reference.
 * @constructor
 */
anychart.data.TableStorage = function(table) {
  /**
   * Actual data storage.
   * @type {!Array.<!anychart.data.TableRow>}
   * @protected
   */
  this.storage = [];

  /**
   * Table reference.
   * @type {!anychart.data.Table}
   */
  this.table = table;

  /**
   * Selection objects cache array. Acts like a cycled buffer.
   * @type {Array.<!anychart.data.TableStorage.Selection>}
   * @private
   */
  this.selectionCache_ = [];

  /**
   * Points on an index in selectionCache_ where we should write.
   * @type {number}
   * @private
   */
  this.selectionCachePointer_ = 0;

  /**
   * Search rows cache array. Acts like a cycled buffer.
   * @type {Array.<!anychart.data.TableStorage.Search>}
   * @private
   */
  this.searchCache_ = [];

  /**
   * Points on an index in searchCache_ where we should write.
   * @type {number}
   * @private
   */
  this.searchCachePointer_ = 0;

  /**
   * Last column that was successfully computed.
   * @type {number}
   */
  this.lastComputedColumn = -1;

  /**
   * Cache of mins for full range selection.
   * @type {Object.<number>}
   * @private
   */
  this.fullRangeMinsCache_ = null;

  /**
   * Cache of maxs for full range selection.
   * @type {Object.<number>}
   * @private
   */
  this.fullRangeMaxsCache_ = null;

  /**
   * Cache of mins of calculated fields for full range selection.
   * @type {Array.<number>}
   * @private
   */
  this.fullRangeCalcMinsCache_ = null;

  /**
   * Cache of maxs of calculated fields for full range selection.
   * @type {Array.<number>}
   * @private
   */
  this.fullRangeCalcMaxsCache_ = null;
};


/**
 * Internal type to represent table selection range.
 * @typedef {{
 *   startKey: number,
 *   endKey: number,
 *   preFirstIndex: number,
 *   firstIndex: number,
 *   lastIndex: number,
 *   postLastIndex: number,
 *   preFirstRow: anychart.data.TableRow,
 *   firstRow: anychart.data.TableRow,
 *   lastRow: anychart.data.TableRow,
 *   postLastRow: anychart.data.TableRow,
 *   mins: !Object.<number>,
 *   maxs: !Object.<number>,
 *   calcMins: !Array.<number>,
 *   calcMaxs: !Array.<number>
 * }}
 */
anychart.data.TableStorage.Selection;


/**
 * Internal type to represent table search result.
 * @typedef {{
 *   key: number,
 *   mode: anychart.enums.TableSearchMode,
 *   index: number
 * }}
 */
anychart.data.TableStorage.Search;


/**
 * Selection cache size constant.
 * @type {number}
 */
anychart.data.TableStorage.SELECTION_CACHE_SIZE = 4;


/**
 * Search cache size constant.
 * @type {number}
 */
anychart.data.TableStorage.SEARCH_CACHE_SIZE = 2;


/**
 * Drops selection caches.
 * @protected
 */
anychart.data.TableStorage.prototype.dropCaches = function() {
  this.fullRangeMaxsCache_ = this.fullRangeMinsCache_ = null;
  this.fullRangeCalcMaxsCache_ = this.fullRangeCalcMinsCache_ = null;
  this.selectionCache_.length = 0;
  this.selectionCachePointer_ = 0;
  this.searchCache_.length = 0;
  this.searchCachePointer_ = 0;
};


/**
 * Updates calculated columns if needed.
 */
anychart.data.TableStorage.prototype.update = function() {
  var lastColumnToCompute = this.table.getComputedColumnsCount() - 1;
  if (this.lastComputedColumn < lastColumnToCompute) {
    if (!this.storage.length) { // no need to calc anything
      this.lastComputedColumn = lastColumnToCompute;
      return;
    }
    var computers = this.table.getComputers();
    var aggregated = this instanceof anychart.data.TableAggregatedStorage;
    for (var i = 0; i < computers.length; i++) {
      if (this.lastComputedColumn <= this.table.getRightMostFieldByComputerIndex(i)) { // if not - the computer is OK
        var computer = computers[i];
        computer.invokeStart();
        var index = 0;
        var row = this.storage[0];
        while (row) {
          if (!row.computedValues)
            row.computedValues = [];
          while (row.computedValues.length < lastColumnToCompute) // we want this array to be solid to increase performance
            row.computedValues.push(undefined);
          // this index we pass here can differ from the index on the chart
          // because the storage is not directly attached to a Controller that can resolve indexes
          computer.invokeCalculation(row, aggregated, index);
          row = row.next;
          index++;
        }
      }
    }
    this.lastComputedColumn = lastColumnToCompute;
    this.dropCaches();
  }
};


/**
 * Returns selection object for asked keys range.
 * @param {number} startKey
 * @param {number} endKey
 * @return {!anychart.data.TableStorage.Selection}
 */
anychart.data.TableStorage.prototype.select = function(startKey, endKey) {
  var preFirst, postLast, first, last;
  var storageLength = this.storage.length;
  if (storageLength) {
    first = isNaN(startKey) ? 0 : this.searchIndex(startKey, anychart.enums.TableSearchMode.EXACT_OR_NEXT);
    if (isNaN(first)) { // empty selection after all data
      preFirst = storageLength - 1;
      postLast = NaN;
    } else {
      last = isNaN(endKey) ? storageLength - 1 : this.searchIndex(endKey, anychart.enums.TableSearchMode.EXACT_OR_PREV);
      if (isNaN(last)) { // empty selection before all data
        preFirst = NaN;
        postLast = 0;
      } else if (first <= last) { // valid non-empty selection
        preFirst = first > 0 ? first - 1 : NaN;
        postLast = last < storageLength - 1 ? last + 1 : NaN;
      } else { // empty selection between two points
        preFirst = last;
        postLast = first;
      }
    }
  } else {
    preFirst = postLast = NaN;
  }
  return this.selectFast(startKey, endKey, preFirst, postLast);
};


/**
 * Returns selection object for asked keys range. Internal method - assumes that the user already knows the correct
 * storage index of asked keys - that allows to save one or two storage lookup passes.
 * @param {number} startKey
 * @param {number} endKey
 * @param {number} preFirstIndex
 * @param {number} postLastIndex
 * @return {!anychart.data.TableStorage.Selection}
 */
anychart.data.TableStorage.prototype.selectFast = function(startKey, endKey, preFirstIndex, postLastIndex) {
  var first, last, preFirst, postLast, i, selection, firstIndex, lastIndex;
  var storageLength = this.storage.length;
  // if there is nothing in the storage we do nothing
  if (storageLength) {
    // checking cache
    for (i = 0; i < this.selectionCache_.length; i++) {
      // we need this indexing to prioritize selection cache lookup (from the most recent to older ones)
      // assume we have a cache like [3, 4, 5, 0, 1, 2] (greater is more recent, MAX_CACHE_SIZE = 6)
      // than we have a pointer with value 3 (points to 0) and we want to lookup the cache from 5 to 0
      // than the proper cache index would be as follows:
      var cacheIndex = (this.selectionCachePointer_ - i - 1 + anychart.data.TableStorage.SELECTION_CACHE_SIZE) %
          anychart.data.TableStorage.SELECTION_CACHE_SIZE;
      selection = this.selectionCache_[cacheIndex];
      if (selection.startKey == startKey && selection.endKey == endKey) {
        return selection;
      }
    }

    // determining first and last indexes
    if (isNaN(preFirstIndex)) {
      if (isNaN(postLastIndex)) { // full range selection
        firstIndex = 0;
        lastIndex = storageLength - 1;
      } else if (!postLastIndex) { // whole selection is to the left of the data
        firstIndex = lastIndex = NaN;
      } else { // normal selection stuck to the left end of data
        firstIndex = 0;
        lastIndex = postLastIndex - 1;
      }
    } else if (isNaN(postLastIndex)) {
      if (preFirstIndex == storageLength - 1) { // whole selection is to the right of the data
        firstIndex = lastIndex = NaN;
      } else { // normal selection stuck to the right end of data
        firstIndex = preFirstIndex + 1;
        lastIndex = storageLength - 1;
      }
    } else if (postLastIndex - preFirstIndex == 1) { // whole selection between two valid points
      firstIndex = lastIndex = NaN;
    } else { // normal selection
      firstIndex = preFirstIndex + 1;
      lastIndex = postLastIndex - 1;
    }
    preFirst = this.storage[preFirstIndex] || null;
    first = this.storage[firstIndex] || null;
    last = this.storage[lastIndex] || null;
    postLast = this.storage[postLastIndex] || null;
  } else {
    first = last = preFirst = postLast = null;
    firstIndex = lastIndex = preFirstIndex = postLastIndex = NaN;
  }

  var fields = this.getKnownFields();
  var asArray = goog.isNumber(fields);
  var mins = {};
  var maxs = {};
  var calcMins = [];
  var calcMaxs = [];
  var field, val;
  if (preFirst || first || postLast) { // first and last can be null only in the same time, so no point to check last in addition
    var isFullRangeSelect = !preFirst && !postLast;
    // we have additional cache for full range selections
    if (isFullRangeSelect && this.fullRangeMinsCache_) { // caches should exist only all at once
      for (field in this.fullRangeMinsCache_) {
        mins[field] = this.fullRangeMinsCache_[field];
        maxs[field] = this.fullRangeMaxsCache_[field];
      }
      for (i = 0; i < this.fullRangeCalcMinsCache_.length; i++) {
        calcMins.push(this.fullRangeCalcMinsCache_[i]);
        calcMaxs.push(this.fullRangeCalcMaxsCache_[i]);
      }
    } else {
      if (asArray) {
        for (i = 0; i < fields; i++) {
          mins[i] = Number.POSITIVE_INFINITY;
          maxs[i] = Number.NEGATIVE_INFINITY;
        }
      } else {
        for (i in fields) {
          mins[i] = Number.POSITIVE_INFINITY;
          maxs[i] = Number.NEGATIVE_INFINITY;
        }
      }
      for (i = 0; i <= this.lastComputedColumn; i++) {
        calcMins.push(Number.POSITIVE_INFINITY);
        calcMaxs.push(Number.NEGATIVE_INFINITY);
      }
      var prev = null;
      /** @type {anychart.data.TableRow} */
      var curr = preFirst || first || postLast;
      var finalRow = postLast ? postLast.next : postLast;
      while (curr && curr != finalRow) {
        if (asArray) {
          var len = Math.min((/** @type {Array} */(curr.values)).length, fields);
          for (i = 0; i < len; i++) {
            val = anychart.utils.toNumber(curr.values[i]);
            if (val < mins[i]) // includes NaN checking
              mins[i] = val;
            if (val > maxs[i]) // includes NaN checking
              maxs[i] = val;
          }
        } else {
          for (i in fields) {
            val = anychart.utils.toNumber(curr.values[i]);
            if (val < mins[i]) // includes NaN checking
              mins[i] = val;
            if (val > maxs[i]) // includes NaN checking
              maxs[i] = val;
          }
        }
        for (i = 0; i <= this.lastComputedColumn; i++) { // if there are comp columns than row.computedValues is not null
          val = anychart.utils.toNumber(curr.computedValues[i]);
          if (val < calcMins[i])
            calcMins[i] = val;
          if (val > calcMaxs[i])
            calcMaxs[i] = val;
        }
        prev = curr;
        curr = curr.next;
      }
      if (asArray) {
        for (i = 0; i < fields; i++) {
          if (mins[i] == Number.POSITIVE_INFINITY)
            mins[i] = NaN;
          if (maxs[i] == Number.NEGATIVE_INFINITY)
            maxs[i] = NaN;
        }
      } else {
        for (i in fields) {
          if (mins[i] == Number.POSITIVE_INFINITY)
            mins[i] = NaN;
          if (maxs[i] == Number.NEGATIVE_INFINITY)
            maxs[i] = NaN;
        }
      }
      for (i = 0; i <= this.lastComputedColumn; i++) {
        if (calcMins[i] == Number.POSITIVE_INFINITY)
          calcMins[i] = NaN;
        if (calcMaxs[i] == Number.NEGATIVE_INFINITY)
          calcMaxs[i] = NaN;
      }
      // cache the results if it is a full range select
      if (isFullRangeSelect) {
        this.fullRangeMinsCache_ = {};
        this.fullRangeMaxsCache_ = {};
        goog.mixin(this.fullRangeMinsCache_, mins);
        goog.mixin(this.fullRangeMaxsCache_, maxs);
        this.fullRangeCalcMinsCache_ = goog.array.slice(calcMins, 0);
        this.fullRangeCalcMaxsCache_ = goog.array.slice(calcMaxs, 0);
      }
    }
  } else {
    if (asArray) {
      for (i = 0; i < fields; i++) {
        mins[i] = maxs[i] = NaN;
      }
    } else {
      for (i in fields) {
        mins[i] = maxs[i] = NaN;
      }
    }
    for (i = 0; i <= this.lastComputedColumn; i++) {
      calcMins[i] = calcMaxs[i] = NaN;
    }
  }

  selection = {
    startKey: startKey,
    endKey: endKey,
    preFirstIndex: preFirstIndex,
    firstIndex: firstIndex,
    lastIndex: lastIndex,
    postLastIndex: postLastIndex,
    preFirstRow: preFirst,
    firstRow: first,
    lastRow: last,
    postLastRow: postLast,
    mins: mins,
    maxs: maxs,
    calcMaxs: calcMaxs,
    calcMins: calcMins
  };
  if (storageLength) {
    this.selectionCache_[this.selectionCachePointer_] = selection;
    this.selectionCachePointer_ = (this.selectionCachePointer_ + 1) % anychart.data.TableStorage.SELECTION_CACHE_SIZE;
  }
  return selection;
};


/**
 * Returns all storage range as a selection.
 * @return {!anychart.data.TableStorage.Selection}
 */
anychart.data.TableStorage.prototype.selectAll = function() {
  var len = this.storage.length;
  if (len)
    return this.selectFast(this.storage[0].key, this.storage[len - 1].key, NaN, NaN);
  else
    return this.selectFast(NaN, NaN, NaN, NaN); // will return valid selection object
};


/**
 * Searches the table and returns found item or null.
 * @param {number} key
 * @param {anychart.enums.TableSearchMode=} opt_mode
 * @return {anychart.data.TableRow}
 */
anychart.data.TableStorage.prototype.search = function(key, opt_mode) {
  return this.getRow(this.searchIndex(key, opt_mode));
};


/**
 * Searches the table and returns found item index or NaN.
 * @param {number} key
 * @param {anychart.enums.TableSearchMode=} opt_mode
 * @return {number}
 */
anychart.data.TableStorage.prototype.searchIndex = function(key, opt_mode) {
  var mode = opt_mode || anychart.enums.TableSearchMode.EXACT;
  // checking cache
  for (var i = 0; i < this.searchCache_.length; i++) {
    // we need this indexing to prioritize selection cache lookup (from the most recent to older ones)
    // assume we have a cache like [3, 4, 5, 0, 1, 2] (greater is more recent, MAX_CACHE_SIZE = 6)
    // than we have a pointer with value 3 (points to 0) and we want to lookup the cache from 5 to 0
    // than the proper cache index would be as follows:
    var cacheIndex = (this.searchCachePointer_ - i - 1 + anychart.data.TableStorage.SEARCH_CACHE_SIZE) %
        anychart.data.TableStorage.SEARCH_CACHE_SIZE;
    var search = this.searchCache_[cacheIndex];
    if (search.key == key && search.mode == mode)
      return search.index;
  }

  var index = goog.array.binarySelect(this.storage, anychart.data.TableRow.searchEvaluator, key);
  if (index < 0) {
    index = ~index;
    if (mode == anychart.enums.TableSearchMode.EXACT_OR_NEXT)
      index = index < this.storage.length ? index : NaN;
    else if (mode == anychart.enums.TableSearchMode.EXACT_OR_PREV)
      index = index > 0 ? index - 1 : NaN;
    else if (mode == anychart.enums.TableSearchMode.NEAREST) {
      var length = this.storage.length;
      if (!index)
        return length ? 0 : NaN;
      else if (index < length) {
        var item = this.storage[index];
        return (key - item.prev.key < item.key - key) ? index - 1 : index;
      } else
        return length ? length - 1 : NaN;
    } else
      index = NaN;
  }

  this.searchCache_[this.searchCachePointer_] = {
    key: key,
    mode: mode,
    index: index
  };
  this.searchCachePointer_ = (this.searchCachePointer_ + 1) % anychart.data.TableStorage.SEARCH_CACHE_SIZE;
  return index;
};


/**
 * Returns known fields as an array of names or as the number of largest row. Used to determine min-max result config.
 * @return {number|!Object.<boolean>}
 */
anychart.data.TableStorage.prototype.getKnownFields = goog.abstractMethod;


/**
 * Returns table row by index.
 * @param {number} index
 * @return {anychart.data.TableRow}
 */
anychart.data.TableStorage.prototype.getRow = function(index) {
  return (0 <= index && index < this.storage.length) ? this.storage[index] : null;
};


/**
 * Returns storage length.
 * @return {number}
 */
anychart.data.TableStorage.prototype.getRowsCount = function() {
  return this.storage.length;
};


/**
 * Returns internal storage. Used internally.
 * @return {!Array.<!anychart.data.TableRow>}
 */
anychart.data.TableStorage.prototype.getStorageInternal = function() {
  return this.storage;
};
//endregion



//region anychart.data.TableAggregatedStorage
/**
 * Aggregated storage class.
 * @param {!anychart.data.Table} table Table reference.
 * @param {anychart.core.utils.IIntervalGenerator=} opt_interval
 * @constructor
 * @extends {anychart.data.TableStorage}
 */
anychart.data.TableAggregatedStorage = function(table, opt_interval) {
  anychart.data.TableAggregatedStorage.base(this, 'constructor', table);

  /**
   * Interval generator for the aggregate if any.
   * @type {anychart.core.utils.IIntervalGenerator}
   * @private
   */
  this.interval_ = opt_interval || null;

  /**
   * Dirty flags. Combination of anychart.data.TableAggregate.DirtyState elements.
   * @type {number}
   * @private
   */
  this.dirty_ = anychart.data.TableAggregatedStorage.DirtyState.TOTAL_MESS;

  /**
   * Number of columns.
   * @type {number}
   * @private
   */
  this.numColumns_ = 0;
};
goog.inherits(anychart.data.TableAggregatedStorage, anychart.data.TableStorage);


/**
 * Dirty flags enum.
 * @enum {number}
 */
anychart.data.TableAggregatedStorage.DirtyState = {
  ALL_OK: 0,
  RIGHT_APPENDS: 1,
  LEFT_REMOVES: 2,
  COLUMNS_COUNT: 4,
  TOTAL_MESS: 8
};


/** @inheritDoc */
anychart.data.TableAggregatedStorage.prototype.getKnownFields = function() {
  return this.numColumns_;
};


/**
 * Updates aggregate.
 */
anychart.data.TableAggregatedStorage.prototype.update = function() {
  if (this.dirty_ != anychart.data.TableAggregatedStorage.DirtyState.ALL_OK) {
    var tableStorage = this.table.getStorage().storage;
    var aggregators = this.table.getAggregators();
    if (this.dirty_ >= anychart.data.TableAggregatedStorage.DirtyState.TOTAL_MESS) {
      this.lastComputedColumn = -1;
      this.storage.length = 0;
      this.createAggregate_(tableStorage, aggregators, this.interval_, false);
    } else {
      if (!!(this.dirty_ & anychart.data.TableAggregatedStorage.DirtyState.LEFT_REMOVES)) { // removes
        this.lastComputedColumn = -1;
        this.aggregateRemoves_(tableStorage, aggregators);
      }
      if (!!(this.dirty_ & anychart.data.TableAggregatedStorage.DirtyState.RIGHT_APPENDS)) { // appends
        this.lastComputedColumn = -1;
        this.aggregateAppends_(tableStorage, aggregators, this.interval_);
      }
      if (!!(this.dirty_ & anychart.data.TableAggregatedStorage.DirtyState.COLUMNS_COUNT)) { // columns count
        this.aggregateNewColumns_(tableStorage, aggregators);
      }
    }
    this.dirty_ = anychart.data.TableAggregatedStorage.DirtyState.ALL_OK;
    this.numColumns_ = aggregators.length;
    this.dropCaches();
  }
  anychart.data.TableAggregatedStorage.base(this, 'update');
};


/**
 * Adds dirtiness to the aggregate.
 * @param {number} value
 * @return {boolean} If the dirty state was set effectively.
 */
anychart.data.TableAggregatedStorage.prototype.setDirty = function(value) {
  if ((this.dirty_ | value) != this.dirty_) {
    this.dirty_ |= value;
    return true;
  }
  return false;
};


/**
 * Fixes passed storage so it doesn't contain items removed from the beginning of the main storage any more.
 * @param {!Array.<!anychart.data.TableRow>} tableStorage
 * @param {!Array.<!anychart.data.aggregators.Base>} aggregators
 * @private
 */
anychart.data.TableAggregatedStorage.prototype.aggregateRemoves_ = function(tableStorage, aggregators) {
  var firstStorageItem = tableStorage.length ? tableStorage[0] : null;
  if (!firstStorageItem) {
    this.storage.length = 0;
    return;
  }
  var prev = this.storage.length ? this.storage[0] : null;
  var firstStorageKey = firstStorageItem.key;
  if (!prev || prev.key >= firstStorageKey) // we cache all cases of storage emptiness here and storage correctness
    return;

  var removeCount = 0;
  var firstValid;
  while ((firstValid = prev.next) && firstValid.key < firstStorageKey) {
    removeCount++;
    prev = firstValid;
  }
  if (firstValid && firstValid.key == firstStorageKey) {
    removeCount++;
  } else {
    var i;
    var item = firstStorageItem;
    while (item && (!firstValid || item.key < firstValid.key)) {
      for (i = 0; i < this.numColumns_; i++) {
        var aggregator = aggregators[i];
        aggregator.process(item.values[aggregator.valuesColumn], item.values[aggregator.weightsColumn], item.values);
      }
      item = item.next;
    }
    for (i = 0; i < this.numColumns_; i++) {
      prev.values[i] = aggregators[i].getValueAndClear();
    }
  }
  if (removeCount > 0) {
    goog.array.splice(this.storage, 0, removeCount);
    if (this.storage.length)
      this.storage[0].prev = null;
  }
};


/**
 * Adds points to the end of the storage.
 * @param {!Array.<!anychart.data.TableRow>} tableStorage
 * @param {!Array.<!anychart.data.aggregators.Base>} aggregators
 * @param {anychart.core.utils.IIntervalGenerator} interval
 * @private
 */
anychart.data.TableAggregatedStorage.prototype.aggregateAppends_ = function(tableStorage, aggregators, interval) {
  var lastItem = this.storage[this.storage.length - 1];
  var lastKey;
  if (lastItem) { // we should remove the last item in case it should be updated.
    this.storage.pop();
    if (lastItem.prev)
      lastItem.prev.next = null;
    lastKey = lastItem.key;
  } else {
    lastKey = undefined;
  }
  this.createAggregate_(tableStorage, aggregators, interval, true, lastKey);
};


/**
 * Adds columns to passed storage.
 * @param {!Array.<!anychart.data.TableRow>} tableStorage
 * @param {!Array.<!anychart.data.aggregators.Base>} aggregators Table aggregators.
 * @private
 */
anychart.data.TableAggregatedStorage.prototype.aggregateNewColumns_ = function(tableStorage, aggregators) {
  var currentInMain = tableStorage[0];
  var current = this.storage[0];
  if (!currentInMain || !current) return;

  var first = this.numColumns_;
  var last = aggregators.length - 1;
  var i;
  do {
    var next = current.next;
    while (currentInMain && (!next || currentInMain.key < next.key)) {
      for (i = first; i <= last; i++) {
        var aggregator = aggregators[i];
        aggregator.process(currentInMain.values[aggregator.valuesColumn],
            currentInMain.values[aggregator.weightsColumn], currentInMain.values);
      }
      currentInMain = currentInMain.next;
    }
    var row = current.values;
    for (i = first; i <= last; i++) {
      row[i] = aggregators[i].getValueAndClear();
    }
    current = next;
  } while (currentInMain);
};


/**
 * Creates aggregated data array by the interval generator.
 * @param {!Array.<!anychart.data.TableRow>} tableStorage Source table storage.
 * @param {!Array.<!anychart.data.aggregators.Base>} aggregators Table aggregators.
 * @param {anychart.core.utils.IIntervalGenerator} interval Interval generator.
 * @param {boolean} onlyExistingColumns Use only aggregators that are to the left of this.numColumns_.
 * @param {number=} opt_startKey The first storage key to start from.
 * @private
 */
anychart.data.TableAggregatedStorage.prototype.createAggregate_ = function(tableStorage, aggregators, interval,
    onlyExistingColumns, opt_startKey) {
  var aggregatorsLength = onlyExistingColumns ? this.numColumns_ : aggregators.length;
  var i, currentInStorage, aggregator, row, item;
  if (goog.isDef(opt_startKey)) {
    var index = goog.array.binarySelect(tableStorage, anychart.data.TableRow.searchEvaluator, opt_startKey);
    currentInStorage = tableStorage[index >= 0 ? index : ~index];
  } else {
    currentInStorage = tableStorage[0];
  }

  if (!currentInStorage) return;

  var prev = this.storage[this.storage.length - 1] || null;

  if (interval) {
    interval.setStart(currentInStorage.key);
    var key = interval.next();

    do {
      var nextKey = interval.next();
      var hasPoints = false;
      while (currentInStorage && (isNaN(nextKey) || currentInStorage.key < nextKey)) {
        hasPoints = true;
        for (i = 0; i < aggregatorsLength; i++) {
          aggregator = aggregators[i];
          aggregator.process(currentInStorage.values[aggregator.valuesColumn],
              currentInStorage.values[aggregator.weightsColumn], currentInStorage.values);
        }
        currentInStorage = currentInStorage.next;
      }
      if (hasPoints) {
        row = new Array(aggregatorsLength);
        for (i = 0; i < aggregatorsLength; i++) {
          row[i] = aggregators[i].getValueAndClear();
        }
        item = new anychart.data.TableRow(key, row);
        if (prev) prev.next = item;
        item.prev = prev;
        this.storage.push(item);
        prev = item;
      }
      key = nextKey;
    } while (currentInStorage);
  } else {
    do {
      for (i = 0; i < aggregatorsLength; i++) {
        aggregator = aggregators[i];
        aggregator.process(currentInStorage.values[aggregator.valuesColumn],
            currentInStorage.values[aggregator.weightsColumn], currentInStorage.values);
      }
      row = new Array(aggregatorsLength);
      for (i = 0; i < aggregatorsLength; i++) {
        row[i] = aggregators[i].getValueAndClear();
      }
      item = new anychart.data.TableRow(currentInStorage.key, row);
      if (prev) prev.next = item;
      item.prev = prev;
      this.storage.push(item);
      prev = item;
      currentInStorage = currentInStorage.next;
    } while (currentInStorage);
  }
};
//endregion



//region anychart.data.TableMainStorage
/**
 * Main table storage class.
 * @param {!anychart.data.Table} table Table reference.
 * @param {(number|string)=} opt_keyColumn Key column index.
 * @param {?string=} opt_dateTimePattern Key column parsing pattern. Null means default behaviour, undefined - default pattern.
 * @param {number=} opt_timeOffset Shifts all input dates timeOffset hours forward. Defaults to zero.
 * @param {?(number|Date)=} opt_baseDate Base date for the key column.
 * @param {?(string|anychart.format.Locale)=} opt_locale Locale for the key column parsing.
 * @constructor
 * @extends {anychart.data.TableStorage}
 */
anychart.data.TableMainStorage = function(table, opt_keyColumn, opt_dateTimePattern, opt_timeOffset, opt_baseDate, opt_locale) {
  anychart.data.TableMainStorage.base(this, 'constructor', table);

  /**
   * Storage to hold appended items that are not committed to the main storage yet.
   * @type {!Array.<!anychart.data.TableRow>}
   * @private
   */
  this.appendsStorage_ = [];

  /**
   * Stores current pushing function for appends storage. Depending on the function stored we can determine
   * appendsStorage_ sorting state. All function except pushAssorted_ replace items with duplicate keys.
   * Can contain one of:
   * - pushFirst_ - zero items in storage. Switches to pushAsc_ after push.
   * - pushAsc_ - one or more items in storage, sorted ASC. If passed item breaks sorting - switches to one of the next two functions.
   * - pushDesc_ - two or more items in storage, sorted DESC. If passed item breaks sorting - switches to pushAssorted_.
   * - pushAssorted_ - three or more items in storage, no sorting.
   * @type {function(this: anychart.data.TableMainStorage, !anychart.data.TableRow)}
   * @private
   */
  this.pusher_ = this.pushFirst_;

  /**
   * If the main storage contains removed items.
   * 0 - doesn't contain.
   * 1 - contains only at the beginning.
   * 2 - contains not only at the beginning.
   * @type {number}
   * @private
   */
  this.removesStatus_ = 0;

  /**
   * If the table is in transaction now.
   * @type {boolean}
   * @private
   */
  this.inTransaction_ = false;

  /**
   * The number of the column that contains indexing field.
   * @type {(number|string)}
   * @private
   */
  this.keyColumn_ = goog.isString(opt_keyColumn) ?
      opt_keyColumn :
      anychart.utils.normalizeToNaturalNumber(opt_keyColumn, 0, true);

  /**
   * Key column parsing pattern.
   * @type {string|null|undefined}
   * @private
   */
  this.dtPattern_ = opt_dateTimePattern;

  /**
   * Offset for all parsed dates.
   * @type {number}
   * @private
   */
  this.timeOffset_ = anychart.utils.toNumber(opt_timeOffset) || 0;

  /**
   * Base date for the key column.
   * @type {number}
   * @private
   */
  this.baseDate_ = goog.isDateLike(opt_baseDate) ?
      opt_baseDate.getTime() :
      anychart.utils.toNumber(opt_baseDate);

  /**
   * Key column parsing locale.
   * @type {?(string|anychart.format.Locale)}
   * @private
   */
  this.locale_ = opt_locale || null;

  /**
   * Known source columns number. Used to determine how much columns we know about.
   * If it is 0, than we probably have seen no arrays in data.
   * @type {number}
   * @private
   */
  this.largestSeenRowLength_ = 0;

  /**
   * Known source fields seen. Used to determine how much columns we know about.
   * @type {?Object.<boolean>}
   * @private
   */
  this.objectFieldsSeen_ = null;
};
goog.inherits(anychart.data.TableMainStorage, anychart.data.TableStorage);


/**
 * Makes the table to enter transaction mode.
 * @return {!anychart.data.TableMainStorage}
 */
anychart.data.TableMainStorage.prototype.startTransaction = function() {
  if (this.inTransaction_)
    anychart.core.reporting.warning(anychart.enums.WarningCode.TABLE_ALREADY_IN_TRANSACTION);
  this.inTransaction_ = true;
  return this;
};


/**
 * Commits all changes to the storage.
 * @return {!anychart.data.TableMainStorage}
 */
anychart.data.TableMainStorage.prototype.commit = function() {
  this.inTransaction_ = false;
  if (this.appendsStorage_.length || this.removesStatus_) {
    var appendsAsc = this.normalizeAppendsDirection_();
    var appendsLength = this.appendsStorage_.length;
    var storageLength = this.storage.length;
    var first = this.appendsStorage_[appendsAsc ? 0 : (appendsLength - 1)];
    var appendsAreToTheRight = !appendsLength || !storageLength ||
        anychart.data.TableRow.comparator(/** @type {!anychart.data.TableRow} */(first),
            this.storage[storageLength - 1]) > 0;
    var item, iterator;
    var aggregatorsDirty = 0;
    if (appendsAreToTheRight && this.removesStatus_ < 2) {
      if (appendsAreToTheRight) aggregatorsDirty |= anychart.data.TableAggregatedStorage.DirtyState.RIGHT_APPENDS;
      if (this.removesStatus_) { // == 1
        aggregatorsDirty |= anychart.data.TableAggregatedStorage.DirtyState.LEFT_REMOVES;
        iterator = new anychart.data.TableMainStorage.MergingIterator(this.storage, null, true);
        var removeCount = 0;
        item = iterator.next();
        while (item && item.isRemoved) {
          removeCount++;
          item = iterator.next();
        }
        goog.array.splice(this.storage, 0, removeCount);
        item = this.storage[0];
        if (item) item.prev = null;
      }
      this.fillStorage_(new anychart.data.TableMainStorage.MergingIterator(null, this.appendsStorage_, appendsAsc));
    } else {
      iterator = new anychart.data.TableMainStorage.MergingIterator(this.storage, this.appendsStorage_, appendsAsc);
      this.storage = [];
      this.fillStorage_(iterator);
      aggregatorsDirty = anychart.data.TableAggregatedStorage.DirtyState.TOTAL_MESS;
    }
    this.appendsStorage_.length = 0;
    this.pusher_ = this.pushFirst_;
    this.lastComputedColumn = -1;
    this.removesStatus_ = 0;
    this.dropCaches();
    // settings aggregates dirty flag
    this.table.setAggregatesDirty(aggregatorsDirty, true);
  }
  return this;
};


/**
 * Makes transaction rollback.
 * @return {!anychart.data.TableMainStorage}
 */
anychart.data.TableMainStorage.prototype.rollback = function() {
  if (this.inTransaction_)
    this.inTransaction_ = false;
  this.appendsStorage_.length = 0;
  this.pusher_ = this.pushFirst_;
  if (this.removesStatus_ > 0) {
    var iterator = new anychart.data.TableMainStorage.MergingIterator(this.storage, this.appendsStorage_, true);
    var item;
    while ((item = iterator.next()) && (this.removesStatus_ == 2 || item.isRemoved)) {
      item.isRemoved = false;
    }
    this.removesStatus_ = 0;
  }
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
 * @return {!anychart.data.TableMainStorage} Returns itself for chaining.
 */
anychart.data.TableMainStorage.prototype.addData = function(rawData, opt_removeFromStart, opt_csvSettings) {
  var autoTransaction = !this.inTransaction_;
  if (autoTransaction) this.startTransaction();

  if (goog.isString(rawData)) {
    var processor = new anychart.data.csv.TableItemsProcessor(this);
    var parser = new anychart.data.csv.Parser();
    if (goog.isObject(opt_csvSettings)) {
      parser.rowsSeparator(/** @type {string|undefined} */(opt_csvSettings['rowsSeparator'])); // if it is undefined, it will not be set.
      parser.columnsSeparator(/** @type {string|undefined} */(opt_csvSettings['columnsSeparator'])); // if it is undefined, it will not be set.
      parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_csvSettings['ignoreTrailingSpaces'])); // if it is undefined, it will not be set.
      parser.ignoreFirstRow(/** @type {boolean|undefined} */(opt_csvSettings['ignoreFirstRow'])); // if it is undefined, it will not be set.
    }
    parser.parse(rawData, processor);
    if (opt_removeFromStart === true) opt_removeFromStart = processor.getCount();
  } else if (goog.isArray(rawData)) {
    var count = 0;
    for (var i = 0; i < rawData.length; i++) {
      if (this.addInternal(rawData[i]))
        count++;
    }
    if (opt_removeFromStart === true) opt_removeFromStart = count;
  }

  // if it is true, we already made it number for valid cases
  opt_removeFromStart = anychart.utils.toNumber(opt_removeFromStart);
  if (!isNaN(opt_removeFromStart))
    this.removeFirst(opt_removeFromStart);

  if (autoTransaction)
    this.commit();
  return this;
};


/**
 * Removes all items between start and end keys.
 * @param {number=} opt_startKey
 * @param {number=} opt_endKey
 * @return {!anychart.data.TableMainStorage} Returns itself for chaining.
 */
anychart.data.TableMainStorage.prototype.remove = function(opt_startKey, opt_endKey) {
  var iterator = new anychart.data.TableMainStorage.MergingIterator(this.storage, this.appendsStorage_,
      this.normalizeAppendsDirection_(), opt_startKey, opt_endKey);
  var item;
  while (item = iterator.next()) {
    item.isRemoved = true;
  }

  this.removesStatus_ = 2;

  if (!this.inTransaction_)
    this.commit();

  return this;
};


/**
 * Removes first opt_count rows from the storage also considering appended but not yet committed rows.
 * @param {number=} opt_count Defaults to 1.
 * @return {!anychart.data.TableMainStorage} Returns itself for chaining.
 */
anychart.data.TableMainStorage.prototype.removeFirst = function(opt_count) {
  opt_count = anychart.utils.normalizeToNaturalNumber(opt_count);

  var iterator = new anychart.data.TableMainStorage.MergingIterator(this.storage, this.appendsStorage_, this.normalizeAppendsDirection_());
  var prevKey = NaN;
  var item;
  while ((item = iterator.next()) && opt_count > 0) {
    if (!item.isRemoved) {
      if (item.key != prevKey)
        opt_count--;
      item.isRemoved = true;
      prevKey = item.key;
    }
  }

  if (!this.removesStatus_) this.removesStatus_ = 1;

  if (!this.inTransaction_)
    this.commit();

  return this;
};


/** @inheritDoc */
anychart.data.TableMainStorage.prototype.getKnownFields = function() {
  return this.objectFieldsSeen_ || this.largestSeenRowLength_;
};


/**
 * Internal method to add one row of data. If key field cannot be read and parsed - does nothing.
 * Copies passed array.
 * @param {*} row Array or Object expected.
 * @return {boolean}
 */
anychart.data.TableMainStorage.prototype.addInternal = function(row) {
  var tmp;
  if (goog.isArray(row)) {
    row = goog.array.slice(row, 0);
  } else if (goog.isObject(row)) {
    tmp = row;
    row = {};
    for (var i in tmp) {
      row[i] = tmp[i];
    }
  } else {
    row = null;
  }
  var key = anychart.format.parseDateTime(
      row[this.keyColumn_],
      this.dtPattern_,
      isNaN(this.baseDate_) ? null : new Date(this.baseDate_),
      this.locale_);
  var res = !!(row && key);
  if (res) {
    if (this.timeOffset_)
      key.setTime(key.getTime() + this.timeOffset_ * 60 * 60 * 1000);
    this.pusher_(new anychart.data.TableRow(key.getTime(), /** @type {!(Object|Array)} */(row)));
  }
  return res;
};


/**
 * Returns true, if appends storage is sorted ASC and false if it is sorted DESC. If appends storage is assorted -
 * sorts them ASC and returns true.
 * @return {boolean}
 * @private
 */
anychart.data.TableMainStorage.prototype.normalizeAppendsDirection_ = function() {
  if (this.pusher_ == this.pushAssorted_) {
    this.appendsStorage_.sort(anychart.data.TableRow.comparator);
    this.pusher_ = this.pushAsc_;
  }
  return this.pusher_ != this.pushDesc_;
};


/**
 * Appends items from iterator to the storage. It fixes all prev and next links.
 * @param {anychart.data.TableMainStorage.MergingIterator} iterator
 * @private
 */
anychart.data.TableMainStorage.prototype.fillStorage_ = function(iterator) {
  var lastIndex = this.storage.length - 1;
  var lastItem, lastKey;
  if (lastIndex >= 0) {
    lastItem = this.storage[lastIndex];
    lastKey = lastItem.key;
  } else {
    lastItem = null;
    lastKey = NaN;
  }
  var item;
  while (item = iterator.next()) {
    if (!item.isRemoved) {
      if (item.key == lastKey) {
        this.storage[lastIndex] = item;
        // we assume that lastItem exist here, because we have non NaN key of this item
        item.prev = lastItem.prev;
      } else {
        this.storage.push(item);
        item.prev = lastItem;
        lastKey = item.key;
        lastIndex++;
      }
      if (item.prev) item.prev.next = item;
      lastItem = item;
      var i;
      if (goog.isArray(item.values)) {
        var valuesLength = item.values.length;
        if (this.largestSeenRowLength_ < valuesLength) {
          if (this.objectFieldsSeen_) {
            // if we have seen objects, than we have converted the largestSeenRowLength_ representation to the fields
            // map already and now we should add fields to that representation
            for (i = this.largestSeenRowLength_; i < valuesLength; i++) {
              this.objectFieldsSeen_[i] = true;
            }
          }
          this.largestSeenRowLength_ = valuesLength;
        }
      } else { // we are sure that this is object in this case so we can avoid double checking
        if (!this.objectFieldsSeen_) {
          this.objectFieldsSeen_ = {};
          for (i = 0; i < this.largestSeenRowLength_; i++) {
            this.objectFieldsSeen_[i] = true;
          }
        }
        for (i in item.values) {
          this.objectFieldsSeen_[i] = true;
        }
      }
    }
  }
  if (lastItem) lastItem.next = null;
};


/**
 * Pushes the first item to appendsStorage_ and changes current pusher to pushAsc_.
 * @param {!anychart.data.TableRow} item
 * @private
 */
anychart.data.TableMainStorage.prototype.pushFirst_ = function(item) {
  this.appendsStorage_.push(item);
  this.pusher_ = this.pushAsc_;
};


/**
 * Pushes the item to appendsStorage_. Assumes that the appendsStorage_ is ASC-sorted and contains at least 1 item.
 * If the passed item been added to the end of the storage breaks the sorting - changes current pusher to
 * pushDesc_ or pushAssorted_ depending on the current length of the appendsStorage_.  Also checks if the passed
 * item key is equal to the last key in the storage - replaces the stored item in this case.
 * @param {!anychart.data.TableRow} item
 * @private
 */
anychart.data.TableMainStorage.prototype.pushAsc_ = function(item) {
  var len = this.appendsStorage_.length;
  var last = this.appendsStorage_[len - 1];
  // sorted ifs by frequency - wondering if the compiler would keep them
  if (last.key < item.key) {
    this.appendsStorage_.push(item);
  } else if (last.key > item.key) {
    if (len == 1) {
      this.pusher_ = this.pushDesc_;
    } else {
      this.pusher_ = this.pushAssorted_;
    }
    this.appendsStorage_.push(item);
  } else {
    this.appendsStorage_[len - 1] = item;
  }
};


/**
 * Pushes the item to appendsStorage_. Assumes that the appendsStorage_ is DESC-sorted and contains at least 2 items.
 * If the passed item been added to the end of the storage breaks the sorting - changes current pusher to
 * pushAssorted_. Also checks if the passed item key is equal to the last key in the storage - replaces the stored
 * item in this case.
 * @param {!anychart.data.TableRow} item
 * @private
 */
anychart.data.TableMainStorage.prototype.pushDesc_ = function(item) {
  var len = this.appendsStorage_.length;
  var last = this.appendsStorage_[len - 1];
  // sorted ifs by frequency - wondering if the compiler would keep them
  if (last.key > item.key) {
    this.appendsStorage_.push(item);
  } else if (last.key < item.key) {
    this.pusher_ = this.pushAssorted_;
    this.appendsStorage_.push(item);
  } else if (last.key == item.key) {
    this.appendsStorage_[len - 1] = item;
  }
};


/**
 * Pushed the item to appendsStorage_ as is.
 * @param {!anychart.data.TableRow} item
 * @private
 */
anychart.data.TableMainStorage.prototype.pushAssorted_ = function(item) {
  this.appendsStorage_.push(item);
};
//endregion



//region anychart.data.TableMainStorage.MergingIterator
/**
 *
 * @param {Array.<!anychart.data.TableRow>} storage
 * @param {Array.<!anychart.data.TableRow>} appendsStorage
 * @param {boolean=} opt_iterateAppendsAsc If the appends storage should be iterated in ASC order, not DESC.
 * @param {number=} opt_from Starting key to iterate over. Defaults to first item in both arrays.
 * @param {number=} opt_to Last key to iterate over. Defaults to last item in both arrays.
 * @constructor
 */
anychart.data.TableMainStorage.MergingIterator = function(storage, appendsStorage, opt_iterateAppendsAsc, opt_from, opt_to) {
  /**
   * Main storage of the table.
   * @type {!Array.<!anychart.data.TableRow>}
   * @private
   */
  this.storage_ = storage || []; // less code costs us one array

  /**
   * Appends storage of the table.
   * @type {!Array.<!anychart.data.TableRow>}
   * @private
   */
  this.appends_ = appendsStorage || []; // less code costs us one array

  opt_from = anychart.utils.toNumber(opt_from);
  opt_to = anychart.utils.toNumber(opt_to);

  if (isNaN(opt_to)) {
    this.next = this.nonCheckingNext_;
  } else {
    this.next = this.checkingNext_;
    this.lastKey_ = opt_to;
  }

  var index = isNaN(opt_from) ? 0 : goog.array.binarySelect(this.storage_, anychart.data.TableRow.searchEvaluator, opt_from);
  this.storageCurrent_ = this.storage_[index < 0 ? ~index : index];

  if (opt_iterateAppendsAsc) {
    this.next_ = this.nextAsc_;
    this.appendsIndex_ = isNaN(opt_from) ? 0 :
        goog.array.binarySelect(this.appends_, anychart.data.TableRow.searchEvaluator, opt_from);
    if (this.appendsIndex_ < 0) this.appendsIndex_ = ~this.appendsIndex_;
  } else {
    this.next_ = this.nextDesc_;
    this.appendsIndex_ = isNaN(opt_from) ? this.appends_.length - 1 :
        goog.array.binarySelect(this.appends_, anychart.data.TableRow.reversedSearchEvaluator, opt_from);
    if (this.appendsIndex_ < 0) this.appendsIndex_ = ~this.appendsIndex_ - 1;
  }
};


/**
 * Current item from storage.
 * @type {anychart.data.TableRow|undefined}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.storageCurrent_;


/**
 * Current index in appends.
 * @type {number}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.appendsIndex_;


/**
 * Last key to iterate over.
 * @type {number}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.lastKey_;


/**
 * Function that returns the next element in the sequence. If no elements left - returns null.
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.next;


/**
 * Internal iterator next function. Used by next().
 * @type {function(this:anychart.data.TableMainStorage.MergingIterator):anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.next_;


/**
 * The final state - no iteration.
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nextNull_ = function() {
  return null;
};


/**
 * Returns next item in merge between storage and appends arrays, iterating appends in straight order.
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nextAsc_ = function() {
  var storageItem = this.storageCurrent_;
  var appendsItem = this.appends_[this.appendsIndex_];
  if (storageItem) {
    if (appendsItem) {
      var comparison = anychart.data.TableRow.comparator(storageItem, appendsItem);
      if (comparison < 0) {
        this.storageCurrent_ = this.storageCurrent_.next;
        return storageItem;
      } else {
        this.appendsIndex_++;
        return appendsItem;
      }
    } else {
      this.storageCurrent_ = this.storageCurrent_.next;
      this.next_ = this.nextStorageOnly_;
      return storageItem;
    }
  } else {
    if (appendsItem) {
      this.appendsIndex_++;
      this.next_ = this.nextAppendsAsc_;
      return appendsItem;
    } else {
      this.next = this.nextNull_;
      return null;
    }
  }
};


/**
 * Returns next item in merge between storage and appends arrays, iterating appends in reversed order.
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nextDesc_ = function() {
  var storageItem = this.storageCurrent_;
  var appendsItem = this.appends_[this.appendsIndex_];
  if (storageItem) {
    if (appendsItem) {
      var comparison = anychart.data.TableRow.comparator(storageItem, appendsItem);
      if (comparison < 0) {
        this.storageCurrent_ = this.storageCurrent_.next;
        return storageItem;
      } else {
        this.appendsIndex_--;
        return appendsItem;
      }
    } else {
      this.storageCurrent_ = this.storageCurrent_.next;
      this.next_ = this.nextStorageOnly_;
      return storageItem;
    }
  } else {
    if (appendsItem) {
      this.appendsIndex_--;
      this.next_ = this.nextAppendsDesc_;
      return appendsItem;
    } else {
      this.next = this.nextNull_;
      return null;
    }
  }
};


/**
 * Returns next item in storage array (assumes that appends array finished iterating).
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nextStorageOnly_ = function() {
  var item = this.storageCurrent_;
  if (item) {
    this.storageCurrent_ = this.storageCurrent_.next;
    return item;
  } else {
    this.next = this.nextNull_;
    return null;
  }
};


/**
 * Returns next item in appends array in straight order (assumes that storage array finished iterating).
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nextAppendsAsc_ = function() {
  var item = this.appends_[this.appendsIndex_++];
  if (item) {
    return item;
  } else {
    this.next = this.nextNull_;
    return null;
  }
};


/**
 * Returns next item in appends array in reversed order (assumes that storage array finished iterating).
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nextAppendsDesc_ = function() {
  var item = this.appends_[this.appendsIndex_--];
  if (item) {
    return item;
  } else {
    this.next = this.nextNull_;
    return null;
  }
};


/**
 * Iterator.next() function that checks if the returning item key is less than this.lastKey_.
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.checkingNext_ = function() {
  var item = this.next_();
  if (goog.isNull(item) || item.key > this.lastKey_) {
    this.next = this.nextNull_;
    return null;
  }
  return item;
};


/**
 * Iterator.next() function that doesn't check anything.
 * @return {anychart.data.TableRow}
 * @private
 */
anychart.data.TableMainStorage.MergingIterator.prototype.nonCheckingNext_ = function() {
  return this.next_();
};
//endregion

