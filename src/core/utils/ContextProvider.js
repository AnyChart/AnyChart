goog.provide('anychart.core.utils.IContextProvider');
goog.provide('anychart.core.utils.PiePointContextProvider');
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
 * @param {string} key Key.
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
 * @param {anychart.charts.Pie} pie instance.
 * @param {Array.<string>} referenceValueNames reference value names to be applied.
 * @constructor
 */
anychart.core.utils.PiePointContextProvider = function(pie, referenceValueNames) {
  /**
   * @type {anychart.charts.Pie}
   * @private
   */
  this.pie_ = pie;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/** @inheritDoc */
anychart.core.utils.PiePointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this.pie_.getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = iterator.get(value);
  }
  if (iterator.meta('groupedPoint') == true) {
    this['name'] = 'Grouped Point';
    this['groupedPoint'] = true;
    this['names'] = iterator.meta('names');
    this['values'] = iterator.meta('values');
  }
};


/** @inheritDoc */
anychart.core.utils.PiePointContextProvider.prototype.getStat = function(key) {
  return this.pie_.statistics(key);
};


/** @inheritDoc */
anychart.core.utils.PiePointContextProvider.prototype.getDataValue = function(key) {
  return this.pie_.getIterator().get(key);
};



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.cartesian.series.Base|anychart.core.scatter.series.Base|anychart.core.radar.series.Base|anychart.core.polar.series.Base|anychart.core.sparkline.series.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @constructor
 */
anychart.core.utils.SeriesPointContextProvider = function(series, referenceValueNames) {
  /**
   * @type {(anychart.core.cartesian.series.Base|anychart.core.scatter.series.Base|anychart.core.radar.series.Base|anychart.core.polar.series.Base|anychart.core.sparkline.series.Base)}
   * @private
   */
  this.series_ = series;

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
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.getStat = function(key) {
  return this.series_.statistics(key);
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

//exports
anychart.core.utils.PiePointContextProvider.prototype['getStat'] = anychart.core.utils.PiePointContextProvider.prototype.getStat;
anychart.core.utils.PiePointContextProvider.prototype['getDataValue'] = anychart.core.utils.PiePointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getStat'] = anychart.core.utils.SeriesPointContextProvider.prototype.getStat;
anychart.core.utils.SeriesPointContextProvider.prototype['getDataValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getSeriesMeta'] = anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta;
