goog.provide('anychart.core.stock.indicators.Base');
goog.require('anychart.enums');
goog.require('goog.Disposable');



/**
 * EMA indicator class.
 * @param {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)} plot
 * @param {!anychart.data.TableMapping} mapping
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.stock.indicators.Base = function(plot, mapping) {
  anychart.core.stock.indicators.Base.base(this, 'constructor');

  /**
   * Plot reference.
   * @type {!(anychart.core.stock.Plot|anychart.core.stock.Scroller)}
   * @private
   */
  this.plot_ = plot;

  /**
   * Input mapping.
   * @type {!anychart.data.TableMapping}
   * @private
   */
  this.mapping_ = mapping;

  /**
   * Series holder.
   * @type {!Object.<anychart.core.stock.indicators.Base.SeriesDescriptor>}
   * @private
   */
  this.series_ = {};

  /**
   * Computer instance.
   * @type {?anychart.data.TableComputer}
   * @private
   */
  this.computer_ = null;
};
goog.inherits(anychart.core.stock.indicators.Base, goog.Disposable);


/**
 * @typedef {{
 *   series: ?(anychart.core.series.Stock),
 *   seriesType: anychart.enums.StockSeriesType,
 *   mappingSet: boolean,
 *   mapping: anychart.data.TableMapping
 * }}
 */
anychart.core.stock.indicators.Base.SeriesDescriptor;


/**
 * Creates and returns computer.
 * @param {!anychart.data.TableMapping} mapping
 * @return {anychart.data.TableComputer}
 * @protected
 */
anychart.core.stock.indicators.Base.prototype.createComputer = goog.abstractMethod;


/**
 * Returns a string that will be set as a name for the series.
 * @param {string} seriesId
 * @param {!anychart.core.series.Stock} series
 * @return {string}
 * @protected
 */
anychart.core.stock.indicators.Base.prototype.createNameForSeries = goog.abstractMethod;


/**
 * Declares series.
 * @param {string} id
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @param {anychart.enums.StockSeriesType=} opt_defaultType
 * @protected
 */
anychart.core.stock.indicators.Base.prototype.declareSeries = function(id, opt_type, opt_defaultType) {
  this.series_[id] = {
    series: null,
    seriesType: anychart.enums.normalizeStockSeriesType(opt_type, opt_defaultType),
    mappingSet: false,
    mapping: null
  };
};


/**
 * Getter/setter for series that should be proxied to the actual series getters/setters.
 * @param {string} id
 * @param {anychart.enums.StockSeriesType=} opt_type
 * @return {anychart.core.stock.indicators.Base|anychart.core.series.Stock}
 */
anychart.core.stock.indicators.Base.prototype.seriesInternal = function(id, opt_type) {
  var descriptor = this.series_[id];
  if (!descriptor) { // internal error
    if (goog.isDef(opt_type))
      return this;
    else
      return null;
  }
  if (goog.isDef(opt_type)) {
    var type = anychart.enums.normalizeStockSeriesType(opt_type, descriptor.seriesType);
    if (type != descriptor.seriesType) {
      descriptor.seriesType = type;
      descriptor.mappingSet = false;
      this.init();
    }
    return this;
  }
  return descriptor.series;
};


/**
 * Setups mapping fields.
 * @param {!anychart.data.TableMapping} mapping
 * @param {anychart.data.TableComputer} computer
 * @param {string} seriesId
 * @param {!anychart.core.series.Stock} series
 * @protected
 */
anychart.core.stock.indicators.Base.prototype.setupMapping = function(mapping, computer, seriesId, series) {
  mapping.addField('value', computer.getFieldIndex('result'));
};


/**
 * Initializes series and sets it's data.
 * @protected
 */
anychart.core.stock.indicators.Base.prototype.init = function() {
  if (!this.computer_)
    this.computer_ = this.createComputer(this.mapping_);
  this.plot_.getChart().suspendSignalsDispatching();

  for (var seriesId in this.series_) {
    var descriptor = this.series_[seriesId];
    if (!descriptor.series) {
      descriptor.series = this.plot_.createSeriesByType(descriptor.seriesType);
      descriptor.mappingSet = false;
    }
    descriptor.series.suspendSignalsDispatching();
    if (descriptor.series.seriesType() != descriptor.seriesType) {
      descriptor.series.seriesType(descriptor.seriesType);
      descriptor.mappingSet = false;
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
anychart.core.stock.indicators.Base.prototype.reinitComputer = function() {
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
anychart.core.stock.indicators.Base.prototype.disposeInternal = function() {
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
  anychart.core.stock.indicators.Base.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.stock.indicators.Base.prototype;
  proto['dispose'] = proto.dispose;
})();
