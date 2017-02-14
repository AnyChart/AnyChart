goog.provide('anychart.charts.Radar');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.Radar');
goog.require('anychart.core.axes.Radial');
goog.require('anychart.core.grids.Radar');
goog.require('anychart.core.radar.series.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.OrdinalIterator');
goog.require('anychart.enums');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Radar chart class.<br/>
 * To get the chart use method {@link anychart.radar}.<br/>
 * Chart can contain any number of series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Radar = function() {
  anychart.charts.Radar.base(this, 'constructor');

  /**
   * Start angle for the first slice of a pie chart.
   * @type {(string|number)}
   * @private
   */
  this.startAngle_;

  /**
   * @type {anychart.scales.Ordinal}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * @type {!Array.<anychart.core.radar.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * @type {Array.<anychart.core.grids.Radar>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Radar>}
   * @private
   */
  this.minorGrids_ = [];

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
   * @private
   */
  this.dataBounds_ = null;

  this.defaultSeriesType(anychart.enums.RadarSeriesType.LINE);
};
goog.inherits(anychart.charts.Radar, anychart.core.SeparateChart);


/**
 * Getter/setter for radar defaultSeriesType.
 * @param {(string|anychart.enums.RadarSeriesType)=} opt_value Default series type.
 * @return {anychart.charts.Radar|anychart.enums.RadarSeriesType} Default series type or self for chaining.
 */
anychart.charts.Radar.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeRadarSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/** @inheritDoc */
anychart.charts.Radar.prototype.getType = function() {
  return anychart.enums.ChartTypes.RADAR;
};


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.charts.Radar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.RADAR_PALETTE |
    anychart.ConsistencyState.RADAR_MARKER_PALETTE |
    anychart.ConsistencyState.RADAR_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.RADAR_SCALES |
    anychart.ConsistencyState.RADAR_SERIES |
    anychart.ConsistencyState.RADAR_AXES |
    anychart.ConsistencyState.RADAR_GRIDS;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Radar.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.charts.Radar.ZINDEX_LINE_SERIES = 31;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Radar.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Radar.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Radar.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.charts.Radar.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Getter/setter for grid default settings.
 * @param {Object=} opt_value Object with grid settings.
 * @return {Object}
 */
anychart.charts.Radar.prototype.defaultGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultGridSettings_ = opt_value;
    return this;
  }
  return this.defaultGridSettings_ || {};
};


/**
 * Getter/setter for minor grid default settings.
 * @param {Object=} opt_value Object with minor grid settings.
 * @return {Object}
 */
anychart.charts.Radar.prototype.defaultMinorGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scale map properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {!Object.<!Array.<anychart.core.radar.series.Base>>}
 * @private
 */
anychart.charts.Radar.prototype.seriesOfStackedScaleMap_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.charts.Radar.prototype.yScales_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.charts.Radar.prototype.xScales_;


/**
 * @type {!Object.<!Array.<anychart.core.radar.series.Base>>}
 * @private
 */
anychart.charts.Radar.prototype.seriesOfXScaleMap_;


/**
 * @type {!Object.<!Array.<anychart.core.radar.series.Base>>}
 * @private
 */
anychart.charts.Radar.prototype.seriesOfYScaleMap_;


/**
 * Set chart start angle.
 * @example
 * var chart = anychart.radar([1, 1.2, 1.4, 1.6, 1.2]);
 * chart.startAngle(45);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.charts.Radar)} .
 */
anychart.charts.Radar.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {anychart.scales.Ordinal=} opt_value X Scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.charts.Radar)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Radar.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_ && (this.xScale_ instanceof anychart.scales.Ordinal))
        this.xScale_.unlistenSignals(this.xScaleInvalidated_, this);
      this.xScale_ = opt_value;
      if (this.xScale_ instanceof anychart.scales.Ordinal)
        this.xScale_.listenSignals(this.xScaleInvalidated_, this);
      var state = 0;
      if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
        state = anychart.ConsistencyState.CHART_LEGEND;
      }
      this.invalidate(anychart.ConsistencyState.RADAR_SCALES | state, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Ordinal();
      this.xScale_.listenSignals(this.xScaleInvalidated_, this);
    }
    return this.xScale_;
  }
};


/**
 * Chart xScale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.charts.Radar.prototype.xScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.scales.Base|anychart.enums.ScaleTypes)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Radar)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Radar.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (opt_value instanceof anychart.scales.Base && this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.RADAR_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.yScale_) {
      this.yScale_ = new anychart.scales.Linear();
    }
    return this.yScale_;
  }
};


/**
 * Sets default scale for layout based element depending on barChartMode.
 * @param {anychart.core.grids.Radar} item Item to set scale.
 * @private
 */
anychart.charts.Radar.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (!!(item.isRadial())) {
    item.xScale(/** @type {anychart.scales.Ordinal} */(this.xScale()));
  } else {
    item.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
    item.xScale(/** @type {anychart.scales.Ordinal} */(this.xScale()));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Grids.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Radar|anychart.charts.Radar)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Radar.prototype.grid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Radar();
    grid.setChart(this);
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.RADIAL);
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.RADAR_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for minorGrid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Radar|anychart.charts.Radar)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Radar.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Radar();
    grid.setChart(this);
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.CIRCUIT);
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.RADAR_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Listener for grids invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Radar.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RADAR_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Radar|anychart.charts.Radar)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Radar.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.core.axes.Radar();
    this.xAxis_.setParentEventTarget(this);
    this.registerDisposable(this.xAxis_);
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.RADAR_AXES | anychart.ConsistencyState.BOUNDS);
  }

  if (goog.isDef(opt_value)) {
    this.xAxis_.setup(opt_value);
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 * Getter/setter for yAxis.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Radial|anychart.charts.Radar)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Radar.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.core.axes.Radial();
    this.yAxis_.setParentEventTarget(this);
    this.registerDisposable(this.yAxis_);
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.RADAR_AXES | anychart.ConsistencyState.BOUNDS);
  }

  if (goog.isDef(opt_value)) {
    this.yAxis_.setup(opt_value);
    return this;
  } else {
    return this.yAxis_;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Radar.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.RADAR_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis by index. 0 is x-axes 1 is y-axes, another numbers return undefined.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.Radar|anychart.core.axes.Radial|undefined}
 */
anychart.charts.Radar.prototype.getAxisByIndex = function(index) {
  switch (index) {
    case 0:
      return this.xAxis_;
    case 1:
      return this.yAxis_;
    default:
      return void 0;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series constructors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds Area series.
 * @example
 * var chart = anychart.radar();
 * chart.area([10, 4, 17, 20, 12]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.radar.series.Base} {@link anychart.core.radar.series.Area} instance for method chaining.
 */
anychart.charts.Radar.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.RadarSeriesType.AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @example
 * var chart = anychart.radar();
 * chart.line([10, 4, 17, 20, 12]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.radar.series.Base} {@link anychart.core.radar.series.Line} instance for method chaining.
 */
anychart.charts.Radar.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.RadarSeriesType.LINE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Marker series.
 * @example
 * var chart = anychart.radar();
 * chart.marker([10, 4, 17, 20, 12]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.radar.series.Base} {@link anychart.core.radar.series.Marker} instance for method chaining.
 */
anychart.charts.Radar.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.RadarSeriesType.MARKER,
      data,
      opt_csvSettings
  );
};


/**
 * @param {string} type Series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @private
 * @return {anychart.core.radar.series.Base}
 */
anychart.charts.Radar.prototype.createSeriesByType_ = function(type, data, opt_csvSettings) {
  type = anychart.enums.normalizeRadarSeriesType(type);
  var ctl = anychart.core.radar.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    instance.setChart(this);
    instance.setParentEventTarget(this);
    this.registerDisposable(instance);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);
    var inc = index * anychart.charts.Radar.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);
    var seriesZIndex = ((type == anychart.enums.RadarSeriesType.LINE) ?
            anychart.charts.Radar.ZINDEX_LINE_SERIES :
            anychart.charts.Radar.ZINDEX_SERIES) + inc;
    instance.setAutoZIndex(seriesZIndex);
    instance.labels().setAutoZIndex(seriesZIndex + anychart.charts.Radar.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.setAutoColor(this.palette().itemAt(index));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    var markerType = /** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index));
    instance.setAutoMarkerType(markerType);
    if (instance.supportsMarkers()) {
      instance.markers().setAutoZIndex(seriesZIndex + anychart.charts.Radar.ZINDEX_INCREMENT_MULTIPLIER / 2);
      instance.markers().setAutoType(markerType);
      instance.markers().setAutoFill(instance.getMarkerFill());
      instance.markers().setAutoStroke(instance.getMarkerStroke());
    } else {
      // this else would be only if instance is Marker series
      instance.type(markerType);
    }
    if (anychart.DEFAULT_THEME != 'v6')
      instance.labels().setAutoColor(anychart.color.darken(instance.color()));
    instance.setup(this.defaultSeriesSettings()[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(
        anychart.ConsistencyState.RADAR_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.RADAR_SCALES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Add series to chart.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Chart series data.
 * @return {Array.<anychart.core.radar.series.Base>} Array of created series.
 */
anychart.charts.Radar.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType_(type, null));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType_(type, arguments[i]));
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
anychart.charts.Radar.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.radar.series.Base} Series instance.
 */
anychart.charts.Radar.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.radar.series.Base} Series instance.
 */
anychart.charts.Radar.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.charts.Radar.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.charts.Radar}
 */
anychart.charts.Radar.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.charts.Radar}
 */
anychart.charts.Radar.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.RADAR_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.RADAR_SCALES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.charts.Radar} Self for method chaining.
 */
anychart.charts.Radar.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.RADAR_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.RADAR_SCALES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Radar.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Radar.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.RADAR_SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.RADAR_SERIES;
    this.invalidateSeries_();
    if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.RADAR_SCALES;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
      state |= anychart.ConsistencyState.BOUNDS;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.Radar.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {number} */
  var j;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.core.radar.series.Base>} */
  var series;
  /** @type {anychart.core.radar.series.Base} */
  var aSeries;
  /** @type {!Array.<*>|boolean} */
  var categories;
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {anychart.scales.Base} */
  var xScale;
  /** @type {number} */
  var id;
  /** @type {number} */
  var xId;
  /** @type {Array.<anychart.scales.Base>} */
  var yScalesToCalc;
  /** @type {Object.<!Array.<anychart.core.radar.series.Base>>} */
  var xScales;
  /** @type {anychart.core.utils.ScatterIterator} */
  var syncIterator;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_SCALES)) {
    anychart.core.Base.suspendSignalsDispatching(this.series_);

    this.makeScaleMaps_();

    yScalesToCalc = [];

    // parsing y scales map and getting lists of scales that need to be calculated and resetting them.
    for (id in this.yScales_) {
      scale = this.yScales_[id];
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc(); // starting autocalc for stacked scales too.
        if (scale.stackMode() != anychart.enums.ScaleStackMode.VALUE)
          yScalesToCalc.push(scale);
      }
    }
    // parsing x scales map and calculating them if needed as they cannot be stacked.
    for (id in this.xScales_) {
      scale = this.xScales_[id];
      series = this.seriesOfXScaleMap_[goog.getUid(scale)];
      for (i = 0; i < series.length; i++) {
        if (series[i].enabled())
          series[i].resetCategorisation();
      }
      // we can crash or warn user here if the scale is stacked, if we want.
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        for (i = 0; i < series.length; i++) {
          aSeries = series[i];
          if (!aSeries.enabled()) continue;
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            value = iterator.get('x');
            if (goog.isDef(value))
              scale.extendDataRange(value);
          }
        }
      }
      // categorise series data if needed.
      categories = scale.getCategorisation();
      for (i = 0; i < series.length; i++) {
        if (series[i].enabled())
          series[i].categoriseData(categories);
      }
    }

    // calculate non-stacked y scales.
    for (i = 0; i < yScalesToCalc.length; i++) {
      scale = yScalesToCalc[i];
      series = this.seriesOfYScaleMap_[goog.getUid(scale)];
      if (scale.stackMode() == anychart.enums.ScaleStackMode.PERCENT) {
        var hasPositive = false;
        var hasNegative = false;
        for (j = 0; j < series.length; j++) {
          aSeries = series[j];
          if (aSeries.enabled() && aSeries.supportsStack()) {
            iterator = aSeries.getResetIterator();
            while (iterator.advance()) {
              value = aSeries.getReferenceScaleValues();
              if (goog.isDef(value)) {
                if ((/** @type {number} */(value)) > 0)
                  hasPositive = true;
                else if ((/** @type {number} */(value)) < 0)
                  hasNegative = true;
              }
            }
          }
        }
        scale.extendDataRange(0);
        if (hasPositive || (!hasPositive && !hasNegative))
          scale.extendDataRange(100);
        if (hasNegative)
          scale.extendDataRange(-100);
      } else {
        for (j = 0; j < series.length; j++) {
          aSeries = series[j];
          if (!aSeries.enabled()) continue;
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            value = aSeries.getReferenceScaleValues();
            if (goog.isDef(value))
              scale.extendDataRange(value);
          }
        }
      }
    }

    // calculate stacked y scales.
    for (id in this.seriesOfStackedScaleMap_) {
      series = this.seriesOfStackedScaleMap_[id];
      scale = this.yScales_[id];
      xScales = {};
      for (i = 0; i < series.length; i++) {
        if (!series[i].enabled()) continue;
        xId = goog.getUid(series[i].xScale());
        if (xId in xScales)
          xScales[xId].push(series[i]);
        else
          xScales[xId] = [series[i]];
      }
      for (xId in xScales) {
        xScale = this.xScales_[xId];
        var cats = xScale.getCategorisation();
        var pointCallback = goog.bind(
            function(series) {
              var value = series.getReferenceScaleValues();
              if (goog.isDef(value)) {
                if (series.supportsStack())
                  this.extendDataRange(this.applyStacking(value));
                else
                  this.extendDataRange(value);
              }
            }, scale);
        var beforePointCallback = goog.bind(
            function() {
              this.resetStack();
            }, scale);
        if (goog.isArray(cats)) {
          syncIterator = new anychart.core.utils.OrdinalIterator(xScales[xId], /** @type {!Array} */(cats),
              pointCallback, null, beforePointCallback);
        }
        while (syncIterator.advance()) {
        }
      }
    }

    // calculate auto names for scales with predefined names field.
    for (id in this.ordinalScalesWithNamesField_) {
      var ordScale = /** @type {anychart.scales.Ordinal} */ (this.ordinalScalesWithNamesField_[id]);
      series = this.seriesOfOrdinalScalesWithNamesField_[goog.getUid(ordScale)];
      var fieldName = ordScale.getNamesField();
      var autoNames = [];
      for (i = 0; i < series.length; i++) {
        aSeries = series[i];
        iterator = aSeries.getResetIterator();
        while (iterator.advance()) {
          var valueIndex = ordScale.getIndexByValue(iterator.get('x'));
          var name = iterator.get(fieldName);
          if (!goog.isDef(autoNames[valueIndex]))
            autoNames[valueIndex] = name || iterator.get('x') || iterator.get('value');
        }
      }
      ordScale.setAutoNames(autoNames);
    }

    var max = -Infinity;
    var min = Infinity;
    var sum = 0;
    var pointsCount = 0;

    for (i = 0; i < this.series_.length; i++) {
      //----------------------------------calc statistics for series
      aSeries = this.series_[i];
      aSeries.calculateStatistics();
      max = Math.max(max, /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_MAX)));
      min = Math.min(min, /** @type {number} */ (aSeries.statistics(anychart.enums.Statistics.SERIES_MIN)));
      sum += /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_SUM));
      pointsCount += /** @type {number} */(aSeries.statistics(anychart.enums.Statistics.SERIES_POINTS_COUNT));
      //----------------------------------end calc statistics for series
    }

    //----------------------------------calc statistics for series
    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
    var average = sum / pointsCount;
    for (i = 0; i < this.series_.length; i++) {
      aSeries = this.series_[i];
      aSeries.statistics(anychart.enums.Statistics.MAX, max);
      aSeries.statistics(anychart.enums.Statistics.MIN, min);
      aSeries.statistics(anychart.enums.Statistics.SUM, sum);
      aSeries.statistics(anychart.enums.Statistics.AVERAGE, average);
      aSeries.statistics(anychart.enums.Statistics.POINTS_COUNT, pointsCount);
    }
    //----------------------------------end calc statistics for series

    anychart.core.Base.resumeSignalsDispatchingTrue(this.series_);

    this.markConsistent(anychart.ConsistencyState.RADAR_SCALES);
    this.scalesFinalization_ = true;
  }
};


/**
 * Prepares scale maps.
 * @private
 */
anychart.charts.Radar.prototype.makeScaleMaps_ = function() {
  var i;
  var id;
  var count;
  var xScales = {};
  var yScales = {};
  var ordinalScalesWithNamesField = {};
  var seriesOfOrdinalScalesWithNamesField = {};
  var seriesOfStackedScaleMap = {};
  var seriesOfXScaleMap = {};
  var seriesOfYScaleMap = {};
  var scale;
  var series;

  //search for scales in series
  for (i = 0, count = this.series_.length; i < count; i++) {
    series = this.series_[i];

    //series X scale
    if (!series.xScale()) {
      series.xScale(/** @type {anychart.scales.Base} */(this.xScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.RADAR_SERIES);
    }
    scale = series.xScale();

    id = goog.getUid(scale);
    xScales[id] = scale;
    if (id in seriesOfXScaleMap)
      seriesOfXScaleMap[id].push(series);
    else
      seriesOfXScaleMap[id] = [series];

    // series ordinal scales with predefined field name for scale names.
    if (scale instanceof anychart.scales.Ordinal && scale.getNamesField()) {
      ordinalScalesWithNamesField[id] = scale;
      if (id in seriesOfOrdinalScalesWithNamesField)
        seriesOfOrdinalScalesWithNamesField[id].push(series);
      else
        seriesOfOrdinalScalesWithNamesField[id] = [series];
    }

    //series Y scale
    if (!series.yScale()) {
      series.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.RADAR_SERIES);
    }
    scale = series.yScale();

    id = goog.getUid(scale);
    if (scale.stackMode() == anychart.enums.ScaleStackMode.VALUE) {
      if (id in seriesOfStackedScaleMap)
        seriesOfStackedScaleMap[id].push(series);
      else
        seriesOfStackedScaleMap[id] = [series];
    }

    yScales[id] = scale;
    if (id in seriesOfYScaleMap)
      seriesOfYScaleMap[id].push(series);
    else
      seriesOfYScaleMap[id] = [series];

    // series ordinal scales with predefined field name for scale names.
    if (scale instanceof anychart.scales.Ordinal && scale.getNamesField()) {
      ordinalScalesWithNamesField[id] = scale;
      if (id in seriesOfOrdinalScalesWithNamesField)
        seriesOfOrdinalScalesWithNamesField[id].push(series);
      else
        seriesOfOrdinalScalesWithNamesField[id] = [series];
    }

  }

  this.seriesOfStackedScaleMap_ = seriesOfStackedScaleMap;
  this.yScales_ = yScales;
  this.xScales_ = xScales;
  this.seriesOfXScaleMap_ = seriesOfXScaleMap;
  this.seriesOfYScaleMap_ = seriesOfYScaleMap;
  this.ordinalScalesWithNamesField_ = ordinalScalesWithNamesField;
  this.seriesOfOrdinalScalesWithNamesField_ = seriesOfOrdinalScalesWithNamesField;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Radar)} .
 */
anychart.charts.Radar.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
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
 * Getter/setter for markerPalette.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.charts.Radar)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Radar.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
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
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Radar)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Radar.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
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
anychart.charts.Radar.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.RADAR_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Radar.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.RADAR_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Radar.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.RADAR_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Radar.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.RADAR_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.Radar.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_);

  var i;

  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().itemAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.RADAR_SERIES);
    this.markConsistent(anychart.ConsistencyState.RADAR_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.RADAR_SERIES);
    this.markConsistent(anychart.ConsistencyState.RADAR_MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.RADAR_SERIES);
    this.markConsistent(anychart.ConsistencyState.RADAR_HATCH_FILL_PALETTE);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
};


/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.charts.Radar.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();
  if (this.scalesFinalization_) {
    var scale;
    var scalesChanged = false;
    for (i in this.xScales_) {
      scale = this.xScales_[i];
      if (scale.needsAutoCalc())
        scalesChanged |= scale.finishAutoCalc();
    }
    for (i in this.yScales_) {
      scale = this.yScales_[i];
      if (scale.needsAutoCalc())
        scalesChanged |= scale.finishAutoCalc();
    }
    this.scalesFinalization_ = false;
    if (scalesChanged) {
      this.invalidateSeries_();
    }
  }

  if (this.isConsistent())
    return;

  var axisInvalidated = false;

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxis_, this.yAxis_);

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.RADAR_AXES)) {
    if (!this.xAxis().scale()) {
      this.xAxis().scale(/** @type {anychart.scales.Base} */(this.xScale()));
    }
    this.xAxis().labels().dropCallsCache();

    if (!this.yAxis().scale()) {
      this.yAxis().scale(/** @type {anychart.scales.Base} */(this.yScale()));
    }
    this.yAxis().labels().dropCallsCache();
    this.yAxis().minorLabels().dropCallsCache();

    axisInvalidated = true;
  }

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone().round();
    this.xAxis().parentBounds(contentAreaBounds);
    this.xAxis().startAngle(this.startAngle_);
    this.dataBounds_ = this.xAxis().getRemainingBounds().round();

    this.invalidateSeries_();

    axisInvalidated = true;

    this.invalidate(anychart.ConsistencyState.RADAR_AXES |
        anychart.ConsistencyState.RADAR_GRIDS |
        anychart.ConsistencyState.RADAR_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (axisInvalidated) grid.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
        grid.parentBounds(this.dataBounds_);
        grid.container(this.rootElement);
        grid.startAngle(this.startAngle_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.RADAR_GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_AXES)) {
    var xAxis = this.xAxis();
    xAxis.container(this.rootElement);
    xAxis.startAngle(this.startAngle_);
    xAxis.parentBounds(bounds.clone().round());
    xAxis.draw();

    var yAxis = this.yAxis();
    yAxis.container(this.rootElement);
    yAxis.startAngle(this.startAngle_);
    yAxis.parentBounds(this.dataBounds_.clone());
    yAxis.draw();

    this.markConsistent(anychart.ConsistencyState.RADAR_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RADAR_SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.startAngle(this.startAngle_);
      series.parentBounds(this.dataBounds_);
    }

    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.RADAR_SERIES);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxis_, this.yAxis_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.charts.Radar.prototype.drawSeries_ = function() {
  var i;
  var iterator;
  for (var id in this.xScales_) {
    var scale = this.xScales_[id];
    var yScales = {};
    var yScalePositiveSumms = {};
    var yScaleNegativeSumms = {};
    var series = this.seriesOfXScaleMap_[goog.getUid(scale)];
    for (i = 0; i < series.length; i++) {
      var yUid = goog.getUid(series[i].yScale());
      yScales[yUid] = series[i].yScale();
      yScalePositiveSumms[yUid] = 0;
      yScaleNegativeSumms[yUid] = 0;
    }
    var pointClb = function(series) {
      var iterator = series.getIterator();
      var index = iterator.getIndex();
      if (iterator.get('selected'))
        series.state.setPointState(anychart.PointState.SELECT, index);

      series.drawPoint(series.state.getPointStateByIndex(index));
    };
    var missingClb = function(series) {
      series.drawMissing();
    };
    var beforeClb = function(activeSeries) {
      var i;
      for (i = activeSeries.length; i--;) {
        var value = anychart.utils.toNumber(activeSeries[i].getReferenceScaleValues());
        if (activeSeries[i].supportsStack() && value) {
          if (value >= 0)
            yScalePositiveSumms[goog.getUid(activeSeries[i].yScale())] += value;
          else if (value < 0)
            yScaleNegativeSumms[goog.getUid(activeSeries[i].yScale())] += value;
        }
      }
      for (i in yScales) {
        yScales[i].resetStack();
        yScales[i].setStackRange(yScaleNegativeSumms[i], yScalePositiveSumms[i]);
      }
    };
    var afterClb = function() {
      for (var i in yScales) {
        yScalePositiveSumms[i] = 0;
        yScaleNegativeSumms[i] = 0;
      }
    };
    iterator = new anychart.core.utils.OrdinalIterator(series, /** @type {!Array} */(scale.getCategorisation()), pointClb,
        missingClb, beforeClb, afterClb);

    for (i = 0; i < series.length; i++) {
      series[i].startDrawing();
    }
    while (iterator.advance()) {
    }
    for (i = 0; i < series.length; i++)
      series[i].finalizeDrawing();
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Radar.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Radar.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.calculate();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES && (this.xScale() instanceof anychart.scales.Ordinal)) {
    var names = this.xScale().names();

    if (goog.isFunction(itemsTextFormatter)) {
      var values = this.xScale().values();
      var itemText;
      var format;
      for (i = 0, count = values.length; i < count; i++) {
        format = {
          'value': values[i],
          'name': names[i]
        };
        itemText = itemsTextFormatter.call(format, format);
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
    for (i = 0, count = this.series_.length; i < count; i++) {
      /** @type {anychart.core.radar.series.Base} */
      var series = this.series_[i];
      var itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.index();
      data.push(itemData);
    }
  }
  return data;
};


/** @inheritDoc */
anychart.charts.Radar.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


/** @inheritDoc */
anychart.charts.Radar.prototype.getSeriesStatus = function(event) {
  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var xValue, yValue, index;

  var containerOffset = this.container().getStage().getClientPosition();


  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var radius = Math.min(this.dataBounds_.width, this.dataBounds_.height) / 2;
  var cx = Math.round(this.dataBounds_.left + this.dataBounds_.width / 2);
  var cy = Math.round(this.dataBounds_.top + this.dataBounds_.height / 2);

  var clientRadius = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));

  if (clientRadius > radius)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;
  var iterator;
  var dx, dy, angle;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();

    var leftSideRatio, rightSideRatio;
    if (clientRadius - spotRadius >= 0) {
      dx = cx - x;
      dy = cy - y;

      angle = Math.atan(dx / dy);
      if (angle <= 0)
        angle += Math.PI;
      if (dx < 0 || (angle == Math.PI && dy > 0))
        angle += Math.PI;
      angle += this.startAngle_;
      goog.math.modulo(/** @type {number} */(angle), Math.PI * 2);


      var dAngle = Math.asin(spotRadius / clientRadius);
      var leftSideAngle = angle + dAngle;
      var rightSideAngle = angle - dAngle;

      leftSideRatio = 1 - (leftSideAngle / (Math.PI * 2));
      rightSideRatio = 1 - (rightSideAngle / (Math.PI * 2));
    } else {
      leftSideRatio = 0;
      rightSideRatio = 1;
    }

    var minValue, maxValue;
    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      if (series.enabled()) {
        minValue = /** @type {number} */(series.xScale().inverseTransform(leftSideRatio));
        maxValue = /** @type {number} */(series.xScale().inverseTransform(rightSideRatio));

        iterator = series.getIterator();
        var indexes = series.data().findInRangeByX(minValue, maxValue);

        if (rightSideRatio >= 1) {
          index = series.data().findInUnsortedDataByX(0);
          goog.array.extend(indexes, index);
        }

        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            xValue = iterator.get('x');
            yValue = iterator.get('value');

            var xRatio = series.xScale().transform(xValue);
            var yRatio = series.yScale().transform(yValue);

            var pointAngle = goog.math.modulo(goog.math.toRadians(this.startAngle() - 90 + 360 * xRatio), Math.PI * 2);
            var pointRadius = radius * yRatio;
            var pointX = cx + pointRadius * Math.cos(pointAngle);
            var pointY = cy + pointRadius * Math.sin(pointAngle);

            var length = Math.sqrt(Math.pow(pointX - x, 2) + Math.pow(pointY - y, 2));
            if (length <= spotRadius) {
              ind.push(index);
              if (length < minLength) {
                minLength = length;
                minLengthIndex = index;
              }
            }
          }
        }
        if (ind.length)
          points.push({
            series: series,
            points: ind,
            lastPoint: ind[ind.length - 1],
            nearestPointToCursor: {index: minLengthIndex, distance: minLength}
          });
      }
    }
  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
    dx = cx - x;
    dy = cy - y;

    angle = Math.atan(dx / dy);
    if (angle <= 0)
      angle += Math.PI;
    if (dx < 0 || (angle == Math.PI && dy > 0))
      angle += Math.PI;
    angle += this.startAngle_;
    goog.math.modulo(/** @type {number} */(angle), Math.PI * 2);

    var ratio = 1 - (angle / (Math.PI * 2));
    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      xValue = series.xScale().inverseTransform(ratio);
      index = series.data().find('x', xValue);
      if (index < 0) index = NaN;

      iterator = series.getIterator();
      minLength = Infinity;

      if (iterator.select(index) && !anychart.utils.isNaN(iterator.get('value'))) {
        var pixX = /** @type {number} */(iterator.meta('x'));
        var pixY = /** @type {number} */(iterator.meta('value'));

        length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
        if (length < minLength) {
          minLength = length;
        }

        points.push({
          series: series,
          points: [index],
          lastPoint: index,
          nearestPointToCursor: {index: index, distance: minLength}
        });
      }
    }
  }

  return /** @type {Array.<Object>} */(points);
};


/** @inheritDoc */
anychart.charts.Radar.prototype.serialize = function() {
  var json = anychart.charts.Radar.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var axesIds = [];
  var scale;
  var config;
  var objId;
  var axis;
  var axisId;
  var axisIndex;
  var axisScale;
  var isCircuit;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  json['xScale'] = scales.length - 1;
  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
  }
  json['yScale'] = scales.length - 1;

  json['type'] = anychart.enums.ChartTypes.RADAR;
  json['defaultSeriesType'] = this.defaultSeriesType();
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['startAngle'] = this.startAngle();

  config = this.xAxis_.serialize();
  scale = this.xAxis_.scale();
  axesIds.push(goog.getUid(this.xAxis_));
  objId = goog.getUid(scale);
  if (!scalesIds[objId]) {
    scalesIds[objId] = scale.serialize();
    scales.push(scalesIds[objId]);
    config['scale'] = scales.length - 1;
  } else {
    config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
  }
  json['xAxis'] = config;

  config = this.yAxis_.serialize();
  scale = this.yAxis_.scale();
  axesIds.push(goog.getUid(this.yAxis_));
  objId = goog.getUid(scale);
  if (!scalesIds[objId]) {
    scalesIds[objId] = scale.serialize();
    scales.push(scalesIds[objId]);
    config['scale'] = scales.length - 1;
  } else {
    config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
  }
  json['yAxis'] = config;

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
    if (grid) {
      config = grid.serialize();
      scale = grid.xScale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['xScale'] = scales.length - 1;
        } else {
          config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      scale = grid.yScale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['yScale'] = scales.length - 1;
        } else {
          config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      axis = grid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            isCircuit = axis instanceof anychart.core.axes.Radial;
            config['layout'] = isCircuit ? anychart.enums.RadialGridLayout.CIRCUIT : anychart.enums.RadialGridLayout.RADIAL;
          }
          if (!('scale' in config)) { //doesn't override the scale already set.
            objId = goog.getUid(axisScale);
            if (!scalesIds[objId]) {
              scalesIds[objId] = axisScale.serialize();
              scales.push(scalesIds[objId]);
              config['scale'] = scales.length - 1;
            } else {
              config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
            }
          }
        } else {
          config['axis'] = axisIndex;
        }
      }

      grids.push(config);
    }
  }
  if (grids.length)
    json['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
    if (minorGrid) {
      config = minorGrid.serialize();
      scale = minorGrid.xScale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['xScale'] = scales.length - 1;
        } else {
          config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      scale = minorGrid.yScale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['yScale'] = scales.length - 1;
        } else {
          config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      axis = minorGrid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            isCircuit = axis instanceof anychart.core.axes.Radial;
            config['layout'] = isCircuit ? anychart.enums.RadialGridLayout.CIRCUIT : anychart.enums.RadialGridLayout.RADIAL;
          }
          if (!('scale' in config)) { //doesn't override the scale already set.
            objId = goog.getUid(axisScale);
            if (!scalesIds[objId]) {
              scalesIds[objId] = axisScale.serialize();
              scales.push(scalesIds[objId]);
              config['scale'] = scales.length - 1;
            } else {
              config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
            }
          }
        } else {
          config['axis'] = axisIndex;
        }
      }
      minorGrids.push(config);
    }
  }
  if (minorGrids.length)
    json['minorGrids'] = minorGrids;

  config = this.xAxis_.serialize();
  scale = this.xAxis_.scale();
  objId = goog.getUid(scale);
  if (!scalesIds[objId]) {
    scalesIds[objId] = scale.serialize();
    scales.push(scalesIds[objId]);
    config['scale'] = scales.length - 1;
  } else {
    config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
  }
  json['xAxis'] = config;

  config = this.yAxis_.serialize();
  scale = this.yAxis_.scale();
  objId = goog.getUid(scale);
  if (!scalesIds[objId]) {
    scalesIds[objId] = scale.serialize();
    scales.push(scalesIds[objId]);
    config['scale'] = scales.length - 1;
  } else {
    config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
  }
  json['yAxis'] = config;

  var series = [];
  for (i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
    config = series_.serialize();

    scale = series_.xScale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['xScale'] = scales.length - 1;
    } else {
      config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }

    scale = series_.yScale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['yScale'] = scales.length - 1;
    } else {
      config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    series.push(config);
  }
  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['scales'] = scales;
  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Radar.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Radar.base(this, 'setupByJSON', config, opt_default);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  if ('defaultMinorGridSettings' in config)
    this.defaultMinorGridSettings(config['defaultMinorGridSettings']);

  this.defaultSeriesType(config['defaultSeriesType']);
  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.startAngle(config['startAngle']);

  var i, json, scale;
  var grids = config['grids'];
  var minorGrids = config['minorGrids'];
  var series = config['series'];
  var scales = config['scales'];
  var type = this.getType();

  var scalesInstances = {};
  if (goog.isArray(scales)) {
    for (i = 0; i < scales.length; i++) {
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  } else if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        json = {'type': json};
      }
      json = anychart.themes.merging.mergeScale(json, i, type);
      scale = anychart.scales.Base.fromString(json['type'], false);
      scale.setup(json);
      scalesInstances[i] = scale;
    }
  }

  json = config['xScale'];
  if (goog.isNumber(json) || goog.isString(json)) {
    scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.ordinal();
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale instanceof anychart.scales.Ordinal)
    this.xScale(scale);

  json = config['yScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], false);
    scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.yScale(scale);

  json = config['xAxis'];
  this.xAxis(json);
  if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.xAxis().scale(scalesInstances[json['scale']]);

  json = config['yAxis'];
  this.yAxis(json);
  if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.yAxis().scale(scalesInstances[json['scale']]);

  if (goog.isArray(grids)) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(i, json);
      if (goog.isObject(json)) {
        if ('xScale' in json && json['xScale'] > 1) this.grid(i).xScale(scalesInstances[json['xScale']]);
        if ('yScale' in json && json['yScale'] > 1) this.grid(i).yScale(scalesInstances[json['yScale']]);
      }
    }
  }

  if (goog.isArray(minorGrids)) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(i, json);
      if (goog.isObject(json)) {
        if ('xScale' in json && json['xScale'] > 1) this.minorGrid(i).xScale(scalesInstances[json['xScale']]);
        if ('yScale' in json && json['yScale'] > 1) this.minorGrid(i).yScale(scalesInstances[json['yScale']]);
      }
    }
  }

  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = json['seriesType'] || this.defaultSeriesType();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('xScale' in json && json['xScale'] > 1) seriesInst.xScale(scalesInstances[json['xScale']]);
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }
};


//exports
(function() {
  var proto = anychart.charts.Radar.prototype;
  proto['xScale'] = proto.xScale;//doc|ex
  proto['yScale'] = proto.yScale;//doc|ex
  proto['grid'] = proto.grid;//doc|ex
  proto['minorGrid'] = proto.minorGrid;//doc|ex
  proto['xAxis'] = proto.xAxis;//doc|ex
  proto['yAxis'] = proto.yAxis;//doc|ex
  proto['getSeries'] = proto.getSeries;//doc|ex
  proto['area'] = proto.area;//doc|ex
  proto['line'] = proto.line;//doc|ex
  proto['marker'] = proto.marker;//doc|ex
  proto['palette'] = proto.palette;//doc|ex
  proto['markerPalette'] = proto.markerPalette;//doc|ex
  proto['startAngle'] = proto.startAngle;//doc|ex
  proto['getType'] = proto.getType;
  proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
})();
