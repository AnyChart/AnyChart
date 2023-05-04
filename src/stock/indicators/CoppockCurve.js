goog.provide('anychart.stockModule.indicators.CoppockCurve');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.coppockCurve');
goog.require('anychart.utils');



/**
 * Coppock Curve indicator class.
 * @param {Array} args [plot, mapping, opt_wmaPeriod, opt_firstRocPeriod, opt_secondRocPeriod, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.CoppockCurve = function(args) {
  anychart.stockModule.indicators.CoppockCurve.base(this, 'constructor', args);


  /**
   * The WMA period period.
   * @type {number}
   * @private
   */
  this.wmaPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 10, false);

  /**
   * The first RoC period period.
   * @type {number}
   * @private
   */
  this.firstRocPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 11, false);

  /**
   * The second RoC period period.
   * @type {number}
   * @private
   */
  this.secondRocPeriod_ = anychart.utils.normalizeToNaturalNumber(args[4], 14, false);

  this.declareSeries('main', args[5]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.CoppockCurve, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.CoppockCurve.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.coppockCurve.createComputer(mapping, this.wmaPeriod_, this.firstRocPeriod_, this.secondRocPeriod_);
};


/** @inheritDoc */
anychart.stockModule.indicators.CoppockCurve.prototype.createNameForSeries = function(seriesId, series) {
  return 'Coppock Curve (' + this.wmaPeriod_ + ', ' + this.firstRocPeriod_ + ', ' + this.secondRocPeriod_ + ')';
};


/**
 * Getter for the indicator upper or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.CoppockCurve|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.CoppockCurve.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.CoppockCurve|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the WMA period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.CoppockCurve|number}
 */
anychart.stockModule.indicators.CoppockCurve.prototype.wmaPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.wmaPeriod_, false);
    if (period != this.wmaPeriod_) {
      this.wmaPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.wmaPeriod_;
};


/**
 * Getter and setter for the first RoC period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.CoppockCurve|number}
 */
anychart.stockModule.indicators.CoppockCurve.prototype.firstRocPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.firstRocPeriod_, false);
    if (period != this.firstRocPeriod_) {
      this.firstRocPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.firstRocPeriod_;
};


/**
 * Getter and setter for the second RoC period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.CoppockCurve|number}
 */
anychart.stockModule.indicators.CoppockCurve.prototype.secondRocPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.secondRocPeriod_, false);
    if (period != this.secondRocPeriod_) {
      this.secondRocPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.secondRocPeriod_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.CoppockCurve.prototype;
  proto['series'] = proto.series;
  proto['wmaPeriod'] = proto.wmaPeriod;
  proto['firstRocPeriod'] = proto.firstRocPeriod;
  proto['secondRocPeriod'] = proto.secondRocPeriod;
})();
