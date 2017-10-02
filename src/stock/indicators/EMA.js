goog.provide('anychart.stockModule.indicators.EMA');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.ema');
goog.require('anychart.utils');



/**
 * EMA indicator class.
 * @param {!(anychart.stockModule.Plot|anychart.stockModule.Scroller)} plot
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.EMA = function(plot, mapping, opt_period, opt_seriesType) {
  anychart.stockModule.indicators.EMA.base(this, 'constructor', plot, mapping);

  /**
   * EMA period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.EMA, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.EMA.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.ema.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.EMA.prototype.createNameForSeries = function(seriesId, series) {
  return 'EMA(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.EMA|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.EMA.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.EMA|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.EMA|number}
 */
anychart.stockModule.indicators.EMA.prototype.period = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.EMA.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
