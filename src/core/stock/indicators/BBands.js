goog.provide('anychart.core.stock.indicators.BBands');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.bbands');
goog.require('anychart.utils');



/**
 * Bollinger Bands (BBands) indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @param {anychart.enums.StockSeriesType=} opt_middleSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_upperSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_lowerSeriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.BBands = function(plot, mapping, opt_period, opt_deviation, opt_middleSeriesType, opt_upperSeriesType, opt_lowerSeriesType) {
  anychart.core.stock.indicators.BBands.base(this, 'constructor', plot, mapping);

  /**
   * BBands period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);

  /**
   * BBands deviation.
   * @type {number}
   * @private
   */
  this.deviation_ = anychart.utils.normalizeToNaturalNumber(opt_deviation, 2, false);

  this.declareSeries('middle', opt_middleSeriesType);
  this.declareSeries('upper', opt_upperSeriesType);
  this.declareSeries('lower', opt_lowerSeriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.BBands, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.BBands.prototype.createComputer = function(mapping) {
  return anychart.math.bbands.createComputer(mapping, this.period_, this.deviation_);
};


/** @inheritDoc */
anychart.core.stock.indicators.BBands.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'upper':
      return 'BBands U';
    case 'lower':
      return 'BBands L';
    case 'middle':
      return 'BBands M';
  }
  return '';
};


/** @inheritDoc */
anychart.core.stock.indicators.BBands.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'upper':
      mapping.addField('value', computer.getFieldIndex('upperResult'));
      break;
    case 'lower':
      mapping.addField('value', computer.getFieldIndex('lowerResult'));
      break;
    case 'middle':
      mapping.addField('value', computer.getFieldIndex('middleResult'));
      break;
  }
};


/**
 * Getter for the indicator BBands up series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBands|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBands.prototype.upperSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBands|anychart.core.series.Stock} */(
      this.seriesInternal('upper', opt_type));
};


/**
 * Getter for the indicator BBands down series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBands|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBands.prototype.lowerSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBands|anychart.core.series.Stock} */(
      this.seriesInternal('lower', opt_type));
};


/**
 * Getter for the indicator BBands middle series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBands|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBands.prototype.middleSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBands|anychart.core.series.Stock} */(
      this.seriesInternal('middle', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.BBands|number}
 */
anychart.core.stock.indicators.BBands.prototype.period = function(opt_value) {
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


/**
 * Getter/setter for deviation.
 * @param {number=} opt_value deviation.
 * @return {number|anychart.core.stock.indicators.BBands} deviation or self for chaining.
 */
anychart.core.stock.indicators.BBands.prototype.deviation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.deviation_, false);
    if (this.deviation_ != opt_value) {
      this.deviation_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.deviation_;
};


//exports
(function() {
  var proto = anychart.core.stock.indicators.BBands.prototype;
  proto['period'] = proto.period;
  proto['deviation'] = proto.deviation;
  proto['upperSeries'] = proto.upperSeries;
  proto['lowerSeries'] = proto.lowerSeries;
  proto['middleSeries'] = proto.middleSeries;
})();
