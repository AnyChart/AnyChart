goog.provide('anychart.charts.Polar');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.Chart');
goog.require('anychart.core.axes.Polar');
goog.require('anychart.core.axes.Radial');
goog.require('anychart.core.grids.Polar');
goog.require('anychart.core.polar.series.Base');
goog.require('anychart.core.utils.OrdinalIterator');
goog.require('anychart.enums');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Cartesian chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.cartesian}</li>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * Chart can contain any number of series.
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.Chart}
 * @constructor
 */
anychart.charts.Polar = function() {
  goog.base(this);

  /**
   * Start angle for the first slice of a pie chart.
   * @type {(string|number)}
   * @private
   */
  this.startAngle_ = 0;

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

  // Add handler to listen legend item click for legend and enable/disable series.
  var legend = /** @type {anychart.core.ui.Legend} */ (this.legend());
  legend.listen(anychart.enums.EventType.LEGEND_ITEM_CLICK, function(event) {
    // function that enables or disables series by index of clicked legend item

    var cartesianChart = /** @type {anychart.charts.Polar} */ (this);
    var index = event['index'];
    var series = cartesianChart.getSeries(index);
    if (series) {
      series.enabled(!series.enabled());
    }

  }, false, this);

};
goog.inherits(anychart.charts.Polar, anychart.core.Chart);


/**
 * @type {string}
 */
anychart.charts.Polar.CHART_TYPE = 'radar';
anychart.chartTypesMap[anychart.charts.Polar.CHART_TYPE] = anychart.charts.Polar;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.Chart states.
 * @type {number}
 */
anychart.charts.Polar.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.PALETTE |
    anychart.ConsistencyState.MARKER_PALETTE |
    anychart.ConsistencyState.HATCH_FILL_PALETTE |
    anychart.ConsistencyState.SCALES |
    anychart.ConsistencyState.SERIES |
    anychart.ConsistencyState.AXES |
    anychart.ConsistencyState.GRIDS;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_GRID = 10;


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
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Polar.ZINDEX_AXIS = 35;


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


/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.charts.Polar)} .
 */
anychart.charts.Polar.prototype.startAngle = function(opt_value) {
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
 * @param {anychart.scales.ScatterBase=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.Polar)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Polar.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
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
 * @param {anychart.scales.Base=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Polar)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Polar.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
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
 * @param {(number|anychart.core.grids.Polar|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.core.grids.Polar|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Polar|anychart.charts.Polar)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.grid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var grid = this.grids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Polar();
    grid.zIndex(anychart.charts.Polar.ZINDEX_GRID);
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.grids.Polar) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Polar.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Polar.ZINDEX_GRID);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * @param {(number|anychart.core.grids.Polar|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.core.grids.Polar|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Polar|anychart.charts.Polar)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var grid = this.minorGrids_[index];
  if (!grid) {
    grid = new anychart.core.grids.Polar();
    grid.zIndex(anychart.charts.Polar.ZINDEX_GRID);
    grid.isMinor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.grids.Polar) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Polar.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Polar.ZINDEX_GRID);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
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
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(anychart.core.axes.Polar|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Polar|anychart.charts.Polar)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.core.axes.Polar();
    this.xAxis_.zIndex(anychart.charts.Polar.ZINDEX_AXIS);
    this.registerDisposable(this.xAxis_);
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.core.axes.Polar) {
      this.xAxis_.deserialize(opt_value.serialize());
      if (this.xAxis_.zIndex() == 0) this.xAxis_.zIndex(anychart.charts.Polar.ZINDEX_AXIS);
    } else if (goog.isObject(opt_value)) {
      this.xAxis_.deserialize(opt_value);
      if (this.xAxis_.zIndex() == 0) this.xAxis_.zIndex(anychart.charts.Polar.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(opt_value)) {
      this.xAxis_.enabled(false);
    }
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 * @param {(anychart.core.axes.Radial|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Radial|anychart.charts.Polar)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Polar.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.core.axes.Radial();
    this.yAxis_.zIndex(anychart.charts.Polar.ZINDEX_AXIS);
    this.registerDisposable(this.yAxis_);
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.core.axes.Radial) {
      this.yAxis_.deserialize(opt_value.serialize());
      if (this.yAxis_.zIndex() == 0) this.yAxis_.zIndex(anychart.charts.Polar.ZINDEX_AXIS);
    } else if (goog.isObject(opt_value)) {
      this.yAxis_.deserialize(opt_value);
      if (this.yAxis_.zIndex() == 0) this.yAxis_.zIndex(anychart.charts.Polar.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(opt_value)) {
      this.yAxis_.enabled(false);
    }
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
    state |= anychart.ConsistencyState.AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series constructors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds Area series.
 * @example
 * var chart = anychart.cartesian();
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
 * var chart = anychart.cartesian();
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
      opt_csvSettings,
      anychart.charts.Polar.ZINDEX_LINE_SERIES
  );
};


/**
 * Adds Marker series.
 * @example
 * var chart = anychart.cartesian();
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
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @param {number=} opt_zIndex Optional series zIndex.
 * @private
 * @return {anychart.core.polar.series.Base}
 */
anychart.charts.Polar.prototype.createSeriesByType_ = function(type, data, opt_csvSettings, opt_zIndex) {
  var ctl = anychart.core.polar.series.Base.SeriesTypesMap[/** @type {anychart.enums.PolarSeriesType} */(type)];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    this.registerDisposable(instance);
    this.series_.push(instance);
    var index = this.series_.length - 1;
    var inc = index * anychart.charts.Polar.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index);
    instance.setAutoZIndex((goog.isDef(opt_zIndex) ? opt_zIndex : anychart.charts.Polar.ZINDEX_SERIES) + inc);
    var markerType = /** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(this.series_.length - 1));
    if (instance.hasMarkers()) {
      instance.markers().setAutoZIndex(anychart.charts.Polar.ZINDEX_MARKER + inc);
      instance.markers().setAutoType(markerType);
    } else {
      // this else would be only if instance is Marker series
      instance.type(markerType);
    }
    instance.labels().setAutoZIndex(anychart.charts.Polar.ZINDEX_LABEL + inc + anychart.charts.Polar.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.setAutoColor(this.palette().colorAt(this.series_.length - 1));
    instance.setAutoMarkerType(markerType);
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(this.series_.length - 1)));
    instance.restoreDefaults();
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
  }

  return instance;
};


/**
 * Getter series by index.
 * @example
 * var data = [
 *     [1, 2, 3, 4],
 *     [2, 3, 4, 1],
 *     [3, 4, 1, 2],
 *     [4, 1, 2, 3]
 * ];
 * var chart = anychart.line.apply(this, data);
 * var series, i=0;
 * while (series = chart.getSeries(i)){
 *     series.markers().type('circle');
 *     i++;
 * }
 * chart.container(stage).draw();
 * @param {number} index
 * @return {anychart.core.polar.series.Base}
 */
anychart.charts.Polar.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.SERIES;
    this.invalidateSeries_();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.SCALES;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for series colors palette.
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} Current palette.
 *//**
 * Setter for series colors palette.
 * @example <t>lineChart</t>
 * chart = anychart.line();
 * chart.palette(['red', 'green', 'blue']);
 * chart.line([1, -4, 5, 7]);
 * chart.line([11, 0, 15, 4]);
 * chart.line([21, -4, 9, 0]);
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Array)=} opt_value Value to set.
 * @return {!anychart.charts.Polar} {@link anychart.charts.Polar} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Array)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Polar)} .
 */
anychart.charts.Polar.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
    return this;
  }

  if (!this.palette_)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value))
      this.palette_.colors(opt_value);
    else if (goog.isNull(opt_value))
      this.palette_.cloneFrom(opt_value);
    else
      return this;
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * Chart markers palette settings.
 * @param {(Array.<anychart.enums.MarkerType>|Object|anychart.palettes.Markers)=} opt_value Chart marker palette settings to set.
 * @return {anychart.palettes.Markers|anychart.charts.Polar} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Polar.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.palettes.Markers) {
      this.markerPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markerPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.markerPalette_.markers(opt_value);
    }
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {anychart.palettes.HatchFills|anychart.charts.Polar} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Polar.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.palettes.HatchFills) {
      this.hatchFillPalette_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.hatchFillPalette_.deserialize(opt_value);
    } else if (goog.isArray(opt_value)) {
      this.hatchFillPalette_.hatchFills(opt_value);
    }
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
      this.palette_.cloneFrom(opt_cloneFrom);
  } else {
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.cloneFrom(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKER_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Polar.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HATCH_FILL_PALETTE, anychart.Signal.NEEDS_REDRAW);
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

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
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
        this.invalidate(anychart.ConsistencyState.SERIES);
      }
      scale = /** @type {anychart.scales.Base} */(aSeries.xScale());

      id = goog.getUid(scale);
      scales[id] = scale;

      //series Y scale
      if (!aSeries.yScale()) {
        aSeries.yScale(/** @type {anychart.scales.Base} */(this.yScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SERIES);
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
      max = Math.max(max, /** @type {number} */(aSeries.statistics('seriesMax')));
      min = Math.min(min, /** @type {number} */ (aSeries.statistics('seriesMin')));
      sum += /** @type {number} */(aSeries.statistics('seriesSum'));
      pointsCount += /** @type {number} */(aSeries.statistics('seriesPointsCount'));
      //----------------------------------end calc statistics for series
    }

    //----------------------------------calc statistics for series
    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
    var average = sum / pointsCount;
    for (i = 0; i < this.series_.length; i++) {
      aSeries = this.series_[i];
      aSeries.statistics('max', max);
      aSeries.statistics('min', min);
      aSeries.statistics('sum', sum);
      aSeries.statistics('average', average);
      aSeries.statistics('pointsCount', pointsCount);
    }
    //----------------------------------end calc statistics for series

    anychart.core.Base.resumeSignalsDispatchingTrue(this.series_);

    this.markConsistent(anychart.ConsistencyState.SCALES);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.charts.Polar.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();

  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxis_, this.yAxis_);

  if (this.hasInvalidationState(anychart.ConsistencyState.PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().colorAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.SERIES);
    this.markConsistent(anychart.ConsistencyState.HATCH_FILL_PALETTE);
  }

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES)) {
    if (this.xAxis() && !this.xAxis().scale())
      this.xAxis().scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));

    if (this.yAxis() && !this.yAxis().scale())
      this.yAxis().scale(/** @type {anychart.scales.Base} */(this.yScale()));
  }

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone().round();
    this.xAxis().parentBounds(contentAreaBounds);
    this.xAxis().startAngle(this.startAngle_);
    this.dataBounds_ = this.xAxis().getRemainingBounds().round();

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.AXES);
    this.invalidate(anychart.ConsistencyState.GRIDS);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS);
    this.invalidate(anychart.ConsistencyState.SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (!grid.xScale())
          this.setDefaultScaleForLayoutBasedElements_(grid);
        grid.parentBounds(this.dataBounds_);
        grid.container(this.rootElement);
        grid.startAngle(this.startAngle_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES)) {
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

    this.markConsistent(anychart.ConsistencyState.AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.startAngle(this.startAngle_);
      series.parentBounds(this.dataBounds_);
    }

    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
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
      series.drawPoint();
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
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Polar.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.core.polar.series.Base} */
    var series = this.series_[i];
    data.push(series.getLegendItemData());
  }

  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Defaults.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Polar.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');
};


/**
 * @inheritDoc
 */
anychart.charts.Polar.prototype.deserialize = function(config) {
  var chart = config['chart'];

  if (!chart) return this;
  goog.base(this, 'deserialize', chart);

  this.suspendSignalsDispatching();
  var i, json, scale;
  var grids = chart['grids'];
  var xAxis = chart['xAxis'];
  var yAxis = chart['yAxis'];
  var series = chart['series'];
  var scales = chart['scales'];

  var scalesInstances = [];
  for (i = 0; i < scales.length; i++) {
    var scaleJson = scales[i];
    var scaleInstance = anychart.scales.createByType(scaleJson['type']);
    scaleInstance.deserialize(scaleJson);
    scalesInstances.push(scaleInstance);
  }

  this.xScale(scalesInstances[chart['xScale']]);
  chart['yScale'] ?
      this.yScale(scalesInstances[chart['yScale']]) :
      this.yScale(scalesInstances[chart['xScale']]);

  if (grids) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(json);
      var grid = this.grid(i);

      if (json['xScale']) grid.xScale(scalesInstances[json['xScale']]);
      if (json['yScale']) grid.yScale(scalesInstances[json['yScale']]);
    }
  }

  if (xAxis) {
    this.xAxis(xAxis);
    if (xAxis['scale']) this.xAxis().scale(scalesInstances[xAxis['scale']]);
  }

  if (yAxis) {
    this.yAxis(yAxis);
    if (yAxis['scale']) this.yAxis().scale(scalesInstances[yAxis['scale']]);
  }

  if (series) {
    for (i = 0; i < series.length; i++) {
      var s = series[i];
      var seriesType = s['seriesType'].toLowerCase();
      var data = s['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      seriesInst.deserialize(s);

      if (s['xScale']) seriesInst.xScale(scalesInstances[s['xScale']]);
      if (s['yScale']) seriesInst.yScale(scalesInstances[s['yScale']]);
    }
  }

  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * @inheritDoc
 */
anychart.charts.Polar.prototype.serialize = function() {
  var json = {};
  var chart = goog.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var scale;
  var config;
  var objId;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  chart['xScale'] = scales.length - 1;
  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
    chart['yScale'] = scales.length - 1;
  }

  chart['type'] = anychart.charts.Polar.CHART_TYPE;

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
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
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['yScale'] = scales.length - 1;
    } else {
      config['yScale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    grids.push(config);
  }
  chart['grids'] = grids;

  var xAxis = this.xAxis();
  config = xAxis.serialize();
  scale = xAxis.scale();
  objId = goog.getUid(scale);
  if (!scalesIds[objId]) {
    scalesIds[objId] = scale.serialize();
    scales.push(scalesIds[objId]);
    config['scale'] = scales.length - 1;
  } else {
    config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
  }
  chart['xAxis'] = config;

  var yAxis = this.yAxis();
  config = yAxis.serialize();
  scale = yAxis.scale();
  objId = goog.getUid(scale);
  if (!scalesIds[objId]) {
    scalesIds[objId] = scale.serialize();
    scales.push(scalesIds[objId]);
    config['scale'] = scales.length - 1;
  } else {
    config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
  }
  chart['yAxis'] = yAxis;

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

  chart['series'] = series;
  chart['scales'] = scales;

  json['chart'] = chart;

  return json;
};


//exports
anychart.charts.Polar.prototype['xScale'] = anychart.charts.Polar.prototype.xScale;
anychart.charts.Polar.prototype['yScale'] = anychart.charts.Polar.prototype.yScale;
anychart.charts.Polar.prototype['grid'] = anychart.charts.Polar.prototype.grid;
anychart.charts.Polar.prototype['minorGrid'] = anychart.charts.Polar.prototype.minorGrid;
anychart.charts.Polar.prototype['xAxis'] = anychart.charts.Polar.prototype.xAxis;
anychart.charts.Polar.prototype['yAxis'] = anychart.charts.Polar.prototype.yAxis;
anychart.charts.Polar.prototype['getSeries'] = anychart.charts.Polar.prototype.getSeries;
anychart.charts.Polar.prototype['area'] = anychart.charts.Polar.prototype.area;
anychart.charts.Polar.prototype['line'] = anychart.charts.Polar.prototype.line;
anychart.charts.Polar.prototype['marker'] = anychart.charts.Polar.prototype.marker;
anychart.charts.Polar.prototype['palette'] = anychart.charts.Polar.prototype.palette;
anychart.charts.Polar.prototype['markerPalette'] = anychart.charts.Polar.prototype.markerPalette;
anychart.charts.Polar.prototype['startAngle'] = anychart.charts.Polar.prototype.startAngle;
