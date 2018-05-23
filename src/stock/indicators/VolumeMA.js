goog.provide('anychart.stockModule.indicators.VolumeMA');
goog.require('anychart.enums');
goog.require('anychart.stockModule.indicators.Base');
goog.require('anychart.stockModule.math.volumeMA');
goog.require('anychart.utils');



/**
 * Volume+MA indicator class.
 * @param {Array} args [plot, mapping, opt_maPeriod, opt_maType, opt_volumeSeriesType, opt_maSeriesType]
 * @constructor
 * @extends {anychart.stockModule.indicators.Base}
 */
anychart.stockModule.indicators.VolumeMA = function(args) {
  anychart.stockModule.indicators.VolumeMA.base(this, 'constructor', args);

  /**
   * MA period.
   * @type {number}
   * @private
   */
  this.maPeriod_ = anychart.utils.normalizeToNaturalNumber(args[2], 20, false);

  /**
   * MA smooth type.
   * @type {anychart.enums.MovingAverageType}
   * @private
   */
  this.maType_ = anychart.enums.normalizeMovingAverageType(args[3], anychart.enums.MovingAverageType.SMA);

  this.declareSeries('volumeSeries', args[4], anychart.enums.StockSeriesType.STICK);
  this.declareSeries('maSeries', args[5]);
  this.init();
};
goog.inherits(anychart.stockModule.indicators.VolumeMA, anychart.stockModule.indicators.Base);


/** @inheritDoc */
anychart.stockModule.indicators.VolumeMA.prototype.createComputer = function(mapping) {
  return anychart.stockModule.math.volumeMA.createComputer(mapping, this.maPeriod_, this.maType_);
};


/** @inheritDoc */
anychart.stockModule.indicators.VolumeMA.prototype.createNameForSeries = function(seriesId, series) {
  switch (seriesId) {
    case 'volumeSeries':
      return 'Volume';
    case 'maSeries':
      return this.maType_.toUpperCase() + '(' + this.maPeriod_ + ')';
  }
  return '';
};


/** @inheritDoc */
anychart.stockModule.indicators.VolumeMA.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  switch (seriesId) {
    case 'volumeSeries':
      mapping.addField('value', computer.getFieldIndex('volumeResult'));
      break;
    case 'maSeries':
      mapping.addField('value', computer.getFieldIndex('maResult'));
      break;
  }
};


/**
 * Getter for the indicator volumeSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.VolumeMA|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.VolumeMA.prototype.volumeSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.VolumeMA|anychart.stockModule.Series} */(
      this.seriesInternal('volumeSeries', opt_type));
};


/**
 * Getter for the indicator maSeries or setter for it's type. If passed - recreates the series.
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Base|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.VolumeMA.prototype.maSeries = function(opt_type) {
  return /** @type {anychart.stockModule.indicators.VolumeMA|anychart.stockModule.Series} */(
      this.seriesInternal('maSeries', opt_type));
};


/**
 * Getter and setter for maPeriod.
 * @param {number=} opt_value
 * @return {anychart.stockModule.indicators.VolumeMA|number}
 */
anychart.stockModule.indicators.VolumeMA.prototype.maPeriod = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var period = anychart.utils.normalizeToNaturalNumber(opt_value, this.maPeriod_, false);
    if (period != this.maPeriod_) {
      this.maPeriod_ = period;
      this.reinitComputer();
    }
    return this;
  }
  return this.maPeriod_;
};


/**
 * Getter and setter for the smoothing type.
 * @param {anychart.enums.MovingAverageType=} opt_value
 * @return {anychart.stockModule.indicators.VolumeMA|anychart.enums.MovingAverageType}
 */
anychart.stockModule.indicators.VolumeMA.prototype.maType = function(opt_value) {
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


//exports
(function() {
  var proto = anychart.stockModule.indicators.VolumeMA.prototype;
  proto['maPeriod'] = proto.maPeriod;
  proto['maType'] = proto.maType;
  proto['maSeries'] = proto.maSeries;
  proto['volumeSeries'] = proto.volumeSeries;
})();
