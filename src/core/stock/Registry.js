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
 *   postLastIndex: number
 * }}
 */
anychart.core.stock.Registry.Selection;


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
anychart.core.stock.Registry.prototype.getKey = function(index) {
  var len = this.keys_.length;
  if (len >= 2) { // also filters NaNs
    var low = Math.floor(index);
    var high = Math.ceil(index);
    var lowKey, highKey;
    if (high <= 0) {
      low = 0;
    } else if (low >= len - 1) {
      low = len - 2;
    } else if (low == high) {
      return this.keys_[index].key;
    }
    // inter/extrapolating
    lowKey = this.keys_[low].key;
    highKey = this.keys_[low + 1].key;
    return Math.round((highKey - lowKey) * (index - low) + lowKey);
  } else {
    if (len && index == 0)
      return this.keys_[index].key;
    return NaN;
  }
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Registry.prototype.getIndex = function(key) {
  var len = this.keys_.length;
  if (len >= 2) { // also filters NaNs
    var index = goog.array.binarySelect(this.keys_, anychart.data.TableRow.searchEvaluator, key);
    if (index < 0) {
      var low = ~index - 1;
      var lowKey, highKey;
      if (low < 0) {
        low = 0;
      } else if (low == len - 1) {
        low--;
      }
      // inter/extrapolating
      lowKey = this.keys_[low].key;
      highKey = this.keys_[low + 1].key;
      return (key - lowKey) / (highKey - lowKey) + low;
    }
    return index;
  } else {
    if (len == 1 && key == this.keys_[0].key)
      return 0;
    return NaN;
  }
};


/**
 * Creates and returns registry iterator for the passed range.
 * @param {number} firstKey
 * @param {number} lastKey
 * @return {!anychart.core.stock.Registry.Iterator}
 */
anychart.core.stock.Registry.prototype.getIterator = function(firstKey, lastKey) {
  var index = Math.max(0, Math.floor(this.getIndex(lastKey)));
  var lastItem = this.keys_.length > index ? this.keys_[index] : null;
  index = Math.max(0, Math.ceil(this.getIndex(firstKey)));
  var firstItem = this.keys_.length > index ? this.keys_[index] : null;
  return new anychart.core.stock.Registry.Iterator(index, firstItem, lastItem);
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
  var first, last, preFirst, postLast, startIndex, endIndex;
  var keysLength = this.keys_.length;
  if (keysLength) {
    startIndex = this.getIndex(startKey);
    endIndex = this.getIndex(endKey);
    first = Math.ceil(startIndex);
    if (first >= keysLength)
      first = NaN;
    // searching the storage for the appropriate rows
    if (isNaN(first)) {
      // this means that we tried to select keys greater than there are in the storage
      preFirst = keysLength - 1;
      last = postLast = NaN;
    } else {
      last = Math.floor(endIndex);
      if (last < 0)
        last = NaN;
      if (isNaN(last)) {
        // this means that we tried to select keys less than there are in the storage
        // and, thereby first should be now the first row in the storage (index 0)
        postLast = first;
        first = preFirst = NaN;
      } else {
        first = Math.max(0, first);
        last = Math.min(last, keysLength - 1);
        preFirst = first > 0 ? first - 1 : NaN;
        postLast = last < keysLength - 1 ? last + 1 : NaN;
      }
    }
  } else {
    first = last = preFirst = postLast = startIndex = endIndex = NaN;
  }
  return {
    startKey: startKey,
    endKey: endKey,
    startIndex: startIndex,
    endIndex: endIndex,
    firstIndex: first,
    preFirstIndex: preFirst,
    lastIndex: last,
    postLastIndex: postLast
  };
};


/**
 * Updates the registry by its sources.
 */
anychart.core.stock.Registry.prototype.update = function() {
  if (!this.dirty_) return;
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
    for (var i = 0; i < this.sources_.length; i++) {
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
