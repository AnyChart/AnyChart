goog.provide('anychart.core.utils.IContextProvider');
goog.provide('anychart.core.utils.LegendContextProvider');
goog.provide('anychart.core.utils.PointContextProvider');
goog.provide('anychart.core.utils.SeriesPointContextProvider');



/**
 * Context provider interface
 * @interface
 */
anychart.core.utils.IContextProvider = function() {
};


/**
 * Applies reference values.
 */
anychart.core.utils.IContextProvider.prototype.applyReferenceValues;


/**
 * Fetch statistics value by key.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.IContextProvider.prototype.getStat;


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.IContextProvider.prototype.getDataValue;



/**
 * @implements {anychart.core.utils.IContextProvider}
 * @param {anychart.charts.Pie|anychart.core.PyramidFunnelBase} chartInstance chart instance.
 * @param {Array.<string>} referenceValueNames reference value names to be applied.
 * @constructor
 */
anychart.core.utils.PointContextProvider = function(chartInstance, referenceValueNames) {
  /**
   * @type {anychart.charts.Pie|anychart.core.PyramidFunnelBase}
   * @private
   */
  this.chartInstance_ = chartInstance;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this.chartInstance_.getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = iterator.get(value);
  }
  if (iterator.meta('groupedPoint') == true) {
    this['name'] = 'Other points';
    this['groupedPoint'] = true;
    this['names'] = iterator.meta('names');
    this['values'] = iterator.meta('values');
  }
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getStat = function(opt_key) {
  return this.chartInstance_.statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getDataValue = function(key) {
  return this.chartInstance_.getIterator().get(key);
};



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.cartesian.series.Base|anychart.core.scatter.series.Base|anychart.core.radar.series.Base|anychart.core.polar.series.Base|anychart.core.sparkline.series.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @constructor
 */
anychart.core.utils.SeriesPointContextProvider = function(series, referenceValueNames, addErrorInfo) {
  /**
   * @type {(anychart.core.cartesian.series.Base|anychart.core.scatter.series.Base|anychart.core.radar.series.Base|anychart.core.polar.series.Base|anychart.core.sparkline.series.Base)}
   * @private
   */
  this.series_ = series;

  /**
   * @type {boolean}
   * @private
   */
  this.errorAvailable_ = addErrorInfo;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this.series_.getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = iterator.get(value);
  }
  if (this.series_.name)
    this['seriesName'] = this.series_.name() || 'Series: ' + this.series_.index();
  if (this.errorAvailable_) {
    /** @type {anychart.core.utils.ISeriesWithError} */
    var series = /** @type {anychart.core.utils.ISeriesWithError} */(this.series_);
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


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getStat = function(opt_key) {
  return this.series_.statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue = function(key) {
  return this.series_.getIterator().get(key);
};


/**
 * Gets series meta by key.
 * @param {string=} opt_key Key.
 * @return {*} Meta value by key, or meta object.
 */
anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta = function(opt_key) {
  return this.series_.meta(opt_key);
};



/**
 * Context provider for legend itemsTextFormatter function
 * @param {(anychart.core.polar.series.Base|anychart.core.radar.series.Base|anychart.core.scatter.series.Base|
 *    anychart.core.cartesian.series.Base|anychart.core.map.series.Base)=} opt_source Source for statistics and meta.
 * @constructor
 */
anychart.core.utils.LegendContextProvider = function(opt_source) {
  this.source_ = opt_source;
};


/**
 * Fetch statistics value by key.
 * @param {string=} opt_key Key.
 * @return {*}
 */
anychart.core.utils.LegendContextProvider.prototype.getStat = function(opt_key) {
  return this.source_.statistics(opt_key);
};


/**
 * Gets meta by key.
 * @param {string=} opt_key Key.
 * @return {*} Meta value by key, or meta object.
 */
anychart.core.utils.LegendContextProvider.prototype.getMeta = function(opt_key) {
  if (this.source_.meta)
    return this.source_.meta(opt_key);
};

//exports
anychart.core.utils.PointContextProvider.prototype['getStat'] = anychart.core.utils.PointContextProvider.prototype.getStat;
anychart.core.utils.PointContextProvider.prototype['getDataValue'] = anychart.core.utils.PointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getStat'] = anychart.core.utils.SeriesPointContextProvider.prototype.getStat;
anychart.core.utils.SeriesPointContextProvider.prototype['getDataValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getSeriesMeta'] = anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta;
anychart.core.utils.LegendContextProvider.prototype['getStat'] = anychart.core.utils.LegendContextProvider.prototype.getStat;
anychart.core.utils.LegendContextProvider.prototype['getMeta'] = anychart.core.utils.LegendContextProvider.prototype.getMeta;
