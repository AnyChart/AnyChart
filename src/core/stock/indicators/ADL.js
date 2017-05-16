goog.provide('anychart.core.stock.indicators.ADL');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.adl');
goog.require('anychart.utils');



/**
 * ADL indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.ADL = function(plot, mapping, opt_seriesType) {
  anychart.core.stock.indicators.ADL.base(this, 'constructor', plot, mapping);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.ADL, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.ADL.prototype.createComputer = function(mapping) {
  return anychart.math.adl.createComputer(mapping);
};


/** @inheritDoc */
anychart.core.stock.indicators.ADL.prototype.createNameForSeries = function(seriesId, series) {
  return 'ADL';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.ADL|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.ADL.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.ADL|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


//exports
(function() {
  var proto = anychart.core.stock.indicators.ADL.prototype;
  proto['series'] = proto.series;
})();
