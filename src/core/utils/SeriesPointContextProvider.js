goog.provide('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');
goog.require('anychart.enums');



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.SeriesPointContextProvider = function(series, referenceValueNames, addErrorInfo) {
  anychart.core.utils.SeriesPointContextProvider.base(this, 'constructor');
  /**
   * @type {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)}
   * @private
   */
  this['series'] = series;

  /**
   * @type {boolean}
   * @private
   */
  this.errorAvailable_ = addErrorInfo;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.referenceValueNames = referenceValueNames;
};
goog.inherits(anychart.core.utils.SeriesPointContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  this['x'] = iterator.get('x'); // redundant for all series except Cartesian
  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }
  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series: ' + this['series'].index();
  if (this.errorAvailable_) {
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


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getStat = function(opt_key) {
  return (/** @type {anychart.core.SeriesBase} */ (this['series'])).statistics(opt_key);
};


/** @inheritDoc */
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
    case '%High':
      return this['high'];
    case '%Low':
      return this['low'];
    case '%Open':
      return this['open'];
    case '%Close':
      return this['close'];
    case '%BubbleSize':
      return this['size'];
    case '%RangeStart':
      return this['low'];
    case '%RangeEnd':
      return this['high'];
    case '%Range':
      return this['high'] - this['low'];
    case '%SeriesName':
      return this['seriesName'];
    case '%SeriesYSum':
      return this.getStat('seriesSum');
    case '%SeriesYMax':
      return this.getStat('seriesMax');
    case '%SeriesYMin':
      return this.getStat('seriesMin');
    case '%SeriesYAverage':
      return this.getStat('seriesAverage');
    case '%SeriesPointCount':
      return this.getStat('seriesPointsCount');
    case '%DataPlotYSum':
      return this.getStat('sum');
    case '%DataPlotYMax':
      return this.getStat('max');
    case '%DataPlotYMin':
      return this.getStat('min');
    case '%DataPlotYAverage':
      return this.getStat('average');
    case '%DataPlotPointCount':
      return this.getStat('pointsCount');
    case '%DataPlotSeriesCount':
      var series = /** @type {anychart.core.SeriesBase} */ (this['series']);
      var chart = /** @type {anychart.charts.Cartesian|anychart.charts.Scatter|anychart.charts.Radar|anychart.charts.Polar|anychart.charts.Map} */ (series.getChart());
      return chart.getSeriesCount();
    case '%YPercentOfSeries':
      return this['value'] * 100 / /** @type {number} */ (this.getStat('seriesSum'));
    case '%YPercentOfTotal':
      return this['value'] * 100 / /** @type {number} */ (this.getStat('sum'));
    case '%XValue':
      return this['x'];
    case '%Name':
      return this.getDataValue('name');
  }
  return anychart.core.utils.SeriesPointContextProvider.base(this, 'getTokenValue', name);
};


//exports
anychart.core.utils.SeriesPointContextProvider.prototype['getStat'] = anychart.core.utils.SeriesPointContextProvider.prototype.getStat;
anychart.core.utils.SeriesPointContextProvider.prototype['getDataValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getSeriesMeta'] = anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta;
anychart.core.utils.SeriesPointContextProvider.prototype['getTokenValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getTokenValue;
