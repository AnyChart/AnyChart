goog.provide('anychart.core.utils.StockSeriesContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');



/**
 * Stock series context provider.
 * @param {anychart.core.stock.series.Base} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.StockSeriesContextProvider = function(series, referenceValueNames) {
  anychart.core.utils.StockSeriesContextProvider.base(this, 'constructor');
  /**
   * @type {anychart.core.stock.series.Base}
   */
  this['series'] = series;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};
goog.inherits(anychart.core.utils.StockSeriesContextProvider, anychart.core.utils.BaseContextProvider);


/**
 * Applies reference values.
 */
anychart.core.utils.StockSeriesContextProvider.prototype.applyReferenceValues = function() {
  var currentPoint = this['series'].getCurrentPoint();
  var value;
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = currentPoint ? currentPoint.get(value) : NaN;
    if (!goog.isDef(this[value])) this[value] = NaN;
  }
  this['x'] = currentPoint ? currentPoint.getKey() : NaN;
  this['seriesName'] = this['series'].name();
};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.StockSeriesContextProvider.prototype.getDataValue = function(key) {
  return this['series'].getCurrentPoint().get(key);
};
