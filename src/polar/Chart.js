goog.provide('anychart.polar.Chart');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.Chart');
goog.require('anychart.elements.PolarAxis');
goog.require('anychart.elements.PolarGrid');
goog.require('anychart.elements.RadialAxis');
goog.require('anychart.enums');
goog.require('anychart.polar.series.Base');
goog.require('anychart.scales');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.HatchFillPalette');
goog.require('anychart.utils.MarkerPalette');
goog.require('anychart.utils.OrdinalIterator');
goog.require('anychart.utils.RangeColorPalette');



/**
 * Cartesian chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.cartesianChart}</li>
 *      <li>{@link anychart.areaChart}</li>
 *      <li>{@link anychart.barChart}</li>
 *      <li>{@link anychart.columnChart}</li>
 *      <li>{@link anychart.financialChart}</li>
 *      <li>{@link anychart.lineChart}</li>
 *  </ul>
 * Chart can contain any number of series.
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.Chart}
 * @constructor
 */
anychart.polar.Chart = function() {
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
   * @type {!Array.<anychart.polar.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * @type {Array.<anychart.elements.PolarGrid>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.elements.PolarGrid>}
   * @private
   */
  this.minorGrids_ = [];

  /**
   * Palette for series colors.
   * @type {anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette}
   * @private
   */
  this.palette_ = null;

  /**
   * @type {anychart.utils.MarkerPalette}
   * @private
   */
  this.markerPalette_ = null;

  /**
   * @type {anychart.utils.HatchFillPalette}
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
  var legend = /** @type {anychart.elements.Legend} */ (this.legend());
  legend.listen(anychart.enums.EventType.LEGEND_ITEM_CLICK, function(event) {
    // function that enables or disables series by index of clicked legend item

    var cartesianChart = /** @type {anychart.polar.Chart} */ (this);
    var index = event['index'];
    var series = cartesianChart.getSeries(index);
    if (series) {
      series.enabled(!series.enabled());
    }

  }, false, this);

};
goog.inherits(anychart.polar.Chart, anychart.Chart);


/**
 * @type {string}
 */
anychart.polar.Chart.CHART_TYPE = 'radar';
anychart.chartTypesMap[anychart.polar.Chart.CHART_TYPE] = anychart.polar.Chart;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.Chart states.
 * @type {number}
 */
anychart.polar.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
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
anychart.polar.Chart.ZINDEX_GRID = 10;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.polar.Chart.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.polar.Chart.ZINDEX_LINE_SERIES = 31;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.polar.Chart.ZINDEX_AXIS = 35;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.polar.Chart.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.polar.Chart.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.polar.Chart.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.polar.Chart)} .
 */
anychart.polar.Chart.prototype.startAngle = function(opt_value) {
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
 * @return {!(anychart.scales.ScatterBase|anychart.polar.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.polar.Chart.prototype.xScale = function(opt_value) {
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
 * @return {!(anychart.scales.Base|anychart.polar.Chart)} Default chart scale value or itself for method chaining.
 */
anychart.polar.Chart.prototype.yScale = function(opt_value) {
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
 * @param {anychart.elements.PolarGrid} item Item to set scale.
 * @private
 */
anychart.polar.Chart.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
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
 * @param {(number|anychart.elements.PolarGrid|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.elements.PolarGrid|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.elements.PolarGrid|anychart.polar.Chart)} Grid instance by index or itself for method chaining.
 */
anychart.polar.Chart.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.elements.PolarGrid();
    grid.zIndex(anychart.polar.Chart.ZINDEX_GRID);
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.PolarGrid) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.polar.Chart.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.polar.Chart.ZINDEX_GRID);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * @param {(number|anychart.elements.PolarGrid|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.elements.PolarGrid|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.elements.PolarGrid|anychart.polar.Chart)} Grid instance by index or itself for method chaining.
 */
anychart.polar.Chart.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.elements.PolarGrid();
    grid.zIndex(anychart.polar.Chart.ZINDEX_GRID);
    grid.isMinor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.elements.PolarGrid) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.polar.Chart.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.polar.Chart.ZINDEX_GRID);
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
anychart.polar.Chart.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {(anychart.elements.PolarAxis|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.elements.PolarAxis|anychart.polar.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.polar.Chart.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = new anychart.elements.PolarAxis();
    this.xAxis_.zIndex(anychart.polar.Chart.ZINDEX_AXIS);
    this.registerDisposable(this.xAxis_);
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.PolarAxis) {
      this.xAxis_.deserialize(opt_value.serialize());
      if (this.xAxis_.zIndex() == 0) this.xAxis_.zIndex(anychart.polar.Chart.ZINDEX_AXIS);
    } else if (goog.isObject(opt_value)) {
      this.xAxis_.deserialize(opt_value);
      if (this.xAxis_.zIndex() == 0) this.xAxis_.zIndex(anychart.polar.Chart.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(opt_value)) {
      this.xAxis_.enabled(false);
    }
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 * @param {(anychart.elements.RadialAxis|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.elements.RadialAxis|anychart.polar.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.polar.Chart.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.elements.RadialAxis();
    this.yAxis_.zIndex(anychart.polar.Chart.ZINDEX_AXIS);
    this.registerDisposable(this.yAxis_);
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.RadialAxis) {
      this.yAxis_.deserialize(opt_value.serialize());
      if (this.yAxis_.zIndex() == 0) this.yAxis_.zIndex(anychart.polar.Chart.ZINDEX_AXIS);
    } else if (goog.isObject(opt_value)) {
      this.yAxis_.deserialize(opt_value);
      if (this.yAxis_.zIndex() == 0) this.yAxis_.zIndex(anychart.polar.Chart.ZINDEX_AXIS);
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
anychart.polar.Chart.prototype.onAxisSignal_ = function(event) {
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
 * var chart = anychart.cartesianChart();
 * chart.area([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.polar.series.Base} {@link anychart.polar.series.Area} instance for method chaining.
 */
anychart.polar.Chart.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.PolarSeriesType.AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @example
 * var chart = anychart.cartesianChart();
 * chart.line([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.polar.series.Base} {@link anychart.polar.series.Line} instance for method chaining.
 */
anychart.polar.Chart.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.PolarSeriesType.LINE,
      data,
      opt_csvSettings,
      anychart.polar.Chart.ZINDEX_LINE_SERIES
  );
};


/**
 * Adds Marker series.
 * @example
 * var chart = anychart.cartesianChart();
 * chart.marker([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.polar.series.Base} {@link anychart.polar.series.Marker} instance for method chaining.
 */
anychart.polar.Chart.prototype.marker = function(data, opt_csvSettings) {
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
 * @return {anychart.polar.series.Base}
 */
anychart.polar.Chart.prototype.createSeriesByType_ = function(type, data, opt_csvSettings, opt_zIndex) {
  var ctl = anychart.polar.series.Base.SeriesTypesMap[/** @type {anychart.enums.PolarSeriesType} */(type)];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    this.registerDisposable(instance);
    this.series_.push(instance);
    var index = this.series_.length - 1;
    var inc = index * anychart.polar.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index);
    instance.setAutoZIndex((goog.isDef(opt_zIndex) ? opt_zIndex : anychart.polar.Chart.ZINDEX_SERIES) + inc);
    var markerType = /** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(this.series_.length - 1));
    if (instance.hasMarkers()) {
      instance.markers().setAutoZIndex(anychart.polar.Chart.ZINDEX_MARKER + inc);
      instance.markers().setAutoType(markerType);
    } else {
      // this else would be only if instance is Marker series
      instance.type(markerType);
    }
    instance.labels().setAutoZIndex(anychart.polar.Chart.ZINDEX_LABEL + inc + anychart.polar.Chart.ZINDEX_INCREMENT_MULTIPLIER / 2);
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
 * var chart = anychart.lineChart.apply(this, data);
 * var series, i=0;
 * while (series = chart.getSeries(i)){
 *     series.markers().type('circle');
 *     i++;
 * }
 * chart.container(stage).draw();
 * @param {number} index
 * @return {anychart.polar.series.Base}
 */
anychart.polar.Chart.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.polar.Chart.prototype.seriesInvalidated_ = function(event) {
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
 * @return {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)} Current palette.
 *//**
 * Setter for series colors palette.
 * @example <t>lineChart</t>
 * chart = anychart.lineChart();
 * chart.palette(['red', 'green', 'blue']);
 * chart.line([1, -4, 5, 7]);
 * chart.line([11, 0, 15, 4]);
 * chart.line([21, -4, 9, 0]);
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value Value to set.
 * @return {!anychart.polar.Chart} {@link anychart.polar.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|Array)=} opt_value .
 * @return {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette|anychart.polar.Chart)} .
 */
anychart.polar.Chart.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.utils.RangeColorPalette) {
    this.setupPalette_(anychart.utils.RangeColorPalette, opt_value);
    return this;
  } else if (opt_value instanceof anychart.utils.DistinctColorPalette) {
    this.setupPalette_(anychart.utils.DistinctColorPalette, opt_value);
    return this;
  }

  if (!this.palette_)
    this.setupPalette_(anychart.utils.DistinctColorPalette);

  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value))
      this.palette_.colors(opt_value);
    else if (goog.isNull(opt_value))
      this.palette_.cloneFrom(opt_value);
    else
      return this;
    return this;
  }
  return /** @type {!(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)} */(this.palette_);
};


/**
 * Chart markers palette settings.
 * @param {(Array.<anychart.enums.MarkerType>|Object|anychart.utils.MarkerPalette)=} opt_value Chart marker palette settings to set.
 * @return {anychart.utils.MarkerPalette|anychart.polar.Chart} Return current chart markers palette or itself for chaining call.
 */
anychart.polar.Chart.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.utils.MarkerPalette();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.MarkerPalette) {
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
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.utils.HatchFillPalette)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {anychart.utils.HatchFillPalette|anychart.polar.Chart} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.polar.Chart.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.utils.HatchFillPalette();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.utils.HatchFillPalette) {
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
 * @param {(anychart.utils.RangeColorPalette|anychart.utils.DistinctColorPalette)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.polar.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
anychart.polar.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.polar.Chart.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKER_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.polar.Chart.prototype.hatchFillPaletteInvalidated_ = function(event) {
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
anychart.polar.Chart.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.polar.series.Base>} */
  var series;
  /** @type {anychart.polar.series.Base} */
  var aSeries;
  /** @type {anychart.data.Iterator} */
  var iterator;
  /** @type {number} */
  var id;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
    anychart.Base.suspendSignalsDispatching(this.series_);

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

    anychart.Base.resumeSignalsDispatchingTrue(this.series_);

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
anychart.polar.Chart.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();

  if (this.isConsistent())
    return;

  anychart.Base.suspendSignalsDispatching(this.series_, this.xAxis_, this.yAxis_);

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
      series.pixelBounds(this.dataBounds_);
    }

    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
  }

  anychart.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxis_, this.yAxis_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.polar.Chart.prototype.drawSeries_ = function() {
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
anychart.polar.Chart.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.polar.Chart.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.elements.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.polar.series.Base} */
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
anychart.polar.Chart.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');
};


/**
 * @inheritDoc
 */
anychart.polar.Chart.prototype.deserialize = function(config) {
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
anychart.polar.Chart.prototype.serialize = function() {
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

  chart['type'] = anychart.polar.Chart.CHART_TYPE;

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


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.areaChart}</li>
 *      <li>{@link anychart.barChart}</li>
 *      <li>{@link anychart.columnChart}</li>
 *      <li>{@link anychart.financialChart}</li>
 *      <li>{@link anychart.lineChart}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesianChart();
 * chart.line([20, 7, 10, 14]);
 * @return {!anychart.polar.Chart} Empty chart.
 */
anychart.polarChart = function() {
  var chart = new anychart.polar.Chart();

  chart.title().enabled(true);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  chart.xAxis();
  chart.yAxis();
  chart.grid(0).layout(anychart.enums.RadialGridLayout.CIRCUIT);
  chart.grid(1).layout(anychart.enums.RadialGridLayout.RADIAL);

  return chart;
};


//exports
goog.exportSymbol('anychart.polarChart', anychart.polarChart);
anychart.polar.Chart.prototype['xScale'] = anychart.polar.Chart.prototype.xScale;
anychart.polar.Chart.prototype['yScale'] = anychart.polar.Chart.prototype.yScale;
anychart.polar.Chart.prototype['grid'] = anychart.polar.Chart.prototype.grid;
anychart.polar.Chart.prototype['minorGrid'] = anychart.polar.Chart.prototype.minorGrid;
anychart.polar.Chart.prototype['xAxis'] = anychart.polar.Chart.prototype.xAxis;
anychart.polar.Chart.prototype['yAxis'] = anychart.polar.Chart.prototype.yAxis;
anychart.polar.Chart.prototype['getSeries'] = anychart.polar.Chart.prototype.getSeries;
anychart.polar.Chart.prototype['area'] = anychart.polar.Chart.prototype.area;
anychart.polar.Chart.prototype['line'] = anychart.polar.Chart.prototype.line;
anychart.polar.Chart.prototype['marker'] = anychart.polar.Chart.prototype.marker;
anychart.polar.Chart.prototype['palette'] = anychart.polar.Chart.prototype.palette;
anychart.polar.Chart.prototype['markerPalette'] = anychart.polar.Chart.prototype.markerPalette;
anychart.polar.Chart.prototype['startAngle'] = anychart.polar.Chart.prototype.startAngle;
