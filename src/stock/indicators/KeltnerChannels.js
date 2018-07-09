goog.provide('anychart.stockModule.indicators.KeltnerChannels');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.keltnerChannels');
goog.require('anychart.utils');



/**
 * Keltner Channels indicator class.
 * @param {Array} args [plot, mapping, opt_maPeriod, opt_atrPeriod, opt_maType, opt_multiplier, opt_maSeries, opt_rangeSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.KeltnerChannels = function(args) {
  anychart.stockModule.indicators.KeltnerChannels.base(this, 'constructor', args);

  /**
   * Keltner ma period.
   * @type {number}
   * @private
   */
  this.maPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  /**
   * Keltner atr period.
   * @type {number}
   * @private
   */
  this.atrPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 10, false);

  /**
   * Keltner smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */

  this.maType_ = anychart.enums.normalizeMovingAverageType(args[4], anychart.enums.MovingAverageType.EMA);
  /**
   * Keltner multiplier.
   * @type {number}
   * @private
   */
  this.multiplier_ = anychart.utils.normalizeToNaturalNumber(args[5], 2, false);

  this.declareSeries('ma', args[6]);
  this.declareSeries('range', args[7], anychart.enums.StockSeriesType.RANGE_AREA);
  this.init();
  this.rangeSeries()['fill'](function() {
    return anychart.color.setOpacity(this['sourceColor'], 0.1);
  });
};
goog.inherits(anychart.stockModule.indicators.KeltnerChannels, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.KeltnerChannels.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.keltnerChannels.createComputer(mapping, this.maPeriod_, this.atrPeriod_, this.maType_, this.multiplier_);
};


/** @inheritDoc */
anychart.stockModule.indicators.KeltnerChannels.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'ma':
      return this.maType_.toUpperCase() + '(' + this.maPeriod_ + ')';
    case 'range':
      return 'KeltnerChannels';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.KeltnerChannels.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'ma':
      mapping.addField('value', computer.getFieldIndex('maResult'));
      break;
    case 'range':
      mapping.addField('high', computer.getFieldIndex('upperResult'));
      mapping.addField('low', computer.getFieldIndex('lowerResult'));
      break;
  }
};


/**
 * Getter for the middle series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.KeltnerChannels|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.KeltnerChannels.prototype.maSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.KeltnerChannels|anychart.stockModule.Series} */(
      this.seriesInternal('ma', opt_type));
};


/**
 * Getter for the range series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.KeltnerChannels|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.KeltnerChannels.prototype.rangeSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.KeltnerChannels|anychart.stockModule.Series} */(
      this.seriesInternal('range', opt_type));
};


/**
 * Getter and setter for the ma period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.KeltnerChannels|number}
 */
anychart.stockModule.indicators.KeltnerChannels.prototype.maPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var maPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.maPeriod_, false);
    if (maPeriod != this.maPeriod_) {
      this.maPeriod_ = maPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.maPeriod_;
};


/**
 * Getter and setter for MovingAverage type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.stockModule.indicators.KeltnerChannels|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.KeltnerChannels.prototype.maType = function(opt_value) {
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
 * Getter and setter for the multiplier.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.KeltnerChannels|number}
 */
anychart.stockModule.indicators.KeltnerChannels.prototype.multiplier = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var multiplier = anychart.utils.normalizeToNaturalNumber(opt_value, this.multiplier_, false);
    if (multiplier != this.multiplier_) {
      this.multiplier_ = multiplier;
      this.reinitComputer();
    }
    return this;
  }
  return this.multiplier_;
};


/**
 * Getter and setter for the atr period
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.KeltnerChannels|number}
 */
anychart.stockModule.indicators.KeltnerChannels.prototype.atrPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var atrPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.atrPeriod_, false);
    if (atrPeriod != this.atrPeriod_) {
      this.atrPeriod_ = atrPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.atrPeriod_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.KeltnerChannels.prototype;
  proto['maPeriod'] = proto.maPeriod;
  proto['maType'] = proto.maType;
  proto['atrPeriod'] = proto.atrPeriod;
  proto['multiplier'] = proto.multiplier;
  proto['rangeSeries'] = proto.rangeSeries;
  proto['maSeries'] = proto.maSeries;
})();
