goog.provide('anychart.stockModule.indicators.ADL');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.adl');
goog.require('anychart.utils');



/**
 * ADL indicator class.
 * @param {!(anychart.stockModule.Plot|anychart.stockModule.Scroller)} plot
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.ADL = function(plot, mapping, opt_seriesType) {
  anychart.stockModule.indicators.ADL.base(this, 'constructor', plot, mapping);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.ADL, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.ADL.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.adl.createComputer(mapping);
};


/** @inheritDoc */
anychart.stockModule.indicators.ADL.prototype.createNameForSeries = function(seriesId, series) {
  return 'ADL';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.ADL|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.ADL.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.ADL|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.ADL.prototype;
  proto['series'] = proto.series;
})();
