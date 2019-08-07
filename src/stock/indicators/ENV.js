goog.provide('anychart.stockModule.indicators.ENV');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.env');
goog.require('anychart.utils');



/**
 * ENV indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_deviation, opt_maType, opt_upperSeriesType, opt_lowerSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.ENV = function(args) {
  anychart.stockModule.indicators.ENV.base(this, 'constructor', args);

  /**
   * Moving average period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  /**
   * Deviation in percents.
   * @type {number}
   * @private
   */
  this.deviation_ = anychart.utils.normalizeToNaturalNumber(args[3], 10, false);

  /**
   * Basis smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.maType_ = anychart.enums.normalizeMovingAverageType(args[4], anychart.enums.MovingAverageType.EMA);

  this.declareSeries('upper', args[5]);
  this.declareSeries('lower', args[6]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.ENV, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.ENV.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.env.createComputer(mapping, this.period_, this.deviation_, this.maType_);
};


/** @inheritDoc */
anychart.stockModule.indicators.ENV.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'upper':
      return 'ENV upper';
    case 'lower':
      return 'ENV lower';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.ENV.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'upper':
      mapping.addField('value', computer.getFieldIndex('upperResult'));
      break;
    case 'lower':
      mapping.addField('value', computer.getFieldIndex('lowerResult'));
      break;
  }
};


/**
 * Getter for the indicator upper or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.ENV|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.ENV.prototype.upperSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.ENV|anychart.stockModule.Series} */(
      this.seriesInternal('upper', opt_type));
};


/**
 * Getter for the indicator lower or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.ENV|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.ENV.prototype.lowerSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.ENV|anychart.stockModule.Series} */(
      this.seriesInternal('lower', opt_type));
};


/**
 * Getter and setter for the MA period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.ENV|number}
 */
anychart.stockModule.indicators.ENV.prototype.period = function(opt_value) {
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


/**
 * Getter and setter for the smoothing type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.stockModule.indicators.ENV|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.ENV.prototype.maType = function(opt_value) {
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


/**
 * Getter and setter for the deviation value.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.ENV|number}
 */
anychart.stockModule.indicators.ENV.prototype.deviation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!isNaN(opt_value) && opt_value != this.deviation_) {
      this.deviation_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.deviation_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.ENV.prototype;
  proto['upperSeries'] = proto.upperSeries;
  proto['lowerSeries'] = proto.lowerSeries;
  proto['period'] = proto.period;
  proto['maType'] = proto.maType;
  proto['deviation'] = proto.deviation;
})();
