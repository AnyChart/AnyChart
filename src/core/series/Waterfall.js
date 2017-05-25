goog.provide('anychart.core.series.Waterfall');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.core.series.Waterfall = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.Waterfall.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.core.series.Waterfall, anychart.core.series.Cartesian);


//region --- overrides
/**
 * Token aliases list.
 * @type {Object.<string, string>}
 */
anychart.core.series.Waterfall.prototype.TOKEN_ALIASES = (function() {
  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.BUBBLE_SIZE] = 'size';
  tokenAliases[anychart.enums.StringToken.RANGE_START] = 'low';
  tokenAliases[anychart.enums.StringToken.RANGE_END] = 'high';
  tokenAliases[anychart.enums.StringToken.X_VALUE] = 'x';
  tokenAliases[anychart.enums.StringToken.DIFF] = 'diff';
  tokenAliases[anychart.enums.StringToken.ABSOLUTE] = 'absolute';
  tokenAliases[anychart.enums.StringToken.IS_TOTAL] = 'isTotal';
  return tokenAliases;
})();


/** @inheritDoc */
anychart.core.series.Waterfall.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = anychart.core.series.Waterfall.base(this, 'getContextProviderValues', provider, rowInfo);

  values['diff'] = {
    value: rowInfo.meta('diff'),
    type: anychart.enums.TokenType.NUMBER
  };
  values['absolute'] = {
    value: rowInfo.meta('absolute'),
    type: anychart.enums.TokenType.NUMBER
  };
  values['isTotal'] = {
    value: rowInfo.meta('isTotal'),
    type: anychart.enums.TokenType.UNKNOWN
  };
  return values;
};


/** @inheritDoc */
anychart.core.series.Waterfall.prototype.initPostProcessingMeta = function() {
  return {
    prevValue: 0,
    hadNonMissing: false,
    modeAbsolute: this.chart.dataMode() == anychart.enums.WaterfallDataMode.ABSOLUTE
  };
};


/** @inheritDoc */
anychart.core.series.Waterfall.prototype.postProcessPoint = function(iterator, point, processingMeta) {
  var isTotalValue = iterator.get('isTotal');
  var isMissing = !!point.meta['missing'];
  var isFirstPoint = !(processingMeta.hadNonMissing || isMissing);
  var isTotal = isFirstPoint ||
      (goog.isDef(isTotalValue) ? !!isTotalValue : isMissing);
  if (isMissing && (isFirstPoint || !isTotal)) {
    point.meta['missing'] = anychart.core.series.PointAbsenceReason.VALUE_FIELD_MISSING;
  } else {
    var value;
    if (processingMeta.modeAbsolute) {
      value = isMissing ? processingMeta.prevValue : +(point.data['value']);
    } else {
      value = processingMeta.prevValue + (isMissing ? 0 : +(point.data['value']));
    }
    point.meta['absolute'] = value;
    point.meta['diff'] = value - processingMeta.prevValue;
    point.meta['isTotal'] = isTotal;
    point.meta['missing'] = 0;
    processingMeta.hadNonMissing = true;
    processingMeta.prevValue = value;
  }
};


/** @inheritDoc */
anychart.core.series.Waterfall.prototype.checkDirectionIsPositive = function(position) {
  var result;
  if (position == 'value') {
    result = (Number(this.getIterator().meta('diff')) || 0) >= 0;
  } else
    result = anychart.core.series.Waterfall.base(this, 'checkDirectionIsPositive', position);
  return result;
};


//endregion
