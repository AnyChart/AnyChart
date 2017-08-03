/**
 * @fileoverview anychart.data namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.data');

goog.require('anychart.data.ConcatView');
goog.require('anychart.data.FilterView');
goog.require('anychart.data.Set');
goog.require('anychart.data.SortView');
goog.require('anychart.data.csv.Parser');
goog.require('anychart.enums');

/**
 * Classes for handling data structures/sources<br/>
 * The following data types/hierarchy is supported:
 * <ul>
 *  <li>Linear ({@link anychart.data.Set} and {@link anychart.stockModule.data.Table})</li>
 *  <li>Tree ({@link anychart.treeDataModule.Tree})</li>
 * </ul>
 * You can map any of these data sets to ({@link anychart.data.View}), and then
 * work with it using {@link anychart.data.Iterator} iterator.
 * @namespace
 * @name anychart.data
 */


/**
 * Word separators.
 * @type {string|RegExp}
 * @const
 */
anychart.data.WORD_SEPARATORS = /[ \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g;


/**
 * Unicode punctuation.
 * @type {string|RegExp}
 * @const
 */
anychart.data.PUNCTUATION = /[!-#%-*,-/:;?@\[-\]_{}\xa1\xa7\xab\xb6\xb7\xbb\xbf\u037e\u0387\u055a-\u055f\u0589\u058a\u05be\u05c0\u05c3\u05c6\u05f3\u05f4\u0609\u060a\u060c\u060d\u061b\u061e\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0830-\u083e\u085e\u0964\u0965\u0970\u0af0\u0df4\u0e4f\u0e5a\u0e5b\u0f04-\u0f12\u0f14\u0f3a-\u0f3d\u0f85\u0fd0-\u0fd4\u0fd9\u0fda\u104a-\u104f\u10fb\u1360-\u1368\u1400\u166d\u166e\u169b\u169c\u16eb-\u16ed\u1735\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u180a\u1944\u1945\u1a1e\u1a1f\u1aa0-\u1aa6\u1aa8-\u1aad\u1b5a-\u1b60\u1bfc-\u1bff\u1c3b-\u1c3f\u1c7e\u1c7f\u1cc0-\u1cc7\u1cd3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205e\u207d\u207e\u208d\u208e\u2329\u232a\u2768-\u2775\u27c5\u27c6\u27e6-\u27ef\u2983-\u2998\u29d8-\u29db\u29fc\u29fd\u2cf9-\u2cfc\u2cfe\u2cff\u2d70\u2e00-\u2e2e\u2e30-\u2e3b\u3001-\u3003\u3008-\u3011\u3014-\u301f\u3030\u303d\u30a0\u30fb\ua4fe\ua4ff\ua60d-\ua60f\ua673\ua67e\ua6f2-\ua6f7\ua874-\ua877\ua8ce\ua8cf\ua8f8-\ua8fa\ua92e\ua92f\ua95f\ua9c1-\ua9cd\ua9de\ua9df\uaa5c-\uaa5f\uaade\uaadf\uaaf0\uaaf1\uabeb\ufd3e\ufd3f\ufe10-\ufe19\ufe30-\ufe52\ufe54-\ufe61\ufe63\ufe68\ufe6a\ufe6b\uff01-\uff03\uff05-\uff0a\uff0c-\uff0f\uff1a\uff1b\uff1f\uff20\uff3b-\uff3d\uff3f\uff5b\uff5d\uff5f-\uff65]/g;


/**
 * @typedef {{
 *  mode: (anychart.enums.TextParsingMode|undefined),
 *  rowsSeparator: (string|undefined),
 *  columnsSeparator: (string|undefined),
 *  ignoreTrailingSpaces: (boolean|undefined),
 *  ignoreFirstRow: (boolean|undefined),
 *  minLength: (number|undefined),
 *  maxLength: (number|undefined),
 *  cutLength: (number|undefined),
 *  ignoreItems: (Array.<string>|undefined),
 *  maxItems: (number|undefined)
 * }}
 */
anychart.data.TextParsingSettings;


/**
 * @typedef {{
 *  caption: (string|undefined),
 *  header: (Array.<string>|undefined),
 *  rows: (Array|undefined),
 *  text: (string|undefined),
 *  textSettings: (anychart.enums.TextParsingMode|anychart.data.TextParsingSettings|undefined)
 * }}
 */
anychart.data.DataSettings;


/**
 * Maps passed data as an array of mappings. Data is expected to be a table, e.g. an array of arrays of values.
 * The function treats the table as a source for several series of points, that have the same X value.
 * Each row of the table is treated as a bunch of points, one for each series. Column number 0 is treated as an X value.
 * Other columns (number per series depends on the opt_mode) are treated as data values.
 * @example <t>lineChart</t>
 * var data = [
 *   ['A1', 100, 200, 150, 115],
 *   ['A2', 115, 101, 175, 230],
 *   ['A3', 70, 60, 125, 100],
 *   ['A4', 156, 98, 150, 180],
 *   ['A5', 213, 150, 160, 210],
 *   ['A6', '173', '205', '150', '140'],
 *   ['A7', 95, 190, 140, 60]
 * ];
 * var series = anychart.data.mapAsTable(data, 'range');
 * for (var i in series) {
 *   chart.rangeColumn(series[i]);
 * };
 * @example <c>Lifehack using .apply()</c>
 * var data = [
 *   ['A1', 100, 200, 150, 115],
 *   ['A2', 115, 101, 175, 230],
 *   ['A3', 70, 60, 125, 100],
 *   ['A4', 156, 98, 150, 180]
 * ];
 * anychart.line
 *     .apply(this, anychart.data.mapAsTable(data))
 *     .container(stage).draw();
 * @param {Array.<Array.<*>>} data Source data table.
 * @param {(anychart.enums.MapAsTableMode|string)=} opt_mode Mapping mode.
 * @param {number=} opt_seriesCount Explicit number of series to make mapping for. If not set, auto-determination by
 *    the first table row is used.
 * @return {!Array.<anychart.data.Mapping>} Returns an array of mappings, one per series.
 */
anychart.data.mapAsTable = function(data, opt_mode, opt_seriesCount) {
  if (!data || !goog.isArray(data)) return [];
  var columnsPerSeries;
  if (goog.isDef(opt_mode)) {
    opt_mode = String(opt_mode).toLowerCase();
    switch (opt_mode) {
      case anychart.enums.MapAsTableMode.RANGE:
        columnsPerSeries = 2;
        break;
      case anychart.enums.MapAsTableMode.OHLC:
        columnsPerSeries = 4;
        break;
      default:
        columnsPerSeries = 1;
        break;
    }
  } else {
    columnsPerSeries = 1;
  }
  var seriesCount;
  if (!goog.isDef(opt_seriesCount) ||
      isNaN(seriesCount = anychart.utils.normalizeToNaturalNumber(opt_seriesCount, NaN, false))) {
    if (goog.isArray(data[0])) {
      seriesCount = Math.floor((data[0].length - 1) / columnsPerSeries);
    } else {
      seriesCount = 0;
    }
  }
  if (isNaN(seriesCount) || seriesCount <= 0)
    return [];
  var dataSet = new anychart.data.Set(data);
  var i;
  var res = [];
  if (columnsPerSeries == 1) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'value': [1 + i]
      }));
    }
  } else if (columnsPerSeries == 2) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'low': [1 + i * 2],
        'high': [1 + i * 2 + 1]
      }));
    }
  } else if (columnsPerSeries == 4) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'open': [1 + i * 4],
        'high': [1 + i * 4 + 1],
        'low': [1 + i * 4 + 2],
        'close': [1 + i * 4 + 3]
      }));
    }
  }
  return res;
};


/**
 * If opt_keys passed, build object mapping otherwise array mapping
 * @param {anychart.data.Set} dataSet
 * @param {number} fromIndex
 * @param {number} toIndex
 * @param {!Array.<string>} names
 * @param {Array.<string>=} opt_keys
 * @return {!anychart.data.Mapping} *.
 */
anychart.data.buildMapping = function(dataSet, fromIndex, toIndex, names, opt_keys) {
  var settings = {'x': opt_keys ? opt_keys[0] : 0};

  for (var i = 0, count = names.length; i < count; i++) {
    settings[names[i]] = opt_keys ? opt_keys[fromIndex] : fromIndex;
    fromIndex++;
  }

  return dataSet.mapAs(settings);
};


/**
 * Text parsing.
 * @param {string} text .
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings .
 * @return {?Array.<Array.<string|number>>} .
 */
anychart.data.parseText = function(text, opt_settings) {
  var mode = anychart.enums.normalizeTextParsingMode(opt_settings);

  var result;
  if (mode == anychart.enums.TextParsingMode.CSV) {
    try {
      var parser = new anychart.data.csv.Parser();
      if (goog.isObject(opt_settings)) {
        parser.rowsSeparator(/** @type {string|undefined} */(opt_settings['rowsSeparator'])); // if it is undefined, it will not be set.
        parser.columnsSeparator(/** @type {string|undefined} */(opt_settings['columnsSeparator'])); // if it is undefined, it will not be set.
        parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_settings['ignoreTrailingSpaces'])); // if it is undefined, it will not be set.
        parser.ignoreFirstRow(/** @type {boolean|undefined} */(opt_settings['ignoreFirstRow'])); // if it is undefined, it will not be set.
      }
      result = parser.parse(text);
    } catch (e) {
      result = null;
      anychart.core.reporting.error(anychart.enums.ErrorCode.CSV_PARSING_FAILED);
    }
  } else {
    var tags = {};
    var e = {};

    var minLength = 0;
    var maxLength = NaN;
    var cutLength = NaN;
    var maxItems = NaN;
    var ignoreItems;

    if (opt_settings) {
      ignoreItems = opt_settings['ignoreItems'];
      if (ignoreItems)
        ignoreItems = new RegExp('^(' + ignoreItems.join('|') + ')$');

      if (opt_settings['minLength']) minLength = opt_settings['minLength'];
      if (opt_settings['maxLength']) maxLength = opt_settings['maxLength'];
      if (opt_settings['cutLength']) cutLength = opt_settings['cutLength'];
      if (opt_settings['maxItems']) maxItems = opt_settings['maxItems'];
    }

    if (mode == anychart.enums.TextParsingMode.BY_WORD) {
      text.split(anychart.data.WORD_SEPARATORS).forEach(function(t) {
        t = t.replace(anychart.data.PUNCTUATION, '');
        var l = t.length;
        if ((!ignoreItems || !ignoreItems.test(t.toLowerCase())) && !(l > maxLength) && !(l < minLength)) {
          if (!isNaN(cutLength))
            t = t.substr(0, cutLength);
          e[t.toLowerCase()] = t;
          tags[t = t.toLowerCase()] = (tags[t] || 0) + 1;
        }
      });
    } else {
      text = text.replace(anychart.data.WORD_SEPARATORS, '');
      for (var i = 0, len = text.length; i < len; i++) {
        var t = text[i];
        if (!ignoreItems || !ignoreItems.test(t.toLowerCase())) {
          e[t.toLowerCase()] = t;
          tags[t = t.toLowerCase()] = (tags[t] || 0) + 1;
        }
      }
    }

    result = [];
    goog.object.forEach(tags, function(value, key) {
      result.push([key, value]);
    });

    result = result.sort(function(t, e) {
      return e[1] - t[1];
    });

    result.length = Math.min(result.length, maxItems || Infinity);
  }

  return result;
};


//exports
goog.exportSymbol('anychart.data.mapAsTable', anychart.data.mapAsTable);//doc|ex
goog.exportSymbol('anychart.data.buildMapping', anychart.data.buildMapping);
goog.exportSymbol('anychart.data.parseText', anychart.data.parseText);
