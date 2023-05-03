goog.provide('anychart.stockModule.indicators.AroonOscillator');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.aroonOscillator');
goog.require('anychart.utils');


/**
 * Aroon Oscillator indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.AroonOscillator = function(args) {
  anychart.stockModule.indicators.AroonOscillator.base(this, 'constructor', args);

  /**
   * Aroon Oscillator period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 25, false);

  this.declareSeries('main', args[3], anychart.enums.StockSeriesType.AREA);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.AroonOscillator, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.AroonOscillator.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.aroonOscillator.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.AroonOscillator.prototype.createNameForSeries = function(seriesId, series) {
  return 'Aroon Oscillator(' + this.period_ + ')';
};


/**
 * Getter for the main series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.AroonOscillator|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.AroonOscillator.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.AroonOscillator|anychart.stockModule.Series} */(
    this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.AroonOscillator|number}
 */
anychart.stockModule.indicators.AroonOscillator.prototype.period = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.AroonOscillator.prototype;
  proto['period'] = proto.period;
  proto['series'] = proto.series;
})();
