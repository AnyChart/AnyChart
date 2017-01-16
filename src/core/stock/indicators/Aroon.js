goog.provide('anychart.core.stock.indicators.Aroon');
goog.require('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('anychart.math.aroon');
goog.require('anychart.utils');



/**
 * Aroon indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @param {anychart.enums.StockSeriesType=} opt_upSeriesType
 * @param {anychart.enums.StockSeriesType=} opt_downSeriesType
 * @constructor
 * @extends {anychart.core.stock.indicators.Base}
 */
anychart.core.stock.indicators.Aroon = function(plot, mapping, opt_period, opt_upSeriesType, opt_downSeriesType) {
  anychart.core.stock.indicators.Aroon.base(this, 'constructor', plot, mapping);

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
goog.inherits(anychart.core.stock.indicators.Aroon, anychart.core.stock.indicators.Base);


/** @inheritDoc */
anychart.core.stock.indicators.Aroon.prototype.createComputer = function(mapping) {
  return anychart.math.aroon.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.core.stock.indicators.Aroon.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'upAroon':
      return 'Aroon up';
    case 'downAroon':
      return 'Aroon down';
  }
  return '';
};


/** @inheritDoc */
anychart.core.stock.indicators.Aroon.prototype.setupMapping = function(mapping, computer, seriesId, series) {
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
 * @return {anychart.core.stock.indicators.Aroon|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.Aroon.prototype.upSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.Aroon|anychart.core.series.Stock} */(
      this.seriesInternal('upAroon', opt_type));
};


/**
 * Getter for the indicator signal series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.Aroon|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.Aroon.prototype.downSeries = function(opt_type) {
  return /** @type {anychart.core.stock.indicators.Aroon|anychart.core.series.Stock} */(
      this.seriesInternal('downAroon', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.core.stock.indicators.Aroon|number}
 */
anychart.core.stock.indicators.Aroon.prototype.period = function(opt_value) {
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
  var proto = anychart.core.stock.indicators.Aroon.prototype;
  proto['period'] = proto.period;
  proto['upSeries'] = proto.upSeries;
  proto['downSeries'] = proto.downSeries;
})();
