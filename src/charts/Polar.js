goog.provide('anychart.charts.Polar');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.Polar');
goog.require('anychart.core.axes.Radial');
goog.require('anychart.core.grids.Polar');
goog.require('anychart.core.polar.series.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Polar chart class.<br/>
 * To get the chart use method {@link anychart.polar}.<br/>
 * Chart can contain any number of series.<br/>
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.Polar = function() {
  anychart.charts.Polar.base(this, 'constructor');

  /**
   * Start angle for the first slice of a pie chart.
   * @type {(string|number)}
   * @private
   */
  this.startAngle_;

  /**
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * @type {!Array.<anychart.core.polar.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * @type {Array.<anychart.core.grids.Polar>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Polar>}
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

  this.defaultSeriesType(anychart.enums.PolarSeriesType.MARKER);
};
goog.inherits(anychart.charts.Polar, anychart.core.SeparateChart);


/**
 * Getter/setter for polar defaultSeriesType.
 * @param {(string|anychart.enums.PolarSeriesType)=} opt_value Default series type.
 * @return {anychart.charts.Polar|anychart.enums.PolarSeriesType} Default series type or self for chaining.
 */
anychart.charts.Polar.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizePolarSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.getType = function() {
  return anychart.enums.ChartTypes.POLAR;
};


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.charts.Polar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.POLAR_PALETTE |
    anychart.ConsistencyState.POLAR_MARKER_PALETTE |
    anychart.ConsistencyState.POLAR_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.POLAR_SCALES |
    anychart.ConsistencyState.POLAR_SERIES |
    anychart.ConsistencyState.POLAR_AXES |
    anychart.ConsistencyState.POLAR_GRIDS;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_LINE_SERIES = 31;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


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
anychart.charts.Polar.prototype.defaultSeriesSettings = function(opt_value) {
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
anychart.charts.Polar.prototype.defaultGridSettings = function(opt_value) {
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
anychart.charts.Polar.prototype.defaultMinorGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


/**
 * Set chart start angle.
 * @example
 * var chart = anychart.polar([1, 1.2, 1.4, 1.6, 1.2]);
 * chart.startAngle(45);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.charts.Polar)} .
 */
anychart.charts.Polar.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
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
 * @param {(anychart.enums.ScatterScaleTypes|anychart.scales.ScatterBase)=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.Polar)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Polar.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.ScatterBase.fromString(opt_value, false);
    }
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POLAR_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Linear();
    }
    return this.xScale_;
  }
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Polar)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Polar.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.POLAR_SCALES, anychart.Signal.NEEDS_REDRAW);
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
 * @param {anychart.core.grids.Polar} item Item to set scale.
 * @private
 */
anychart.charts.Polar.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (!!(item.isRadial())) {
    item.xScale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
  } else {
    item.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
    item.xScale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
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
 * @return {!(anychart.core.grids.Polar|anychart.charts.Polar)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Polar();
    grid.setChart(this);
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.RADIAL);
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.POLAR_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.grids.Polar|anychart.charts.Polar)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Polar();
    grid.setChart(this);
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.CIRCUIT);
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.POLAR_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
anychart.charts.Polar.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.POLAR_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Polar|anychart.charts.Polar)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.core.axes.Polar();
    this.xAxis_.setParentEventTarget(this);
    this.registerDisposable(this.xAxis_);
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.POLAR_AXES | anychart.ConsistencyState.BOUNDS);
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
 * @return {!(anychart.core.axes.Radial|anychart.charts.Polar)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.core.axes.Radial();
    this.yAxis_.setParentEventTarget(this);
    this.registerDisposable(this.yAxis_);
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.POLAR_AXES | anychart.ConsistencyState.BOUNDS);
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
anychart.charts.Polar.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.POLAR_AXES;
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
 * @return {anychart.core.axes.Polar|anychart.core.axes.Radial|undefined}
 */
anychart.charts.Polar.prototype.getAxisByIndex = function(index) {
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
 * var chart = anychart.polar();
 * chart.area([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.polar.series.Base} {@link anychart.core.polar.series.Area} instance for method chaining.
 */
anychart.charts.Polar.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.PolarSeriesType.AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @example
 * var chart = anychart.polar();
 * chart.line([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.polar.series.Base} {@link anychart.core.polar.series.Line} instance for method chaining.
 */
anychart.charts.Polar.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.PolarSeriesType.LINE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Marker series.
 * @example
 * var chart = anychart.polar();
 * chart.marker([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.polar.series.Base} {@link anychart.core.polar.series.Marker} instance for method chaining.
 */
anychart.charts.Polar.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.PolarSeriesType.MARKER,
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
 * @return {anychart.core.polar.series.Base}
 */
anychart.charts.Polar.prototype.createSeriesByType_ = function(type, data, opt_csvSettings) {
  type = anychart.enums.normalizePolarSeriesType(type);
  var ctl = anychart.core.polar.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    instance.setChart(this);
    instance.setParentEventTarget(this);
    this.registerDisposable(instance);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);
    var inc = index * anychart.charts.Polar.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);
    var seriesZIndex = ((type == anychart.enums.PolarSeriesType.LINE) ?
        anychart.charts.Polar.ZINDEX_LINE_SERIES :
        anychart.charts.Polar.ZINDEX_SERIES) + inc;
    instance.setAutoZIndex(seriesZIndex);
    instance.labels().setAutoZIndex(seriesZIndex + anychart.charts.Polar.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.setAutoColor(this.palette().itemAt(index));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    var markerType = /** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index));
    instance.setAutoMarkerType(markerType);
    if (instance.supportsMarkers()) {
      instance.markers().setAutoZIndex(seriesZIndex + anychart.charts.Polar.ZINDEX_INCREMENT_MULTIPLIER / 2);
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
        anychart.ConsistencyState.POLAR_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.POLAR_SCALES,
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
 * @return {Array.<anychart.core.polar.series.Base>} Array of created series.
 */
anychart.charts.Polar.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
  var count = arguments.length;
  this.suspendSignalsDispatching();
  if (!count)
    rv.push(this.createSeriesByType_(type, null, undefined));
  else {
    for (var i = 0; i < count; i++) {
      rv.push(this.createSeriesByType_(type, arguments[i], undefined));
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
anychart.charts.Polar.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.polar.series.Base} Series instance.
 */
anychart.charts.Polar.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.polar.series.Base} Series instance.
 */
anychart.charts.Polar.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.charts.Polar.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.charts.Polar}
 */
anychart.charts.Polar.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.charts.Polar}
 */
anychart.charts.Polar.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.POLAR_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.POLAR_SCALES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.charts.Polar} Self for method chaining.
 */
anychart.charts.Polar.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.POLAR_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.POLAR_SCALES,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Polar.prototype.getAllSeries = function() {
  return this.series_;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.POLAR_SERIES;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.POLAR_SERIES;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.POLAR_SCALES;
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
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Polar)} .
 */
anychart.charts.Polar.prototype.palette = function(opt_value) {
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
 * Getter/setter for chart markerPalette.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.charts.Polar)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Polar.prototype.markerPalette = function(opt_value) {
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
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Polar)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Polar.prototype.hatchFillPalette = function(opt_value) {
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
anychart.charts.Polar.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
      this.invalidate(anychart.ConsistencyState.POLAR_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.POLAR_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.POLAR_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.POLAR_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate cartesian chart properties.
 */
anychart.charts.Polar.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.core.polar.series.Base>} */
  var series;
  /** @type {anychart.core.polar.series.Base} */
  var aSeries;
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {number} */
  var id;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_SCALES)) {
    anychart.core.Base.suspendSignalsDispatching(this.series_);

    var count;
    var scales = {};
    var ordinalScalesWithNamesField = {};
    var seriesOfOrdinalScalesWithNamesField = {};

    //search for scales in series
    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];

      //series X scale
      if (!aSeries.xScale()) {
        aSeries.xScale(/** @type {anychart.scales.Base} */(this.xScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.POLAR_SERIES);
      }
      scale = /** @type {anychart.scales.Base} */(aSeries.xScale());

      id = goog.getUid(scale);
      scales[id] = scale;

      //series Y scale
      if (!aSeries.yScale()) {
        aSeries.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.POLAR_SERIES);
      }
      scale = /** @type {anychart.scales.Base} */(aSeries.yScale());

      id = goog.getUid(scale);

      scales[id] = scale;

      // series ordinal scales with predefined field name for scale names.
      if (scale instanceof anychart.scales.Ordinal && scale.getNamesField()) {
        ordinalScalesWithNamesField[id] = scale;
        if (id in seriesOfOrdinalScalesWithNamesField)
          seriesOfOrdinalScalesWithNamesField[id].push(aSeries);
        else
          seriesOfOrdinalScalesWithNamesField[id] = [aSeries];
      }
    }

    var xScale, yScale, x, y;

    for (id in scales) {
      scale = scales[id];
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
      }
    }

    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];
      if (!aSeries.enabled()) continue;
      xScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      yScale = /** @type {anychart.scales.Base} */ (aSeries.yScale());

      iterator = aSeries.getResetIterator();

      while (iterator.advance()) {
        x = iterator.get('x');
        y = iterator.get('value');
        if (goog.isDef(x))
          xScale.extendDataRange(x);
        if (goog.isDef(y))
          yScale.extendDataRange(y);
      }
    }

    // calculate auto names for scales with predefined names field
    for (id in ordinalScalesWithNamesField) {
      var ordScale = /** @type {anychart.scales.Ordinal} */ (ordinalScalesWithNamesField[id]);
      series = seriesOfOrdinalScalesWithNamesField[goog.getUid(ordScale)];
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

    var scalesChanged = false;
    for (id in scales) {
      scale = scales[id];
      if (scale.needsAutoCalc()) {
        scalesChanged |= scale.finishAutoCalc();
      }
    }

    if (scalesChanged) {
      this.invalidateSeries_();
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

    this.markConsistent(anychart.ConsistencyState.POLAR_SCALES);
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
anychart.charts.Polar.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_);

  var i;

  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().itemAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.POLAR_SERIES);
    this.markConsistent(anychart.ConsistencyState.POLAR_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.POLAR_SERIES);
    this.markConsistent(anychart.ConsistencyState.POLAR_MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.POLAR_SERIES);
    this.markConsistent(anychart.ConsistencyState.POLAR_HATCH_FILL_PALETTE);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
};


/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.charts.Polar.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();

  if (this.isConsistent())
    return;

  var axisInvalidated = false;

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxis_, this.yAxis_);

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.POLAR_AXES)) {
    if (!this.xAxis().scale()) {
      this.xAxis().scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
    }
    this.xAxis().labels().dropCallsCache();
    this.xAxis().minorLabels().dropCallsCache();

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

    axisInvalidated = true;

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.POLAR_AXES |
        anychart.ConsistencyState.POLAR_GRIDS |
        anychart.ConsistencyState.POLAR_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_GRIDS)) {
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
    this.markConsistent(anychart.ConsistencyState.POLAR_GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_AXES)) {
    var xAxis = this.xAxis();
    xAxis.container(this.rootElement);
    xAxis.startAngle(this.startAngle_);
    xAxis.parentBounds(bounds.clone().round());
    xAxis.draw();

    var yAxis = this.yAxis();
    yAxis.container(this.rootElement);
    yAxis.startAngle(this.startAngle_);
    yAxis.parentBounds(this.dataBounds_);
    yAxis.draw();

    this.markConsistent(anychart.ConsistencyState.POLAR_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.POLAR_SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.startAngle(this.startAngle_);
      series.parentBounds(this.dataBounds_);
    }

    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.POLAR_SERIES);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxis_, this.yAxis_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.charts.Polar.prototype.drawSeries_ = function() {
  var i;
  var count;
  var iterator;
  var series;
  for (i = 0, count = this.series_.length; i < count; i++) {
    series = this.series_[i];

    series.startDrawing();

    iterator = series.getResetIterator();
    while (iterator.advance()) {
      var index = iterator.getIndex();
      if (iterator.get('selected'))
        series.state.setPointState(anychart.PointState.SELECT, index);

      series.drawPoint(series.state.getPointStateByIndex(index));
    }

    series.finalizeDrawing();
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Polar.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Polar.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.calculate();
  for (i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.core.polar.series.Base} */
    var series = this.series_[i];
    var itemData = series.getLegendItemData(itemsTextFormatter);
    itemData['sourceUid'] = goog.getUid(this);
    itemData['sourceKey'] = series.index();
    data.push(itemData);
  }
  return data;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


/** @inheritDoc */
anychart.charts.Polar.prototype.getSeriesStatus = function(event) {
  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var xValue, index;

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
  var minLength;
  var minLengthIndex;

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
        minLength = Infinity;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            var pointX = /** @type {number} */(iterator.meta('x'));
            var pointY = /** @type {number} */(iterator.meta('value'));

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
      xValue = /** @type {number} */(series.xScale().inverseTransform(ratio));
      index = series.data().findInUnsortedDataByX(xValue);

      var dataCache = series.data().cachedScatterValues;
      if (dataCache && goog.isDef(dataCache.lastNotNaNValueIndex) && dataCache.lastNotNaNValueIndex != -1) {
        iterator = series.getIterator();
        iterator.select(dataCache.lastNotNaNValueIndex);
        var lastNotNaNValue = iterator.get('x');
        var lastNotNaNValueRatio = series.xScale().transform(lastNotNaNValue);
        if (ratio > lastNotNaNValueRatio && ratio > lastNotNaNValueRatio + (1 - lastNotNaNValueRatio) / 2) {
          index = series.data().findInUnsortedDataByX(0);
        }
      }

      iterator = series.getIterator();
      minLength = Infinity;
      if (index.length) {
        var resultIndex = [];
        for (j = 0; j < index.length; j++) {
          if (iterator.select(index[j]) && !anychart.utils.isNaN(iterator.get('value'))) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pixY = /** @type {number} */(iterator.meta('value'));
            length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
            if (length < minLength) {
              minLength = length;
              minLengthIndex = index[j];
            }

            resultIndex.push(index[j]);
          }
        }

        points.push({
          series: series,
          points: resultIndex,
          lastPoint: resultIndex[index.length - 1],
          nearestPointToCursor: {index: minLengthIndex, distance: minLength}
        });
      }
    }
  }
  return /** @type {Array.<Object>} */(points);
};


/** @inheritDoc */
anychart.charts.Polar.prototype.serialize = function() {
  var json = anychart.charts.Polar.base(this, 'serialize');
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

  json['type'] = anychart.enums.ChartTypes.POLAR;
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
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['xScale'] = scales.length - 1;
      } else {
        config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
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
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['xScale'] = scales.length - 1;
      } else {
        config['xScale'] = goog.array.indexOf(scales, scalesIds[objId]);
      }

      scale = minorGrid.yScale();
      objId = goog.getUid(scale);
      if (!scalesIds[objId]) {
        scalesIds[objId] = scale.serialize();
        scales.push(scalesIds[objId]);
        config['yScale'] = scales.length - 1;
      } else {
        config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
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
anychart.charts.Polar.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Polar.base(this, 'setupByJSON', config, opt_default);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  if ('defaultMinorGridSettings' in config)
    this.defaultMinorGridSettings(config['defaultMinorGridSettings']);

  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.startAngle(config['startAngle']);
  this.defaultSeriesType(config['defaultSeriesType']);

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
  if (scale instanceof anychart.scales.ScatterBase)
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
  var proto = anychart.charts.Polar.prototype;
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
  proto['hatchFillPalette'] = proto.hatchFillPalette;
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
