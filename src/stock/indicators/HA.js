goog.provide('anychart.stockModule.indicators.HA');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.ha');
goog.require('anychart.utils');


/**
 * HA indicator class.
 * @param {Array} args [plot, mapping, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.HA = function(args) {
  anychart.stockModule.indicators.HA.base(this, 'constructor', args);
  this.declareSeries('main', args[2], anychart.enums.StockSeriesType.CANDLESTICK);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.HA, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.HA.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.ha.createComputer(mapping);
};


/** @inheritDoc */
anychart.stockModule.indicators.HA.prototype.createNameForSeries = function() {
  return 'HA';
};


/** @inheritDoc */
anychart.stockModule.indicators.HA.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  mapping.addField('open', computer.getFieldIndex('haOpen'));
  mapping.addField('high', computer.getFieldIndex('haHigh'));
  mapping.addField('low', computer.getFieldIndex('haLow'));
  mapping.addField('close', computer.getFieldIndex('haClose'));
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.HA|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.HA.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.HA|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.HA.prototype;
  proto['series'] = proto.series;
})();
