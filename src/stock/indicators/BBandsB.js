goog.provide('anychart.stockModule.indicators.BBandsB');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.bbandsB');
goog.require('anychart.utils');



/**
 * Bollinger Bands %B (BBands %B) indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_deviation, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.BBandsB = function(args) {
  anychart.stockModule.indicators.BBandsB.base(this, 'constructor', args);

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

  this.declareSeries('main', args[4]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.BBandsB, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.BBandsB.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.bbandsB.createComputer(mapping, this.period_, this.deviation_);
};


/** @inheritDoc */
anychart.stockModule.indicators.BBandsB.prototype.createNameForSeries = function(seriesId, series) {
  return 'BBands %B(' + this.period_ + ',' + this.deviation_ + ')';
};


/**
 * Getter for the indicator BBands %B series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.BBandsB|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.BBandsB.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.BBandsB|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.BBandsB|number}
 */
anychart.stockModule.indicators.BBandsB.prototype.period = function(opt_value) {
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
 * @return {number|anychart.stockModule.indicators.BBandsB} deviation or self for chaining.
 */
anychart.stockModule.indicators.BBandsB.prototype.deviation = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.BBandsB.prototype;
  proto['period'] = proto.period;
  proto['deviation'] = proto.deviation;
  proto['series'] = proto.series;
})();
