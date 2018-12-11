goog.provide('anychart.stockModule.indicators.AO');
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.ao');
goog.require('anychart.utils');



/**
 * AO indicator class
 * @param {Array} args [plot, mapping, opt_fastPeriod, opt_slowPeriod, opt_maType, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.AO = function(args) {
  anychart.stockModule.indicators.AO.base(this, 'constructor', args);

  /**
   * Fast period.
   * @type {number}
   * @private
   */
  this.fastPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 5, false);

  /**
   * Slow period.
   * @type {number}
   * @private
   */
  this.slowPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 34, false);

  /**
   * MA type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.maType_ = anychart.enums.normalizeMovingAverageType(args[4], anychart.enums.MovingAverageType.SMA);

  this.declareSeries('main', args[5], anychart.enums.StockSeriesType.STICK);
  this.init();

  var settingsGetter = new anychart.core.Base();
  settingsGetter.addThemes(
      'chart.defaultSeriesSettings.base.normal',
      'stock.defaultPlotSettings.defaultSeriesSettings.base.normal',
      'chart.defaultSeriesSettings.lineLike.normal',
      'stock.defaultPlotSettings.defaultSeriesSettings.lineLike.normal',
      'chart.defaultSeriesSettings.ohlc.normal',
      'stock.defaultPlotSettings.defaultSeriesSettings.ohlc.normal');
  var ohlcRising = settingsGetter.themeSettings['risingStroke'];
  var ohlcFalling = settingsGetter.themeSettings['fallingStroke'];

  this.series()['risingStroke'](ohlcRising);
  this.series()['fallingStroke'](ohlcFalling);
  this.series()['risingFill'](ohlcRising);
  this.series()['fallingFill'](ohlcFalling);
};
goog.inherits(anychart.stockModule.indicators.AO, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.AO.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.ao.createComputer(mapping, this.fastPeriod_, this.slowPeriod_, this.maType_);
};


/** @inheritDoc */
anychart.stockModule.indicators.AO.prototype.createNameForSeries = function(seriesId, series) {
  return 'AO(' + this.fastPeriod_ + ', ' + this.slowPeriod_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.AO|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.AO.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.AO|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the fast period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.AO|number}
 */
anychart.stockModule.indicators.AO.prototype.fastPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.fastPeriod_, false);
    if (period != this.fastPeriod_) {
      this.fastPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.fastPeriod_;
};


/**
 * Getter and setter for the slow period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.AO|number}
 */
anychart.stockModule.indicators.AO.prototype.slowPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.slowPeriod_, false);
    if (period != this.slowPeriod_) {
      this.slowPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.slowPeriod_;
};


/**
 * Getter and setter for the indicator smoothing type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.stockModule.indicators.AO|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.AO.prototype.maType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var maType = anychart.enums.normalizeMovingAverageType(opt_value, this.maType_);
    if (maType != this.maType_) {
      this.maType_ = maType;
      this.reinitComputer();
    }
    return this;
  }
  return this.maType_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.AO.prototype;
  proto['series'] = proto.series;
  proto['fastPeriod'] = proto.fastPeriod;
  proto['slowPeriod'] = proto.slowPeriod;
  proto['maType'] = proto.maType;
})();
