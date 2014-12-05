goog.provide('anychart.charts.Scatter');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.Chart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.scatter.series.Base');
goog.require('anychart.enums');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * Scatter chart class.<br/>
 * @extends {anychart.core.Chart}
 * @constructor
 */
anychart.charts.Scatter = function() {
  goog.base(this);

  /**
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.xScale_ = null;

  /**
   * @type {anychart.scales.ScatterBase}
   * @private
   */
  this.yScale_ = null;

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
   * @type {!Array.<anychart.core.scatter.series.Base>}
   * @private
   */
  this.series_ = [];

  // Add handler to listen legend item click for legend and enable/disable series.
  var legend = /** @type {anychart.core.ui.Legend} */ (this.legend());
  legend.listen(anychart.enums.EventType.LEGEND_ITEM_CLICK, function(event) {
    // function that enables or disables series by index of clicked legend item

    var scatterChart = /** @type {anychart.charts.Scatter} */ (this);
    var index = event['index'];
    var series = scatterChart.getSeries(index);
    if (series) {
      series.enabled(!series.enabled());
    }

  }, false, this);
};
goog.inherits(anychart.charts.Scatter, anychart.core.Chart);


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @private
 */
anychart.charts.Scatter.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Scatter.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SCALES |
    anychart.ConsistencyState.GRIDS |
    anychart.ConsistencyState.AXES |
    anychart.ConsistencyState.AXES_MARKERS |
    anychart.ConsistencyState.PALETTE |
    anychart.ConsistencyState.MARKER_PALETTE |
    anychart.ConsistencyState.HATCH_FILL_PALETTE |
    anychart.ConsistencyState.SERIES;


/**
 * Grid z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_GRID = 10;


/**
 * Axis range marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_AXIS_RANGE_MARKER = 25.1;


/**
 * Axis line marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_AXIS_LINE_MARKER = 25.2;


/**
 * Axis text marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_AXIS_TEXT_MARKER = 25.3;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_LINE_SERIES = 31;


/**
 * Axis z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_AXIS = 35;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Sets default scale for layout based element.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.grids.Linear} item Item to set scale.
 * @private
 */
anychart.charts.Scatter.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (item.isHorizontal()) {
    item.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
  } else {
    item.scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
  }
};


/**
 * Getter for default chart X scale.
 * @return {!anychart.scales.ScatterBase} Default chart scale value.
 *//**
 * Setter for default chart X scale.<br/>
 * <b>Note:</b> This scale will be passed to all scale dependent chart elements if they don't have their own scales.<br/>
 * <b>Note:</b> You can pass linear or logarithmic scales only.
 * @example
 * var chart = anychart.scatterChart([
 *   {x: 2, y: 21},
 *   {x: 14, y: 24},
 *   {x: 89, y: 23},
 *   {x: 489, y: 18}
 * ]);
 * chart.xScale(anychart.scales.log());
 * chart.container(stage).draw();
 * @param {anychart.scales.ScatterBase=} opt_value X Scale to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|anychart.scales.ScatterBase)=} opt_value X Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.Scatter)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Scatter.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.ScatterBase.fromString(opt_value, false);
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
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
 * Getter for default chart Y scale.
 * @return {!anychart.scales.ScatterBase} Default chart scale value.
 *//**
 * Setter for default chart Y scale.<br/>
 * <b>Note:</b> This scale will be passed to all scale dependent chart elements if they don't have their own scales.<br/>
 * <b>Note:</b> You can pass linear or logarithmic scales only.
 * @example
 * var chart = anychart.scatterChart([
 *   {x: 21, y: 2},
 *   {x: 24, y: 14},
 *   {x: 23, y: 89},
 *   {x: 18, y: 489}
 * ]);
 * chart.yScale(anychart.scales.log());
 * chart.container(stage).draw();
 * @param {anychart.scales.ScatterBase=} opt_value Y Scale to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|anychart.scales.ScatterBase)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.ScatterBase|anychart.charts.Scatter)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Scatter.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.ScatterBase.fromString(opt_value, false);
    }
    if (!(opt_value instanceof anychart.scales.ScatterBase)) {
      anychart.utils.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE);
      return this;
    }
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
 * Getter for chart grid.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
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
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
 * var myGrid = anychart.grids.linear()
 *    .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid(myGrid);
 * chart.container(stage).draw();
 * @param {(anychart.core.grids.Linear|Object)=} opt_value Chart grid settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart grid by index.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
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
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.grids.Linear|Object|string|null)=} opt_indexOrValue Grid settings.
 * @param {(anychart.core.grids.Linear|Object|string|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.Scatter)} Grid instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid.layout(anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(anychart.charts.Scatter.ZINDEX_GRID);
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter for chart minor grid.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
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
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
 * var myGrid = anychart.grids.linear()
 *    .layout(anychart.enums.Layout.HORIZONTAL);
 * chart.grid(myGrid);
 * myGrid.oddFill('none')
 *    .evenFill('none')
 *    .layout(anychart.enums.Layout.HORIZONTAL).isMinor(true);
 * chart.minorGrid(myGrid)
 * chart.container(stage).draw();
 * @param {(anychart.core.grids.Linear|Object)=} opt_value Chart minor grid settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart minor grid by index.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
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
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.grids.Linear|Object|string|null)=} opt_indexOrValue Minor grid settings.
 * @param {(anychart.core.grids.Linear|Object|string|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.Scatter)} Minor grid instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid.layout(anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(anychart.charts.Scatter.ZINDEX_GRID);
    grid.isMinor(true);
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(opt_value);
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
anychart.charts.Scatter.prototype.onGridSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter for chart X-axis.
 * @param {(string|number)=} opt_index Chart axis index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axes.Linear} Axis instance by index.
 *//**
 * Setter for chart X-axis.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
 * var myAxis = anychart.ui.axis()
 *    .orientation('right')
 *    .title().text('my custom sAxis');
 * chart.xAxis(myAxis);
 * chart.container(stage).draw();
 * @param {(anychart.core.axes.Linear|Object)=} opt_value Chart axis settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart X-axis by index.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
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
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axes.Linear|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.Scatter)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.xAxis = function(opt_indexOrValue, opt_value) {
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
    axis.orientation(anychart.enums.Orientation.BOTTOM);
    axis.zIndex(anychart.charts.Scatter.ZINDEX_AXIS);
    axis.title().text('X-Axis');
    this.xAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
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
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
 * var myAxis = anychart.ui.axis()
 *    .orientation('right')
 *    .title().text('my custom sAxis');
 * chart.yAxis(myAxis);
 * chart.container(stage).draw();
 * @param {(anychart.core.axes.Linear|Object)=} opt_value Chart axis settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart Y-axis by index.
 * @example
 * var chart = anychart.scatterChart(
 *     [{x: 2.1, y:1}, {x: 3.1, y: 2}, {x: 4.0, y: 3}],
 *     [{x: 2.3, y:2}, {x: 3.4, y: 3}, {x: 4.3, y: 4}],
 *     [{x: 2.1, y:3}, {x: 3.1, y: 4}, {x: 4.2, y: 1}],
 *     [{x: 2.4, y:4}, {x: 3.7, y: 1}, {x: 4.0, y: 2}]
 * );
 * chart.xAxis(0)
 *    .orientation('top')
 *    .title(null);
 * chart.xAxis(1)
 *    .orientation('bottom')
 *    .title('X-Axis');
 * chart.xAxis(2)
 *    .orientation('right')
 *    .title(null);
 * chart.yAxis(1, null);
 * chart.yAxis(2, 'None');
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart axis index.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none'</b> to disable the grid.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axes.Linear|Object|string|null)=} opt_indexOrValue Chart axis settings to set.
 * @param {(anychart.core.axes.Linear|Object|string|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.Scatter)} Axis instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis.orientation(anychart.enums.Orientation.LEFT);
    axis.zIndex(anychart.charts.Scatter.ZINDEX_AXIS);
    axis.title().text('Y-Axis');
    this.yAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
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
anychart.charts.Scatter.prototype.onAxisSignal_ = function(event) {
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


/**
 * Getter for chart line marker.
 * @param {(string|number)=} opt_index Chart line marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axisMarkers.Line} Line marker instance by index.
 *//**
 * Setter for chart line marker.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *    [4, 10],
 *    [2, 6],
 *    [3, 17],
 *    [1, 20]
 * ]);
 * var lineMarker = anychart.axisMarkers.line()
 *     .value(15.5)
 *     .stroke('2 red')
 *     .layout('horizontal');
 * chart.lineMarker(lineMarker);
 * chart.container(stage).draw();
 * @param {(anychart.core.axisMarkers.Line|Object)=} opt_value Chart line marker settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart line marker by index.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *    [4, 10],
 *    [2, 6],
 *    [3, 17],
 *    [1, 20]
 * ]);
 * chart.lineMarker();
 * chart.lineMarker(1).value(12).stroke('green');
 * //turn off first marker
 * chart.lineMarker(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart line marker index.
 * @param {(anychart.core.axisMarkers.Line|Object|string|null)=} opt_value Chart line marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker</b>.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axisMarkers.Line|Object|string|null)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(anychart.core.axisMarkers.Line|Object|string|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.charts.Scatter)} Line marker instance by index or itself for method chaining.
 */
anychart.charts.Scatter.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
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
    lineMarker.layout(anychart.enums.Layout.HORIZONTAL);
    lineMarker.zIndex(anychart.charts.Scatter.ZINDEX_AXIS_LINE_MARKER);
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
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
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *    [4, 10],
 *    [2, 6],
 *    [3, 17],
 *    [1, 20]
 * ]);
 * var rangeMarker = anychart.axisMarkers.range()
 *     .from(15.5)
 *     .to(4.5)
 *     .fill('blue .1');
 * chart.rangeMarker(rangeMarker);
 * chart.container(stage).draw();
 * @param {(anychart.core.axisMarkers.Range|Object)=} opt_value Chart range marker settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart range marker by index.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *    [4, 10],
 *    [2, 6],
 *    [3, 17],
 *    [1, 20]
 * ]);
 * chart.rangeMarker(0).from(5).to(12).fill('orange 0.2');
 * chart.rangeMarker(1).from(12).to(18).fill('green 0.2');
 * // turn off red marker.
 * chart.rangeMarker(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart range marker index.
 * @param {(anychart.core.axisMarkers.Range|Object|string|null)=} opt_value Chart range marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker</b>.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axisMarkers.Range|Object|string|null)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(anychart.core.axisMarkers.Range|Object|string|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.charts.Scatter)} Range marker instance by index or itself for chaining call.
 */
anychart.charts.Scatter.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
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
    rangeMarker.layout(anychart.enums.Layout.HORIZONTAL);
    rangeMarker.zIndex(anychart.charts.Scatter.ZINDEX_AXIS_RANGE_MARKER);
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter for chart text marker.
 * @param {(string|number)=} opt_index Chart text marker index. If not set - creates a new instance and adds it to the end of array.
 * @return {!anychart.core.axisMarkers.Text} text marker instance by index.
 *//**
 * Setter for chart text marker.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *    [4, 10],
 *    [2, 6],
 *    [3, 17],
 *    [1, 20]
 * ]);
 * var txtMarker = anychart.axisMarkers.text()
 *     .text('Marker')
 *     .value(13.3)
 *     .align(anychart.enums.Align.LEFT)
 *     .anchor(anychart.enums.Anchor.LEFT_BOTTOM);
 * chart.textMarker(txtMarker);
 * chart.lineMarker().value(13.3);
 * chart.container(stage).draw();
 * @param {(anychart.core.axisMarkers.Text|Object)=} opt_value Chart text marker settings to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * Setter for chart text marker by index.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *    [4, 10],
 *    [2, 6],
 *    [3, 17],
 *    [1, 20]
 * ]);
 * chart.textMarker(0).value(16).text('Marker 0');
 * chart.textMarker(1).value(12).text('Marker 1');
 * // turn off first marker
 * chart.textMarker(0, null);
 * chart.container(stage).draw();
 * @param {(string|number)=} opt_index Chart text marker index.
 * @param {(anychart.core.axisMarkers.Text|Object|string|null)=} opt_value Chart text marker settings to set.<br/>
 * <b>Note:</b> pass <b>null</b> or <b>'none' to disable marker</b>.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|anychart.core.axisMarkers.Text|Object|string|null)=} opt_indexOrValue Chart text marker settings to set.
 * @param {(anychart.core.axisMarkers.Text|Object|string|null)=} opt_value Chart text marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.charts.Scatter)} Text marker instance by index or itself for chaining call.
 */
anychart.charts.Scatter.prototype.textMarker = function(opt_indexOrValue, opt_value) {
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
    textMarker.layout(anychart.enums.Layout.HORIZONTAL);
    textMarker.zIndex(anychart.charts.Scatter.ZINDEX_AXIS_TEXT_MARKER);
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
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
anychart.charts.Scatter.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter for series colors palette.
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} Current palette.
 *//**
 * Setter for series colors palette.
 * @example
 * chart = anychart.scatterChart();
 * chart.palette(['red', 'green', 'blue']);
 * chart.line([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * chart.line([
 *    [4.4, 20],
 *    [2.3, 11],
 *    [3.1, 22],
 *    [1.6, 5]
 * ]);
 * chart.line([
 *    [4.8, 1],
 *    [2.6, 16],
 *    [3.9, 7],
 *    [1.1, 12]
 * ]);
 * chart.container(stage).draw();
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Array)=} opt_value Value to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Array)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Scatter)} .
 */
anychart.charts.Scatter.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  }

  if (!this.palette_)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.charts.Scatter.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.onPaletteSignal_, this);
    this.registerDisposable(this.palette_);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Scatter.prototype.onPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for markers palette settings.
 * @return {anychart.palettes.Markers} Current markers palette.
 *//**
 * Setter for markers palette settings.
 * @example
 * chart = anychart.scatterChart();
 * chart.markerPalette(['star4', 'star6', 'circle']);
 * chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * chart.marker([
 *    [4.4, 20],
 *    [2.3, 11],
 *    [3.1, 22],
 *    [1.6, 5]
 * ]);
 * chart.marker([
 *    [4.8, 1],
 *    [2.6, 16],
 *    [3.9, 7],
 *    [1.1, 12]
 * ]);
 * chart.container(stage).draw();
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Array)=} opt_value Value to set.
 * @return {!anychart.scatter.Chart} {@link anychart.scatter.Chart} instance for method chaining.
 *//**
 * @ignoreDoc
 * Chart markers palette settings.
 * @param {(Array.<anychart.enums.MarkerType>|Object|anychart.palettes.Markers)=} opt_value Chart marker palette settings to set.
 * @return {anychart.palettes.Markers|anychart.charts.Scatter} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Scatter.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.onMarkerPaletteSignal_, this);
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
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Scatter.prototype.onMarkerPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.MARKER_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for hatch fill palette settings.
 * @return {anychart.palettes.HatchFills} Current markers palette.
 *//**
 * Setter for hatch fill palette settings.
 * @example
 * chart = anychart.scatterChart();
 * chart.hatchFillPalette(['percent50', 'diagonalBrick', 'zigzag']);
 * chart.marker([
 *    [4.1, 10],
 *    [2.3, 6],
 *    [3.4, 17],
 *    [1.2, 20]
 * ]);
 * chart.marker([
 *    [4.4, 20],
 *    [2.3, 11],
 *    [3.1, 22],
 *    [1.6, 5]
 * ]);
 * chart.marker([
 *    [4.8, 1],
 *    [2.6, 16],
 *    [3.9, 7],
 *    [1.1, 12]
 * ]);
 * chart.container(stage).draw();
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!anychart.charts.Scatter} {@link anychart.charts.Scatter} instance for method chaining.
 *//**
 * @ignoreDoc
 * Chart markers hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {anychart.palettes.HatchFills|anychart.charts.Scatter} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Scatter.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.onHatchFillPaletteSignal_, this);
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
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Scatter.prototype.onHatchFillPaletteSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HATCH_FILL_PALETTE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Adds Bubble series.
 * @example
 * var chart = anychart.scatterChart();
 * chart.bubble([
 *   [4, 4, 10],
 *   [1, 5, 6],
 *   [2, 6, 17],
 *   [3, 7, 20]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Bubble} instance for method chaining.
 */
anychart.charts.Scatter.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesTypes.BUBBLE,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Line series.
 * @example
 * var chart = anychart.scatterChart();
 * chart.line([
 *   [4, 10],
 *   [1, 6],
 *   [2, 17],
 *   [3, 20]
 * ]);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Line} instance for method chaining.
 */
anychart.charts.Scatter.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesTypes.LINE,
      data,
      opt_csvSettings,
      anychart.charts.Scatter.ZINDEX_LINE_SERIES
  );
};


/**
 * Adds Marker series.
 * @example
 * var chart = anychart.scatterChart();
 * chart.marker([
 *   [4, 10],
 *   [1, 6],
 *   [2, 17],
 *   [3, 20]
 * ]);
 * chart.container(stage).draw();
 @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.scatter.series.Base} {@link anychart.core.scatter.series.Marker} instance for method chaining.
 */
anychart.charts.Scatter.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
      anychart.enums.ScatterSeriesTypes.MARKER,
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
 * @return {anychart.core.scatter.series.Base}
 */
anychart.charts.Scatter.prototype.createSeriesByType_ = function(type, data, opt_csvSettings, opt_zIndex) {
  var ctl = anychart.core.scatter.series.Base.SeriesTypesMap[/** @type {anychart.enums.ScatterSeriesTypes} */(type)];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    this.registerDisposable(instance);
    this.series_.push(instance);
    var index = this.series_.length - 1;
    var inc = index * anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index);
    instance.setAutoZIndex((goog.isDef(opt_zIndex) ? opt_zIndex : anychart.charts.Scatter.ZINDEX_SERIES) + inc);
    if (instance.hasMarkers())
      instance.markers().setAutoZIndex(anychart.charts.Scatter.ZINDEX_MARKER + inc);
    instance.labels().setAutoZIndex(anychart.charts.Scatter.ZINDEX_LABEL + inc + anychart.charts.Scatter.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.clip(true);
    instance.setAutoColor(this.palette().colorAt(this.series_.length - 1));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().markerAt(this.series_.length - 1)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().hatchFillAt(this.series_.length - 1)));
    instance.restoreDefaults();
    instance.listenSignals(this.onSeriesSignal_, this);
    this.invalidate(anychart.ConsistencyState.SERIES | anychart.ConsistencyState.SCALES,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Scatter.prototype.onSeriesSignal_ = function(event) {
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


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Scatter.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.HATCH_FILL);
};


/**
 * Getter series by index.
 * @example
 * var data = [
 *     [{x: 2, y:1}, {x: 3, y: 2}, {x: 4, y: 3}],
 *     [{x: 2, y:2}, {x: 3, y: 3}, {x: 4, y: 4}],
 *     [{x: 2, y:3}, {x: 3, y: 4}, {x: 4, y: 1}],
 *     [{x: 2, y:4}, {x: 3, y: 1}, {x: 4, y: 2}]
 * ];
 * var chart = anychart.scatterChart.apply(this, data);
 * var series, i=0;
 * while (series = chart.getSeries(i)){
 *     series.type('circle');
 *     i++;
 * }
 * chart.container(stage).draw();
 * @param {number} index
 * @return {anychart.core.scatter.series.Base}
 */
anychart.charts.Scatter.prototype.getSeries = function(index) {
  return this.series_[index] || null;
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.createLegendItemsProvider = function() {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  for (var i = 0, count = this.series_.length; i < count; i++) {
    /** @type {anychart.core.scatter.series.Base} */
    var series = this.series_[i];
    data.push(series.getLegendItemData());
  }

  return data;
};


/**
 * Calculate scatter chart properties.
 */
anychart.charts.Scatter.prototype.calculate = function() {
  /** @type {number} */
  var i;
  /** @type {number} */
  var count;

  /** @type {anychart.scales.ScatterBase} */
  var scale;

  /** @type {anychart.core.scatter.series.Base} */
  var aSeries;
  /** @type {anychart.data.Iterator} */
  var iterator;

  /** @type {number} */
  var id;

  /** @type {anychart.scales.ScatterBase} */
  var xScale;

  /** @type {anychart.scales.ScatterBase} */
  var yScale;

  /** @type {!Array.<anychart.scales.ScatterBase>} */
  var scales = [];

  /** @type {*} */
  var x;
  /** @type {*} */
  var y;

  if (this.hasInvalidationState(anychart.ConsistencyState.SCALES)) {
    anychart.core.Base.suspendSignalsDispatching(this.series_);

    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];

      if (!aSeries.xScale()) {
        aSeries.xScale(/** @type {anychart.scales.ScatterBase} */ (this.xScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SERIES);
      }
      scale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      id = goog.getUid(scale);
      scales[id] = scale;

      if (!aSeries.yScale()) {
        aSeries.yScale(/** @type {anychart.scales.ScatterBase} */ (this.yScale()));
        this.invalidateSeries_();
        this.invalidate(anychart.ConsistencyState.SERIES);
      }
      scale = /** @type {anychart.scales.ScatterBase} */ (aSeries.yScale());
      id = goog.getUid(scale);
      scales[id] = scale;
    }

    for (id in scales) {
      scale = scales[id];
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
      }
    }

    for (i = 0, count = this.series_.length; i < count; i++) {
      aSeries = this.series_[i];
      xScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.xScale());
      yScale = /** @type {anychart.scales.ScatterBase} */ (aSeries.yScale());

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


/**
 * Draw scatter chart content items.
 * @param {anychart.math.Rect} bounds Bounds of scatter content area.
 */
anychart.charts.Scatter.prototype.drawContent = function(bounds) {
  var i;
  var count;

  this.calculate();

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

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES)) {
    var item;
    for (i = this.xAxes_.length; i--;) {
      item = this.xAxes_[i];
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */(this.xScale()));
    }

    for (i = this.yAxes_.length; i--;) {
      item = this.yAxes_[i];
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.ScatterBase} */(this.yScale()));
    }
  }

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);
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
          axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(axis.stroke()));

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
    } while (!complete && attempt < anychart.charts.Scatter.MAX_ATTEMPTS_AXES_CALCULATION_);

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

    this.calcBubbleSizes_();
    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.SERIES);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Calculates bubble sizes for series.
 * @private
 */
anychart.charts.Scatter.prototype.calcBubbleSizes_ = function() {
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


/**
 * Renders the series.
 * @private
 */
anychart.charts.Scatter.prototype.drawSeries_ = function() {
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


/** @inheritDoc */
anychart.charts.Scatter.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var scale;
  var config;
  var objId;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  json['xScale'] = scales.length - 1;
  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
  }
  json['yScale'] = scales.length - 1;

  json['type'] = anychart.enums.ChartTypes.SCATTER;
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();

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
  json['grids'] = grids;

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
  json['minorGrids'] = minorGrids;

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
  json['xAxes'] = xAxes;

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
  json['yAxes'] = yAxes;

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
  json['lineAxesMarkers'] = lineAxesMarkers;

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
  json['rangeAxesMarkers'] = rangeAxesMarkers;

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
  json['textAxesMarkers'] = textAxesMarkers;

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
  json['series'] = series;

  json['scales'] = scales;
  return {'chart': json};
};


/** @inheritDoc */
anychart.charts.Scatter.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);

  var i, json, scale;
  var grids = config['grids'];
  var minorGrids = config['minorGrids'];
  var xAxes = config['xAxes'];
  var yAxes = config['yAxes'];
  var lineAxesMarkers = config['lineAxesMarkers'];
  var rangeAxesMarkers = config['rangeAxesMarkers'];
  var textAxesMarkers = config['textAxesMarkers'];
  var series = config['series'];
  var barGroupsPadding = config['barGroupsPadding'];
  var barsPadding = config['barsPadding'];
  var scales = config['scales'];

  var scalesInstances = {};
  if (goog.isArray(scales)) {
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
  if (scale)
    this.xScale(scale);

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

  if (goog.isArray(grids)) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(i, json);
      if (goog.isObject(json) && 'scale' in json) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(minorGrids)) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(i, json);
      if (goog.isObject(json) && 'scale' in json) this.minorGrid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(xAxes)) {
    for (i = 0; i < xAxes.length; i++) {
      json = xAxes[i];
      this.xAxis(i, json);
      if (goog.isObject(json) && 'scale' in json) this.xAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(yAxes)) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(i, json);
      if (goog.isObject(json) && 'scale' in json) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(lineAxesMarkers)) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      json = lineAxesMarkers[i];
      this.lineMarker(i, json);
      if (goog.isObject(json) && 'scale' in json) this.lineMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(rangeAxesMarkers)) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      json = rangeAxesMarkers[i];
      this.rangeMarker(i, json);
      if (goog.isObject(json) && 'scale' in json) this.rangeMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(textAxesMarkers)) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      json = textAxesMarkers[i];
      this.textMarker(i, json);
      if (goog.isObject(json) && 'scale' in json) this.textMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = (json['seriesType'] || anychart.enums.ScatterSeriesTypes.MARKER).toLowerCase();
      var data = json['data'];
      var seriesInst = this.createSeriesByType_(seriesType, data);
      if (seriesInst) {
        if (seriesType == anychart.enums.ScatterSeriesTypes.LINE)
          seriesInst.zIndex(anychart.charts.Scatter.ZINDEX_LINE_SERIES);
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('xScale' in json) seriesInst.xScale(scalesInstances[json['xScale']]);
          if ('yScale' in json) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }
};


//exports
anychart.charts.Scatter.prototype['xScale'] = anychart.charts.Scatter.prototype.xScale;//doc|ex
anychart.charts.Scatter.prototype['yScale'] = anychart.charts.Scatter.prototype.yScale;//doc|ex
anychart.charts.Scatter.prototype['grid'] = anychart.charts.Scatter.prototype.grid;//doc|ex
anychart.charts.Scatter.prototype['minorGrid'] = anychart.charts.Scatter.prototype.minorGrid;//doc|ex
anychart.charts.Scatter.prototype['xAxis'] = anychart.charts.Scatter.prototype.xAxis;//doc|ex
anychart.charts.Scatter.prototype['yAxis'] = anychart.charts.Scatter.prototype.yAxis;//doc|ex
anychart.charts.Scatter.prototype['getSeries'] = anychart.charts.Scatter.prototype.getSeries;//doc|ex
anychart.charts.Scatter.prototype['bubble'] = anychart.charts.Scatter.prototype.bubble;//doc|ex
anychart.charts.Scatter.prototype['line'] = anychart.charts.Scatter.prototype.line;//doc|ex
anychart.charts.Scatter.prototype['marker'] = anychart.charts.Scatter.prototype.marker;//doc|ex
anychart.charts.Scatter.prototype['lineMarker'] = anychart.charts.Scatter.prototype.lineMarker;//doc|ex
anychart.charts.Scatter.prototype['rangeMarker'] = anychart.charts.Scatter.prototype.rangeMarker;//doc|ex
anychart.charts.Scatter.prototype['textMarker'] = anychart.charts.Scatter.prototype.textMarker;//doc|ex
anychart.charts.Scatter.prototype['palette'] = anychart.charts.Scatter.prototype.palette;//doc|ex
anychart.charts.Scatter.prototype['markerPalette'] = anychart.charts.Scatter.prototype.markerPalette;
anychart.charts.Scatter.prototype['hatchFillPalette'] = anychart.charts.Scatter.prototype.hatchFillPalette;
