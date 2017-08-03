goog.provide('anychart.stockModule.indicators.CHO');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.cho');
goog.require('anychart.utils');



/**
 * CHO indicator class.
 * @param {!(anychart.stockModule.Plot|anychart.stockModule.Scroller)} plot
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod [3] Indicator period. Defaults to 3.
 * @param {number=} opt_slowPeriod [10] Indicator period. Defaults to 10.
 * @param {string=} opt_maType [EMA] Indicator smoothing type. Defaults to EMA.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.CHO = function(plot, mapping, opt_fastPeriod, opt_slowPeriod, opt_maType, opt_seriesType) {
  anychart.stockModule.indicators.CHO.base(this, 'constructor', plot, mapping);

  /**
   * Fast period.
   * @type {number}
   * @private
   */
  this.fastPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_fastPeriod, 3, false);

  /**
   * Slow period.
   * @type {number}
   * @private
   */
  this.slowPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_slowPeriod, 10, false);

  /**
   * K smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.maType_ = anychart.enums.normalizeMovingAverageType(opt_maType, anychart.enums.MovingAverageType.EMA);

  this.declareSeries('main', opt_seriesType);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.CHO, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.CHO.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.cho.createComputer(mapping, this.fastPeriod_, this.slowPeriod_, this.maType_);
};


/** @inheritDoc */
anychart.stockModule.indicators.CHO.prototype.createNameForSeries = function(seriesId, series) {
  return 'CHO(' + this.fastPeriod_ + ',' + this.slowPeriod_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.CHO|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.CHO.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.CHO|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the fast period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.CHO|number}
 */
anychart.stockModule.indicators.CHO.prototype.fastPeriod = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.CHO|number}
 */
anychart.stockModule.indicators.CHO.prototype.slowPeriod = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.CHO|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.CHO.prototype.maType = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.CHO.prototype;
  proto['series'] = proto.series;
  proto['fastPeriod'] = proto.fastPeriod;
  proto['slowPeriod'] = proto.slowPeriod;
  proto['maType'] = proto.maType;
})();
