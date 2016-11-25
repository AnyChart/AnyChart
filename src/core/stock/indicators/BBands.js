goog.provide('anychart.core.stock.indicators.BBands');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.bbands');
goog.require('anychart.opt');
goog.require('anychart.utils');



/**
 * Bollinger Bands (BBands) indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @param {anychart.enums.StockSeriesType=} opt_upSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_downSeriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.BBands = function(plot, mapping, opt_period, opt_deviation, opt_upSeriesType, opt_downSeriesType) {
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

  this.declareSeries(anychart.opt.UP, opt_upSeriesType);
  this.declareSeries(anychart.opt.DOWN, opt_downSeriesType);
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
    case anychart.opt.UP:
      return 'BBands U';
    case anychart.opt.DOWN:
      return 'BBands L';
  }
  return '';
};


/** @inheritDoc */
anychart.core.stock.indicators.BBands.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case anychart.opt.UP:
      mapping.addField(anychart.opt.VALUE, computer.getFieldIndex(anychart.opt.UP_RESULT));
      break;
    case anychart.opt.DOWN:
      mapping.addField(anychart.opt.VALUE, computer.getFieldIndex(anychart.opt.DOWN_RESULT));
      break;
  }
};


/**
 * Getter for the indicator Aroon series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBands|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBands.prototype.upSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBands|anychart.core.series.Stock} */(
      this.seriesInternal(anychart.opt.UP, opt_type));
};


/**
 * Getter for the indicator signal series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBands|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBands.prototype.downSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBands|anychart.core.series.Stock} */(
      this.seriesInternal(anychart.opt.DOWN, opt_type));
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
anychart.core.stock.indicators.BBands.prototype['period'] = anychart.core.stock.indicators.BBands.prototype.period;
anychart.core.stock.indicators.BBands.prototype['deviation'] = anychart.core.stock.indicators.BBands.prototype.deviation;
anychart.core.stock.indicators.BBands.prototype['upSeries'] = anychart.core.stock.indicators.BBands.prototype.upSeries;
anychart.core.stock.indicators.BBands.prototype['downSeries'] = anychart.core.stock.indicators.BBands.prototype.downSeries;
