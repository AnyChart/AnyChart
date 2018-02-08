goog.provide('anychart.stockModule.indicators.WilliamsR');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.williamsR');
goog.require('anychart.utils');



/**
 * WilliamsR indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.WilliamsR = function(args) {
  anychart.stockModule.indicators.WilliamsR.base(this, 'constructor', args);

  /**
   * Period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 10, false);

  this.declareSeries('series', args[3]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.WilliamsR, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.WilliamsR.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.williamsR.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.WilliamsR.prototype.createNameForSeries = function(seriesId, series) {
  return 'Williams %R(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.WilliamsR|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.WilliamsR.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.WilliamsR|anychart.stockModule.Series} */(
      this.seriesInternal('series', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.WilliamsR|number}
 */
anychart.stockModule.indicators.WilliamsR.prototype.period = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.WilliamsR.prototype;
  proto['period'] = proto.period;
  proto['series'] = proto.series;
})();
