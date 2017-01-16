goog.provide('anychart.core.stock.Controller');
goog.require('anychart.core.Base');
goog.require('anychart.core.stock.Grouping');
goog.require('anychart.core.stock.Registry');
goog.require('anychart.data.TableSelectable');



/**
 * Controller class.
 * @constructor
 * @implements {anychart.data.TableSelectable.IController}
 * @extends {anychart.core.Base}
 */
anychart.core.stock.Controller = function() {
  anychart.core.stock.Controller.base(this, 'constructor');

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
  this.scrollerSources_ = {};

  /**
   * Tables hash map by GUID.
   * @type {!Object.<!anychart.data.Table>}
   * @private
   */
  this.tables_ = {};

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
  this.currentScrollerRegistry_ = this.mainRegistry_;

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
    postLastIndex: NaN,
    minDistance: NaN
  };

  /**
   * Current selection object in terms of Registry selection for full range sources.
   * @type {!anychart.core.stock.Registry.Selection}
   * @private
   */
  this.currentScrollerSelection_ = {
    startKey: NaN,
    endKey: NaN,
    startIndex: NaN,
    endIndex: NaN,
    firstIndex: NaN,
    preFirstIndex: NaN,
    lastIndex: NaN,
    postLastIndex: NaN,
    minDistance: NaN
  };

  /**
   * First key of data.
   * @type {number}
   * @private
   */
  this.dataFirstKey_ = NaN;

  /**
   * Last key of data.
   * @type {number}
   * @private
   */
  this.dataLastKey_ = NaN;

  /**
   * First key with alignment.
   * @type {number}
   * @private
   */
  this.alignedFirstKey_ = NaN;

  /**
   * Last key with alignment.
   * @type {number}
   * @private
   */
  this.alignedLastKey_ = NaN;

  /**
   * Last pixel width considered by the controller.
   * @type {number}
   * @private
   */
  this.currentPixelWidth_ = NaN;
};
goog.inherits(anychart.core.stock.Controller, anychart.core.Base);


/**
 * Supported consistency state.
 * @type {number}
 */
anychart.core.stock.Controller.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.STOCK_DATA;


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
  var sourcesMap = allowSelection ? this.selectableSources_ : this.scrollerSources_;
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
    this.invalidate(anychart.ConsistencyState.STOCK_DATA, anychart.Signal.DATA_CHANGED);
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
    delete this.scrollerSources_[guid];
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
    this.invalidate(anychart.ConsistencyState.STOCK_DATA, anychart.Signal.DATA_CHANGED);
  }
  return this;
};


/**
 * Refreshes full data range boundaries.
 * @return {boolean} Returns true if the full range have changed.
 */
anychart.core.stock.Controller.prototype.refreshFullRange = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_DATA)) {
    this.updateMainRegistry();
    var range = this.mainRegistry_.getBoundariesInfo();
    if (this.alignedFirstKey_ != range[2] || this.alignedLastKey_ != range[3]) {
      this.dataFirstKey_ = range[0];
      this.dataLastKey_ = range[1];
      this.alignedFirstKey_ = range[2];
      this.alignedLastKey_ = range[3];
      return true;
    }
  }
  return false;
};


/**
 * Refreshes current selection after data or bounds update. Returns update status:
 *    0 - nothing changed;
 *    1 - data selection update;
 *    2 - scroller selection update;
 *    3 - both updated.
 * @param {number} newPixelWidth
 * @return {number}
 */
anychart.core.stock.Controller.prototype.refreshSelection = function(newPixelWidth) {
  this.refreshFullRange();
  var alignedFirst = this.getFirstKey();
  var alignedLast = this.getLastKey();

  // we check main registry change in this manner, because there can be attempts to update main registry before
  // selection refreshing.
  var mainRegistryUpdated = this.hasInvalidationState(anychart.ConsistencyState.STOCK_DATA);

  this.currentPixelWidth_ = newPixelWidth;

  var startKey = this.currentSelection_.startKey;
  if (isNaN(startKey) || (this.currentSelectionSticksLeft() && !isNaN(alignedFirst)))
    startKey = alignedFirst;
  var endKey = this.currentSelection_.endKey;
  if (isNaN(endKey) || (this.currentSelectionSticksRight() && !isNaN(alignedLast)))
    endKey = alignedLast;

  var result = 0;
  if (!isNaN(startKey)) {
    var selectionChanged = this.select_(
        startKey,
        endKey,
        this.grouping_,
        this.selectableSources_,
        this.currentRegistry_,
        this.currentSelection_,
        mainRegistryUpdated);
    if (selectionChanged) {
      this.currentRegistry_ = selectionChanged[0];
      this.currentSelection_ = selectionChanged[1];
      result += 1;
    }

    var scrollerSelectionChanged = this.select_(
        alignedFirst,
        alignedLast,
        this.scrollerGrouping_,
        this.scrollerSources_,
        this.currentScrollerRegistry_,
        this.currentScrollerSelection_,
        mainRegistryUpdated);
    if (scrollerSelectionChanged) {
      this.currentScrollerRegistry_ = scrollerSelectionChanged[0];
      this.currentScrollerSelection_ = scrollerSelectionChanged[1];
      result += 2;
    }
  }

  this.markConsistent(anychart.ConsistencyState.STOCK_DATA);
  return result;
};


/**
 * Selects a data range between two keys. Returns true, whether the new select updated anything.
 * @param {number} startKey
 * @param {number} endKey
 * @return {boolean}
 */
anychart.core.stock.Controller.prototype.select = function(startKey, endKey) {
  if (isNaN(startKey)) startKey = this.currentSelection_.startKey;
  if (isNaN(endKey)) endKey = this.currentSelection_.endKey;

  // this case can be only if there is no currentSelection, no data and no valid range passed by user yet.
  if (isNaN(startKey) || isNaN(endKey))
    return false;

  this.updateMainRegistry();
  var result = this.select_(
      startKey,
      endKey,
      this.grouping_,
      this.selectableSources_,
      this.currentRegistry_,
      this.currentSelection_,
      false);
  if (result) {
    this.currentRegistry_ = result[0];
    this.currentSelection_ = result[1];
  }
  return !!result;
};


/**
 * Common selection method. Returns null if nothing changed or an array of [newRegistry, newSelection].
 * @param {number} startKey Selection start.
 * @param {number} endKey Selection end.
 * @param {!anychart.core.stock.Grouping} grouping Grouping settings.
 * @param {!Object.<!anychart.data.TableSelectable>} sources Sources hash map.
 * @param {!anychart.core.stock.Registry} currentRegistry Current registry used for the selection.
 * @param {!anychart.core.stock.Registry.Selection} currentSelection Current selection object.
 * @param {boolean} mainRegistryUpdated If the main registry was updated (data changed).
 * @return {Array}
 * @private
 */
anychart.core.stock.Controller.prototype.select_ = function(startKey, endKey, grouping,
                                                            sources, currentRegistry,
                                                            currentSelection,
                                                            mainRegistryUpdated) {
  if (startKey > endKey) {
    var tmp = startKey;
    startKey = endKey;
    endKey = tmp;
  }

  // todo: improve this strategy
  if (endKey - startKey < 1) {
    if (endKey > this.getFirstKey())
      startKey = endKey - 1;
    else
      endKey = startKey + 1;
  }

  var selectionRangeChanged = startKey != currentSelection.startKey || endKey != currentSelection.endKey;

  // choosing interval
  var interval = grouping.chooseInterval(startKey, endKey, this.currentPixelWidth_, this.mainRegistry_);

  // choosing registry
  var registry;
  if (!interval) {
    registry = this.mainRegistry_;
  } else {
    var intervalHash = interval.getHash();
    if (intervalHash in this.registryMap_) {
      registry = this.registryMap_[intervalHash];
    } else {
      this.registryMap_[intervalHash] = registry = new anychart.core.stock.Registry();
    }
  }

  // updating registry
  var registryUpdated = (registry == this.mainRegistry_) ?
      mainRegistryUpdated :
      this.updateRegistrySources_(registry, interval);

  if (selectionRangeChanged || registry != currentRegistry || registryUpdated) {
    // initializing selection
    var hash;
    var selection = registry.getSelection(startKey, endKey);
    if (registry.isInSyncMode()) {
      for (hash in sources)
        sources[hash].selectFast(startKey, endKey, selection.preFirstIndex, selection.postLastIndex, interval);
    } else {
      for (hash in sources)
        sources[hash].selectInternal(startKey, endKey, interval);
    }
    return [registry, selection];
  }
  return null;
};


/**
 * Returns registry iterator if registry is not in sync mode. Internal method.
 * @param {boolean} scroller
 * @param {boolean=} opt_exportingData
 * @return {anychart.core.stock.Registry.Iterator}
 */
anychart.core.stock.Controller.prototype.getCoIterator = function(scroller, opt_exportingData) {
  var registry = scroller ? this.currentScrollerRegistry_ : this.currentRegistry_;
  if (registry.isInSyncMode())
    return null;
  var selection;
  if (opt_exportingData) {
    return registry.getIteratorFast(registry.getFirstIndex(), registry.getLastIndex());
  } else {
    selection = scroller ? this.currentScrollerSelection_ : this.currentSelection_;
    return registry.getIteratorFast(selection.firstIndex, selection.lastIndex);
  }
};


/**
 * Grouping settings object getter/setter.
 * @param {(boolean|Array.<string|anychart.core.stock.Grouping.Level>|Object)=} opt_value
 * @return {anychart.core.stock.Controller|anychart.core.stock.Grouping}
 */
anychart.core.stock.Controller.prototype.grouping = function(opt_value) {
  if (!this.grouping_) {
    this.grouping_ = new anychart.core.stock.Grouping();
    this.grouping_.listenSignals(this.groupingInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.grouping_.setup(opt_value);
    return this;
  }
  return this.grouping_;
};


/**
 * Scroller grouping settings object getter/setter.
 * @param {(boolean|Array.<string|anychart.core.stock.Grouping.Level>|Object)=} opt_value
 * @return {anychart.core.stock.Controller|anychart.core.stock.Grouping}
 */
anychart.core.stock.Controller.prototype.scrollerGrouping = function(opt_value) {
  if (!this.scrollerGrouping_) {
    this.scrollerGrouping_ = new anychart.core.stock.Grouping();
    this.scrollerGrouping_.listenSignals(this.groupingInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.scrollerGrouping_.setup(opt_value);
    return this;
  }
  return this.scrollerGrouping_;
};


/**
 * Grouping invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Controller.prototype.groupingInvalidated_ = function(e) {
  // no invalidation in this case, only dispatching
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
};


/**
 * Table invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Controller.prototype.tableInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.mainRegistry_.setDirty();
    var i;
    for (i in this.registryMap_) {
      this.registryMap_[i].setDirty();
    }
    for (i in this.selectableSources_) {
      this.selectableSources_[i].invalidateSelection();
    }
    this.invalidate(anychart.ConsistencyState.STOCK_DATA, anychart.Signal.DATA_CHANGED);
  }
};


/**
 * Updates registry sources by sources got from all tables with passed interval.
 * Returns true if the sources were updated.
 * @param {!anychart.core.stock.Registry} registry
 * @param {anychart.core.utils.IIntervalGenerator=} opt_interval
 * @return {boolean}
 * @private
 */
anychart.core.stock.Controller.prototype.updateRegistrySources_ = function(registry, opt_interval) {
  if (registry.isDirty()) {
    registry.resetSources();
    for (var hash in this.tables_) {
      registry.addSource(this.tables_[hash].getStorage(opt_interval));
    }
    registry.update();
    return true;
  }
  return false;
};


/**
 * Ensures that the controller has main registry up end running.
 * @return {boolean}
 */
anychart.core.stock.Controller.prototype.updateMainRegistry = function() {
  return this.updateRegistrySources_(this.mainRegistry_);
};


/**
 * Updates current range for scale.
 * @param {anychart.scales.StockScatterDateTime} scale
 * @param {boolean} forScroller
 */
anychart.core.stock.Controller.prototype.updateCurrentScaleRange = function(scale, forScroller) {
  var selection, interval;
  if (forScroller) {
    selection = this.currentScrollerSelection_;
    interval = this.scrollerGrouping().getCurrentDataInterval();
  } else {
    selection = this.currentSelection_;
    interval = this.grouping().getCurrentDataInterval();
  }
  scale.setCurrentRange(
      selection.startKey, selection.endKey,
      interval['unit'], interval['count']);
};


/**
 * Updates auto full range for scale.
 * @param {anychart.scales.StockScatterDateTime} scale
 */
anychart.core.stock.Controller.prototype.updateFullScaleRange = function(scale) {
  scale.setAutoFullRange(this.getFirstKey(), this.getLastKey(), this.dataFirstKey_, this.dataLastKey_);
};


//region Key to index and index to key methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Key to index and index to key methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getKeyByIndex = function(index) {
  this.updateMainRegistry();
  return this.currentRegistry_.getKeyByIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getIndexByKey = function(key) {
  this.updateMainRegistry();
  return this.currentRegistry_.getIndexByKey(key);
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getKeyByScrollerIndex = function(index) {
  this.updateMainRegistry();
  return this.currentScrollerRegistry_.getKeyByIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getScrollerIndexByKey = function(key) {
  this.updateMainRegistry();
  return this.currentScrollerRegistry_.getIndexByKey(key);
};


/**
 * Aligns passed timestamp to current registry points set.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Controller.prototype.alignHighlight = function(key) {
  return this.currentRegistry_.alignKey(key);
};
//endregion


//region Selection properties retrieval
//----------------------------------------------------------------------------------------------------------------------
//
//  Selection properties retrieval
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns the first key in the main registry.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstKey = function() {
  return this.alignedFirstKey_;
};


/**
 * Returns the last key in the main registry.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastKey = function() {
  return this.alignedLastKey_;
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
  this.updateRegistrySources_(this.currentRegistry_);
  return this.currentRegistry_.getKeyByIndex(this.currentSelection_.firstIndex);
};


/**
 * Returns last visible key.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastVisibleKey = function() {
  this.updateRegistrySources_(this.currentRegistry_);
  return this.currentRegistry_.getKeyByIndex(this.currentSelection_.lastIndex);
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
      !isNaN(this.currentSelection_.startKey);
};


/**
 * Returns true if current selection is at the right-most position.
 * @return {boolean}
 */
anychart.core.stock.Controller.prototype.currentSelectionSticksRight = function() {
  return isNaN(this.currentSelection_.postLastIndex) &&
      !isNaN(this.currentSelection_.startKey);
};


/**
 * Returns min keys distance for current selection.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getCurrentMinDistance = function() {
  return this.currentSelection_.minDistance;
};


/**
 * Returns min keys distance for current scroller selection.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getCurrentScrollerMinDistance = function() {
  return this.currentScrollerSelection_.minDistance;
};


/**
 * Returns first selected index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getFirstScrollerIndex = function() {
  return this.currentScrollerSelection_.startIndex;
};


/**
 * Returns last selected index.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getLastScrollerIndex = function() {
  return this.currentScrollerSelection_.endIndex;
};


/**
 * Returns total points count for current grouping level.
 * @return {number}
 */
anychart.core.stock.Controller.prototype.getGlobalPointsCountForCurrentGrouping = function() {
  return this.currentRegistry_.getKeysCount();
};
//endregion


/**
 * Creates and returns stock data controller.
 * @return {!anychart.core.stock.Controller}
 */
anychart.core.stock.controller = function() {
  return new anychart.core.stock.Controller();
};
