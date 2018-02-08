goog.provide('anychart.stockModule.indicators.SMA');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.sma');
goog.require('anychart.utils');



/**
 * SMA indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.SMA = function(args) {
  anychart.stockModule.indicators.SMA.base(this, 'constructor', args);

  /**
   * SMA period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  this.declareSeries('main', args[3]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.SMA, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.SMA.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.sma.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.SMA.prototype.createNameForSeries = function(seriesId, series) {
  return 'SMA(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.SMA|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.SMA.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.SMA|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.SMA|number}
 */
anychart.stockModule.indicators.SMA.prototype.period = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.SMA.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
