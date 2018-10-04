goog.provide('anychart.stockModule.eventMarkers.Table');
goog.require('anychart.data.IIterator');
goog.require('anychart.data.IRowInfo');
goog.require('anychart.format');
goog.require('anychart.stockModule.data.TableIterator.ICoIterator');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * Event markers data table.
 * @constructor
 */
anychart.stockModule.eventMarkers.Table = function() {
  this.data_ = [];
  this.dataReducer_ = goog.bind(this.dataReducer_, this);
};


/**
 * @typedef {{
 *    key: number,
 *    index: number,
 *    data: (*|undefined),
 *    meta: (Object|undefined)
 * }}
 */
anychart.stockModule.eventMarkers.Table.DataItem;


/**
 * @typedef {{
 *    key: number,
 *    index: number,
 *    items: Array.<anychart.stockModule.eventMarkers.Table.DataItem>,
 *    emIndex: number
 * }}
 */
anychart.stockModule.eventMarkers.Table.DataItemAggregate;


/**
 * Sets data to the table.
 * @param {Array} value
 * @param {?string=} opt_dateTimePattern Key column parsing pattern. Null means default behaviour, undefined - default pattern.
 * @param {number=} opt_timeOffset Shifts all input dates timeOffset hours forward. Defaults to zero.
 * @param {?(number|Date)=} opt_baseDate Base date for the key column.
 * @param {?(string|anychart.format.Locale)=} opt_locale Locale for the key column parsing.
 */
anychart.stockModule.eventMarkers.Table.prototype.setData = function(value, opt_dateTimePattern, opt_timeOffset, opt_baseDate, opt_locale) {
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
   * Cache of the last selection.
   * @type {?{
   *    fromIndex: number,
   *    toIndex: number,
   *    data: Array.<anychart.stockModule.eventMarkers.Table.DataItemAggregate>,
   *    lookups: Array.<number>,
   *    firstIndex: number,
   *    count: number,
   *    pointsCount: number,
   *    stick: boolean
   * }}
   * @private
   */
  this.lastDataCache_ = null;

  /**
   * @type {Array.<anychart.stockModule.eventMarkers.Table.DataItem>}
   * @private
   */
  this.data_ = goog.array.reduce(value, this.dataReducer_, []);
  this.data_.sort(anychart.stockModule.eventMarkers.Table.DATA_ITEMS_COMPARATOR);
};


/**
 * Getter for data array.
 * @return {Array}
 */
anychart.stockModule.eventMarkers.Table.prototype.getData = function() {
  return goog.array.map(this.data_ || [], function(item) {
    return item.data;
  });
};


/**
 * Returns a new iterator for passed range of keys and a coIterator for a keys grid.
 * @param {anychart.stockModule.data.TableIterator.ICoIterator} coIterator
 * @param {number} fromOrNaNForFull
 * @param {number} toOrNaNForFull
 * @param {boolean} stick
 * @return {!anychart.stockModule.eventMarkers.Table.Iterator}
 */
anychart.stockModule.eventMarkers.Table.prototype.getIterator = function(coIterator, fromOrNaNForFull, toOrNaNForFull, stick) {
  var fromIndex, toIndex;
  var full = isNaN(fromOrNaNForFull) || isNaN(toOrNaNForFull);
  if (full) {
    fromIndex = 0;
    toIndex = this.data_.length;
  } else {
    fromIndex = ~goog.array.binarySearch(this.data_, {key: fromOrNaNForFull, index: -1}, anychart.stockModule.eventMarkers.Table.DATA_ITEMS_COMPARATOR);
    toIndex = ~goog.array.binarySearch(this.data_, {key: toOrNaNForFull, index: -Infinity}, anychart.stockModule.eventMarkers.Table.DATA_ITEMS_COMPARATOR);
  }


  var data, count, lookups, firstIndex, j, pointsCount;
  if (this.lastDataCache_ && this.lastDataCache_.stick == stick && this.lastDataCache_.fromIndex == fromIndex && this.lastDataCache_.toIndex == toIndex && this.lastDataCache_.pointsCount == coIterator.getRowsCount()) {
    data = this.lastDataCache_.data;
    lookups = this.lastDataCache_.lookups;
    firstIndex = this.lastDataCache_.firstIndex || 0;
    count = this.lastDataCache_.count || 0;
  } else {
    data = [];
    lookups = [];
    count = 0;
    if (stick) {
      firstIndex = NaN;
      var i = fromIndex;
      var prevIterKey = NaN;
      var prevIterIndex = NaN;
      var items = [];
      coIterator.reset();
      while (coIterator.advance() && i < toIndex) {
        var currItem;
        while (i < toIndex && (currItem = this.data_[i]).key < coIterator.currentKey()) {
          items.push(currItem);
          i++;
        }
        if (items.length) {
          if (isNaN(prevIterKey) && !full) {
            items.length = 0;
          } else {
            if (!data.length) {
              firstIndex = i - items.length;
            }
            for (j = 0; j < items.length; j++) {
              lookups.push(data.length);
            }
            data.push({
              key: prevIterKey,
              index: prevIterIndex,
              items: items,
              emIndex: i - items.length
            });
            count += items.length;
            items = [];
          }
        }
        prevIterKey = coIterator.currentKey();
        prevIterIndex = coIterator.currentIndex();
      }
      if (!isNaN(prevIterKey) || full) {
        while (i < toIndex) {
          items.push(currItem);
          i++;
        }
        if (items.length) {
          if (!data.length) {
            firstIndex = i - items.length;
          }
          for (j = 0; j < items.length; j++) {
            lookups.push(data.length);
          }
          data.push({
            key: prevIterKey,
            index: prevIterIndex,
            items: items,
            emIndex: i - items.length
          });
          count += items.length;
        }
      }
      pointsCount = coIterator.getRowsCount();
    } else {
      firstIndex = 0;
      var keysFromCoIterator = [];
      coIterator.reset();
      while (coIterator.advance()) {
        keysFromCoIterator[coIterator.currentIndex()] = coIterator.currentKey();
      }
      coIterator.reset();
      var prevKey = NaN;
      var prevIndex = NaN;
      var lookup = 0;
      var firstIndexInSeries = NaN;
      var from = isNaN(fromOrNaNForFull) ? -Infinity : fromOrNaNForFull;
      var to = isNaN(toOrNaNForFull) ? +Infinity : toOrNaNForFull;
      var currentKey, currentIndex;
      var keyInsideBounds;
      while (coIterator.advance()) {
        currentKey = coIterator.currentKey();
        currentIndex = coIterator.currentIndex();
        if (isNaN(firstIndexInSeries))
          firstIndexInSeries = currentIndex;
        var diff = (keysFromCoIterator[currentIndex] - keysFromCoIterator[prevIndex])/2;
        for (var i = 0; i < this.data_.length; i++) {
          keyInsideBounds = this.data_[i].key <= to && this.data_[i].key >= from;
          var keyInsideFirstVisible = (prevIndex == firstIndexInSeries) && this.data_[i].key < (prevKey + diff);

          var lowerBounds, upperBounds;
          upperBounds = keysFromCoIterator[currentIndex] + (keysFromCoIterator[currentIndex+1] - keysFromCoIterator[currentIndex])/2;
          lowerBounds = keysFromCoIterator[currentIndex] - (keysFromCoIterator[currentIndex] - keysFromCoIterator[currentIndex-1])/2;
          upperBounds = isNaN(upperBounds) ? to : upperBounds;
          var keyInsideCurrent = this.data_[i].key <= (upperBounds) && this.data_[i].key >= (lowerBounds);
          if (keyInsideBounds && (keyInsideFirstVisible || keyInsideCurrent)) {
            data.push({
              key: this.data_[i].key,
              index: keyInsideCurrent ? currentIndex : prevIndex,
              items: [this.data_[i]],
              emIndex: lookup
            });
            lookups.push(lookup);
            lookup++;
            count++;
          }
        }
        prevKey = currentKey;
        prevIndex = currentIndex;
      }
      // this fixes case when eventMarker is inside one visible point or between 2 points and neither one is visible
      if ((prevKey == currentKey && prevIndex == firstIndexInSeries) || isNaN(currentKey)) {
        for (var i = 0; i < this.data_.length; i++) {
          keyInsideBounds = this.data_[i].key <= to && this.data_[i].key >= from;
          if (keyInsideBounds) {
            data.push({
              key: this.data_[i].key,
              index: currentIndex ? currentIndex : lookup,
              items: [this.data_[i]],
              emIndex: lookup
            });
            lookups.push(lookup);
            lookup++;
            count++;
          }
        }
      }

      pointsCount = count;
    }
    this.lastDataCache_ = {
      fromIndex: fromIndex,
      toIndex: toIndex,
      data: data,
      lookups: lookups,
      firstIndex: firstIndex,
      count: count,
      pointsCount: pointsCount,
      stick: stick
    };
  }

  return new anychart.stockModule.eventMarkers.Table.Iterator(data, lookups, firstIndex, count);
};


/**
 * A reducer function for a setData method.
 * @param {Array.<anychart.stockModule.eventMarkers.Table.DataItem>} data
 * @param {*} row
 * @param {number} index
 * @return {Array.<anychart.stockModule.eventMarkers.Table.DataItem>}
 * @private
 */
anychart.stockModule.eventMarkers.Table.prototype.dataReducer_ = function(data, row, index) {
  var key = anychart.format.parseDateTime(
      ((row instanceof Date) || !goog.isObject(row)) ? row : row['date'],
      this.dtPattern_,
      isNaN(this.baseDate_) ? null : new Date(this.baseDate_),
      this.locale_);
  if (key) {
    data.push({
      index: index,
      key: +key,
      data: row,
      meta: {}
    });
  }
  return data;
};


/**
 * Data items comparison function
 * @param {anychart.stockModule.eventMarkers.Table.DataItem} a
 * @param {anychart.stockModule.eventMarkers.Table.DataItem} b
 * @return {number}
 * @private
 */
anychart.stockModule.eventMarkers.Table.DATA_ITEMS_COMPARATOR = function(a, b) {
  return (a.key - b.key) || (a.index - b.index);
};



//region --- anychart.stockModule.eventMarkers.Table.Iterator
//------------------------------------------------------------------------------
//
//  anychart.stockModule.eventMarkers.Table.Iterator
//
//------------------------------------------------------------------------------
/**
 * Iterator class.
 * @param {Array.<anychart.stockModule.eventMarkers.Table.DataItemAggregate>} data
 * @param {Array.<number>} indexLookup
 * @param {number} startIndex
 * @param {number} count
 * @constructor
 * @implements {anychart.data.IRowInfo}
 * @implements {anychart.data.IIterator}
 */
anychart.stockModule.eventMarkers.Table.Iterator = function(data, indexLookup, startIndex, count) {
  /**
   * Data items array.
   * @type {Array.<anychart.stockModule.eventMarkers.Table.DataItemAggregate>}
   * @private
   */
  this.data_ = data;

  /**
   * A lookup table for index -> groupIndex fast searches.
   * @type {Array.<number>}
   * @private
   */
  this.lookupTable_ = indexLookup;

  /**
   * First index of the selection in terms of group data indexes.
   * @type {number}
   * @private
   */
  this.firstIndex_ = startIndex;

  /**
   * Total rows count.
   * @type {number}
   * @private
   */
  this.rowsCount_ = count;

  this.reset();
};


/**
 * Selects an item by passed params.
 * @param {number} index
 * @return {boolean}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.select = function(index) {
  var res;
  if (res = (this.firstIndex_ <= index && index < this.firstIndex_ + this.rowsCount_)) {
    this.currentIndex_ = index;
    this.currentItemIndex_ = this.lookupTable_[index - this.firstIndex_];
    var item = this.data_[this.currentItemIndex_];
    this.currentItemLength_ = item.items.length;
    this.currentSubIndex_ = index - item.emIndex;
  } else {
    this.currentItemLength_ = 0;
    this.currentItemIndex_ = this.data_.length;
    this.currentSubIndex_ = 0;
    this.currentIndex_ = NaN;
  }
  return res;
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.specialSelect = function(row, opt_index) {
  this.select(/** @type {number} */(row));
};


/** @inheritDoc */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.current = function() {
  return this.data_[this.currentItemIndex_].items[this.currentSubIndex_].data;
};


/**
 * @param {number} index
 * @return {boolean}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.selectByDataIndex = function(index) {
  var res;
  var itemIndex = goog.array.binarySearch(this.data_, index, function(target, value) {
    return target - value.index;
  });
  if (res = (itemIndex >= 0)) {
    var item = this.data_[itemIndex];
    this.currentItemIndex_ = itemIndex;
    this.currentIndex_ = item.emIndex;
    this.currentItemLength_ = item.items.length;
    this.currentSubIndex_ = 0;
  } else {
    this.currentItemLength_ = 0;
    this.currentItemIndex_ = this.data_.length;
    this.currentSubIndex_ = 0;
    this.currentIndex_ = NaN;
  }
  return res;
};


/**
 * Resets the data iterator to its zero state (before the first item of the view).
 * @return {anychart.stockModule.eventMarkers.Table.Iterator}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.reset = function() {
  this.currentIndex_ = this.firstIndex_ - 1;
  this.currentItemIndex_ = -1;
  this.currentSubIndex_ = this.currentItemLength_ = 0;
  return this;
};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.advance = function() {
  if (++this.currentSubIndex_ >= this.currentItemLength_) {
    this.currentSubIndex_ = 0;
    this.currentItemIndex_++;
    this.currentItemLength_ = (this.currentItemIndex_ < this.data_.length) ?
        this.data_[this.currentItemIndex_].items.length : 0;
  }
  this.currentIndex_++;
  return this.currentSubIndex_ < this.currentItemLength_;
};


/**
 * Returns rows count.
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getRowsCount = function() {
  return this.rowsCount_;
};


/**
 * Returns current row data index. It is not bound to the rows count.
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getPointIndex = function() {
  return this.currentItemIndex_ < this.data_.length ? this.data_[this.currentItemIndex_].index : NaN;
};


/**
 * Returns current row data index.
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getIndex = function() {
  return this.currentItemIndex_ < this.data_.length ? this.currentIndex_ : NaN;
};


/**
 * Returns current key.
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getX = function() {
  return this.currentItemIndex_ < this.data_.length ? this.data_[this.currentItemIndex_].key : NaN;
};


/**
 * Returns current key.
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getPreciseX = function() {
  return this.currentItemIndex_ < this.data_.length ? this.data_[this.currentItemIndex_].items[this.currentSubIndex_].key : NaN;
};


/**
 * Item getter.
 * @param {string} name
 * @return {*}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.get = function(name) {
  var data = this.data_[this.currentItemIndex_].items[this.currentSubIndex_].data;
  return goog.isObject(data) ? data[name] : void 0;
};


/**
 * Dummy.
 * @param {number|string} index
 * @return {*}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getColumn = function(index) {
  return void 0;
};


/**
 * Returns true, if current item is the first in group.
 * @return {boolean}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.isFirstInStack = function() {
  return !this.currentSubIndex_;
};


/**
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getFirstIndex = function() {
  return this.firstIndex_;
};


/**
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getStackIndex = function() {
  return this.currentItemIndex_ < this.data_.length ? this.currentItemIndex_ : NaN;
};


/**
 * @return {number}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.getSubIndex = function() {
  return this.currentItemIndex_ < this.data_.length ? this.currentSubIndex_ : NaN;
};


/**
 * Meta getter-setter.
 * @param {string} name
 * @param {*=} opt_value
 * @return {*}
 */
anychart.stockModule.eventMarkers.Table.Iterator.prototype.meta = function(name, opt_value) {
  var obj = this.data_[this.currentItemIndex_].items[this.currentSubIndex_].meta;
  if (goog.isDef(opt_value)) {
    obj[name] = opt_value;
    return this;
  }
  return obj[name];
};


//endregion
