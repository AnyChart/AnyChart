goog.provide('anychart.core.utils.StockHighlightContextProvider');
goog.require('anychart.core.utils.SeriesPointContextProvider');



/**
 * Stock series context provider.
 * @param {anychart.core.series.Stock} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @extends {anychart.core.utils.SeriesPointContextProvider}
 * @constructor
 */
anychart.core.utils.StockHighlightContextProvider = function(series, referenceValueNames, addErrorInfo) {
  anychart.core.utils.StockHighlightContextProvider.base(this, 'constructor', series, referenceValueNames, addErrorInfo);
};
goog.inherits(anychart.core.utils.StockHighlightContextProvider, anychart.core.utils.SeriesPointContextProvider);


/**
 * Applies reference values.
 */
anychart.core.utils.StockHighlightContextProvider.prototype.applyReferenceValues = function() {
  this.applyReferenceValuesInternal((/** @type {anychart.core.series.Stock} */(this['series'])).getCurrentPoint());
};


/** @inheritDoc */
anychart.core.utils.StockHighlightContextProvider.prototype.getDataValue = function(key) {
  var point = this['series'].getCurrentPoint();
  return point ? point.get(key) : void 0;
};


//exports
(function() {
  var proto = anychart.core.utils.StockHighlightContextProvider.prototype;
  proto['getDataValue'] = proto.getDataValue;
})();
