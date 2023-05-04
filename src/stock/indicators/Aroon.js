goog.provide('anychart.stockModule.indicators.Aroon');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.aroon');
goog.require('anychart.utils');



/**
 * Aroon indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_upSeriesType, opt_downSeriesType, opt_rangeSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.Aroon = function(args) {
  anychart.stockModule.indicators.Aroon.base(this, 'constructor', args);

  /**
   * Aroon period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 25, false);

  this.opt_upSeriesType = args[3];
  this.opt_downSeriesType = args[4];
  this.declareSeries('range', args[5], anychart.enums.StockSeriesType.RANGE_AREA);
  this.init();

  this.rangeSeries()['lowFill'](function() {
    return anychart.color.setOpacity(anychart.color.darken(this['sourceColor'], .6), 0.65);
  });
  this.rangeSeries()['lowStroke'](function() {
    return anychart.color.setOpacity(anychart.color.darken(this['sourceColor']), 1);
  });
};
goog.inherits(anychart.stockModule.indicators.Aroon, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.Aroon.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.aroon.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.Aroon.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'upAroon':
      return 'Aroon up';
    case 'downAroon':
      return 'Aroon down';
    case 'range':
      return 'Aroon';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.Aroon.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'upAroon':
      mapping.addField('value', computer.getFieldIndex('upResult'));
      break;
    case 'downAroon':
      mapping.addField('value', computer.getFieldIndex('downResult'));
      break;
    case 'range':
      mapping.addField('high', computer.getFieldIndex('upResult'));
      mapping.addField('low', computer.getFieldIndex('downResult'));
      break;
  }
};


/**
 * Getter for the indicator Aroon series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.Aroon.prototype.upSeries = function(opt_type) {
  if (goog.isNull(this.seriesInternal('upAroon'))) {
    this.declareSeries('upAroon', this.opt_upSeriesType);
    this.init();
  }
  return /** @type {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series} */(
      this.seriesInternal('upAroon', opt_type));
};


/**
 * Getter for the indicator signal series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.Aroon.prototype.downSeries = function(opt_type) {
  if (goog.isNull(this.seriesInternal('downAroon'))) {
    this.declareSeries('downAroon', this.opt_downSeriesType);
    this.init();
  }
  return /** @type {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series} */(
      this.seriesInternal('downAroon', opt_type));
};


/**
 * Getter for the range series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.Aroon.prototype.rangeSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series} */(
      this.seriesInternal('range', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.Aroon|number}
 */
anychart.stockModule.indicators.Aroon.prototype.period = function(opt_value) {
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


//exports
(function() {
  var proto = anychart.stockModule.indicators.Aroon.prototype;
  proto['period'] = proto.period;
  proto['upSeries'] = proto.upSeries;
  proto['downSeries'] = proto.downSeries;
  proto['rangeSeries'] = proto.rangeSeries;
})();
