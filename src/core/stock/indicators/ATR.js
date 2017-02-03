goog.provide('anychart.core.stock.indicators.ATR');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.atr');
goog.require('anychart.utils');



/**
 * ATR indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.ATR = function(plot, mapping, opt_period, opt_seriesType) {
  anychart.core.stock.indicators.ATR.base(this, 'constructor', plot, mapping);

  /**
   * ATR period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.ATR, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.ATR.prototype.createComputer = function(mapping) {
  return anychart.math.atr.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.core.stock.indicators.ATR.prototype.createNameForSeries = function(seriesId, series) {
  return 'ATR(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.ATR|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.ATR.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.ATR|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.ATR|number}
 */
anychart.core.stock.indicators.ATR.prototype.period = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.ATR.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
