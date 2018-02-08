goog.provide('anychart.stockModule.indicators.MACD');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.macd');
goog.require('anychart.utils');



/**
 * EMA indicator class.
 * @param {Array} args [plot, mapping, opt_fastPeriod, opt_slowPeriod, opt_signalPeriod, opt_macdSeriesType, opt_signalSeriesType, opt_histogramSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.MACD = function(args) {
  anychart.stockModule.indicators.MACD.base(this, 'constructor', args);

  /**
   * Fast period.
   * @type {number}
   * @private
   */
  this.fastPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 12, false);

  /**
   * Slow period.
   * @type {number}
   * @private
   */
  this.slowPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 26, false);

  /**
   *Ssignal period.
   * @type {number}
   * @private
   */
  this.signalPeriod_ = anychart.utils.normalizeToNaturalNumber(args[4], 9, false);

  this.declareSeries('macd', args[5]);
  this.declareSeries('signal', args[6]);
  this.declareSeries('histogram', args[7], anychart.enums.StockSeriesType.COLUMN);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.MACD, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.MACD.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.macd.createComputer(mapping, this.fastPeriod_,
      this.slowPeriod_, this.signalPeriod_);
};


/** @inheritDoc */
anychart.stockModule.indicators.MACD.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'macd':
      return 'MACD(' + this.fastPeriod_ + ',' + this.slowPeriod_ + ',' + this.signalPeriod_ + ')';
    case 'signal':
      return 'Signal';
    case 'histogram':
      return 'Histogram';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.MACD.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'macd':
      mapping.addField('value', computer.getFieldIndex('macdResult'));
      break;
    case 'signal':
      mapping.addField('value', computer.getFieldIndex('signalResult'));
      break;
    case 'histogram':
      mapping.addField('value', computer.getFieldIndex('histogramResult'));
      break;
  }
};


/**
 * Getter for the indicator MACD series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.MACD|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.MACD.prototype.macdSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.MACD|anychart.stockModule.Series} */(
      this.seriesInternal('macd', opt_type));
};


/**
 * Getter for the indicator signal series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.MACD|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.MACD.prototype.signalSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.MACD|anychart.stockModule.Series} */(
      this.seriesInternal('signal', opt_type));
};


/**
 * Getter for the indicator histogram series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.MACD|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.MACD.prototype.histogramSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.MACD|anychart.stockModule.Series} */(
      this.seriesInternal('histogram', opt_type));
};


/**
 * Getter and setter for the fast period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.MACD|number}
 */
anychart.stockModule.indicators.MACD.prototype.fastPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.fastPeriod_, false);
    if (period != this.fastPeriod_) {
      this.fastPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.fastPeriod_;
};


/**
 * Getter and setter for the slow period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.MACD|number}
 */
anychart.stockModule.indicators.MACD.prototype.slowPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.slowPeriod_, false);
    if (period != this.slowPeriod_) {
      this.slowPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.slowPeriod_;
};


/**
 * Getter and setter for the signal period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.MACD|number}
 */
anychart.stockModule.indicators.MACD.prototype.signalPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.signalPeriod_, false);
    if (period != this.signalPeriod_) {
      this.signalPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.signalPeriod_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.MACD.prototype;
  proto['macdSeries'] = proto.macdSeries;
  proto['signalSeries'] = proto.signalSeries;
  proto['histogramSeries'] = proto.histogramSeries;
  proto['fastPeriod'] = proto.fastPeriod;
  proto['slowPeriod'] = proto.slowPeriod;
  proto['signalPeriod'] = proto.signalPeriod;
})();
