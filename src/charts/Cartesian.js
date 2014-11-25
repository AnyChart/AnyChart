goog.provide('anychart.charts.Cartesian');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.Chart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.cartesian.series.Base');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.utils.OrdinalIterator');
goog.require('anychart.core.utils.ScatterIterator');
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
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 */
anychart.charts.Cartesian = function(opt_barChartMode) {
  goog.base(this);

  /**
   * If true, all default chart elements layout is swapped.
   * @type {boolean}
   */
  this.barChartMode = !!opt_barChartMode;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_ = null;

  /**
   * @type {!Array.<anychart.core.cartesian.series.Base>}
   * @private
   */
  this.series_ = [];

  /**
   * @type {!Array.<anychart.core.axes.Linear>}
   * @private
   */
  this.xAxes_ = [];

  /**
   * @type {!Array.<anychart.core.axes.Linear>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Line>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>}
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
   * @type {acgraph.math.Rect}
   * @private
   */
  this.dataBounds_ = null;

  /**
   * @type {number}
   * @private
   */
  this.barGroupsPadding_ = 0.5;

  /**
   * @type {number}
   * @private
   */
  this.barsPadding_ = 0.1;

  // Add handler to listen legend item click for legend and enable/disable series.
  var legend = /** @type {anychart.core.ui.Legend} */ (this.legend());
  legend.listen(anychart.enums.EventType.LEGEND_ITEM_CLICK, function(event) {
    // function that enables or disables series by index of clicked legend item

    var cartesianChart = /** @type {anychart.charts.Cartesian} */ (this);
    var index = event['index'];
    var series = cartesianChart.getSeries(index);
    if (series) {
      series.enabled(!series.enabled());
    }

  }, false, this);

};
goog.inherits(anychart.charts.Cartesian, anychart.core.Chart);


/**
 * @type {string}
 */
anychart.charts.Cartesian.CHART_TYPE = 'cartesian';
anychart.chartTypesMap[anychart.charts.Cartesian.CHART_TYPE] = anychart.charts.Cartesian;


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @private
 */
anychart.charts.Cartesian.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.Chart states.
 * @type {number}
 */
anychart.charts.Cartesian.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.PALETTE |
    anychart.ConsistencyState.MARKER_PALETTE |
    anychart.ConsistencyState.HATCH_FILL_PALETTE |
    anychart.ConsistencyState.SCALES |
    anychart.ConsistencyState.SERIES |
    anychart.ConsistencyState.AXES |
    anychart.ConsistencyState.AXES_MARKERS |
    anychart.ConsistencyState.GRIDS;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_GRID = 10;


/**
 * Axis range marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_AXIS_RANGE_MARKER = 25.1;


/**
 * Axis line marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_AXIS_LINE_MARKER = 25.2;


/**
 * Axis text marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_AXIS_TEXT_MARKER = 25.3;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_LINE_SERIES = 31;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_AXIS = 35;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for default chart X scale.
 * @return {!anychart.scales.Base} Default chart scale value.
 *//**
 * Setter for default chart X scale.<br/>
 * <b>Note:</b> This scale will be passed to all scale dependent chart elements if they don't have their own scales.
 * @example
 * var chart = anychart.cartesian();
 * chart.line([
 *   {x: "10-Dec-2004", y: 20},
 *   {x: "11-Dec-2004", y: 40},
 *   {x: "12-Dec-2004", y: 30}
 * ]);
 * chart.xScale(anychart.scales.dateTime());
 * chart.xAxis().labels()
 *     .textFormatter(function(point){ return new Date(point.value).toDateString();});
 * chart.yAxis();
 * chart.container(stage).draw();
 * @param {anychart.scales.Base=} opt_value X Scale to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Cartesian)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    if (!this.xScale_) {
      this.xScale_ = new anychart.scales.Ordinal();
    }
    return this.xScale_;
  }
};


/**
 * Getter for default chart Y scale.
 * @return {!anychart.scales.Base} Default chart scale value.
 *//**
 * Setter for chart Y scale.<br/>
 * <b>Note:</b> This scale will be passed to all scale dependent chart elements if they don't have their own scales.
 * @example
 * var chart = anychart.cartesian();
 * chart.line([0.07, 0.9, 14, 2, 89]);
 * chart.yScale(anychart.scales.log());
 * chart.xAxis();
 * chart.yAxis();
 * chart.container(stage).draw();
 * @param {anychart.scales.Base=} opt_value Y Scale to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Cartesian)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.yScale = function(opt_value) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Scale map properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {!Object.<!Array.<anychart.core.cartesian.series.Base>>}
 * @private
 */
anychart.charts.Cartesian.prototype.seriesOfStackedScaleMap_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.charts.Cartesian.prototype.yScales_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @private
 */
anychart.charts.Cartesian.prototype.xScales_;


/**
 * @type {!Object.<!Array.<anychart.core.cartesian.series.Base>>}
 * @private
 */
anychart.charts.Cartesian.prototype.seriesOfXScaleMap_;


/**
 * @type {!Object.<!Array.<anychart.core.cartesian.series.Base>>}
 * @private
 */
anychart.charts.Cartesian.prototype.seriesOfYScaleMap_;


/**
 * Sets default scale for layout based element depending on barChartMode.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.grids.Linear} item Item to set scale.
 * @private
 */
anychart.charts.Cartesian.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (!!(item.isHorizontal() ^ this.barChartMode)) {
    item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
  } else {
    item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Grids.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart grid.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid()
 *     .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid()
 *     .oddFill('none')
 *     .evenFill('none')
 *     .layout(anychart.enums.Layout.VERTICAL);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart grid index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.grids.Linear} Axis instance by index.
 *//**
 * Setter for chart grid.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * var myGrid = anychart.grids.linear()
 *    .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid(myGrid);
 * chart.container(stage).draw();
 * @param {(anychart.core.grids.Linear|Object)=} opt_value Chart grid settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * Setter for chart grid by index.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid(0)
 *     .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid(1)
 *     .oddFill('none')
 *     .evenFill('red 0.1')
 *     .layout(anychart.enums.Layout.VERTICAL);
 * chart.container(stage).draw();
 * chart.grid(1, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart grid index.
 * @param {(anychart.core.grids.Linear|Object|string|null)=} opt_value Chart grid settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.grids.Linear|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.core.grids.Linear|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.Cartesian)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Linear();
    grid.layout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(anychart.charts.Cartesian.ZINDEX_GRID);
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.grids.Linear) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Cartesian.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Cartesian.ZINDEX_GRID);
    } else if (anychart.utils.isNone(value)) {
      grid.enabled(false);
    }
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter for chart minor grid.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid()
 *     .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid()
 *     .oddFill('none')
 *     .evenFill('none')
 *     .layout(anychart.enums.Layout.VERTICAL);
 * chart.minorGrid()
 *    .oddFill('none')
 *    .evenFill('none')
 *    .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart minor grid index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.grids.Linear} Axis instance by index.
 *//**
 * Setter for chart minor grid.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * var myGrid = anychart.grids.linear()
 *    .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid(myGrid);
 * myGrid.oddFill('none')
 *    .evenFill('none')
 *    .layout(anychart.enums.Layout.HORIZONTAL).isMinor(true);
 * chart.minorGrid(myGrid)
 * chart.container(stage).draw();
 * @param {(anychart.core.grids.Linear|Object)=} opt_value Chart minor grid settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * Setter for chart minor grid by index.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.grid(0)
 *     .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.minorGrid(0)
 *     .oddFill('none')
 *     .evenFill('red')
 *     .layout(anychart.enums.Layout.VERTICAL);
 * chart.minorGrid(1)
 *    .oddFill('none')
 *    .evenFill('none')
 *    .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.container(stage).draw();
 * chart.minorGrid(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart minor grid index.
 * @param {(anychart.core.grids.Linear|Object|string|null)=} opt_value Chart minor grid settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.grids.Linear|Object|string|null)=} opt_indexOrValue Minor grid settings.
 * @param {(anychart.core.grids.Linear|Object|string|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.Cartesian)} Minor grid instance by index or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Linear();
    grid.layout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(anychart.charts.Cartesian.ZINDEX_GRID);
    grid.isMinor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.grids.Linear) {
      grid.deserialize(value.serialize());
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Cartesian.ZINDEX_GRID);
    } else if (goog.isObject(value)) {
      grid.deserialize(value);
      if (grid.zIndex() == 0) grid.zIndex(anychart.charts.Cartesian.ZINDEX_GRID);
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
anychart.charts.Cartesian.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart X-axis.
 * @param {(string|number)=} opt_index Chart axis index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axes.Linear} Axis instance by index.
 *//**
 * Setter for chart X-axis.
 * @example
 * var chart = anychart.cartesian();
 * chart.bar([1, 4, 5, 7, 2]);
 * var myAxis = anychart.axes.linear()
 *    .orientation('right')
 *    .title().text('my custom sAxis');
 * chart.xAxis(myAxis);
 * chart.container(stage).draw();
 * @param {(anychart.core.axes.Linear|Object)=} opt_value Chart axis settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * Setter for chart X-axis by index.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.xAxis(0)
 *    .orientation('top')
 *    .title(null);
 * chart.xAxis(1)
 *    .orientation('bottom')
 *    .title('X-Axis');
 * chart.xAxis(2)
 *    .orientation('right')
 *    .title(null);
 * chart.xAxis(1, null);
 * chart.xAxis(2, 'None');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axes.Linear|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.Cartesian)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.xAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var axis = this.xAxes_[index];
  if (!axis) {
    axis = new anychart.core.axes.Linear();
    axis.orientation(this.barChartMode ? anychart.enums.Orientation.LEFT : anychart.enums.Orientation.BOTTOM);
    axis.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS);
    axis.title().text('X-Axis');
    this.xAxes_[index] = axis;
    this.restoreDefaultsForAxis(axis);
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.axes.Linear) {
      axis.deserialize(value.serialize());
      if (axis.zIndex() == 0) axis.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS);
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
      if (axis.zIndex() == 0) axis.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * Getter for chart Y-axis.
 * @param {(string|number)=} opt_index Chart axis index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axes.Linear} Axis instance by index.
 *//**
 * Setter for chart Y-axis.
 * @example
 * var chart = anychart.cartesian();
 * chart.bar([1, 4, 5, 7, 2]);
 * var myAxis = anychart.axes.linear()
 *    .orientation('left')
 *    .title().text('my custom Axis');
 * chart.yAxis(myAxis);
 * chart.container(stage).draw();
 * @param {(anychart.core.axes.Linear|Object)=} opt_value Chart axis settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} class for method chaining.
 *//**
 * Setter for chart Y-axis by index.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([1, 4, 5, 7, 2]);
 * chart.yAxis(0)
 *    .orientation('right')
 *    .title(null);
 * chart.yAxis(1)
 *    .orientation('right')
 *    .stroke('blue')
 *    .title('Y-Axis');
 * chart.yAxis(2)
 *    .orientation('bottom')
 *    .title(null);
 * chart.yAxis(2, 'None');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axes.Linear|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.Cartesian)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.yAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var axis = this.yAxes_[index];
  if (!axis) {
    axis = new anychart.core.axes.Linear();
    axis.staggerMode(false);
    axis.orientation(this.barChartMode ? anychart.enums.Orientation.BOTTOM : anychart.enums.Orientation.LEFT);
    axis.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS);
    axis.title().text('Y-Axis');
    this.yAxes_[index] = axis;
    this.restoreDefaultsForAxis(axis);
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.axes.Linear) {
      axis.deserialize(value.serialize());
      if (axis.zIndex() == 0) axis.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS);
    } else if (goog.isObject(value)) {
      axis.deserialize(value);
      if (axis.zIndex() == 0) axis.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS);
    } else if (anychart.utils.isNone(value)) {
      axis.enabled(false);
    }
    return this;
  } else {
    return axis;
  }
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Cartesian.prototype.onAxisSignal_ = function(event) {
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
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for chart line marker.
 * @param {(string|number)=} opt_index Chart line marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axisMarkers.Line} Line marker instance by index.
 *//**
 * Setter for chart line marker.
 * @example <t>lineChart</t>
 * chart.line([1, -4, 5, 7, 7]);
 * var lineMarker = anychart.axisMarkers.line()
 *     .value(5.5)
 *     .stroke('2 red')
 *     .layout('horizontal');
 * chart.lineMarker(lineMarker);
 * @param {(anychart.core.axisMarkers.Line|Object)=} opt_value Chart line marker settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * Setter for chart line marker by index.
 * @example <t>lineChart</t>
 * chart.spline([1, -4, 5, 7, 7]);
 * chart.lineMarker();
 * chart.lineMarker(1).value(2).stroke('green');
 * //turn off first marker
 * chart.lineMarker(0, null);
 * @param {(string|number)=} opt_index Chart line marker index.
 * @param {(anychart.core.axisMarkers.Line|Object|string|null)=} opt_value Chart line marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker</b>.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axisMarkers.Line|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.core.axisMarkers.Line|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.charts.Cartesian)} Line marker instance by index or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.core.axisMarkers.Line();
    lineMarker.layout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    lineMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_LINE_MARKER);
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.axisMarkers.Line) {
      lineMarker.deserialize(value.serialize());
      if (lineMarker.zIndex() == 0) lineMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_LINE_MARKER);
    } else if (goog.isObject(value)) {
      lineMarker.deserialize(value);
      if (lineMarker.zIndex() == 0) lineMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_LINE_MARKER);
    } else if (anychart.utils.isNone(value)) {
      lineMarker.enabled(false);
    }
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Getter for chart range marker.
 * @param {(string|number)=} opt_index Chart range marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axisMarkers.Range} Range marker instance by index.
 *//**
 * Setter for chart range marker.
 * @example <t>lineChart</t>
 * chart.line([1, -4, 5, 7, 7]);
 * var rangeMarker = anychart.axisMarkers.range()
 *     .from(2.5)
 *     .to(5.5)
 *     .fill('blue .1');
 * chart.rangeMarker(rangeMarker);
 * @param {(anychart.core.axisMarkers.Range|Object)=} opt_value Chart range marker settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * Setter for chart range marker by index.
 * @example <t>lineChart</t>
 * chart.column([1, -4, 5, 7, 7]);
 * chart.rangeMarker(0).from(5).to(10).fill('orange 0.2');
 * chart.rangeMarker(1).from(-5).to(2).fill('green 0.2');
 * // turn off red marker.
 * chart.rangeMarker(0, null);
 * @param {(string|number)=} opt_index Chart range marker index.
 * @param {(anychart.core.axisMarkers.Range|Object|string|null)=} opt_value Chart range marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable to disable marker.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axisMarkers.Range|Object|string|null)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(anychart.core.axisMarkers.Range|Object|string|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.charts.Cartesian)} Range marker instance by index or itself for chaining call.
 */
anychart.charts.Cartesian.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.core.axisMarkers.Range();
    rangeMarker.layout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    rangeMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_RANGE_MARKER);
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.axisMarkers.Range) {
      rangeMarker.deserialize(value.serialize());
      if (rangeMarker.zIndex() == 0) rangeMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_RANGE_MARKER);
    } else if (goog.isObject(value)) {
      rangeMarker.deserialize(value);
      if (rangeMarker.zIndex() == 0) rangeMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_RANGE_MARKER);
    } else if (anychart.utils.isNone(value)) {
      rangeMarker.enabled(false);
    }
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter for chart text marker.
 * @param {(string|number)=} opt_index Chart text marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axisMarkers.Text} Text marker instance by index.
 *//**
 * Setter for chart text marker.
 * @example <t>lineChart</t>
 * chart.line([1, -4, 5, 7, 7]);
 * var txtMarker = anychart.axisMarkers.text()
 *     .text('Marker')
 *     .value(3.3)
 *     .align(anychart.enums.Align.LEFT)
 *     .anchor(anychart.enums.Anchor.LEFT_BOTTOM);
 * chart.textMarker(txtMarker);
 * chart.lineMarker().value(3.3);
 * @param {(anychart.core.axisMarkers.Text|Object)=} opt_value Chart text marker settings to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * Setter for chart text marker by index.
 * @example <t>lineChart</t>
 * chart.spline([1, -4, 5, 7, 7]);
 * chart.textMarker(0).value(6).text('Marker 0');
 * chart.textMarker(1).value(2).text('Marker 1');
 * // turn off first marker
 * chart.textMarker(0, null);
 * @param {(string|number)=} opt_index Chart text marker index.
 * @param {(anychart.core.axisMarkers.Text|Object|string|null)=} opt_value Chart text marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axisMarkers.Text|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.core.axisMarkers.Text|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.charts.Cartesian)} Line marker instance by index or itself for chaining call.
 */
anychart.charts.Cartesian.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = opt_indexOrValue;
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.core.axisMarkers.Text();
    textMarker.layout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    textMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_TEXT_MARKER);
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    if (value instanceof anychart.core.axisMarkers.Text) {
      textMarker.deserialize(value.serialize());
      if (textMarker.zIndex() == 0) textMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_TEXT_MARKER);
    } else if (goog.isObject(value)) {
      textMarker.deserialize(value);
      if (textMarker.zIndex() == 0) textMarker.zIndex(anychart.charts.Cartesian.ZINDEX_AXIS_TEXT_MARKER);
    } else if (anychart.utils.isNone(value)) {
      textMarker.enabled(false);
    }
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.Cartesian.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
///**
// * Do nothing.
// * @param {*=} opt_value Do nothing.
// */
//anychart.charts.Cartesian.prototype.tooltip = function(opt_value) {
//  //todo:implement in 21 sprint
//};


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
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Area} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Bar series.
 * @example
 * var chart = anychart.cartesian();
 * chart.bar([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Bar} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.bar = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.BAR,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Bubble series.
 * @example
 * var chart = anychart.cartesian();
 * chart.bubble([
 *   [0, 4, 10],
 *   [1, 5, 6],
 *   [2, 6, 17],
 *   [3, 7, 20]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Bubble} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.BUBBLE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Candlestick series.
 * @example
 * var chart = anychart.cartesian();
 * chart.candlestick([
 *   [0, 14, 24, 14, 20],
 *   [1, 15, 15, 5, 10],
 *   [2, 16, 16, 6, 1],
 *   [3, 7, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Candlestick} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.candlestick = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.CANDLESTICK,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Column series.
 * @example
 * var chart = anychart.cartesian();
 * chart.column([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Column} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.column = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.COLUMN,
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
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Line} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.LINE,
      data,
      opt_csvSettings,
      anychart.charts.Cartesian.ZINDEX_LINE_SERIES
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
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Marker} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.MARKER,
      data,
      opt_csvSettings
  );
};


/**
 * Adds OHLC series.
 * @example
 * var chart = anychart.cartesian();
 * chart.ohlc([
 *   [0, 14, 24, 14, 20],
 *   [1, 15, 15, 5, 10],
 *   [2, 16, 16, 6, 1],
 *   [3, 7, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.OHLC} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.ohlc = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.OHLC,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeArea series.
 * @example
 * var chart = anychart.cartesian();
 * chart.rangeArea([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.RangeArea} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.rangeArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.RANGE_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeBar series.
 * @example
 * var chart = anychart.cartesian();
 * chart.rangeBar([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.RangeBar} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.rangeBar = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.RANGE_BAR,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeColumn series.
 * @example
 * var chart = anychart.cartesian();
 * chart.rangeColumn([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.RangeColumn} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.rangeColumn = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.RANGE_COLUMN,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeSplineArea series.
 * @example
 * var chart = anychart.cartesian();
 * chart.rangeSplineArea([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.RangeSplineArea} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.rangeSplineArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds RangeColumn series.
 * @example
 * var chart = anychart.cartesian();
 * chart.rangeStepArea([
 *   [0,  24, 14, 20],
 *   [1,  15, 5, 10],
 *   [2,  16, 6, 1],
 *   [3, 17, 1, 10]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.RangeColumn} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.rangeStepArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.RANGE_STEP_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Spline series.
 * @example
 * var chart = anychart.cartesian();
 * chart.spline([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Spline} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.spline = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.SPLINE,
      data,
      opt_csvSettings,
      anychart.charts.Cartesian.ZINDEX_LINE_SERIES
  );
};


/**
 * Adds SplineArea series.
 * @example
 * var chart = anychart.cartesian();
 * chart.splineArea([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.SplineArea} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.splineArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.SPLINE_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Adds StepLine series.
 * @example
 * var chart = anychart.cartesian();
 * chart.stepLine([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.StepLine} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.stepLine = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.STEP_LINE,
      data,
      opt_csvSettings,
      anychart.charts.Cartesian.ZINDEX_LINE_SERIES
  );
};


/**
 * Adds StepArea series.
 * @example
 * var chart = anychart.cartesian();
 * chart.stepArea([10, 4, 17, 20]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.StepArea} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.stepArea = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.CartesianSeriesType.STEP_AREA,
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
 * @return {anychart.core.cartesian.series.Base}
 */
anychart.charts.Cartesian.prototype.createSeriesByType_ = function(type, data, opt_csvSettings, opt_zIndex) {
  var ctl = anychart.core.cartesian.series.Base.SeriesTypesMap[/** @type {anychart.enums.CartesianSeriesType} */(type)];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    this.registerDisposable(instance);
    this.series_.push(instance);
    var index = this.series_.length - 1;
    var inc = index * anychart.charts.Cartesian.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index);
    instance.setAutoZIndex((goog.isDef(opt_zIndex) ? opt_zIndex : anychart.charts.Cartesian.ZINDEX_SERIES) + inc);
    if (instance.hasMarkers())
      instance.markers().setAutoZIndex(anychart.charts.Cartesian.ZINDEX_MARKER + inc);
    instance.labels().setAutoZIndex(anychart.charts.Cartesian.ZINDEX_LABEL + inc + anychart.charts.Cartesian.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.clip(true);
    instance.setAutoColor(this.palette().colorAt(this.series_.length - 1));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(this.series_.length - 1)));
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
 * @return {anychart.core.cartesian.series.Base}
 */
anychart.charts.Cartesian.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Cartesian.prototype.seriesInvalidated_ = function(event) {
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
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for space between bar groups on the ordinal scale by ratio of bars width.
 * @return {number} Current bar groups padding.
 *//**
 * Setter for space between bar groups on the ordinal scale by ratio of bars width.<br/>
 * See illustration at {@link anychart.charts.Cartesian#barsPadding}.
 * @example
 * chart = anychart.bar([4, 2, 8], [4, 2, 8]);
 * chart.barGroupsPadding(.1);
 * chart.container(stage).draw();
 * @param {number=} opt_value [0.1] Value to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.charts.Cartesian} .
 */
anychart.charts.Cartesian.prototype.barGroupsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barGroupsPadding_ != +opt_value) {
      this.barGroupsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barGroupsPadding_;
};


/**
 * Getter for space between bars on the ordinal scale by ratio of bars width.
 * @return {number} Current bars padding.
 *//**
 * Setter for space between bars on the ordinal scale by ratio of bars width.
 * @illustration <t>illustration</t>
 * chart = anychart.cartesian();
 * chart.bar([1, 4, 5]);
 * chart.bar([1, 4, 5]);
 * chart.barsPadding(.6);
 * chart.barGroupsPadding(.6);
 * chart.container(stage).draw();
 * var rect = layer.rect(1, 5, 325, 89).fill('none').stroke('grey', 2, '3 5');
 * layer.text(335, 72, 'bars group');
 * layer.path()
 *     .moveTo(325, 68).lineTo(335, 68).stroke(rect.stroke());
 * layer.text(330, 145, 'barsPadding');
 * layer.circle(200, 150, 6);
 * layer.path()
 *     .moveTo(208, 150).lineTo(325, 150).stroke(rect.stroke());
 * layer.text(300, 195, 'barGroupsPadding');
 * layer.circle(70, 200, 6);
 * layer.path()
 *     .moveTo(76, 200).lineTo(295, 200).stroke(rect.stroke());
 * @example
 * chart = anychart.bar([4, 2, 8], [4, 2, 8]);
 * chart.barsPadding(.8);
 * chart.container(stage).draw();
 * @param {number=} opt_value [0.1] Value to set.
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.charts.Cartesian} .
 */
anychart.charts.Cartesian.prototype.barsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barsPadding_ != +opt_value) {
      this.barsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barsPadding_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate cartesian chart properties.
 */
anychart.charts.Cartesian.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {number} */
  var j;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.core.cartesian.series.Base>} */
  var series;
  /** @type {anychart.core.cartesian.series.Base} */
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
  /** @type {Object.<!Array.<anychart.core.cartesian.series.Base>>} */
  var xScales;
  /** @type {anychart.core.utils.ScatterIterator} */
  var syncIterator;
  /** @type {Array.<*>} */
  var values;
  /** @type {*} */
  var value;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
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
      for (i = 0; i < series.length; i++)
        series[i].resetCategorisation();
      // we can crash or warn user here if the scale is stacked, if we want.
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        for (i = 0; i < series.length; i++) {
          aSeries = series[i];
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
      for (i = 0; i < series.length; i++)
        series[i].categoriseData(categories);
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
          if (aSeries.supportsStack()) {
            iterator = aSeries.getResetIterator();
            while (iterator.advance()) {
              values = aSeries.getReferenceScaleValues();
              if (values) {
                for (var k = values.length; k--;) {
                  if ((/** @type {number} */(values[k])) > 0)
                    hasPositive = true;
                  else if ((/** @type {number} */(values[k])) < 0)
                    hasNegative = true;
                }
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
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            values = aSeries.getReferenceScaleValues();
            if (values)
              scale.extendDataRange.apply(scale, values);
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
              var values = series.getReferenceScaleValues();
              var i;
              if (values) {
                if (series.supportsStack()) {
                  for (i = values.length; i--;)
                    this.extendDataRange(this.applyStacking(values[i]));
                } else {
                  for (i = values.length; i--;)
                    this.extendDataRange(values[i]);
                }
              }
            }, scale);
        var beforePointCallback = goog.bind(
            function() {
              this.resetStack();
            }, scale);
        if (goog.isArray(cats)) {
          syncIterator = new anychart.core.utils.OrdinalIterator(xScales[xId], /** @type {!Array} */(cats),
              pointCallback, null, beforePointCallback);
        } else {
          syncIterator = new anychart.core.utils.ScatterIterator(xScales[xId], /** @type {boolean} */(cats),
              pointCallback, null, beforePointCallback);
        }
        while (syncIterator.advance()) {
        }
      }
    }

    // calculate auto names for scales with predefined names field
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
    this.scalesFinalization_ = true;
  }
};


/**
 * Prepares scale maps.
 * @private
 */
anychart.charts.Cartesian.prototype.makeScaleMaps_ = function() {
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
  var item;
  var series;

  //search for scales in series
  for (i = 0, count = this.series_.length; i < count; i++) {
    series = this.series_[i];

    //series X scale
    if (!series.xScale()) {
      series.xScale(/** @type {anychart.scales.Base} */(this.xScale()));
      this.invalidateSeries_();
      this.invalidate(anychart.ConsistencyState.SERIES);
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
      this.invalidate(anychart.ConsistencyState.SERIES);
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


/**
 * Spread Column and Bar series to categories width
 * @private
 */
anychart.charts.Cartesian.prototype.distributeSeries_ = function() {
  /** @type {number} */
  var i;
  /** @type {anychart.scales.Base} */
  var scale;
  /** @type {!Array.<anychart.core.cartesian.series.Base>} */
  var series;
  /** @type {anychart.core.cartesian.series.Base} */
  var aSeries;
  /** @type {number} */
  var id;
  /** @type {number} */
  var xId;
  var wSeries;
  var seenScales;
  var currPosition;
  var barWidthRatio;
  var numColumnClusters;
  var numBarClusters;
  var seenScalesWithColumns;
  var seenScalesWithBars;
  // spreading column and bar series to the total width of X categories
  for (xId in this.seriesOfXScaleMap_) {
    // no ned to do this if the scale is not ordinal
    if (!this.xScales_[xId].getCategorisation())
      continue;
    series = this.seriesOfXScaleMap_[xId];
    // Our task is to calculate the number of column and bar clusters.
    // One column cluster is a column series, if axis is not stacked,
    // or all series of stacked axis, if there is at least one column.
    // One bar cluster is a bar series, if axis is not stacked,
    // or all series of stacked axis, if there is at least one bar.
    numColumnClusters = 0;
    numBarClusters = 0;
    seenScalesWithColumns = {};
    seenScalesWithBars = {};
    for (i = 0; i < series.length; i++) {
      aSeries = series[i];
      scale = /** @type {anychart.scales.Base} */(aSeries.yScale());
      id = goog.getUid(scale);
      if (aSeries.isBarBased()) {
        if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
          numBarClusters++;
        } else {
          if (!(id in seenScalesWithBars)) {
            numBarClusters++;
            seenScalesWithBars[id] = true;
          }
        }
      } else if (aSeries.isWidthBased()) {
        if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
          numColumnClusters++;
        } else {
          if (!(id in seenScalesWithColumns)) {
            numColumnClusters++;
            seenScalesWithColumns[id] = true;
          }
        }
      }
    }
    if (numColumnClusters > 0) {
      numColumnClusters = numColumnClusters + (numColumnClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
      barWidthRatio = 1 / numColumnClusters;
      currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
      seenScales = {};
      for (i = 0; i < series.length; i++) {
        wSeries = series[i];
        if (wSeries.isWidthBased() && !wSeries.isBarBased()) {
          scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
          if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoBarWidth(barWidthRatio);
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          } else {
            id = goog.getUid(scale);
            if (id in seenScales) {
              wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
            } else {
              wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
              seenScales[id] = currPosition;
              currPosition += barWidthRatio * (1 + this.barsPadding_);
            }
          }
        }
      }
    }
    if (numBarClusters > 0) {
      numBarClusters = numBarClusters + (numBarClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
      barWidthRatio = 1 / numBarClusters;
      currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
      seenScales = {};
      for (i = 0; i < series.length; i++) {
        wSeries = series[i];
        if (wSeries.isBarBased()) {
          scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
          if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoBarWidth(barWidthRatio);
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          } else {
            id = goog.getUid(scale);
            if (id in seenScales) {
              wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
            } else {
              wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
              wSeries.setAutoBarWidth(barWidthRatio);
              seenScales[id] = currPosition;
              currPosition += barWidthRatio * (1 + this.barsPadding_);
            }
          }
        }
      }
    }
  }
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.charts.Cartesian.prototype.calcBubbleSizes_ = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].setAutoSizeScale(minMax[0], minMax[1]);
  }
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
 * @return {!anychart.charts.Cartesian} {@link anychart.charts.Cartesian} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Array)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Cartesian)} .
 */
anychart.charts.Cartesian.prototype.palette = function(opt_value) {
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
 * @return {anychart.palettes.Markers|anychart.charts.Cartesian} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Cartesian.prototype.markerPalette = function(opt_value) {
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
 * @return {anychart.palettes.HatchFills|anychart.charts.Cartesian} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Cartesian.prototype.hatchFillPalette = function(opt_value) {
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
anychart.charts.Cartesian.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
anychart.charts.Cartesian.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Cartesian.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKER_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Cartesian.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HATCH_FILL_PALETTE, anychart.Signal.NEEDS_REDRAW);
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
anychart.charts.Cartesian.prototype.drawContent = function(bounds) {
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

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

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

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES)) {
    var item;
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      item = this.xAxes_[i];
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      item = this.yAxes_[i];
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
    }
  }

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone().round();
    var attempt = 0;

    do {
      //axes local vars
      var remainingBounds;
      var axis;
      var orientation;
      var topOffset = 0;
      var bottomOffset = 0;
      var leftOffset = 0;
      var rightOffset = 0;
      var complete = true;
      var boundsWithoutAxes = bounds.clone();
      this.topAxisPadding_ = NaN;
      this.bottomAxisPadding_ = NaN;
      this.leftAxisPadding_ = NaN;
      this.rightAxisPadding_ = NaN;
      var axisStrokeThickness;

      for (i = axes.length; i--;) {
        axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          axis.parentBounds(contentAreaBounds);
          orientation = axis.orientation();
          axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke}} */(axis.stroke()));

          if (orientation == anychart.enums.Orientation.TOP) {
            axis.padding().top(topOffset);
            remainingBounds = axis.getRemainingBounds();
            topOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.topAxisPadding_))
              this.topAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.BOTTOM) {
            axis.padding().bottom(bottomOffset);
            remainingBounds = axis.getRemainingBounds();
            bottomOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.bottomAxisPadding_))
              this.bottomAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.LEFT) {
            axis.padding().left(leftOffset);
            remainingBounds = axis.getRemainingBounds();
            leftOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.leftAxisPadding_))
              this.leftAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.RIGHT) {
            axis.padding().right(rightOffset);
            remainingBounds = axis.getRemainingBounds();
            rightOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.rightAxisPadding_))
              this.rightAxisPadding_ = axisStrokeThickness;
          }
          axis.resumeSignalsDispatching(false);
        }
      }

      boundsWithoutAxes.left += leftOffset;
      boundsWithoutAxes.top += topOffset;
      boundsWithoutAxes.width -= rightOffset + leftOffset;
      boundsWithoutAxes.height -= bottomOffset + topOffset;

      for (i = axes.length; i--;) {
        axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
        if (axis && axis.enabled()) {
          axis.suspendSignalsDispatching();
          var remainingBoundsBeforeSetPadding = axis.getRemainingBounds();

          if (axis.isHorizontal()) {
            axis.padding().left(leftOffset);
            axis.padding().right(rightOffset);
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.height != remainingBoundsBeforeSetPadding.height) {
              complete = false;
            }
          } else {
            axis.padding().top(topOffset);
            axis.padding().bottom(bottomOffset);
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.width != remainingBoundsBeforeSetPadding.width) {
              complete = false;
            }
          }
          axis.resumeSignalsDispatching(false);
        }
      }
      attempt++;
    } while (!complete && attempt < anychart.charts.Cartesian.MAX_ATTEMPTS_AXES_CALCULATION_);

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone().round();

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
        if (!grid.scale())
          this.setDefaultScaleForLayoutBasedElements_(grid);
        grid.parentBounds(this.dataBounds_);
        grid.container(this.rootElement);
        grid.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES)) {
    for (i = 0, count = axes.length; i < count; i++) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        if (axis.isHorizontal()) {
          axis.padding().left(parseFloat(leftOffset));
          axis.padding().right(parseFloat(rightOffset));
        } else {
          axis.padding().top(parseFloat(topOffset));
          axis.padding().bottom(parseFloat(bottomOffset));
        }
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (i = 0, count = markers.length; i < count; i++) {
      var axesMarker = markers[i];
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        if (!axesMarker.scale())
          this.setDefaultScaleForLayoutBasedElements_(axesMarker);
        axesMarker.parentBounds(this.dataBounds_);
        axesMarker.container(this.rootElement);
        axesMarker.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES)) {
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
          this.leftAxisPadding_);
      series.parentBounds(this.dataBounds_);
    }

    this.distributeSeries_();
    this.calcBubbleSizes_();
    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.charts.Cartesian.prototype.drawSeries_ = function() {
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
    var categories = scale.getCategorisation();
    var pointClb = function(series) {
      series.drawPoint();
    };
    var missingClb = function(series) {
      series.drawMissing();
    };
    var beforeClb = function(activeSeries) {
      var i;
      for (i = activeSeries.length; i--;) {
        var values = activeSeries[i].getReferenceScaleValues();
        if (activeSeries[i].supportsStack() && values) {
          for (var j = values.length; j--;) {
            var value = /** @type {number} */(values[j]);
            if (value >= 0)
              yScalePositiveSumms[goog.getUid(activeSeries[i].yScale())] += value;
            else if (value < 0)
              yScaleNegativeSumms[goog.getUid(activeSeries[i].yScale())] += value;
          }
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
    if (goog.isArray(categories)) {
      iterator = new anychart.core.utils.OrdinalIterator(series, /** @type {!Array} */(categories), pointClb, missingClb,
          beforeClb, afterClb);
    } else {
      iterator = new anychart.core.utils.ScatterIterator(series, !!categories, pointClb, missingClb, beforeClb,
          afterClb);
    }
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
anychart.charts.Cartesian.prototype.invalidateWidthBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isWidthBased())
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Cartesian.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Cartesian.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.core.cartesian.series.Base} */
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
anychart.charts.Cartesian.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');

  var i, count;

  if (this.xAxes_) {
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      this.restoreDefaultsForAxis(this.xAxes_[i]);
    }
  }

  if (this.yAxes_) {
    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      this.restoreDefaultsForAxis(this.yAxes_[i]);
    }
  }
};


/**
 * Restore default axis settings.
 * @protected
 * @param {anychart.core.axes.Linear} axis Axis to restore settings.
 */
anychart.charts.Cartesian.prototype.restoreDefaultsForAxis = function(axis) {
  axis.suspendSignalsDispatching();
  axis.resumeSignalsDispatching(true);
};


/**
 * @inheritDoc
 */
anychart.charts.Cartesian.prototype.deserialize = function(config) {
  var chart = config['chart'];

  if (!chart) return this;
  goog.base(this, 'deserialize', chart);

  this.suspendSignalsDispatching();
  this.barChartMode = ('barChartMode' in config) ? config['barChartMode'] : this.barChartMode;
  var i, json, scale;
  var grids = chart['grids'];
  var minorGrids = chart['minorGrids'];
  var xAxes = chart['xAxes'];
  var yAxes = chart['yAxes'];
  var lineAxesMarkers = chart['lineAxesMarkers'];
  var rangeAxesMarkers = chart['rangeAxesMarkers'];
  var textAxesMarkers = chart['textAxesMarkers'];
  var series = chart['series'];
  var barGroupsPadding = chart['barGroupsPadding'];
  var barsPadding = chart['barsPadding'];
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
      if (json['scale']) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (minorGrids) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(json);
      if (json['scale']) this.minorGrid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (xAxes) {
    for (i = 0; i < xAxes.length; i++) {
      json = xAxes[i];
      this.xAxis(json);
      if (json['scale']) this.xAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (yAxes) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(json);
      if (json['scale']) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (lineAxesMarkers) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      json = lineAxesMarkers[i];
      this.lineMarker(json);
      if (json['scale']) this.lineMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (rangeAxesMarkers) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      json = rangeAxesMarkers[i];
      this.rangeMarker(json);
      if (json['scale']) this.rangeMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (textAxesMarkers) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      json = textAxesMarkers[i];
      this.textMarker(json);
      if (json['scale']) this.textMarker(i).scale(scalesInstances[json['scale']]);
    }
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
anychart.charts.Cartesian.prototype.serialize = function() {
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

  chart['type'] = anychart.charts.Cartesian.CHART_TYPE;
  chart['barChartMode'] = this.barChartMode;

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
    config = grid.serialize();
    scale = grid.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    grids.push(config);
  }
  chart['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
    config = minorGrid.serialize();
    scale = minorGrid.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    minorGrids.push(config);
  }
  chart['minorGrids'] = minorGrids;

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    var xAxis = this.xAxes_[i];
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
    xAxes.push(config);
  }
  chart['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
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
    yAxes.push(config);
  }
  chart['yAxes'] = yAxes;

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    var lineAxesMarker = this.lineAxesMarkers_[i];
    config = lineAxesMarker.serialize();
    scale = lineAxesMarker.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    lineAxesMarkers.push(config);
  }
  chart['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    var rangeAxesMarker = this.rangeAxesMarkers_[i];
    config = rangeAxesMarker.serialize();
    scale = rangeAxesMarker.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    rangeAxesMarkers.push(config);
  }
  chart['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    var textAxesMarker = this.textAxesMarkers_[i];
    config = textAxesMarker.serialize();
    scale = textAxesMarker.scale();
    objId = goog.getUid(scale);
    if (!scalesIds[objId]) {
      scalesIds[objId] = scale.serialize();
      scales.push(scalesIds[objId]);
      config['scale'] = scales.length - 1;
    } else {
      config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
    }
    textAxesMarkers.push(config);
  }
  chart['textAxesMarkers'] = textAxesMarkers;

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
  chart['barGroupsPadding'] = this.barGroupsPadding();
  chart['barsPadding'] = this.barsPadding();

  json['chart'] = chart;

  return json;
};


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian();
 * chart.line([20, 7, 10, 14]);
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.charts.Cartesian} Empty chart.
 */
anychart.cartesian = function(opt_barChartMode) {
  var chart = new anychart.charts.Cartesian(opt_barChartMode);

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian();
 * chart.line([20, 7, 10, 14]);
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.charts.Cartesian} Empty chart.
 * @deprecated Use anychart.cartesian() instead.
 */
anychart.cartesianChart = anychart.cartesian;


//exports
goog.exportSymbol('anychart.cartesian', anychart.cartesian);//doc|ex
goog.exportSymbol('anychart.cartesianChart', anychart.cartesianChart);//doc|ex
anychart.charts.Cartesian.prototype['xScale'] = anychart.charts.Cartesian.prototype.xScale;//doc|ex
anychart.charts.Cartesian.prototype['yScale'] = anychart.charts.Cartesian.prototype.yScale;//doc|ex
anychart.charts.Cartesian.prototype['barsPadding'] = anychart.charts.Cartesian.prototype.barsPadding;//doc|ex
anychart.charts.Cartesian.prototype['barGroupsPadding'] = anychart.charts.Cartesian.prototype.barGroupsPadding;//doc|ex
anychart.charts.Cartesian.prototype['grid'] = anychart.charts.Cartesian.prototype.grid;//doc|ex
anychart.charts.Cartesian.prototype['minorGrid'] = anychart.charts.Cartesian.prototype.minorGrid;//doc|ex
anychart.charts.Cartesian.prototype['xAxis'] = anychart.charts.Cartesian.prototype.xAxis;//doc|ex
anychart.charts.Cartesian.prototype['yAxis'] = anychart.charts.Cartesian.prototype.yAxis;//doc|ex
anychart.charts.Cartesian.prototype['getSeries'] = anychart.charts.Cartesian.prototype.getSeries;//doc|ex
anychart.charts.Cartesian.prototype['area'] = anychart.charts.Cartesian.prototype.area;//doc|ex
anychart.charts.Cartesian.prototype['bar'] = anychart.charts.Cartesian.prototype.bar;//doc|ex
anychart.charts.Cartesian.prototype['bubble'] = anychart.charts.Cartesian.prototype.bubble;//doc|ex
anychart.charts.Cartesian.prototype['candlestick'] = anychart.charts.Cartesian.prototype.candlestick;//doc|ex
anychart.charts.Cartesian.prototype['column'] = anychart.charts.Cartesian.prototype.column;//doc|ex
anychart.charts.Cartesian.prototype['line'] = anychart.charts.Cartesian.prototype.line;//doc|ex
anychart.charts.Cartesian.prototype['marker'] = anychart.charts.Cartesian.prototype.marker;//doc|ex
anychart.charts.Cartesian.prototype['ohlc'] = anychart.charts.Cartesian.prototype.ohlc;//doc|ex
anychart.charts.Cartesian.prototype['rangeArea'] = anychart.charts.Cartesian.prototype.rangeArea;//doc|ex
anychart.charts.Cartesian.prototype['rangeBar'] = anychart.charts.Cartesian.prototype.rangeBar;//doc|ex
anychart.charts.Cartesian.prototype['rangeColumn'] = anychart.charts.Cartesian.prototype.rangeColumn;//doc|ex
anychart.charts.Cartesian.prototype['rangeSplineArea'] = anychart.charts.Cartesian.prototype.rangeSplineArea;//doc|ex
anychart.charts.Cartesian.prototype['rangeStepArea'] = anychart.charts.Cartesian.prototype.rangeStepArea;//doc|ex
anychart.charts.Cartesian.prototype['spline'] = anychart.charts.Cartesian.prototype.spline;//doc|ex
anychart.charts.Cartesian.prototype['splineArea'] = anychart.charts.Cartesian.prototype.splineArea;//doc|ex
anychart.charts.Cartesian.prototype['stepLine'] = anychart.charts.Cartesian.prototype.stepLine;//doc|ex
anychart.charts.Cartesian.prototype['stepArea'] = anychart.charts.Cartesian.prototype.stepArea;//doc|ex
anychart.charts.Cartesian.prototype['lineMarker'] = anychart.charts.Cartesian.prototype.lineMarker;//doc|ex
anychart.charts.Cartesian.prototype['rangeMarker'] = anychart.charts.Cartesian.prototype.rangeMarker;//doc|ex
anychart.charts.Cartesian.prototype['textMarker'] = anychart.charts.Cartesian.prototype.textMarker;//doc|ex
anychart.charts.Cartesian.prototype['palette'] = anychart.charts.Cartesian.prototype.palette;//doc|ex
anychart.charts.Cartesian.prototype['markerPalette'] = anychart.charts.Cartesian.prototype.markerPalette;
anychart.charts.Cartesian.prototype['hatchFillPalette'] = anychart.charts.Cartesian.prototype.hatchFillPalette;
