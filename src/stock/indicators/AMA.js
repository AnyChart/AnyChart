goog.provide('anychart.stockModule.indicators.AMA');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.ama');
goog.require('anychart.utils');



/**
 * AMA indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_fastPeriod, opt_slowPeriod, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.AMA = function(args) {
  anychart.stockModule.indicators.AMA.base(this, 'constructor', args);

  /**
   * AMA period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  /**
   * AMA fast period.
   * @type {number}
   * @private
   */
  this.fastPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 2, false);

  /**
   * AMA period.
   * @type {number}
   * @private
   */
  this.slowPeriod_ = anychart.utils.normalizeToNaturalNumber(args[4], 30, false);

  this.declareSeries('main', args[5]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.AMA, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.AMA.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.ama.createComputer(mapping, this.period_, this.fastPeriod_, this.slowPeriod_);
};


/** @inheritDoc */
anychart.stockModule.indicators.AMA.prototype.createNameForSeries = function(seriesId, series) {
  return 'AMA(' + this.period_ + ',' + this.fastPeriod_ + ',' + this.slowPeriod_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.AMA|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.AMA.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.AMA|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.AMA|number}
 */
anychart.stockModule.indicators.AMA.prototype.period = function(opt_value) {
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
 * Getter and setter for the fast period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.AMA|number}
 */
anychart.stockModule.indicators.AMA.prototype.fastPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var fastPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.fastPeriod_, false);
    if (fastPeriod != this.fastPeriod_) {
      this.fastPeriod_ = fastPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.fastPeriod_;
};


/**
 * Getter and setter for the slow period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.AMA|number}
 */
anychart.stockModule.indicators.AMA.prototype.slowPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var slowPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.slowPeriod_, false);
    if (slowPeriod != this.slowPeriod_) {
      this.slowPeriod_ = slowPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.slowPeriod_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.AMA.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
  proto['fastPeriod'] = proto.fastPeriod;
  proto['slowPeriod'] = proto.slowPeriod;
})();

