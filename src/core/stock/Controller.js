goog.provide('anychart.core.stock.Controller');
goog.require('anychart.core.Base');
goog.require('anychart.core.stock.Registry');
goog.require('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.core.utils.DateTimeIntervalsList');
goog.require('anychart.data.TableSelectable');



/**
 * Controller class.
 * @param {!Array.<!anychart.core.utils.DateTimeIntervalGenerator>=} opt_intervals
 * @constructor
 * @implements {anychart.data.TableSelectable.IController}
 * @extends {anychart.core.Base}
 */
anychart.core.stock.Controller = function(opt_intervals) {
  goog.base(this);

  /**
   * TableSelectable hash map by mapping GUID.
   * @type {!Object.<!anychart.data.TableSelectable>}
   * @private
   */
  this.sources_ = {};

  /**
   * TableSelectable hash map by mapping GUID.
   * @type {!Object.<!anychart.data.TableSelectable>}
   * @private
   */
  this.selectableSources_ = {};

  /**
   * TableSelectable hash map by mapping GUID.
   * @type {!Object.<!anychart.data.TableSelectable>}
   * @private
   */
  this.fullRangeSources_ = {};

  /**
   * Tables hash map by GUID.
   * @type {!Object.<!anychart.data.Table>}
   * @private
   */
  this.tables_ = {};

  /**
   * Aggregation intervals manager.
   * @type {!anychart.core.utils.DateTimeIntervalsList}
   * @private
   */
  this.intervals_ = new anychart.core.utils.DateTimeIntervalsList(opt_intervals || [
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 5),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 10),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 25),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 50),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 100),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 250),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MILLISECOND, 500),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.SECOND, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.SECOND, 5),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.SECOND, 10),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.SECOND, 20),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.SECOND, 30),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MINUTE, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MINUTE, 5),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MINUTE, 15),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MINUTE, 30),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.HOUR, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.HOUR, 2),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.HOUR, 6),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.HOUR, 12),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.DAY, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.WEEK, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MONTH, 1),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MONTH, 3),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.MONTH, 6),
    new anychart.core.utils.DateTimeIntervalGenerator(anychart.enums.Interval.YEAR, 1)
  ]);

  /**
   * Current aggregation interval.
   * @type {anychart.core.utils.DateTimeIntervalGenerator}
   * @private
   */
  this.currentInterval_ = null;

  /**
   * Points count for full range sources.
   * @type {number}
   * @private
   */
  this.fullRangePointsCount_ = 0;

  /**
   * Current full range selection start.
   * @type {number}
   * @private
   */
  this.fullRangeStart_ = NaN;

  /**
   * Current full range selection end.
   * @type {number}
   * @private
   */
  this.fullRangeEnd_ = NaN;

  /**
   * Current aggregation interval for full range sources.
   * @type {anychart.core.utils.DateTimeIntervalGenerator}
   * @private
   */
  this.fullRangeInterval_ = null;

  /**
   * Main registry (for non-aggregated data).
   * @type {!anychart.core.stock.Registry}
   * @private
   */
  this.mainRegistry_ = new anychart.core.stock.Registry();

  /**
   * Current registry reference.
   * @type {!anychart.core.stock.Registry}
   * @private
   */
  this.currentRegistry_ = this.mainRegistry_;

  /**
   * Current registry reference for full range sources.
   * @type {!anychart.core.stock.Registry}
   * @private
   */
  this.fullRangeRegistry_ = this.mainRegistry_;

  /**
   * Registries map by interval hash.
   * @type {!Object.<!anychart.core.stock.Registry>}
   * @private
   */
  this.registryMap_ = {};

  /**
   * Current selection object in terms of Registry selection.
   * @type {!anychart.core.stock.Registry.Selection}
   * @private
   */
  this.currentSelection_ = {
    startKey: NaN,
    endKey: NaN,
    startIndex: NaN,
    endIndex: NaN,
    firstIndex: NaN,
    preFirstIndex: NaN,
    lastIndex: NaN,
    postLastIndex: NaN
  };

  /**
   * Current selection object in terms of Registry selection for full range sources.
   * @type {!anychart.core.stock.Registry.Selection}
   * @private
   */
  this.fullRangeSelection_ = {
    startKey: NaN,
    endKey: NaN,
    startIndex: NaN,
    endIndex: NaN,
    firstIndex: NaN,
    preFirstIndex: NaN,
    lastIndex: NaN,
    postLastIndex: NaN
  };
};
goog.inherits(anychart.core.stock.Controller, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.stock.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Registers passed anychart.data.TableSelectable as a new source.
 * @param {!anychart.data.TableSelectable} selectable
 * @param {boolean} allowSelection If selection should be managed for this selectable.
 * @return {!anychart.core.stock.Controller}
 */
anychart.core.stock.Controller.prototype.registerSource = function(selectable, allowSelection) {
  var guid = goog.getUid(selectable).toFixed(0);
  var sourcesMap = allowSelection ? this.selectableSources_ : this.fullRangeSources_;
  if (!(guid in this.sources_) || !(guid in sourcesMap)) {
    this.sources_[guid] = selectable;
    sourcesMap[guid] = selectable;
    selectable.setController(this);
    var table = selectable.getMapping().getTable();
    guid = goog.getUid(table).toFixed(0);
    var tablesChanged = !(guid in this.tables_);
    if (tablesChanged) {
      this.tables_[guid] = table;
      table.listenSignals(this.tableInvalidated_, this);
    }
    this.mainRegistry_.setDirty();
    for (var hash in this.registryMap_) {
      this.registryMap_[hash].setDirty();
    }
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  }
  return this;
};


/**
 * Removes passed anychart.data.TableSelectable from registered sources.
 * @param {!anychart.data.TableSelectable} selectable
 * @return {!anychart.core.stock.Controller}
 */
anychart.core.stock.Controller.prototype.deregisterSource = function(selectable) {
  var guid = goog.getUid(selectable).toFixed(0);
  if (guid in this.sources_) {
    selectable.setController(null);
    delete this.sources_[guid];
    delete this.selectableSources_[guid];
    delete this.fullRangeSources_[guid];
    var newTables = {};
    for (guid in this.sources_) {
      var table = this.sources_[guid].getMapping().getTable();
      var tableGuid = goog.getUid(table).toFixed(0);
      if (!(tableGuid in newTables))
        newTables[tableGuid] = table;
    }
    var tablesChanged = false;
    for (guid in this.tables_) {
      if (!(guid in newTables)) {
        this.tables_[guid].unlistenSignals(this.tableInvalidated_, this);
        tablesChanged = true;
        break;
      }
    }
    this.tables_ = newTables;
    this.mainRegistry_.setDirty();
    for (var hash in this.registryMap_) {
      this.registryMap_[hash].setDirty();
    }
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  }
  return this;
};


/**
 * Selects a data range between two keys. Returns true, whether the new select updated anything.
 * @param {number} startKey
 * @param {number} endKey
 * @param {boolean=} opt_forceUpdate
 * @return {boolean}
 */
anychart.core.stock.Controller.prototype.select = function(startKey, endKey, opt_forceUpdate) {
  var res = this.ensureInit_();

  if (isNaN(startKey)) startKey = this.currentSelection_.startKey;
  if (isNaN(endKey)) endKey = this.currentSelection_.endKey;
  if (startKey > endKey) {
    var tmp = startKey;
    startKey = endKey;
    endKey = tmp;
  }
  // todo: improve this strategy
  if (endKey - startKey < 1) {
    if (endKey > this.mainRegistry_.getFirstKey())
      startKey = endKey - 1;
    else
      endKey = startKey + 1;
  }

  if (opt_forceUpdate ||
      startKey != this.currentSelection_.startKey ||
      endKey != this.currentSelection_.endKey ||
      this.currentRegistry_.isDirty()) {
    // choosing interval
    var interval = this.intervals_.chooseInterval(endKey - startKey);
    var keysRange = this.mainRegistry_.getLastKey() - this.mainRegistry_.getFirstKey(); // may be NaN
    var indexesRange = this.mainRegistry_.getLastIndex() - this.mainRegistry_.getFirstIndex(); // may be NaN
    var realInterval = interval;
    if (keysRange / indexesRange > interval.getRange())
      interval = null;

    // choosing registry
    if (this.currentInterval_ != realInterval) {
      this.currentInterval_ = realInterval;
      if (interval) {
        var intervalHash = interval.getHash();
        if (intervalHash in this.registryMap_) {
          this.currentRegistry_ = this.registryMap_[intervalHash];
        } else {
          this.registryMap_[intervalHash] = this.currentRegistry_ = new anychart.core.stock.Registry();
        }
      } else {
        this.currentRegistry_ = this.mainRegistry_;
      }
    }

    // updating registry
    var hash;
    if (opt_forceUpdate || this.currentRegistry_.isDirty()) {
      this.currentRegistry_.resetSources();
      for (hash in this.tables_) {
        this.currentRegistry_.addSource(this.tables_[hash].getStorage(interval));
      }
      this.currentRegistry_.update();
    }

    // initializing selection
    this.currentSelection_ = this.currentRegistry_.getSelection(startKey, endKey);
    if (this.currentRegistry_.isInSyncMode()) {
      for (hash in this.selectableSources_)
        this.selectableSources_[hash].selectFast(startKey, endKey, this.currentSelection_.firstIndex,
            this.currentSelection_.lastIndex, interval);
    } else {
      for (hash in this.selectableSources_)
        this.selectableSources_[hash].selectInternal(startKey, endKey, interval);
    }

    return true;
  } else {
    return res;
  }
};


/**
 * Refreshes selection for full range sources (scroller).
 * @param {number} pointsCount
 * @return {!anychart.core.stock.Controller}
 */
anychart.core.stock.Controller.prototype.refreshFullRangeSources = function(pointsCount) {
  var mainUpdated = this.ensureInit_();
  var startKey = this.mainRegistry_.getFirstKey();
  var endKey = this.mainRegistry_.getLastKey();

  if (!mainUpdated &&
      this.fullRangeSelection_.startKey == startKey &&
      this.fullRangeSelection_.endKey == endKey &&
      this.fullRangePointsCount_ == pointsCount &&
      !this.fullRangeRegistry_.isDirty()) {
    return this;
  }

  this.fullRangePointsCount_ = pointsCount;

  // choosing interval
  var keysRange = endKey - startKey; // may be NaN
  var indexesRange = this.mainRegistry_.getLastIndex() - this.mainRegistry_.getFirstIndex(); // may be NaN
  var interval = this.intervals_.chooseInterval(keysRange, pointsCount);
  var realInterval = interval;
  if (keysRange / indexesRange > interval.getRange())
    interval = null;

  // choosing registry
  if (this.fullRangeInterval_ != realInterval) {
    this.fullRangeInterval_ = realInterval;
    if (interval) {
      var intervalHash = interval.getHash();
      if (intervalHash in this.registryMap_) {
        this.fullRangeRegistry_ = this.registryMap_[intervalHash];
      } else {
        this.registryMap_[intervalHash] = this.fullRangeRegistry_ = new anychart.core.stock.Registry();
      }
    } else {
      this.fullRangeRegistry_ = this.mainRegistry_;
    }
  }

  // updating registry
  var hash;
  if (this.fullRangeRegistry_.isDirty()) {
    this.fullRangeRegistry_.resetSources();
    for (hash in this.tables_) {
      this.fullRangeRegistry_.addSource(this.tables_[hash].getStorage(interval));
    }
    this.fullRangeRegistry_.update();
  }

  // initializing selection
  this.fullRangeSelection_ = this.fullRangeRegistry_.getSelection(startKey, endKey);
  if (this.fullRangeRegistry_.isInSyncMode()) {
    for (hash in this.fullRangeSources_)
      this.fullRangeSources_[hash].selectFast(
          startKey,
          endKey,
          this.fullRangeSelection_.firstIndex,
          this.fullRangeSelection_.lastIndex,
          interval);
  } else {
    for (hash in this.fullRangeSources_)
      this.fullRangeSources_[hash].selectInternal(startKey, endKey, interval);
  }

  return this;
};


/**
 * Returns registry iterator if registry is not in sync mode. Internal method.
 * @param {boolean} fullRange
 * @return {anychart.core.stock.Registry.Iterator}
 */
anychart.core.stock.Controller.prototype.getCoIterator = function(fullRange) {
  var registry = fullRange ? this.fullRangeRegistry_ : this.currentRegistry_;
  var selection = fullRange ? this.fullRangeSelection_ : this.currentSelection_;
  return registry.isInSyncMode() ?
      null :
      registry.getIteratorFast(selection.firstIndex, selection.lastIndex);
};


/**
 * Table invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Controller.prototype.tableInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.mainRegistry_.setDirty();
    this.fullRangeRegistry_.setDirty();
    var i;
    for (i in this.registryMap_) {
      this.registryMap_[i].setDirty();
    }
    for (i in this.selectableSources_) {
      this.selectableSources_[i].invalidateSelection();
    }
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Ensures that the controller has main registry up end running.
 * @return {boolean}
 * @private
 */
anychart.core.stock.Controller.prototype.ensureInit_ = function() {
  if (this.mainRegistry_.isDirty()) {
    this.mainRegistry_.resetSources();
    for (var hash in this.tables_) {
      this.mainRegistry_.addSource(this.tables_[hash].getStorage());
    }
    this.mainRegistry_.update();
    return true;
  }
  return false;
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getKey = function(index) {
  this.ensureInit_();
  return this.currentRegistry_.getKey(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getIndex = function(key) {
  this.ensureInit_();
  return this.currentRegistry_.getIndex(key);
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFullRangeKey = function(index) {
  this.ensureInit_();
  return this.fullRangeRegistry_.getKey(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFullRangeIndex = function(key) {
  this.ensureInit_();
  return this.fullRangeRegistry_.getIndex(key);
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getMainRegistryKey = function(index) {
  this.ensureInit_();
  return this.mainRegistry_.getKey(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getMainRegistryIndex = function(key) {
  this.ensureInit_();
  return this.mainRegistry_.getIndex(key);
};


//region Selection properties retrieval
/**
 * Returns the first key in the main registry.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstKey = function() {
  this.ensureInit_();
  return this.mainRegistry_.getFirstKey();
};


/**
 * Returns the last key in the main registry.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastKey = function() {
  this.ensureInit_();
  return this.mainRegistry_.getLastKey();
};


/**
 * Returns the first index in the main registry.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstIndex = function() {
  this.ensureInit_();
  return this.mainRegistry_.getFirstIndex();
};


/**
 * Returns the last index in the main registry.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastIndex = function() {
  this.ensureInit_();
  return this.mainRegistry_.getLastIndex();
};


/**
 * Returns first selected key.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstSelectedKey = function() {
  return this.currentSelection_.startKey;
};


/**
 * Returns last selected key.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastSelectedKey = function() {
  return this.currentSelection_.endKey;
};


/**
 * Returns first selected index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstSelectedIndex = function() {
  return this.currentSelection_.startIndex;
};


/**
 * Returns last selected index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastSelectedIndex = function() {
  return this.currentSelection_.endIndex;
};


/**
 * Returns first visible key.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstVisibleKey = function() {
  this.ensureInit_();
  return this.currentRegistry_.getKey(this.currentSelection_.firstIndex);
};


/**
 * Returns last visible key.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastVisibleKey = function() {
  this.ensureInit_();
  return this.currentRegistry_.getKey(this.currentSelection_.lastIndex);
};


/**
 * Returns first visible index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstVisibleIndex = function() {
  return this.currentSelection_.firstIndex;
};


/**
 * Returns last visible index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastVisibleIndex = function() {
  return this.currentSelection_.lastIndex;
};


/**
 * Returns true if current selection is at the left-most position.
 * @return {boolean}
 */
anychart.core.stock.Controller.prototype.currentSelectionSticksLeft = function() {
  return isNaN(this.currentSelection_.preFirstIndex) &&
      // we need this check to avoid expanding current range to full range when the selectRange call was done
      // before any data was given to the chart
      (
          !isNaN(this.currentSelection_.firstIndex) ||
          !isNaN(this.currentSelection_.lastIndex) ||
          !isNaN(this.currentSelection_.preFirstIndex) ||
          !isNaN(this.currentSelection_.postLastIndex)
      );
};


/**
 * Returns true if current selection is at the right-most position.
 * @return {boolean}
 */
anychart.core.stock.Controller.prototype.currentSelectionSticksRight = function() {
  return isNaN(this.currentSelection_.postLastIndex) &&
      // we need this check to avoid expanding current range to full range when the selectRange call was done
      // before any data was given to the chart
      (
          !isNaN(this.currentSelection_.firstIndex) ||
          !isNaN(this.currentSelection_.lastIndex) ||
          !isNaN(this.currentSelection_.preFirstIndex) ||
          !isNaN(this.currentSelection_.postLastIndex)
      );
};


/**
 * Returns current grouping interval.
 * @return {anychart.enums.Interval}
 */
anychart.core.stock.Controller.prototype.getCurrentGroupingIntervalUnit = function() {
  return this.currentInterval_ ? this.currentInterval_.getUnit() : anychart.enums.Interval.MILLISECOND;
};


/**
 * Returns current grouping interval count.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getCurrentGroupingIntervalCount = function() {
  return this.currentInterval_ ? this.currentInterval_.getCount() : 1;
};


/**
 * Returns first selected index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstFullRangeIndex = function() {
  return this.fullRangeSelection_.startIndex;
};


/**
 * Returns last selected index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastFullRangeIndex = function() {
  return this.fullRangeSelection_.endIndex;
};


/**
 * Returns current grouping interval.
 * @return {anychart.enums.Interval}
 */
anychart.core.stock.Controller.prototype.getFullRangeGroupingIntervalUnit = function() {
  return this.fullRangeInterval_.getUnit();
};


/**
 * Returns current grouping interval count.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFullRangeGroupingIntervalCount = function() {
  return this.fullRangeInterval_.getCount();
};
//endregion


/**
 * Creates and returns stock data controller.
 * @param {!Array.<!anychart.core.utils.DateTimeIntervalGenerator>=} opt_intervals
 * @return {!anychart.core.stock.Controller}
 */
anychart.core.stock.controller = function(opt_intervals) {
  return new anychart.core.stock.Controller(opt_intervals);
};
