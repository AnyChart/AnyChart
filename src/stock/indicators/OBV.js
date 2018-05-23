goog.provide('anychart.stockModule.indicators.OBV');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.obv');
goog.require('anychart.utils');



/**
 * OBV indicator class.
 * @param {Array} args [plot, mapping, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.OBV = function(args) {
  anychart.stockModule.indicators.OBV.base(this, 'constructor', args);
  this.declareSeries('main', args[2]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.OBV, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.OBV.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.obv.createComputer(mapping);
};


/** @inheritDoc */
anychart.stockModule.indicators.OBV.prototype.createNameForSeries = function(seriesId, series) {
  return 'OBV';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.OBV|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.OBV.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.OBV|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.OBV.prototype;
  proto['series'] = proto.series;
})();
