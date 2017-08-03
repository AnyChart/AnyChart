goog.provide('anychart.stockModule.indicators.Aroon');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.aroon');
goog.require('anychart.utils');



/**
 * Aroon indicator class.
 * @param {!(anychart.stockModule.Plot|anychart.stockModule.Scroller)} plot
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_upSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_downSeriesType
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.Aroon = function(plot, mapping, opt_period, opt_upSeriesType, opt_downSeriesType) {
  anychart.stockModule.indicators.Aroon.base(this, 'constructor', plot, mapping);

  /**
   * Aroon period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);

  this.declareSeries('upAroon', opt_upSeriesType);
  this.declareSeries('downAroon', opt_downSeriesType);
  this.init();
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
  }
};


/**
 * Getter for the indicator Aroon series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.Aroon.prototype.upSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series} */(
      this.seriesInternal('upAroon', opt_type));
};


/**
 * Getter for the indicator signal series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.Aroon.prototype.downSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.Aroon|anychart.stockModule.Series} */(
      this.seriesInternal('downAroon', opt_type));
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
})();
