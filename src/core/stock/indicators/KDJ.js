goog.provide('anychart.core.stock.indicators.KDJ');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.kdj');
goog.require('anychart.utils');



/**
 * KDJ indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_kPeriod [14] Indicator period. Defaults to 14.
 * @param {number=} opt_kMAPeriod [5] Indicator K smoothing period. Defaults to 5.
 * @param {number=} opt_dPeriod [5] Indicator D period. Defaults to 5.
 * @param {anychart.enums.MovingAverageType=} opt_kMAType [EMA] Indicator K smoothing type. Defaults to EMA.
 * @param {anychart.enums.MovingAverageType=} opt_dMAType [EMA] Indicator D smoothing type. Defaults to EMA.
 * @param {number=} opt_kMultiplier [-2]. K multiplier.
 * @param {number=} opt_dMultiplier [3]. D multiplier.
 * @param {anychart.enums.StockSeriesType=} opt_kSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_dSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_jSeriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.KDJ = function(plot, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier, opt_kSeriesType, opt_dSeriesType, opt_jSeriesType) {
  anychart.core.stock.indicators.KDJ.base(this, 'constructor', plot, mapping);

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
  this.kMAType_ = anychart.enums.normalizeMovingAverageType(opt_kMAType, anychart.enums.MovingAverageType.EMA);

  /**
   * K smoothing period.
   * @type {number}
   * @private
   */
  this.kMAPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_kMAPeriod, 5, false);

  /**
   * D smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.dMAType_ = anychart.enums.normalizeMovingAverageType(opt_dMAType, anychart.enums.MovingAverageType.EMA);

  /**
   * D smoothing period.
   * @type {number}
   * @private
   */
  this.dPeriod_ = anychart.utils.normalizeToNaturalNumber(opt_dPeriod, 5, false);

  var mult;

  mult = anychart.utils.toNumber(opt_kMultiplier);
  /**
   * K multiplier.
   * @type {number}
   * @private
   */
  this.kMultiplier_ = isNaN(mult) ? -2 : mult;

  mult = anychart.utils.toNumber(opt_dMultiplier);
  /**
   * D multiplier.
   * @type {number}
   * @private
   */
  this.dMultiplier_ = isNaN(mult) ? 3 : mult;

  this.declareSeries('kSeries', opt_kSeriesType);
  this.declareSeries('dSeries', opt_dSeriesType);
  this.declareSeries('jSeries', opt_jSeriesType);
  this.init();
};
goog.inherits(anychart.core.stock.indicators.KDJ, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.KDJ.prototype.createComputer = function(mapping) {
  return anychart.math.kdj.createComputer(mapping, this.kPeriod_, this.kMAPeriod_, this.dPeriod_, this.kMAType_, this.dMAType_, this.kMultiplier_, this.dMultiplier_);
};


/** @inheritDoc */
anychart.core.stock.indicators.KDJ.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'kSeries':
      return '%K(' + this.kPeriod_ + (this.kMAPeriod_ != 1 ? (', ' + this.kMAPeriod_) : '') + ')';
    case 'dSeries':
      return '%D(' + this.dPeriod_ + ')';
    case 'jSeries':
      return '%J';
  }
  return '';
};


/** @inheritDoc */
anychart.core.stock.indicators.KDJ.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'kSeries':
      mapping.addField('value', computer.getFieldIndex('kResult'));
      break;
    case 'dSeries':
      mapping.addField('value', computer.getFieldIndex('dResult'));
      break;
    case 'jSeries':
      mapping.addField('value', computer.getFieldIndex('jResult'));
      break;
  }
};


/**
 * Getter for the indicator kSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.KDJ|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.KDJ.prototype.kSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.KDJ|anychart.core.series.Stock} */(
      this.seriesInternal('kSeries', opt_type));
};


/**
 * Getter for the indicator dSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.KDJ|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.KDJ.prototype.dSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.KDJ|anychart.core.series.Stock} */(
      this.seriesInternal('dSeries', opt_type));
};


/**
 * Getter for the indicator jSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.KDJ|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.KDJ.prototype.jSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.KDJ|anychart.core.series.Stock} */(
      this.seriesInternal('jSeries', opt_type));
};


/**
 * Getter and setter for the kPeriod.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.KDJ|number}
 */
anychart.core.stock.indicators.KDJ.prototype.kPeriod = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.KDJ|anychart.enums.MovingAverageType}
 */
anychart.core.stock.indicators.KDJ.prototype.kMAType = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.KDJ|number}
 */
anychart.core.stock.indicators.KDJ.prototype.kMAPeriod = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.KDJ|anychart.enums.MovingAverageType}
 */
anychart.core.stock.indicators.KDJ.prototype.dMAType = function(opt_value) {
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
 * @return {anychart.core.stock.indicators.KDJ|number}
 */
anychart.core.stock.indicators.KDJ.prototype.dPeriod = function(opt_value) {
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


/**
 * Getter and setter for the k multiplier.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.KDJ|number}
 */
anychart.core.stock.indicators.KDJ.prototype.kMultiplier = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!isNaN(opt_value) && opt_value != this.kMultiplier_) {
      this.kMultiplier_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.kMultiplier_;
};


/**
 * Getter and setter for the k multiplier.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.KDJ|number}
 */
anychart.core.stock.indicators.KDJ.prototype.dMultiplier = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!isNaN(opt_value) && opt_value != this.dMultiplier_) {
      this.dMultiplier_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.dMultiplier_;
};


//exports
(function() {
  var proto = anychart.core.stock.indicators.KDJ.prototype;
  proto['kPeriod'] = proto.kPeriod;
  proto['kMAType'] = proto.kMAType;
  proto['kMAPeriod'] = proto.kMAPeriod;
  proto['dMAType'] = proto.dMAType;
  proto['dPeriod'] = proto.dPeriod;
  proto['kMultiplier'] = proto.kMultiplier;
  proto['dMultiplier'] = proto.dMultiplier;
  proto['kSeries'] = proto.kSeries;
  proto['dSeries'] = proto.dSeries;
  proto['jSeries'] = proto.jSeries;
})();
