goog.provide('anychart.data.csv.Parser');

goog.require('anychart.core.reporting');
goog.require('anychart.data.csv.DefaultItemsProcessor');
goog.require('anychart.data.csv.IItemsProcessor');
goog.require('goog.Disposable');



/**
 * The Parser.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.data.csv.Parser = function() {
  anychart.data.csv.Parser.base(this, 'constructor');
  this.rowsSepLen_ = this.rowsSeparator_.length - 1;
  this.colsSepLen_ = this.colsSeparator_.length - 1;
  this.processBlock_ = goog.bind(this.processBlock_, this);
};
goog.inherits(anychart.data.csv.Parser, goog.Disposable);


/**
 * Parser states enumeration.
 * @enum {number}
 * @private
 */
anychart.data.csv.Parser.ParserState_ = {
  STATE_GENERAL: 0,
  STATE_VALUE: 1,
  STATE_ESCAPING: 2,
  STATE_LOOKING_FOR_SEPARATOR: 3
};


/**
 * Sets max row count per one async block processing.
 * @type {number}
 */
anychart.data.csv.Parser.prototype.ASYNC_ROWS_COUNT = 500;


/**
 * Item processor.
 * @type {anychart.data.csv.IItemsProcessor}
 * @private
 */
anychart.data.csv.Parser.prototype.itemsProcessor_ = null;


/**
 *  Rows separator.
 *  @type {string}
 *  @private
 */
anychart.data.csv.Parser.prototype.rowsSeparator_ = '\n';


/**
 *  Cols separator.
 *  @type {string}
 *  @private
 */
anychart.data.csv.Parser.prototype.colsSeparator_ = ',';


/**
 * Rows separator length.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.rowsSepLen_ = NaN;


/**
 * Cols separator length.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.colsSepLen_ = NaN;


/**
 * Prefix-function of rows separator.
 * @type {Array.<number>}
 * @private
 */
anychart.data.csv.Parser.prototype.rowsSepPrefixFunc_;


/**
 * Prefix-function of cols separator.
 * @type {Array.<number>}
 * @private
 */
anychart.data.csv.Parser.prototype.colsSepPrefixFunc_;


/**
 * Data.
 * @type {string}
 * @private
 */
anychart.data.csv.Parser.prototype.content_;


/**
 * Data length.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.contentLen_ = NaN;


/**
 * Ignoring leading and trailing spaces in the cell.
 * @type {boolean}
 * @private
 */
anychart.data.csv.Parser.prototype.ignoreTrailingSpaces_ = false;


/**
 * Ignoring first row in data.
 * @type {boolean}
 * @private
 */
anychart.data.csv.Parser.prototype.ignoreFirstRow_ = false;


/**
 * Last fixed position of viewing data.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.currPos_ = NaN;


/**
 * Last fixed position in rows separator.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.currRowsSepPos_ = -1;


/**
 * Last fixed position in cols separator.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.currColsSepPos_ = -1;


/**
 * Indicates if end of data is found.
 * @type {boolean}
 * @private
 */
anychart.data.csv.Parser.prototype.finished_ = false;


/**
 * Process timeout identifier.
 * @type {number}
 * @private
 */
anychart.data.csv.Parser.prototype.processTimeout_ = NaN;


/**
 * Rows separator settings.
 * @param {string=} opt_value
 * @return {anychart.data.csv.Parser|string}
 */
anychart.data.csv.Parser.prototype.rowsSeparator = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.rowsSeparator_ = opt_value;
    this.rowsSepLen_ = this.rowsSeparator_.length - 1;
    return this;
  }
  return this.rowsSeparator_;
};


/**
 * Cols separator settings.
 * @param {string=} opt_value
 * @return {anychart.data.csv.Parser|string}
 */
anychart.data.csv.Parser.prototype.columnsSeparator = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.colsSeparator_ = opt_value;
    this.colsSepLen_ = this.colsSeparator_.length - 1;
    return this;
  }
  return this.colsSeparator_;
};


/**
 * Header row ignorance settings.
 * @param {boolean=} opt_value If the row should be ignored.
 * @return {anychart.data.csv.Parser|boolean}
 */
anychart.data.csv.Parser.prototype.ignoreFirstRow = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.ignoreFirstRow_ = !!opt_value;
    return this;
  }
  return this.ignoreFirstRow_;
};


/**
 * If the trailing spaces around the value should be ignored.
 * @param {boolean=} opt_value If the trailing spaces around the value should be ignored.
 * @return {anychart.data.csv.Parser|boolean}
 */
anychart.data.csv.Parser.prototype.ignoreTrailingSpaces = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.ignoreTrailingSpaces_ = !!opt_value;
    return this;
  }
  return this.ignoreTrailingSpaces_;
};


/**
 * Parses CSV. In a process of parsing the methods of ICSVItemsProcessor are called.
 * @param {string} data Plain csv data.
 * @param {anychart.data.csv.IItemsProcessor=} opt_itemsProcessor Item processor to use. If none passed - uses default
 *    processor.
 * @param {boolean=} opt_async Indicates async processing. Async processing can be activated only if a custom items
 *    processor passed.
 * @return {?Array.<Array>} If no items processor passed, returns parsed data as an array of rows. Each row is an
 *    array of strings in that case.
 */
anychart.data.csv.Parser.prototype.parse = function(data, opt_itemsProcessor, opt_async) {
  this.itemsProcessor_ = opt_itemsProcessor || new anychart.data.csv.DefaultItemsProcessor();
  // commented here for the best future. Caused by DVF-2583
  // stock uses own itemsProcessor to parse csv, so parser automatically goes async. That's why
  // large csv isn't parsed completely in stock (restricted with ASYNC_ROWS_COUNT)
  opt_async = !!(opt_async/* || opt_itemsProcessor*/);

  //aggregate the data and calculate its length
  this.content_ = data || '';
  this.contentLen_ = data.length;

  //calculate a prefix-function for the both row and col separators
  this.rowsSepPrefixFunc_ = this.getPrefixFunction_(this.rowsSeparator_);
  this.colsSepPrefixFunc_ = this.getPrefixFunction_(this.colsSeparator_);

  //resets indicators for position and end of data
  this.currPos_ = 0;
  this.finished_ = (this.currPos_ == this.contentLen_);

  // set flag of skipping row if necessary. Real parser setting is handled by fake method.
  this.processItem_ = this.ignoreFirstRow_ ? this.processItemFake_ : this.processItemReal_;

  this.itemsProcessor_.start();

  // parse first row of data
  if (this.next_()) {
    if (this.ignoreFirstRow_)
      this.processItem_ = this.processItemReal_;
    else
      this.itemsProcessor_.processRow();
  }

  this.ignoreFirstRow_ = false;

  if (opt_async) {
    this.processBlock_();
  } else {
    while (this.next_())
      this.itemsProcessor_.processRow();
    this.itemsProcessor_.progress(this.currPos_);
    this.itemsProcessor_.finish();
    if (this.itemsProcessor_ instanceof anychart.data.csv.DefaultItemsProcessor)
      return (/** @type {anychart.data.csv.DefaultItemsProcessor} */(this.itemsProcessor_)).getData();
  }
  return null;
};


/**
 * Processes block.
 * @private
 */
anychart.data.csv.Parser.prototype.processBlock_ = function() {
  clearTimeout(this.processTimeout_);
  var i = 0;

  var res = this.next_();

  while (res && i++ < this.ASYNC_ROWS_COUNT) {
    if (this.isDisposed()) return;
    this.itemsProcessor_.processRow();
    res = this.next_();
  }

  if (res) this.itemsProcessor_.processRow();
  if (this.isDisposed()) return;
  if (res) {
    this.itemsProcessor_.progress(this.currPos_);
    this.processTimeout_ = setTimeout(this.processBlock_, 0);
  } else {
    this.itemsProcessor_.finish();
  }
};


/**
 * Computes prefix-function for a string.
 * @see http://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%B5%D1%84%D0%B8%D0%BA%D1%81-%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F
 * @param {?string} pattern string to perform actions on.
 * @return {Array.<number>} Array of number - Prefix-function.
 * @private
 */
anychart.data.csv.Parser.prototype.getPrefixFunction_ = function(pattern) {
  var length = pattern.length;
  var result = new Array(length);
  result[0] = -1;
  var k = -1;

  for (var i = 1; i < length; i++) {
    var ch = pattern.charAt(i);
    if (ch == '\"') {
      anychart.core.reporting.error(anychart.enums.ErrorCode.CSV_DOUBLE_QUOTE_IN_SEPARATOR);
      throw new Error('Double quotes in separator are not allowed');
    }
    while ((k > 0) && (pattern.charAt(k + 1) != ch))
      k = result[k];
    if (pattern.charAt(k + 1) == ch)
      k++;
    result[i] = k;
  }
  return result;
};


/**
 * Method passes a newly found cell to itemProcessor.
 * If the item is empty then method expects item=null but not item="".
 * This method switches between processItemReal_ and processItemFake_ to
 * handle first line ignoring.
 * @param {number} index column index.
 * @param {?string} item cell from source CSV.
 * @private
 */
anychart.data.csv.Parser.prototype.processItem_;


/**
 * Real item processor proxy.
 * @private
 * @param {number} index column index.
 * @param {?string} item cell from source CSV.
 */
anychart.data.csv.Parser.prototype.processItemReal_ = function(index, item) {
  this.itemsProcessor_.processRowItem(index, item);
};


/**
 * Fake item processor proxy.
 * @private
 */
anychart.data.csv.Parser.prototype.processItemFake_ = goog.nullFunction;


/**
 * Checks if the column separator is matched.
 * @param {string} currChar Current character.
 * @return {boolean} If the separator matched.
 * @private
 */
anychart.data.csv.Parser.prototype.checkColSep_ = function(currChar) {
  while ((this.currColsSepPos_ > -1) && (this.colsSeparator_.charAt(this.currColsSepPos_ + 1) != currChar)) // we check if colSep with Knuth's algorithm
    this.currColsSepPos_ = this.colsSepPrefixFunc_[this.currColsSepPos_];
  if (this.colsSeparator_.charAt(this.currColsSepPos_ + 1) == currChar)
    this.currColsSepPos_++;
  return (this.currColsSepPos_ == this.colsSepLen_);
};


/**
 * Checks if the row separator is matched.
 * @param {string} currChar Current character.
 * @return {boolean} If the separator matched.
 * @private
 */
anychart.data.csv.Parser.prototype.checkRowSep_ = function(currChar) {
  while ((this.currRowsSepPos_ > -1) && (this.rowsSeparator_.charAt(this.currRowsSepPos_ + 1) != currChar)) // we check if rowSep with Knuth's algorithm
    this.currRowsSepPos_ = this.rowsSepPrefixFunc_[this.currRowsSepPos_];
  if (this.rowsSeparator_.charAt(this.currRowsSepPos_ + 1) == currChar)
    this.currRowsSepPos_++;
  return (this.currRowsSepPos_ == this.rowsSepLen_);
};


/**
 * Method parses the next row of data.
 * @private
 * @return {boolean} Is end of data is not found yet.
 */
anychart.data.csv.Parser.prototype.next_ = function() {
  if (this.finished_) {
    return false;
  }

  //the number of currently filling field
  var currFieldIndex = 0;

  //counter of the current position of viewing (- 1 is due to the peculiarities of the cycle)
  var i = this.currPos_ - 1;

  //auxiliary variables for cycles
  var len = NaN;

  //number of current symbol in rowSep
  this.currRowsSepPos_ = -1;

  //number of current symbol in colSep
  this.currColsSepPos_ = -1;

  //state
  var state = anychart.data.csv.Parser.ParserState_.STATE_GENERAL;

  //contains a current substring witch we work with
  var str = '';

  //used to remove trailing spaces with ignoreTrailingSpaces is set.
  var spacesLen = 0;

  //auxiliary symbol
  var nextChar = null;

  while (++i < this.contentLen_) {
    var currChar = this.content_.charAt(i);
    switch (state) {
      case anychart.data.csv.Parser.ParserState_.STATE_GENERAL:// beginning of the cell
        if (currChar == '\"') { // found a quote
          if (++i < this.contentLen_) // check if the next symbol exists. In the same time we move the current symbol pointer on next symbol
            nextChar = this.content_.charAt(i);
          else { // in other case we pretend that there were twice a quotes and move one symbol back to process this correctly after cycle is finished
            nextChar = currChar;
            i--;
          }
          this.currPos_ = i; //any row will begin with this symbol anyway
          if (nextChar == '\"') { // we if it is a beginning of markup or just a quotes
            // if it's just a quotes - we set state to STATE_VALUE
            state = anychart.data.csv.Parser.ParserState_.STATE_VALUE;
          } else {// else we set a STATE_ESCAPING - state and roll the pointer back
            state = anychart.data.csv.Parser.ParserState_.STATE_ESCAPING;
            i--;
          }
          break;
        }

        if (this.checkColSep_(currChar)) {
          this.processItem_(currFieldIndex++, null); // write result in an appropriate cell (empty string must be!)
          str = '';
          this.currColsSepPos_ = -1;
          this.currRowsSepPos_ = -1;
          this.currPos_ = i + 1;
          break;
        }

        if (this.checkRowSep_(currChar)) {
          this.currColsSepPos_ = -1;
          this.currRowsSepPos_ = -1;
          this.currPos_ = i + 1;
          if (currFieldIndex > 0) { // if string is not empty then we return an answer back inside
            this.processItem_(currFieldIndex, null);
            return true;
          } else { // start from beginning
            str = '';
            break;
          }
        }

        if (!this.ignoreTrailingSpaces_ || (currChar != ' ' && currChar != '\t')) {// if the spaces are the part of data or we didn't find a space
          this.currPos_ = i;
          state = anychart.data.csv.Parser.ParserState_.STATE_VALUE;
        }
        break;
      case anychart.data.csv.Parser.ParserState_.STATE_VALUE: // within the data of cell
        if (this.checkColSep_(currChar)) {
          len = i - this.currPos_ - this.colsSepLen_;

          if (this.colsSepLen_ > 0 && this.ignoreTrailingSpaces_) {
            str = anychart.utils.rtrim(this.content_.substr(this.currPos_, len));
            if (!str) str = null;
          } else {
            if (this.ignoreTrailingSpaces_)
              len -= spacesLen;
            str = len > 0 ? this.content_.substr(this.currPos_, len) : null;
          }
          this.processItem_(currFieldIndex++, str);

          str = '';
          this.currColsSepPos_ = -1;
          this.currRowsSepPos_ = -1;
          this.currPos_ = i + 1;
          spacesLen = 0;
          state = anychart.data.csv.Parser.ParserState_.STATE_GENERAL;
          break;
        }

        if (this.checkRowSep_(currChar)) {
          len = i - this.currPos_ - this.rowsSepLen_;
          if (!currFieldIndex && len <= 0) { // we made a mistake thinking that the beginning of a multi-symbol separator is the beginning of data. Well, we start from beginning
            str = '';
            state = anychart.data.csv.Parser.ParserState_.STATE_GENERAL;
            this.currColsSepPos_ = -1;
            this.currRowsSepPos_ = -1;
            this.currPos_ = i + 1;
            spacesLen = 0;
            break;
          } else {
            if (this.rowsSepLen_ > 0 && this.ignoreTrailingSpaces_) {
              str = anychart.utils.rtrim(this.content_.substr(this.currPos_, len));
              if (!str) str = null;
            } else {
              if (this.ignoreTrailingSpaces_)
                len -= spacesLen;
              str = len > 0 ? this.content_.substr(this.currPos_, len) : null;
            }
            this.processItem_(currFieldIndex, str);
            this.currPos_ = i + 1;

            return true;//result;
          }
        }

        if (this.ignoreTrailingSpaces_ && (currChar == ' ' || currChar == '\t'))// if the spaces is not the part of data but we found the space
          spacesLen++;
        else
          spacesLen = 0;
        break;
      case anychart.data.csv.Parser.ParserState_.STATE_ESCAPING: // we are within the screening and swallow everything except the quotes
        if (currChar == '\"') { // the quote is found
          if (++i < this.contentLen_) // check if the next symbol presents and in the same time move a current symbol's pointer on the next symbol
            nextChar = this.content_.charAt(i);
          else { // else: stop the processing (simulate we've ended a string with a quote as well as data is ended too)
            len = i - this.currPos_ - 1;
            this.processItem_(currFieldIndex, len > 0 ? this.content_.substr(this.currPos_, len) : null);
            this.currPos_ = i;
            this.finished_ = true;
            return true;//result;
          }
          if (nextChar == '\"') { // check if we've got the end of screening of just a quotes
            // if the quotes - we set a str-variable as the part of string before quotation marks and this.currPos_
            str += this.content_.substr(this.currPos_, i - this.currPos_);
            this.currPos_ = i + 1;
          } else {// else set state to STATE_LOOKING_FOR_SEPARATOR, put the data into a cell and roll the pointer's value back
            this.currColsSepPos_ = -1;
            this.currRowsSepPos_ = -1;
            state = anychart.data.csv.Parser.ParserState_.STATE_LOOKING_FOR_SEPARATOR;
            str += this.content_.substr(this.currPos_, i - this.currPos_ - 1);
            this.processItem_(currFieldIndex++, str ? str : null);
            str = '';
            i--;
          }
          break;
        }
        break;
      case anychart.data.csv.Parser.ParserState_.STATE_LOOKING_FOR_SEPARATOR: // looking for an end of the cell ignoring any other symbols
        if (this.checkColSep_(currChar)) {
          str = '';
          this.currColsSepPos_ = -1;
          this.currRowsSepPos_ = -1;
          this.currPos_ = i + 1;
          spacesLen = 0;
          state = anychart.data.csv.Parser.ParserState_.STATE_GENERAL;
          break;
        }

        if (this.checkRowSep_(currChar)) {
          this.currPos_ = i + 1;
          return true;//result;
        }
        break;
    }
  }

  len = this.contentLen_ - this.currPos_;
  // at the end of the data, we found no line separator (generator was impolite),
  // therefore, if we still have something to be appended to the end of last cell, then we write in it all that we have
  if ((state == anychart.data.csv.Parser.ParserState_.STATE_ESCAPING ||
      state == anychart.data.csv.Parser.ParserState_.STATE_VALUE) && len) {
    str += this.content_.substr(this.currPos_, len);
    if (this.ignoreTrailingSpaces_)
      str = anychart.utils.rtrim(this.content_.substr(this.currPos_, len));
    this.processItem_(currFieldIndex++, str ? str : null);
    this.currPos_ = this.contentLen_;
  }
  this.finished_ = true;
  // let's discuss if it's necessary to go through ne more line?
  return (currFieldIndex > 0);
  // "true" must be returned if it's not null cell e.g. there no any values containing.
  // Looks like the parses itself doesn't care of it, but processRow can't be called for a last line.

};


/** @inheritDoc */
anychart.data.csv.Parser.prototype.disposeInternal = function() {
  clearTimeout(this.processTimeout_);
  this.itemsProcessor_ = null;

  this.rowsSepPrefixFunc_ = null;

  this.colsSepPrefixFunc_ = null;
  anychart.data.csv.Parser.base(this, 'disposeInternal');
};


///**
// * @inheritDoc
// * @param {Object} data incoming object.
// */
//anychart.data.csv.Parser.prototype.setupByJSON = function(data) {
//  var d = anychart.utils.deserialization;
//  if (d.hasProp(data, 'columnsSeparator'))
//    this.colsSeparator_ = this.setupSeparator_(d.getProp(data, 'columnsSeparator'));
//  if (d.hasProp(data, 'rowsSeparator'))
//    this.rowsSeparator_ = this.setupSeparator_(d.getProp(data, 'rowsSeparator'));
//  if (d.hasProp(data, 'ignoreTrailingSpaces'))
//    this.ignoreTrailingSpaces_ = d.getBoolProp(data, 'ignoreTrailingSpaces');
//  if (d.hasProp(data, 'ignoreFirstRow'))
//    this.ignoreFirstRow_ = d.getBoolProp(data, 'ignoreFirstRow');
//
//  if (!this.colsSeparator_ || !this.rowsSeparator_)
//    throw new anychart.data.parser.CSVParserSettingsError(anychart.data.parser.CSVParserSettingsError.EMPTY_SEPARATORS);
//
//  if (this.rowsSeparator_ == this.colsSeparator_)
//    throw new anychart.data.parser.CSVParserSettingsError(anychart.data.parser.CSVParserSettingsError.EQUAL_SEPARATORS);
//
//  this.rowsSepLen_ = this.rowsSeparator_.length - 1;
//  this.colsSepLen_ = this.colsSeparator_.length - 1;
//  this.disposed = false;
//};
//
//
///**
// * Deserializes separator. Returns null if the separator is empty.
// * @private
// * @param {*} val incoming object.
// * @return {string} setupd separator.
// */
//anychart.data.csv.Parser.prototype.setupSeparator_ = function(val) {
//  var s = '' + val;
//  var i = 0;
//  var len = s.length;
//  var res = '';
//  var escaped = false;
//  var currBeg = 0;
//  if (!len) return null;
//  if (len == 1) return s;
//
//  while (i < len) {
//    var ch = s.charAt(i);
//    if (ch == '"')
//      throw new Error('Double quotes in separator');
//    if (escaped) {
//      switch (ch) {
//        case 'n':
//          res += '\n';
//          break;
//        case 'r':
//          res += '\r';
//          break;
//        case 't':
//          res += '\t';
//          break;
//        case '\\':
//          res += '\\';
//          break;
//        default:
//          res += ch;
//          break;
//      }
//      escaped = false;
//    } else if (ch == '\\') {
//      escaped = true;
//      res += s.substr(currBeg, i - currBeg);
//      currBeg = i + 2;
//    }
//    i++;
//  }
//  if (len - currBeg > 1)
//    res += s.substr(currBeg, i - currBeg);
//  return res;
//
//};


/**
 * Constructor function.
 * @return {!anychart.data.csv.Parser}
 */
anychart.data.csv.parser = function() {
  return new anychart.data.csv.Parser();
};


//exports
(function() {
  var proto = anychart.data.csv.Parser.prototype;
  goog.exportSymbol('anychart.data.csv.parser', anychart.data.csv.parser);
  proto['parse'] = proto.parse;
  proto['rowsSeparator'] = proto.rowsSeparator;
  proto['columnsSeparator'] = proto.columnsSeparator;
  proto['ignoreTrailingSpaces'] = proto.ignoreTrailingSpaces;
  proto['ignoreFirstRow'] = proto.ignoreFirstRow;
})();
