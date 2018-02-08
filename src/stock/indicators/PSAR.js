goog.provide('anychart.stockModule.indicators.PSAR');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.psar');
goog.require('anychart.utils');



/**
 * PSAR indicator class.
 * @param {Array} args [plot, mapping, opt_accelerationFactorStart, opt_accelerationFactorIncrement, opt_accelerationFactorMaximum, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.PSAR = function(args) {
  anychart.stockModule.indicators.PSAR.base(this, 'constructor', args);

  /**
   * Acceleration factor start value.
   * @type {number}
   * @private
   */
  this.accelerationFactorStart_ = anychart.utils.toNumber(args[2]) || 0.02;

  /**
   * Acceleration factor increment value.
   * @type {number}
   * @private
   */
  this.accelerationFactorIncrement_ = anychart.utils.toNumber(args[3]) || 0.02;

  /**
   * Acceleration factor maximum value.
   * @type {number}
   * @private
   */
  this.accelerationFactorMaximum_ = anychart.utils.toNumber(args[4]) || 0.2;


  this.declareSeries('series', args[5], anychart.enums.StockSeriesType.MARKER);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.PSAR, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.PSAR.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.psar.createComputer(mapping, this.accelerationFactorStart_, this.accelerationFactorIncrement_, this.accelerationFactorMaximum_);
};


/** @inheritDoc */
anychart.stockModule.indicators.PSAR.prototype.createNameForSeries = function(seriesId, series) {
  return 'PSAR(' + this.accelerationFactorStart_ + ', ' + this.accelerationFactorIncrement_ + ', ' + this.accelerationFactorMaximum_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PSAR|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PSAR.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PSAR|anychart.stockModule.Series} */(
      this.seriesInternal('series', opt_type));
};


/**
 * Getter/setter for acceleration factor start value.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PSAR|number}
 */
anychart.stockModule.indicators.PSAR.prototype.accelerationFactorStart = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || this.accelerationFactorMaximum_;
    if (opt_value != this.accelerationFactorStart_) {
      this.accelerationFactorStart_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.accelerationFactorStart_;
};


/**
 * Getter/setter for acceleration factor maximum value.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PSAR|number}
 */
anychart.stockModule.indicators.PSAR.prototype.accelerationFactorMaximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || this.accelerationFactorMaximum_;
    if (opt_value != this.accelerationFactorMaximum_) {
      this.accelerationFactorMaximum_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.accelerationFactorMaximum_;
};


/**
 * Getter/setter for acceleration factor increment value.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PSAR|number}
 */
anychart.stockModule.indicators.PSAR.prototype.accelerationFactorIncrement = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value) || this.accelerationFactorIncrement_;
    if (opt_value != this.accelerationFactorIncrement_) {
      this.accelerationFactorIncrement_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.accelerationFactorIncrement_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.PSAR.prototype;
  proto['accelerationFactorStart'] = proto.accelerationFactorStart;
  proto['accelerationFactorMaximum'] = proto.accelerationFactorMaximum;
  proto['accelerationFactorIncrement'] = proto.accelerationFactorIncrement;
  proto['series'] = proto.series;
})();
