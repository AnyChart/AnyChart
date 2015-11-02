goog.provide('anychart.core.stock.Scroller');
goog.require('anychart.core.stock.scrollerSeries.Base');
goog.require('anychart.core.stock.scrollerSeries.Column');
goog.require('anychart.core.stock.scrollerSeries.Line');
goog.require('anychart.core.stock.scrollerSeries.OHLC');
goog.require('anychart.core.ui.Scroller');
goog.require('anychart.scales');
goog.require('anychart.scales.StockOrdinalDateTime');
goog.require('anychart.scales.StockScatterDateTime');



/**
 * Stock scroller class. Adds series drawing to UI Scroller.
 * @param {!anychart.charts.Stock} chart
 * @constructor
 * @extends {anychart.core.ui.Scroller}
 */
anychart.core.stock.Scroller = function(chart) {
  goog.base(this);

  /**
   * Stock chart reference.
   * @type {!anychart.charts.Stock}
   * @private
   */
  this.chart_ = chart;

  /**
   * Series list.
   * @type {!Array.<!anychart.core.stock.scrollerSeries.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * Default scroller Y scale.
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.yScale_ = null;

  /**
   * X axis.
   * @type {anychart.core.axes.StockDateTime}
   * @private
   */
  this.xAxis_ = null;

  /**
   * Series layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.seriesContainer_ = null;

  /**
   * Selected series layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.selectedSeriesContainer_ = null;

  this.defaultSeriesType(anychart.enums.StockSeriesType.LINE);
};
goog.inherits(anychart.core.stock.Scroller, anychart.core.ui.Scroller);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.stock.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Scroller.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.STOCK_SCROLLER_SERIES |
    anychart.ConsistencyState.STOCK_SCROLLER_AXIS;


/**
 * Getter/setter for stock scroller plot defaultSeriesType.
 * @param {(string|anychart.enums.StockSeriesType)=} opt_value Default series type.
 * @return {anychart.core.stock.Scroller|anychart.enums.StockSeriesType} Default series type or self for chaining.
 */
anychart.core.stock.Scroller.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeStockSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/**
 * Default plot Y scale getter/setter.
 * @param {(anychart.enums.ScatterScaleTypes|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.core.stock.Scroller)} Default chart scale value or itself for method chaining.
 */
anychart.core.stock.Scroller.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      this.registerDisposable(opt_value = anychart.scales.ScatterBase.fromString(opt_value, false));
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      //this.chart_.redrawSeries();
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
      this.registerDisposable(this.yScale_);
    }
    return this.yScale_;
  }
};


/**
 * X axis getter/setter.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.StockDateTime|anychart.core.stock.Scroller)}
 */
anychart.core.stock.Scroller.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.core.axes.StockDateTime(true);
    this.xAxis_.setParentEventTarget(this);
    this.xAxis_.enabled(false);
    this.xAxis_.zIndex(52);
    this.xAxis_.listenSignals(this.xAxisInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_AXIS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.xAxis_.setup(opt_value);
    return this;
  } else {
    return this.xAxis_;
  }
};


//region Series-related methods
/**
 * Creates and returns a new column series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.Scroller.prototype.column = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.StockSeriesType.COLUMN, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new line series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.Scroller.prototype.line = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.StockSeriesType.LINE, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Creates and returns a new ohlc series.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @return {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.Scroller.prototype.ohlc = function(opt_data, opt_mappingSettings, opt_csvSettings) {
  return this.createSeriesByType_(anychart.enums.StockSeriesType.OHLC, opt_data, opt_mappingSettings, opt_csvSettings);
};


/**
 * Add series to chart.
 * @param {...(anychart.data.TableMapping)} var_args Chart series data.
 * @return {Array.<anychart.core.stock.scrollerSeries.Base>} Array of created series.
 */
anychart.core.stock.Scroller.prototype.addSeries = function(var_args) {
  var zIndex;
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType_(type, null, undefined, undefined));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType_(type, arguments[i], undefined, undefined));
    }
  }
  this.resumeSignalsDispatching(true);
  return rv;
};


/**
 * Find series index by its id.
 * @param {number|string} id Series id.
 * @return {number} Series index or -1 if didn't find.
 */
anychart.core.stock.Scroller.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.stock.scrollerSeries.Base} Series instance.
 */
anychart.core.stock.Scroller.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.stock.scrollerSeries.Base} Series instance.
 */
anychart.core.stock.Scroller.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.core.stock.Scroller.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.core.stock.Scroller} Self for method chaining.
 */
anychart.core.stock.Scroller.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    var series = this.series_;
    anychart.globalLock.lock();
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Returns series list. Considered internal. Returns it for reading only.
 * @return {!Array.<!anychart.core.stock.scrollerSeries.Base>}
 */
anychart.core.stock.Scroller.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Getter/setter for series default settings.
 * @param {Object} value Object with default series settings.
 */
anychart.core.stock.Scroller.prototype.setDefaultSeriesSettings = function(value) {
  this.defaultSeriesSettings_ = value;
};


/**
 * @param {string} type Series type.
 * @param {(anychart.data.TableMapping|anychart.data.Table|Array.<Array.<*>>|string)=} opt_data
 * @param {Object.<({column: number, type: anychart.enums.AggregationType, weights: number}|number)>=} opt_mappingSettings
 *   An object where keys are field names and values are objects with fields:
 *      - 'column': number - Column index, that the field should get values from;
 *      - 'type': anychart.enums.AggregationType - How to group values for the field. Defaults to 'close'.
 *      - 'weights': number - Column to get weights from for 'weightedAverage' grouping type. Note: If type set to
 *          'weightedAverage', but opt_weightsColumn is not passed - uses 'average' grouping instead.
 *   or numbers - just the column index to get values from. In this case the grouping type will be set to 'close'.
 * @param {Object=} opt_csvSettings CSV parser settings if the string is passed.
 * @private
 * @return {anychart.core.stock.scrollerSeries.Base}
 */
anychart.core.stock.Scroller.prototype.createSeriesByType_ = function(type, opt_data, opt_mappingSettings,
    opt_csvSettings) {
  type = anychart.enums.normalizeStockSeriesType(type);
  var ctl = anychart.core.stock.scrollerSeries.Base.SeriesTypesMap[type];

  var instance;
  if (ctl) {
    instance = new ctl(this);
    instance.data(opt_data, opt_mappingSettings, opt_csvSettings);
    instance.setParentEventTarget(this);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.getIndex()) + 1 : 0;
    this.series_.push(instance);
    var inc = index * anychart.core.stock.Plot.ZINDEX_INCREMENT_MULTIPLIER;
    instance.id(index).index(index);
    var seriesZIndex = ((type == anychart.enums.StockSeriesType.LINE) ?
            anychart.core.stock.Plot.ZINDEX_LINE_SERIES :
            anychart.core.stock.Plot.ZINDEX_SERIES) + inc;
    instance.setAutoZIndex(seriesZIndex);
    instance.setup(this.defaultSeriesSettings_[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Series invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Scroller.prototype.seriesInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES, anychart.Signal.NEEDS_REDRAW);
};
//endregion


/**
 * Returns the chart that created this scroller.
 * @return {!anychart.charts.Stock}
 */
anychart.core.stock.Scroller.prototype.getChart = function() {
  return this.chart_;
};


/**
 * Returns current scroller pixel bounds.
 * @return {!anychart.math.Rect}
 */
anychart.core.stock.Scroller.prototype.getPixelBounds = function() {
  return this.pixelBoundsCache;
};


/**
 * Internal x scale getter/setter. Managed by stock chart.
 * @param {anychart.scales.StockScatterDateTime=} opt_value
 * @return {anychart.scales.StockScatterDateTime|anychart.core.stock.Scroller}
 */
anychart.core.stock.Scroller.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_ = opt_value;
    this.invalidateScaleDependend();
    return this;
  }
  if (!this.xScale_) {
    this.xScale_ = new anychart.scales.StockOrdinalDateTime(this);
  }
  return this.xScale_;
};


/**
 * X axis invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.stock.Scroller.prototype.xAxisInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_AXIS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Invalidates scroller entities that depend on scroller scale.
 */
anychart.core.stock.Scroller.prototype.invalidateScaleDependend = function() {
  for (var i = 0; i < this.series_.length; i++) {
    var series = this.series_[i];
    if (series) {
      series.invalidate(anychart.ConsistencyState.STOCK_SERIES_POINTS);
    }
  }
  if (this.xAxis_)
    this.xAxis_.invalidate(anychart.ConsistencyState.APPEARANCE);
  this.invalidate(anychart.ConsistencyState.STOCK_SCROLLER_SERIES | anychart.ConsistencyState.STOCK_SCROLLER_AXIS);
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.draw = function() {
  goog.base(this, 'draw');

  if (!this.checkDrawingNeeded())
    return this;

  if (!this.seriesContainer_) {
    this.seriesContainer_ = this.rootLayer.layer();
    this.seriesContainer_.zIndex(1);
    this.selectedSeriesContainer_ = this.rootLayer.layer();
    this.selectedSeriesContainer_.disablePointerEvents(true);
    this.selectedSeriesContainer_.zIndex(51);
    this.selectedSeriesContainer_.clip(this.selectedClipRect);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER_SERIES)) {
    for (var i = 0; i < this.series_.length; i++) {
      var series = this.series_[i];
      if (series) {
        series.suspendSignalsDispatching();
        series.parentBounds(this.pixelBoundsCache);
        series.container(this.seriesContainer_);
        series.selectedContainer(this.selectedSeriesContainer_);
        series.draw();
        series.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.STOCK_SCROLLER_AXIS)) {
    if (this.xAxis_) {
      this.xAxis_.suspendSignalsDispatching();
      this.xAxis_.scale(/** @type {anychart.scales.StockScatterDateTime} */(this.xScale()));
      this.xAxis_.container(this.rootLayer);
      this.xAxis_.parentBounds(this.pixelBoundsCache);
      this.xAxis_.height(this.pixelBoundsCache.height);
      this.xAxis_.draw();
      this.xAxis_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.STOCK_SCROLLER_AXIS);
  }

  return this;
};


/**
 * Returns key by index. Index can be fractional - the key will be inter- or extrapolated.
 * @param {number} index
 * @return {number}
 */
anychart.core.stock.Scroller.prototype.getKeyByIndex = function(index) {
  return this.chart_.getKeyByFullRangeIndex(index);
};


/**
 * Returns index by key. If the key is not in the registry - returns fractional inter/extrapolated index for it.
 * @param {number} key
 * @return {number}
 */
anychart.core.stock.Scroller.prototype.getIndexByKey = function(key) {
  return this.chart_.getFullRangeIndexByKey(key);
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.makeRangeChangeEvent = function(type, startRatio, endRatio, source) {
  return {
    'type': type,
    'startRatio': startRatio,
    'endRatio': endRatio,
    'startKey': this.xScale().inverseTransform(startRatio),
    'endKey': this.xScale().inverseTransform(endRatio),
    'source': source
  };
};


/**
 * Sets range and invalidates what is needed to be invalidated.
 * @param {number} start
 * @param {number} end
 */
anychart.core.stock.Scroller.prototype.setRangeByValues = function(start, end) {
  start = this.xScale().transform(start);
  if (isNaN(start))
    start = 0;
  else
    start = goog.math.clamp(start, 0, 1);
  end = this.xScale().transform(end);
  if (isNaN(end))
    end = 1;
  else
    end = goog.math.clamp(end, 0, 1);
  this.setRangeInternal(start, end);
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.updateBoundsCache = function() {
  goog.base(this, 'updateBoundsCache');
  this.invalidateScaleDependend();
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.disposeInternal = function() {
  delete this.chart_;

  goog.disposeAll(this.series_);
  this.series_.length = 0;

  goog.dispose(this.seriesContainer_);
  goog.dispose(this.selectedSeriesContainer_);
  this.seriesContainer_ = null;
  this.selectedSeriesContainer_ = null;

  goog.dispose(this.xAxis_);
  this.xAxis_ = null;

  goog.dispose(this.xScale_);
  this.xScale_ = null;

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['defaultSeriesType'] = this.defaultSeriesType();

  return json;
};


/** @inheritDoc */
anychart.core.stock.Scroller.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  var i, json, scale;

  this.xAxis(config['xAxis']);
  this.defaultSeriesType(config['defaultSeriesType']);

  var scales = config['scales'];
  var scalesInstances = {};
  if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        scale = anychart.scales.ScatterBase.fromString(json, false);
      } else {
        scale = anychart.scales.ScatterBase.fromString(json['type'], false);
        scale.setup(json);
      }
      scalesInstances[i] = scale;
    }
  }

  json = config['yScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.ScatterBase.fromString(json, true);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.ScatterBase.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.yScale(scale);

  if ('defaultSeriesSettings' in config)
    this.setDefaultSeriesSettings(config['defaultSeriesSettings']);

  var series = config['series'];
  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || this.defaultSeriesType()).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }
};


//exports
anychart.core.stock.Scroller.prototype['line'] = anychart.core.stock.Scroller.prototype.line;
anychart.core.stock.Scroller.prototype['ohlc'] = anychart.core.stock.Scroller.prototype.ohlc;
anychart.core.stock.Scroller.prototype['column'] = anychart.core.stock.Scroller.prototype.column;
anychart.core.stock.Scroller.prototype['getSeries'] = anychart.core.stock.Scroller.prototype.getSeries;
anychart.core.stock.Scroller.prototype['yScale'] = anychart.core.stock.Scroller.prototype.yScale;
anychart.core.stock.Scroller.prototype['xAxis'] = anychart.core.stock.Scroller.prototype.xAxis;
anychart.core.stock.Scroller.prototype['defaultSeriesType'] = anychart.core.stock.Scroller.prototype.defaultSeriesType;
anychart.core.stock.Scroller.prototype['addSeries'] = anychart.core.stock.Scroller.prototype.addSeries;
anychart.core.stock.Scroller.prototype['getSeriesAt'] = anychart.core.stock.Scroller.prototype.getSeriesAt;
anychart.core.stock.Scroller.prototype['getSeriesCount'] = anychart.core.stock.Scroller.prototype.getSeriesCount;
anychart.core.stock.Scroller.prototype['removeSeries'] = anychart.core.stock.Scroller.prototype.removeSeries;
anychart.core.stock.Scroller.prototype['removeSeriesAt'] = anychart.core.stock.Scroller.prototype.removeSeriesAt;
anychart.core.stock.Scroller.prototype['removeAllSeries'] = anychart.core.stock.Scroller.prototype.removeAllSeries;
