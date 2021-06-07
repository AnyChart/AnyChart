goog.provide('anychart.core.ChartWithSeries');

goog.require('anychart.consistency');
goog.require('anychart.core.IChart');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.SeriesSettings');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.DataArea');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('goog.array');



/**
 * A base class for the chart with series.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.IChart}
 */
anychart.core.ChartWithSeries = function() {
  anychart.core.ChartWithSeries.base(this, 'constructor');

  /**
   * @type {!Array.<anychart.core.series.Cartesian>}
   * @protected
   */
  this.seriesList = [];

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;

  /**
   * Cache of chart data bounds.
   * @type {anychart.math.Rect}
   * @protected
   */
  this.dataBounds = null;

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['labels', 0, 0],
    ['minLabels', 0, 0],
    ['maxLabels', 0, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, /** @this {anychart.core.ChartWithSeries} */ function(factory) {
    factory.markConsistent(anychart.ConsistencyState.ALL);
    factory.listenSignals(this.labelsInvalidated, this);
  });

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['labels', 0, 0],
    ['minLabels', 0, 0],
    ['maxLabels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);

  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['labels', 0, 0],
    ['minLabels', 0, 0],
    ['maxLabels', 0, 0]
  ]);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['defaultSeriesType', 0, 0],
    ['maxBubbleSize', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.invalidateSizeBasedSeries],
    ['minBubbleSize', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.invalidateSizeBasedSeries],
    ['pointWidth', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.invalidateWidthBasedSeries],
    ['maxPointWidth', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.invalidateWidthBasedSeries],
    ['minPointLength', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.resetSeriesStack],
    ['baseline', anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW, 0, this.resetSeriesBaseLine]
  ]);
};
goog.inherits(anychart.core.ChartWithSeries, anychart.core.SeparateChart);
anychart.consistency.supportStates(anychart.core.ChartWithSeries, anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA);


//region --- Static props and methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Static props and methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_CHART_PALETTE |
    anychart.ConsistencyState.SERIES_CHART_MARKER_PALETTE |
    anychart.ConsistencyState.SERIES_CHART_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.SERIES_CHART_SERIES;


/**
 * Creates proper public constructor functions.
 * @param {!Function} chartConstructor
 * @param {!Object} configs
 */
anychart.core.ChartWithSeries.generateSeriesConstructors = function(chartConstructor, configs) {
  var prototype = chartConstructor.prototype;
  var methodsGenerator = function(name) {
    return function(data, opt_csvSettings) {
      return this.createSeriesByType(
          name,
          data,
          opt_csvSettings);
    };
  };
  for (var i in configs) {
    var methodName = anychart.utils.toCamelCase(i);
    /**
     * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
     * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
     *    here as a hash map.
     * @return {anychart.core.series.Cartesian}
     * @this {anychart.core.ChartWithSeries}
     */
    prototype[methodName] = methodsGenerator(i);
  }
};


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.core.ChartWithSeries.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.core.ChartWithSeries.ZINDEX_LINE_SERIES = 31;


//endregion
//region --- Series infrastructure methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Series infrastructure methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series config for the chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.core.ChartWithSeries.prototype.seriesConfig = (function() { return {}; })();


/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {anychart.core.SeriesSettings|anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.defaultSeriesSettings = function(opt_value) {
  if (!this.defaultSeriesSettings_) {
    this.defaultSeriesSettings_ = new anychart.core.SeriesSettings();
    this.setupCreated('defaultSeriesSettings', this.defaultSeriesSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_.themeSettings = opt_value;
    return this;
  }

  return this.defaultSeriesSettings_;
};


/**
 * Normalizes series type.
 * @param {*} type
 * @return {string}
 */
anychart.core.ChartWithSeries.prototype.normalizeSeriesType = function(type) {
  return String(type);
};


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ChartWithSeries.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  /**
   * @this {anychart.core.ChartWithSeries}
   * @param {*=} opt_value
   * @return {string}
   */
  function seriesTypeNormalizer(opt_value) {
    return this.normalizeSeriesType(opt_value);
  }
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'defaultSeriesType', seriesTypeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxBubbleSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minBubbleSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'pointWidth', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxPointWidth', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minPointLength', anychart.utils.normalizeNumberOrPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'baseline', anychart.core.settings.numberNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.ChartWithSeries, anychart.core.ChartWithSeries.PROPERTY_DESCRIPTORS);


/**
 * Returns normalized series type and a config for this series type.
 * @param {string} type
 * @return {?Array.<string|anychart.core.series.TypeConfig>}
 */
anychart.core.ChartWithSeries.prototype.getConfigByType = function(type) {
  type = this.normalizeSeriesType(type);
  var config = this.seriesConfig[type];
  var res;
  if (config && (config.drawerType in anychart.core.drawers.AvailableDrawers)) {
    res = [type, config];
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    res = null;
  }
  return res;
};


/**
 * Actual series constructor.
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @return {!anychart.core.series.Cartesian}
 */
anychart.core.ChartWithSeries.prototype.createSeriesInstance = goog.abstractMethod;


/**
 * Returns base series z-index.
 * @param {anychart.core.series.Base} series .
 * @return {number}
 */
anychart.core.ChartWithSeries.prototype.getBaseSeriesZIndex = function(series) {
  return series.isLineBased() ?
      anychart.core.ChartWithSeries.ZINDEX_LINE_SERIES :
      anychart.core.ChartWithSeries.ZINDEX_SERIES;
};


/**
 * Setup series.
 * @param {!(anychart.core.series.Cartesian|anychart.mapModule.Series)} series .
 */
anychart.core.ChartWithSeries.prototype.setupSeries = function(series) {
  var lastSeries = this.seriesList[this.seriesList.length - 1];
  var index = lastSeries ? /** @type {number} */(lastSeries.autoIndex()) + 1 : 0;
  this.seriesList.push(series);

  series.autoIndex(index);
  series.setupAutoZIndex();
  series.setAutoColor(this.palette().itemAt(index));
  series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
  series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
  series.setParentEventTarget(this);
  series.listenSignals(this.seriesInvalidated, this);
};


/**
 * @param {string} type Series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @protected
 * @return {anychart.core.series.Cartesian}
 */
anychart.core.ChartWithSeries.prototype.createSeriesByType = function(type, data, opt_csvSettings) {
  var configAndType = this.getConfigByType(type);
  if (configAndType) {
    type = /** @type {string} */(configAndType[0]);
    var config = /** @type {anychart.core.series.TypeConfig} */(configAndType[1]);
    var series = this.createSeriesInstance(type, config);
    series.data(data, opt_csvSettings);

    this.setupSeries(series);

    this.invalidate(
        // When you add 3D series, bounds may change (eg. afterDraw case).
        (series.check(anychart.core.drawers.Capabilities.IS_3D_BASED) ? anychart.ConsistencyState.BOUNDS : 0) |
        anychart.ConsistencyState.SERIES_CHART_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
        anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    series = null;
  }

  return series;
};


/**
 * Add series to chart.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Chart series data.
 * @return {Array.<anychart.core.series.Cartesian>} Array of created series.
 */
anychart.core.ChartWithSeries.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.getOption('defaultSeriesType'));
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType(type, null));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType(type, arguments[i]));
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
anychart.core.ChartWithSeries.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.seriesList, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.series.Cartesian} Series instance.
 */
anychart.core.ChartWithSeries.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.series.Cartesian} Series instance.
 */
anychart.core.ChartWithSeries.prototype.getSeriesAt = function(index) {
  return this.seriesList[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.core.ChartWithSeries.prototype.getSeriesCount = function() {
  return this.seriesList.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.removeSeriesAt = function(index) {
  var series = this.seriesList[index];
  if (series) {
    anychart.globalLock.lock();
    this.suspendSignalsDispatching();
    goog.array.splice(this.seriesList, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.SERIES_CHART_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
        anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW);
    this.resumeSignalsDispatching(true);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.core.ChartWithSeries} Self for method chaining.
 */
anychart.core.ChartWithSeries.prototype.removeAllSeries = function() {
  if (this.seriesList.length) {
    anychart.globalLock.lock();
    this.suspendSignalsDispatching();
    var series = this.seriesList;
    this.seriesList = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.SERIES_CHART_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS |
        anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW);
    this.resumeSignalsDispatching(true);
    // When we deleting ALL series, we should clear this statuses, cause they are loss the actuality
    // Also we should unlisten tooltip update, cause after removing series it can be fired on disposed series
    // See DVF-3020
    this.prevHoverSeriesStatus = null;
    this.prevSelectSeriesStatus = null;
    this.unlisten(goog.events.EventType.MOUSEMOVE, this.updateTooltip);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.ChartWithSeries.prototype.seriesInvalidated = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.CHART_LABELS;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SERIES_CHART_SERIES;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.CHART_LABELS;
    if (/** @type {anychart.enums.LegendItemsSourceMode} */(this.legend().getOption('itemsSourceMode')) == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
      // CHART_LABELS invalidation for no data label.
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
    this.invalidateAnnotations();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.SCALE_CHART_SCALES |
        anychart.ConsistencyState.SCALE_CHART_Y_SCALES |
        anychart.ConsistencyState.SCALE_CHART_SCALE_MAPS;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
      state |= anychart.ConsistencyState.BOUNDS;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @inheritDoc
 */
anychart.core.ChartWithSeries.prototype.getAllSeries = function() {
  return this.seriesList;
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @protected
 */
anychart.core.ChartWithSeries.prototype.invalidateWidthBasedSeries = function() {
  for (var i = this.seriesList.length; i--;) {
    if (this.seriesList[i].isWidthBased())
      this.seriesList[i].invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/**
 * Invalidates APPEARANCE for all size-based series.
 * @protected
 */
anychart.core.ChartWithSeries.prototype.invalidateSizeBasedSeries = function() {
  for (var i = this.seriesList.length; i--;) {
    if (this.seriesList[i].isSizeBased())
      this.seriesList[i].invalidate(anychart.ConsistencyState.SERIES_POINTS | anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Returns if the chart is vertical.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.ChartWithSeries)}
 */
anychart.core.ChartWithSeries.prototype.isVertical = function(opt_value) {
  return goog.isDef(opt_value) ? this : false;
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.xScale = function() {};


/**
 * Calculate for 3d.
 * @protected
 */
anychart.core.ChartWithSeries.prototype.prepare3d = function() {};


/**
 * Spread Column and Bar series to categories width
 */
anychart.core.ChartWithSeries.prototype.distributeSeries = function() {};


/**
 * If the legend categories mode should be considered by the scale.
 * @return {boolean}
 */
anychart.core.ChartWithSeries.prototype.allowLegendCategoriesMode = function() {
  return true;
};


//endregion
//region --- Series specific settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Resets series shared stack.
 * @param {boolean=} opt_skipInvalidation - Whether to skip width based series invalidation.
 */
anychart.core.ChartWithSeries.prototype.resetSeriesBaseLine = function(opt_skipInvalidation) {
  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    if (series)
      series.resetSharedStack();
    if (!opt_skipInvalidation)
      series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/**
 * Resets series shared stack.
 * @param {boolean=} opt_skipInvalidation - Whether to skip width based series invalidation.
 */
anychart.core.ChartWithSeries.prototype.resetSeriesStack = function(opt_skipInvalidation) {
  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    if (series)
      series.resetSharedStack();
  }
  if (!opt_skipInvalidation)
    this.invalidateWidthBasedSeries();
};


//endregion
//region --- Series interaction
/**
 * Invalidates SERIES_LABEL for all series that support labels.
 */
anychart.core.ChartWithSeries.prototype.invalidateSeriesLabels = function() {
  for (var i = this.seriesList.length; i--;) {
    var series = this.seriesList[i];
    if (series.check(anychart.core.series.Capabilities.SUPPORTS_LABELS)) {
      series.invalidate(anychart.ConsistencyState.SERIES_LABELS);
    }
  }
};


//endregion
//region --- Palettes
//----------------------------------------------------------------------------------------------------------------------
//
//  Palettes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.ChartWithSeries)} .
 */
anychart.core.ChartWithSeries.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.core.ChartWithSeries)} Return current chart markers palette or itself for chaining call.
 */
anychart.core.ChartWithSeries.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.setupCreated('markerPalette', this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.core.ChartWithSeries)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.core.ChartWithSeries.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
    this.setupCreated('hatchFillPalette', this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.core.ChartWithSeries.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.SERIES_CHART_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ChartWithSeries.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ChartWithSeries.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ChartWithSeries.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Labels
//----------------------------------------------------------------------------------------------------------------------
//
//  Labels
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ChartWithSeries} .
 */
anychart.core.ChartWithSeries.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.labels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.LabelsFactory} */ (this.normal_.labels());
};


/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ChartWithSeries} .
 */
anychart.core.ChartWithSeries.prototype.minLabels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.minLabels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.LabelsFactory} */ (this.normal_.minLabels());
};


/**
 * Getter/setter for labels.
 * @param {(Object|boolean|null)=} opt_value .
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ChartWithSeries} .
 */
anychart.core.ChartWithSeries.prototype.maxLabels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.maxLabels(opt_value);
    return this;
  }
  return /** @type {anychart.core.ui.LabelsFactory} */ (this.normal_.maxLabels());
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.core.ChartWithSeries.prototype.labelsInvalidated = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.normal().labels().markConsistent(anychart.ConsistencyState.ALL);
    this.normal().minLabels().markConsistent(anychart.ConsistencyState.ALL);
    this.normal().maxLabels().markConsistent(anychart.ConsistencyState.ALL);
    this.invalidateSeriesLabels();
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Calculations
//----------------------------------------------------------------------------------------------------------------------
//
//  Calculations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculates bubble sizes for series.
 * @protected
 */
anychart.core.ChartWithSeries.prototype.calcBubbleSizes = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.seriesList.length; i--;) {
    if (this.seriesList[i].isSizeBased())
      this.seriesList[i].calculateSizeScale(minMax);
  }
  for (i = this.seriesList.length; i--;) {
    if (this.seriesList[i].isSizeBased()) {
      this.seriesList[i].setAutoSizeScale(minMax[0], minMax[1], /** @type {number|string} */(this.getOption('minBubbleSize')), /** @type {number|string} */(this.getOption('maxBubbleSize')));
    }
  }
};


//endregion
//region --- Data
//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/** @type {Object.<string, Array.<string>>} */
anychart.core.ChartWithSeries.seriesReferenceValues = {
  'bar': ['value'],
  'line': ['value'],
  'polyline': ['value'],
  'area': ['value'],
  'polygon': ['value'],
  'column': ['value'],
  'spline': ['value'],
  'marker': ['value'],
  'step-area': ['value'],
  'step-line:': ['value'],
  'spline-area': ['value'],
  'jump-line': ['value'],
  'stick': ['value'],
  'mekko': ['value'],
  'bubble': ['value', 'size'],
  'range-bar': ['high', 'low'],
  'range-area': ['high', 'low'],
  'range-column': ['high', 'low'],
  'range-step-area': ['high', 'low'],
  'range-spline-area': ['high', 'low'],
  'ohlc': ['open', 'high', 'low', 'close'],
  'candlestick': ['open', 'high', 'low', 'close'],
  'box': ['lowest', 'q1', 'median', 'q3', 'highest'],
  'connector': ['points'],
  'choropleth': ['id', 'value'],
  'marker-map': ['id', 'long', 'lat'],
  'bubble-map': ['id', 'long', 'lat', 'size'],
  'hilo': ['high', 'low'],
  'waterfall': ['value'],
  'moment': ['value'],
  'range': ['start', 'end']
};


/**
 * @param {(anychart.data.Set|anychart.data.DataSettings|Array)=} opt_value
 * @return {anychart.data.View|anychart.core.ChartWithSeries}
 */
anychart.core.ChartWithSeries.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {

    // handle HTML table data
    var seriesNames = null;
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['header'] && opt_value['header'].length) seriesNames = opt_value['header'];
      if (opt_value['rows']) this.rawData_ = opt_value['rows'];
      else this.rawData_ = opt_value;
    } else this.rawData_ = opt_value;

    /** @type {anychart.data.Set} */
    var dataSet;
    if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
      dataSet = /** @type {anychart.data.Set} */(opt_value);
    else {
      dataSet = anychart.data.set(this.rawData_);
      // we creating anonymous dataSet to create mapping for series.
      // We shouldn't forget to dispose it on chart's disposing.
      this.registerDisposable(dataSet);
    }

    // define cols count
    var firstRow = dataSet.row(0);
    var colsCount = 1;
    var keys = null;

    if (goog.isArray(firstRow)) {
      colsCount = firstRow.length;
    } else if (goog.isObject(firstRow)) {
      keys = goog.object.getKeys(firstRow);
      colsCount = keys.length;
    }

    var seriesCount = this.getSeriesCount();
    var usedColsCount = 1; // we assume that first col is always X
    var seriesIndex = 0;
    var series, names, allocCount, mapping;

    this.suspendSignalsDispatching();

    for (var i = 0; i < seriesCount; i++) {
      series = this.getSeriesAt(seriesIndex);
      names = series.getYValueNames();
      allocCount = usedColsCount + names.length;

      if (allocCount <= colsCount) {
        mapping = anychart.data.buildMapping(dataSet, usedColsCount, allocCount, names, keys);
        series.data(mapping);
        if (seriesNames) series.name(seriesNames[seriesIndex + 1]);
        usedColsCount = allocCount;
      } else {
        var seriesId = /** @type {string} */(series.id());
        this.removeSeries(seriesId);
        seriesIndex--;
      }
      seriesIndex++;
    }

    var type = /** @type {string} */(this.getOption('defaultSeriesType'));
    names = anychart.core.ChartWithSeries.seriesReferenceValues[type];

    do {
      allocCount = usedColsCount + names.length;

      if (allocCount <= colsCount) {
        mapping = anychart.data.buildMapping(dataSet, usedColsCount, allocCount, names, keys);
        series = this.addSeries(mapping)[0];
        if (seriesNames) series.name(seriesNames[seriesIndex + 1]);
        seriesIndex++;
        usedColsCount = allocCount;
      } else {
        break;
      }
    } while (usedColsCount <= colsCount);

    this.invalidate(anychart.ConsistencyState.CHART_LABELS);
    this.resumeSignalsDispatching(true);
    return this;
  } else {
    return this.rawData_;
  }
};


//endregion
//region --- Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Invalidates annotations if they exist.
 */
anychart.core.ChartWithSeries.prototype.invalidateAnnotations = function() {};


/**
 * @inheritDoc
 */
anychart.core.ChartWithSeries.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  if (anychart.utils.instanceOf(this.palette_, anychart.palettes.RangeColors))
    this.palette_.setAutoCount(this.getAllSeries().length);

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_PALETTE |
          anychart.ConsistencyState.SERIES_CHART_MARKER_PALETTE |
          anychart.ConsistencyState.SERIES_CHART_HATCH_FILL_PALETTE)) {
    anychart.core.Base.suspendSignalsDispatching(this.seriesList);

    var state = 0;
    if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_PALETTE | anychart.ConsistencyState.SERIES_CHART_HATCH_FILL_PALETTE)) {
      state |= anychart.ConsistencyState.SERIES_COLOR;
    }
    if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_MARKER_PALETTE)) {
      state |= anychart.ConsistencyState.SERIES_MARKERS;
    }

    for (var i = this.seriesList.length; i--;) {
      var series = this.seriesList[i];
      var index = /** @type {number} */(series.autoIndex());
      series.setAutoColor(this.palette().itemAt(index));
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
      series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
      series.invalidate(state);
    }
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES);
    this.markConsistent(anychart.ConsistencyState.SERIES_CHART_PALETTE |
        anychart.ConsistencyState.SERIES_CHART_MARKER_PALETTE |
        anychart.ConsistencyState.SERIES_CHART_HATCH_FILL_PALETTE);
    anychart.core.Base.resumeSignalsDispatchingFalse(this.seriesList);
  }
};


/**
 * Setups series before series drawing.
 * @param {anychart.core.series.Base} series
 * @param {number=} opt_topAxisPadding
 * @param {number=} opt_rightAxisPadding
 * @param {number=} opt_bottomAxisPadding
 * @param {number=} opt_leftAxisPadding
 */
anychart.core.ChartWithSeries.prototype.setupSeriesBeforeDraw = function(series, opt_topAxisPadding, opt_rightAxisPadding, opt_bottomAxisPadding, opt_leftAxisPadding) {
  series.axesLinesSpace(
      opt_topAxisPadding || 0,
      opt_rightAxisPadding || 0,
      opt_bottomAxisPadding || 0,
      opt_leftAxisPadding || 0);
};


/**
 * A hook before series drawing cycle.
 */
anychart.core.ChartWithSeries.prototype.beforeSeriesDraw = function() {
  this.prepare3d();
  this.distributeSeries();
  this.calcBubbleSizes();
};


/**
 * A hook right after series were drawn.
 */
anychart.core.ChartWithSeries.prototype.afterSeriesDraw = function() {
};


/**
 * Draws series.
 * @param {number=} opt_topAxisPadding
 * @param {number=} opt_rightAxisPadding
 * @param {number=} opt_bottomAxisPadding
 * @param {number=} opt_leftAxisPadding
 */
anychart.core.ChartWithSeries.prototype.drawSeries = function(opt_topAxisPadding, opt_rightAxisPadding, opt_bottomAxisPadding, opt_leftAxisPadding) {
  anychart.performance.start('Series drawing');
  var i, count;
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES)) {
    anychart.core.Base.suspendSignalsDispatching(this.seriesList);
    for (i = 0, count = this.seriesList.length; i < count; i++) {
      var series = this.seriesList[i];
      series.container(this.rootElement);
      series.parentBounds(this.dataBounds);
      this.setupSeriesBeforeDraw(series, opt_topAxisPadding, opt_rightAxisPadding, opt_bottomAxisPadding, opt_leftAxisPadding);
    }

    this.beforeSeriesDraw();
    this.drawSeriesInOrder();
    this.afterSeriesDraw();
    this.resetSeriesStack(true);

    this.markConsistent(anychart.ConsistencyState.SERIES_CHART_SERIES);
    anychart.core.Base.resumeSignalsDispatchingFalse(this.seriesList);
  }
  anychart.performance.end('Series drawing');
};


/**
 * Draws series in correct order.
 * @protected
 */
anychart.core.ChartWithSeries.prototype.drawSeriesInOrder = function() {
  for (var i = 0; i < this.seriesList.length; i++) {
    this.seriesList[i].draw();
  }
};


/**
 * Getter/setter for Data area.
 * @param {(Object|boolean)=} opt_value
 * @return {anychart.core.ChartWithSeries|anychart.core.ui.DataArea}
 */
anychart.core.ChartWithSeries.prototype.dataArea = function(opt_value) {
  if (!this.dataArea_) {
    this.dataArea_ = new anychart.core.ui.DataArea();
    this.dataArea_.listenSignals(this.dataAreaInvalidated_, this);

    this.setupCreated('dataArea', this.dataArea_);
  }
  if (goog.isDef(opt_value)) {
    this.dataArea_.setup(opt_value);
    return this;
  }
  return this.dataArea_;
};


/**
 * Data area invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.ChartWithSeries.prototype.dataAreaInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidateState(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.specialDraw = function(bounds) {
  anychart.core.ChartWithSeries.base(this, 'specialDraw', bounds);
  if (this.hasStateInvalidation(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA)) {
    var dataArea = this.getCreated('dataArea');
    if (dataArea) {
      dataArea.suspendSignalsDispatching();
      if (!dataArea.container()) dataArea.container(this.rootElement);
      dataArea.parentBounds(bounds);
      dataArea.resumeSignalsDispatching(false);
      dataArea.draw();
    }
    this.markStateConsistent(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA);
  }
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.resizeHandler = function(e) {
  this.suspendSignalsDispatching();
  anychart.core.ChartWithSeries.base(this, 'resizeHandler', e);
  this.invalidateState(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  this.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.onLegendSignal = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.invalidateState(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA);
  }
  anychart.core.ChartWithSeries.base(this, 'onLegendSignal', e);
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.onTitleSignal = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    this.invalidateState(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA);
  }
  anychart.core.ChartWithSeries.base(this, 'onTitleSignal', e);
};


//endregion
//region --- Legend
//----------------------------------------------------------------------------------------------------------------------
//
//  Legend
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.createLegendItemsProvider = function(sourceMode, itemsFormat) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.calculate();
  if (this.allowLegendCategoriesMode() &&
      sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES &&
      (anychart.utils.instanceOf(this.xScale(), anychart.scales.Ordinal))) {
    var names = this.xScale().names();

    if (goog.isFunction(itemsFormat)) {
      var values = this.xScale().values();
      var itemText;
      var format;
      for (i = 0, count = values.length; i < count; i++) {
        format = {
          'value': values[i],
          'name': names[i]
        };
        itemText = itemsFormat.call(format, format);
        if (!goog.isString(itemText))
          itemText = String(names[i]);
        data.push({
          'text': itemText,
          'iconEnabled': false,
          'sourceUid': goog.getUid(this),
          'sourceKey': i
        });
      }
    } else {
      for (i = 0, count = names.length; i < count; i++) {
        data.push({
          'text': String(names[i]),
          'iconEnabled': false,
          'sourceUid': goog.getUid(this),
          'sourceKey': i
        });
      }
    }
  } else {
    for (i = 0, count = this.seriesList.length; i < count; i++) {
      /** @type {anychart.core.series.Cartesian} */
      var series = this.seriesList[i];
      var itemData = series.getLegendItemData(itemsFormat);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.id();
      data.push(itemData);
    }
  }
  return data;
};


//endregion
//region --- No Data
/**
 * Whether series enabled.
 * @param {anychart.core.series.Cartesian} series
 * @return {boolean}
 */
anychart.core.ChartWithSeries.prototype.isSeriesVisible = function(series) {
  var enabled = /** @type {boolean} */(series.enabled());
  var excluded = series.getExcludedIndexesInternal();
  var visible = true;
  var rowsCount = series.data() ? series.data().getRowsCount() : 0;
  if (!rowsCount || (rowsCount == excluded.length))
    visible = false;
  return (enabled && visible);
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.isNoData = function() {
  var countDisabled = 0;
  var len = this.seriesList.length;
  for (var i = 0; i < len; i++) {
    if (!this.isSeriesVisible(this.seriesList[i]))
      countDisabled++;
    else
      break;
  }
  return (countDisabled == len);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.ChartWithSeries.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ChartWithSeries.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.ChartWithSeries.PROPERTY_DESCRIPTORS, config, opt_default);

  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  if (config['dataArea']) {
    this.dataArea().setupInternal(!!opt_default, config['dataArea']);
  }
  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.setupStateSettings = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.normal_.setupInternal(true, {});

  this.setupCreated('hovered', this.hovered_);
  this.hovered_.setupInternal(true, {});

  this.setupCreated('selected', this.selected_);
  this.selected_.setupInternal(true, {});
};


/**
 * @inheritDoc
 */
anychart.core.ChartWithSeries.prototype.serialize = function() {
  var json = anychart.core.ChartWithSeries.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.ChartWithSeries.PROPERTY_DESCRIPTORS, json);
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  if (this.dataArea_)
    json['dataArea'] = this.dataArea().serialize();
  json['normal'] = this.normal().serialize();
  json['hovered'] = this.hovered().serialize();
  json['selected'] = this.selected().serialize();

  return json;
};


/** @inheritDoc */
anychart.core.ChartWithSeries.prototype.disposeInternal = function() {
  this.suspendSignalsDispatching();
  this.removeAllSeries();
  this.resumeSignalsDispatching(false);

  goog.disposeAll(
      this.palette_,
      this.markerPalette_,
      this.hatchFillPalette_,
      this.dataArea_,
      this.defaultSeriesSettings_,
      this.normal_,
      this.hovered_,
      this.selected_);

  this.palette_ = null;
  this.markerPalette_ = null;
  this.hatchFillPalette_ = null;
  this.dataArea_ = null;
  this.defaultSeriesSettings_ = null;
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;

  anychart.core.ChartWithSeries.base(this, 'disposeInternal');
};


//endregion

//exports
(function() {
  var proto = anychart.core.ChartWithSeries.prototype;
  // auto generated
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['labels'] = proto.labels;
  proto['minLabels'] = proto.minLabels;
  proto['maxLabels'] = proto.maxLabels;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
  proto['isVertical'] = proto.isVertical;
  proto['dataArea'] = proto.dataArea;
})();


