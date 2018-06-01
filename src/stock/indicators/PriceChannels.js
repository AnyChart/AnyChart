goog.provide('anychart.stockModule.indicators.PriceChannels');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.priceChannels');
goog.require('anychart.utils');



/**
 * PriceChannels indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_upperSeriesType, opt_middleSeriesType, opt_lowerSeriesType, opt_rangeSeriesType]
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

  this.declareSeries('upper', args[3]);
  this.declareSeries('middle', args[4]);
  this.declareSeries('lower', args[5]);
  this.declareSeries('range', args[6], anychart.enums.StockSeriesType.RANGE_AREA);
  this.init();
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
    case 'upper':
      return 'PriceChannels U';
    case 'middle':
      return 'PriceChannels M';
    case 'lower':
      return 'PriceChannels L';
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
    case 'upper':
      mapping.addField('value', computer.getFieldIndex('upperResult'));
      break;
    case 'middle':
      mapping.addField('value', computer.getFieldIndex('middleResult'));
      break;
    case 'lower':
      mapping.addField('value', computer.getFieldIndex('lowerResult'));
      break;
  }
};


/**
 * Getter for the indicator Price Channels upper series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PriceChannels.prototype.upperSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series} */(
      this.seriesInternal('upper', opt_type));
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
 * Getter for the indicator Price Channels lower series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PriceChannels.prototype.lowerSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PriceChannels|anychart.stockModule.Series} */(
      this.seriesInternal('lower', opt_type));
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
  proto['upperSeries'] = proto.upperSeries;
  proto['middleSeries'] = proto.middleSeries;
  proto['lowerSeries'] = proto.lowerSeries;
  proto['rangeSeries'] = proto.rangeSeries;
})();
