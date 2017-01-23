goog.provide('anychart.core.stock.indicators.BBandsB');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.bbandsB');
goog.require('anychart.utils');



/**
 * Bollinger Bands %B (BBands %B) indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_deviation
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.BBandsB = function(plot, mapping, opt_period, opt_deviation, opt_seriesType) {
  anychart.core.stock.indicators.BBandsB.base(this, 'constructor', plot, mapping);

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
goog.inherits(anychart.core.stock.indicators.BBandsB, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.BBandsB.prototype.createComputer = function(mapping) {
  return anychart.math.bbandsB.createComputer(mapping, this.period_, this.deviation_);
};


/** @inheritDoc */
anychart.core.stock.indicators.BBandsB.prototype.createNameForSeries = function(seriesId, series) {
  return 'BBands %B(' + this.period_ + ',' + this.deviation_ + ')';
};


/**
 * Getter for the indicator BBands %B series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.BBandsB|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.BBandsB.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.BBandsB|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.BBandsB|number}
 */
anychart.core.stock.indicators.BBandsB.prototype.period = function(opt_value) {
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
 * @return {number|anychart.core.stock.indicators.BBandsB} deviation or self for chaining.
 */
anychart.core.stock.indicators.BBandsB.prototype.deviation = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.BBandsB.prototype;
  proto['period'] = proto.period;
  proto['deviation'] = proto.deviation;
  proto['series'] = proto.series;
})();
