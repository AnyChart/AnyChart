goog.provide('anychart.stockModule.indicators.KDJ');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.kdj');
goog.require('anychart.utils');



/**
 * KDJ indicator class.
 * @param {Array} args [plot, mapping, opt_kPeriod, opt_kMAPeriod, opt_dPeriod, opt_kMAType, opt_dMAType, opt_kMultiplier, opt_dMultiplier, opt_kSeriesType, opt_dSeriesType, opt_jSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.KDJ = function(args) {
  anychart.stockModule.indicators.KDJ.base(this, 'constructor', args);

  /**
   * K period.
   * @type {number}
   * @private
   */
  this.kPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 14, false);

  /**
   * K smoothing period.
   * @type {number}
   * @private
   */
  this.kMAPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 5, false);

  /**
   * D smoothing period.
   * @type {number}
   * @private
   */
  this.dPeriod_ = anychart.utils.normalizeToNaturalNumber(args[4], 5, false);

  /**
   * K smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.kMAType_ = anychart.enums.normalizeMovingAverageType(args[5], anychart.enums.MovingAverageType.EMA);

  /**
   * D smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.dMAType_ = anychart.enums.normalizeMovingAverageType(args[6], anychart.enums.MovingAverageType.EMA);

  var mult;

  mult = anychart.utils.toNumber(args[7]);
  /**
   * K multiplier.
   * @type {number}
   * @private
   */
  this.kMultiplier_ = isNaN(mult) ? -2 : mult;

  mult = anychart.utils.toNumber(args[8]);
  /**
   * D multiplier.
   * @type {number}
   * @private
   */
  this.dMultiplier_ = isNaN(mult) ? 3 : mult;

  this.declareSeries('kSeries', args[9]);
  this.declareSeries('dSeries', args[10]);
  this.declareSeries('jSeries', args[11]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.KDJ, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.KDJ.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.kdj.createComputer(mapping, this.kPeriod_, this.kMAPeriod_, this.dPeriod_, this.kMAType_, this.dMAType_, this.kMultiplier_, this.dMultiplier_);
};


/** @inheritDoc */
anychart.stockModule.indicators.KDJ.prototype.createNameForSeries = function(seriesId, series) {
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
anychart.stockModule.indicators.KDJ.prototype.setupMapping = function(mapping, computer, seriesId, series) {
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
 * @return {anychart.stockModule.indicators.KDJ|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.KDJ.prototype.kSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.KDJ|anychart.stockModule.Series} */(
      this.seriesInternal('kSeries', opt_type));
};


/**
 * Getter for the indicator dSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.KDJ|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.KDJ.prototype.dSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.KDJ|anychart.stockModule.Series} */(
      this.seriesInternal('dSeries', opt_type));
};


/**
 * Getter for the indicator jSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.KDJ|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.KDJ.prototype.jSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.KDJ|anychart.stockModule.Series} */(
      this.seriesInternal('jSeries', opt_type));
};


/**
 * Getter and setter for the kPeriod.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.KDJ|number}
 */
anychart.stockModule.indicators.KDJ.prototype.kPeriod = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.KDJ|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.KDJ.prototype.kMAType = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.KDJ|number}
 */
anychart.stockModule.indicators.KDJ.prototype.kMAPeriod = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.KDJ|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.KDJ.prototype.dMAType = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.KDJ|number}
 */
anychart.stockModule.indicators.KDJ.prototype.dPeriod = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.KDJ|number}
 */
anychart.stockModule.indicators.KDJ.prototype.kMultiplier = function(opt_value) {
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
 * @return {anychart.stockModule.indicators.KDJ|number}
 */
anychart.stockModule.indicators.KDJ.prototype.dMultiplier = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.KDJ.prototype;
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
