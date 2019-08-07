goog.provide('anychart.stockModule.indicators.PPO');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.ppo');
goog.require('anychart.utils');



/**
 * PPO indicator class.
 * @param {Array} args [plot, mapping, opt_shortPeriod, opt_longPeriod, opt_smoothingPeriod, opt_ppoSeriesType, opt_signalSeriesType, opt_histogramSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.PPO = function(args) {
  anychart.stockModule.indicators.PPO.base(this, 'constructor', args);

  /**
   * Short period.
   * @type {number}
   * @private
   */
  this.shortPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 12, false);

  /**
   * Long period.
   * @type {number}
   * @private
   */
  this.longPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 26, false);

  /**
   * Smoothing period.
   * @type {number}
   * @private
   */
  this.smoothingPeriod_ = anychart.utils.normalizeToNaturalNumber(args[4], 9, false);

  this.declareSeries('ppoSeries', args[5]);
  this.declareSeries('signalSeries', args[6]);
  this.declareSeries('histogramSeries', args[7], anychart.enums.StockSeriesType.COLUMN);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.PPO, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.PPO.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.ppo.createComputer(mapping, this.shortPeriod_, this.longPeriod_, this.smoothingPeriod_);
};


/** @inheritDoc */
anychart.stockModule.indicators.PPO.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'ppoSeries':
      return 'PPO(' + this.shortPeriod_ + ',' + this.longPeriod_ + ',' + this.smoothingPeriod_ + ')';
    case 'signalSeries':
      return 'Signal';
    case 'histogramSeries':
      return 'PPO Histogram';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.PPO.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'ppoSeries':
      mapping.addField('value', computer.getFieldIndex('ppoResult'));
      break;
    case 'signalSeries':
      mapping.addField('value', computer.getFieldIndex('signalResult'));
      break;
    case 'histogramSeries':
      mapping.addField('value', computer.getFieldIndex('histogramResult'));
      break;
  }
};


/**
 * Getter for the indicator PPO Line series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PPO|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PPO.prototype.ppoSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PPO|anychart.stockModule.Series} */(
      this.seriesInternal('ppoSeries', opt_type));
};


/**
 * Getter for the indicator Signal series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PPO|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PPO.prototype.signalSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PPO|anychart.stockModule.Series} */(
      this.seriesInternal('signalSeries', opt_type));
};


/**
 * Getter for the indicator PPO Histogram or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.PPO|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.PPO.prototype.histogramSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.PPO|anychart.stockModule.Series} */(
      this.seriesInternal('histogramSeries', opt_type));
};


/**
 * Getter and setter for the shortPeriod.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PPO|number}
 */
anychart.stockModule.indicators.PPO.prototype.shortPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.shortPeriod_, false);
    if (period != this.shortPeriod_) {
      this.shortPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.shortPeriod_;
};


/**
 * Getter and setter for the longPeriod.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PPO|number}
 */
anychart.stockModule.indicators.PPO.prototype.longPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.longPeriod_, false);
    if (period != this.longPeriod_) {
      this.longPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.longPeriod_;
};


/**
 * Getter and setter for the smoothing period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.PPO|number}
 */
anychart.stockModule.indicators.PPO.prototype.smoothingPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.smoothingPeriod_, false);
    if (period != this.smoothingPeriod_) {
      this.smoothingPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.smoothingPeriod_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.PPO.prototype;
  proto['ppoSeries'] = proto.ppoSeries;
  proto['signalSeries'] = proto.signalSeries;
  proto['histogramSeries'] = proto.histogramSeries;
  proto['shortPeriod'] = proto.shortPeriod;
  proto['longPeriod'] = proto.longPeriod;
  proto['smoothingPeriod'] = proto.smoothingPeriod;
})();
