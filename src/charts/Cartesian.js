goog.provide('anychart.charts.Cartesian');

goog.require('anychart'); // otherwise we can't use anychart.chartTypesMap object.
goog.require('anychart.animations');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.axes.Linear');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.cartesian.series.Base');
goog.require('anychart.core.grids.Linear');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.IZoomableChart');
goog.require('anychart.core.utils.OrdinalIterator');
goog.require('anychart.core.utils.OrdinalZoom');
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
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IZoomableChart}
 * @constructor
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 */
anychart.charts.Cartesian = function(opt_barChartMode) {
  goog.base(this);

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
   * @type {anychart.math.Rect}
   * @private
   */
  this.dataBounds_ = null;

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

  this.defaultSeriesType(anychart.enums.CartesianSeriesType.LINE);
  this.setType(anychart.enums.ChartTypes.CARTESIAN);
};
goog.inherits(anychart.charts.Cartesian, anychart.core.SeparateChart);


/**
 * Getter/setter for cartesian defaultSeriesType.
 * @param {(string|anychart.enums.CartesianSeriesType)=} opt_value Default series type.
 * @return {anychart.charts.Cartesian|anychart.enums.CartesianSeriesType} Default series type or self for chaining.
 */
anychart.charts.Cartesian.prototype.defaultSeriesType = function(opt_value) {
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
anychart.charts.Cartesian.prototype.setType = function(value) {
  /**
   * @type {anychart.enums.ChartTypes}
   * @private
   */
  this.type_ = value;
};


/** @inheritDoc */
anychart.charts.Cartesian.prototype.getType = function() {
  return this.type_;
};


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @private
 */
anychart.charts.Cartesian.MAX_ATTEMPTS_AXES_CALCULATION_ = 5;


/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.SeparateChart states.
 * @type {number}
 */
anychart.charts.Cartesian.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.charts.Cartesian.ZINDEX_SERIES = 30;


/**
 * Line-like series should have bigger zIndex value than other series.
 * @type {number}
 */
anychart.charts.Cartesian.ZINDEX_LINE_SERIES = 31;


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
//  Zoom
//
//----------------------------------------------------------------------------------------------------------------------
//region anychart.core.utils.IZoomableChart members
/**
 * Invalidates zoom.
 * @param {boolean} forX
 */
anychart.charts.Cartesian.prototype.invalidateZoom = function(forX) {
  // we do not distinguish between x and y zoom because we have only the x one
  this.invalidate(anychart.ConsistencyState.CARTESIAN_ZOOM, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns default scale for given dimension.
 * @param {boolean} forX
 * @return {anychart.scales.Base}
 */
anychart.charts.Cartesian.prototype.getDefaultScale = function(forX) {
  return /** @type {anychart.scales.Base} */(forX ? this.xScale() : this.yScale());
};


/**
 * Ensures that scales are ready for zooming.
 */
anychart.charts.Cartesian.prototype.ensureScalesReadyForZoom = function() {
  this.makeScaleMaps_();
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALES)) {
    if (!!this.xZoom().getSetup())
      this.calculate();
  }
};
//endregion


/**
 * Zoom settings getter/setter.
 * @param {(number|boolean|null|Object)=} opt_value
 * @return {anychart.charts.Cartesian|anychart.core.utils.OrdinalZoom}
 */
anychart.charts.Cartesian.prototype.xZoom = function(opt_value) {
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
 * @return {anychart.core.ui.ChartScroller|anychart.charts.Cartesian}
 */
anychart.charts.Cartesian.prototype.xScroller = function(opt_value) {
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
anychart.charts.Cartesian.prototype.scrollerInvalidated_ = function(e) {
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
anychart.charts.Cartesian.prototype.scrollerChangeStartHandler_ = function(e) {
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
anychart.charts.Cartesian.prototype.scrollerChangeHandler_ = function(e) {
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
anychart.charts.Cartesian.prototype.scrollerChangeFinishHandler_ = function(e) {
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
anychart.charts.Cartesian.prototype.defaultSeriesSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultXAxisSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultYAxisSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultGridSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultMinorGridSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultLineMarkerSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultTextMarkerSettings = function(opt_value) {
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
anychart.charts.Cartesian.prototype.defaultRangeMarkerSettings = function(opt_value) {
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
 * @return {!(anychart.scales.Base|anychart.charts.Cartesian)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.xScale = function(opt_value) {
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
      var state = 0;
      if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
        state = anychart.ConsistencyState.CHART_LEGEND;
      }
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SCALES |
          anychart.ConsistencyState.CARTESIAN_SCALE_MAPS |
          state,
          anychart.Signal.NEEDS_REDRAW);
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
anychart.charts.Cartesian.prototype.xScaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter/setter for yScale.
 * @param {(anychart.enums.ScaleTypes|anychart.scales.Base)=} opt_value Y Scale to set.
 * @return {!(anychart.scales.Base|anychart.charts.Cartesian)} Default chart scale value or itself for method chaining.
 */
anychart.charts.Cartesian.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) {
      opt_value = anychart.scales.Base.fromString(opt_value, false);
    }
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SCALES |
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
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
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
    grid.setup(this.defaultGridSettings());
    this.grids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
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
    grid.setup(this.defaultMinorGridSettings());
    this.minorGrids_[index] = grid;
    this.registerDisposable(grid);
    grid.listenSignals(this.onGridSignal_, this);
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
 * @private
 */
anychart.charts.Cartesian.prototype.onGridSignal_ = function(event) {
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
anychart.charts.Cartesian.prototype.onAxisSignal_ = function(event) {
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
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
    lineMarker.setup(this.defaultLineMarkerSettings());
    this.lineAxesMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
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
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
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
    rangeMarker.setup(this.defaultRangeMarkerSettings());
    this.rangeAxesMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
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
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
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
    textMarker.setup(this.defaultTextMarkerSettings());
    this.textAxesMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
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
 * @private
 */
anychart.charts.Cartesian.prototype.onMarkersSignal_ = function(event) {
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
 * @return {!(anychart.core.ui.Crosshair|anychart.charts.Cartesian)}
 */
anychart.charts.Cartesian.prototype.crosshair = function(opt_value) {
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
anychart.charts.Cartesian.prototype.onCrosshairSignal_ = function(event) {
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
 * @return {anychart.core.cartesian.series.Base} {@link anychart.core.cartesian.series.Box} instance for method chaining.
 */
anychart.charts.Cartesian.prototype.box = function(data, opt_csvSettings) {
  return this.createSeriesByType_(
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
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @private
 * @return {anychart.core.cartesian.series.Base}
 */
anychart.charts.Cartesian.prototype.createSeriesByType_ = function(type, data, opt_csvSettings) {
  type = anychart.enums.normalizeCartesianSeriesType(type);
  var ctl = anychart.core.cartesian.series.Base.SeriesTypesMap[type];
  var instance;

  if (ctl) {
    instance = new ctl(data, opt_csvSettings);
    instance.setChart(this);
    instance.setParentEventTarget(this);
    this.registerDisposable(instance);
    var lastSeries = this.series_[this.series_.length - 1];
    var index = lastSeries ? /** @type {number} */ (lastSeries.index()) + 1 : 0;
    this.series_.push(instance);
    var inc = index * anychart.charts.Cartesian.ZINDEX_INCREMENT_MULTIPLIER;
    instance.index(index).id(index);
    var seriesZIndex = ((type == anychart.enums.CartesianSeriesType.LINE ||
        type == anychart.enums.CartesianSeriesType.SPLINE ||
        type == anychart.enums.CartesianSeriesType.STEP_LINE) ?
            anychart.charts.Cartesian.ZINDEX_LINE_SERIES :
            anychart.charts.Cartesian.ZINDEX_SERIES) + inc;
    instance.setAutoZIndex(seriesZIndex);
    instance.labels().setAutoZIndex(seriesZIndex + anychart.charts.Cartesian.ZINDEX_INCREMENT_MULTIPLIER / 2);
    instance.clip(true);
    instance.setAutoColor(this.palette().itemAt(index));
    instance.setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(index)));
    instance.setAutoHatchFill(/** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    if (instance.hasMarkers()) {
      instance.markers().setAutoZIndex(seriesZIndex + anychart.charts.Cartesian.ZINDEX_INCREMENT_MULTIPLIER / 2);
      instance.markers().setAutoFill((/** @type {anychart.core.cartesian.series.BaseWithMarkers} */ (instance)).getMarkerFill());
      instance.markers().setAutoStroke((/** @type {anychart.core.cartesian.series.BaseWithMarkers} */ (instance)).getMarkerStroke());
    }
    if (instance.hasOutlierMarkers()) {
      instance.outlierMarkers().setAutoZIndex(anychart.charts.Cartesian.ZINDEX_MARKER + inc);
    }
    if (anychart.DEFAULT_THEME != 'v6')
      instance.labels().setAutoColor(anychart.color.darken(instance.color()));
    instance.setup(this.defaultSeriesSettings()[type]);
    instance.listenSignals(this.seriesInvalidated_, this);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
        anychart.Signal.NEEDS_REDRAW);
  } else {
    anychart.utils.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, [type + ' series']);
    instance = null;
  }

  return instance;
};


/**
 * Add series to chart.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Chart series data.
 * @return {Array.<anychart.core.cartesian.series.Base>} Array of created series.
 */
anychart.charts.Cartesian.prototype.addSeries = function(var_args) {
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
anychart.charts.Cartesian.prototype.getSeriesIndexBySeriesId = function(id) {
  return goog.array.findIndex(this.series_, function(item) {
    return item.id() == id;
  });
};


/**
 * Gets series by its id.
 * @param {number|string} id Id of the series.
 * @return {anychart.core.cartesian.series.Base} Series instance.
 */
anychart.charts.Cartesian.prototype.getSeries = function(id) {
  return this.getSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Gets series by its index.
 * @param {number} index Index of the series.
 * @return {?anychart.core.cartesian.series.Base} Series instance.
 */
anychart.charts.Cartesian.prototype.getSeriesAt = function(index) {
  return this.series_[index] || null;
};


/**
 * Returns series count.
 * @return {number} Number of series.
 */
anychart.charts.Cartesian.prototype.getSeriesCount = function() {
  return this.series_.length;
};


/**
 * Removes one of series from chart by its id.
 * @param {number|string} id Series id.
 * @return {anychart.charts.Cartesian}
 */
anychart.charts.Cartesian.prototype.removeSeries = function(id) {
  return this.removeSeriesAt(this.getSeriesIndexBySeriesId(id));
};


/**
 * Removes one of series from chart by its index.
 * @param {number} index Series index.
 * @return {anychart.charts.Cartesian}
 */
anychart.charts.Cartesian.prototype.removeSeriesAt = function(index) {
  var series = this.series_[index];
  if (series) {
    anychart.globalLock.lock();
    goog.array.splice(this.series_, index, 1);
    goog.dispose(series);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Removes all series from chart.
 * @return {anychart.charts.Cartesian} Self for method chaining.
 */
anychart.charts.Cartesian.prototype.removeAllSeries = function() {
  if (this.series_.length) {
    anychart.globalLock.lock();
    var series = this.series_;
    this.series_ = [];
    goog.disposeAll(series);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CHART_LEGEND |
        anychart.ConsistencyState.CARTESIAN_SCALES |
        anychart.ConsistencyState.CARTESIAN_SCALE_MAPS,
        anychart.Signal.NEEDS_REDRAW);
    anychart.globalLock.unlock();
  }
  return this;
};


/**
 * Series signals handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Cartesian.prototype.seriesInvalidated_ = function(event) {
  var state = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state = anychart.ConsistencyState.CARTESIAN_SERIES;
  }
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    state |= anychart.ConsistencyState.CARTESIAN_SERIES;
    this.invalidateSeries_();
    if (this.legend().itemsSourceMode() == anychart.enums.LegendItemsSourceMode.CATEGORIES) {
      state |= anychart.ConsistencyState.CHART_LEGEND;
    }
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    state |= anychart.ConsistencyState.CARTESIAN_SCALES;
    state |= anychart.ConsistencyState.CARTESIAN_SCALE_MAPS;
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
anychart.charts.Cartesian.prototype.getAllSeries = function() {
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
 * @return {number|anychart.charts.Cartesian} .
 */
anychart.charts.Cartesian.prototype.barGroupsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barGroupsPadding_ != +opt_value) {
      this.barGroupsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barGroupsPadding_;
};


/**
 * Getter/setter for barsPadding.
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.charts.Cartesian} .
 */
anychart.charts.Cartesian.prototype.barsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.barsPadding_ != +opt_value) {
      this.barsPadding_ = +opt_value;
      this.invalidateWidthBasedSeries_();
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.barsPadding_;
};


/**
 * Sets max size for all bubbles on the charts.
 * @param {(number|string)=} opt_value
 * @return {number|string|anychart.charts.Cartesian}
 */
anychart.charts.Cartesian.prototype.maxBubbleSize = function(opt_value) {
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
 * @return {number|string|anychart.charts.Cartesian}
 */
anychart.charts.Cartesian.prototype.minBubbleSize = function(opt_value) {
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
 * Calculate cartesian chart properties.
 */
anychart.charts.Cartesian.prototype.calculate = function() {
  if (!this.hasInvalidationState(
      anychart.ConsistencyState.CARTESIAN_SCALES |
      anychart.ConsistencyState.CARTESIAN_SCALE_MAPS |
      anychart.ConsistencyState.CARTESIAN_Y_SCALES)) {
    return;
  }

  this.invalidate(anychart.ConsistencyState.CARTESIAN_Y_SCALES);

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
  /** @type {Array.<number, number>} */
  var errValues;
  var ratio0, ratio1;

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

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALES)) {
    var isErrorAvailableForScale;
    // parsing x scales map and calculating them if needed as they cannot be stacked.
    for (id in this.xScales_) {
      scale = this.xScales_[id];
      series = this.seriesOfXScaleMap_[goog.getUid(scale)];
      for (i = 0; i < series.length; i++)
        series[i].resetCategorisation();
      // we can crash or warn user here if the scale is stacked, if we want.
      if (scale.needsAutoCalc()) {
        scale.startAutoCalc();
        isErrorAvailableForScale = anychart.core.utils.Error.isErrorAvailableForScale(scale);
        for (i = 0; i < series.length; i++) {
          aSeries = series[i];
          if (!aSeries.enabled()) continue;
          iterator = aSeries.getResetIterator();
          while (iterator.advance()) {
            value = iterator.get('x');
            if (goog.isDef(value)) {
              if (isErrorAvailableForScale && aSeries.isErrorAvailable()) {
                errValues = aSeries.getErrorValues(true);
                value = anychart.utils.toNumber(value);
                scale.extendDataRange(value - errValues[0], value + errValues[1]);
              } else {
                scale.extendDataRange(value);
              }
            }
          }
        }
      }
      // categorise series data if needed.
      categories = scale.getCategorisation();
      for (i = 0; i < series.length; i++)
        series[i].categoriseData(categories);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_Y_SCALES)) {
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
            xScale = /** @type {anychart.scales.Base} */(aSeries.xScale());
            while (iterator.advance()) {
              value = iterator.get('x');
              ratio0 = xScale.transform(value, 0);
              ratio1 = xScale.transform(value, 1);
              if (ratio0 < 0 && ratio1 < 0 || ratio0 > 1 && ratio1 > 1) continue;
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
          if (!aSeries.enabled()) continue;
          iterator = aSeries.getResetIterator();
          xScale = /** @type {anychart.scales.Base} */(aSeries.xScale());
          while (iterator.advance()) {
            value = iterator.get('x');
            ratio0 = xScale.transform(value, 0);
            ratio1 = xScale.transform(value, 1);
            if (ratio0 < 0 && ratio1 < 0 || ratio0 > 1 && ratio1 > 1) continue;
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

  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALES)) {
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
  }

  this.markConsistent(anychart.ConsistencyState.CARTESIAN_SCALES);
  this.markConsistent(anychart.ConsistencyState.CARTESIAN_Y_SCALES);
  this.scalesFinalization_ = true;
  anychart.core.Base.resumeSignalsDispatchingTrue(this.series_);

  if (this.scalesFinalization_) {
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
};


/**
 * Prepares scale maps.
 * @private
 */
anychart.charts.Cartesian.prototype.makeScaleMaps_ = function() {
  if (!this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SCALE_MAPS)) return;
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
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES);
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
      this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES);
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

  this.markConsistent(anychart.ConsistencyState.CARTESIAN_SCALE_MAPS);
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
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Cartesian)} .
 */
anychart.charts.Cartesian.prototype.palette = function(opt_value) {
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
 * @return {!(anychart.palettes.Markers|anychart.charts.Cartesian)} Return current chart markers palette or itself for chaining call.
 */
anychart.charts.Cartesian.prototype.markerPalette = function(opt_value) {
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
 * @return {!(anychart.palettes.HatchFills|anychart.charts.Cartesian)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.charts.Cartesian.prototype.hatchFillPalette = function(opt_value) {
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
anychart.charts.Cartesian.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
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
anychart.charts.Cartesian.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.CARTESIAN_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Cartesian.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Cartesian.prototype.hatchFillPaletteInvalidated_ = function(event) {
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
anychart.charts.Cartesian.prototype.beforeDraw = function() {
  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_);

  var i;

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoColor(this.palette().itemAt(i));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES);
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoMarkerType(/** @type {anychart.enums.MarkerType} */(this.markerPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES);
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_MARKER_PALETTE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_HATCH_FILL_PALETTE)) {
    for (i = this.series_.length; i--;) {
      this.series_[i].setAutoHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(i)));
    }
    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.CARTESIAN_SERIES);
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_HATCH_FILL_PALETTE);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.series_);
};


/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.charts.Cartesian.prototype.drawContent = function(bounds) {
  var i, count, scale;

  this.xScroller().suspendSignalsDispatching();

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_ZOOM)) {
    this.ensureScalesReadyForZoom();
    for (i in this.xScales_) {
      var start = this.xZoom().getStartRatio();
      var factor = 1 / (this.xZoom().getEndRatio() - start);
      (/** @type {anychart.scales.Base} */(this.xScales_[i])).setZoom(factor, start);
    }
    this.xScroller().setRangeInternal(this.xZoom().getStartRatio(), this.xZoom().getEndRatio());
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_ZOOM);
    this.invalidate(anychart.ConsistencyState.CARTESIAN_Y_SCALES | anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }

  this.calculate();

  if (this.isConsistent())
    return;

  anychart.core.Base.suspendSignalsDispatching(this.series_, this.xAxes_, this.yAxes_);

  var axes = goog.array.concat(this.xAxes_, this.yAxes_);

  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.CARTESIAN_AXES)) {
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
    } while (!complete && attempt < anychart.charts.Cartesian.MAX_ATTEMPTS_AXES_CALCULATION_);

    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      this.xAxes_[i].resumeSignalsDispatching(false);
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      this.yAxes_[i].resumeSignalsDispatching(false);
    }

    //bounds of data area
    this.dataBounds_ = boundsWithoutAxes.clone().round();

    this.invalidateSeries_();
    this.invalidate(anychart.ConsistencyState.CARTESIAN_AXES |
        anychart.ConsistencyState.CARTESIAN_GRIDS |
        anychart.ConsistencyState.CARTESIAN_AXES_MARKERS |
        anychart.ConsistencyState.CARTESIAN_SERIES |
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
        anychart.ConsistencyState.CARTESIAN_CROSSHAIR);
  }

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
          this.setDefaultScaleForLayoutBasedElements_(grid);
        grid.parentBounds(this.dataBounds_);
        grid.container(this.rootElement);
        grid.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_GRIDS);
  }

  //draw axes outside of data bounds
  //only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_AXES)) {
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
          this.setDefaultScaleForLayoutBasedElements_(axesMarker);
        axesMarker.parentBounds(this.dataBounds_);
        axesMarker.container(this.rootElement);
        axesMarker.axesLinesSpace(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
            this.leftAxisPadding_);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_AXES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_SERIES)) {
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
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_CROSSHAIR)) {
    if (this.crosshair_) {
      this.crosshair_.suspendSignalsDispatching();
      this.crosshair_.parentBounds(this.dataBounds_);
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
        var values = activeSeries[i].getReferenceScaleValues();
        if (activeSeries[i].supportsStack() && values) {
          for (var j = values.length; j--;) {
            var value = anychart.utils.toNumber(values[j]);
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
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  }
};


/**
 * Invalidates APPEARANCE for all size-based series.
 * @private
 */
anychart.charts.Cartesian.prototype.invalidateSizeBasedSeries_ = function() {
  for (var i = this.series_.length; i--;) {
    if (this.series_[i].isSizeBased())
      this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
  }
};


/**
 * Invalidates APPEARANCE for all width-based series.
 * @private
 */
anychart.charts.Cartesian.prototype.invalidateSeries_ = function() {
  for (var i = this.series_.length; i--;)
    this.series_[i].invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.SERIES_HATCH_FILL);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Cartesian.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
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
      /** @type {anychart.core.cartesian.series.Base} */
      var series = this.series_[i];
      var itemData = series.getLegendItemData(itemsTextFormatter);
      itemData['sourceUid'] = goog.getUid(this);
      itemData['sourceKey'] = series.index();
      data.push(itemData);
    }
  }
  return data;
};


/**
 * Getter for data bounds of the chart.
 * @return {anychart.math.Rect}
 */
anychart.charts.Cartesian.prototype.getPlotBounds = function() {
  return this.dataBounds_;
};


/** @inheritDoc */
anychart.charts.Cartesian.prototype.getSeriesStatus = function(event) {
  var bounds = this.dataBounds_ || anychart.math.rect(0, 0, 0, 0);
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
  var i, len, series;

  if (interactivity.hoverMode() == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = interactivity.spotRadius();
    var minRatio, maxRatio;
    if (this.getType() == anychart.enums.ChartTypes.BAR) {
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

    var isOrdinal = this.xScale() instanceof anychart.scales.Ordinal;

    var minValue, maxValue;
    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      if (series.enabled()) {
        minValue =  /** @type {number} */(series.xScale().inverseTransform(minRatio));
        maxValue = /** @type {number} */(series.xScale().inverseTransform(maxRatio));

        if (isOrdinal) {
          minValue = series.xScale().getIndexByValue(minValue);
          maxValue = series.xScale().getIndexByValue(maxValue);
        }

        var indexes = series.data().findInRangeByX(minValue, maxValue, isOrdinal);

        iterator = series.getIterator();
        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        for (var j = 0; j < indexes.length; j++) {
          index = indexes[j];
          if (iterator.select(index)) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pickValue = false;
            for (var k = 0; k < series.referenceValueMeanings.length; k++) {
              if (series.referenceValueMeanings[k] == 'y') {
                var pixY = /** @type {number} */(iterator.meta(series.referenceValueNames[k]));

                var length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
                pickValue = pickValue || length <= spotRadius;
                if (length < minLength) {
                  minLength = length;
                  minLengthIndex = index;
                }
              }
            }
            if (pickValue) {
              ind.push(index);
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
    var ratio = (this.getType() == anychart.enums.ChartTypes.BAR ? (rangeY - (y - minY)) / rangeY : (x - minX) / rangeX);

    for (i = 0, len = this.series_.length; i < len; i++) {
      series = this.series_[i];
      value = series.xScale().inverseTransform(ratio);
      index = series.data().find('x', value);
      if (index < 0) index = NaN;

      iterator = series.getIterator();
      minLength = Infinity;

      if (iterator.select(index)) {
        var missing = false;
        pixX = /** @type {number} */(iterator.meta('x'));
        for (k = 0; k < series.referenceValueMeanings.length; k++) {
          if (series.referenceValueMeanings[k] == 'y') {
            missing = missing || anychart.utils.isNaN(iterator.get(series.referenceValueNames[k]));
            pixY = /** @type {number} */(iterator.meta(series.referenceValueNames[k]));
            length = Math.sqrt(Math.pow(pixX - x, 2) + Math.pow(pixY - y, 2));
            if (length < minLength) {
              minLength = length;
            }
          }
        }

        if (!missing) {
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

  return /** @type {Array.<Object>} */(points);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Animations.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.charts.Cartesian.prototype.doAnimation = function() {
  if (!this.animationQueue_) {
    this.animationQueue_ = new anychart.animations.AnimationParallelQueue();
    for (var i = 0; i < this.series_.length; i++) {
      var series = this.series_[i];
      var ctl = anychart.animations.AnimationBySeriesType[series.getType().toLowerCase()];
      if (!ctl) continue;
      var duration = /** @type {number} */(this.animation().duration());
      if (ctl === anychart.animations.ClipAnimation) {
        this.animationQueue_.add(/** @type {goog.fx.TransitionBase} */ (new ctl(this.container().getStage(), /** @type {anychart.core.cartesian.series.BaseWithMarkers} */(series), duration)));
      } else
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
  }
  this.animationQueue_.play(false);
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
  chart.setup(anychart.getFullTheme()['cartesian']);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN] = anychart.cartesian;


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


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.charts.Cartesian.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

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

  var scalesInstances = {};
  if (goog.isObject(scales)) {
    for (i in scales) {
      if (!scales.hasOwnProperty(i)) continue;
      json = scales[i];
      if (goog.isString(json)) {
        scale = anychart.scales.Base.fromString(json, false);
      } else {
        scale = anychart.scales.Base.fromString(json['type'], false);
        scale.setup(json);
      }
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
anychart.charts.Cartesian.prototype.serialize = function() {
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

  var grids = [];
  for (i = 0; i < this.grids_.length; i++) {
    var grid = this.grids_[i];
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
    grids.push(config);
  }
  if (grids.length)
    json['grids'] = grids;

  var minorGrids = [];
  for (i = 0; i < this.minorGrids_.length; i++) {
    var minorGrid = this.minorGrids_[i];
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
    minorGrids.push(config);
  }
  if (minorGrids.length)
    json['minorGrids'] = minorGrids;

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
    yAxes.push(config);
  }
  if (yAxes.length)
    json['yAxes'] = yAxes;

  var lineAxesMarkers = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    var lineAxesMarker = this.lineAxesMarkers_[i];
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
    lineAxesMarkers.push(config);
  }
  if (lineAxesMarkers.length)
    json['lineAxesMarkers'] = lineAxesMarkers;

  var rangeAxesMarkers = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    var rangeAxesMarker = this.rangeAxesMarkers_[i];
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
    rangeAxesMarkers.push(config);
  }
  if (rangeAxesMarkers.length)
    json['rangeAxesMarkers'] = rangeAxesMarkers;

  var textAxesMarkers = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    var textAxesMarker = this.textAxesMarkers_[i];
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
    textAxesMarkers.push(config);
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


//exports
goog.exportSymbol('anychart.cartesian', anychart.cartesian);//doc|ex
goog.exportSymbol('anychart.cartesianChart', anychart.cartesianChart);//doc|ex
anychart.charts.Cartesian.prototype['xScale'] = anychart.charts.Cartesian.prototype.xScale;//doc|ex
anychart.charts.Cartesian.prototype['yScale'] = anychart.charts.Cartesian.prototype.yScale;//doc|ex
anychart.charts.Cartesian.prototype['barsPadding'] = anychart.charts.Cartesian.prototype.barsPadding;//doc|ex
anychart.charts.Cartesian.prototype['barGroupsPadding'] = anychart.charts.Cartesian.prototype.barGroupsPadding;//doc|ex
anychart.charts.Cartesian.prototype['crosshair'] = anychart.charts.Cartesian.prototype.crosshair;
anychart.charts.Cartesian.prototype['maxBubbleSize'] = anychart.charts.Cartesian.prototype.maxBubbleSize;
anychart.charts.Cartesian.prototype['minBubbleSize'] = anychart.charts.Cartesian.prototype.minBubbleSize;
anychart.charts.Cartesian.prototype['grid'] = anychart.charts.Cartesian.prototype.grid;//doc|ex
anychart.charts.Cartesian.prototype['minorGrid'] = anychart.charts.Cartesian.prototype.minorGrid;//doc|ex
anychart.charts.Cartesian.prototype['xAxis'] = anychart.charts.Cartesian.prototype.xAxis;//doc|ex
anychart.charts.Cartesian.prototype['yAxis'] = anychart.charts.Cartesian.prototype.yAxis;//doc|ex
anychart.charts.Cartesian.prototype['getSeries'] = anychart.charts.Cartesian.prototype.getSeries;//doc|ex
anychart.charts.Cartesian.prototype['area'] = anychart.charts.Cartesian.prototype.area;//doc|ex
anychart.charts.Cartesian.prototype['bar'] = anychart.charts.Cartesian.prototype.bar;//doc|ex
anychart.charts.Cartesian.prototype['box'] = anychart.charts.Cartesian.prototype.box;//doc|ex
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
anychart.charts.Cartesian.prototype['getType'] = anychart.charts.Cartesian.prototype.getType;
anychart.charts.Cartesian.prototype['defaultSeriesType'] = anychart.charts.Cartesian.prototype.defaultSeriesType;
anychart.charts.Cartesian.prototype['addSeries'] = anychart.charts.Cartesian.prototype.addSeries;
anychart.charts.Cartesian.prototype['getSeriesAt'] = anychart.charts.Cartesian.prototype.getSeriesAt;
anychart.charts.Cartesian.prototype['getSeriesCount'] = anychart.charts.Cartesian.prototype.getSeriesCount;
anychart.charts.Cartesian.prototype['removeSeries'] = anychart.charts.Cartesian.prototype.removeSeries;
anychart.charts.Cartesian.prototype['removeSeriesAt'] = anychart.charts.Cartesian.prototype.removeSeriesAt;
anychart.charts.Cartesian.prototype['removeAllSeries'] = anychart.charts.Cartesian.prototype.removeAllSeries;
anychart.charts.Cartesian.prototype['getPlotBounds'] = anychart.charts.Cartesian.prototype.getPlotBounds;
anychart.charts.Cartesian.prototype['xZoom'] = anychart.charts.Cartesian.prototype.xZoom;
anychart.charts.Cartesian.prototype['xScroller'] = anychart.charts.Cartesian.prototype.xScroller;
