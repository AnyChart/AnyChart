goog.provide('anychart.charts.HeatMap');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.heatMap.series.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.scales.OrdinalColor');



/**
 * AnyChart Hea tMap class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @implements {anychart.core.utils.IZoomableChart}
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.charts.HeatMap = function(opt_data, opt_csvSettings) {
  anychart.charts.HeatMap.base(this, 'constructor');

  /**
   * @type {!anychart.scales.Ordinal}
   * @private
   */
  this.xScale_ = new anychart.scales.Ordinal();
  this.xScale_.listenSignals(this.scaleInvalidated_, this);

  /**
   * @type {!anychart.scales.Ordinal}
   * @private
   */
  this.yScale_ = new anychart.scales.Ordinal();
  this.yScale_.listenSignals(this.scaleInvalidated_, this);

  /**
   * @type {!Array<anychart.core.axes.Linear>}
   * @private
   */
  this.xAxes_ = [];

  /**
   * @type {!Array<anychart.core.axes.Linear>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>}
   * @private
   */
  this.grids_ = [];

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

  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.xZoom_ = new anychart.core.utils.OrdinalZoom(this, true);


  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.yZoom_ = new anychart.core.utils.OrdinalZoom(this, false);

  this.createSeries_(opt_data || null, opt_csvSettings);
};
goog.inherits(anychart.charts.HeatMap, anychart.core.SeparateChart);


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.charts.HeatMap.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getType = function() {
  return anychart.enums.ChartTypes.HEAT_MAP;
};


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @private
 */
anychart.charts.HeatMap.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.HeatMap.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.HEATMAP_SCALES |
    anychart.ConsistencyState.HEATMAP_SERIES |
    anychart.ConsistencyState.HEATMAP_AXES |
    anychart.ConsistencyState.HEATMAP_GRIDS |
    anychart.ConsistencyState.HEATMAP_COLOR_SCALE |
    anychart.ConsistencyState.HEATMAP_X_SCROLLER |
    anychart.ConsistencyState.HEATMAP_Y_SCROLLER |
    anychart.ConsistencyState.HEATMAP_ZOOM;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.charts.HeatMap.ZINDEX_SERIES = 30;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.charts.HeatMap.ZINDEX_MARKER = 40;


/**
 * Label z-index in chart root layer.
 * @type {number}
 */
anychart.charts.HeatMap.ZINDEX_LABEL = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.charts.HeatMap.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


//----------------------------------------------------------------------------------------------------------------------
//
//  Zoom
//
//----------------------------------------------------------------------------------------------------------------------
//region anychart.core.utils.IZoomableChart members
/**
 * Invalidates zoom.
 * @param {boolean} forX
 */
anychart.charts.HeatMap.prototype.invalidateZoom = function(forX) {
  // we do not distinguish between x and y zoom because we have only the x one
  this.invalidate(anychart.ConsistencyState.HEATMAP_ZOOM, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns default scale for given dimension.
 * @param {boolean} forX
 * @return {anychart.scales.Base}
 */
anychart.charts.HeatMap.prototype.getDefaultScale = function(forX) {
  return /** @type {anychart.scales.Base} */(forX ? this.xScale() : this.yScale());
};


/**
 * Ensures that scales are ready for zooming.
 */
anychart.charts.HeatMap.prototype.ensureScalesReadyForZoom = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_SCALES)) {
    if (!!this.xZoom().getSetup() || !!this.yZoom().getSetup())
      this.calculate();
  }
};
//endregion


/**
 * X Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.charts.HeatMap|anychart.core.utils.OrdinalZoom}
 */
anychart.charts.HeatMap.prototype.xZoom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.xZoom_.setup(opt_value);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.xZoom_;
};


/**
 * Y Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.charts.HeatMap|anychart.core.utils.OrdinalZoom}
 */
anychart.charts.HeatMap.prototype.yZoom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.yZoom_.setup(opt_value);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.yZoom_;
};


/**
 * X Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.xScroller = function(opt_value) {
  if (!this.xScroller_) {
    this.xScroller_ = new anychart.core.ui.ChartScroller();
    this.xScroller_.setParentEventTarget(this);
    this.xScroller_.listenSignals(this.xScrollerInvalidated_, this);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE_START, this.scrollerChangeStartHandler_);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler_);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeFinishHandler_);
    this.invalidate(
        anychart.ConsistencyState.HEATMAP_X_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.xScroller_.setup(opt_value);
    return this;
  } else {
    return this.xScroller_;
  }
};


/**
 * Y Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.yScroller = function(opt_value) {
  if (!this.yScroller_) {
    this.yScroller_ = new anychart.core.ui.ChartScroller();
    this.yScroller_.setParentEventTarget(this);
    this.yScroller_.listenSignals(this.yScrollerInvalidated_, this);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE_START, this.scrollerChangeStartHandler_);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler_);
    this.eventsHandler.listen(this.yScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeFinishHandler_);
    this.invalidate(
        anychart.ConsistencyState.HEATMAP_Y_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.yScroller_.setup(opt_value);
    return this;
  } else {
    return this.yScroller_;
  }
};


/**
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.xScrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.HEATMAP_X_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/**
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.yScrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.HEATMAP_Y_SCROLLER;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  this.invalidate(state, signal);
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.scrollerChangeStartHandler_ = function(e) {
  //if (this.dispatchRangeChange_(
  //    anychart.enums.EventType.SELECTED_RANGE_CHANGE_START,
  //    this.transformScrollerSource_(e['source'])))
  //  this.preventHighlight_();
  //else
  //  e.preventDefault();
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.scrollerChangeHandler_ = function(e) {
  var zoom = e.target == this.xScroller() ? this.xZoom_ : this.yZoom_;
  if (zoom.continuous()) {
    e.preventDefault();
    this.suspendSignalsDispatching();
    zoom.setTo(e['startRatio'], e['endRatio']);
    this.resumeSignalsDispatching(true);
  }
  //e.preventDefault();
  //var first = e['startKey'];
  //var last = e['endKey'];
  //var source = this.transformScrollerSource_(e['source']);
  //if (this.dispatchRangeChange_(
  //    anychart.enums.EventType.SELECTED_RANGE_BEFORE_CHANGE,
  //    source,
  //    Math.min(first, last), Math.max(first, last))) {
  //  this.selectRangeInternal(first, last);
  //  this.dispatchRangeChange_(anychart.enums.EventType.SELECTED_RANGE_CHANGE, source);
  //}
};


/**
 * Scroller change start event handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} e
 * @private
 */
anychart.charts.HeatMap.prototype.scrollerChangeFinishHandler_ = function(e) {
  var zoom = e.target == this.xScroller() ? this.xZoom_ : this.yZoom_;
  if (!zoom.continuous()) {
    e.preventDefault();
    this.suspendSignalsDispatching();
    zoom.setTo(e['startRatio'], e['endRatio']);
    this.resumeSignalsDispatching(true);
  }
  //this.dispatchRangeChange_(
  //    anychart.enums.EventType.SELECTED_RANGE_CHANGE_FINISH,
  //    this.transformScrollerSource_(e['source']));
  //this.allowHighlight_();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for x-axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.charts.HeatMap.prototype.defaultXAxisSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultXAxisSettings_ = opt_value;
    return this;
  }
  return this.defaultXAxisSettings_ || {};
};


/**
 * Getter/setter for y-axis default settings.
 * @param {Object=} opt_value Object with y-axis settings.
 * @return {Object}
 */
anychart.charts.HeatMap.prototype.defaultYAxisSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultYAxisSettings_ = opt_value;
    return this;
  }
  return this.defaultYAxisSettings_ || {};
};


/**
 * Getter/setter for grid default settings.
 * @param {Object=} opt_value Object with grid settings.
 * @return {Object}
 */
anychart.charts.HeatMap.prototype.defaultGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultGridSettings_ = opt_value;
    return this;
  }
  return this.defaultGridSettings_ || {};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for default chart X scale.
 * @param {anychart.scales.Ordinal=} opt_value X Scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.charts.HeatMap)} Default chart scale value or itself for method chaining.
 */
anychart.charts.HeatMap.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.Ordinal)) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.SCALE_TYPE_NOT_SUPPORTED, null, [opt_value.getType(), 'Ordinal'], false);
      return this;
    }

    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlistenSignals(this.scaleInvalidated_, this);

      this.xScale_ = /** type {anychart.scales.Ordinal} */(opt_value);
      this.xScale_.listenSignals(this.scaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.HEATMAP_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** type {anychart.scales.Ordinal} */(this.xScale_);
  }
};


/**
 * Chart xScale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.charts.HeatMap.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for default chart Y scale.
 * @param {anychart.scales.Ordinal=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Ordinal|anychart.charts.HeatMap)} Default chart scale value or itself for method chaining.
 */
anychart.charts.HeatMap.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.Ordinal)) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.SCALE_TYPE_NOT_SUPPORTED, null, [opt_value.getType(), 'Ordinal'], false);
      return this;
    }

    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated_, this);

      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.scaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.HEATMAP_SCALES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return /** type {anychart.scales.Ordinal} */(this.yScale_);
  }
};


/**
 * Sets default scale for layout based element depending on barChartMode.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.grids.Linear} item Item to set scale.
 * @private
 */
anychart.charts.HeatMap.prototype.setDefaultScaleForLayoutBasedElements_ = function(item) {
  if (item.isHorizontal()) {
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
 * Getter/setter for chart grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.charts.HeatMap)} Grid instance by index or itself for method chaining.
 */
anychart.charts.HeatMap.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = new anychart.core.grids.Linear();
    grid.setChart(this);
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
    this.invalidate(anychart.ConsistencyState.HEATMAP_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Gats all created grids. Internal method.
 * @return {Array.<anychart.core.grids.Linear>}
 */
anychart.charts.HeatMap.prototype.getGrids = function() {
  return this.grids_;
};


/**
 * Listener for grids invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.charts.HeatMap.prototype.onGridSignal_ = function(event) {
  this.series_.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  this.invalidate(anychart.ConsistencyState.HEATMAP_GRIDS | anychart.ConsistencyState.HEATMAP_SERIES,
      anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for chart X-axis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.HeatMap)} Axis instance by index or itself for method chaining.
 */
anychart.charts.HeatMap.prototype.xAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var axis = this.xAxes_[index];
  if (!axis) {
    axis = new anychart.core.axes.Linear();
    axis.setParentEventTarget(this);
    axis.setup(this.defaultXAxisSettings());
    this.xAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.HEATMAP_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * Getter/setter for chart Y-axis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.charts.HeatMap)} Axis instance by index or itself for method chaining.
 */
anychart.charts.HeatMap.prototype.yAxis = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var axis = this.yAxes_[index];
  if (!axis) {
    axis = new anychart.core.axes.Linear();
    axis.setParentEventTarget(this);
    axis.setup(this.defaultYAxisSettings());
    this.yAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.HEATMAP_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
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
anychart.charts.HeatMap.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.HEATMAP_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis by index. First of all goes through x-axes, then y-axes.
 * SAMPLE: if we have 4 x-axes and 3 y-axes, chart.getAxisByIndex(4) will return very first y-axis.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.Linear|undefined}
 */
anychart.charts.HeatMap.prototype.getAxisByIndex = function(index) {
  return (index >= this.xAxes_.length) ? this.yAxes_[index - this.xAxes_.length] : this.xAxes_[index];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Color scale.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Color scale.
 * @param {anychart.scales.OrdinalColor=} opt_value
 * @return {anychart.charts.HeatMap|anychart.scales.OrdinalColor}
 */
anychart.charts.HeatMap.prototype.colorScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colorScale_ != opt_value) {
      if (this.colorScale_)
        this.colorScale_.unlistenSignals(this.colorScaleInvalidated_, this);
      this.colorScale_ = opt_value;
      if (this.colorScale_)
        this.colorScale_.listenSignals(this.colorScaleInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colorScale_;
};


/**
 * Chart scale invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.charts.HeatMap.prototype.colorScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.HEATMAP_COLOR_SCALE | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.HeatMap.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.calculate();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    var scale = this.colorScale();
    if (scale && scale instanceof anychart.scales.OrdinalColor) {
      var series = this.series_;
      var ranges = scale.getProcessedRanges();
      for (i = 0, count = ranges.length; i < count; i++) {
        var range = ranges[i];
        data.push({
          'text': range.name,
          'iconEnabled': true,
          'iconType': anychart.enums.LegendItemIconType.SQUARE,
          'iconFill': range.color,
          'disabled': !this.enabled(),
          'sourceUid': goog.getUid(this),
          'sourceKey': i,
          'meta': {
            series: series,
            scale: scale,
            range: range
          }
        });
      }
    }
  }
  return data;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.CATEGORIES);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemClick = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;
  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = meta.series;
    var scale = meta.scale;

    if (scale && series) {
      var points = [];
      var range = meta.range;
      var iterator = series.getResetIterator();

      while (iterator.advance()) {
        var pointValue = iterator.get('heat');
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemOver = function(item, event) {
  var meta = /** @type {Object} */(item.meta());
  var series;

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    series = /** @type {anychart.core.map.series.Base} */(meta.series);
    var scale = meta.scale;
    if (scale && series) {
      var range = meta.range;
      var iterator = series.getResetIterator();

      var points = [];
      while (iterator.advance()) {
        var pointValue = iterator.get('heat');
        if (range == scale.getRangeByValue(pointValue)) {
          points.push(iterator.getIndex());
        }
      }

      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag) {
        if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
          tag.points_ = {
            series: series,
            points: points
          };
        } else {
          tag.points_ = [{
            series: series,
            points: points,
            lastPoint: points[points.length - 1],
            nearestPointToCursor: {index: points[points.length - 1], distance: 0}
          }];
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.legendItemOut = function(item, event) {
  var meta = /** @type {Object} */(item.meta());

  var sourceMode = this.legend().itemsSourceMode();
  if (sourceMode == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    if (this.interactivity().hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var tag = anychart.utils.extractTag(event['domTarget']);
      if (tag)
        tag.series = meta.series;
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.HeatMap.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [];
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      nearestPointToCursor_ = {
        'index': status.nearestPointToCursor.index,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventSeriesStatus.push({
      'series': this,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var currentPoint = anychart.charts.HeatMap.base(this, 'makeCurrentPoint', seriesStatus, event, opt_empty);

  currentPoint['series'] = this;

  return currentPoint;
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getPoint = function(index) {
  return this.series_.getPoint(index);
};


/** @inheritDoc */
anychart.charts.HeatMap.prototype.getSeriesStatus = function(event) {
  var bounds = this.dataBounds_ || anychart.math.rect(0, 0, 0, 0);

  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var value, index;

  var containerOffset = this.container().getStage().getClientPosition();

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var minX = bounds.left;
  var minY = bounds.top;
  var rangeX = bounds.width;
  var rangeY = bounds.height;

  if (x < minX || x > minX + rangeX || y < minY || y > minY + rangeY)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();
    var minRatio = (x - spotRadius - minX) / rangeX;
    var maxRatio = (x + spotRadius - minX) / rangeX;

    var minValue, maxValue;
    series = this.series_;
    if (series.enabled()) {
      minValue = /** @type {number} */(series.xScale().inverseTransform(minRatio));
      maxValue = /** @type {number} */(series.xScale().inverseTransform(maxRatio));

      var indexes = series.data().findInRangeByX(minValue, maxValue, false, 'x');
      var iterator = series.getIterator();
      var ind = [];
      var minLength = Infinity;
      var minLengthIndex;
      for (var j = 0; j < indexes.length; j++) {
        index = indexes[j];
        if (iterator.select(index)) {
          var pixX = /** @type {number} */(iterator.meta('x'));
          var pixY = /** @type {number} */(iterator.meta('y'));

          var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
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
  } else if (this.interactivity().hoverMode() == anychart.enums.HoverMode.BY_X) {
    var ratio = (x - minX) / rangeX;

    series = this.series_;
    value = /** @type {number} */(series.xScale().inverseTransform(ratio));
    index = series.data().findInUnsortedDataByX(value, 'x', 'heat');

    iterator = series.getIterator();
    minLength = Infinity;
    if (index.length) {
      for (j = 0; j < index.length; j++) {
        if (iterator.select(index[j])) {
          pixX = /** @type {number} */(iterator.meta('x'));
          pixY = /** @type {number} */(iterator.meta('y'));

          length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
          if (length < minLength) {
            minLength = length;
            minLengthIndex = index[j];
          }
        }
      }

      points.push({
        series: series,
        points: index,
        lastPoint: index[index.length - 1],
        nearestPointToCursor: {index: minLengthIndex, distance: minLength}
      });
    }
  }

  return /** @type {Array.<Object>} */(points);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create series.
 * @param {anychart.data.View|anychart.data.Set|Array|string} data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.core.heatMap.series.Base}
 * @private
 */
anychart.charts.HeatMap.prototype.createSeries_ = function(data, opt_csvSettings) {
  var instance = new anychart.core.heatMap.series.Base(data || null, opt_csvSettings);
  instance.setParentEventTarget(this);
  this.registerDisposable(instance);
  this.series_ = instance;
  instance.setChart(this);
  instance.index(0).id(0);
  var seriesZIndex = anychart.charts.HeatMap.ZINDEX_SERIES;
  instance.setAutoZIndex(seriesZIndex);
  instance.labels().setAutoZIndex(seriesZIndex + anychart.charts.HeatMap.ZINDEX_INCREMENT_MULTIPLIER / 2);
  instance.clip(true);

  instance.setAutoColor(/** @type {acgraph.vector.Fill} */(anychart.getFullTheme('palette.items.0')));
  instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(anychart.getFullTheme('markerPalette.items.0')));
  instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(anychart.getFullTheme('hatchFillPalette.items.0')));

  instance.markers().setAutoZIndex(seriesZIndex + anychart.charts.HeatMap.ZINDEX_INCREMENT_MULTIPLIER / 2);
  instance.markers().setAutoFill((/** @type {anychart.core.heatMap.series.Base} */ (instance)).getMarkerFill());
  instance.markers().setAutoStroke(/** @type {acgraph.vector.Stroke} */((/** @type {anychart.core.heatMap.series.Base} */ (instance)).getMarkerStroke()));

  if (anychart.DEFAULT_THEME != 'v6')
    instance.labels().setAutoColor(anychart.color.darken(/** @type {(acgraph.vector.Fill|acgraph.vector.Stroke)} */(instance.color())));

  instance.a11y(/** @type {boolean|Object|undefined} */(anychart.getFullTheme(this.getType() + '.defaultSeriesSettings.base.a11y')));

  instance.listenSignals(this.seriesInvalidated_, this);

  this.invalidate(
      anychart.ConsistencyState.HEATMAP_SERIES |
      anychart.ConsistencyState.CHART_LEGEND |
      anychart.ConsistencyState.A11Y |
      anychart.ConsistencyState.HEATMAP_SCALES,
      anychart.Signal.NEEDS_REDRAW);

  return instance;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.HeatMap.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.HEATMAP_SERIES;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_UPDATE_A11Y)) {
    state = anychart.ConsistencyState.A11Y;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.HEATMAP_SERIES;
    state |= anychart.ConsistencyState.A11Y;
    this.invalidateSeries_();
    if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.HEATMAP_SCALES | anychart.ConsistencyState.HEATMAP_COLOR_SCALE;
  }
  if (event.hasSignal(anychart.Signal.NEED_UPDATE_LEGEND)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED))
      state |= anychart.ConsistencyState.BOUNDS;
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Internal public method. Returns all chart series.
 * @return {!Array.<anychart.core.heatMap.series.Base>}
 */
anychart.charts.HeatMap.prototype.getAllSeries = function() {
  return [this.series_];
};


/**
 * Creates format provider.
 * @param {boolean=} opt_force create context provider forcibly.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.charts.HeatMap.prototype.createFormatProvider = function(opt_force) {
  return this.series_.createFormatProvider(opt_force);
};


/**
 * Creates tooltip format provider.
 * @return {Object}
 */
anychart.charts.HeatMap.prototype.createTooltipContextProvider = function() {
  return this.createFormatProvider();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.HeatMap.prototype.useUnionTooltipAsSingle = function() {
  return true;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_SCALES)) {
    var iterator, value;

    var yScale = this.yScale();
    var xScale = this.xScale();

    this.series_.xScale(xScale);
    this.series_.yScale(yScale);

    var xScaleNeedAutoCalc = xScale.needsAutoCalc();
    var yScaleNeedAutoCalc = yScale.needsAutoCalc();

    if (xScaleNeedAutoCalc || yScaleNeedAutoCalc) {
      if (xScaleNeedAutoCalc) xScale.startAutoCalc();
      if (yScaleNeedAutoCalc) yScale.startAutoCalc();

      iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        if (xScaleNeedAutoCalc) {
          value = iterator.get('x');
          if (goog.isDef(value)) {
            xScale.extendDataRange(value);
          }
        }

        if (yScaleNeedAutoCalc) {
          value = iterator.get('y');
          if (goog.isDef(value)) {
            yScale.extendDataRange(value);
          }
        }
      }
    }

    var xFieldName, yFieldName, xAutoNames = null, yAutoNames = null, valueIndex, name;
    var xScaleNamesField = xScale.getNamesField();
    var yScaleNamesField = yScale.getNamesField();


    if (xScaleNamesField || yScaleNamesField) {
      if (xScaleNamesField) {
        xFieldName = xScaleNamesField;
        xAutoNames = [];
      }

      if (yScaleNamesField) {
        yFieldName = yScaleNamesField;
        yAutoNames = [];
      }

      iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        if (xScaleNamesField) {
          valueIndex = xScale.getIndexByValue(iterator.get('x'));
          name = iterator.get(xFieldName);
          if (!goog.isDef(xAutoNames[valueIndex]))
            xAutoNames[valueIndex] = name || iterator.get('x') || iterator.get('heat');
        }


        if (yScaleNamesField) {
          valueIndex = yScale.getIndexByValue(iterator.get('y'));
          name = iterator.get(yFieldName);
          if (!goog.isDef(yAutoNames[valueIndex]))
            yAutoNames[valueIndex] = name || iterator.get('y') || iterator.get('heat');
        }
      }

      if (xScaleNamesField)
        xScale.setAutoNames(xAutoNames);
      if (yScaleNamesField)
        yScale.setAutoNames(yAutoNames);
    }

    this.series_.calculateStatistics();

    var scalesChanged = false;

    if (this.xScale().needsAutoCalc())
      scalesChanged |= this.xScale().finishAutoCalc();

    if (this.yScale().needsAutoCalc())
      scalesChanged |= this.yScale().finishAutoCalc();

    if (scalesChanged) {
      this.invalidateSeries_();
    }
    this.markConsistent(anychart.ConsistencyState.HEATMAP_SCALES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_COLOR_SCALE)) {
    if (this.colorScale_ && this.colorScale_.needsAutoCalc()) {
      this.colorScale_.startAutoCalc();
      iterator = this.series_.getResetIterator();
      while (iterator.advance()) {
        this.colorScale_.extendDataRange(iterator.get(this.series_.referenceValueNames[2]));
      }
      this.colorScale_.finishAutoCalc();
    }
    this.invalidate(anychart.ConsistencyState.HEATMAP_SERIES);
    this.invalidateSeries_();
    this.markConsistent(anychart.ConsistencyState.HEATMAP_COLOR_SCALE);
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
anychart.charts.HeatMap.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();

  if (this.isConsistent())
    return;

  this.xScroller().suspendSignalsDispatching();
  this.yScroller().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_ZOOM)) {
    var start, factor;

    start = this.xZoom().getStartRatio();
    factor = 1 / (this.xZoom().getEndRatio() - start);
    this.xScale_.setZoom(factor, start);

    start = this.yZoom().getStartRatio();
    factor = 1 / (this.yZoom().getEndRatio() - start);
    this.yScale_.setZoom(factor, start);

    this.xScroller().setRangeInternal(this.xZoom().getStartRatio(), this.xZoom().getEndRatio());
    this.yScroller().setRangeInternal(this.yZoom().getStartRatio(), this.yZoom().getEndRatio());

    this.markConsistent(anychart.ConsistencyState.HEATMAP_ZOOM);
    this.invalidate(anychart.ConsistencyState.HEATMAP_X_SCROLLER | anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.HEATMAP_AXES)) {
    var item;
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      item = this.xAxes_[i];
      item.labels().dropCallsCache();
      item.minorLabels().dropCallsCache();
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      item = this.yAxes_[i];
      item.labels().dropCallsCache();
      item.minorLabels().dropCallsCache();
      if (item && !item.scale())
        item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
    }
  }

  //calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //total bounds of content area
    var contentAreaBounds = bounds.clone().round();
    var attempt = 0;

    var xScroller = this.xScroller();
    var xScrollerBeforeAxes = xScroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES;
    xScroller.padding(0);
    xScroller.parentBounds(contentAreaBounds);
    var xScrollerHorizontal = xScroller.isHorizontal();
    var xScrollerSize;
    if (xScrollerHorizontal) {
      xScrollerSize = contentAreaBounds.height - xScroller.getRemainingBounds().height;
    } else {
      xScrollerSize = contentAreaBounds.width - xScroller.getRemainingBounds().width;
    }

    var yScroller = this.yScroller();
    var yScrollerBeforeAxes = yScroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES;
    yScroller.padding(0);
    yScroller.parentBounds(contentAreaBounds);
    var yScrollerHorizontal = yScroller.isHorizontal();
    var yScrollerSize;
    if (yScrollerHorizontal) {
      yScrollerSize = contentAreaBounds.height - yScroller.getRemainingBounds().height;
    } else {
      yScrollerSize = contentAreaBounds.width - yScroller.getRemainingBounds().width;
    }

    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      this.xAxes_[i].suspendSignalsDispatching();
      this.xAxes_[i].padding(0);
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      this.yAxes_[i].suspendSignalsDispatching();
      this.yAxes_[i].padding(0);
    }

    var boundsWithoutAxes;
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
      boundsWithoutAxes = contentAreaBounds.clone();
      this.topAxisPadding_ = NaN;
      this.bottomAxisPadding_ = NaN;
      this.leftAxisPadding_ = NaN;
      this.rightAxisPadding_ = NaN;
      var axisStrokeThickness;

      if (!xScrollerBeforeAxes) {
        switch (xScroller.orientation()) {
          case anychart.enums.Orientation.TOP:
            xScroller.padding()['top'](topOffset + (this.topAxisPadding_ || 0));
            xScroller.padding()['bottom'](0);
            topOffset += xScrollerSize;
            break;
          case anychart.enums.Orientation.BOTTOM:
            xScroller.padding()['top'](0);
            xScroller.padding()['bottom'](bottomOffset + (this.bottomAxisPadding_ || 0));
            bottomOffset += xScrollerSize;
            break;
          case anychart.enums.Orientation.LEFT:
            xScroller.padding()['left'](leftOffset + (this.leftAxisPadding_ || 0));
            xScroller.padding()['right'](0);
            leftOffset += xScrollerSize;
            break;
          case anychart.enums.Orientation.RIGHT:
            xScroller.padding()['left'](0);
            xScroller.padding()['right'](rightOffset + (this.rightAxisPadding_ || 0));
            rightOffset += xScrollerSize;
            break;
        }
      }

      if (!yScrollerBeforeAxes) {
        switch (yScroller.orientation()) {
          case anychart.enums.Orientation.TOP:
            yScroller.padding()['top'](topOffset + (this.topAxisPadding_ || 0));
            yScroller.padding()['bottom'](0);
            topOffset += yScrollerSize;
            break;
          case anychart.enums.Orientation.BOTTOM:
            yScroller.padding()['top'](0);
            yScroller.padding()['bottom'](bottomOffset + (this.bottomAxisPadding_ || 0));
            bottomOffset += yScrollerSize;
            break;
          case anychart.enums.Orientation.LEFT:
            yScroller.padding()['left'](leftOffset + (this.leftAxisPadding_ || 0));
            yScroller.padding()['right'](0);
            leftOffset += yScrollerSize;
            break;
          case anychart.enums.Orientation.RIGHT:
            yScroller.padding()['left'](0);
            yScroller.padding()['right'](rightOffset + (this.rightAxisPadding_ || 0));
            rightOffset += yScrollerSize;
            break;
        }
      }

      for (i = axes.length; i--;) {
        axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
        if (axis && axis.enabled()) {
          axis.parentBounds(contentAreaBounds);
          orientation = axis.orientation();
          axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(axis.stroke()));

          if (orientation == anychart.enums.Orientation.TOP) {
            axis.padding()['top'](topOffset);
            axis.padding()['bottom'](0);
            remainingBounds = axis.getRemainingBounds();
            topOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.topAxisPadding_))
              this.topAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.BOTTOM) {
            axis.padding()['bottom'](bottomOffset);
            axis.padding()['top'](0);
            remainingBounds = axis.getRemainingBounds();
            bottomOffset = contentAreaBounds.height - remainingBounds.height;
            if (isNaN(this.bottomAxisPadding_))
              this.bottomAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.LEFT) {
            axis.padding()['left'](leftOffset);
            axis.padding()['right'](0);
            remainingBounds = axis.getRemainingBounds();
            leftOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.leftAxisPadding_))
              this.leftAxisPadding_ = axisStrokeThickness;
          } else if (orientation == anychart.enums.Orientation.RIGHT) {
            axis.padding()['right'](rightOffset);
            axis.padding()['left'](0);
            remainingBounds = axis.getRemainingBounds();
            rightOffset = contentAreaBounds.width - remainingBounds.width;
            if (isNaN(this.rightAxisPadding_))
              this.rightAxisPadding_ = axisStrokeThickness;
          }
        }
      }

      if (xScrollerBeforeAxes) {
        switch (xScroller.orientation()) {
          case anychart.enums.Orientation.TOP:
            xScroller.padding()['top'](topOffset + (this.topAxisPadding_ || 0));
            xScroller.padding()['bottom'](0);
            topOffset += xScrollerSize;
            break;
          case anychart.enums.Orientation.BOTTOM:
            xScroller.padding()['top'](0);
            xScroller.padding()['bottom'](bottomOffset + (this.bottomAxisPadding_ || 0));
            bottomOffset += xScrollerSize;
            break;
          case anychart.enums.Orientation.LEFT:
            xScroller.padding()['left'](leftOffset + (this.leftAxisPadding_ || 0));
            xScroller.padding()['right'](0);
            leftOffset += xScrollerSize;
            break;
          case anychart.enums.Orientation.RIGHT:
            xScroller.padding()['left'](0);
            xScroller.padding()['right'](rightOffset + (this.rightAxisPadding_ || 0));
            rightOffset += xScrollerSize;
            break;
        }
      }

      if (yScrollerBeforeAxes) {
        switch (yScroller.orientation()) {
          case anychart.enums.Orientation.TOP:
            yScroller.padding()['top'](topOffset + (this.topAxisPadding_ || 0));
            yScroller.padding()['bottom'](0);
            topOffset += yScrollerSize;
            break;
          case anychart.enums.Orientation.BOTTOM:
            yScroller.padding()['top'](0);
            yScroller.padding()['bottom'](bottomOffset + (this.bottomAxisPadding_ || 0));
            bottomOffset += yScrollerSize;
            break;
          case anychart.enums.Orientation.LEFT:
            yScroller.padding()['left'](leftOffset + (this.leftAxisPadding_ || 0));
            yScroller.padding()['right'](0);
            leftOffset += yScrollerSize;
            break;
          case anychart.enums.Orientation.RIGHT:
            yScroller.padding()['left'](0);
            yScroller.padding()['right'](rightOffset + (this.rightAxisPadding_ || 0));
            rightOffset += yScrollerSize;
            break;
        }
      }

      if (xScrollerHorizontal) {
        xScroller.padding()['left'](leftOffset);
        xScroller.padding()['right'](rightOffset);
      } else {
        xScroller.padding()['top'](topOffset);
        xScroller.padding()['bottom'](bottomOffset);
      }

      if (yScrollerHorizontal) {
        yScroller.padding()['left'](leftOffset);
        yScroller.padding()['right'](rightOffset);
      } else {
        yScroller.padding()['top'](topOffset);
        yScroller.padding()['bottom'](bottomOffset);
      }

      boundsWithoutAxes.left += leftOffset;
      boundsWithoutAxes.top += topOffset;
      boundsWithoutAxes.width -= rightOffset + leftOffset;
      boundsWithoutAxes.height -= bottomOffset + topOffset;

      for (i = axes.length; i--;) {
        axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
        if (axis && axis.enabled()) {
          var remainingBoundsBeforeSetPadding = axis.getRemainingBounds();

          if (axis.isHorizontal()) {
            axis.padding()['left'](leftOffset);
            axis.padding()['right'](rightOffset);
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.height != remainingBoundsBeforeSetPadding.height) {
              complete = false;
            }
          } else {
            axis.padding()['top'](topOffset);
            axis.padding()['bottom'](bottomOffset);
            remainingBounds = axis.getRemainingBounds();
            if (remainingBounds.width != remainingBoundsBeforeSetPadding.width) {
              complete = false;
            }
          }
        }
      }
      attempt++;
    } while (!complete && attempt < anychart.charts.HeatMap.MAX_ATTEMPTS_AXES_CALCULATION_);

    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      this.xAxes_[i].resumeSignalsDispatching(false);
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      this.yAxes_[i].resumeSignalsDispatching(false);
    }

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone().round();

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.HEATMAP_AXES |
        anychart.ConsistencyState.HEATMAP_GRIDS |
        anychart.ConsistencyState.HEATMAP_SERIES |
        anychart.ConsistencyState.HEATMAP_X_SCROLLER |
        anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_X_SCROLLER)) {
    this.xScroller().container(this.rootElement);
    this.xScroller().draw();
    this.markConsistent(anychart.ConsistencyState.HEATMAP_X_SCROLLER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_Y_SCROLLER)) {
    this.yScroller().container(this.rootElement);
    this.yScroller().draw();
    this.markConsistent(anychart.ConsistencyState.HEATMAP_Y_SCROLLER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_GRIDS)) {
    var grids = this.grids_;

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
    this.markConsistent(anychart.ConsistencyState.HEATMAP_GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_AXES)) {
    for (i = 0, count = axes.length; i < count; i++) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.HEATMAP_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.HEATMAP_SERIES)) {
    var series = this.series_;
    series.container(this.rootElement);
    series.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_, this.leftAxisPadding_);
    series.parentBounds(this.dataBounds_);

    this.drawSeries_();
    this.markConsistent(anychart.ConsistencyState.HEATMAP_SERIES);
  }

  this.xScroller().resumeSignalsDispatching(false);
  this.yScroller().resumeSignalsDispatching(false);
  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Renders the chart.
 * @private
 */
anychart.charts.HeatMap.prototype.drawSeries_ = function() {
  var iterator;
  var series;
  var pointState;

  series = this.series_;

  series.startDrawing();

  var labels, hoverLabels, selectLabels;
  var adjustFontSize, hoverAdjustFontSize, selectAdjustFontSize;
  var needAdjustFontSize, hoverNeedAdjustFontSize, selectNeedAdjustFontSize;

  labels = this.labels();
  hoverLabels = this.hoverLabels();
  selectLabels = this.selectLabels();

  adjustFontSize = labels.adjustFontSize();
  hoverAdjustFontSize = hoverLabels.adjustFontSize();
  selectAdjustFontSize = selectLabels.adjustFontSize();

  var normalAdjustFontSizeSetting = (adjustFontSize['width'] || adjustFontSize['height']);
  needAdjustFontSize = normalAdjustFontSizeSetting && labels.enabled();
  hoverNeedAdjustFontSize = (normalAdjustFontSizeSetting || hoverAdjustFontSize['width'] || hoverAdjustFontSize['height']) && (labels.enabled() || hoverLabels.enabled());
  selectNeedAdjustFontSize = (normalAdjustFontSizeSetting || selectAdjustFontSize['width'] || selectAdjustFontSize['height']) && (labels.enabled() || selectLabels.enabled());

  iterator = series.getResetIterator();
  var minFontSize, hoverMinFontSize, selectMinFontSize;
  while (iterator.advance()) {
    var index = iterator.getIndex();
    if (iterator.get('selected')) {
      series.state.setPointState(anychart.PointState.SELECT, index);
      //TODO(AntonKagakin): rewrite it. This is because the HeatMap makes the following:
      // 1) finds the selected label
      // 2) sets state
      // 3) redraws all labels that were already drawn (because finalizePointAppearance calls label.draw())
      // 4) resets iterator (because it is used in drawing)
      // 5) selects iterator to a label prior to the last one
      // 6) ...
      // 7) PROFIT! - infinite loop!
      iterator.select(index);
    }

    pointState = series.state.getPointStateByIndex(index);

    var pointDrew = series.drawPoint(pointState);

    if (pointDrew) {
      if (needAdjustFontSize || hoverNeedAdjustFontSize || selectNeedAdjustFontSize) {
        var shape = iterator.meta('shape');
        var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shape.stroke())) / 2;
        var cellBounds = anychart.math.rect(
            /** @type {number} */(iterator.meta('x')) + thickness,
            /** @type {number} */(iterator.meta('y')) + thickness,
            /** @type {number} */(iterator.meta('width')) - thickness * 2,
            /** @type {number} */(iterator.meta('height')) - thickness * 2
            );

        if (needAdjustFontSize) {
          var label = series.configureLabel(anychart.PointState.NORMAL, true);
          if (label) {
            var mergedSettings = label.getMergedSettings();
            var padding = mergedSettings['padding'];

            var width = cellBounds.width - padding.getOption('left') - padding.getOption('right');
            var height = cellBounds.height - padding.getOption('top') - padding.getOption('bottom');

            var needAdjust = (mergedSettings['adjustByHeight'] || mergedSettings['adjustByHeight']);
            if (needAdjust && this.labels().adjustFontSizeMode() == anychart.enums.AdjustFontSizeMode.SAME) {
              var fontSize = label.calculateFontSize(
                  width,
                  height,
                  mergedSettings['minFontSize'],
                  mergedSettings['maxFontSize'],
                  mergedSettings['adjustByWidth'],
                  mergedSettings['adjustByHeight']);

              if (!goog.isDef(minFontSize)) {
                minFontSize = fontSize;
              } else if (fontSize < minFontSize) {
                minFontSize = fontSize;
              }
            }
          }
        }

        if (hoverNeedAdjustFontSize) {
          var label = series.configureLabel(anychart.PointState.HOVER, true);
          if (label) {
            var mergedSettings = label.getMergedSettings();
            var padding = mergedSettings['padding'];

            var width = cellBounds.width - padding.getOption('left') - padding.getOption('right');
            var height = cellBounds.height - padding.getOption('top') - padding.getOption('bottom');

            var needAdjust = (mergedSettings['adjustByHeight'] || mergedSettings['adjustByHeight']);
            if (needAdjust && this.labels().adjustFontSizeMode() == anychart.enums.AdjustFontSizeMode.SAME) {
              var fontSize = label.calculateFontSize(
                  width,
                  height,
                  mergedSettings['minFontSize'],
                  mergedSettings['maxFontSize'],
                  mergedSettings['adjustByWidth'],
                  mergedSettings['adjustByHeight']);

              if (!goog.isDef(hoverMinFontSize)) {
                hoverMinFontSize = fontSize;
              } else if (fontSize < hoverMinFontSize) {
                hoverMinFontSize = fontSize;
              }
            }
          }
        }

        if (selectNeedAdjustFontSize) {
          var label = series.configureLabel(anychart.PointState.SELECT, true);
          if (label) {
            var mergedSettings = label.getMergedSettings();
            var padding = mergedSettings['padding'];

            var width = cellBounds.width - padding.getOption('left') - padding.getOption('right');
            var height = cellBounds.height - padding.getOption('top') - padding.getOption('bottom');

            var needAdjust = (mergedSettings['adjustByHeight'] || mergedSettings['adjustByHeight']);
            if (needAdjust && this.labels().adjustFontSizeMode() == anychart.enums.AdjustFontSizeMode.SAME) {
              var fontSize = label.calculateFontSize(
                  width,
                  height,
                  mergedSettings['minFontSize'],
                  mergedSettings['maxFontSize'],
                  mergedSettings['adjustByWidth'],
                  mergedSettings['adjustByHeight']);


              if (!goog.isDef(selectMinFontSize)) {
                selectMinFontSize = fontSize;
              } else if (fontSize < selectMinFontSize) {
                selectMinFontSize = fontSize;
              }
            }
          }
        }
      }
    }
  }

  if (needAdjustFontSize) {
    labels.setAdjustFontSize(minFontSize);
  } else {
    labels.setAdjustFontSize(null);
  }

  if (hoverNeedAdjustFontSize) {
    hoverLabels.setAdjustFontSize(hoverMinFontSize);
  } else {
    hoverLabels.setAdjustFontSize(null);
  }

  if (selectNeedAdjustFontSize) {
    selectLabels.setAdjustFontSize(selectMinFontSize);
  } else {
    selectLabels.setAdjustFontSize(null);
  }

  labels.clear();
  series.drawLabels();

  series.finalizeDrawing();
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.HeatMap.prototype.invalidateSeries_ = function() {
  this.series_.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Overwritten series methods. (for encapsulation series)
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for current fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.HeatMap|Function} .
 */
anychart.charts.HeatMap.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.series_.fill(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy);
    return this;
  }
  return this.series_.fill();
};


/**
 * Getter/setter for current hover fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.HeatMap|Function} .
 */
anychart.charts.HeatMap.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.series_.hoverFill(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy);
    return this;
  }
  return this.series_.hoverFill();
};


/**
 * Getter/setter for current select fill color.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.charts.HeatMap|Function} .
 */
anychart.charts.HeatMap.prototype.selectFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.series_.selectFill(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy);
    return this;
  }
  return this.series_.selectFill();
};


/**
 * Getter/setter for current stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.HeatMap|acgraph.vector.Stroke|Function} .
 */
anychart.charts.HeatMap.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.series_.stroke(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap);
    return this;
  }
  return this.series_.stroke();
};


/**
 * Getter/setter for current hover stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.HeatMap|acgraph.vector.Stroke|Function} .
 */
anychart.charts.HeatMap.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.series_.hoverStroke(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap);
    return this;
  }
  return this.series_.hoverStroke();
};


/**
 * Getter/setter for current select stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.charts.HeatMap|acgraph.vector.Stroke|Function} .
 */
anychart.charts.HeatMap.prototype.selectStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.series_.selectStroke(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap);
    return this;
  }
  return this.series_.selectStroke();
};


/**
 * Getter/setter for current hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.HeatMap|Function|boolean} Hatch fill.
 */
anychart.charts.HeatMap.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    this.series_.hatchFill(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size);
    return this;
  }
  return this.series_.hatchFill();
};


/**
 * Getter/setter for current hover hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.HeatMap|Function|boolean} Hatch fill.
 */
anychart.charts.HeatMap.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    this.series_.hoverHatchFill(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size);
    return this;
  }
  return this.series_.hoverHatchFill();
};


/**
 * Getter/setter for selected hatch fill settings.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.charts.HeatMap|Function|boolean} Hatch fill.
 */
anychart.charts.HeatMap.prototype.selectHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    this.series_.selectHatchFill(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size);
    return this;
  }
  return this.series_.selectHatchFill();
};


/**
 * Getter/setter for current series data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.HeatMap)} Labels instance or itself for chaining call.
 */
anychart.charts.HeatMap.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.series_.labels(opt_value);
    return this;
  }
  return this.series_.labels();
};


/**
 * Gets or sets series hover data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.HeatMap)} Labels instance or itself for chaining call.
 */
anychart.charts.HeatMap.prototype.hoverLabels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.series_.hoverLabels(opt_value);
    return this;
  }
  return this.series_.hoverLabels();
};


/**
 * Gets or sets series select data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.charts.HeatMap)} Labels instance or itself for chaining call.
 */
anychart.charts.HeatMap.prototype.selectLabels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.series_.selectLabels(opt_value);
    return this;
  }
  return this.series_.selectLabels();
};


/**
 * Getter/setter for current series markers.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.HeatMap)} Marker instance or itself for chaining call.
 */
anychart.charts.HeatMap.prototype.markers = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.series_.markers(opt_value);
    return this;
  }
  return this.series_.markers();
};


/**
 * Gets or sets series hover markers.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.HeatMap)} Marker instance or itself for chaining call.
 */
anychart.charts.HeatMap.prototype.hoverMarkers = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.series_.hoverMarkers(opt_value);
    return this;
  }
  return this.series_.hoverMarkers();
};


/**
 * Gets or sets series select markers.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.charts.HeatMap)} Marker instance or itself for chaining call.
 */
anychart.charts.HeatMap.prototype.selectMarkers = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.series_.selectMarkers(opt_value);
    return this;
  }
  return this.series_.selectMarkers();
};


/**
 * Getter/setter for mapping.
 * @param {?(anychart.data.View|anychart.data.Set|anychart.data.TableData|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.HeatMap|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.HeatMap.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      if (opt_value['caption']) this.title(opt_value['caption']);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }
    this.series_.data(opt_value, opt_csvSettings);
    return this;
  }
  return this.series_.data();
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.charts.HeatMap.prototype.getIterator = function() {
  return this.series_.getIterator();
};


/**
 * If index is passed, hovers a point by its index, else hovers all points.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 * @return {!anychart.charts.HeatMap} instance for method chaining.
 */
anychart.charts.HeatMap.prototype.hover = function(opt_indexOrIndexes) {
  this.series_.hover(opt_indexOrIndexes);
  return this;
};


/**
 * Imitates selects a point by its index.
 * @param {(number|Array.<number>)=} opt_indexOrIndexes Index or array of indexes of the point to select.
 * @return {!anychart.charts.HeatMap} instance for method chaining.
 */
anychart.charts.HeatMap.prototype.select = function(opt_indexOrIndexes) {
  this.series_.select(opt_indexOrIndexes);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.HeatMap.base(this, 'setupByJSON', config, opt_default);

  if ('defaultXAxisSettings' in config)
    this.defaultXAxisSettings(config['defaultXAxisSettings']);

  if ('defaultYAxisSettings' in config)
    this.defaultYAxisSettings(config['defaultYAxisSettings']);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  var i, json, scale;
  var grids = config['grids'];
  var xAxes = config['xAxes'];
  var yAxes = config['yAxes'];
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
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], true);
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

  json = config['colorScale'];
  if (goog.isNumber(json)) {
    scale = scalesInstances[json];
  } else if (goog.isString(json)) {
    scale = anychart.scales.Base.fromString(json, null);
    if (!scale)
      scale = scalesInstances[json];
  } else if (goog.isObject(json)) {
    scale = anychart.scales.Base.fromString(json['type'], null);
    if (scale)
      scale.setup(json);
  } else {
    scale = null;
  }
  if (scale)
    this.colorScale(scale);

  if (goog.isArray(xAxes)) {
    for (i = 0; i < xAxes.length; i++) {
      json = xAxes[i];
      this.xAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.xAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(yAxes)) {
    for (i = 0; i < yAxes.length; i++) {
      json = yAxes[i];
      this.yAxis(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.yAxis(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(grids)) {
    for (i = 0; i < grids.length; i++) {
      json = grids[i];
      this.grid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.grid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isFunction(this['fill']))
    this.fill(config['fill']);
  if (goog.isFunction(this['hoverFill']))
    this.hoverFill(config['hoverFill']);
  if (goog.isFunction(this['selectFill']))
    this.selectFill(config['selectFill']);

  if (goog.isFunction(this['stroke']))
    this.stroke(config['stroke']);
  if (goog.isFunction(this['hoverStroke']))
    this.hoverStroke(config['hoverStroke']);
  if (goog.isFunction(this['selectStroke']))
    this.selectStroke(config['selectStroke']);

  if (goog.isFunction(this['hatchFill']))
    this.hatchFill(config['hatchFill']);
  if (goog.isFunction(this['hoverHatchFill']))
    this.hoverHatchFill(config['hoverHatchFill']);
  if (goog.isFunction(this['selectHatchFill']))
    this.selectHatchFill(config['selectHatchFill']);

  if ('data' in config)
    this.data(config['data'] || null);

  this.labels().setup(config['labels']);
  this.hoverLabels().setup(config['hoverLabels']);
  this.selectLabels().setup(config['selectLabels']);

  this.markers().setup(config['markers']);
  this.hoverMarkers().setup(config['hoverMarkers']);
  this.selectMarkers().setup(config['selectMarkers']);

  this.labelsDisplayMode(config['labelsDisplayMode']);

  this.xScroller(config['xScroller']);
  this.yScroller(config['yScroller']);

  var xZoom = config['xZoom'];
  var tmp;
  if (goog.isObject(xZoom) && (goog.isNumber(xZoom['scale']) || goog.isString(xZoom['scale']))) {
    tmp = xZoom['scale'];
    xZoom['scale'] = scalesInstances[xZoom['scale']];
    this.xZoom(xZoom);
    xZoom['scale'] = tmp;
  } else {
    this.xZoom(xZoom);
  }

  var yZoom = config['yZoom'];
  if (goog.isObject(yZoom) && (goog.isNumber(yZoom['scale']) || goog.isString(yZoom['scale']))) {
    tmp = yZoom['scale'];
    yZoom['scale'] = scalesInstances[yZoom['scale']];
    this.xZoom(yZoom);
    yZoom['scale'] = tmp;
  } else {
    this.xZoom(yZoom);
  }
};


/**
 * @inheritDoc
 */
anychart.charts.HeatMap.prototype.serialize = function() {
  var json = anychart.charts.HeatMap.base(this, 'serialize');
  var i;
  var scalesIds = {};
  var scales = [];
  var axesIds = [];

  var scale;
  var config;
  var objId;
  var axisId;
  var axis;
  var axisIndex;
  var axisScale;
  var axisOrientation;
  var isHorizontal;

  scalesIds[goog.getUid(this.xScale())] = this.xScale().serialize();
  scales.push(scalesIds[goog.getUid(this.xScale())]);
  json['xScale'] = scales.length - 1;

  if (this.xScale() != this.yScale()) {
    scalesIds[goog.getUid(this.yScale())] = this.yScale().serialize();
    scales.push(scalesIds[goog.getUid(this.yScale())]);
  }
  json['yScale'] = scales.length - 1;

  if (this.colorScale()) {
    scalesIds[goog.getUid(this.colorScale())] = this.colorScale().serialize();
    scales.push(scalesIds[goog.getUid(this.colorScale())]);
    json['colorScale'] = scales.length - 1;
  }

  json['type'] = this.getType();

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    var xAxis = this.xAxes_[i];
    if (xAxis) {
      config = xAxis.serialize();
      scale = xAxis.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      xAxes.push(config);
    }
  }
  if (xAxes.length)
    json['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
    if (yAxis) {
      config = yAxis.serialize();
      scale = yAxis.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }
      yAxes.push(config);
    }
  }
  if (yAxes.length)
    json['yAxes'] = yAxes;


  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
    if (grid) {
      config = grid.serialize();
      scale = grid.scale();
      if (scale) {
        objId = goog.getUid(scale);
        if (!scalesIds[objId]) {
          scalesIds[objId] = scale.serialize();
          scales.push(scalesIds[objId]);
          config['scale'] = scales.length - 1;
        } else {
          config['scale'] = goog.array.indexOf(scales, scalesIds[objId]);
        }
      }

      axis = grid.axis();
      if (axis) {
        axisId = goog.getUid(axis);
        axisIndex = goog.array.indexOf(axesIds, axisId);
        if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
          axisScale = axis.scale();
          if (!('layout' in config)) {
            axisOrientation = axis.orientation();
            isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
            config['layout'] = isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
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

  if (scales.length)
    json['scales'] = scales;

  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['selectFill'])) {
    if (goog.isFunction(this.selectFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectFill']
      );
    } else {
      json['selectFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.selectFill()));
    }
  }

  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['selectStroke'])) {
    if (goog.isFunction(this.selectStroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectStroke']
      );
    } else {
      json['selectStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.selectStroke()));
    }
  }

  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series hoverHatchFill']
      );
    } else {
      var hoverHatchFill = this.hoverHatchFill();
      if (goog.isDef(hoverHatchFill)) {
        json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(hoverHatchFill));
      }
    }
  }
  if (goog.isFunction(this['selectHatchFill'])) {
    if (goog.isFunction(this.selectHatchFill())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Series selectHatchFill']
      );
    } else {
      json['selectHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.selectHatchFill()));
    }
  }

  json['data'] = this.data().serialize();

  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().getChangedSettings();
  json['selectLabels'] = this.selectLabels().getChangedSettings();
  if (goog.isNull(json['hoverLabels']['enabled'])) {
    delete json['hoverLabels']['enabled'];
  }
  if (goog.isNull(json['selectLabels']['enabled'])) {
    delete json['selectLabels']['enabled'];
  }

  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();
  json['selectMarkers'] = this.selectMarkers().serialize();

  json['labelsDisplayMode'] = this.labelsDisplayMode();

  json['xScroller'] = this.xScroller().serialize();
  json['yScroller'] = this.yScroller().serialize();
  json['xZoom'] = this.xZoom().serialize();
  json['yZoom'] = this.yZoom().serialize();

  return {'chart': json};
};


/**
 * Labels display mode.
 * @param {(string|anychart.enums.LabelsDisplayMode)=} opt_value Mode to set.
 * @return {string|anychart.enums.LabelsDisplayMode|anychart.charts.HeatMap}
 */
anychart.charts.HeatMap.prototype.labelsDisplayMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeLabelsDisplayMode(opt_value);
    if (this.labelDisplayMode_ != opt_value) {
      this.labelDisplayMode_ = opt_value;
      this.invalidate(anychart.ConsistencyState.HEATMAP_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelDisplayMode_;
};


//exports
(function() {
  var proto = anychart.charts.HeatMap.prototype;
  proto['getType'] = proto.getType;

  proto['grid'] = proto.grid;

  proto['xAxis'] = proto.xAxis;
  proto['yAxis'] = proto.yAxis;

  proto['xScale'] = proto.xScale;
  proto['yScale'] = proto.yScale;

  proto['labelsDisplayMode'] = proto.labelsDisplayMode;

  proto['fill'] = proto.fill;
  proto['hoverFill'] = proto.hoverFill;
  proto['selectFill'] = proto.selectFill;

  proto['stroke'] = proto.stroke;
  proto['hoverStroke'] = proto.hoverStroke;
  proto['selectStroke'] = proto.selectStroke;

  proto['hatchFill'] = proto.hatchFill;
  proto['hoverHatchFill'] = proto.hoverHatchFill;
  proto['selectHatchFill'] = proto.selectHatchFill;

  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['markers'] = proto.markers;
  proto['hoverMarkers'] = proto.hoverMarkers;
  proto['selectMarkers'] = proto.selectMarkers;

  proto['hover'] = proto.hover;
  proto['select'] = proto.select;

  proto['unhover'] = proto.unhover;
  proto['unselect'] = proto.unselect;

  proto['data'] = proto.data;

  proto['colorScale'] = proto.colorScale;

  proto['xZoom'] = proto.xZoom;
  proto['yZoom'] = proto.yZoom;
  proto['xScroller'] = proto.xScroller;
  proto['yScroller'] = proto.yScroller;
})();
