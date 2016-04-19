goog.provide('anychart.format');
goog.require('anychart.math');
goog.require('anychart.utils');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.i18n.TimeZone');
goog.require('goog.string');

/**
 * Namespace for format.
 * @namespace
 * @name anychart.format
 */


/**
 * @typedef {{
 *  decimalsCount: number,
 *  decimalPoint: string,
 *  groupsSeparator: string,
 *  scale: ({factors:Array.<number>,suffixes:Array.<string>}|boolean),
 *  zeroFillDecimals: boolean,
 *  scaleSuffixSeparator: string,
 *  useBracketsForNegative: boolean
 * }}
 */
anychart.format.NumberLocale;


/**
 * @typedef {{
 *  eras: Array.<string>,
 *  erasNames: Array.<string>,
 *  narrowMonths: Array.<string>,
 *  standaloneNarrowMonths: Array.<string>,
 *  shortMonths: Array.<string>,
 *  standaloneShortMonths: Array.<string>,
 *  months: Array.<string>,
 *  standaloneMonths: Array.<string>,
 *  weekdays: Array.<string>,
 *  narrowWeekdays: Array.<string>,
 *  standaloneNarrowWeekdays: Array.<string>,
 *  shortWeekdays: Array.<string>,
 *  standaloneShortWeekdays: Array.<string>,
 *  standaloneWeekdays: Array.<string>,
 *  shortQuarters: Array.<string>,
 *  quarters: Array.<string>,
 *  ampms: Array.<string>,
 *  dateFormats: Array.<string>,
 *  timeFormats: Array.<string>,
 *  dateTimeFormats: Array.<string>,
 *  firstDayOfWeek: number,
 *  weekendRange: Array.<number>,
 *  firstWeekCutOfDay: number
 * }}
 */
anychart.format.DateTimeLocale;


/**
 * @typedef {{
 *  dateTimeLocale: anychart.format.DateTimeLocale,
 *  numberLocale: anychart.format.NumberLocale
 * }}
 */
anychart.format.Locale;


/**
 * Regular expression for detecting scaling units, such as K, M, G, etc. for
 * converting a string representation to a numeric value.
 *
 * @type {RegExp}
 * @private
 */
anychart.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)(.*?)?$/;


/**
 * Locales map.
 * @type {Object.<string, anychart.format.Locale>}
 */
goog.global['anychart'] = goog.global['anychart'] || {};
goog.global['anychart']['format'] = goog.global['anychart']['format'] || {};
goog.global['anychart']['format']['locales'] = {
  'default': {
    'dateTimeLocale': {
      'eras': ['BC', 'AD'],
      'erasNames': ['Before Christ', 'Anno Domini'],
      'narrowMonths': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      'standaloneNarrowMonths': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
        'N', 'D'],
      'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'],
      'standaloneMonths': ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'],
      'standaloneShortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      'weekdays': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
        'Saturday'],
      'standaloneWeekdays': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday'],
      'shortWeekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'standaloneShortWeekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'narrowWeekdays': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      'standaloneNarrowWeekdays': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      'shortQuarters': ['Q1', 'Q2', 'Q3', 'Q4'],
      'quarters': ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
      'ampms': ['AM', 'PM'],
      'dateFormats': ['EEEE, y MMMM dd', 'y MMMM d', 'y MMM d', 'yyyy-MM-dd'],
      'timeFormats': ['HH:mm:ss v', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
      'dateTimeFormats': ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
      'firstDayOfWeek': 0,
      'weekendRange': [5, 6],
      'firstWeekCutOfDay': 3
    },
    'numberLocale': {
      'decimalsCount': 2,
      'decimalPoint': '.',
      'groupsSeparator': '',
      'scale': false,
      'zeroFillDecimals': false,
      'scaleSuffixSeparator': '',
      'useBracketsForNegative': false
    }
  }
};


/**
 * Input format setting to be used.
 * @type {string|anychart.format.Locale}
 * @private
 */
anychart.format.inputLocale_ = 'default';


/**
 * Input date time format.
 * @type {?string}
 * @private
 */
anychart.format.inputDateTimeFormat_ = null;


/**
 * Output format setting to be used.
 * @type {string|anychart.format.Locale}
 * @private
 */
anychart.format.outputLocale_ = 'default';


/**
 * Output date time format.
 * @type {string}
 * @private
 */
anychart.format.outputDateTimeFormat_ = 'yyyy.MM.dd';


/**
 * Actually is output offset in minutes.
 * @type {number}
 * @private
 */
anychart.format.outputTimezone_ = 0;


/**
 * Input format setting to be used.
 * @param {(string|anychart.format.Locale)=} opt_value
 * @return {string|anychart.format.Locale}
 */
anychart.format.inputLocale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value) || goog.isObject(opt_value)) {
      anychart.format.inputLocale_ = opt_value;
    }
  }
  return anychart.format.inputLocale_;
};


/**
 * Input date time format.
 * @param {?string=} opt_value - Value to be set. If is null, input value will be interpreted
 *  as timestamp or string representation of timestamp.
 * @return {?string}
 */
anychart.format.inputDateTimeFormat = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.format.inputDateTimeFormat_ = opt_value;
  }
  return anychart.format.inputDateTimeFormat_;
};


/**
 * Output format setting to be used.
 * @param {(string|anychart.format.Locale)=} opt_value
 * @return {string|anychart.format.Locale}
 */
anychart.format.outputLocale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value) || goog.isObject(opt_value)) {
      anychart.format.outputLocale_ = opt_value;
    }
  }
  return anychart.format.outputLocale_;
};


/**
 * Output date time format.
 * @param {string=} opt_value
 * @return {string}
 */
anychart.format.outputDateTimeFormat = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.format.outputDateTimeFormat_ = String(opt_value);
  }
  return anychart.format.outputDateTimeFormat_;
};


/**
 * Actually is output offset in minutes.
 * @param {number=} opt_value
 * @return {number}
 */
anychart.format.outputTimezone = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.format.outputTimezone_ = anychart.utils.toNumber(opt_value) || 0;
  }
  return anychart.format.outputTimezone_;
};


/**
 * Turns incoming locale to date time symbols suitable to closure library.
 * @param {anychart.format.Locale=} opt_locale - Incoming locale.
 * @private
 * @return {!Object} - Date time symbols.
 */
anychart.format.localeToDateTimeSymbols_ = function(opt_locale) {
  var def = goog.global['anychart']['format']['locales']['default']['dateTimeLocale'];
  opt_locale = opt_locale || def;
  return {
    ERAS: opt_locale['eras'] || def['eras'],
    ERANAMES: opt_locale['erasNames'] || def['erasNames'],
    NARROWMONTHS: opt_locale['narrowMonths'] || def['narrowMonths'],
    STANDALONENARROWMONTHS: opt_locale['standaloneNarrowMonths'] || def['standaloneNarrowMonths'],
    MONTHS: opt_locale['months'] || def['months'],
    STANDALONEMONTHS: opt_locale['standaloneMonths'] || def['standaloneMonths'],
    SHORTMONTHS: opt_locale['shortMonths'] || def['shortMonths'],
    STANDALONESHORTMONTHS: opt_locale['standaloneShortMonths'] || def['standaloneShortMonths'],
    WEEKDAYS: opt_locale['weekdays'] || def['weekdays'],
    STANDALONEWEEKDAYS: opt_locale['standaloneWeekdays'] || def['standaloneWeekdays'],
    SHORTWEEKDAYS: opt_locale['shortWeekdays'] || def['shortWeekdays'],
    STANDALONESHORTWEEKDAYS: opt_locale['standaloneShortWeekdays'] || def['standaloneShortWeekdays'],
    NARROWWEEKDAYS: opt_locale['narrowWeekdays'] || def['narrowWeekdays'],
    STANDALONENARROWWEEKDAYS: opt_locale['standaloneNarrowWeekdays'] || def['standaloneNarrowWeekdays'],
    SHORTQUARTERS: opt_locale['shortQuarters'] || def['shortQuarters'],
    QUARTERS: opt_locale['quarters'] || def['quarters'],
    AMPMS: opt_locale['ampms'] || def['ampms'],
    DATEFORMATS: opt_locale['dateFormats'] || def['dateFormats'],
    TIMEFORMATS: opt_locale['timeFormats'] || def['timeFormats'],
    DATETIMEFORMATS: opt_locale['dateTimeFormats'] || def['dateTimeFormats'],
    FIRSTDAYOFWEEK: goog.isDef(opt_locale['firstDayOfWeek']) ? opt_locale['firstDayOfWeek'] : def['firstDayOfWeek'],
    WEEKENDRANGE: opt_locale['weekendRange'] || def['weekendRange'],
    FIRSTWEEKCUTOFFDAY: goog.isDef(opt_locale['firstWeekCutOfDay']) ? opt_locale['firstWeekCutOfDay'] : def['firstWeekCutOfDay']
  };
};


/**
 * Gets locale object.
 * @param {*} locale - Locale settings or name of preset.
 * @private
 * @return {?Object} - Locale object or null if something's wrong.
 */
anychart.format.normalizeNumberLocale_ = function(locale) {
  var locales = goog.global['anychart']['format']['locales'];
  if (goog.isString(locale)) {
    var loc = locales[locale] || locales['default'];
    locale = (loc && loc['numberLocale']) ? loc['numberLocale'] : null;
  }
  return goog.isObject(locale) ? locale : null;
};


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
 * Caches of static datetime parser.
 * @type {Object.<string, goog.i18n.DateTimeParse>}
 * @private
 */
anychart.format.parseDateTimeCache_ = {};


/**
 * Cache if zero timezone.
 * @type {Object.<number, goog.i18n.TimeZone>}
 * @private
 */
anychart.format.UTCTimeZoneCache_ = {};


/**
 * Formats date by pattern.
 * @param {number|Date} date UTC timestamp or Date object.
 * @param {string=} opt_format ['yyyy.MM.dd'].
 * @param {number=} opt_timeZone Adjust with time zone. Indicate
 * minutes WEST of UTC to be used as a constant time zone offset.
 * @param {(string|anychart.format.Locale)=} opt_locale - Locale to be used.
 * @return {string}
 */
anychart.format.dateTime = function(date, opt_format, opt_timeZone, opt_locale) {
  var locale = opt_locale || anychart.format.outputLocale_;

  if (goog.isString(locale)) {
    //Here locale MUST become an object.
    var locales = goog.global['anychart']['format']['locales'];
    locale = locales[locale] || locales['default'];
    locale = locale && locale['dateTimeLocale'];
  }

  var localeHash = goog.getUid(locale);

  /** @type {goog.i18n.DateTimeFormat} */
  var formatter;
  var pattern = opt_format || anychart.format.outputDateTimeFormat_;
  var formatterCacheKey = pattern + localeHash;
  if (formatterCacheKey in anychart.format.formatDateTimeCache_) {
    formatter = anychart.format.formatDateTimeCache_[formatterCacheKey];
  } else {
    var symbols = anychart.format.localeToDateTimeSymbols_(locale);
    formatter = anychart.format.formatDateTimeCache_[formatterCacheKey] = new goog.i18n.DateTimeFormat(pattern, symbols);
  }

  var timeZone;
  opt_timeZone = opt_timeZone || anychart.format.outputTimezone_;
  if (opt_timeZone in anychart.format.UTCTimeZoneCache_)
    timeZone = anychart.format.UTCTimeZoneCache_[opt_timeZone];
  else
    timeZone = anychart.format.UTCTimeZoneCache_[opt_timeZone] = goog.i18n.TimeZone.createTimeZone(opt_timeZone);

  date = goog.isNumber(date) ? new Date(date) : date;

  return formatter.format(date, timeZone);
};


/**
 * Parses input value to date.
 * @param {*} value - Input value.
 * @param {string=} opt_format - Format to be parsed. If is undefined, anychart.format.inputDateTimeFormat will be used.
 * @param {Date=} opt_dateHolder - Date object to hold the parsed date. Used for case if input value doesn't contain
 *  information about year or month or something like that. If parsing process ends successfully, this object will
 *  contain totally the same values of date time units as return value.
 *  NOTE: If is undefined, Date.UTC(currentYear, currentMoth) will be used.
 * @param {(string|anychart.format.Locale)=} opt_locale - Locale to be used. If not set, anychart.format.inputLocale will
 *  be used.
 * @return {?Date} - Parsed date or null if got wrong input value.
 */
anychart.format.parseDateTime = function(value, opt_format, opt_dateHolder, opt_locale) {
  var locales = goog.global['anychart']['format']['locales'];
  if (goog.isDateLike(value)) {
    return /** @type {Date} */ (value);
  } else if (goog.isNumber(value)) {
    if (isNaN(value)) {
      anychart.utils.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value]);
      return null;
    } else {
      return new Date(value);
    }
  } else if (goog.isString(value)) {
    if (!anychart.format.inputDateTimeFormat_) { //null or '' literally means that we interpret value as timestamp.
      var numValue = +value;
      var newDate = new Date(isNaN(numValue) ? value : numValue);
      if (isNaN(newDate.getTime())) { //Got string not in ISO8601 format.
        anychart.utils.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value]);
        return null; // Parsing error.
      } else {
        return newDate;
      }
    } else {
      var locale = opt_locale || anychart.format.inputLocale_;

      if (goog.isString(locale)) {
        //Here locale MUST become an object.
        locale = locales[locale] || locales['default'];
        locale = locale && locale['dateTimeLocale'];
      }

      var localeHash = goog.getUid(locale);

      /** @type {goog.i18n.DateTimeParse} */
      var parser;
      //Here anychart.format.inputDateTimeFormat_ is string and not null.
      var pattern = opt_format || anychart.format.inputDateTimeFormat_;

      var parserCacheKey = pattern + localeHash;

      if (parserCacheKey in anychart.format.formatDateTimeCache_) {
        parser = anychart.format.parseDateTimeCache_[parserCacheKey];
      } else {
        var symbols = anychart.format.localeToDateTimeSymbols_(locale);
        parser = anychart.format.parseDateTimeCache_[parserCacheKey] = new goog.i18n.DateTimeParse(pattern, symbols);
      }

      /** @type {Date} */
      var date;
      if (goog.isDateLike(opt_dateHolder)) {
        date = /** @type {Date} */ (opt_dateHolder);
      } else {
        var currDate = new Date();
        currDate.setTime(Date.UTC(currDate.getFullYear(), currDate.getUTCMonth()));
        date = currDate;
      }

      var valueLength = value.length;
      var resultLength = parser.parse(value, date, 0);

      if (valueLength == resultLength) {//parsing successful.
        return /** @type {Date} */ (date);
      } else {
        anychart.utils.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value, resultLength], true);
        return null;
      }
    }
  } else {
    anychart.utils.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value]);
    return null;
  }
};


/**
 * Default scale settings.
 * NOTE: Lower case 'k' is added as in goog.format.NUMERIC_SCALES_SI_.
 * @type {{factors:Array.<number>,suffixes:Array.<string>}}
 * @private
 */
anychart.format.DEFAULT_SCALE_ = {
  'factors': [1e15, 1e12, 1e9, 1e6, 1e3, 1e3, 1, 1e-3, 1e-6, 1e-9],
  'suffixes': ['P', 'T', 'G', 'M', 'K', 'k', '', 'm', 'u', 'n']
};


/**
 * Formats number with given settings.
 * @param {number} number
 * @param {(number|anychart.format.NumberLocale|string)=} opt_decimalsCountOrLocale
 * @param {string=} opt_decimalPoint
 * @param {string=} opt_groupsSeparator
 * @param {({factors:Array.<number>,suffixes:Array.<string>}|boolean)=} opt_scale
 * @param {boolean=} opt_zeroFillDecimals
 * @param {string=} opt_scaleSuffixSeparator
 * @param {boolean=} opt_useBracketsForNegative
 * @return {string}
 */
anychart.format.number = function(number, opt_decimalsCountOrLocale, opt_decimalPoint, opt_groupsSeparator,
    opt_scale, opt_zeroFillDecimals, opt_scaleSuffixSeparator, opt_useBracketsForNegative) {
  var obj = anychart.format.normalizeNumberLocale_(opt_decimalsCountOrLocale);
  var locale = anychart.format.normalizeNumberLocale_(anychart.format.outputLocale_); //Guaranteed default number output locale.

  var decimalsCount = goog.isNumber(opt_decimalsCountOrLocale) ?
      opt_decimalsCountOrLocale :
      (obj && goog.isNumber(obj['decimalsCount'])) ?
          obj['decimalsCount'] :
          locale['decimalsCount'];
  var decimalPoint = goog.isString(opt_decimalPoint) ?
      opt_decimalPoint :
      (obj && goog.isString(obj['decimalPoint'])) ?
          obj['decimalPoint'] :
          locale['decimalPoint'];
  var groupsSeparator = goog.isString(opt_groupsSeparator) ?
      opt_groupsSeparator :
      (obj && goog.isString(obj['groupsSeparator'])) ?
          obj['groupsSeparator'] :
          locale['groupsSeparator'];
  var scale = (goog.isObject(opt_scale) || goog.isBoolean(opt_scale)) ?
      opt_scale :
      (obj && (goog.isObject(obj['scale']) || goog.isBoolean(obj['scale']))) ?
          obj['scale'] :
          locale['scale'];
  var zeroFillDecimals = goog.isBoolean(opt_zeroFillDecimals) ?
      opt_zeroFillDecimals :
      (obj && goog.isBoolean(obj['zeroFillDecimals'])) ?
          obj['zeroFillDecimals'] :
          locale['zeroFillDecimals'];
  var scaleSuffixSeparator = goog.isString(opt_scaleSuffixSeparator) ?
      opt_scaleSuffixSeparator :
      (obj && goog.isString(obj['scaleSuffixSeparator'])) ?
          obj['scaleSuffixSeparator'] :
          locale['scaleSuffixSeparator'];
  var useBracketsForNegative = goog.isBoolean(opt_useBracketsForNegative) ?
      opt_useBracketsForNegative :
      (obj && goog.isBoolean(obj['useBracketsForNegative'])) ?
          obj['useBracketsForNegative'] :
          locale['useBracketsForNegative'];
  if (scale === true)
    scale = anychart.format.DEFAULT_SCALE_;

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
    number /= factor;
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

  var minus = negative ? '-' : '';
  var result = parts.join(decimalPoint) + eString + suffix;
  if (negative && useBracketsForNegative) {
    result = ['(', result, ')'].join('');
    minus = '';
  }
  return minus + result;
};


/**
 * Parses passed value to number considering locale.
 * @param {*} value - Value to be parsed.
 * @param {(anychart.format.NumberLocale|string)=} opt_locale - Number locale to be used. If not
 *  defined, anychart.format.input.numberFormat will be used.
 * @return {number} - Parsed value. NaN if value could not be parsed.
 */
anychart.format.parseNumber = function(value, opt_locale) {
  var locale = anychart.format.normalizeNumberLocale_(opt_locale);
  var defLoc = anychart.format.normalizeNumberLocale_(anychart.format.inputLocale_); //Guaranteed default locale.

  var decimalsCount = (locale && goog.isNumber(locale['decimalsCount'])) ?
      locale['decimalsCount'] :
      defLoc['decimalsCount'];

  var decimalPoint = (locale && goog.isString(locale['decimalPoint'])) ?
      locale['decimalPoint'] :
      defLoc['decimalPoint'];

  var groupsSeparator = (locale && goog.isString(locale['groupsSeparator'])) ?
      locale['groupsSeparator'] :
      defLoc['groupsSeparator'];

  var scale = (locale && (goog.isObject(locale['scale']) || goog.isBoolean(locale['scale']))) ?
      locale['scale'] :
      defLoc['scale'];

  var scaleSuffixSeparator = (locale && goog.isString(locale['scaleSuffixSeparator'])) ?
      locale['scaleSuffixSeparator'] :
      defLoc['scaleSuffixSeparator'];

  var useBracketsForNegative = (locale && goog.isDef(locale['useBracketsForNegative'])) ?
      !!locale['useBracketsForNegative'] :
      !!defLoc['useBracketsForNegative'];

  var negative = 1;

  if (goog.isString(value)) {
    var re = new RegExp(goog.string.regExpEscape(decimalPoint), 'g'); //this construction is taken from goog.string.replace().

    if (useBracketsForNegative) { //replacing brackets
      if (value.charAt(0) == '(' && value.charAt(value.length - 1) == ')') {
        //NOTE: Incoming value "(5)" becomes -5 and "(-5)" becomes 5 (negative of negative).
        negative = -1;
        value = value.substring(1, value.length - 1);
      }
    }

    value = value.replace(re, '.'); //replacing decimalPoint with JS default symbol.

    value = goog.string.removeAll(value, groupsSeparator); //replacing groupsSeparator.

    if (scale === true)
      scale = anychart.format.DEFAULT_SCALE_;

    if (goog.isObject(scale) && goog.isArray(scale['factors']) && goog.isArray(scale['suffixes'])) {
      value = goog.string.removeAll(value, scaleSuffixSeparator); //replacing scaleSuffixSeparator.

      var match = value.match(anychart.format.SCALED_NUMERIC_RE_);
      if (!match)
        return NaN;

      var factor = 1;

      value = +match[1];
      var suff = match[2];
      if (suff) {
        var factors = scale['factors'];
        var suffixes = scale['suffixes'];
        var len = Math.min(factors.length, suffixes.length);

        for (var i = 0; i < len; i++) {
          if (suff == suffixes[i]) {
            factor = factors[i];
            break;
          }
        }
      }

      value *= factor;
    }

  }
  var result = +/** @type {number} */ (value);
  result *= negative;
  return isNaN(result) ? result : anychart.math.round(result, decimalsCount);
};


//exports
goog.exportSymbol('anychart.format.subs', anychart.format.subs);
goog.exportSymbol('anychart.format.dateTime', anychart.format.dateTime);
goog.exportSymbol('anychart.format.parseDateTime', anychart.format.parseDateTime);
goog.exportSymbol('anychart.format.number', anychart.format.number);
goog.exportSymbol('anychart.format.parseNumber', anychart.format.parseNumber);
goog.exportSymbol('anychart.format.inputLocale', anychart.format.inputLocale);
goog.exportSymbol('anychart.format.outputLocale', anychart.format.outputLocale);
goog.exportSymbol('anychart.format.inputDateTimeFormat', anychart.format.inputDateTimeFormat);
goog.exportSymbol('anychart.format.outputDateTimeFormat', anychart.format.outputDateTimeFormat);
goog.exportSymbol('anychart.format.outputTimezone', anychart.format.outputTimezone);
