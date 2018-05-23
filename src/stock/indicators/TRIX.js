goog.provide('anychart.stockModule.indicators.TRIX');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.trix');
goog.require('anychart.utils');



/**
 * TRIX indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_signalPeriod, opt_maType, opt_signalMaType, opt_trixSeriesType, opt_signalSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.TRIX = function(args) {
  anychart.stockModule.indicators.TRIX.base(this, 'constructor', args);

  /**
   * Period of ma
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 15, false);

  /**
   * Period of signal ma
   * @type {number}
   * @private
   */
  this.signalPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 9, false);

  /**
   * Type of ma
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.maType_ = anychart.enums.normalizeMovingAverageType(args[4], anychart.enums.MovingAverageType.EMA);

  /**
   * Type of signal ma
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.signalMaType_ = anychart.enums.normalizeMovingAverageType(args[5], anychart.enums.MovingAverageType.EMA);
  this.declareSeries('trix', args[6]);
  this.declareSeries('signal', args[7]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.TRIX, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.TRIX.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.trix.createComputer(mapping, this.period_, this.signalPeriod_, this.maType_, this.signalMaType_);
};


/** @inheritDoc */
anychart.stockModule.indicators.TRIX.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'trix':
      return 'TRIX(' + this.period_ + ')';
    case 'signal':
      return this.signalMaType_.toUpperCase() + '(' + this.signalPeriod_ + ')';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.TRIX.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'trix':
      mapping.addField('value', computer.getFieldIndex('trix'));
      break;
    case 'signal':
      mapping.addField('value', computer.getFieldIndex('signal'));
      break;
  }
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.TRIX|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.TRIX.prototype.trixSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.TRIX|anychart.stockModule.Series} */(
      this.seriesInternal('trix', opt_type));
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Base|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.TRIX.prototype.signalSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.TRIX|anychart.stockModule.Series} */(
      this.seriesInternal('signal', opt_type));

};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.TRIX|number}
 */
anychart.stockModule.indicators.TRIX.prototype.period = function(opt_value) {
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
 * Getter and setter for the signal period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.TRIX|number}
 */
anychart.stockModule.indicators.TRIX.prototype.signalPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var signalPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.signalPeriod_, false);
    if (signalPeriod != this.signalPeriod_) {
      this.signalPeriod_ = signalPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.signalPeriod_;
};


/**
 * Getter and setter for the signal ma type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.stockModule.indicators.TRIX|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.TRIX.prototype.signalMaType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var signalMaType = anychart.enums.normalizeMovingAverageType(opt_value, this.signalMaType_);
    if (signalMaType != this.signalMaType_) {
      this.signalMaType_ = signalMaType;
      this.reinitComputer();
    }
    return this;
  }
  return this.signalMaType_;
};


/**
 * Getter and setter for the ma type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.stockModule.indicators.TRIX|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.TRIX.prototype.maType = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.TRIX.prototype;
  proto['trixSeries'] = proto.trixSeries;
  proto['signalSeries'] = proto.signalSeries;
  proto['period'] = proto.period;
  proto['signalPeriod'] = proto.signalPeriod;
  proto['signalMaType'] = proto.signalMaType;
  proto['maType'] = proto.maType;
})();
