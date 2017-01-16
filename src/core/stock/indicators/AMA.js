goog.provide('anychart.core.stock.indicators.AMA');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.ama');
goog.require('anychart.utils');



/**
 * AMA indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {number=} opt_fastPeriod
 * @param {number=} opt_slowPeriod
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.AMA = function(plot, mapping, opt_period, opt_fastPeriod, opt_slowPeriod, opt_seriesType) {
  anychart.core.stock.indicators.AMA.base(this, 'constructor', plot, mapping);

  /**
   * AMA period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);

  /**
   * AMA fast period.
   * @type {number}
   * @private
   */
  this.fastPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 2, false);

  /**
   * AMA period.
   * @type {number}
   * @private
   */
  this.slowPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 30, false);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.AMA, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.AMA.prototype.createComputer = function(mapping) {
  return anychart.math.ama.createComputer(mapping, this.period_, this.fastPeriod_, this.slowPeriod_);
};


/** @inheritDoc */
anychart.core.stock.indicators.AMA.prototype.createNameForSeries = function(seriesId, series) {
  return 'AMA(' + this.period_ + ',' + this.fastPeriod_ + ',' + this.slowPeriod_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.AMA|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.AMA.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.AMA|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.AMA|number}
 */
anychart.core.stock.indicators.AMA.prototype.period = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.AMA|number}
 */
anychart.core.stock.indicators.AMA.prototype.fastPeriod = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.AMA|number}
 */
anychart.core.stock.indicators.AMA.prototype.slowPeriod = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.AMA.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
  proto['fastPeriod'] = proto.fastPeriod;
  proto['slowPeriod'] = proto.slowPeriod;
})();

