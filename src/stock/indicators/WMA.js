goog.provide('anychart.stockModule.indicators.WMA');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.wma');
goog.require('anychart.utils');



/**
 * WMA indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.WMA = function(args) {
  anychart.stockModule.indicators.WMA.base(this, 'constructor', args);

  /**
   * WMA period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 9, false);

  this.declareSeries('main', args[3]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.WMA, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.WMA.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.wma.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.WMA.prototype.createNameForSeries = function(seriesId, series) {
  return 'WMA(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.WMA|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.WMA.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.WMA|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.WMA|number}
 */
anychart.stockModule.indicators.WMA.prototype.period = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.WMA.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
