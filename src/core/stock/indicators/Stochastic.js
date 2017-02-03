goog.provide('anychart.core.stock.indicators.Stochastic');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.stochastic');
goog.require('anychart.utils');



/**
 * Stochastic indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [1] Indicator K smoothing period. Defaults to 1.
 * @param {number=} opt_dPeriod [3] Indicator D period. Defaults to 3.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [SMA] Indicator K smoothing type. Defaults to SMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [SMA] Indicator D smoothing type. Defaults to SMA.
 * @param {anychart.enums.StockSeriesType=} opt_kSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_dSeriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.Stochastic = function(plot, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kSeriesType, opt_dSeriesType) {
  anychart.core.stock.indicators.Stochastic.base(this, 'constructor', plot, mapping);

  /**
   * K period.
   * @type {number}
   * @private
   */
  this.kPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_kPeriod, 14, false);

  /**
   * K smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.kMAType_ = anychart.enums.normalizeMovingAverageType(opt_kMAType, anychart.enums.MovingAverageType.SMA);

  /**
   * K smoothing period.
   * @type {number}
   * @private
   */
  this.kMAPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_kMAPeriod, 1, false);

  /**
   * D smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.dMAType_ = anychart.enums.normalizeMovingAverageType(opt_dPeriod, anychart.enums.MovingAverageType.SMA);

  /**
   * D smooth period.
   * @type {number}
   * @private
   */
  this.dPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_dPeriod, 3, false);

  this.declareSeries('kSeries', opt_kSeriesType);
  this.declareSeries('dSeries', opt_dSeriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.Stochastic, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.Stochastic.prototype.createComputer = function(mapping) {
  return anychart.math.stochastic.createComputer(mapping, this.kPeriod_, this.kMAPeriod_, this.dPeriod_, this.kMAType_, this.dMAType_);
};


/** @inheritDoc */
anychart.core.stock.indicators.Stochastic.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'kSeries':
      return '%K(' + this.kPeriod_ + (this.kMAPeriod_ != 1 ? (', ' + this.kMAPeriod_) : '') + ')';
    case 'dSeries':
      return '%D(' + this.dPeriod_ + ')';
  }
  return '';
};


/** @inheritDoc */
anychart.core.stock.indicators.Stochastic.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'kSeries':
      mapping.addField('value', computer.getFieldIndex('kResult'));
      break;
    case 'dSeries':
      mapping.addField('value', computer.getFieldIndex('dResult'));
      break;
  }
};


/**
 * Getter for the indicator kSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.Stochastic|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.Stochastic.prototype.kSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.Stochastic|anychart.core.series.Stock} */(
      this.seriesInternal('kSeries', opt_type));
};


/**
 * Getter for the indicator dSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.Stochastic|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.Stochastic.prototype.dSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.Stochastic|anychart.core.series.Stock} */(
      this.seriesInternal('dSeries', opt_type));
};


/**
 * Getter and setter for the kPeriod.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.Stochastic|number}
 */
anychart.core.stock.indicators.Stochastic.prototype.kPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.kPeriod_, false);
    if (period != this.kPeriod_) {
      this.kPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.kPeriod_;
};


/**
 * Getter and setter for the k smoothing type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.core.stock.indicators.Stochastic|anychart.enums.MovingAverageType}
 */
anychart.core.stock.indicators.Stochastic.prototype.kMAType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var maType = anychart.enums.normalizeMovingAverageType(opt_value, this.kMAType_);
    if (maType != this.kMAType_) {
      this.kMAType_ = maType;
      this.reinitComputer();
    }
    return this;
  }
  return this.kMAType_;
};


/**
 * Getter and setter for the k smoothing period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.Stochastic|number}
 */
anychart.core.stock.indicators.Stochastic.prototype.kMAPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.kMAPeriod_, false);
    if (period != this.kMAPeriod_) {
      this.kMAPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.kMAPeriod_;
};


/**
 * Getter and setter for the d type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.core.stock.indicators.Stochastic|anychart.enums.MovingAverageType}
 */
anychart.core.stock.indicators.Stochastic.prototype.dMAType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var maType = anychart.enums.normalizeMovingAverageType(opt_value, this.dMAType_);
    if (maType != this.dMAType_) {
      this.dMAType_ = maType;
      this.reinitComputer();
    }
    return this;
  }
  return this.dMAType_;
};


/**
 * Getter and setter for the d period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.Stochastic|number}
 */
anychart.core.stock.indicators.Stochastic.prototype.dPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.dPeriod_, false);
    if (period != this.dPeriod_) {
      this.dPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.dPeriod_;
};


//exports
(function() {
  var proto = anychart.core.stock.indicators.Stochastic.prototype;
  proto['kPeriod'] = proto.kPeriod;
  proto['kMAType'] = proto.kMAType;
  proto['kMAPeriod'] = proto.kMAPeriod;
  proto['dMAType'] = proto.dMAType;
  proto['dPeriod'] = proto.dPeriod;
  proto['kSeries'] = proto.kSeries;
  proto['dSeries'] = proto.dSeries;
})();
