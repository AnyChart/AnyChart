goog.provide('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');
goog.require('anychart.enums');



/**
 * Series point context provider.
 * @param {(anychart.core.series.Base|anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @implements {anychart.core.utils.IContextProvider}
 * @constructor
 */
anychart.core.utils.SeriesPointContextProvider = function(series, referenceValueNames, addErrorInfo) {
  anychart.core.utils.SeriesPointContextProvider.base(this, 'constructor');

  this.seriesInternal = series;

  this.chartInternal = series.getChart && series.getChart();
  if (this.chartInternal)
    this['chart'] = this.chartInternal;

  /**
   * @type {(anychart.core.series.Base|anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)}
   * @private
   */
  this['series'] = series;

  /**
   * @type {string}
   * @private
   */
  this['xScaleType'] = goog.isFunction(series.xScale) ? series.xScale().getType() : undefined;

  /**
   * @type {boolean}
   * @protected
   */
  this.errorAvailable = addErrorInfo;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.referenceValueNames = referenceValueNames;
};
goog.inherits(anychart.core.utils.SeriesPointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.applyReferenceValues = function() {
  this.applyReferenceValuesInternal(this['series'].getIterator());
};


/**
 * Applies reference values for passed point.
 * @param {anychart.data.IRowInfo} point
 * @protected
 */
anychart.core.utils.SeriesPointContextProvider.prototype.applyReferenceValuesInternal = function(point) {
  var value;
  this['index'] = point ? point.getIndex() : NaN;

  //TODO (A.Kudryavtsev): Do we need to add point from chart (not from series)?
  this.pointInternal = this.seriesInternal.getPoint ? this.seriesInternal.getPoint(this['index']) : null;

  this['x'] = point ? point.getX() : undefined; // redundant for all series except Cartesian
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = point ? point.get(value) : undefined;
  }
  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series ' + this['series'].getIndex();
  if (this['series'].isSizeBased())
    this['size'] = point ? point.get('size') : undefined;
  if (this.errorAvailable) {
    /** @type {anychart.core.utils.ISeriesWithError} */
    var series = /** @type {anychart.core.utils.ISeriesWithError} */(this['series']);
    /** @type {anychart.enums.ErrorMode} */
    var mode = /** @type {anychart.enums.ErrorMode} */(series.error().mode());
    var error;
    if (mode == anychart.enums.ErrorMode.BOTH || mode == anychart.enums.ErrorMode.VALUE) {
      error = series.getErrorValues(false);
      this['valueLowerError'] = error[0];
      this['valueUpperError'] = error[1];
    }
    if (mode == anychart.enums.ErrorMode.BOTH || mode == anychart.enums.ErrorMode.X) {
      error = series.getErrorValues(true);
      this['xLowerError'] = error[0];
      this['xUpperError'] = error[1];
    }
  }
};


/**
 * Fetch statistics value by its key or a whole object if no key provided.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.SeriesPointContextProvider.prototype.getStat = function(opt_key) {
  var series = (/** @type {anychart.core.series.Base|anychart.core.SeriesBase} */ (this['series']));
  series.chart.ensureStatisticsReady();
  return series.statistics(opt_key);
};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue = function(key) {
  return this['series'].getIterator().get(key);
};


/**
 * Gets series meta by key.
 * @param {string=} opt_key Key.
 * @return {*} Meta value by key, or meta object.
 */
anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta = function(opt_key) {
  return this['series'].meta(opt_key);
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.HIGH:
      return this['high'];
    case anychart.enums.StringToken.LOW:
      return this['low'];
    case anychart.enums.StringToken.OPEN:
      return this['open'];
    case anychart.enums.StringToken.CLOSE:
      return this['close'];
    case anychart.enums.StringToken.BUBBLE_SIZE:
      return this['size'];
    case anychart.enums.StringToken.RANGE_START:
      return this['low'];
    case anychart.enums.StringToken.RANGE_END:
      return this['high'];
    case anychart.enums.StringToken.RANGE:
      return this['high'] - this['low'];
    case anychart.enums.StringToken.SERIES_NAME:
      return this['seriesName'];
    case anychart.enums.StringToken.X_VALUE:
      return this['x'];
    case anychart.enums.StringToken.NAME:
      return this.getDataValue('name');
  }
  return anychart.core.utils.SeriesPointContextProvider.base(this, 'getTokenValue', name);
};


//exports
(function() {
  var proto = anychart.core.utils.SeriesPointContextProvider.prototype;
  proto['getStat'] = proto.getStat;
  proto['getDataValue'] = proto.getDataValue;
  proto['getSeriesMeta'] = proto.getSeriesMeta;
  proto['getTokenValue'] = proto.getTokenValue;
})();
