goog.provide('anychart.format');

goog.require('anychart.enums');
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


//region --- Locale type definitions
//------------------------------------------------------------------------------
//
//  Locale type definitions
//
//------------------------------------------------------------------------------
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
 *  firstDayOfWeek: number,
 *  weekendRange: Array.<number>,
 *  firstWeekCutOfDay: number,
 *  formats: Object.<string|Array.<string>>,
 *  dateFormat: string,
 *  timeFormat: string,
 *  dateTimeFormat: string
 * }}
 */
anychart.format.DateTimeLocale;


/**
 * @typedef {{
 *  dateTimeLocale: anychart.format.DateTimeLocale,
 *  numberLocale: anychart.format.NumberLocale,
 *  messages: Object.<string, string>
 * }}
 */
anychart.format.Locale;


//endregion
//region --- Default locale
//------------------------------------------------------------------------------
//
//  Default locale
//
//------------------------------------------------------------------------------
goog.exportSymbol('anychart.format.locales.default.dateTimeLocale', {
  'eras': ['BC', 'AD'],
  'eraNames': ['Before Christ', 'Anno Domini'],
  'narrowMonths': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  'standaloneNarrowMonths': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  'standaloneMonths': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  'standaloneShortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  'weekdays': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'standaloneWeekdays': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'shortWeekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'standaloneShortWeekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'narrowWeekdays': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  'standaloneNarrowWeekdays': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  'shortQuarters': ['Q1', 'Q2', 'Q3', 'Q4'],
  'quarters': ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  'ampms': ['AM', 'PM'],
  'firstDayOfWeek': 0,
  'weekendRange': [5, 6],
  'firstWeekCutOffDay': 3,
  'dateFormat': 'y MMM d',
  'timeFormat': 'HH:mm:ss',
  'dateTimeFormat': 'y MMM d \'at\' HH:mm:ss',
  'formats': {
    'full_year': 'yyyy',
    'full_year_semester': 'MMM yyyy',
    'full_year_quarter': 'MMM yyyy',
    'full_year_month': 'MMM yyyy',
    'full_year_third_of_month': 'dd MMM yyyy',
    'full_year_week': 'dd MMM yyyy',
    'full_year_day': 'dd MMM yyyy',
    'full_year_hour': 'HH dd MMM yyyy',
    'full_year_minute': 'dd MMM yyyy, HH:mm',
    'full_year_second': 'dd MMM yyyy, HH:mm:ss',
    'full_year_millisecond': 'dd MMM yyyy, HH:mm:ss.SSS',
    'timeline_year': ['yyyy', 'yy'],
    'timeline_year_semester': ['MMMM yyyy', 'MMM \'\'yyyy', 'MMM \'\'yy', 'MM \'\'yy'],
    'timeline_year_quarter': ['MMMM yyyy', 'MMM \'\'yyyy', 'MMM \'\'yy', 'MM \'\'yy'],
    'timeline_year_month': ['MMMM yyyy', 'MMM \'\'yyyy', 'MMM \'\'yy', 'MM \'\'yy'],
    'timeline_year_third_of_month': ['EEEE, dd MMMM yyyy', 'EE, dd MMM yyyy', 'EE, dd MMM yy', 'dd MMM yyyy', 'dd MMMM yy', 'MM.dd.yyyy', 'MM.dd.yy'],
    'timeline_year_week': ['EEEE, dd MMMM yyyy', 'EE, dd MMM yyyy', 'EE, dd MMM yy', 'dd MMM yyyy', 'dd MMMM yy', 'MM.dd.yyyy', 'MM.dd.yy'],
    'timeline_year_day': ['EEEE, dd MMMM yyyy', 'EE, dd MMM yyyy', 'EE, dd MMM yy', 'dd MMM yyyy', 'dd MMMM yy', 'MM.dd.yyyy', 'MM.dd.yy'],
    'timeline_semester': ['MMMM', 'MMM', 'MM'],
    'timeline_semester_quarter': ['MMMM', 'MMM', 'MM'],
    'timeline_semester_month': ['MMMM', 'MMM', 'MM'],
    'timeline_semester_third_of_month': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_semester_week': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_semester_day': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_quarter': ['MMMM', 'MMM', 'MM'],
    'timeline_quarter_month': ['MMMM', 'MMM', 'MM'],
    'timeline_quarter_third_of_month': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_quarter_week': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_quarter_day': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_month': ['MMMM', 'MMM', 'MM'],
    'timeline_month_third_of_month': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_month_week': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_month_day': ['EEEE, dd MMMM', 'EE, dd MMM', 'EE, dd MMM', 'dd MMM', 'dd MMMM', 'MM.dd', 'MM.dd'],
    'timeline_third_of_month': ['dd'],
    'timeline_third_of_month_week': ['dd'],
    'timeline_third_of_month_day': ['EEEE, dd', 'EE, dd', 'dd'],
    'timeline_week': ['dd'],
    'timeline_week_day': ['EEEE, dd', 'EE, dd', 'dd'],
    'timeline_day': ['EEEE, dd', 'EEEE', 'EE, dd', 'EE', 'dd'],
    'year': 'yyyy',
    'year_semester': 'yyyy MMM',
    'year_quarter': 'yyyy MMM',
    'year_month': 'yyyy MMM',
    'year_third_of_month': 'MMM dd',
    'year_week': 'MMM dd',
    'year_day': 'MMM dd',
    'year_hour': 'MMM-dd HH',
    'year_minute': 'dd HH:mm',
    'year_second': 'HH:mm:ss',
    'year_millisecond': 'HH:mm:ss.SSS',
    'semester': 'MMM',
    'semester_quarter': 'MMM',
    'semester_month': 'MMM',
    'semester_third_of_month': 'dd',
    'semester_week': 'dd',
    'semester_day': 'dd',
    'semester_hour': 'HH',
    'semester_minute': 'HH:mm',
    'semester_second': 'HH:mm:ss',
    'semester_millisecond': 'SSS',
    'quarter': 'MMM',
    'quarter_month': 'MMM',
    'quarter_third_of_month': 'dd',
    'quarter_week': 'dd',
    'quarter_day': 'dd',
    'quarter_hour': 'HH',
    'quarter_minute': 'HH:mm',
    'quarter_second': 'HH:mm:ss',
    'quarter_millisecond': 'SSS',
    'month': 'MMM',
    'month_third_of_month': 'dd',
    'month_week': 'dd',
    'month_day': 'dd',
    'month_hour': 'HH',
    'month_minute': 'HH:mm',
    'month_second': 'HH:mm:ss',
    'month_millisecond': 'SSS',
    'third_of_month': 'dd',
    'third_of_month_week': 'dd',
    'third_of_month_day': 'dd',
    'third_of_month_hour': 'HH',
    'third_of_month_minute': 'HH:mm',
    'third_of_month_second': 'HH:mm:ss',
    'third_of_month_millisecond': 'SSS',
    'week': 'dd',
    'week_day': 'dd',
    'week_hour': 'HH',
    'week_minute': 'HH:mm',
    'week_second': 'HH:mm:ss',
    'week_millisecond': 'SSS',
    'day': 'dd',
    'day_hour': 'HH',
    'day_minute': 'HH:mm',
    'day_second': 'HH:mm:ss',
    'day_millisecond': 'SSS',
    'hour': 'HH',
    'hour_minute': 'HH:mm',
    'hour_second': 'HH:mm:ss',
    'hour_millisecond': 'SSS',
    'minute': 'HH:mm',
    'minute_second': 'HH:mm:ss',
    'minute_millisecond': 'SSS',
    'second': 'HH:mm:ss',
    'second_millisecond': 'SSS',
    'millisecond': 'SSS',

    'timelineHeader_year': 'yyyy',
    'timelineHeader_year_month': 'MMMM, yyyy',
    'timelineHeader_year_week': 'dd MMM yy',
    'timelineHeader_year_quarter': 'MMM yyyy',
    'timelineHeader_year_day': 'dd MMM yy',
    'timelineHeader_quarter_month': 'MMMM',
    'timelineHeader_month_week': 'dd-MMM',
    'timelineHeader_week_day': 'd MMM, EEE',
    'timelineHeader_day_hour': 'HH:mm',
    'timelineHeader_hour_minute': 'H:mm'
  }
});
goog.exportSymbol('anychart.format.locales.default.numberLocale', {
  'decimalsCount': 1,
  'decimalPoint': '.',
  'groupsSeparator': '',
  'scale': false,
  'zeroFillDecimals': false,
  'scaleSuffixSeparator': '',
  'useBracketsForNegative': false
});
goog.exportSymbol('anychart.format.locales.default.messages', {});


//endregion
//region --- Namespace private members
//------------------------------------------------------------------------------
//
//  Namespace private members
//
//------------------------------------------------------------------------------
/**
 * Regular expression for detecting scaling units, such as K, M, G, etc. for
 * converting a string representation to a numeric value.
 *
 * @type {RegExp}
 * @private
 */
anychart.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)(.*?)?$/;


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
 * Input format setting to be used.
 * @type {!(string|anychart.format.Locale)}
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
 * Input base date. See anychart.format.inputBaseDate() for details.
 * @type {number}
 * @private
 */
anychart.format.inputBaseDate_ = NaN;


/**
 * Output format setting to be used.
 * @type {!(string|anychart.format.Locale)}
 * @private
 */
anychart.format.outputLocale_ = 'default';


/**
 * Output date time format.
 * @type {?string}
 * @private
 */
anychart.format.outputDateTimeFormat_ = null;


/**
 * Output date format.
 * @type {?string}
 * @private
 */
anychart.format.outputDateFormat_ = null;


/**
 * Output time format.
 * @type {?string}
 * @private
 */
anychart.format.outputTimeFormat_ = null;


/**
 * Actually is output offset in minutes.
 * @type {number}
 * @private
 */
anychart.format.outputTimezone_ = 0;


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
 * Caches datetime symbols maps generated for the locales.
 * @type {!Object}
 * @private
 */
anychart.format.dateTimeSymbolsCache_ = {};


//endregion
//region --- Private functions
//------------------------------------------------------------------------------
//
//  Private functions
//
//------------------------------------------------------------------------------
/**
 * Normalizes locale or locale name to locale.
 * @param {string|anychart.format.Locale|*} locale
 * @return {?anychart.format.Locale}
 */
anychart.format.getLocale = function(locale) {
  if (!goog.isObject(locale)) {
    locale = goog.global['anychart']['format']['locales'][String(locale)];
  }
  return locale || null;
};


/**
 * Normalizes locale or locale name to dateTime locale.
 * @param {string|anychart.format.Locale|*} locale
 * @return {?anychart.format.DateTimeLocale}
 */
anychart.format.getDateTimeLocale = function(locale) {
  var loc = anychart.format.getLocale(locale);
  return loc && loc['dateTimeLocale'] || null;
};


/**
 * Normalizes locale or locale name to number locale.
 * @param {string|anychart.format.Locale|*} locale
 * @return {?anychart.format.NumberLocale}
 */
anychart.format.getNumberLocale = function(locale) {
  var loc = anychart.format.getLocale(locale);
  return loc && loc['numberLocale'] || null;
};


/**
 * Extracts the date time format from locale if any. Returns null if no format found.
 * @param {string|anychart.format.Locale} locale
 * @param {string=} opt_formatName
 * @return {?string}
 * @private
 */
anychart.format.getOutputDateTimeFormat_ = function(locale, opt_formatName) {
  var loc = anychart.format.getDateTimeLocale(locale);
  return loc && loc[opt_formatName || 'dateTimeFormat'] || null;
};


/**
 * Turns incoming locale to date time symbols suitable to closure library.
 * @param {?anychart.format.DateTimeLocale} locale - Incoming locale.
 * @private
 * @return {!Object} - Date time symbols.
 */
anychart.format.localeToDateTimeSymbols_ = function(locale) {
  if (!locale)
    return goog.i18n.DateTimeSymbols;
  var uid = goog.getUid(locale);
  if (!(uid in anychart.format.dateTimeSymbolsCache_)) {
    anychart.format.dateTimeSymbolsCache_[uid] = {
      ERAS: locale['eras'],
      ERANAMES: locale['eraNames'],
      NARROWMONTHS: locale['narrowMonths'],
      STANDALONENARROWMONTHS: locale['standaloneNarrowMonths'],
      MONTHS: locale['months'],
      STANDALONEMONTHS: locale['standaloneMonths'],
      SHORTMONTHS: locale['shortMonths'],
      STANDALONESHORTMONTHS: locale['standaloneShortMonths'],
      WEEKDAYS: locale['weekdays'],
      STANDALONEWEEKDAYS: locale['standaloneWeekdays'],
      SHORTWEEKDAYS: locale['shortWeekdays'],
      STANDALONESHORTWEEKDAYS: locale['standaloneShortWeekdays'],
      NARROWWEEKDAYS: locale['narrowWeekdays'],
      STANDALONENARROWWEEKDAYS: locale['standaloneNarrowWeekdays'],
      SHORTQUARTERS: locale['shortQuarters'],
      QUARTERS: locale['quarters'],
      AMPMS: locale['ampms'] || locale['amPmS'],
      DATEFORMATS: locale['dateFormats'] || [],
      TIMEFORMATS: locale['timeFormats'] || [],
      DATETIMEFORMATS: locale['dateTimeFormats'] || [],
      FIRSTDAYOFWEEK: locale['firstDayOfWeek'],
      WEEKENDRANGE: locale['weekendRange'],
      FIRSTWEEKCUTOFFDAY: locale['firstWeekCutOffDay'] || locale['firstWeekCutOfDay']
    };
  }
  return anychart.format.dateTimeSymbolsCache_[uid];
};


//endregion
//region --- Public getters/setters
//------------------------------------------------------------------------------
//
//  Public getters/setters
//
//------------------------------------------------------------------------------
/**
 * Input format setting to be used.
 * @param {(string|anychart.format.Locale)=} opt_value
 * @return {string|anychart.format.Locale}
 */
anychart.format.inputLocale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value) || goog.isObject(opt_value)) {
      anychart.format.inputLocale_ = opt_value;
    } else {
      anychart.format.inputLocale_ = 'default';
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
    if (goog.isString(opt_value)) {
      anychart.format.inputDateTimeFormat_ = opt_value;
    } else {
      anychart.format.inputDateTimeFormat_ = null;
    }
  }
  return anychart.format.inputDateTimeFormat_;
};


/**
 * Getter and setter for the input base date. All dates parsed by the anychart.format.parseDate
 * in case of lacking of any date time parts like year or month will use parts of this base date.
 * Defaults to a first millisecond of current UTC month.
 * @param {(Date|number)=} opt_value
 * @return {Date}
 */
anychart.format.inputBaseDate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.format.inputBaseDate_ = goog.isDateLike(opt_value) ?
        opt_value.getTime() :
        anychart.utils.toNumber(opt_value);
  }
  if (isNaN(anychart.format.inputBaseDate_)) {
    // we recalculate current year and month on each request for persistent apps
    var currDate = new Date();
    currDate.setTime(Date.UTC(currDate.getUTCFullYear(), currDate.getUTCMonth()));
    return currDate;
  }
  return new Date(anychart.format.inputBaseDate_);
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
    } else {
      anychart.format.outputLocale_ = 'default';
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
    if (goog.isString(opt_value)) {
      anychart.format.outputDateTimeFormat_ = opt_value;
    } else {
      anychart.format.outputDateTimeFormat_ = null;
    }
  }
  return anychart.format.outputDateTimeFormat_ ||
      anychart.format.getOutputDateTimeFormat_(anychart.format.outputLocale_) ||
      anychart.format.getOutputDateTimeFormat_('default') ||
      'yyyy.MM.dd';
};


/**
 * Output date format.
 * @param {string=} opt_value
 * @return {string}
 */
anychart.format.outputDateFormat = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      anychart.format.outputDateFormat_ = opt_value;
    } else {
      anychart.format.outputDateFormat_ = null;
    }
  }
  return anychart.format.outputDateFormat_ ||
      anychart.format.getOutputDateTimeFormat_(anychart.format.outputLocale_, 'dateFormat') ||
      anychart.format.getOutputDateTimeFormat_('default', 'dateFormat') ||
      'yyyy.MM.dd';
};


/**
 * Output time format.
 * @param {string=} opt_value
 * @return {string}
 */
anychart.format.outputTimeFormat = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      anychart.format.outputTimeFormat_ = opt_value;
    } else {
      anychart.format.outputTimeFormat_ = null;
    }
  }
  return anychart.format.outputTimeFormat_ ||
      anychart.format.getOutputDateTimeFormat_(anychart.format.outputLocale_, 'timeFormat') ||
      anychart.format.getOutputDateTimeFormat_('default', 'timeFormat') ||
      'HH:mm:ss';
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


//endregion
//region --- Parsing
//------------------------------------------------------------------------------
//
//  Parsing
//
//------------------------------------------------------------------------------
/**
 * Parses input value to date.
 * @param {*} value - Input value.
 * @param {?string=} opt_format - Format to be parsed. If is undefined, anychart.format.inputDateTimeFormat will be used.
 * @param {?Date=} opt_baseDate - Date object to hold the parsed date. Used for case if input value doesn't contain
 *  information about year or month or something like that. If parsing process ends successfully, this object will
 *  contain totally the same values of date time units as return value.
 *  NOTE: If is not Date, Date.UTC(currentYear, currentMoth) will be used.
 * @param {?(string|anychart.format.Locale)=} opt_locale - Locale to be used. If not set, anychart.format.inputLocale will
 *  be used.
 * @return {?Date} - Parsed date or null if got wrong input value.
 */
anychart.format.parseDateTime = function(value, opt_format, opt_baseDate, opt_locale) {
  var locales = goog.global['anychart']['format']['locales'];
  if (goog.isDateLike(value)) {
    return /** @type {Date} */ (value);
  } else if (goog.isNumber(value)) {
    if (isNaN(value)) {
      // anychart.core.reporting.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value]);
      return null;
    } else {
      return new Date(value);
    }
  } else if (goog.isString(value)) {
    var format = (goog.isDef(opt_format) ? opt_format : anychart.format.inputDateTimeFormat_) || null;
    if (format) {
      var locale = anychart.format.getDateTimeLocale(opt_locale) ||
          anychart.format.getDateTimeLocale(anychart.format.inputLocale_) ||
          anychart.format.getDateTimeLocale('default');
      var localeHash = goog.getUid(locale);
      var parserCacheKey = format + localeHash;
      /** @type {goog.i18n.DateTimeParse} */
      var parser;
      if (!(parserCacheKey in anychart.format.parseDateTimeCache_)) {
        var symbols = anychart.format.localeToDateTimeSymbols_(locale);
        anychart.format.parseDateTimeCache_[parserCacheKey] = new goog.i18n.DateTimeParse(format, symbols);
      }
      parser = anychart.format.parseDateTimeCache_[parserCacheKey];

      var date = goog.isDateLike(opt_baseDate) ? /** @type {Date} */ (opt_baseDate) : anychart.format.inputBaseDate();

      var timezoneOffset = (format.replace(/'.+?'/g, '').search(/z+/i) == -1) ? date.getTimezoneOffset() * 60000 : 0;
      if (timezoneOffset) {
        var localTime = date.getTime() + timezoneOffset;
        date.setTime(localTime);
      }

      var valueLength = value.length;
      var resultLength = parser.parse(value, date);

      if (valueLength == resultLength) {//parsing successful.
        if (timezoneOffset) {
          var utcTime = date.getTime() - timezoneOffset;
          date.setTime(utcTime);
        }
        return /** @type {Date} */ (date);
      } else {
        // anychart.core.reporting.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value, resultLength], true);
        return null;
      }
    } else { //falling back to anychart.utils.normalizeTimestamp -like behaviour
      var numValue = +value;
      var newDate = new Date(isNaN(numValue) ? value : numValue);
      if (isNaN(newDate.getTime())) { //Got string not in ISO8601 format.
        // anychart.core.reporting.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value]);
        return null; // Parsing error.
      } else {
        return newDate;
      }
    }
  } else {
    // anychart.core.reporting.warning(anychart.enums.WarningCode.PARSE_DATETIME, void 0, [value]);
    return null;
  }
};


/**
 * Parses passed value to number considering locale.
 * @param {*} value - Value to be parsed.
 * @param {(anychart.format.NumberLocale|string)=} opt_locale - Number locale to be used. If not
 *  defined, anychart.format.input.numberFormat will be used.
 * @return {number} - Parsed value. NaN if value could not be parsed.
 */
anychart.format.parseNumber = function(value, opt_locale) {
  var locale = anychart.format.getNumberLocale(opt_locale) ||
      anychart.format.getNumberLocale(anychart.format.inputLocale_) ||
      anychart.format.getNumberLocale('default');
  var sign = 1;
  if (goog.isString(value)) {
    if (locale['useBracketsForNegative']) { //replacing brackets
      if (value.charAt(0) == '(' && value.charAt(value.length - 1) == ')') {
        //NOTE: Incoming value "(5)" becomes -5 and "(-5)" becomes 5 (negative of negative).
        sign = -1;
        value = value.substring(1, value.length - 1);
      }
    }

    value = value.replace(locale['decimalPoint'], '.'); //replacing decimalPoint with JS default symbol.

    value = goog.string.removeAll(value, locale['groupsSeparator']); //replacing groupsSeparator.

    var scale = locale['scale'];
    if (scale === true)
      scale = anychart.format.DEFAULT_SCALE_;

    if (goog.isObject(scale) && goog.isArray(scale['factors']) && goog.isArray(scale['suffixes'])) {
      value = goog.string.removeAll(value, locale['scaleSuffixSeparator']); //replacing scaleSuffixSeparator.

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
  result *= sign;
  return isNaN(result) ? result : anychart.math.round(result, locale['decimalsCount']);
};


//endregion
//region --- Formatting
//------------------------------------------------------------------------------
//
//  Formatting
//
//------------------------------------------------------------------------------
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
 * Returns localized message, if the translation is provided in messages section of output locale.
 * @param {string} keyword
 * @return {string}
 */
anychart.format.getMessage = function(keyword) {
  var locale = anychart.format.getLocale(anychart.format.outputLocale_);
  var messages = locale && locale['messages'];
  return (messages && (keyword in messages)) ? messages[keyword] : keyword;
};


/**
 * Combines two passed intervals into an interval identifier that can be passed to getDateTimeFormat/s() functions.
 * @param {anychart.enums.Interval} intervalUnit
 * @param {anychart.enums.Interval=} opt_parentIntervalUnit
 * @param {(anychart.enums.IntervalFormatPrefix|string)=} opt_prefix
 * @return {string}
 */
anychart.format.getIntervalIdentifier = function(intervalUnit, opt_parentIntervalUnit, opt_prefix) {
  var parentInterval = anychart.enums.normalizeInterval(opt_parentIntervalUnit);
  intervalUnit = /** @type {anychart.enums.Interval} */(anychart.enums.normalizeInterval(intervalUnit));
  opt_prefix = opt_prefix ? opt_prefix + '_' : '';
  return opt_prefix + ((intervalUnit == parentInterval) ?
      intervalUnit :
      parentInterval + '_' + intervalUnit);
};


/**
 *
 * @param {string} identifier
 * @param {number=} opt_index
 * @param {anychart.format.Locale=} opt_locale
 * @return {string}
 */
anychart.format.getDateTimeFormat = function(identifier, opt_index, opt_locale) {
  var locale = anychart.format.getDateTimeLocale(opt_locale) ||
      anychart.format.getDateTimeLocale(anychart.format.outputLocale_) ||
      anychart.format.getDateTimeLocale('default');
  var formats = locale && locale['formats'] && locale['formats'][identifier];
  var format = goog.isArray(formats) ?
      formats[Math.min(formats.length - 1, opt_index || 0)] :
      goog.isString(formats) ?
          formats :
          '';
  return format || 'yyyy/MM/dd\'T\'HH:mm:ss.SSS';
};


/**
 * For an interval range identifier returns an array of applicable localized formats sorted by the length of the output.
 * @param {string} identifier
 * @param {anychart.format.Locale=} opt_locale
 * @return {Array.<string>}
 */
anychart.format.getDateTimeFormats = function(identifier, opt_locale) {
  var locale = anychart.format.getDateTimeLocale(opt_locale) ||
      anychart.format.getDateTimeLocale(anychart.format.outputLocale_) ||
      anychart.format.getDateTimeLocale('default');
  var formats = locale && locale['formats'] && locale['formats'][identifier];
  return goog.isArray(formats) ?
      formats :
      goog.isString(formats) ?
          [formats] :
          [];
};


/**
 * Does the same formatting as anychart.format.dateTime does, but with the default date format.
 * @param {number|Date} date UTC timestamp or Date object.
 * @param {number=} opt_timeZone Adjust with time zone. Indicate
 * minutes WEST of UTC to be used as a constant time zone offset.
 * @param {(string|anychart.format.Locale)=} opt_locale - Locale to be used.
 * @return {string}
 */
anychart.format.date = function(date, opt_timeZone, opt_locale) {
  return anychart.format.dateTime(date, anychart.format.outputDateFormat(), opt_timeZone, opt_locale);
};


/**
 * Does the same formatting as anychart.format.dateTime does, but with the default time format.
 * @param {number|Date} date UTC timestamp or Date object.
 * @param {number=} opt_timeZone Adjust with time zone. Indicate
 * minutes WEST of UTC to be used as a constant time zone offset.
 * @param {(string|anychart.format.Locale)=} opt_locale - Locale to be used.
 * @return {string}
 */
anychart.format.time = function(date, opt_timeZone, opt_locale) {
  return anychart.format.dateTime(date, anychart.format.outputTimeFormat(), opt_timeZone, opt_locale);
};


/**
 * Formats date time by pattern.
 * @param {number|Date} date UTC timestamp or Date object.
 * @param {string=} opt_format ['yyyy.MM.dd'].
 * @param {number=} opt_timeZone Adjust with time zone. Indicate
 * minutes WEST of UTC to be used as a constant time zone offset.
 * @param {(string|anychart.format.Locale)=} opt_locale - Locale to be used.
 * @return {string}
 */
anychart.format.dateTime = function(date, opt_format, opt_timeZone, opt_locale) {
  date = (date instanceof Date) ? date : new Date(date);
  if (isNaN(date.getTime())) return String(date);

  var locale = anychart.format.getDateTimeLocale(opt_locale) ||
      anychart.format.getDateTimeLocale(anychart.format.outputLocale_) ||
      anychart.format.getDateTimeLocale('default');
  var pattern = opt_format ||
      anychart.format.outputDateTimeFormat_ ||
      anychart.format.outputDateTimeFormat() ||
      'yyyy.MM.dd';
  var formatterCacheKey = pattern + goog.getUid(locale);

  if (!(formatterCacheKey in anychart.format.formatDateTimeCache_)) {
    var symbols = anychart.format.localeToDateTimeSymbols_(locale);
    anychart.format.formatDateTimeCache_[formatterCacheKey] = new goog.i18n.DateTimeFormat(pattern, symbols);
  }
  /** @type {goog.i18n.DateTimeFormat} */
  var formatter = anychart.format.formatDateTimeCache_[formatterCacheKey];

  opt_timeZone = opt_timeZone || anychart.format.outputTimezone_;
  if (!(opt_timeZone in anychart.format.UTCTimeZoneCache_)) {
    anychart.format.UTCTimeZoneCache_[opt_timeZone] = goog.i18n.TimeZone.createTimeZone(opt_timeZone);
  }
  var timeZone = anychart.format.UTCTimeZoneCache_[opt_timeZone];

  return formatter.format(date, timeZone);
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
  var obj = anychart.format.getNumberLocale(opt_decimalsCountOrLocale);
  var locale = anychart.format.getNumberLocale(anychart.format.outputLocale_) ||
      anychart.format.getNumberLocale('default');

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


//endregion


//exports
goog.exportSymbol('anychart.format.inputLocale', anychart.format.inputLocale);
goog.exportSymbol('anychart.format.inputBaseDate', anychart.format.inputBaseDate);
goog.exportSymbol('anychart.format.inputDateTimeFormat', anychart.format.inputDateTimeFormat);
goog.exportSymbol('anychart.format.outputLocale', anychart.format.outputLocale);
goog.exportSymbol('anychart.format.outputTimezone', anychart.format.outputTimezone);
goog.exportSymbol('anychart.format.outputDateFormat', anychart.format.outputDateFormat);
goog.exportSymbol('anychart.format.outputTimeFormat', anychart.format.outputTimeFormat);
goog.exportSymbol('anychart.format.outputDateTimeFormat', anychart.format.outputDateTimeFormat);
goog.exportSymbol('anychart.format.parseDateTime', anychart.format.parseDateTime);
goog.exportSymbol('anychart.format.parseNumber', anychart.format.parseNumber);
goog.exportSymbol('anychart.format.subs', anychart.format.subs);
goog.exportSymbol('anychart.format.getMessage', anychart.format.getMessage);
goog.exportSymbol('anychart.format.getDateTimeFormats', anychart.format.getDateTimeFormats);
goog.exportSymbol('anychart.format.getDateTimeFormat', anychart.format.getDateTimeFormat);
goog.exportSymbol('anychart.format.getIntervalIdentifier', anychart.format.getIntervalIdentifier);
goog.exportSymbol('anychart.format.date', anychart.format.date);
goog.exportSymbol('anychart.format.time', anychart.format.time);
goog.exportSymbol('anychart.format.dateTime', anychart.format.dateTime);
goog.exportSymbol('anychart.format.number', anychart.format.number);
