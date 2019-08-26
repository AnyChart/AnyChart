goog.provide('anychart.stockModule.indicators.RCI');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.rci');
goog.require('anychart.utils');



/**
 * RCI indicator class.
 * @param {Array} args [plot, mapping, opt_period, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.RCI = function(args) {
  anychart.stockModule.indicators.RCI.base(this, 'constructor', args);

  /**
   * RCI period.
   * @type {number}
   * @private
   */
  this.period_ = anychart.utils.normalizeToNaturalNumber(args[2], 12, false);

  this.declareSeries('main', args[3]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.RCI, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.RCI.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.rci.createComputer(mapping, this.period_);
};


/** @inheritDoc */
anychart.stockModule.indicators.RCI.prototype.createNameForSeries = function(seriesId, series) {
  return 'RCI(' + this.period_ + ')';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.RCI|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.RCI.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.RCI|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the period.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.RCI|number}
 */
anychart.stockModule.indicators.RCI.prototype.period = function(opt_value) {
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
  var proto = anychart.stockModule.indicators.RCI.prototype;
  proto['series'] = proto.series;
  proto['period'] = proto.period;
})();
