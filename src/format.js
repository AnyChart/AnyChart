goog.provide('anychart.format');
goog.require('anychart.math');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.TimeZone');
goog.require('goog.string');

/**
 * Namespace for format.
 * @namespace
 * @name anychart.format
 */


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
anychart.format.subs = goog.string.subs;


/**
 * Caches of static datetime formatter.
 * @type {Object.<string, goog.i18n.DateTimeFormat>}
 * @private
 */
anychart.format.formatDateTimeCache_ = {};


/**
 * Cache if zero timezone.
 * @type {Object.<number, goog.i18n.TimeZone>}
 * @private
 */
anychart.format.UTCTimeZoneCache_ = {};


/**
 * Formats date by pattern.
 * @param {number|Date} date UTC timestamp or Date object.
 * @param {string=} opt_pattern ['yyyy.MM.dd'].
 * @param {number=} opt_timeZone Adjust with time zone. Indicate
 * minutes WEST of UTC to be used as a constant time zone offset.
 * @return {string}
 */
anychart.format.dateTime = function(date, opt_pattern, opt_timeZone) {
  opt_timeZone = opt_timeZone || 0;
  /** @type {goog.i18n.DateTimeFormat} */
  var formatter;
  var pattern = opt_pattern || 'yyyy.MM.dd';
  if (pattern in anychart.format.formatDateTimeCache_)
    formatter = anychart.format.formatDateTimeCache_[pattern];
  else
    formatter = anychart.format.formatDateTimeCache_[pattern] = new goog.i18n.DateTimeFormat(pattern);

  var timeZone;
  if (opt_timeZone in anychart.format.UTCTimeZoneCache_)
    timeZone = anychart.format.UTCTimeZoneCache_[opt_timeZone];
  else
    timeZone = anychart.format.UTCTimeZoneCache_[opt_timeZone] = goog.i18n.TimeZone.createTimeZone(opt_timeZone);

  date = goog.isNumber(date) ? new Date(date) : date;

  return formatter.format(date, timeZone);
};


/**
 * Default scale settings.
 * @type {{factors:Array.<number>,suffixes:Array.<string>}}
 * @private
 */
anychart.format.DEFAULT_SCALE_ = {
  'factors': [1e15, 1e12, 1e9, 1e6, 1e3, 1, 1e-3, 1e-6, 1e-9],
  'suffixes': ['P', 'T', 'G', 'M', 'K', '', 'm', 'u', 'n']
};


/**
 * Formats number with given settings.
 * @param {number} number
 * @param {(number|Object)=} opt_decimalsCountOrSettings
 * @param {string=} opt_decimalPoint
 * @param {string=} opt_groupsSeparator
 * @param {({factors:Array.<number>,suffixes:Array.<string>}|boolean)=} opt_scale
 * @param {boolean=} opt_zeroFillDecimals
 * @param {string=} opt_scaleSuffixSeparator
 * @return {string}
 */
anychart.format.number = function(number, opt_decimalsCountOrSettings, opt_decimalPoint, opt_groupsSeparator,
    opt_scale, opt_zeroFillDecimals, opt_scaleSuffixSeparator) {
  var obj = goog.isObject(opt_decimalsCountOrSettings) ? opt_decimalsCountOrSettings : null;
  var decimalsCount = goog.isNumber(opt_decimalsCountOrSettings) ?
      opt_decimalsCountOrSettings :
      (obj && goog.isNumber(obj['decimalsCount'])) ?
          obj['decimalsCount'] :
          2;
  var decimalPoint = goog.isString(opt_decimalPoint) ?
      opt_decimalPoint :
      (obj && goog.isString(obj['decimalPoint'])) ?
          obj['decimalPoint'] :
          '.';
  var groupsSeparator = goog.isString(opt_groupsSeparator) ?
      opt_groupsSeparator :
      (obj && goog.isString(obj['groupsSeparator'])) ?
          obj['groupsSeparator'] :
          '';
  var scale = (goog.isObject(opt_scale) || goog.isBoolean(opt_scale)) ?
      opt_scale :
      (obj && (goog.isObject(obj['scale']) || goog.isBoolean(obj['scale']))) ?
          obj['scale'] :
          false;
  var zeroFillDecimals = goog.isBoolean(opt_zeroFillDecimals) ?
      opt_zeroFillDecimals :
      (obj && goog.isBoolean(obj['zeroFillDecimals'])) ?
          obj['zeroFillDecimals'] :
          false;
  var scaleSuffixSeparator = goog.isString(opt_scaleSuffixSeparator) ?
      opt_scaleSuffixSeparator :
      (obj && goog.isString(obj['scaleSuffixSeparator'])) ?
          obj['scaleSuffixSeparator'] :
          '';
  if (scale === true)
    scale = anychart.format.DEFAULT_SCALE_;

  var originalNumber = number;
  var negative = number < 0;
  if (negative)
    number = -number;
  var suffix = '';
  if (goog.isObject(scale) && goog.isArray(scale['factors']) && goog.isArray(scale['suffixes'])) {
    var factor = 1;
    var factors = scale['factors'];
    var suffixes = scale['suffixes'];
    var len = Math.min(factors.length, suffixes.length);
    for (var i = 0; i < len; i++) {
      factor = factors[i];
      if (number >= factor || (factor <= 1 && number > 0.1 * factor)) {
        // Treat values less than 1 differently, allowing 0.5 to be "0.5" rather
        // than "500m"
        suffix = suffixes[i];
        break;
      }
    }
    if (suffix) {
      suffix = scaleSuffixSeparator + suffix;
    } else {
      factor = 1;
    }
    number = originalNumber / factor;
  }

  var stringNumber = zeroFillDecimals ?
      number.toFixed(decimalsCount) :
      anychart.math.round(number, decimalsCount).toString();
  var eString = '';
  var parts;
  // if string like "1.23e+45"
  if (/(e+|e-)/.test(stringNumber)) {
    parts = stringNumber.split('e');
    stringNumber = parts[0];
    eString = 'e' + parts[1];
  }
  parts = stringNumber.split('.');
  if (groupsSeparator) {
    var s = parts[0];
    var newParts = [];
    var rest;
    while ((rest = s.substr(0, s.length - 3)).length > 0) {
      newParts.unshift(s.substr(-3));
      s = rest;
    }
    if (s)
      newParts.unshift(s);
    // newParts.length always at least will be non-zero (min = 1)
    parts[0] = newParts.join(groupsSeparator);
  }
  return parts.join(decimalPoint) + eString + suffix;
};


//exports
goog.exportSymbol('anychart.format.subs', anychart.format.subs);
goog.exportSymbol('anychart.format.dateTime', anychart.format.dateTime);
goog.exportSymbol('anychart.format.number', anychart.format.number);
