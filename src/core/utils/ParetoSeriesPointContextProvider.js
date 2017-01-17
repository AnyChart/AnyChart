goog.provide('anychart.core.utils.ParetoSeriesPointContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.enums');
goog.forwardDeclare('anychart.data.ParetoMapping');
goog.forwardDeclare('anychart.data.ParetoSeriesMapping');



/**
 * Pareto series point context provider.
 * @param {anychart.core.series.Pareto} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @extends {anychart.core.utils.SeriesPointContextProvider}
 * @implements {anychart.core.utils.IContextProvider}
 * @constructor
 */
anychart.core.utils.ParetoSeriesPointContextProvider = function(series, referenceValueNames, addErrorInfo) {
  anychart.core.utils.ParetoSeriesPointContextProvider.base(this, 'constructor', series, referenceValueNames, addErrorInfo);
};
goog.inherits(anychart.core.utils.ParetoSeriesPointContextProvider, anychart.core.utils.SeriesPointContextProvider);


//region --- Overrides
/** @inheritDoc */
anychart.core.utils.ParetoSeriesPointContextProvider.prototype.applyReferenceValuesInternal = function(point) {
  anychart.core.utils.ParetoSeriesPointContextProvider.base(this, 'applyReferenceValuesInternal', point);
  if (goog.isDef(this['index']) && this['index'] > -1) {
    var data = this.seriesInternal.data();
    if (goog.isDef(data)) {
      var paretoMapping = /** @type {anychart.data.Mapping} */ (data.getRowMapping(this['index']));
      if ((paretoMapping instanceof anychart.data.ParetoMapping) || (paretoMapping instanceof anychart.data.ParetoSeriesMapping)) {
        this['cf'] = paretoMapping.getCumulativeFrequency(this['index']);
        this['rf'] = paretoMapping.getRelativeFrequency(this['index']);
      }
    }
  }
};


/** @inheritDoc */
anychart.core.utils.ParetoSeriesPointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.CUMULATIVE_FREQUENCY:
      return this['cf'];
    case anychart.enums.StringToken.RELATIVE_FREQUENCY:
      return this['rf'];
  }
  return anychart.core.utils.ParetoSeriesPointContextProvider.base(this, 'getTokenValue', name);
};


/** @inheritDoc */
anychart.core.utils.ParetoSeriesPointContextProvider.prototype.getTokenType = function(name) {
  switch (name) {
    case anychart.enums.StringToken.CUMULATIVE_FREQUENCY:
    case anychart.enums.StringToken.RELATIVE_FREQUENCY:
      return anychart.enums.TokenType.NUMBER;
  }
  return anychart.core.utils.ParetoSeriesPointContextProvider.base(this, 'getTokenType', name);
};


//endregion

//exports

anychart.core.utils.ParetoSeriesPointContextProvider.prototype['getTokenValue'] = anychart.core.utils.ParetoSeriesPointContextProvider.prototype.getTokenValue;
anychart.core.utils.ParetoSeriesPointContextProvider.prototype['getTokenType'] = anychart.core.utils.ParetoSeriesPointContextProvider.prototype.getTokenType;

