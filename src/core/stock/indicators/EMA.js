goog.provide('anychart.core.stock.indicators.EMA');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.ema');
goog.require('anychart.utils');



/**
 * EMA indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.EMA = function(plot, mapping, opt_period, opt_seriesType) {
  anychart.core.stock.indicators.EMA.base(this, 'constructor', plot, mapping);

  /**
   * EMA period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.EMA, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.EMA.prototype.createComputer = function(mapping) {
  return anychart.math.ema.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.core.stock.indicators.EMA.prototype.createNameForSeries = function(seriesId, series) {
  return 'EMA(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.EMA|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.EMA.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.EMA|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.EMA|number}
 */
anychart.core.stock.indicators.EMA.prototype.period = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.EMA.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
