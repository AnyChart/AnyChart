goog.provide('anychart.stockModule.indicators.BBands');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.bbands');
goog.require('anychart.utils');



/**
 * Bollinger Bands (BBands) indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_deviation, opt_middleSeriesType, opt_upperSeriesType, opt_lowerSeriesType, opt_rangeSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.BBands = function(args) {
  anychart.stockModule.indicators.BBands.base(this, 'constructor', args);

  /**
   * BBands period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  /**
   * BBands deviation.
   * @type {number}
   * @private
   */
  this.deviation_ = anychart.utils.normalizeToNaturalNumber(args[3], 2, false);

  this.declareSeries('middle', args[4]);
  this.declareSeries('upper', args[5]);
  this.declareSeries('lower', args[6]);
  this.declareSeries('range', args[7], anychart.enums.StockSeriesType.RANGE_AREA);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.BBands, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.BBands.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.bbands.createComputer(mapping, this.period_, this.deviation_);
};


/** @inheritDoc */
anychart.stockModule.indicators.BBands.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'upper':
      return 'BBands U';
    case 'lower':
      return 'BBands L';
    case 'middle':
      return 'BBands M';
    case 'range':
      return 'BBands';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.BBands.prototype.setupMapping = function(mapping, computer, seriesId, series) {
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
    case 'range':
      mapping.addField('high', computer.getFieldIndex('upperResult'));
      mapping.addField('low', computer.getFieldIndex('lowerResult'));
      break;
  }
};


/**
 * Getter for the indicator BBands up series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.BBands|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.BBands.prototype.upperSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.BBands|anychart.stockModule.Series} */(
      this.seriesInternal('upper', opt_type));
};


/**
 * Getter for the indicator BBands down series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.BBands|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.BBands.prototype.lowerSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.BBands|anychart.stockModule.Series} */(
      this.seriesInternal('lower', opt_type));
};


/**
 * Getter for the indicator BBands middle series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.BBands|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.BBands.prototype.middleSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.BBands|anychart.stockModule.Series} */(
      this.seriesInternal('middle', opt_type));
};


/**
 * Getter for the range series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.BBands|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.BBands.prototype.rangeSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.BBands|anychart.stockModule.Series} */(
      this.seriesInternal('range', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.BBands|number}
 */
anychart.stockModule.indicators.BBands.prototype.period = function(opt_value) {
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
 * @return {number|anychart.stockModule.indicators.BBands} deviation or self for chaining.
 */
anychart.stockModule.indicators.BBands.prototype.deviation = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.BBands.prototype;
  proto['period'] = proto.period;
  proto['deviation'] = proto.deviation;
  proto['upperSeries'] = proto.upperSeries;
  proto['lowerSeries'] = proto.lowerSeries;
  proto['middleSeries'] = proto.middleSeries;
  proto['rangeSeries'] = proto.rangeSeries;
})();
