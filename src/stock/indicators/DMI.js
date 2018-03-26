goog.provide('anychart.stockModule.indicators.DMI');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.dmi');
goog.require('anychart.utils');



/**
 * DMI indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_adxPeriod, opt_useWildersSmoothing, opt_pdiSeriesType, opt_ndiSeriesType, opt_adxSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.DMI = function(args) {
  anychart.stockModule.indicators.DMI.base(this, 'constructor', args);

  /**
   * DI period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 14, false);

  /**
   * ADX period.
   * @type {number}
   * @private
   */
  this.adxPeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 14, false);

  /**
   * Wilders smoothing.
   * @type {boolean}
   * @private
   */
  this.useWildersSmoothing_ = goog.isDef(args[4]) ? !!args[4] : true;

  this.declareSeries('pdi', args[5]);
  this.declareSeries('ndi', args[6]);
  this.declareSeries('adx', args[7]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.DMI, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.DMI.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.dmi.createComputer(mapping, this.period_, this.adxPeriod_, this.useWildersSmoothing_);
};


/** @inheritDoc */
anychart.stockModule.indicators.DMI.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'pdi':
      return '+DI(' + this.period_ + ')';
    case 'ndi':
      return '-DI(' + this.period_ + ')';
    case 'adx':
      return 'ADX(' + this.adxPeriod_ + ')';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.DMI.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'pdi':
      mapping.addField('value', computer.getFieldIndex('pdiResult'));
      break;
    case 'ndi':
      mapping.addField('value', computer.getFieldIndex('ndiResult'));
      break;
    case 'adx':
      mapping.addField('value', computer.getFieldIndex('adxResult'));
      break;
  }
};


/**
 * Getter for the indicator +DI series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.DMI|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.DMI.prototype.pdiSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.DMI|anychart.stockModule.Series} */(
      this.seriesInternal('pdi', opt_type));
};


/**
 * Getter for the indicator -DI series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.DMI|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.DMI.prototype.ndiSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.DMI|anychart.stockModule.Series} */(
      this.seriesInternal('ndi', opt_type));
};


/**
 * Getter for the indicator ADX series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.DMI|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.DMI.prototype.adxSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.DMI|anychart.stockModule.Series} */(
      this.seriesInternal('adx', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.DMI|number}
 */
anychart.stockModule.indicators.DMI.prototype.period = function(opt_value) {
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
 * Getter and setter for the adx period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.DMI|number}
 */
anychart.stockModule.indicators.DMI.prototype.adxPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.adxPeriod_, false);
    if (period != this.adxPeriod_) {
      this.adxPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.adxPeriod_;
};


/**
 * Getter and setter for the Wilders smoothing.
 * @param {boolean=} opt_value
 * @return {anychart.stockModule.indicators.DMI|boolean}
 */
anychart.stockModule.indicators.DMI.prototype.useWildersSmoothing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var useWildersSmoothing = !!opt_value;
    if (useWildersSmoothing != this.useWildersSmoothing_) {
      this.useWildersSmoothing_ = useWildersSmoothing;
      this.reinitComputer();
    }
    return this;
  }
  return this.useWildersSmoothing_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.DMI.prototype;
  proto['pdiSeries'] = proto.pdiSeries;
  proto['ndiSeries'] = proto.ndiSeries;
  proto['adxSeries'] = proto.adxSeries;
  proto['period'] = proto.period;
  proto['adxPeriod'] = proto.adxPeriod;
  proto['useWildersSmoothing'] = proto.useWildersSmoothing;
})();
