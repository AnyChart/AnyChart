goog.provide('anychart.core.utils.GenericContextProvider');
goog.require('anychart.core.utils.ITokenProvider');
goog.require('anychart.enums');
goog.require('goog.object');



/**
 * Generic class for context providers.
 * @param {Object} values
 * @param {Object.<anychart.enums.TokenType>} types
 * @param {{getStat: function(string):*}=} opt_stats
 * @implements {anychart.core.utils.ITokenProvider}
 * @constructor
 */
anychart.core.utils.GenericContextProvider = function(values, types, opt_stats) {
  /**
   * @type {Object}
   * @private
   */
  this.values_ = values;

  /**
   * @type {Object.<anychart.enums.TokenType>}
   * @private
   */
  this.types_ = types;

  /**
   * Statistics source.
   * @type {?{getStat: function(string):*}}
   * @private
   */
  this.statsSource_ = opt_stats || null;

  goog.object.extend(this, values);
};


/** @inheritDoc */
anychart.core.utils.GenericContextProvider.prototype.getTokenValue = function(name) {
  var origName = name.substr(1);
  var statName = origName.charAt(0).toLowerCase() + origName.slice(1);
  if (origName in this.types_)
    return this.values_[origName];
  if (statName in this.types_)
    return this.values_[statName];
  return this.getStat(statName);
};


/** @inheritDoc */
anychart.core.utils.GenericContextProvider.prototype.getTokenType = function(name) {
  var origName = name.substr(1);
  var statName = origName.charAt(0).toLowerCase() + origName.slice(1);
  var res = this.types_[origName] || this.types_[statName];
  if (!res && this.statsSource_) {
    switch (name) {
      case anychart.enums.StringToken.AXIS_SCALE_MAX:
      case anychart.enums.StringToken.AXIS_SCALE_MIN:
      case anychart.enums.StringToken.DATA_PLOT_Y_RANGE_MAX:
      case anychart.enums.StringToken.DATA_PLOT_Y_RANGE_MIN:
      case anychart.enums.StringToken.DATA_PLOT_Y_RANGE_SUM:
      case anychart.enums.StringToken.SERIES_FIRST_X_VALUE:
      case anychart.enums.StringToken.SERIES_FIRST_Y_VALUE:
      case anychart.enums.StringToken.SERIES_LAST_X_VALUE:
      case anychart.enums.StringToken.SERIES_LAST_Y_VALUE:
      case anychart.enums.StringToken.SERIES_X_SUM:
      case anychart.enums.StringToken.SERIES_BUBBLE_SIZE_SUM:
      case anychart.enums.StringToken.SERIES_X_MAX:
      case anychart.enums.StringToken.SERIES_X_MIN:
      case anychart.enums.StringToken.SERIES_BUBBLE_MAX_SIZE:
      case anychart.enums.StringToken.SERIES_BUBBLE_MIN_SIZE:
      case anychart.enums.StringToken.SERIES_X_AVERAGE:
      case anychart.enums.StringToken.SERIES_BUBBLE_SIZE_AVERAGE:
      case anychart.enums.StringToken.SERIES_Y_MEDIAN:
      case anychart.enums.StringToken.SERIES_X_MEDIAN:
      case anychart.enums.StringToken.SERIES_BUBBLE_SIZE_MEDIAN:
      case anychart.enums.StringToken.SERIES_Y_MODE:
      case anychart.enums.StringToken.SERIES_X_MODE:
      case anychart.enums.StringToken.SERIES_BUBBLE_SIZE_MODE:
      case anychart.enums.StringToken.SERIES_Y_RANGE_MAX:
      case anychart.enums.StringToken.SERIES_Y_RANGE_MIN:
      case anychart.enums.StringToken.SERIES_Y_RANGE_SUM:
      case anychart.enums.StringToken.CATEGORY_Y_SUM:
      case anychart.enums.StringToken.CATEGORY_Y_AVERAGE:
      case anychart.enums.StringToken.CATEGORY_Y_MEDIAN:
      case anychart.enums.StringToken.CATEGORY_Y_MODE:
      case anychart.enums.StringToken.CATEGORY_Y_RANGE_MAX:
      case anychart.enums.StringToken.CATEGORY_Y_RANGE_MIN:
      case anychart.enums.StringToken.CATEGORY_Y_RANGE_SUM:
      case anychart.enums.StringToken.DATA_PLOT_X_SUM:
      case anychart.enums.StringToken.DATA_PLOT_BUBBLE_SIZE_SUM:
      case anychart.enums.StringToken.DATA_PLOT_X_MAX:
      case anychart.enums.StringToken.DATA_PLOT_X_MIN:
      case anychart.enums.StringToken.DATA_PLOT_BUBBLE_MAX_SIZE:
      case anychart.enums.StringToken.DATA_PLOT_BUBBLE_MIN_SIZE:
      case anychart.enums.StringToken.DATA_PLOT_X_AVERAGE:
      case anychart.enums.StringToken.DATA_PLOT_BUBBLE_SIZE_AVERAGE:
      case anychart.enums.StringToken.VALUE:
      case anychart.enums.StringToken.Y_VALUE:
      case anychart.enums.StringToken.HIGH:
      case anychart.enums.StringToken.LOW:
      case anychart.enums.StringToken.OPEN:
      case anychart.enums.StringToken.CLOSE:
      case anychart.enums.StringToken.X_VALUE:
      case anychart.enums.StringToken.BUBBLE_SIZE:
      case anychart.enums.StringToken.INDEX:
      case anychart.enums.StringToken.RANGE_START:
      case anychart.enums.StringToken.RANGE_END:
      case anychart.enums.StringToken.RANGE:
      case anychart.enums.StringToken.SERIES_Y_SUM:
      case anychart.enums.StringToken.SERIES_Y_MAX:
      case anychart.enums.StringToken.SERIES_Y_MIN:
      case anychart.enums.StringToken.SERIES_Y_AVERAGE:
      case anychart.enums.StringToken.SERIES_POINT_COUNT:
      case anychart.enums.StringToken.SERIES_POINTS_COUNT:
      case anychart.enums.StringToken.DATA_PLOT_Y_SUM:
      case anychart.enums.StringToken.DATA_PLOT_Y_MAX:
      case anychart.enums.StringToken.DATA_PLOT_Y_MIN:
      case anychart.enums.StringToken.DATA_PLOT_Y_AVERAGE:
      case anychart.enums.StringToken.DATA_PLOT_POINT_COUNT:
      case anychart.enums.StringToken.DATA_PLOT_SERIES_COUNT:

      case anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_CATEGORY:
      case anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_SERIES:
      case anychart.enums.StringToken.BUBBLE_SIZE_PERCENT_OF_TOTAL:
      case anychart.enums.StringToken.CATEGORY_Y_PERCENT_OF_TOTAL:
      case anychart.enums.StringToken.CATEGORY_Y_RANGE_PERCENT_OF_TOTAL:
      case anychart.enums.StringToken.Y_PERCENT_OF_CATEGORY:
      case anychart.enums.StringToken.Y_PERCENT_OF_SERIES:
      case anychart.enums.StringToken.Y_PERCENT_OF_TOTAL:
      case anychart.enums.StringToken.X_PERCENT_OF_SERIES:
      case anychart.enums.StringToken.X_PERCENT_OF_TOTAL:
        res = anychart.enums.TokenType.NUMBER;
    }
    // case anychart.enums.StringToken.NAME:
    // case anychart.enums.StringToken.SERIES_NAME:
    // case anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_NAME:
    // case anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_NAME:
    // case anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME:
    // case anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME:
    // case anychart.enums.StringToken.DATA_PLOT_MAX_Y_SUM_SERIES_NAME:
    // case anychart.enums.StringToken.DATA_PLOT_MIN_Y_SUM_SERIES_NAME:
    // case anychart.enums.StringToken.SERIES_Y_AXIS_NAME:
    // case anychart.enums.StringToken.SERIES_X_AXIS_NAME:
    // case anychart.enums.StringToken.CATEGORY_NAME:
    // case anychart.enums.StringToken.AXIS_NAME:
    //   res = anychart.enums.TokenType.STRING;
  }
  return res || anychart.enums.TokenType.STRING;
};


/**
 * Returns statistics by name, if available.
 * @param {string} name
 * @return {*}
 */
anychart.core.utils.GenericContextProvider.prototype.getStat = function(name) {
  return this.statsSource_ ? this.statsSource_.getStat(name) : undefined;
};


//exports
(function() {
  var proto = anychart.core.utils.GenericContextProvider.prototype;
  proto['getTokenValue'] = proto.getTokenValue;
  proto['getTokenType'] = proto.getTokenType;
  proto['getStat'] = proto.getStat;
})();
