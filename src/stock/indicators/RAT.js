goog.provide('anychart.stockModule.indicators.RAT');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.rat');
goog.require('anychart.utils');



/**
 * RAT indicator class.
 * @param {Array} args [plot, mapping, opt_baseDate, opt_seriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.RAT = function(args) {
  anychart.stockModule.indicators.RAT.base(this, 'constructor', args);

  var dateObj = anychart.format.parseDateTime(args[2]);

  /**
   * RAT base date.
   * @type {number}
   * @private
   */
  this.baseDate_ = dateObj ? dateObj.getTime() : 0;

  /**
   * RAT base date of original user type that returns to user via getter.
   * @type {*}
   * @private
   */
  this.baseDateRaw_ = args[2] || 0;

  this.declareSeries('main', args[3]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.RAT, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.RAT.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.rat.createComputer(mapping, this.baseDate_);
};


/** @inheritDoc */
anychart.stockModule.indicators.RAT.prototype.createNameForSeries = function(seriesId, series) {
  // TODO: (Shestacov) we thought to show the base date in series name, but we can't access first point key here if the baseDate is undefined
  // if (isNaN(this.baseDate_))
  //   return 'RAT(base)';
  // return 'RAT(' + anychart.format.dateTime(this.baseDate_) + ')';
  return 'RAT';
};


/**
 * Getter for the indicator series or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.RAT|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.RAT.prototype.series = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.RAT|anychart.stockModule.Series} */(
      this.seriesInternal('main', opt_type));
};


/**
 * Getter and setter for the baseDate.
 * As getter returns 0 if the baseDate is not valid or 0.
 * @param {*=} opt_value
 * @return {*}
 */
anychart.stockModule.indicators.RAT.prototype.baseDate = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var dateObj = anychart.format.parseDateTime(opt_value);
    var baseDate = dateObj ? dateObj.getTime() : 0;
    if (baseDate != this.baseDate_) {
      this.baseDate_ = baseDate;
      this.baseDateRaw_ = opt_value;
      this.reinitComputer();
    }
    return this;
  }
  return this.baseDate_ ? this.baseDateRaw_ : 0;
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.RAT.prototype;
  proto['series'] = proto.series;
  proto['baseDate'] = proto.baseDate;
})();
