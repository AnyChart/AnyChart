goog.provide('anychart.waterfallModule.Series');
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
anychart.waterfallModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.waterfallModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.waterfallModule.Series, anychart.core.series.Cartesian);


//region --- overrides
/**
 * Token aliases list.
 * @type {Object.<string, string>}
 */
anychart.waterfallModule.Series.prototype.TOKEN_ALIASES = (function() {
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
anychart.waterfallModule.Series.prototype.resolveAutoAnchor = function(position, rotation) {
  if (position == anychart.enums.Position.AUTO) {
    if (this.chart.getSeriesCount() > 1) {
      return anychart.enums.Anchor.CENTER;
    } else {
      position = 'value';
    }
  }

  return anychart.waterfallModule.Series.base(this, 'resolveAutoAnchor', position, rotation);
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.createPositionProvider = function(position, opt_shift3D) {
  if (position == anychart.enums.Position.AUTO) {
    if (this.chart.getSeriesCount() > 1) {
      position = anychart.enums.Position.CENTER;
    } else {
      position = 'value';
    }
  }

  return anychart.waterfallModule.Series.base(this, 'createPositionProvider', position, opt_shift3D);
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.getContextProviderValues = function(provider, rowInfo) {
  var values = anychart.waterfallModule.Series.base(this, 'getContextProviderValues', provider, rowInfo);

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
anychart.waterfallModule.Series.prototype.initPostProcessingMeta = function() {
  return {
    prevValue: 0,
    hadNonMissing: false,
    modeAbsolute: /** @type {string} */ (/** @type {anychart.waterfallModule.Chart} */ (this.chart).getOption('dataMode')) == anychart.enums.WaterfallDataMode.ABSOLUTE
  };
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.postProcessPoint = function(iterator, point, processingMeta) {
  var pointExcluded = goog.array.indexOf(this.excludedPoints || [], point.meta['rawIndex']) > -1;
  var isTotalValue = iterator.get('isTotal');
  var isMissing = (!!point.meta['missing']) || pointExcluded;
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
anychart.waterfallModule.Series.prototype.checkDirectionIsPositive = function(position) {
  var result;
  if (position == 'value') {
    result = (Number(this.getIterator().meta('diff')) || 0) >= 0;
  } else
    result = anychart.waterfallModule.Series.base(this, 'checkDirectionIsPositive', position);
  return result;
};


/** @inheritDoc */
anychart.waterfallModule.Series.prototype.getPointValue = function(rowInfo) {
  return rowInfo.meta('isTotal') ? rowInfo.get('value') : rowInfo.meta('diff');
};


//endregion
