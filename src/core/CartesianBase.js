goog.provide('anychart.core.CartesianBase');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.animations');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalZoom');
goog.require('anychart.enums');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.HatchFills');
goog.require('anychart.palettes.Markers');
goog.require('anychart.palettes.RangeColors');
goog.require('anychart.scales');



/**
 * CartesianBase chart class.
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IZoomableChart}
 * @implements {anychart.core.IChart}
 * @implements {anychart.core.IPlot}
 * @constructor
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 */
anychart.core.CartesianBase = function(opt_barChartMode) {
  anychart.core.CartesianBase.base(this, 'constructor');

  /**
   * @type {anychart.core.ui.Crosshair}
   * @private
   */
  this.crosshair_ = null;

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
   * @type {!Array.<anychart.core.series.Cartesian>}
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
   * @type {Array.<anychart.core.axisMarkers.Line>|Array.<anychart.core.axisMarkers.Line3d>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>|Array.<anychart.core.axisMarkers.Range3d>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>|Array.<anychart.core.axisMarkers.Text3d>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>|Array.<anychart.core.grids.Linear3d>}
   * @private
   */
  this.grids_ = [];

  /**
   * @type {Array.<anychart.core.grids.Linear>|Array.<anychart.core.grids.Linear3d>}
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
   * @protected
   */
  this.dataBounds = null;

  /**
   * @type {number}
   * @private
   */
  this.barGroupsPadding_;

  /**
   * @type {number}
   * @private
   */
  this.barsPadding_;

  /**
   * Max size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.maxBubbleSize_;

  /**
   * Min size for all bubbles on the chart.
   * @type {string|number}
   * @private
   */
  this.minBubbleSize_;

  /**
   * Zoom settings.
   * @type {anychart.core.utils.OrdinalZoom}
   * @private
   */
  this.xZoom_ = new anychart.core.utils.OrdinalZoom(this, true);

  /**
   * Chart has stacked series.
   * @type {boolean}
   * @protected
   */
  this.hasStackedSeries = false;

  this.defaultSeriesType(anychart.enums.CartesianSeriesType.LINE);
  this.setType(anychart.enums.ChartTypes.CARTESIAN);
};
goog.inherits(anychart.core.CartesianBase, anychart.core.SeparateChart);


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @protected
 */
anychart.core.CartesianBase.MAX_ATTEMPTS_AXES_CALCULATION = 5;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.core.CartesianBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CARTESIAN_PALETTE |
    anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE |
    anychart.ConsistencyState.CARTESIAN_HATCH_FILL_PALETTE |
    anychart.ConsistencyState.CARTESIAN_SCALES |
    anychart.ConsistencyState.CARTESIAN_SCALE_MAPS |
    anychart.ConsistencyState.CARTESIAN_Y_SCALES |
    anychart.ConsistencyState.CARTESIAN_SERIES |
    anychart.ConsistencyState.CARTESIAN_AXES |
    anychart.ConsistencyState.CARTESIAN_AXES_MARKERS |
    anychart.ConsistencyState.CARTESIAN_GRIDS |
    anychart.ConsistencyState.CARTESIAN_CROSSHAIR |
    anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
    anychart.ConsistencyState.CARTESIAN_ZOOM;


/**
 * Series z-index in chart root layer.
 * @type {number}
 */
anychart.core.CartesianBase.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.core.CartesianBase.ZINDEX_LINE_SERIES = 31;


/**
 * Marker z-index in chart root layer.
 * @type {number}
 */
anychart.core.CartesianBase.ZINDEX_MARKER = 40;


/**
 * Z-index increment multiplier.
 * @type {number}
 */
anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER = 0.00001;


/**
 * Series config for the chart.
 * @type {Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.core.CartesianBase.prototype.seriesConfig = ({});


/**
 * Getter/setter for cartesian defaultSeriesType.
 * @param {(string|anychart.enums.CartesianSeriesType)=} opt_value Default series type.
 * @return {anychart.core.CartesianBase|anychart.enums.CartesianSeriesType} Default series type or self for chaining.
 */
anychart.core.CartesianBase.prototype.defaultSeriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeCartesianSeriesType(opt_value);
    this.defaultSeriesType_ = opt_value;
    return this;
  }
  return this.defaultSeriesType_;
};


/**
 * Sets chart type. Needed for proper serialization.
 * @param {anychart.enums.ChartTypes} value
 */
anychart.core.CartesianBase.prototype.setType = function(value) {
  /**
   * @type {anychart.enums.ChartTypes}
   * @private
   */
  this.type_ = value;
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.getType = function() {
  return this.type_;
};


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
anychart.core.CartesianBase.prototype.invalidateZoom = function(forX) {
  // we do not distinguish between x and y zoom because we have only the x one
  this.invalidate(anychart.ConsistencyState.CARTESIAN_ZOOM, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns default scale for given dimension.
 * @param {boolean} forX
 * @return {anychart.scales.Base}
 */
anychart.core.CartesianBase.prototype.getDefaultScale = function(forX) {
  return /** @type {anychart.scales.Base} */(forX ? this.xScale() : this.yScale());
};


/**
 * Ensures that scales are ready for zooming.
 */
anychart.core.CartesianBase.prototype.ensureScalesReadyForZoom = function() {
  this.makeScaleMaps();
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALES)) {
    if (!!this.xZoom().getSetup())
      this.calculateXScales();
  }
};
//endregion


/**
 * Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.core.CartesianBase|anychart.core.utils.OrdinalZoom}
 */
anychart.core.CartesianBase.prototype.xZoom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.suspendSignalsDispatching();
    this.xZoom_.setup(opt_value);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.xZoom_;
};


/**
 * Scroller getter-setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.core.CartesianBase}
 */
anychart.core.CartesianBase.prototype.xScroller = function(opt_value) {
  if (!this.xScroller_) {
    this.xScroller_ = new anychart.core.ui.ChartScroller();
    this.xScroller_.setParentEventTarget(this);
    this.xScroller_.listenSignals(this.scrollerInvalidated_, this);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE_START, this.scrollerChangeStartHandler_);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler_);
    this.eventsHandler.listen(this.xScroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeFinishHandler_);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
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
 * Scroller signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.CartesianBase.prototype.scrollerInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.CARTESIAN_X_SCROLLER;
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
anychart.core.CartesianBase.prototype.scrollerChangeStartHandler_ = function(e) {
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
anychart.core.CartesianBase.prototype.scrollerChangeHandler_ = function(e) {
  if (this.xZoom_.continuous()) {
    e.preventDefault();
    this.suspendSignalsDispatching();
    this.xZoom_.setTo(e['startRatio'], e['endRatio']);
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
anychart.core.CartesianBase.prototype.scrollerChangeFinishHandler_ = function(e) {
  if (!this.xZoom_.continuous()) {
    this.suspendSignalsDispatching();
    this.xZoom_.setTo(e['startRatio'], e['endRatio']);
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
 * Getter/setter for series default settings.
 * @param {Object=} opt_value Object with default series settings.
 * @return {Object}
 */
anychart.core.CartesianBase.prototype.defaultSeriesSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultSeriesSettings_ = opt_value;
    return this;
  }
  return this.defaultSeriesSettings_ || {};
};


/**
 * Getter/setter for x-axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.core.CartesianBase.prototype.defaultXAxisSettings = function(opt_value) {
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
anychart.core.CartesianBase.prototype.defaultYAxisSettings = function(opt_value) {
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
anychart.core.CartesianBase.prototype.defaultGridSettings = function(opt_value) {
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
anychart.core.CartesianBase.prototype.defaultMinorGridSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


/**
 * Getter/setter for line marker default settings.
 * @param {Object=} opt_value Object with line marker settings.
 * @return {Object}
 */
anychart.core.CartesianBase.prototype.defaultLineMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultLineMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultLineMarkerSettings_ || {};
};


/**
 * Getter/setter for text marker default settings.
 * @param {Object=} opt_value Object with text marker settings.
 * @return {Object}
 */
anychart.core.CartesianBase.prototype.defaultTextMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultTextMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultTextMarkerSettings_ || {};
};


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value Object with range marker settings.
 * @return {Object}
 */
anychart.core.CartesianBase.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value X Scale to set.
 * @return {!(anychart.scales.Base|anychart.core.CartesianBase)} Default chart scale value or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, true);
    }
    if (this.xScale_ != opt_value) {
      if (this.xScale_ && (this.xScale_ instanceof anychart.scales.Ordinal))
        this.xScale_.unlistenSignals(this.xScaleInvalidated_, this);
      this.xScale_ = opt_value;
      if (this.xScale_ instanceof anychart.scales.Ordinal)
        this.xScale_.listenSignals(this.xScaleInvalidated_, this);
      if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES)
        this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.CartesianBase.prototype.xScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION) &&
      this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
    this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.core.CartesianBase)} Default chart scale value or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SCALES |
          anychart.ConsistencyState.CARTESIAN_Y_SCALES |
          anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
          anychart.Signal.NEEDS_REDRAW);
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
 * @type {!Object.<!Array.<anychart.core.series.Cartesian>>}
 * @private
 */
anychart.core.CartesianBase.prototype.seriesOfStackedScaleMap_;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @protected
 */
anychart.core.CartesianBase.prototype.yScales;


/**
 * @type {!Object.<anychart.scales.Base>}
 * @protected
 */
anychart.core.CartesianBase.prototype.xScales;


/**
 * @type {!Object.<!Array.<anychart.core.series.Cartesian>>}
 * @private
 */
anychart.core.CartesianBase.prototype.seriesOfXScaleMap_;


/**
 * @type {!Object.<!Array.<anychart.core.series.Cartesian>>}
 * @private
 */
anychart.core.CartesianBase.prototype.seriesOfYScaleMap_;


/**
 * Sets default scale for layout based element depending on barChartMode.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.grids.Linear} item Item to set scale.
 * @protected
 */
anychart.core.CartesianBase.prototype.setDefaultScaleForLayoutBasedElements = function(item) {
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
 * Create Grid instance.
 * @return {!(anychart.core.grids.Linear|anychart.core.grids.Linear3d)}
 * @protected
 */
anychart.core.CartesianBase.prototype.createGridInstance = function() {
  return new anychart.core.grids.Linear();
};


/**
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.core.grids.Linear3d|anychart.core.CartesianBase)} Grid instance by index or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.grid = function(opt_indexOrValue, opt_value) {
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
    grid = this.createGridInstance();
    grid.setChart(this);
    grid.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Minor grid settings.
 * @param {(Object|boolean|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.grids.Linear|anychart.core.CartesianBase)} Minor grid instance by index or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.minorGrid = function(opt_indexOrValue, opt_value) {
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
    grid = this.createGridInstance();
    grid.setChart(this);
    grid.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @protected
 */
anychart.core.CartesianBase.prototype.onGridSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.CARTESIAN_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.core.CartesianBase)} Axis instance by index or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.xAxis = function(opt_indexOrValue, opt_value) {
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
    axis.setParentEventTarget(this);
    axis.setup(this.defaultXAxisSettings());
    this.xAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * Getter/setter for yAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.axes.Linear|anychart.core.CartesianBase)} Axis instance by index or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis.setParentEventTarget(this);
    axis.setup(this.defaultYAxisSettings());
    this.yAxes_[index] = axis;
    this.registerDisposable(axis);
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.CartesianBase.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CARTESIAN_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // if there are no signals, state == 0 and nothing happens.
  this.invalidate(state, signal);
};


/**
 * Gets axis by index. First of all goes through x-axes, then y-axes.
 * SAMPLE: if we have 4 x-axes and 3 y-axes, chart.getAxisByIndex(4) will return very first y-axis.
 * @param {number} index - Index to be found.
 * @return {anychart.core.axes.Linear|undefined}
 */
anychart.core.CartesianBase.prototype.getAxisByIndex = function(index) {
  return (index >= this.xAxes_.length) ? this.yAxes_[index - this.xAxes_.length] : this.xAxes_[index];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create lineMarker instance.
 * @return {!(anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Line3d)}
 * @protected
 */
anychart.core.CartesianBase.prototype.createLineMarkerInstance = function() {
  return new anychart.core.axisMarkers.Line();
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Line3d|anychart.core.CartesianBase)} Line marker instance by index or itself for method chaining.
 */
anychart.core.CartesianBase.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
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
    lineMarker = this.createLineMarkerInstance();
    lineMarker.setChart(this);
    lineMarker.setup(this.defaultLineMarkerSettings());
    lineMarker.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Create rangeMarker instance.
 * @return {!(anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Range3d)}
 * @protected
 */
anychart.core.CartesianBase.prototype.createRangeMarkerInstance = function() {
  return new anychart.core.axisMarkers.Range();
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Range3d|anychart.core.CartesianBase)} Range marker instance by index or itself for chaining call.
 */
anychart.core.CartesianBase.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
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
    rangeMarker = this.createRangeMarkerInstance();
    rangeMarker.setChart(this);
    rangeMarker.setup(this.defaultRangeMarkerSettings());
    rangeMarker.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Create textMarker instance.
 * @return {!(anychart.core.axisMarkers.Text|anychart.core.axisMarkers.Text3d)}
 * @protected
 */
anychart.core.CartesianBase.prototype.createTextMarkerInstance = function() {
  return new anychart.core.axisMarkers.Text();
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.core.axisMarkers.Text3d|anychart.core.CartesianBase)} Line marker instance by index or itself for chaining call.
 */
anychart.core.CartesianBase.prototype.textMarker = function(opt_indexOrValue, opt_value) {
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
    textMarker = this.createTextMarkerInstance();
    textMarker.setChart(this);
    textMarker.setup(this.defaultTextMarkerSettings());
    textMarker.setDefaultLayout(this.barChartMode ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
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
 * @protected
 */
anychart.core.CartesianBase.prototype.onMarkersSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Crosshair|anychart.core.CartesianBase)}
 */
anychart.core.CartesianBase.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.Crosshair();
    this.crosshair_.enabled(false);
    this.crosshair_.bindHandlers(this);
    this.registerDisposable(this.crosshair_);
    this.crosshair_.listenSignals(this.onCrosshairSignal_, this);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.crosshair_.setup(opt_value);
    return this;
  } else {
    return this.crosshair_;
  }
};


/**
 * Listener for crosshair invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.CartesianBase.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CARTESIAN_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.area = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.bar = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.CartesianSeriesType.BAR,
      data,
      opt_csvSettings
  );
};


/**
 * Adds Box series.
 * @example
 * var data = [
 *     {x: 'p1', low: 760, q1: 801, median: 848, q3: 895, high: 965, outliers: [650]},
 *     ['p2', 733, 853, 939, 980, 1080],
 *     ['p3', 714, 762, 817, 870, 918],
 *     ['p4', 724, 802, 806, 871, 950],
 *     ['p5', 834, 836, 864, 882, 910, [710, 970, 980]]
 * ];
 * var chart = anychart.box();
 * chart.box(data);
 * chart.container(stage).draw();
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.box = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.CartesianSeriesType.BOX,
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.bubble = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.candlestick = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.column = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.line = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.CartesianSeriesType.LINE,
      data,
      opt_csvSettings
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.marker = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.ohlc = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.rangeArea = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.rangeBar = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.rangeColumn = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.rangeSplineArea = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.rangeStepArea = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.spline = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.CartesianSeriesType.SPLINE,
      data,
      opt_csvSettings
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.splineArea = function(data, opt_csvSettings) {
  return this.createSeriesByType(
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.stepLine = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.CartesianSeriesType.STEP_LINE,
      data,
      opt_csvSettings
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
 * @return {anychart.core.series.Cartesian} {@link anychart.core.series.Cartesian} instance for method chaining.
 */
anychart.core.CartesianBase.prototype.stepArea = function(data, opt_csvSettings) {
  return this.createSeriesByType(
      anychart.enums.CartesianSeriesType.STEP_AREA,
      data,
      opt_csvSettings
  );
};


/**
 * Returns normalized series type and a config for this series type.
 * @param {string} type
 * @return {?Array.<string|anychart.core.series.TypeConfig>}
 */
anychart.core.CartesianBase.prototype.getConfigByType = function(type) {
  type = anychart.enums.normalizeCartesianSeriesType(type);
  var config = this.seriesConfig[type];
  var res;
  if (config && (config.drawerType in anychart.core.drawers.AvailableDrawers)) {
    res = [type, config];
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    res = null;
  }
  return res;
};


/**
 * @param {string} type Series type.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @protected
 * @return {anychart.core.series.Cartesian}
 */
anychart.core.CartesianBase.prototype.createSeriesByType = function(type, data, opt_csvSettings) {
  var configAndType = this.getConfigByType(type);
  if (configAndType) {
    type = /** @type {string} */(configAndType[0]);
    var config = /** @type {anychart.core.series.TypeConfig} */(configAndType[1]);
    var series = new anychart.core.series.Cartesian(this, this, type, config);
    this.registerDisposable(series);

    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */(lastSeries.autoIndex()) + 1 : 0;
    this.series_.push(series);
    var inc = index * anychart.core.CartesianBase.ZINDEX_INCREMENT_MULTIPLIER;
    var seriesZIndex = (series.isLineBased() ?
            anychart.core.CartesianBase.ZINDEX_LINE_SERIES :
            anychart.core.CartesianBase.ZINDEX_SERIES) + inc;

    series.autoIndex(index);
    series.data(data, opt_csvSettings);
    series.setAutoZIndex(seriesZIndex);
    series.clip(true);
    series.setAutoColor(this.palette().itemAt(index));
    series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    series.setParentEventTarget(this);
    series.listenSignals(this.seriesInvalidated, this);

    this.invalidate(
        // When you add 3D series, bounds may change (eg. afterDraw case).
        (series.check(anychart.core.drawers.Capabilities.IS_3D_BASED) ? anychart.ConsistencyState.BOUNDS : 0) |
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_Y_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
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
anychart.core.CartesianBase.prototype.addSeries = function(var_args) {
  var rv = [];
  var type = /** @type {string} */ (this.defaultSeriesType());
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
anychart.core.CartesianBase.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.series.Cartesian} Series instance.
 */
anychart.core.CartesianBase.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.series.Cartesian} Series instance.
 */
anychart.core.CartesianBase.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.core.CartesianBase.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.core.CartesianBase}
 */
anychart.core.CartesianBase.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.core.CartesianBase}
 */
anychart.core.CartesianBase.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_Y_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.core.CartesianBase} Self for method chaining.
 */
anychart.core.CartesianBase.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_Y_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.CartesianBase.prototype.seriesInvalidated = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.CARTESIAN_SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.CARTESIAN_SERIES;
    this.invalidateSeries();
    if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_Y_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS;
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
anychart.core.CartesianBase.prototype.getAllSeries = function() {
  return this.series_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series specific settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for barGroupsPadding.
 * @param {number=} opt_value .
 * @return {number|anychart.core.CartesianBase} .
 */
anychart.core.CartesianBase.prototype.barGroupsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barGroupsPadding_ != +opt_value) {
      this.barGroupsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.barGroupsPadding_;
};


/**
 * Getter/setter for barsPadding.
 * @param {number=} opt_value .
 * @return {number|anychart.core.CartesianBase} .
 */
anychart.core.CartesianBase.prototype.barsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barsPadding_ != +opt_value) {
      this.barsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.barsPadding_;
};


/**
 * Sets max size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.core.CartesianBase}
 */
anychart.core.CartesianBase.prototype.maxBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxBubbleSize_ != opt_value) {
      this.maxBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.maxBubbleSize_;
};


/**
 * Sets min size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.core.CartesianBase}
 */
anychart.core.CartesianBase.prototype.minBubbleSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.minBubbleSize_ != opt_value) {
      this.minBubbleSize_ = opt_value;
      this.invalidateSizeBasedSeries_();
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.minBubbleSize_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Calculation.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @protected
 */
anychart.core.CartesianBase.prototype.makeScaleMaps = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALE_MAPS)) {
    anychart.core.Base.suspendSignalsDispatching(this.series_);
    var i, j, series;
    var xScale = /** @type {anychart.scales.Base} */(this.xScale());
    var yScale = /** @type {anychart.scales.Base} */(this.yScale());
    var seriesCount = this.series_.length;
    var changed = false;
    /**
     * Y scales hash map by uid.
     * @type {Object.<string, anychart.scales.Base>}
     * @protected
     */
    this.yScales = {};
    /**
     * Y scales hash map by uid.
     * @type {Object.<string, anychart.scales.Base>}
     * @protected
     */
    this.xScales = {};
    for (i = 0; i < seriesCount; i++) {
      series = this.series_[i];
      if (!series) continue;

      //series X scale
      if (!series.xScale()) {
        series.xScale(xScale);
        changed = true;
      }
      this.xScales[goog.getUid(series.xScale())] = series.xScale();

      //series Y scale
      if (!series.yScale()) {
        series.yScale(yScale);
        changed = true;
      }
      this.yScales[goog.getUid(series.yScale())] = series.yScale();
    }
    if (changed) {
      this.invalidateSeries();
      this.invalidate(
          anychart.ConsistencyState.CARTESIAN_SERIES |
          anychart.ConsistencyState.CARTESIAN_SCALES |
          anychart.ConsistencyState.CARTESIAN_Y_SCALES);
    }
    anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_SCALE_MAPS);
  }
};


/**
 * @protected
 */
anychart.core.CartesianBase.prototype.calculateXScales = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALES)) {
    anychart.performance.start('x scales calculation');
    var i, j, series;
    var xScale;
    var seriesCount = this.series_.length;
    var drawingPlan, drawingPlans, drawingPlansByYScale, uid, point, val;
    /**
     * Drawing plans for each series.
     * @type {Array.<Object>}
     * @private
     */
    this.drawingPlans_ = [];
    /**
     * Drawing plans categorised by X scale.
     * @type {Object.<string, Array.<Object>>}
     * @private
     */
    this.drawingPlansByXScale_ = {};
    /**
     * Drawing plans categorised by Y and X scale (Y scale uid is outer index, X scale uid - inner).
     * @type {Object.<string, Object.<string, Array.<Object>>>}
     * @private
     */
    this.drawingPlansByYAndXScale_ = {};
    for (uid in this.xScales) {
      xScale = this.xScales[uid];
      if (xScale.needsAutoCalc())
        xScale.startAutoCalc();
    }
    for (i = 0; i < seriesCount; i++) {
      series = /** @type {anychart.core.series.Cartesian} */(this.series_[i]);
      if (!series || !series.enabled()) continue;
      xScale = /** @type {anychart.scales.Base} */(series.xScale());
      uid = goog.getUid(xScale);
      drawingPlans = this.drawingPlansByXScale_[uid];
      if (!drawingPlans)
        this.drawingPlansByXScale_[uid] = drawingPlans = [];
      if (xScale instanceof anychart.scales.Ordinal) {
        var xHashMap, xArray;
        var restricted = !xScale.needsAutoCalc();
        if (drawingPlans.length) {
          drawingPlan = drawingPlans[drawingPlans.length - 1];
          xHashMap = drawingPlan.xHashMap;
          xArray = drawingPlan.xArray;
        } else {
          if (restricted) {
            xArray = xScale.values();
            xHashMap = xScale.getValuesMapInternal();
          } else {
            xArray = [];
            xHashMap = {};
          }
        }
        drawingPlan = series.getOrdinalDrawingPlan(xHashMap, xArray, restricted, xScale.getNamesField() || undefined);
      } else {
        drawingPlan = series.getScatterDrawingPlan(true, xScale instanceof anychart.scales.DateTime);
      }
      drawingPlans.push(drawingPlan);
      this.drawingPlans_.push(drawingPlan);
      drawingPlansByYScale = this.drawingPlansByYAndXScale_[uid];
      if (!drawingPlansByYScale)
        this.drawingPlansByYAndXScale_[uid] = drawingPlansByYScale = {};
      uid = goog.getUid(series.yScale());
      drawingPlans = drawingPlansByYScale[uid];
      if (!drawingPlans)
        drawingPlansByYScale[uid] = drawingPlans = [];
      drawingPlans.push(drawingPlan);
    }
    for (uid in this.drawingPlansByXScale_) {
      drawingPlans = this.drawingPlansByXScale_[uid];
      xScale = /** @type {anychart.scales.Base} */(drawingPlans[0].series.xScale());
      // equalizing drawing plans and populating them with missing points
      if (drawingPlans.length > 1) {
        drawingPlan = drawingPlans[drawingPlans.length - 1];
        if (xScale instanceof anychart.scales.Ordinal) {
          var lastPlanXArray = drawingPlan.xArray;
          // we need to populate other series data with missing points to the length of the last array
          for (i = 0; i < drawingPlans.length - 1; i++) {
            drawingPlan = drawingPlans[i];
            for (j = drawingPlan.data.length; j < lastPlanXArray.length; j++) {
              drawingPlan.data.push(anychart.core.series.Cartesian.makeMissingPoint(lastPlanXArray[j]));
            }
          }
        } else {
          var registry = [];
          var data0, data1, dataLength0, dataLength1, current0, current1, val0, val1, inc0, inc1;
          // step one - we merge first two plans to prevent first light-loaded run on the first source with empty res array
          data0 = drawingPlans[0].data;
          data1 = drawingPlans[1].data;
          dataLength0 = data0.length;
          dataLength1 = data1.length;
          current0 = 0;
          current1 = 0;
          val0 = current0 < dataLength0 ? data0[current0].data['x'] : NaN;
          val1 = current1 < dataLength1 ? data0[current1].data['x'] : NaN;
          while (!isNaN(val0) && !isNaN(val1)) {
            inc0 = val0 <= val1;
            inc1 = val0 >= val1;
            registry.push(inc0 ? val0 : val1);
            if (inc0) {
              current0++;
              val0 = current0 < dataLength0 ? data0[current0].data['x'] : NaN;
            }
            if (inc1) {
              current1++;
              val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
            }
          }
          while (!isNaN(val0)) {
            registry.push(val0);
            current0++;
            val0 = current0 < dataLength0 ? data0[current0].data['x'] : NaN;
          }
          while (!isNaN(val1)) {
            registry.push(val1);
            current1++;
            val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
          }

          // step two - we merge i-th source and the merge result of the previous arrays.
          for (i = 2; i < drawingPlans.length; i++) {
            var res = [];
            data0 = registry;
            data1 = drawingPlans[i].data;
            dataLength0 = data0.length;
            dataLength1 = data1.length;
            current0 = 0;
            current1 = 0;
            val0 = current0 < dataLength0 ? data0[current0] : NaN;
            val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
            while (!isNaN(val0) && !isNaN(val1)) {
              inc0 = val0 <= val1;
              inc1 = val0 >= val1;
              res.push(inc0 ? val0 : val1);
              if (inc0) {
                current0++;
                val0 = current0 < dataLength0 ? data0[current0] : NaN;
              }
              if (inc1) {
                current1++;
                val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
              }
            }
            while (!isNaN(val0)) {
              res.push(val0);
              current0++;
              val0 = current0 < dataLength0 ? data0[current0] : NaN;
            }
            while (!isNaN(val1)) {
              res.push(val1);
              current1++;
              val1 = current1 < dataLength1 ? data1[current1].data['x'] : NaN;
            }
            registry = res;
          }

          // now we've got the registry of unique X'es
          // we should ensure, that all drawing plans have the same length
          for (i = 0; i < drawingPlans.length; i++) {
            drawingPlan = drawingPlans[i];
            data0 = drawingPlan.data;
            dataLength0 = data0.length;
            if (dataLength0 < registry.length) {
              var resultingData = [];
              current0 = 0;
              point = data0[current0];
              val0 = point ? point.data['x'] : NaN;
              for (j = 0; j < registry.length; j++) {
                val1 = registry[j];
                if (val0 <= val1) { // false for val0 == NaN
                  resultingData.push(point);
                  current0++;
                  point = data0[current0];
                  val0 = point ? point.data['x'] : NaN;
                } else {
                  resultingData.push(anychart.core.series.Cartesian.makeMissingPoint(val1));
                }
              }
              drawingPlan.data = resultingData;
            }
          }
        }
      }
      drawingPlan = drawingPlans[0];
      if (xScale.needsAutoCalc()) {
        if (xScale instanceof anychart.scales.Ordinal) {
          xScale.setAutoValues(drawingPlan.xHashMap, drawingPlan.xArray);
        } else if (drawingPlan.data.length) {
          xScale.extendDataRange(drawingPlan.data[0].data['x'], drawingPlan.data[drawingPlan.data.length - 1].data['x']);
          if (drawingPlan.series.supportsError()) {
            var iterator;
            var error;
            if (drawingPlan.hasPointXErrors) {
              iterator = drawingPlan.series.getResetIterator();
              while (iterator.advance()) { // we need iterator to make error work :(
                if (!iterator.meta(anychart.opt.MISSING)) {
                  error = drawingPlan.series.error().getErrorValues(true);
                  val = iterator.get('x');
                  xScale.extendDataRange(val - error[0], val + error[1]);
                }
              }
            } else if (drawingPlan.series.error().hasGlobalErrorValues()) {
              iterator = drawingPlan.series.getResetIterator();
              iterator.select(0);
              error = drawingPlan.series.error().getErrorValues(true);
              val = iterator.get('x');
              xScale.extendDataRange(val - error[0], val + error[1]);
              iterator.select(drawingPlan.data.length - 1);
              error = drawingPlan.series.error().getErrorValues(true);
              val = iterator.get('x');
              xScale.extendDataRange(val - error[0], val + error[1]);
            }
          }
        }
        // we started autocalc before
        xScale.finishAutoCalc();
      }
      if (xScale instanceof anychart.scales.Ordinal) {
        var namesField = xScale.getNamesField();
        // retrieving names
        if (namesField != null) {
          var remainingNames = drawingPlans[0].xArray.length;
          var autoNames = new Array(remainingNames);
          for (i = 0; i < drawingPlans.length; i++) {
            var drawingPlanData = drawingPlans[i].data;
            if (remainingNames > 0) {
              for (j = 0; j < drawingPlanData.length; j++) {
                if (!goog.isDef(autoNames[j]) && goog.isDef(val = drawingPlanData[j].data[namesField])) {
                  autoNames[j] = val;
                  remainingNames--;
                }
              }
            }
          }
          xScale.setAutoNames(autoNames);
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_SCALES);
    anychart.performance.end('x scales calculation');
  }
};


/**
 * @protected
 */
anychart.core.CartesianBase.prototype.calculateYScales = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_Y_SCALES)) {
    anychart.performance.start('y scales calculation');
    var i, j, series;
    var yScale;
    var drawingPlan, drawingPlans, drawingPlansByYScale, uid, point;
    var data, val;
    this.hasStackedSeries = false;
    for (uid in this.yScales) {
      yScale = this.yScales[uid];
      if (yScale.needsAutoCalc())
        yScale.startAutoCalc();
    }
    for (uid in this.drawingPlansByYAndXScale_) {
      // calculating zoomed indexes
      var firstIndex, lastIndex;
      data = this.drawingPlansByXScale_[uid][0].data;
      var dataLength = data.length;
      var xScale = this.xScales[uid];
      if (xScale instanceof anychart.scales.Ordinal) {
        if (dataLength) {
          firstIndex = goog.math.clamp(Math.floor(this.xZoom_.getStartRatio() * dataLength - 1), 0, dataLength - 1);
          lastIndex = goog.math.clamp(Math.ceil(this.xZoom_.getEndRatio() * dataLength + 1), 0, dataLength - 1);
        } else {
          firstIndex = NaN;
          lastIndex = NaN;
        }
      } else {
        var firstVal = /** @type {number} */(xScale.inverseTransform(0));
        var lastVal = /** @type {number} */(xScale.inverseTransform(1));
        if (dataLength) {
          /**
           * Comparator function.
           * @param {number} target
           * @param {Object} item
           * @return {number}
           */
          var searcher = function(target, item) {
            return target - item.data['x'];
          };
          firstIndex = goog.array.binarySearch(data, firstVal, searcher);
          if (firstIndex < 0) firstIndex = ~firstIndex - 1;
          firstIndex = goog.math.clamp(firstIndex, 0, dataLength - 1);
          lastIndex = goog.array.binarySearch(data, lastVal, searcher);
          if (lastIndex < 0) lastIndex = ~lastIndex;
          lastIndex = goog.math.clamp(lastIndex, 0, dataLength - 1);
        } else {
          firstIndex = NaN;
          lastIndex = NaN;
        }
      }
      drawingPlansByYScale = this.drawingPlansByYAndXScale_[uid];
      for (var yUid in drawingPlansByYScale) {
        drawingPlans = drawingPlansByYScale[yUid];
        yScale = this.yScales[yUid];
        var yScaleStacked = yScale.stackMode() != anychart.enums.ScaleStackMode.NONE;
        var yScalePercentStacked = yScale.stackMode() == anychart.enums.ScaleStackMode.PERCENT;
        var stack, stackVal;
        if (yScaleStacked) {
          stack = [];
          for (j = firstIndex; j <= lastIndex; j++) {
            stack.push({
              positive: 0,
              negative: 0,
              missing: false
            });
          }
        }
        for (i = 0; i < drawingPlans.length; i++) {
          drawingPlan = drawingPlans[i];
          series = /** @type {anychart.core.series.Cartesian} */(drawingPlan.series);
          drawingPlan.firstIndex = firstIndex;
          drawingPlan.lastIndex = lastIndex;
          drawingPlan.stacked = yScaleStacked && series.supportsStack();
          this.hasStackedSeries = this.hasStackedSeries || drawingPlan.stacked;
          data = drawingPlan.data;
          if (drawingPlan.stacked || yScalePercentStacked) {
            for (j = firstIndex; j <= lastIndex; j++) {
              point = data[j];
              stackVal = stack[j - firstIndex];
              point.meta[anychart.opt.STACKED_MISSING] = stackVal.missing;
              if (point.meta[anychart.opt.MISSING]) {
                point.meta['stackedPositiveZero'] = stackVal.positive;
                point.meta['stackedNegativeZero'] = stackVal.negative;
                stackVal.missing = true;
              } else {
                val = +point.data[anychart.opt.VALUE];
                if (val >= 0) {
                  point.meta[anychart.opt.STACKED_ZERO] = stackVal.positive;
                  stackVal.positive += val;
                  point.meta[anychart.opt.STACKED_VALUE] = stackVal.positive;
                } else {
                  point.meta[anychart.opt.STACKED_ZERO] = stackVal.negative;
                  stackVal.negative += val;
                  point.meta[anychart.opt.STACKED_VALUE] = stackVal.negative;
                }
                if (!yScalePercentStacked)
                  yScale.extendDataRange(point.meta[anychart.opt.STACKED_VALUE]);
                stackVal.missing = false;
              }
            }
          } else {
            var names = series.getYValueNames();
            var k;
            for (j = firstIndex; j <= lastIndex; j++) {
              point = data[j];
              if (!point.meta[anychart.opt.MISSING]) {
                for (k = 0; k < names.length; k++) {
                  yScale.extendDataRange(point.data[names[k]]);
                }
              }
            }
            if (drawingPlan.series.supportsOutliers()) {
              for (j = firstIndex; j <= lastIndex; j++) {
                point = data[j];
                var outliers = point.data[anychart.opt.OUTLIERS];
                if (!point.meta[anychart.opt.MISSING] && goog.isArray(outliers)) {
                  for (k = 0; k < outliers.length; k++) {
                    yScale.extendDataRange(outliers[k]);
                  }
                }
              }
            }
            if (drawingPlan.series.supportsError() &&
                (drawingPlan.series.error().hasGlobalErrorValues() ||
                drawingPlan.hasPointYErrors)) {
              var iterator = drawingPlan.series.getResetIterator();
              while (iterator.advance()) { // we need iterator to make error work :(
                if (!iterator.meta(anychart.opt.MISSING)) {
                  var error = drawingPlan.series.error().getErrorValues(false);
                  val = anychart.utils.toNumber(iterator.get(anychart.opt.VALUE));
                  yScale.extendDataRange(val - error[0], val + error[1]);
                }
              }
            }
          }
        }
        if (yScalePercentStacked) {
          yScale.extendDataRange(0);
          for (i = 0; i < drawingPlans.length; i++) {
            drawingPlan = drawingPlans[i];
            data = drawingPlan.data;
            for (j = firstIndex; j <= lastIndex; j++) {
              point = data[j];
              stackVal = stack[j - firstIndex];
              point.meta[anychart.opt.STACKED_MISSING] = stackVal.missing;
              if (point.meta[anychart.opt.MISSING]) {
                point.meta['stackedPositiveZero'] = (point.meta['stackedPositiveZero'] / stackVal.positive * 100) || 0;
                point.meta['stackedNegativeZero'] = (point.meta['stackedNegativeZero'] / stackVal.negative * 100) || 0;
              } else {
                val = point.meta[anychart.opt.STACKED_VALUE];
                var sum;
                if (val >= 0) {
                  sum = stackVal.positive;
                  yScale.extendDataRange(100);
                } else {
                  sum = -stackVal.negative;
                  yScale.extendDataRange(-100);
                }
                point.meta[anychart.opt.STACKED_ZERO] = (point.meta[anychart.opt.STACKED_ZERO] / sum * 100) || 0;
                point.meta[anychart.opt.STACKED_VALUE] = (point.meta[anychart.opt.STACKED_VALUE] / sum * 100) || 0;
              }
            }
          }
        }
      }
    }
    for (uid in this.yScales) {
      yScale = this.yScales[uid];
      if (yScale.needsAutoCalc())
        yScale.finishAutoCalc();
    }

    anychart.performance.end('y scales calculation');


    anychart.performance.start('statistics calculation');
    var max = -Infinity;
    var min = Infinity;
    sum = 0;
    var pointsCount = 0;

    for (i = 0; i < this.drawingPlans_.length; i++) {
      //----------------------------------calc statistics for series
      series = this.drawingPlans_[i].series;
      series.statistics('seriesPointsCount', this.drawingPlans_[i].data.length);
      series.statistics('seriesAverage', series.statistics('seriesSum') / this.drawingPlans_[i].data.length);
      max = Math.max(max, /** @type {number} */(series.statistics('seriesMax')));
      min = Math.min(min, /** @type {number} */ (series.statistics('seriesMin')));
      sum += /** @type {number} */(series.statistics('seriesSum'));
      pointsCount += /** @type {number} */(series.statistics('seriesPointsCount'));
      //----------------------------------end calc statistics for series
    }

    //----------------------------------calc statistics for series
    //todo (Roman Lubushikin): to avoid this loop on series we can store this info in the chart instance and provide it to all series
    var average = sum / pointsCount;
    for (i = 0; i < this.drawingPlans_.length; i++) {
      series = this.drawingPlans_[i].series;
      if (!series || !series.enabled()) continue;
      series.statistics('max', max);
      series.statistics('min', min);
      series.statistics('sum', sum);
      series.statistics('average', average);
      series.statistics('pointsCount', pointsCount);
    }
    //----------------------------------end calc statistics for series
    anychart.performance.end('statistics calculation');

    this.markConsistent(anychart.ConsistencyState.CARTESIAN_Y_SCALES);
  }
};


/**
 * Spread Column and Bar series to categories width
 * @private
 */
anychart.core.CartesianBase.prototype.distributeSeries_ = function() {
  var i;
  var scale;
  var drawingPlansOfScale;
  var aSeries;
  var id;
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
  for (xId in this.drawingPlansByXScale_) {
    // no need to do this if the scale is not ordinal
    if (!(this.xScales[xId] instanceof anychart.scales.Ordinal || this.xScales[xId] instanceof anychart.scales.DateTime))
      continue;
    drawingPlansOfScale = this.drawingPlansByXScale_[xId];
    // Our task is to calculate the number of column and bar clusters.
    // One column cluster is a column series, if axis is not stacked,
    // or all series of stacked axis, if there is at least one column.
    // One bar cluster is a bar series, if axis is not stacked,
    // or all series of stacked axis, if there is at least one bar.
    numColumnClusters = 0;
    numBarClusters = 0;
    seenScalesWithColumns = {};
    seenScalesWithBars = {};
    for (i = 0; i < drawingPlansOfScale.length; i++) {
      aSeries = drawingPlansOfScale[i].series;
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

    this.distributeColumnClusters(numColumnClusters, drawingPlansOfScale);
    this.distributeBarClusters(numBarClusters, drawingPlansOfScale);
  }
};


/**
 * Distribute column clusters.
 * @param {number} numColumnClusters
 * @param {Array.<Object>} drawingPlansOfScale
 * @protected
 */
anychart.core.CartesianBase.prototype.distributeColumnClusters = function(numColumnClusters, drawingPlansOfScale) {
  var scale;
  var id;
  var wSeries;
  var seenScales;
  var currPosition;
  var barWidthRatio;

  if (numColumnClusters > 0) {
    numColumnClusters = numColumnClusters + (numColumnClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
    barWidthRatio = 1 / numColumnClusters;
    currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
    seenScales = {};
    for (var i = 0; i < drawingPlansOfScale.length; i++) {
      wSeries = drawingPlansOfScale[i].series;
      if (wSeries.isWidthBased() && !wSeries.isBarBased()) {
        scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
        if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
          wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
          wSeries.setAutoPointWidth(barWidthRatio);
          currPosition += barWidthRatio * (1 + this.barsPadding_);
        } else {
          id = goog.getUid(scale);
          if (id in seenScales) {
            wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
            wSeries.setAutoPointWidth(barWidthRatio);
          } else {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoPointWidth(barWidthRatio);
            seenScales[id] = currPosition;
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          }
        }
      }
    }
  }
};


/**
 * Distribute bar clusters.
 * @param {number} numBarClusters
 * @param {Array.<Object>} drawingPlansOfScale
 * @protected
 */
anychart.core.CartesianBase.prototype.distributeBarClusters = function(numBarClusters, drawingPlansOfScale) {
  var scale;
  var id;
  var wSeries;
  var seenScales;
  var currPosition;
  var barWidthRatio;

  if (numBarClusters > 0) {
    numBarClusters = numBarClusters + (numBarClusters - 1) * this.barsPadding_ + this.barGroupsPadding_;
    barWidthRatio = 1 / numBarClusters;
    currPosition = barWidthRatio * this.barGroupsPadding_ / 2;
    seenScales = {};
    for (var i = 0; i < drawingPlansOfScale.length; i++) {
      wSeries = drawingPlansOfScale[i].series;
      if (wSeries.isBarBased()) {
        scale = /** @type {anychart.scales.Base} */(wSeries.yScale());
        if (scale.stackMode() == anychart.enums.ScaleStackMode.NONE) {
          wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
          wSeries.setAutoPointWidth(barWidthRatio);
          currPosition += barWidthRatio * (1 + this.barsPadding_);
        } else {
          id = goog.getUid(scale);
          if (id in seenScales) {
            wSeries.setAutoXPointPosition(seenScales[id] + barWidthRatio / 2);
            wSeries.setAutoPointWidth(barWidthRatio);
          } else {
            wSeries.setAutoXPointPosition(currPosition + barWidthRatio / 2);
            wSeries.setAutoPointWidth(barWidthRatio);
            seenScales[id] = currPosition;
            currPosition += barWidthRatio * (1 + this.barsPadding_);
          }
        }
      }
    }
  }
};


/**
 * Calculates bubble sizes for series.
 * @protected
 */
anychart.core.CartesianBase.prototype.calcBubbleSizes = function() {
  var i;
  var minMax = [Number.MAX_VALUE, -Number.MAX_VALUE];
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].calculateSizeScale(minMax);
  }
  for (i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].setAutoSizeScale(minMax[0], minMax[1], this.minBubbleSize_, this.maxBubbleSize_);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.CartesianBase)} .
 */
anychart.core.CartesianBase.prototype.palette = function(opt_value) {
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
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.core.CartesianBase)} Return current chart markers palette or itself for chaining call.
 */
anychart.core.CartesianBase.prototype.markerPalette = function(opt_value) {
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
 * @return {!(anychart.palettes.HatchFills|anychart.core.CartesianBase)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.core.CartesianBase.prototype.hatchFillPalette = function(opt_value) {
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
anychart.core.CartesianBase.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
      this.invalidate(anychart.ConsistencyState.CARTESIAN_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.CartesianBase.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.CARTESIAN_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.CartesianBase.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.CartesianBase.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.CARTESIAN_HATCH_FILL_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.CartesianBase.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_PALETTE |
          anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE |
          anychart.ConsistencyState.CARTESIAN_HATCH_FILL_PALETTE)) {
    anychart.core.Base.suspendSignalsDispatching(this.series_);
    for (var i = this.series_.length; i--;) {
      var series = this.series_[i];
      var index = /** @type {number} */(series.autoIndex());
      series.setAutoColor(this.palette().itemAt(index));
      series.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
      series.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    }
    this.invalidateSeries();
    this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES);
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_PALETTE |
        anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE |
        anychart.ConsistencyState.CARTESIAN_HATCH_FILL_PALETTE);
    anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
  }

};


/**
 * Prepare content area bounds.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 * @return {anychart.math.Rect}
 * @protected
 */
anychart.core.CartesianBase.prototype.getContentAreaBounds = function(bounds) {
  return bounds.clone().round();
};


/**
 * Get bounds without axes and scrollers.
 * @param {anychart.math.Rect} contentAreaBounds Total bounds of content area.
 * @return {anychart.math.Rect}
 */
anychart.core.CartesianBase.prototype.getBoundsWithoutAxes = function(contentAreaBounds) {
  var i, count;
  var xAxis, yAxis;
  var axes = goog.array.concat(this.xAxes_, this.yAxes_);
  var attempt = 0;
  var scroller = this.xScroller();
  var scrollerBeforeAxes = scroller.position() == anychart.enums.ChartScrollerPosition.BEFORE_AXES;
  scroller.padding(0);
  scroller.parentBounds(contentAreaBounds);
  var scrollerHorizontal = scroller.isHorizontal();
  var scrollerSize;
  if (scrollerBeforeAxes) {
    if (scrollerHorizontal) {
      scrollerSize = contentAreaBounds.height - scroller.getRemainingBounds().height;
    } else {
      scrollerSize = contentAreaBounds.width - scroller.getRemainingBounds().width;
    }
  } else {
    contentAreaBounds = scroller.getRemainingBounds();
  }

  for (i = 0, count = this.xAxes_.length; i < count; i++) {
    xAxis = this.xAxes_[i];
    if (xAxis) {
      xAxis.suspendSignalsDispatching();
      xAxis.padding(0);
    }
  }

  for (i = 0, count = this.yAxes_.length; i < count; i++) {
    yAxis = this.yAxes_[i];
    if (yAxis) {
      yAxis.suspendSignalsDispatching();
      yAxis.padding(0);
    }
  }

  var boundsWithoutAxes;
  do {
    // axes local vars
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

    for (i = axes.length; i--;) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis && axis.enabled()) {
        axis.parentBounds(contentAreaBounds);
        orientation = axis.orientation();
        axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(axis.stroke()));

        if (orientation == anychart.enums.Orientation.TOP) {
          axis.padding().top(topOffset);
          axis.padding().bottom(0);
          remainingBounds = axis.getRemainingBounds();
          topOffset = contentAreaBounds.height - remainingBounds.height;
          if (isNaN(this.topAxisPadding_))
            this.topAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.BOTTOM) {
          axis.padding().bottom(bottomOffset);
          axis.padding().top(0);
          remainingBounds = axis.getRemainingBounds();
          bottomOffset = contentAreaBounds.height - remainingBounds.height;
          if (isNaN(this.bottomAxisPadding_))
            this.bottomAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.LEFT) {
          axis.padding().left(leftOffset);
          axis.padding().right(0);
          remainingBounds = axis.getRemainingBounds();
          leftOffset = contentAreaBounds.width - remainingBounds.width;
          if (isNaN(this.leftAxisPadding_))
            this.leftAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.RIGHT) {
          axis.padding().right(rightOffset);
          axis.padding().left(0);
          remainingBounds = axis.getRemainingBounds();
          rightOffset = contentAreaBounds.width - remainingBounds.width;
          if (isNaN(this.rightAxisPadding_))
            this.rightAxisPadding_ = axisStrokeThickness;
        }
      }
    }

    if (scrollerBeforeAxes) {
      switch (scroller.orientation()) {
        case anychart.enums.Orientation.TOP:
          scroller.padding().top(topOffset + (this.topAxisPadding_ || 0));
          scroller.padding().bottom(0);
          topOffset += scrollerSize;
          break;
        case anychart.enums.Orientation.BOTTOM:
          scroller.padding().top(0);
          scroller.padding().bottom(bottomOffset + (this.bottomAxisPadding_ || 0));
          bottomOffset += scrollerSize;
          break;
        case anychart.enums.Orientation.LEFT:
          scroller.padding().left(leftOffset + (this.leftAxisPadding_ || 0));
          scroller.padding().right(0);
          leftOffset += scrollerSize;
          break;
        case anychart.enums.Orientation.RIGHT:
          scroller.padding().left(0);
          scroller.padding().right(rightOffset + (this.rightAxisPadding_ || 0));
          rightOffset += scrollerSize;
          break;
      }
    }

    if (scrollerHorizontal) {
      scroller.padding().left(leftOffset);
      scroller.padding().right(rightOffset);
    } else {
      scroller.padding().top(topOffset);
      scroller.padding().bottom(bottomOffset);
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
      }
    }
    attempt++;
  } while (!complete && attempt < anychart.core.CartesianBase.MAX_ATTEMPTS_AXES_CALCULATION);

  for (i = 0, count = this.xAxes_.length; i < count; i++) {
    xAxis = this.xAxes_[i];
    if (xAxis) xAxis.resumeSignalsDispatching(false);
  }

  for (i = 0, count = this.yAxes_.length; i < count; i++) {
    yAxis = this.yAxes_[i];
    if (yAxis) yAxis.resumeSignalsDispatching(false);
  }

  return boundsWithoutAxes.clone().round();
};


/**
 * Calculate for 3d.
 * @protected
 */
anychart.core.CartesianBase.prototype.prepare3d = goog.nullFunction;


/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.core.CartesianBase.prototype.drawContent = function(bounds) {
  var i, count;

  this.xScroller().suspendSignalsDispatching();

  anychart.performance.start('Cartesian.calculate()');

  this.makeScaleMaps();
  this.calculateXScales();
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_ZOOM)) {
    for (i in this.xScales) {
      var start = this.xZoom().getStartRatio();
      var factor = 1 / (this.xZoom().getEndRatio() - start);
      (/** @type {anychart.scales.Base} */(this.xScales[i])).setZoom(factor, start);
    }
    this.xScroller().setRangeInternal(this.xZoom().getStartRatio(), this.xZoom().getEndRatio());
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_ZOOM);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_Y_SCALES | anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }
  this.calculateYScales();
  anychart.performance.end('Cartesian.calculate()');

  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);

  anychart.performance.start('Cartesian bounds calc');
  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.CARTESIAN_AXES)) {
    var item;
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      item = this.xAxes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
        if (item && !item.scale())
          item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
      }
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      item = this.yAxes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
        if (item && !item.scale())
          item.scale(/** @type {anychart.scales.Base} */(this.yScale()));
      }
    }
  }

  // calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // bounds of data area
    this.dataBounds = this.getBoundsWithoutAxes(this.getContentAreaBounds(bounds));

    this.invalidateSeries();
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES |
        anychart.ConsistencyState.CARTESIAN_GRIDS |
        anychart.ConsistencyState.CARTESIAN_AXES_MARKERS |
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
        anychart.ConsistencyState.CARTESIAN_CROSSHAIR);
  }

  anychart.performance.end('Cartesian bounds calc');

  anychart.performance.start('Cartesian elements drawing');
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_X_SCROLLER)) {
    this.xScroller().container(this.rootElement);
    this.xScroller().draw();
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_GRIDS)) {
    var grids = goog.array.concat(this.grids_, this.minorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (!grid.scale())
          this.setDefaultScaleForLayoutBasedElements(grid);
        grid.parentBounds(this.dataBounds);
        grid.container(this.rootElement);
        grid.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_GRIDS);
  }

  // draw axes outside of data bounds
  // only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_AXES)) {
    var axis;
    for (i = 0, count = axes.length; i < count; i++) {
      axis = /** @type {anychart.core.axes.Linear} */(axes[i]);
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (i = 0, count = markers.length; i < count; i++) {
      var axesMarker = markers[i];
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        if (!axesMarker.scale())
          this.setDefaultScaleForLayoutBasedElements(axesMarker);
        axesMarker.parentBounds(this.dataBounds);
        axesMarker.container(this.rootElement);
        axesMarker.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS);
  }
  anychart.performance.end('Cartesian elements drawing');

  anychart.performance.start('Cartesian series drawing');
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SERIES)) {
    anychart.performance.start('Preparation');
    for (i = 0, count = this.series_.length; i < count; i++) {
      var series = this.series_[i];
      series.container(this.rootElement);
      series.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
          this.leftAxisPadding_);
      series.parentBounds(this.dataBounds);
    }

    this.prepare3d();
    this.distributeSeries_();
    this.calcBubbleSizes();
    anychart.performance.end('Preparation');

    anychart.performance.start('Series drawing');
    for (i = 0; i < this.series_.length; i++) {
      this.series_[i].draw();
    }
    anychart.performance.end('Series drawing');

    this.markConsistent(anychart.ConsistencyState.CARTESIAN_SERIES);
  }
  anychart.performance.end('Cartesian series drawing');

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_CROSSHAIR)) {
    if (this.crosshair_) {
      this.crosshair_.suspendSignalsDispatching();
      this.crosshair_.parentBounds(this.dataBounds);
      this.crosshair_.container(this.rootElement);

      this.crosshair_.barChartMode(this.barChartMode);
      this.crosshair_.xAxis(this.xAxes_[this.crosshair_.xLabel().axisIndex()]);
      this.crosshair_.yAxis(this.yAxes_[this.crosshair_.yLabel().axisIndex()]);

      this.crosshair_.draw();
      this.crosshair_.resumeSignalsDispatching(false);
    }

    this.markConsistent(anychart.ConsistencyState.CARTESIAN_CROSSHAIR);
  }

  this.xScroller().resumeSignalsDispatching(false);
  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_, this.xAxes_, this.yAxes_);
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.core.CartesianBase.prototype.invalidateWidthBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isWidthBased())
      this.series_[i].invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/**
 * Invalidates APPEARANCE for all size-based series.
 * @private
 */
anychart.core.CartesianBase.prototype.invalidateSizeBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @protected
 */
anychart.core.CartesianBase.prototype.invalidateSeries = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.SERIES_COLOR);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  var i, count;
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  // we need to calculate statistics
  this.makeScaleMaps();
  this.calculateXScales();
  this.calculateYScales();
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
      /** @type {anychart.core.series.Cartesian} */
      var series = this.series_[i];
      var itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = i;
      data.push(itemData);
    }
  }
  return data;
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.getPlotBounds = function() {
  return this.dataBounds;
};


/** @inheritDoc */
anychart.core.CartesianBase.prototype.getSeriesStatus = function(event) {
  var bounds = this.dataBounds || anychart.math.rect(0, 0, 0, 0);
  var clientX = event['clientX'];
  var clientY = event['clientY'];

  var value, index, iterator;

  var containerOffset = goog.style.getClientPosition(/** @type {Element} */(this.container().getStage().container()));

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
  var i, len, series, names;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();
    var minRatio, maxRatio;
    if (this.barChartMode) {
      minRatio = (rangeY - (y - spotRadius - minY)) / rangeY;
      maxRatio = (rangeY - (y + spotRadius - minY)) / rangeY;

      //swap values for bar
      var x_tmp = x;
      x = y;
      y = x_tmp;
    } else {
      minRatio = (x - spotRadius - minX) / rangeX;
      maxRatio = (x + spotRadius - minX) / rangeX;
    }

    var minValue, maxValue;
    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      if (series && series.enabled()) {
        minValue =  /** @type {number} */(series.xScale().inverseTransform(minRatio));
        maxValue = /** @type {number} */(series.xScale().inverseTransform(maxRatio));

        var indexes = series.findInRangeByX(minValue, maxValue);

        iterator = series.getResetIterator();
        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            if (!iterator.meta(anychart.opt.MISSING)) {
              var pixX = /** @type {number} */(iterator.meta('x'));
              var pickValue = false;
              names = series.getYValueNames();
              for (var k = 0; k < names.length; k++) {
                var pixY = /** @type {number} */(iterator.meta(names[k]));

                var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
                pickValue = pickValue || length <= spotRadius;
                if (length < minLength) {
                  minLength = length;
                  minLengthIndex = index;
                }
              }
              if (pickValue) {
                ind.push(index);
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
    var ratio = ((this.getType() == anychart.enums.ChartTypes.BAR || this.getType() == anychart.enums.ChartTypes.BAR_3D) ?
        (rangeY - (y - minY)) / rangeY : (x - minX) / rangeX);

    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      if (series && series.enabled()) {
        value = series.xScale().inverseTransform(ratio);
        index = series.findX(value);
        if (index < 0) index = NaN;

        iterator = series.getResetIterator();
        minLength = Infinity;

        if (iterator.select(index)) {
          if (!iterator.meta(anychart.opt.MISSING)) {
            pixX = /** @type {number} */(iterator.meta('x'));
            names = series.getYValueNames();
            for (k = 0; k < names.length; k++) {
              pixY = /** @type {number} */(iterator.meta(names[k]));
              length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
              if (length < minLength) {
                minLength = length;
              }
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
    }
  }

  return /** @type {Array.<Object>} */(points);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Animations.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.CartesianBase.prototype.doAnimation = function() {
  if (this.animation().enabled() && this.animation().duration() > 0) {
    if (this.animationQueue_ && this.animationQueue_.isPlaying()) {
      this.animationQueue_.update();
    } else if (this.hasInvalidationState(anychart.ConsistencyState.CHART_ANIMATION)) {
      goog.dispose(this.animationQueue_);
      this.animationQueue_ = new anychart.animations.AnimationParallelQueue();
      var duration = /** @type {number} */(this.animation().duration());
      for (var i = 0; i < this.series_.length; i++) {
        var series = this.series_[i];
        var ctl = anychart.animations.AnimationBySeriesType[/** @type {string} */(series.seriesType())];
        if (ctl)
          this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (new ctl(series, duration)));
      }
      this.animationQueue_.listen(goog.fx.Transition.EventType.BEGIN, function() {
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_START,
          'chart': this
        });
      }, false, this);
      this.animationQueue_.listen(goog.fx.Transition.EventType.END, function() {
        this.dispatchDetachedEvent({
          'type': anychart.enums.EventType.ANIMATION_END,
          'chart': this
        });
      }, false, this);
      this.animationQueue_.play(false);
    }
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.CartesianBase.prototype.setupByJSON = function(config) {
  anychart.core.CartesianBase.base(this, 'setupByJSON', config);

  this.barChartMode = ('barChartMode' in config) ? config['barChartMode'] : this.barChartMode;
  this.defaultSeriesType(config['defaultSeriesType']);
  this.palette(config['palette']);
  this.markerPalette(config['markerPalette']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.barGroupsPadding(config['barGroupsPadding']);
  this.barsPadding(config['barsPadding']);
  this.minBubbleSize(config['minBubbleSize']);
  this.maxBubbleSize(config['maxBubbleSize']);
  this.xScroller(config['xScroller']);

  if ('defaultSeriesSettings' in config)
    this.defaultSeriesSettings(config['defaultSeriesSettings']);

  if ('defaultXAxisSettings' in config)
    this.defaultXAxisSettings(config['defaultXAxisSettings']);

  if ('defaultYAxisSettings' in config)
    this.defaultYAxisSettings(config['defaultYAxisSettings']);

  if ('defaultGridSettings' in config)
    this.defaultGridSettings(config['defaultGridSettings']);

  if ('defaultMinorGridSettings' in config)
    this.defaultMinorGridSettings(config['defaultMinorGridSettings']);

  if ('defaultLineMarkerSettings' in config)
    this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);

  if ('defaultTextMarkerSettings' in config)
    this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);

  var i, json, scale;
  var grids = config['grids'];
  var minorGrids = config['minorGrids'];
  var xAxes = config['xAxes'];
  var yAxes = config['yAxes'];
  var lineAxesMarkers = config['lineAxesMarkers'];
  var rangeAxesMarkers = config['rangeAxesMarkers'];
  var textAxesMarkers = config['textAxesMarkers'];
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

  if (goog.isArray(minorGrids)) {
    for (i = 0; i < minorGrids.length; i++) {
      json = minorGrids[i];
      this.minorGrid(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.minorGrid(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(lineAxesMarkers)) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      json = lineAxesMarkers[i];
      this.lineMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.lineMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(rangeAxesMarkers)) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      json = rangeAxesMarkers[i];
      this.rangeMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.rangeMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(textAxesMarkers)) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      json = textAxesMarkers[i];
      this.textMarker(i, json);
      if (goog.isObject(json) && 'scale' in json && json['scale'] > 1) this.textMarker(i).scale(scalesInstances[json['scale']]);
    }
  }

  if (goog.isArray(series)) {
    for (i = 0; i < series.length; i++) {
      json = series[i];
      var seriesType = json['seriesType'] || this.defaultSeriesType();
      var data = json['data'];
      var seriesInst = this.createSeriesByType(seriesType, data);
      if (seriesInst) {
        seriesInst.setup(json);
        if (goog.isObject(json)) {
          if ('xScale' in json && json['xScale'] > 1) seriesInst.xScale(scalesInstances[json['xScale']]);
          if ('yScale' in json && json['yScale'] > 1) seriesInst.yScale(scalesInstances[json['yScale']]);
        }
      }
    }
  }

  var xZoom = config['xZoom'];
  if (goog.isObject(xZoom) && (goog.isNumber(xZoom['scale']) || goog.isString(xZoom['scale']))) {
    var tmp = xZoom['scale'];
    xZoom['scale'] = scalesInstances[xZoom['scale']];
    this.xZoom(xZoom);
    xZoom['scale'] = tmp;
  } else {
    this.xZoom(xZoom);
  }

  if (config['crosshair']) {
    this.crosshair(config['crosshair']);
  }
};


/**
 * @inheritDoc
 */
anychart.core.CartesianBase.prototype.serialize = function() {
  var json = anychart.core.CartesianBase.base(this, 'serialize');
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

  json['type'] = this.type_;
  json['defaultSeriesType'] = this.defaultSeriesType();
  json['barChartMode'] = this.barChartMode;
  json['palette'] = this.palette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['barGroupsPadding'] = this.barGroupsPadding();
  json['barsPadding'] = this.barsPadding();
  json['minBubbleSize'] = this.minBubbleSize();
  json['maxBubbleSize'] = this.maxBubbleSize();
  json['crosshair'] = this.crosshair().serialize();
  json['xScroller'] = this.xScroller().serialize();
  json['xZoom'] = this.xZoom().serialize();

  var xAxes = [];
  for (i = 0; i < this.xAxes_.length; i++) {
    var xAxis = this.xAxes_[i];
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
    axesIds.push(goog.getUid(xAxis));

    xAxes.push(config);
  }
  if (xAxes.length)
    json['xAxes'] = xAxes;

  var yAxes = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var yAxis = this.yAxes_[i];
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
    axesIds.push(goog.getUid(yAxis));

    yAxes.push(config);
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

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
    if (minorGrid) {
      config = minorGrid.serialize();
      scale = minorGrid.scale();
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
      axis = minorGrid.axis();
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
      minorGrids.push(config);
    }
  }
  if (minorGrids.length)
    json['minorGrids'] = minorGrids;

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    var lineAxesMarker = this.lineAxesMarkers_[i];
    if (lineAxesMarker) {
      config = lineAxesMarker.serialize();
      scale = lineAxesMarker.scale();
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
      axis = lineAxesMarker.axis();
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
      lineAxesMarkers.push(config);
    }
  }
  if (lineAxesMarkers.length)
    json['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    var rangeAxesMarker = this.rangeAxesMarkers_[i];
    if (rangeAxesMarker) {
      config = rangeAxesMarker.serialize();
      scale = rangeAxesMarker.scale();
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
      axis = rangeAxesMarker.axis();
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
      rangeAxesMarkers.push(config);
    }
  }
  if (rangeAxesMarkers.length)
    json['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    var textAxesMarker = this.textAxesMarkers_[i];
    if (textAxesMarker) {
      config = textAxesMarker.serialize();
      scale = textAxesMarker.scale();
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
      axis = textAxesMarker.axis();
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
      textAxesMarkers.push(config);
    }
  }
  if (textAxesMarkers.length)
    json['textAxesMarkers'] = textAxesMarkers;

  var series = [];
  for (i = 0; i < this.series_.length; i++) {
    var series_ = this.series_[i];
    config = series_.serialize();
    scale = series_.xScale();
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

    scale = series_.yScale();
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
    series.push(config);
  }
  if (series.length)
    json['series'] = series;

  if (scales.length)
    json['scales'] = scales;
  return {'chart': json};
};
