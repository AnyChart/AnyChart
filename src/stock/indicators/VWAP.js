goog.provide('anychart.stockModule.indicators.VWAP');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.vwap');



/**
 * Volume Weighted Average Price (VWAP) indicator class.
 * @param {Array} args [plot, mapping, opt_vwapSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.VWAP = function(args) {
  anychart.stockModule.indicators.VWAP.base(this, 'constructor', args);

  this.declareSeries('vwapSeries', args[2]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.VWAP, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.VWAP.prototype.createComputer = function(mapping, chart) {
  return anychart.stockModule.math.vwap.createComputer(mapping, chart);
};


/** @inheritDoc */
anychart.stockModule.indicators.VWAP.prototype.createNameForSeries = function(seriesId, series) {
  return 'VWAP';
};


/** @inheritDoc */
anychart.stockModule.indicators.VWAP.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  mapping.addField('value', computer.getFieldIndex('vwapValue'));
};


/**
 * Getter for the indicator VWAP series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.VWAP|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.VWAP.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.VWAP|anychart.stockModule.Series} */(
      this.seriesInternal('vwapSeries', opt_type));
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.VWAP.prototype;
  proto['series'] = proto.series;
})();
