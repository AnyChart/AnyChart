goog.provide('anychart.core.stock.indicators.CHO');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.cho');
goog.require('anychart.utils');



/**
 * CHO indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_fastPeriod [3] Indicator period. Defaults to 3.
 * @param {number=} opt_slowPeriod [10] Indicator period. Defaults to 10.
 * @param {string=} opt_maType [EMA] Indicator smoothing type. Defaults to EMA.
 * @param {anychart.enums.StockSeriesType=} opt_seriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.CHO = function(plot, mapping, opt_fastPeriod, opt_slowPeriod, opt_maType, opt_seriesType) {
  anychart.core.stock.indicators.CHO.base(this, 'constructor', plot, mapping);

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
goog.inherits(anychart.core.stock.indicators.CHO, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.CHO.prototype.createComputer = function(mapping) {
  return anychart.math.cho.createComputer(mapping, this.fastPeriod_, this.slowPeriod_, this.maType_);
};


/** @inheritDoc */
anychart.core.stock.indicators.CHO.prototype.createNameForSeries = function(seriesId, series) {
  return 'CHO(' + this.fastPeriod_ + ',' + this.slowPeriod_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.CHO|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.CHO.prototype.series = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.CHO|anychart.core.series.Stock} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the fast period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.CHO|number}
 */
anychart.core.stock.indicators.CHO.prototype.fastPeriod = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.CHO|number}
 */
anychart.core.stock.indicators.CHO.prototype.slowPeriod = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.CHO|anychart.enums.MovingAverageType}
 */
anychart.core.stock.indicators.CHO.prototype.maType = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.CHO.prototype;
  proto['series'] = proto.series;
  proto['fastPeriod'] = proto.fastPeriod;
  proto['slowPeriod'] = proto.slowPeriod;
  proto['maType'] = proto.maType;
})();
