goog.provide('anychart.stockModule.indicators.PriceChannels');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.priceChannels');
goog.require('anychart.utils');



/**
 * PriceChannels indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_middleSeriesType, opt_rangeSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.PriceChannels = function(args) {
  anychart.stockModule.indicators.PriceChannels.base(this, 'constructor', args);

  /**
   * Indicator period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  this.declareSeries('middle', args[3]);
  this.declareSeries('range', args[4], anychart.enums.StockSeriesType.RANGE_AREA);
  this.init();
  this.rangeSeries()['fill'](function() {
    return anychart.color.setOpacity(this['sourceColor'], 0.1);
  });
};
goog.inherits(anychart.stockModule.indicators.PriceChannels, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.PriceChannels.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.priceChannels.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.PriceChannels.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'range':
      return 'PriceChannels';
    case 'middle':
      return 'PriceChannels M';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.PriceChannels.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'range':
      mapping.addField('high', computer.getFieldIndex('upperResult'));
      mapping.addField('low', computer.getFieldIndex('lowerResult'));
      break;
    case 'middle':
      mapping.addField('value', computer.getFieldIndex('middleResult'));
      break;
  }
};


/**
 * Getter for the indicator Price Channels middle series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PriceChannels.prototype.middleSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series} */(
      this.seriesInternal('middle', opt_type));
};


/**
 * Getter for the indicator Price Channels range series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PriceChannels.prototype.rangeSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series} */(
      this.seriesInternal('range', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PriceChannels|number}
 */
anychart.stockModule.indicators.PriceChannels.prototype.period = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.period_, false);
    if (period != this.period_) {
      this.period_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.period_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.PriceChannels.prototype;
  proto['period'] = proto.period;
  proto['middleSeries'] = proto.middleSeries;
  proto['rangeSeries'] = proto.rangeSeries;
})();
