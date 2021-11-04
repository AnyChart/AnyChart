goog.provide('anychart.stockModule.indicators.Base');
goog.require('anychart.enums');
goog.require('goog.Disposable');



/**
 * EMA indicator class.
 * @param {Array} args [plot, mapping]
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.stockModule.indicators.Base = function(args) {
  anychart.stockModule.indicators.Base.base(this, 'constructor');

  /**
   * Plot reference.
   * @type {!(anychart.stockModule.Plot|anychart.stockModule.Scroller)}
   * @private
   */
  this.plot_ = args[0];

  /**
   * Input mapping.
   * @type {!anychart.stockModule.data.TableMapping}
   * @private
   */
  this.mapping_ = args[1];

  /**
   * Series holder.
   * @type {!Object.<anychart.stockModule.indicators.Base.SeriesDescriptor>}
   * @private
   */
  this.series_ = {};

  /**
   * Computer instance.
   * @type {?anychart.stockModule.data.TableComputer}
   * @private
   */
  this.computer_ = null;

  /**
   * Chart instance.
   * @type {?anychart.core.Chart}
   * @private
   */
  this.chart_ = null;
};
goog.inherits(anychart.stockModule.indicators.Base, goog.Disposable);


/**
 * @typedef {{
 *   series: ?(anychart.stockModule.Series),
 *   seriesType: anychart.enums.StockSeriesType,
 *   mappingSet: boolean,
 *   mapping: anychart.stockModule.data.TableMapping
 * }}
 */
anychart.stockModule.indicators.Base.SeriesDescriptor;


/**
 * Creates and returns computer.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {?anychart.core.Chart} chart
 * @return {anychart.stockModule.data.TableComputer}
 * @protected
 */
anychart.stockModule.indicators.Base.prototype.createComputer = goog.abstractMethod;


/**
 * Returns a string that will be set as a name for the series.
 * @param {string} seriesId
 * @param {!anychart.stockModule.Series} series
 * @return {string}
 * @protected
 */
anychart.stockModule.indicators.Base.prototype.createNameForSeries = goog.abstractMethod;


/**
 * Declares series.
 * @param {string} id
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @param {anychart.enums.StockSeriesType=} opt_defaultType
 * @protected
 */
anychart.stockModule.indicators.Base.prototype.declareSeries = function(id, opt_type, opt_defaultType) {
  this.series_[id] = {
    series: null,
    seriesType: anychart.enums.normalizeStockSeriesType(opt_type, opt_defaultType),
    mappingSet: false,
    mapping: null,
    internalChanged: false
  };
};


/**
 * Getter/setter for series that should be proxied to the actual series getters/setters.
 * @param {string} id
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.stockModule.indicators.Base|anychart.stockModule.Series}
 */
anychart.stockModule.indicators.Base.prototype.seriesInternal = function(id, opt_type) {
  var descriptor = this.series_[id];
  if (!descriptor) { // internal error
    if (goog.isDef(opt_type))
      return this;
    else
      return null;
  }
  if (goog.isDef(opt_type)) {
    var type = anychart.enums.normalizeStockSeriesType(opt_type, descriptor.seriesType);
    if (type != descriptor.series.seriesType()) {
      descriptor.seriesType = type;
      descriptor.mappingSet = false;
      descriptor.internalChanged = true;
      this.init();
    }
    return this;
  }
  return descriptor.series;
};


/**
 * Setups mapping fields.
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {anychart.stockModule.data.TableComputer} computer
 * @param {string} seriesId
 * @param {!anychart.stockModule.Series} series
 * @protected
 */
anychart.stockModule.indicators.Base.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  mapping.addField('value', computer.getFieldIndex('result'));
};


/**
 * Initializes series and sets it's data.
 * @protected
 */
anychart.stockModule.indicators.Base.prototype.init = function() {
  if (!this.chart_)
    this.chart_ = this.plot_.getChart();

  if (!this.computer_)
    this.computer_ = this.createComputer(this.mapping_, this.chart_);
  this.chart_.suspendSignalsDispatching();

  for (var seriesId in this.series_) {
    var descriptor = this.series_[seriesId];
    if (!descriptor.series) {
      descriptor.series = this.plot_.createSeriesByType(descriptor.seriesType);
      descriptor.series.defaultDecimalDigitsCount = 2;
      descriptor.mappingSet = false;
    }
    descriptor.series.suspendSignalsDispatching();
    if (descriptor.internalChanged) {
      descriptor.series.seriesType(descriptor.seriesType);
      descriptor.internalChanged = false;
    }
    if (!descriptor.mapping) {
      descriptor.mapping = this.mapping_.getTable().mapAs();
      this.setupMapping(descriptor.mapping, this.computer_, seriesId, descriptor.series);
    }
    if (!descriptor.mappingSet) {
      descriptor.series.data(descriptor.mapping);
      if (goog.isFunction(descriptor.series.name))
        descriptor.series.name(this.createNameForSeries(seriesId, descriptor.series));
      descriptor.mappingSet = true;
    }
    descriptor.series.resumeSignalsDispatching(true);
  }

  this.plot_.getChart().resumeSignalsDispatching(true);
};


/**
 * Drops current computer if any.
 * @protected
 */
anychart.stockModule.indicators.Base.prototype.reinitComputer = function() {
  for (var i in this.series_) {
    var descriptor = this.series_[i];
    descriptor.mappingSet = false;
    goog.dispose(descriptor.mapping);
    descriptor.mapping = null;
  }
  goog.dispose(this.computer_);
  this.computer_ = null;
  this.init();
};


/**
 * @inheritDoc
 */
anychart.stockModule.indicators.Base.prototype.disposeInternal = function() {
  for (var i in this.series_) {
    var descriptor = this.series_[i];
    if (descriptor.series)
      this.plot_.removeSeries(/** @type {number|string} */(descriptor.series.id()));
    goog.dispose(descriptor.series);
    descriptor.mappingSet = false;
    goog.dispose(descriptor.mapping);
    descriptor.mapping = null;
  }
  delete this.series_;
  goog.dispose(this.computer_);
  this.computer_ = null;
  delete this.plot_;
  delete this.mapping_;
  delete this.chart_;
  anychart.stockModule.indicators.Base.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.stockModule.indicators.Base.prototype;
  proto['dispose'] = proto.dispose;
})();
