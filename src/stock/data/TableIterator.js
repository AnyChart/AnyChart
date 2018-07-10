goog.provide('anychart.stockModule.data.TableIterator');
goog.provide('anychart.stockModule.data.TableIterator.ICoIterator');
goog.require('anychart.data.IIterator');
goog.require('anychart.stockModule.data.TableRow');



/**
 * Table iterator class. Assumes coiterator (if any) to return not less keys than the table has.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {!anychart.stockModule.data.TableStorage.Selection} selection
 * @param {Object} metaObj
 * @param {boolean} usesAggregatedMapping
 * @param {anychart.stockModule.data.TableIterator.ICoIterator=} opt_coIterator
 * @constructor
 * @implements {anychart.data.IIterator}
 */
anychart.stockModule.data.TableIterator = function(mapping, selection, metaObj, usesAggregatedMapping, opt_coIterator) {
  /**
   * Associated mapping reference.
   * @type {!anychart.stockModule.data.TableMapping}
   * @private
   */
  this.mapping_ = mapping;

  /**
   * If the iterator should use aggregated mapping scheme.
   * @type {boolean}
   * @private
   */
  this.aggregated_ = usesAggregatedMapping;

  /**
   * Special Item that contains only the reference to the first node for "pre first" iterator position.
   * @type {!anychart.stockModule.data.TableRow}
   * @private
   */
  this.preFirst_ = new anychart.stockModule.data.TableRow(isNaN(selection.preFirstIndex) ? -1 : selection.preFirstIndex, []);
  this.preFirst_.next = selection.firstRow;

  /**
   * Item to stop on.
   * @type {anychart.stockModule.data.TableRow}
   * @private
   */
  this.stop_ = selection.postLastRow;

  /**
   * Rows count.
   * @type {number}
   * @private
   */
  this.rowsCount_ = (selection.lastIndex - selection.firstIndex + 1) || 0;

  /**
   * CoIterator.
   * @type {anychart.stockModule.data.TableIterator.ICoIterator}
   * @private
   */
  this.coIterator_ = opt_coIterator || null;

  /**
   * Advances the iterator to the next position.
   * @return {boolean}
   * @private
   */
  this.advance_ = this.coIterator_ ? this.coAdvance_ : this.advanceSimple_;

  /**
   * Returns item index.
   * @return {number}
   * @private
   */
  this.getIndex_ = this.coIterator_ ? this.getCoIndex_ : this.getIndexSimple_;

  /**
   * @type {Object}
   * @private
   */
  this.meta_ = metaObj;

  this.reset();
};


/**
 * Resets the iterator to a pre-first position.
 * @return {anychart.stockModule.data.TableIterator}
 */
anychart.stockModule.data.TableIterator.prototype.reset = function() {
  if (this.coIterator_)
    this.coIterator_.reset();

  /**
   * Current item that iterator points to.
   * @type {anychart.stockModule.data.TableRow}
   * @private
   */
  this.current_ = this.preFirst_;

  /**
   * Stores current item index.
   * @type {number}
   * @private
   */
  this.currentIndex_ = this.coIterator_ ? this.coIterator_.currentIndex() : this.preFirst_.key;
  // since coIterator is reset here, we assume that coIterator_.currentIndex() call before the first
  // coIterator_.advance() should return the (firstRealIndex - 1) value

  /**
   * If this.current_ represents is really the current element.
   * @type {boolean}
   * @private
   */
  this.currentExists_ = false;

  /**
   * Cache of this.current_.key.
   * @type {number}
   * @private
   */
  this.currentKey_ = NaN;

  /**
   * If true - current should be moved on next advance. Used in coAdvance_.
   * @type {boolean}
   * @private
   */
  this.shouldMove_ = true;

  return this;
};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 */
anychart.stockModule.data.TableIterator.prototype.advance = function() {
  return this.advance_();
};


/** @inheritDoc */
anychart.stockModule.data.TableIterator.prototype.current = function() {
  return this.current_;
};


/** @inheritDoc */
anychart.stockModule.data.TableIterator.prototype.specialSelect = function(row, opt_index) {
  if (goog.isDef(row)) {
    if (this.coIterator_) {
      this.reset();
      while(this.advance() && row != this.current()) {
        // Just advance
      }
    } else {
      this.current_ = /** @type {anychart.stockModule.data.TableRow} */(row);
      this.currentExists_ = true;
      if (goog.isDef(opt_index))
        this.currentIndex_ = opt_index;
    }
  }
};


/**
 * Returns current field values.
 * @param {string} field
 * @return {*}
 */
anychart.stockModule.data.TableIterator.prototype.get = function(field) {
  return this.getColumn(this.aggregated_ ? this.mapping_.getAggregateColumn(field) : this.mapping_.getSourceColumn(field));
};


/**
 * Gets or sets META value for current row.
 * @param {string} name
 * @param {*=} opt_value
 * @return {anychart.stockModule.data.TableIterator|*}
 */
anychart.stockModule.data.TableIterator.prototype.meta = function(name, opt_value) {
  var meta = this.meta_[this.getIndex()];
  if (!meta)
    meta = this.meta_[this.getIndex()] = {};
  if (arguments.length > 1) {
    meta[name] = opt_value;
    return this;
  }
  return meta[name];
};


/**
 * Returns current column value.
 * @param {string|number} column
 * @return {*}
 */
anychart.stockModule.data.TableIterator.prototype.getColumn = function(column) {
  var result;
  if (this.currentExists_) {
    if (goog.isNumber(column) && column < 0) {
      if (this.current_.computedValues)
        result = this.current_.computedValues[~column];
    } else {
      result = this.current_.values[column];
    }
  }
  return result; // may by undefined
};


/**
 * Returns item key.
 * @return {number}
 */
anychart.stockModule.data.TableIterator.prototype.getX = function() {
  return this.currentKey_;
};


/**
 * Returns item index.
 * @return {number}
 */
anychart.stockModule.data.TableIterator.prototype.getIndex = function() {
  return this.getIndex_();
};


/**
 * Returns rows count.
 * @return {number}
 */
anychart.stockModule.data.TableIterator.prototype.getRowsCount = function() {
  return this.rowsCount_;
};


/**
 * Returns item key.
 * @return {number}
 */
anychart.stockModule.data.TableIterator.prototype.getKey = function() {
  return this.currentKey_;
};


/**
 * Returns item index.
 * @return {number}
 * @private
 */
anychart.stockModule.data.TableIterator.prototype.getIndexSimple_ = function() {
  return this.currentIndex_;
};


/**
 * Returns item index.
 * @return {number}
 * @private
 */
anychart.stockModule.data.TableIterator.prototype.getCoIndex_ = function() {
  return this.coIterator_.currentIndex();
};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 * @private
 */
anychart.stockModule.data.TableIterator.prototype.advanceSimple_ = function() {
  if (this.current_) {
    this.currentIndex_++;
    this.current_ = this.current_.next;
    if (this.current_ && this.current_ != this.stop_) {
      this.currentExists_ = true;
      this.currentKey_ = this.current_.key;
      return true;
    }
    this.current_ = null;
    this.currentExists_ = false;
    this.currentKey_ = NaN;
    this.currentIndex_ = NaN;
  }
  return false;
};


/**
 * Advances the iterator to the next position, considering the coiterator.
 * Assumes that the coiterator yields more keys than there are in the range of the main iterator.
 * @return {boolean}
 * @private
 */
anychart.stockModule.data.TableIterator.prototype.coAdvance_ = function() {
  if (this.coIterator_.advance()) {
    if (this.shouldMove_) // we assume that if shouldMove_ is true, than current_ is not null
      this.current_ = this.current_.next;
    this.shouldMove_ = !!(this.current_ &&
        this.current_.key == this.coIterator_.currentKey() &&
        this.current_ != this.stop_);
    if (this.shouldMove_) {
      this.currentExists_ = true;
      this.currentKey_ = this.current_.key;
    } else {
      this.currentExists_ = false;
      this.currentKey_ = this.coIterator_.currentKey();
    }
    return true;
  } else {
    this.current_ = null;
    this.currentKey_ = NaN;
    this.currentExists_ = false;
    return false;
  }
};



/**
 * CoIterator, that can be passed to the main iterator to declare holes in the main iterator.
 * @interface
 */
anychart.stockModule.data.TableIterator.ICoIterator = function() {};


/**
 * Returns item key.
 * @return {number}
 */
anychart.stockModule.data.TableIterator.ICoIterator.prototype.currentKey = function() {};


/**
 * Returns item index.
 * @return {number}
 */
anychart.stockModule.data.TableIterator.ICoIterator.prototype.currentIndex = function() {};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 */
anychart.stockModule.data.TableIterator.ICoIterator.prototype.advance = function() {};


/**
 * Resets the iterator to a pre-first position.
 */
anychart.stockModule.data.TableIterator.ICoIterator.prototype.reset = function() {};


/**
 * @return {number}
 */
anychart.stockModule.data.TableIterator.ICoIterator.prototype.getRowsCount = function() {};


//proto['getColumn'] = proto.getColumn;

//exports
(function() {
  var proto = anychart.stockModule.data.TableIterator.prototype;
  proto['reset'] = proto.reset;
  proto['advance'] = proto.advance;
  proto['get'] = proto.get;
  proto['getKey'] = proto.getKey;
  proto['getIndex'] = proto.getIndex;
  proto['meta'] = proto.meta;
})();
