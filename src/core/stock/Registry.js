goog.provide('anychart.core.stock.Registry');
goog.require('anychart.data.TableIterator');



/**
 * Stock index <-> key registry.
 * @constructor
 */
anychart.core.stock.Registry = function() {
  /**
   * Sources list.
   * @type {!Array.<!anychart.data.TableStorage>}
   * @private
   */
  this.sources_ = [];

  /**
   * Dirty flag.
   * @type {boolean}
   * @private
   */
  this.dirty_ = true;

  /**
   * Keys array. May contain some first source storage if that storage is the only storage this registry contain.
   * @type {!Array.<!(anychart.data.TableRow|anychart.core.stock.Registry.Item)>}
   * @private
   */
  this.keys_ = [];

  /**
   * If true - registry and all sources are totally synchronous, so you can optimise storages iteration.
   * @type {boolean}
   * @private
   */
  this.syncMode_ = true;

  /**
   * Search rows cache array. Acts like a cycled buffer.
   * @type {Array.<!anychart.core.stock.Registry.Search>}
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
   * Selection objects cache array. Acts like a cycled buffer.
   * @type {Array.<!anychart.core.stock.Registry.Selection>}
   * @private
   */
  this.selectionCache_ = [];

  /**
   * Points on an index in selectionCache_ where we should write.
   * @type {number}
   * @private
   */
  this.selectionCachePointer_ = 0;
};


/**
 * Registry item. Next item reference is for super-fast fixed-time access.
 * @typedef {?{
 *   key: number,
 *   next: anychart.core.stock.Registry.Item
 * }}
 */
anychart.core.stock.Registry.Item;


/**
 * Internal type to represent table selection range.
 * Fields start* and end* are selected values, others are selection results (data-dependant).
 * @typedef {{
 *   startKey: number,
 *   endKey: number,
 *   startIndex: number,
 *   endIndex: number,
 *   firstIndex: number,
 *   preFirstIndex: number,
 *   lastIndex: number,
 *   postLastIndex: number,
 *   minDistance: number
 * }}
 */
anychart.core.stock.Registry.Selection;


/**
 * Internal type to represent table search result.
 * @typedef {{
 *   key: number,
 *   index: number
 * }}
 */
anychart.core.stock.Registry.Search;


/**
 * Selection cache size constant.
 * @type {number}
 */
anychart.core.stock.Registry.SELECTION_CACHE_SIZE = 4;


/**
 * Search cache size constant.
 * @type {number}
 */
anychart.core.stock.Registry.SEARCH_CACHE_SIZE = 2;


/**
 * If true - registry and all sources are totally synchronous, so storages iteration can be optimized.
 * @return {boolean}
 */
anychart.core.stock.Registry.prototype.isInSyncMode = function() {
  return this.syncMode_;
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getKeyByIndex = function(index) {
  var len = this.keys_.length;
  var result;
  if (len >= 2 && !isNaN(index)) { // also filters NaNs
    // checking cache
    for (var i = 0; i < this.searchCache_.length; i++) {
      // we need this indexing to prioritize selection cache lookup (from the most recent to older ones)
      // assume we have a cache like [3, 4, 5, 0, 1, 2] (greater is more recent, MAX_CACHE_SIZE = 6)
      // than we have a pointer with value 3 (points to 0) and we want to lookup the cache from 5 to 0
      // than the proper cache index would be as follows:
      var cacheIndex = (this.searchCachePointer_ - i - 1 + anychart.core.stock.Registry.SEARCH_CACHE_SIZE) %
          anychart.core.stock.Registry.SEARCH_CACHE_SIZE;
      var search = this.searchCache_[cacheIndex];
      if (search.index == index)
        return search.key;
    }

    var low = Math.floor(index);
    var high = Math.ceil(index);
    var lowKey, highKey;
    if (high <= 0) {
      low = 0;
      high = low + 1;
    } else if (low >= len - 1) {
      high = len - 1;
      low = high - 1;
    }
    if (low == high) {
      result = this.keys_[low].key;
    } else {
      // inter/extrapolating
      lowKey = this.keys_[low].key;
      highKey = this.keys_[low + 1].key;
      result = Math.round((highKey - lowKey) * (index - low) + lowKey);
    }

    this.searchCache_[this.searchCachePointer_] = {
      key: result,
      index: index
    };
    this.searchCachePointer_ = (this.searchCachePointer_ + 1) % anychart.core.stock.Registry.SEARCH_CACHE_SIZE;
  } else if (len == 1) {
    lowKey = this.keys_[0].key;
    result = Math.round(index + lowKey);
  } else {
    result = NaN;
  }
  return result;
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getIndexByKey = function(key) {
  var result;
  var len = this.keys_.length;
  if (len >= 2 && !isNaN(key)) { // also filters NaNs
    // checking cache
    for (var i = 0; i < this.searchCache_.length; i++) {
      // we need this indexing to prioritize selection cache lookup (from the most recent to older ones)
      // assume we have a cache like [3, 4, 5, 0, 1, 2] (greater is more recent, MAX_CACHE_SIZE = 6)
      // than we have a pointer with value 3 (points to 0) and we want to lookup the cache from 5 to 0
      // than the proper cache index would be as follows:
      var cacheIndex = (this.searchCachePointer_ - i - 1 + anychart.core.stock.Registry.SEARCH_CACHE_SIZE) %
          anychart.core.stock.Registry.SEARCH_CACHE_SIZE;
      var search = this.searchCache_[cacheIndex];
      if (search.key == key)
        return search.index;
    }

    var index = goog.array.binarySelect(this.keys_, anychart.data.TableRow.searchEvaluator, key);
    if (index < 0) {
      var low = ~index - 1;
      var lowKey, highKey;
      if (low < 0) {
        low = 0;
      } else if (low >= len - 1) {
        low = len - 2;
      }
      // inter/extrapolating
      lowKey = this.keys_[low].key;
      highKey = this.keys_[low + 1].key;
      result = (key - lowKey) / (highKey - lowKey) + low;
    } else {
      result = index;
    }

    this.searchCache_[this.searchCachePointer_] = {
      key: key,
      index: result
    };
    this.searchCachePointer_ = (this.searchCachePointer_ + 1) % anychart.core.stock.Registry.SEARCH_CACHE_SIZE;
  } else if (len == 1) {
    lowKey = this.keys_[0].key;
    result = key - lowKey;
  } else {
    result = NaN;
  }
  return result;
};


/**
 * Aligns passed key to a point grid.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Registry.prototype.alignKey = function(key) {
  if (this.keys_.length) {
    return this.keys_.length > 1 ? this.getKeyByIndex(
        goog.math.clamp(
            Math.round(this.getIndexByKey(key)),
            0,
            this.keys_.length - 1)) : this.keys_[0].key;
  }
  return NaN;
};


/**
 * Creates and returns registry iterator for the passed range.
 * @param {number} firstKey
 * @param {number} lastKey
 * @return {!anychart.core.stock.Registry.Iterator}
 */
anychart.core.stock.Registry.prototype.getIterator = function(firstKey, lastKey) {
  return this.getIteratorFast(this.getIndexByKey(firstKey), this.getIndexByKey(lastKey));
};


/**
 * Creates and returns registry iterator for the passed range.
 * @param {number} firstIndex
 * @param {number} lastIndex
 * @return {!anychart.core.stock.Registry.Iterator}
 */
anychart.core.stock.Registry.prototype.getIteratorFast = function(firstIndex, lastIndex) {
  var index = Math.max(0, Math.floor(lastIndex));
  var lastItem = this.keys_.length > index ? this.keys_[index] : null;
  index = Math.max(0, Math.ceil(firstIndex));
  var firstItem = this.keys_.length > index ? this.keys_[index] : null;
  return new anychart.core.stock.Registry.Iterator(index, firstItem, lastItem);
};


/**
 * Returns the first key in the registry.
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getFirstKey = function() {
  return this.keys_.length ? this.keys_[0].key : NaN;
};


/**
 * Returns the last key in the registry.
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getLastKey = function() {
  return this.keys_.length ? this.keys_[this.keys_.length - 1].key : NaN;
};


/**
 * Returns the first index in the registry.
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getFirstIndex = function() {
  return this.keys_.length ? 0 : NaN;
};


/**
 * Returns the last index in the registry.
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getLastIndex = function() {
  return this.keys_.length ? this.keys_.length - 1 : NaN;
};


/**
 * Tells current registry to recount on next update.
 */
anychart.core.stock.Registry.prototype.setDirty = function() {
  this.dirty_ = true;
};


/**
 * If the current registry is dirty.
 * @return {boolean}
 */
anychart.core.stock.Registry.prototype.isDirty = function() {
  return this.dirty_;
};


/**
 * Resets source array for the registry.
 */
anychart.core.stock.Registry.prototype.resetSources = function() {
  this.sources_.length = 0;
  this.dirty_ = true;
};


/**
 * Adds source to the registry.
 * @param {!anychart.data.TableStorage} table
 */
anychart.core.stock.Registry.prototype.addSource = function(table) {
  this.sources_.push(table);
};


/**
 * Returns registry selection info object.
 * @param {number} startKey
 * @param {number} endKey
 * @return {anychart.core.stock.Registry.Selection}
 */
anychart.core.stock.Registry.prototype.getSelection = function(startKey, endKey) {
  var first, last, preFirst, postLast, startIndex, endIndex, selection, minDistance, i;
  var keysLength = this.keys_.length;
  if (keysLength) {
    // checking cache
    for (i = 0; i < this.selectionCache_.length; i++) {
      // we need this indexing to prioritize selection cache lookup (from the most recent to older ones)
      // assume we have a cache like [3, 4, 5, 0, 1, 2] (greater is more recent, MAX_CACHE_SIZE = 6)
      // than we have a pointer with value 3 (points to 0) and we want to lookup the cache from 5 to 0
      // than the proper cache index would be as follows:
      var cacheIndex = (this.selectionCachePointer_ - i - 1 + anychart.core.stock.Registry.SELECTION_CACHE_SIZE) %
          anychart.core.stock.Registry.SELECTION_CACHE_SIZE;
      selection = this.selectionCache_[cacheIndex];
      if (selection.startKey == startKey && selection.endKey == endKey)
        return selection;
    }

    startIndex = this.getIndexByKey(startKey);
    endIndex = this.getIndexByKey(endKey);
    first = Math.max(0, Math.ceil(startIndex));
    // searching the storage for the appropriate rows
    if (isNaN(first) || first >= keysLength) {
      // this means that we tried to select keys greater than there are in the storage
      preFirst = keysLength - 1;
      first = last = postLast = minDistance = NaN;
    } else {
      last = Math.min(Math.floor(endIndex), keysLength - 1);
      if (isNaN(last) || last < 0) {
        // this means that we tried to select keys less than there are in the storage
        // and, thereby first should be now the first row in the storage (index 0)
        postLast = 0;
        first = last = preFirst = minDistance = NaN;
      } else if (first <= last) {
        preFirst = first > 0 ? first - 1 : NaN;
        postLast = last < keysLength - 1 ? last + 1 : NaN;
        minDistance = Infinity;
        var tmpFirst = isNaN(preFirst) ? first : preFirst;
        var tmpLast = isNaN(postLast) ? last : postLast;
        var curr = this.keys_[tmpFirst];
        for (i = tmpFirst; i < tmpLast; i++) {
          var prev = curr;
          curr = prev.next;
          minDistance = Math.min(minDistance, curr.key - prev.key);
        }
        if (!isFinite(minDistance))
          minDistance = NaN;
      } else { // that means the whole selection is between two points
        preFirst = last;
        postLast = first;
        first = last = NaN;
        var tmp = this.keys_[preFirst];
        minDistance = tmp.next.key - tmp.key;
      }
    }
  } else {
    first = last = preFirst = postLast = startIndex = endIndex = minDistance = NaN;
  }

  selection = {
    startKey: startKey,
    endKey: endKey,
    startIndex: startIndex,
    endIndex: endIndex,
    firstIndex: first,
    preFirstIndex: preFirst,
    lastIndex: last,
    postLastIndex: postLast,
    minDistance: minDistance
  };
  if (keysLength) {
    this.selectionCache_[this.selectionCachePointer_] = selection;
    this.selectionCachePointer_ = (this.selectionCachePointer_ + 1) % anychart.core.stock.Registry.SELECTION_CACHE_SIZE;
  }
  return selection;
};


/**
 * Returns registry bounds info.
 * @return {Array.<number>} Info as follows: [firstKey, lastKey, alignedFirstKey, alignedLastKey].
 */
anychart.core.stock.Registry.prototype.getBoundariesInfo = function() {
  var len = this.keys_.length;
  var start;
  var result;
  if (len) {
    start = this.keys_[0].key;
    if (len == 1) {
      result = [start - 1, start + 1, start - 1, start + 1];
    } else {
      var end = this.keys_[len - 1].key;
      result = [start, end, start - (this.keys_[1].key - start) / 2, end + (end - this.keys_[len - 2].key) / 2];
    }
  } else {
    result = [NaN, NaN, NaN, NaN];
  }
  return result;
};


/**
 * Updates the registry by its sources.
 */
anychart.core.stock.Registry.prototype.update = function() {
  if (!this.dirty_) return;

  this.searchCache_.length = 0;
  this.searchCachePointer_ = 0;
  this.selectionCache_.length = 0;
  this.selectionCachePointer_ = 0;

  if (!this.sources_.length) {
    this.keys_ = [];
  } else if (this.sources_.length == 1) {
    this.keys_ = this.sources_[0].getStorageInternal();
  } else {
    var dummy = {
      key: NaN,
      next: null
    };

    var res = [];
    // step one - we merge first two sources to prevent first light-loaded run on the first source with empty res array
    var source = this.sources_[0].getStorageInternal();
    /** @type {anychart.data.TableRow} */
    var current0 = source.length ? source[0] : null;
    source = this.sources_[1].getStorageInternal();
    /** @type {anychart.data.TableRow} */
    var current1 = source.length ? source[0] : null;
    // we use this dummy item to prevent one "if (prev)" in cycle.
    var prev = dummy;
    /** @type {anychart.core.stock.Registry.Item} */
    var newItem;
    while (current0 && current1) {
      var inc0 = current0.key <= current1.key;
      var inc1 = current0.key >= current1.key;
      newItem = {
        key: inc0 ? current0.key : current1.key,
        next: null
      };
      res.push(newItem);
      prev.next = newItem;
      prev = newItem;
      if (inc0)
        current0 = current0.next;
      if (inc1)
        current1 = current1.next;
    }
    current0 = current0 || current1; // there can be only one not null item here
    while (current0) {
      newItem = {
        key: current0.key,
        next: null
      };
      res.push(newItem);
      prev.next = newItem;
      prev = newItem;
      current0 = current0.next;
    }

    // step two - we merge i-th source and the merge result of the previous arrays.
    for (var i = 2; i < this.sources_.length; i++) {
      source = this.sources_[i].getStorageInternal();
      /** @type {anychart.data.TableRow} */
      var currentInSource = source.length ? source[0] : null;
      /** @type {anychart.core.stock.Registry.Item} */
      var currentInRes = res.length ? res[0] : null;
      // we use this dummy item to prevent one "if (prev)" in cycle.
      prev = dummy;
      var tmpRes = [];
      while (currentInRes && currentInSource) {
        var incSource = currentInRes.key >= currentInSource.key;
        if (currentInRes.key <= currentInSource.key) {
          newItem = currentInRes;
          currentInRes = currentInRes.next;
        } else {
          newItem = {
            key: currentInSource.key,
            next: null
          };
        }
        tmpRes.push(newItem);
        prev.next = newItem;
        prev = newItem;
        if (incSource)
          currentInSource = currentInSource.next;
      }
      prev.next = currentInRes; // may by null
      while (currentInRes) {
        tmpRes.push(currentInRes);
        currentInRes = currentInRes.next;
      }
      while (currentInSource) {
        newItem = {
          key: currentInSource.key,
          next: null
        };
        tmpRes.push(newItem);
        prev.next = newItem;
        prev = newItem;
        currentInSource = currentInSource.next;
      }
      res = tmpRes;
    }

    this.keys_ = res;
  }
  this.dirty_ = false;
  this.syncMode_ = true;
  for (i = 0; i < this.sources_.length; i++) {
    if (this.sources_[i].getRowsCount() != this.keys_.length) {
      this.syncMode_ = false;
      return;
    }
  }
};


/**
 * Returns current keys count.
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getKeysCount = function() {
  return this.keys_.length;
};



/**
 * Registry iterator. Should be used only if the registry is not in single-source mode.
 * @param {number} firstIndex
 * @param {anychart.core.stock.Registry.Item} firstItem
 * @param {anychart.core.stock.Registry.Item=} opt_lastItem
 * @constructor
 * @implements {anychart.data.TableIterator.ICoIterator}
 */
anychart.core.stock.Registry.Iterator = function(firstIndex, firstItem, opt_lastItem) {
  /**
   * Special Item that contains only the reference to the first node for "pre first" iterator position.
   * @type {!anychart.core.stock.Registry.Item}
   * @private
   */
  this.preFirst_ = {
    key: firstIndex - 1,
    next: firstItem
  };

  /**
   * Item to stop on.
   * @type {anychart.core.stock.Registry.Item}
   * @private
   */
  this.stop_ = opt_lastItem ? opt_lastItem.next : null;

  this.reset();
};


/**
 * Resets the iterator to a pre-first position.
 */
anychart.core.stock.Registry.Iterator.prototype.reset = function() {
  /**
   * Current item that iterator points to.
   * @type {anychart.core.stock.Registry.Item}
   * @private
   */
  this.current_ = this.preFirst_;

  /**
   * Cache of this.current_.key.
   * @type {number}
   * @private
   */
  this.currentKey_ = NaN;

  /**
   * Stores current item index.
   * @type {number}
   * @private
   */
  this.currentIndex_ = this.preFirst_.key;
};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 */
anychart.core.stock.Registry.Iterator.prototype.advance = function() {
  if (this.current_) {
    this.currentIndex_++;
    this.current_ = this.current_.next;
    if (this.current_ && this.current_ != this.stop_) {
      this.currentKey_ = this.current_.key;
      return true;
    }
    this.current_ = null;
    this.currentKey_ = NaN;
    this.currentIndex_ = NaN;
  }
  return false;
};


/**
 * Returns item key.
 * @return {number}
 */
anychart.core.stock.Registry.Iterator.prototype.currentKey = function() {
  return this.currentKey_;
};


/**
 * Returns item index.
 * @return {number}
 */
anychart.core.stock.Registry.Iterator.prototype.currentIndex = function() {
  return this.currentIndex_;
};
