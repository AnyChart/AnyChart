goog.provide('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.ITokenProvider');
goog.require('anychart.enums');



/**
 * Base class for context providers.
 * @implements {anychart.core.utils.ITokenProvider}
 * @constructor
 */
anychart.core.utils.BaseContextProvider = function() {
  /**
   * @type {anychart.core.Chart}
   */
  this.chartInternal = null;

  /**
   * @type {(anychart.core.series.Base|anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)}
   */
  this.seriesInternal = null;

  /**
   * @type {anychart.core.Point}
   */
  this.pointInternal = null;
};


/** @inheritDoc */
anychart.core.utils.BaseContextProvider.prototype.getTokenValue = function(name) {
  var origName = name.substr(1);
  var statName = origName.charAt(0).toLowerCase() + origName.slice(1);

  if (this.pointInternal && goog.isDef(this.pointInternal.getStat(statName))) {
    return this.pointInternal.getStat(statName);
  } else if (this.seriesInternal && this.seriesInternal.getStat(statName)) {
    return this.seriesInternal.getStat(statName);
  } else if (this.chartInternal && this.chartInternal.getStat && this.chartInternal.getStat(statName)) {
    return this.chartInternal.getStat(statName);
  }

  switch (name) {
    case anychart.enums.StringToken.VALUE:
    case anychart.enums.StringToken.Y_VALUE:
      return this['value'];
    case anychart.enums.StringToken.INDEX:
      return this['index'];
    default:
      return this.getDataValue(origName);
  }
};


/** @inheritDoc */
anychart.core.utils.BaseContextProvider.prototype.getTokenType = function(name) {
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
    case anychart.enums.StringToken.PERCENT_VALUE:
      return anychart.enums.TokenType.NUMBER;

    case anychart.enums.StringToken.NAME:
    case anychart.enums.StringToken.SERIES_NAME:
    case anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_NAME:
    case anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_NAME:
    case anychart.enums.StringToken.DATA_PLOT_MAX_Y_VALUE_POINT_SERIES_NAME:
    case anychart.enums.StringToken.DATA_PLOT_MIN_Y_VALUE_POINT_SERIES_NAME:
    case anychart.enums.StringToken.DATA_PLOT_MAX_Y_SUM_SERIES_NAME:
    case anychart.enums.StringToken.DATA_PLOT_MIN_Y_SUM_SERIES_NAME:
    case anychart.enums.StringToken.SERIES_Y_AXIS_NAME:
    case anychart.enums.StringToken.SERIES_X_AXIS_NAME:
    case anychart.enums.StringToken.CATEGORY_NAME:
    case anychart.enums.StringToken.AXIS_NAME:
      return anychart.enums.TokenType.STRING;
    default:
      return anychart.enums.TokenType.STRING;
  }
};


//exports
(function() {
  var proto = anychart.core.utils.BaseContextProvider.prototype;
  proto['getTokenValue'] = proto.getTokenValue;
  proto['getTokenType'] = proto.getTokenType;
})();
