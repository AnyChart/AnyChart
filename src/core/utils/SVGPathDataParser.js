goog.provide('anychart.core.utils.SVGPathDataParser');



/**
 * Geo SVG parser class.
 * @param {string} string .
 * @constructor
 */
anychart.core.utils.SVGPathDataParser = function(string) {
  /**
   * @type {string}
   */
  this._string = string;
  /**
   * @type {number}
   */
  this._currentIndex = 0;
  this._endIndex = this._string.length;
  this._prevCommand = null;
  this.skipOptionalSpaces_();
};


/**
 * Map of commands.
 * @type {Object}
 * @private
 */
anychart.core.utils.SVGPathDataParser.COMMAND_MAP_ = {
  'Z': 'Z', 'M': 'M', 'L': 'L', 'C': 'C', 'Q': 'Q', 'A': 'A', 'H': 'H', 'V': 'V', 'S': 'S', 'T': 'T',
  'z': 'Z', 'm': 'm', 'l': 'l', 'c': 'c', 'q': 'q', 'a': 'a', 'h': 'h', 'v': 'v', 's': 's', 't': 't'
};


/**
 * Segment parsing.
 * @return {Object}
 */
anychart.core.utils.SVGPathDataParser.prototype.parseSegment = function() {
  var char_ = this._string[this._currentIndex];
  var command = anychart.core.utils.SVGPathDataParser.COMMAND_MAP_[char_] ? anychart.core.utils.SVGPathDataParser.COMMAND_MAP_[char_] : null;

  if (command === null) {
    // Possibly an implicit command. Not allowed if this is the first command.
    if (this._prevCommand === null) {
      return null;
    }

    // Check for remaining coordinates in the current command.
    if (
        (char_ === '+' || char_ === '-' || char_ === '.' || (char_ >= '0' && char_ <= '9')) && this._prevCommand !== 'Z'
    ) {
      if (this._prevCommand === 'M') {
        command = 'L';
      }
      else if (this._prevCommand === 'm') {
        command = 'l';
      }
      else {
        command = this._prevCommand;
      }
    }
    else {
      command = null;
    }

    if (command === null) {
      return null;
    }
  }
  else {
    this._currentIndex += 1;
  }

  this._prevCommand = command;

  var values = null;
  var cmd = command.toUpperCase();

  if (cmd === 'H' || cmd === 'V') {
    values = [this.parseNumber_()];
  }
  else if (cmd === 'M' || cmd === 'L' || cmd === 'T') {
    values = [this.parseNumber_(), this.parseNumber_()];
  }
  else if (cmd === 'S' || cmd === 'Q') {
    values = [this.parseNumber_(), this.parseNumber_(), this.parseNumber_(), this.parseNumber_()];
  }
  else if (cmd === 'C') {
    values = [
      this.parseNumber_(),
      this.parseNumber_(),
      this.parseNumber_(),
      this.parseNumber_(),
      this.parseNumber_(),
      this.parseNumber_()
    ];
  }
  else if (cmd === 'A') {
    values = [
      this.parseNumber_(),
      this.parseNumber_(),
      this.parseNumber_(),
      this.parseArcFlag_(),
      this.parseArcFlag_(),
      this.parseNumber_(),
      this.parseNumber_()
    ];
  }
  else if (cmd === 'Z') {
    this.skipOptionalSpaces_();
    values = [];
  }

  if (values === null || values.indexOf(null) >= 0) {
    // Unknown command or known command with invalid values
    return null;
  }
  else {
    return {type: command, values: values};
  }
};


/**
 * Whether has more data.
 * @return {boolean}
 */
anychart.core.utils.SVGPathDataParser.prototype.hasMoreData = function() {
  return this._currentIndex < this._endIndex;
};


/**
 * Returns segment type.
 * @return {?string}
 */
anychart.core.utils.SVGPathDataParser.prototype.peekSegmentType = function() {
  var char_ = this._string[this._currentIndex];
  return anychart.core.utils.SVGPathDataParser.COMMAND_MAP_[char_] ? anychart.core.utils.SVGPathDataParser.COMMAND_MAP_[char_] : null;
};


/**
 * Whether this is initial command.
 * @return {boolean}
 */
anychart.core.utils.SVGPathDataParser.prototype.initialCommandIsMoveTo = function() {
  // If the path is empty it is still valid, so return true.
  if (!this.hasMoreData()) {
    return true;
  }

  var command = this.peekSegmentType();
  // Path must start with moveTo.
  return command === 'M' || command === 'm';
};


/**
 * Whether is current char space.
 * @return {boolean}
 * @private
 */
anychart.core.utils.SVGPathDataParser.prototype.isCurrentSpace_ = function() {
  var char_ = this._string[this._currentIndex];
  return char_ <= ' ' && (char_ === ' ' || char_ === '\n' || char_ === '\t' || char_ === '\r' || char_ === '\f');
};


/**
 * Skip optional spaces.
 * @return {boolean}
 * @private
 */
anychart.core.utils.SVGPathDataParser.prototype.skipOptionalSpaces_ = function() {
  while (this._currentIndex < this._endIndex && this.isCurrentSpace_()) {
    this._currentIndex += 1;
  }

  return this._currentIndex < this._endIndex;
};


/**
 * Skip optional spaces or delimiter.
 * @return {boolean}
 */
anychart.core.utils.SVGPathDataParser.prototype.skipOptionalSpacesOrDelimiter = function() {
  if (
      this._currentIndex < this._endIndex && !this.isCurrentSpace_() &&
      this._string[this._currentIndex] !== ','
  ) {
    return false;
  }

  if (this.skipOptionalSpaces_()) {
    if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ',') {
      this._currentIndex += 1;
      this.skipOptionalSpaces_();
    }
  }
  return this._currentIndex < this._endIndex;
};


/**
 * Parse a number from an SVG path. This very closely follows genericParseNumber(...) from
 * Source/core/svg/SVGPathDataParserUtilities.cpp.
 * Spec: http://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF
 * @return {?number}
 * @private
 */
anychart.core.utils.SVGPathDataParser.prototype.parseNumber_ = function() {
  var exponent = 0;
  var integer = 0;
  var decimals = [];
  var sign = 1;
  var expsign = 1;
  var startIndex = this._currentIndex;

  this.skipOptionalSpaces_();

  // Read the sign.
  if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === '+') {
    this._currentIndex += 1;
  }
  else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === '-') {
    this._currentIndex += 1;
    sign = -1;
  }

  if (
      this._currentIndex === this._endIndex ||
      (
          (this._string[this._currentIndex] < '0' || this._string[this._currentIndex] > '9') &&
          this._string[this._currentIndex] !== '.'
      )
  ) {
    // The first character of a number must be one of [0-9+-.].
    return null;
  }

  // Read the integer part, build right-to-left.
  var startIntPartIndex = this._currentIndex;

  while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= '0' && this._string[this._currentIndex] <= '9') {
    this._currentIndex += 1; // Advance to first non-digit.
  }

  if (this._currentIndex !== startIntPartIndex) {
    var scanIntPartIndex = this._currentIndex - 1;
    var multiplier = 1;

    while (scanIntPartIndex >= startIntPartIndex) {
      integer += multiplier * (this._string[scanIntPartIndex] - '0');
      scanIntPartIndex -= 1;
      multiplier *= 10;
    }
  }

  // Read the decimals.
  if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === '.') {
    this._currentIndex += 1;

    // There must be a least one digit following the .
    if (
        this._currentIndex >= this._endIndex ||
        this._string[this._currentIndex] < '0' ||
        this._string[this._currentIndex] > '9'
    ) {
      return null;
    }

    while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= '0' && this._string[this._currentIndex] <= '9') {
      decimals.push(this._string[this._currentIndex] - '0');
      this._currentIndex += 1;
    }
  }

  // Read the exponent part.
  if (
      this._currentIndex !== startIndex &&
      this._currentIndex + 1 < this._endIndex &&
      (this._string[this._currentIndex] === 'e' || this._string[this._currentIndex] === 'E') &&
      (this._string[this._currentIndex + 1] !== 'x' && this._string[this._currentIndex + 1] !== 'm')
  ) {
    this._currentIndex += 1;

    // Read the sign of the exponent.
    if (this._string[this._currentIndex] === '+') {
      this._currentIndex += 1;
    }
    else if (this._string[this._currentIndex] === '-') {
      this._currentIndex += 1;
      expsign = -1;
    }

    // There must be an exponent.
    if (
        this._currentIndex >= this._endIndex ||
        this._string[this._currentIndex] < '0' ||
        this._string[this._currentIndex] > '9'
    ) {
      return null;
    }

    while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= '0' && this._string[this._currentIndex] <= '9') {
      exponent *= 10;
      exponent += (this._string[this._currentIndex] - '0');
      this._currentIndex += 1;
    }
  }

  var number = integer + parseFloat('0.' + decimals.join(''));
  number *= sign;

  if (exponent) {
    number *= Math.pow(10, expsign * exponent);
  }

  if (startIndex === this._currentIndex) {
    return null;
  }

  this.skipOptionalSpacesOrDelimiter();

  return /** @type {number} */(number);
};


/**
 * Parse arc flag.
 * @return {?number}
 * @private
 */
anychart.core.utils.SVGPathDataParser.prototype.parseArcFlag_ = function() {
  if (this._currentIndex >= this._endIndex) {
    return null;
  }

  var flag = null;
  var flagChar = this._string[this._currentIndex];

  this._currentIndex += 1;

  if (flagChar === '0') {
    flag = 0;
  }
  else if (flagChar === '1') {
    flag = 1;
  }
  else {
    return null;
  }

  this.skipOptionalSpacesOrDelimiter();
  return flag;
};
