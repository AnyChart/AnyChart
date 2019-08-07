goog.provide('anychart.stockModule.indicators.IKH');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.ikh');
goog.require('anychart.utils');



/**
 * Ichimoku Kinko Hyo indicator class.
 * @param {Array} args [plot, mapping, opt_conversionPeriod, opt_basePeriod, opt_leadingPeriod, opt_conversionSeriesType, opt_baseSeriesType, opt_leadingSeriesType, opt_laggingSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.IKH = function(args) {
  anychart.stockModule.indicators.IKH.base(this, 'constructor', args);

  /**
   * Conversion line period.
   * @type {number}
   * @private
   */
  this.conversionPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 9, false);

  /**
   * Base line period.
   * @type {number}
   * @private
   */
  this.basePeriod_ = anychart.utils.normalizeToNaturalNumber(args[3], 26, false);

  /**
   * Leading span period. Also used to move the Cloud forward.
   * @type {number}
   * @private
   */
  this.leadingPeriod_ = anychart.utils.normalizeToNaturalNumber(args[4], 52, false);

  this.declareSeries('conversion', args[5]);
  this.declareSeries('base', args[6]);
  this.declareSeries('leading', args[7], anychart.enums.StockSeriesType.RANGE_AREA);
  this.declareSeries('lagging', args[8]);
  this.init();
  this.leadingSeries()['fill'](function() {
    var low = this.getData('low');
    var high = this.getData('high');
    if (high >= low)
      return {color: this['sourceColor'], opacity: 0.2};
    return {color: anychart.color.darken(this['sourceColor'], 0.7), opacity: 0.2};
  });
};
goog.inherits(anychart.stockModule.indicators.IKH, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.IKH.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.ikh.createComputer(mapping, this.conversionPeriod_, this.basePeriod_, this.leadingPeriod_);
};


/** @inheritDoc */
anychart.stockModule.indicators.IKH.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'conversion':
      return 'Conversion Line(' + this.conversionPeriod_ + ')';
    case 'base':
      return 'Base Line(' + this.basePeriod_ + ')';
    case 'leading':
      return 'Leading Span(' + this.leadingPeriod_ + ')';
    case 'lagging':
      return 'Lagging Span(' + this.basePeriod_ + ')';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.IKH.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'conversion':
      mapping.addField('value', computer.getFieldIndex('conversionResult'));
      break;
    case 'base':
      mapping.addField('value', computer.getFieldIndex('baseResult'));
      break;
    case 'leading':
      mapping.addField('high', computer.getFieldIndex('spanAResult'));
      mapping.addField('low', computer.getFieldIndex('spanBResult'));
      break;
    case 'lagging':
      mapping.addField('value', computer.getFieldIndex('laggingResult'));
      break;
  }
};


/**
 * Getter for the conversion line series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.IKH|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.IKH.prototype.conversionSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.IKH|anychart.stockModule.Series} */(
      this.seriesInternal('conversion', opt_type));
};


/**
 * Getter for the base line series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.IKH|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.IKH.prototype.baseSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.IKH|anychart.stockModule.Series} */(
      this.seriesInternal('base', opt_type));
};


/**
 * Getter for the leading span range series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.IKH|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.IKH.prototype.leadingSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.IKH|anychart.stockModule.Series} */(
      this.seriesInternal('leading', opt_type));
};


/**
 * Getter for the lagging line series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.IKH|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.IKH.prototype.laggingSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.IKH|anychart.stockModule.Series} */(
      this.seriesInternal('lagging', opt_type));
};


/**
 * Getter and setter for the conversion period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.IKH|number}
 */
anychart.stockModule.indicators.IKH.prototype.conversionPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var conversionPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.conversionPeriod_, false);
    if (conversionPeriod != this.conversionPeriod_) {
      this.conversionPeriod_ = conversionPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.conversionPeriod_;
};


/**
 * Getter and setter for the base period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.IKH|number}
 */
anychart.stockModule.indicators.IKH.prototype.basePeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var basePeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.basePeriod_, false);
    if (basePeriod != this.basePeriod_) {
      this.basePeriod_ = basePeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.basePeriod_;
};


/**
 * Getter and setter for the leading period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.IKH|number}
 */
anychart.stockModule.indicators.IKH.prototype.leadingPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var leadingPeriod = anychart.utils.normalizeToNaturalNumber(opt_value, this.leadingPeriod_, false);
    if (leadingPeriod != this.leadingPeriod_) {
      this.leadingPeriod_ = leadingPeriod;
      this.reinitComputer();
    }
    return this;
  }
  return this.leadingPeriod_;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.IKH.prototype;
  proto['conversionSeries'] = proto.conversionSeries;
  proto['baseSeries'] = proto.baseSeries;
  proto['leadingSeries'] = proto.leadingSeries;
  proto['laggingSeries'] = proto.laggingSeries;
  proto['conversionPeriod'] = proto.conversionPeriod;
  proto['basePeriod'] = proto.basePeriod;
  proto['leadingPeriod'] = proto.leadingPeriod;
})();
