goog.provide('anychart.core.stock.indicators.BBandsWidth');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.bbandsWidth');
goog.require('anychart.utils');



/**
 * Bollinger Bands Width (BBands Width) indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.BBandsWidth = function(plot, mapping, opt_period, opt_deviation, opt_seriesType) {
  anychart.core.stock.indicators.BBandsWidth.base(this, 'constructor', plot, mapping);

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

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.BBandsWidth, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.BBandsWidth.prototype.createComputer = function(mapping) {
  return anychart.math.bbandsWidth.createComputer(mapping, this.period_, this.deviation_);
};


/** @inheritDoc */
anychart.core.stock.indicators.BBandsWidth.prototype.createNameForSeries = function(seriesId, series) {
  return 'BBands Width(' + this.period_ + ',' + this.deviation_ + ')';
};


/**
 * Getter for the indicator BBandsWidth series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBandsWidth|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBandsWidth.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBandsWidth|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.BBandsWidth|number}
 */
anychart.core.stock.indicators.BBandsWidth.prototype.period = function(opt_value) {
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
 * @return {number|anychart.core.stock.indicators.BBandsWidth} deviation or self for chaining.
 */
anychart.core.stock.indicators.BBandsWidth.prototype.deviation = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.BBandsWidth.prototype;
  proto['period'] = proto.period;
  proto['deviation'] = proto.deviation;
  proto['series'] = proto.series;
})();
