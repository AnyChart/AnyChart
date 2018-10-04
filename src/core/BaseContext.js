goog.provide('anychart.core.BaseContext');

goog.require('anychart.data.IRowInfo');
goog.require('anychart.data.ITreeDataInfo');
goog.require('anychart.enums');



/**
 * Common format context class. Actually is parent for anychart.format.Context to hide all not exported
 * methods from user to prototype.
 * DEV NOTE: No value must be set directly (like context['val'] = val;). Use constructor or propagate() instead!
 *
 * @param {Object.<string, anychart.core.BaseContext.TypedValue>=} opt_values - Typed values.
 * @param {(anychart.data.IRowInfo|anychart.data.ITreeDataInfo)=} opt_dataSource - Source for getData().
 * @param {Array.<anychart.core.BaseContext.StatisticsSource>=} opt_statisticsSources - Statistics sources. Must be set by priority.
 * @constructor
 */
anychart.core.BaseContext = function(opt_values, opt_dataSource, opt_statisticsSources) {
  /**
   * All data storage.
   * This field is created to minimize a number of obfuscated fields in resulting context object.
   * @type {anychart.core.BaseContext.Storage}
   * @private
   */
  this.storage_ = {
    values: opt_values || {},
    dataSource: opt_dataSource || null,
    statisticsSources: opt_statisticsSources || [],
    tokenAliases: {},
    tokenCustomValues: {}
  };

  //Initial aliasing.
  this.storage_.tokenAliases[anychart.enums.StringToken.VALUE] = 'value';
  this.storage_.tokenAliases[anychart.enums.StringToken.Y_VALUE] = 'value';
  this.storage_.tokenAliases[anychart.enums.StringToken.INDEX] = 'index';
};


/**
 * @typedef {{
 *  value: *,
 *  type: (anychart.enums.TokenType|undefined)
 * }}
 */
anychart.core.BaseContext.TypedValue;


/**
 * @typedef {{
 *  getStat: function(string):*
 * }}
 */
anychart.core.BaseContext.StatisticsSource;


/**
 * @typedef {{
 *  values: Object.<string, anychart.core.BaseContext.TypedValue>,
 *  dataSource: (anychart.data.IRowInfo|anychart.data.ITreeDataInfo),
 *  statisticsSources: Array.<anychart.core.BaseContext.StatisticsSource>,
 *  tokenAliases: Object.<string, string>,
 *  tokenCustomValues: Object.<string, anychart.core.BaseContext.TypedValue>
 * }}
 */
anychart.core.BaseContext.Storage;


/**
 * Gets/sets typed values.
 * @param {Object.<string, anychart.core.BaseContext.TypedValue>=} opt_value - Typed values.
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>|anychart.core.BaseContext}
 */
anychart.core.BaseContext.prototype.contextValues = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.storage_.values = opt_value;
    return this;
  }
  return this.storage_.values;
};


/**
 * Gets/sets typed values.
 * @param {(anychart.data.IRowInfo|anychart.data.ITreeDataInfo)=} opt_value - Data source.
 * @return {anychart.data.IRowInfo|anychart.data.ITreeDataInfo|anychart.core.BaseContext}
 */
anychart.core.BaseContext.prototype.dataSource = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.storage_.dataSource = opt_value;
    return this;
  }
  return this.storage_.dataSource;
};


/**
 * Gets/sets typed values.
 * @param {Array.<anychart.core.BaseContext.StatisticsSource>=} opt_value - Statistics sources. Must be ordered by priority.
 * @return {Array.<anychart.core.BaseContext.StatisticsSource>|anychart.core.BaseContext}
 */
anychart.core.BaseContext.prototype.statisticsSources = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.storage_.statisticsSources = opt_value;
    return this;
  }
  return this.storage_.statisticsSources;
};


/**
 * Gets/sets token aliases map.
 * @param {Object.<string, string>=} opt_value - Token aliases map.
 * @return {Object.<string, string>|anychart.core.BaseContext}
 */
anychart.core.BaseContext.prototype.tokenAliases = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.storage_.tokenAliases = opt_value;
    return this;
  }
  return this.storage_.tokenAliases;
};


/**
 * Gets/sets token aliases map.
 * @param {Object.<string, anychart.core.BaseContext.TypedValue>=} opt_value - Token aliases map.
 * @return {Object.<string, anychart.core.BaseContext.TypedValue>|anychart.core.BaseContext}
 */
anychart.core.BaseContext.prototype.tokenCustomValues = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.storage_.tokenCustomValues = opt_value;
    return this;
  }
  return this.storage_.tokenCustomValues;
};


/**
 * Looks for lower case name in values.
 * @param {string} lowerCaseName - Name in lower case.
 * @private
 * @return {*} - Found value.
 */
anychart.core.BaseContext.prototype.getInValuesCaseInsensitive_ = function(lowerCaseName) {
  var key;
  for (key in this.storage_.tokenCustomValues) {
    if (this.storage_.tokenCustomValues.hasOwnProperty(key) && key.toLowerCase() == lowerCaseName)
      return this.storage_.tokenCustomValues[key].value;
  }
  for (key in this.storage_.values) {
    if (this.storage_.values.hasOwnProperty(key) && key.toLowerCase() == lowerCaseName)
      return this.storage_.values[key].value;
  }
  return void 0;
};


/**
 * Gets data value.
 * @param {...*} var_args - Data field path.
 * @return {*} - Data value.
 */
anychart.core.BaseContext.prototype.getData = function(var_args) {
  var src = /** @type {anychart.data.ITreeDataInfo} */ (this.storage_.dataSource);
  return src ? src.get.apply(src, arguments) : void 0;
};


/**
 * Gets meta value.
 * @param {string} name - Data field path.
 * @return {*} - Meta value.
 */
anychart.core.BaseContext.prototype.getMeta = function(name) {
  var result = this.storage_.dataSource ? this.storage_.dataSource.meta(name) : void 0;
  if (!goog.isDef(result)) {
    var series = this.storage_.values['series'];
    result = series ? series.value.meta(name) : void 0;
  }
  return result;
};


/**
 * Gets statistics value.
 * @param {string} name - Statistics name.
 * @return {*} - Statistics value.
 */
anychart.core.BaseContext.prototype.getStat = function(name) {
  var result = void 0;
  if (name) {
    for (var i = 0; i < this.storage_.statisticsSources.length; i++) {
      var source = this.storage_.statisticsSources[i];

      //TODO (A.Kudryavtsev): Yes, there are cases when statistics source still don't have getStat() method. Theoretically, it must be fixed.
      result = (source && source.getStat) ? source.getStat(name) : void 0;
      if (goog.isDef(result))
        return result;
    }
  }
  return result;
};


/**
 * Propagates values to instance of anychart.format.Context.
 * @param {Object.<string, anychart.core.BaseContext.TypedValue>=} opt_values - New typed values. If is set,
 *  clears all old typed values set.
 * @return {anychart.core.BaseContext} - Itself for chaining.
 */
anychart.core.BaseContext.prototype.propagate = function(opt_values) {
  var key;
  if (goog.isDef(opt_values)) {
    for (key in this) {
      if (this.hasOwnProperty(key) && !goog.isFunction(this[key]) && this[key] != this.storage_) {
        delete this[key];
      }
    }
    this.storage_.values = opt_values;
  }

  for (key in this.storage_.values) {
    this[key] = this.storage_.values[key].value;
  }

  return this;
};


/**
 * Return token value by token name.
 * @param {string} name - Name of the token. Looks like '%Index'.
 * @return {*} - Value of the token.
 */
anychart.core.BaseContext.prototype.getTokenValueInternal = function(name) {
  var origName = name.charAt(0) == '%' ? name.substr(1) : name;
  var lowerCaseName = origName.toLowerCase();
  var aliasName = this.storage_.tokenAliases[name];

  var valueSource = this.storage_.tokenCustomValues[aliasName] || this.storage_.values[aliasName] ||
      this.storage_.tokenCustomValues[name] || this.storage_.values[name] ||
      this.storage_.tokenCustomValues[origName] || this.storage_.values[origName];

  if (valueSource)
    return valueSource.value;

  var caseInsensitiveResult = this.getInValuesCaseInsensitive_(lowerCaseName);
  if (goog.isDef(caseInsensitiveResult))
    return caseInsensitiveResult;

  var dataValue = aliasName ? this.getData(aliasName) || this.getData(origName) : this.getData(origName);
  if (goog.isDef(dataValue))
    return dataValue;

  return this.getStat(lowerCaseName);
};


/**
 * Return token type by token name.
 * @param {string} name - Token name.
 * @return {anychart.enums.TokenType} - Type of the token.
 */
anychart.core.BaseContext.prototype.getTokenTypeInternal = function(name) {
  var origName = name.charAt(0) == '%' ? name.substr(1) : name;
  var lowerCaseName = origName.toLowerCase();
  var aliasName = this.storage_.tokenAliases[name];

  var typeSource = this.storage_.tokenCustomValues[aliasName] || this.storage_.values[aliasName] ||
      this.storage_.tokenCustomValues[name] || this.storage_.values[name] ||
      this.storage_.tokenCustomValues[origName] || this.storage_.values[origName] ||
      this.storage_.tokenCustomValues[lowerCaseName] || this.storage_.values[lowerCaseName];

  var type = typeSource && goog.isDef(typeSource.type) ? typeSource.type : anychart.enums.TokenType.STRING;

  if (!typeSource && this.storage_.statisticsSources.length) {
    switch (lowerCaseName) {
      case anychart.enums.StatisticsLowerCase.AXIS_SCALE_MAX:
      case anychart.enums.StatisticsLowerCase.AXIS_SCALE_MIN:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_RANGE_MAX:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_RANGE_MIN:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_RANGE_SUM:
      case anychart.enums.StatisticsLowerCase.SERIES_FIRST_X_VALUE:
      case anychart.enums.StatisticsLowerCase.SERIES_FIRST_Y_VALUE:
      case anychart.enums.StatisticsLowerCase.SERIES_LAST_X_VALUE:
      case anychart.enums.StatisticsLowerCase.SERIES_LAST_Y_VALUE:
      case anychart.enums.StatisticsLowerCase.SERIES_X_SUM:
      case anychart.enums.StatisticsLowerCase.SERIES_BUBBLE_SIZE_SUM:
      case anychart.enums.StatisticsLowerCase.SERIES_X_MAX:
      case anychart.enums.StatisticsLowerCase.SERIES_X_MIN:
      case anychart.enums.StatisticsLowerCase.SERIES_BUBBLE_MAX_SIZE:
      case anychart.enums.StatisticsLowerCase.SERIES_BUBBLE_MIN_SIZE:
      case anychart.enums.StatisticsLowerCase.SERIES_X_AVERAGE:
      case anychart.enums.StatisticsLowerCase.SERIES_BUBBLE_SIZE_AVERAGE:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_MEDIAN:
      case anychart.enums.StatisticsLowerCase.SERIES_X_MEDIAN:
      case anychart.enums.StatisticsLowerCase.SERIES_BUBBLE_SIZE_MEDIAN:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_MODE:
      case anychart.enums.StatisticsLowerCase.SERIES_X_MODE:
      case anychart.enums.StatisticsLowerCase.SERIES_BUBBLE_SIZE_MODE:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_RANGE_MAX:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_RANGE_MIN:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_RANGE_SUM:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_SUM:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_AVERAGE:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_MEDIAN:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_MODE:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_RANGE_MAX:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_RANGE_MIN:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_RANGE_SUM:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_X_SUM:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_BUBBLE_SIZE_SUM:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_X_MAX:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_X_MIN:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_BUBBLE_MAX_SIZE:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_BUBBLE_MIN_SIZE:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_X_AVERAGE:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_BUBBLE_SIZE_AVERAGE:
      case anychart.enums.StatisticsLowerCase.VALUE:
      case anychart.enums.StatisticsLowerCase.Y_VALUE:
      case anychart.enums.StatisticsLowerCase.HIGH:
      case anychart.enums.StatisticsLowerCase.LOW:
      case anychart.enums.StatisticsLowerCase.OPEN:
      case anychart.enums.StatisticsLowerCase.CLOSE:
      case anychart.enums.StatisticsLowerCase.X_VALUE:
      case anychart.enums.StatisticsLowerCase.BUBBLE_SIZE:
      case anychart.enums.StatisticsLowerCase.INDEX:
      case anychart.enums.StatisticsLowerCase.RANGE_START:
      case anychart.enums.StatisticsLowerCase.RANGE_END:
      case anychart.enums.StatisticsLowerCase.RANGE:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_SUM:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_MAX:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_MIN:
      case anychart.enums.StatisticsLowerCase.SERIES_Y_AVERAGE:
      case anychart.enums.StatisticsLowerCase.SERIES_POINT_COUNT:
      case anychart.enums.StatisticsLowerCase.SERIES_POINTS_COUNT:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_SUM:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_MAX:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_MIN:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_Y_AVERAGE:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_POINT_COUNT:
      case anychart.enums.StatisticsLowerCase.DATA_PLOT_SERIES_COUNT:

      case anychart.enums.StatisticsLowerCase.BUBBLE_SIZE_PERCENT_OF_CATEGORY:
      case anychart.enums.StatisticsLowerCase.BUBBLE_SIZE_PERCENT_OF_SERIES:
      case anychart.enums.StatisticsLowerCase.BUBBLE_SIZE_PERCENT_OF_TOTAL:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_PERCENT_OF_TOTAL:
      case anychart.enums.StatisticsLowerCase.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL:
      case anychart.enums.StatisticsLowerCase.Y_PERCENT_OF_CATEGORY:
      case anychart.enums.StatisticsLowerCase.Y_PERCENT_OF_SERIES:
      case anychart.enums.StatisticsLowerCase.Y_PERCENT_OF_TOTAL:
      case anychart.enums.StatisticsLowerCase.X_PERCENT_OF_SERIES:
      case anychart.enums.StatisticsLowerCase.X_PERCENT_OF_TOTAL:
      case anychart.enums.StatisticsLowerCase.PERCENT_VALUE:
        type = anychart.enums.TokenType.NUMBER;
    }
    // case anychart.enums.Statistics.NAME:
    // case anychart.enums.Statistics.SERIES_NAME:
    // case anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_NAME:
    // case anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_NAME:
    // case anychart.enums.Statistics.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME:
    // case anychart.enums.Statistics.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME:
    // case anychart.enums.Statistics.DATA_PLOT_MAX_Y_SUM_SERIES_NAME:
    // case anychart.enums.Statistics.DATA_PLOT_MIN_Y_SUM_SERIES_NAME:
    // case anychart.enums.Statistics.SERIES_Y_AXIS_NAME:
    // case anychart.enums.Statistics.SERIES_X_AXIS_NAME:
    // case anychart.enums.Statistics.CATEGORY_NAME:
    // case anychart.enums.Statistics.AXIS_NAME:
    //   res = anychart.enums.TokenType.STRING;
  }
  return type;
};



