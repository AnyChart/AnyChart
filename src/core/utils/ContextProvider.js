goog.provide('anychart.core.utils.GanttContextProvider');
goog.provide('anychart.core.utils.IContextProvider');
goog.provide('anychart.core.utils.LegendContextProvider');
goog.provide('anychart.core.utils.MapPointContextProvider');
goog.provide('anychart.core.utils.PointContextProvider');
goog.provide('anychart.core.utils.SeriesPointContextProvider');
goog.provide('anychart.core.utils.StockSeriesContextProvider');

goog.require('anychart.enums');
goog.require('anychart.utils');



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
 * @param {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline} chartInstance chart instance.
 * @param {Array.<string>} referenceValueNames reference value names to be applied.
 * @constructor
 */
anychart.core.utils.PointContextProvider = function(chartInstance, referenceValueNames) {
  /**
   * @type {anychart.charts.Pie|anychart.core.PyramidFunnelBase|anychart.charts.Sparkline}
   */
  this['chart'] = chartInstance;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['chart'].getIterator();
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
  return /** @type {{statistics:Function, getIterator:Function}} */(this['chart']).statistics(opt_key);
};


/** @inheritDoc */
anychart.core.utils.PointContextProvider.prototype.getDataValue = function(key) {
  return this['chart'].getIterator().get(key);
};



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base|anychart.core.gauge.pointers.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @param {boolean} addErrorInfo Whether to add error info to a provider.
 * @constructor
 */
anychart.core.utils.SeriesPointContextProvider = function(series, referenceValueNames, addErrorInfo) {
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
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/** @inheritDoc */
anychart.core.utils.SeriesPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
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
  return this['series'].statistics(opt_key);
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



/**
 * Stock series context provider.
 * @param {anychart.core.stock.series.Base} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @constructor
 */
anychart.core.utils.StockSeriesContextProvider = function(series, referenceValueNames) {
  /**
   * @type {anychart.core.stock.series.Base}
   */
  this['series'] = series;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/**
 * Applies reference values.
 */
anychart.core.utils.StockSeriesContextProvider.prototype.applyReferenceValues = function() {
  var currentPoint = this['series'].getCurrentPoint();
  var value;
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = currentPoint ? currentPoint.get(value) : NaN;
    if (!goog.isDef(this[value])) this[value] = NaN;
  }
  this['x'] = currentPoint ? currentPoint.getKey() : NaN;
  this['seriesName'] = this['series'].name();
};


/**
 * Fetch data value by its key.
 * @param {string} key Key.
 * @return {*}
 */
anychart.core.utils.StockSeriesContextProvider.prototype.getDataValue = function(key) {
  return this['series'].getCurrentPoint().get(key);
};



/**
 * Context provider for legend itemsTextFormatter function
 * @param {(anychart.core.SeriesBase)=} opt_source Source for statistics and meta.
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



/**
 * Series point context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base)} series Series.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @constructor
 */
anychart.core.utils.MapPointContextProvider = function(series, referenceValueNames) {
  /**
   * @type {(anychart.core.SeriesBase|anychart.core.sparkline.series.Base)}
   * @private
   */
  this['series'] = series;

  /**
   * @type {Array.<string>}
   * @private
   */
  this.referenceValueNames_ = referenceValueNames;
};


/** @inheritDoc */
anychart.core.utils.MapPointContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this['series'].getIterator();
  var value;
  this['index'] = iterator.getIndex();
  for (var i = 0; i < this.referenceValueNames_.length; i++) {
    value = this.referenceValueNames_[i];
    this[value] = iterator.get(value);
  }

  var regionId = iterator.meta('regionId');
  if (regionId)
    this['id'] = regionId;

  if (this['series'].name)
    this['seriesName'] = this['series'].name() || 'Series: ' + this['series'].index();

  var pointGeoProp = iterator.meta('regionProperties');
  if (pointGeoProp) {
    this['name'] = pointGeoProp['name'];
    this['regionProperties'] = pointGeoProp;
  }

};


/** @inheritDoc */
anychart.core.utils.MapPointContextProvider.prototype.getDataValue = function(key) {
  return this['series'].getIterator().get(key);
};


/** @inheritDoc */
anychart.core.utils.MapPointContextProvider.prototype.getStat = function(opt_key) {
  return this['series'].statistics(opt_key);
};


/**
 * Gets series meta by key.
 * @param {string=} opt_key Key.
 * @return {*} Meta value by key, or meta object.
 */
anychart.core.utils.MapPointContextProvider.prototype.getSeriesMeta = function(opt_key) {
  return this['series'].meta(opt_key);
};



/**
 * Gantt context provider.
 * @implements {anychart.core.utils.IContextProvider}
 * @param {boolean=} opt_isResources - Whether gantt chart is resources chart.
 * @constructor
 */
anychart.core.utils.GanttContextProvider = function(opt_isResources) {
  /**
   * @type {boolean}
   * @private
   */
  this['isResources'] = !!opt_isResources;

  /**
   * Current tree data item.
   * TODO (A.Kudryavtsev): Make kind of analogue with another context providers (kind of series.getIterator())?
   * @type {anychart.data.Tree.DataItem}
   */
  this.currentItem = null;

  /**
   * Current period (in use for resources chart).
   * @type {Object|undefined}
   */
  this.currentPeriod;
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.applyReferenceValues = function() {

  //TODO (A.Kudryavtsev): NOTE!!! All work with dates will be redone after i18n is implemented!!!
  if (this.currentItem) {
    this['item'] = this.currentItem;
    this['name'] = this.currentItem.get(anychart.enums.GanttDataFields.NAME);
    this['id'] = this.currentItem.get(anychart.enums.GanttDataFields.ID);

    if (this['isResources']) {
      this['minPeriodDate'] = this.currentItem.meta('minPeriodDate');
      this['maxPeriodDate'] = this.currentItem.meta('maxPeriodDate');
      this['period'] = this.currentPeriod || void 0;
      this['periodStart'] = this.currentPeriod ?
          anychart.utils.normalizeTimestamp(this.currentPeriod[anychart.enums.GanttDataFields.START]) :
          void 0;
      this['periodEnd'] = this.currentPeriod ?
          anychart.utils.normalizeTimestamp(this.currentPeriod[anychart.enums.GanttDataFields.END]) :
          void 0;
    } else {
      this['actualStart'] = anychart.utils.normalizeTimestamp(this.currentItem.get(anychart.enums.GanttDataFields.ACTUAL_START));
      this['actualEnd'] = anychart.utils.normalizeTimestamp(this.currentItem.get(anychart.enums.GanttDataFields.ACTUAL_END));
      this['progressValue'] = this.currentItem.get(anychart.enums.GanttDataFields.PROGRESS_VALUE);

      var isParent = !!this.currentItem.numChildren();
      this['autoStart'] = isParent ? this.currentItem.meta('autoStart') : void 0;
      this['actualEnd'] = isParent ? this.currentItem.meta('actualEnd') : void 0;
      this['autoProgress'] = isParent ? this.currentItem.meta('autoProgress') : void 0;
    }
  }
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.getDataValue = function(key) {
  return this.currentItem ? this.currentItem.get(key) : void 0;
};


/** @inheritDoc */
anychart.core.utils.GanttContextProvider.prototype.getStat = function(opt_key) {
  return void 0; //TODO (A.Kudryavtsev): TBA on gantt statistics implementation.
};


/**
 * Gets series meta by key.
 * @param {string} key - Key.
 * @return {*} Meta value by key.
 */
anychart.core.utils.GanttContextProvider.prototype.getMetaValue = function(key) {
  return this.currentItem ? this.currentItem.meta(key) : void 0;
};


//exports
anychart.core.utils.PointContextProvider.prototype['getStat'] = anychart.core.utils.PointContextProvider.prototype.getStat;
anychart.core.utils.PointContextProvider.prototype['getDataValue'] = anychart.core.utils.PointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getStat'] = anychart.core.utils.SeriesPointContextProvider.prototype.getStat;
anychart.core.utils.SeriesPointContextProvider.prototype['getDataValue'] = anychart.core.utils.SeriesPointContextProvider.prototype.getDataValue;
anychart.core.utils.SeriesPointContextProvider.prototype['getSeriesMeta'] = anychart.core.utils.SeriesPointContextProvider.prototype.getSeriesMeta;
anychart.core.utils.LegendContextProvider.prototype['getStat'] = anychart.core.utils.LegendContextProvider.prototype.getStat;
anychart.core.utils.LegendContextProvider.prototype['getMeta'] = anychart.core.utils.LegendContextProvider.prototype.getMeta;
anychart.core.utils.MapPointContextProvider.prototype['getDataValue'] = anychart.core.utils.MapPointContextProvider.prototype.getDataValue;
anychart.core.utils.MapPointContextProvider.prototype['getStat'] = anychart.core.utils.MapPointContextProvider.prototype.getStat;
anychart.core.utils.MapPointContextProvider.prototype['getSeriesMeta'] = anychart.core.utils.MapPointContextProvider.prototype.getSeriesMeta;
anychart.core.utils.GanttContextProvider.prototype['getDataValue'] = anychart.core.utils.GanttContextProvider.prototype.getDataValue;
anychart.core.utils.GanttContextProvider.prototype['getStat'] = anychart.core.utils.GanttContextProvider.prototype.getStat;
anychart.core.utils.GanttContextProvider.prototype['getMetaValue'] = anychart.core.utils.GanttContextProvider.prototype.getMetaValue;
