goog.provide('anychart.data.TableIterator');
goog.provide('anychart.data.TableIterator.ICoIterator');
goog.require('anychart.data.IIterator');
goog.require('anychart.data.TableRow');



/**
 * Table iterator class. Assumes coiterator (if any) to return not less keys than the table has.
 * @param {!anychart.data.TableMapping} mapping
 * @param {!anychart.data.TableStorage.Selection} selection
 * @param {Object} metaObj
 * @param {boolean} usesAggregatedMapping
 * @param {anychart.data.TableIterator.ICoIterator=} opt_coIterator
 * @constructor
 * @implements {anychart.data.IIterator}
 */
anychart.data.TableIterator = function(mapping, selection, metaObj, usesAggregatedMapping, opt_coIterator) {
  /**
   * Associated mapping reference.
   * @type {!anychart.data.TableMapping}
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
   * @type {!anychart.data.TableRow}
   * @private
   */
  this.preFirst_ = new anychart.data.TableRow(selection.firstIndex - 1, []);
  // we do not use selection.preFirstRow here, since it can be null, while firstRow is not -
  // when firstRow is the first element in storage. Also we store the first index in this.preFirst_.key
  this.preFirst_.next = selection.firstRow;

  /**
   * Item to stop on.
   * @type {anychart.data.TableRow}
   * @private
   */
  this.stop_ = selection.postLastRow;

  /**
   * Last index of the selection. Currently used to determine rows count.
   * @type {number}
   * @private
   */
  this.lastIndex_ = selection.lastIndex;

  /**
   * CoIterator.
   * @type {anychart.data.TableIterator.ICoIterator}
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
 * @return {anychart.data.TableIterator}
 */
anychart.data.TableIterator.prototype.reset = function() {
  if (this.coIterator_)
    this.coIterator_.reset();

  /**
   * Current item that iterator points to.
   * @type {anychart.data.TableRow}
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
anychart.data.TableIterator.prototype.advance = function() {
  return this.advance_();
};


/**
 * Returns current item.
 * @return {anychart.data.TableRow}
 */
anychart.data.TableIterator.prototype.current = function() {
  return this.current_;
};


/**
 * "Selects" iterator to row.
 * @param {anychart.data.TableRow} row Row to select to.
 */
anychart.data.TableIterator.prototype.specialSelect = function(row) {
  if (goog.isDef(row)) {
    this.current_ = row;
    this.currentExists_ = true;
  }
};


/**
 * Returns current field values.
 * @param {string} field
 * @return {*}
 */
anychart.data.TableIterator.prototype.get = function(field) {
  return this.getColumn(this.aggregated_ ? this.mapping_.getAggregateColumn(field) : this.mapping_.getSourceColumn(field));
};


/**
 * Gets or sets META value for current row.
 * @param {string} name
 * @param {*=} opt_value
 * @return {anychart.data.TableIterator|*}
 */
anychart.data.TableIterator.prototype.meta = function(name, opt_value) {
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
anychart.data.TableIterator.prototype.getColumn = function(column) {
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
anychart.data.TableIterator.prototype.getX = function() {
  return this.currentKey_;
};


/**
 * Returns item index.
 * @return {number}
 */
anychart.data.TableIterator.prototype.getIndex = function() {
  return this.getIndex_();
};


/**
 * Returns rows count.
 * @return {number}
 */
anychart.data.TableIterator.prototype.getRowsCount = function() {
  // no +1 because pre-first key is firstIndex - 1 already.
  return this.lastIndex_ - this.preFirst_.key;
};


/**
 * Returns item key.
 * @return {number}
 */
anychart.data.TableIterator.prototype.getKey = function() {
  return this.currentKey_;
};


/**
 * Returns item index.
 * @return {number}
 * @private
 */
anychart.data.TableIterator.prototype.getIndexSimple_ = function() {
  return this.currentIndex_;
};


/**
 * Returns item index.
 * @return {number}
 * @private
 */
anychart.data.TableIterator.prototype.getCoIndex_ = function() {
  return this.coIterator_.currentIndex();
};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 * @private
 */
anychart.data.TableIterator.prototype.advanceSimple_ = function() {
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
anychart.data.TableIterator.prototype.coAdvance_ = function() {
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
anychart.data.TableIterator.ICoIterator = function() {};


/**
 * Returns item key.
 * @return {number}
 */
anychart.data.TableIterator.ICoIterator.prototype.currentKey = function() {};


/**
 * Returns item index.
 * @return {number}
 */
anychart.data.TableIterator.ICoIterator.prototype.currentIndex = function() {};


/**
 * Advances the iterator to the next position.
 * @return {boolean}
 */
anychart.data.TableIterator.ICoIterator.prototype.advance = function() {};


/**
 * Resets the iterator to a pre-first position.
 */
anychart.data.TableIterator.ICoIterator.prototype.reset = function() {};


//proto['getColumn'] = proto.getColumn;

//exports
(function() {
  var proto = anychart.data.TableIterator.prototype;
  proto['reset'] = proto.reset;
  proto['advance'] = proto.advance;
  proto['get'] = proto.get;
  proto['getKey'] = proto.getKey;
  proto['getIndex'] = proto.getIndex;
  proto['meta'] = proto.meta;
})();
