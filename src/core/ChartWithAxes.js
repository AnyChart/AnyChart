goog.provide('anychart.core.ChartWithAxes');

goog.require('anychart.cartesianModule.Grid');
goog.require('anychart.core.Axis');
goog.require('anychart.core.ChartWithOrthogonalScales');
goog.require('anychart.core.IChartWithAnnotations');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.core.utils.Crossing');
goog.require('anychart.core.utils.QuarterSettings');
goog.require('anychart.enums');
goog.require('goog.array');



/**
 * ChartWithAxes chart class.
 * @extends {anychart.core.ChartWithOrthogonalScales}
 * @implements {anychart.core.IChartWithAnnotations}
 * @constructor
 * @param {boolean} joinData If series data should be sorted and joined.
 */
anychart.core.ChartWithAxes = function(joinData) {
  anychart.core.ChartWithAxes.base(this, 'constructor', joinData);

  /**
   * @type {anychart.core.ui.Crosshair}
   * @private
   */
  this.crosshair_ = null;

  /**
   * @type {!Array.<anychart.core.Axis>}
   * @private
   */
  this.xAxes_ = [];

  /**
   * @type {!Array.<anychart.core.Axis>}
   * @private
   */
  this.yAxes_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Line>|Array.<anychart.cartesian3dModule.axisMarkers.Line>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>|Array.<anychart.cartesian3dModule.axisMarkers.Range>}
   * @private
   */
  this.rangeAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>|Array.<anychart.cartesian3dModule.axisMarkers.Text>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.GridBase>}
   * @private
   */
  this.xGrids_ = [];

  /**
   * @type {Array.<anychart.core.GridBase>}
   * @private
   */
  this.yGrids_ = [];

  /**
   * @type {Array.<anychart.core.GridBase>}
   * @private
   */
  this.xMinorGrids_ = [];

  /**
   * @type {Array.<anychart.core.GridBase>}
   * @private
   */
  this.yMinorGrids_ = [];

  /**
   * Crosslines element.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.crosslines_ = null;

  /**
   * Annotations module exports, if it is included.
   * @type {{ChartController:Function, PlotController:Function}|undefined}
   * @private
   */
  this.annotationsModule_ = anychart.window['anychart']['annotations'];
};
goog.inherits(anychart.core.ChartWithAxes, anychart.core.ChartWithOrthogonalScales);


//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.ChartWithOrthogonalScales states.
 * @type {number}
 */
anychart.core.ChartWithAxes.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithOrthogonalScales.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.AXES_CHART_AXES_MARKERS |
    anychart.ConsistencyState.AXES_CHART_GRIDS |
    anychart.ConsistencyState.AXES_CHART_CROSSHAIR |
    anychart.ConsistencyState.AXES_CHART_ANNOTATIONS |
    anychart.ConsistencyState.AXES_CHART_QUARTER |
    anychart.ConsistencyState.AXES_CHART_CROSSLINES;


/**
 * Maximal number of attempts to calculate axes length.
 * @type {number}
 * @protected
 */
anychart.core.ChartWithAxes.MAX_ATTEMPTS_AXES_CALCULATION = 5;


/**
 * Sets default scale for layout based element depending on isVertical.
 * @param {anychart.core.axisMarkers.Line|anychart.core.axisMarkers.Range|anychart.core.axisMarkers.Text|anychart.core.GridBase} item Item to set scale.
 * @protected
 */
anychart.core.ChartWithAxes.prototype.setDefaultScaleForLayoutBasedElements = function(item) {
  var sc = /** @type {anychart.scales.Base} */ (!!(item.isHorizontal() ^ this.isVertical()) ? this.yScale() : this.xScale());

  if (anychart.utils.instanceOf(item, anychart.core.GridBase))
    item.setAutoScale(sc);
  else
    item.autoScale(sc);
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.isVertical = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.isVerticalInternal != opt_value) {
      this.isVerticalInternal = opt_value;

      for (var i = this.seriesList.length; i--;) {
        this.seriesList[i]['isVertical'](this.isVerticalInternal);
      }

      var newValue;
      var axes = goog.array.concat(this.xAxes_, this.yAxes_);
      anychart.core.Base.suspendSignalsDispatching(axes);
      for (i = axes.length; i--;) {
        var axis = axes[i];
        if (axis) {
          switch (axis.getOption('orientation')) {
            case anychart.enums.Orientation.BOTTOM:
              newValue = anychart.enums.Orientation.LEFT;
              break;
            case anychart.enums.Orientation.TOP:
              newValue = anychart.enums.Orientation.RIGHT;
              break;
            case anychart.enums.Orientation.LEFT:
              newValue = anychart.enums.Orientation.BOTTOM;
              break;
            case anychart.enums.Orientation.RIGHT:
              newValue = anychart.enums.Orientation.TOP;
              break;
          }
          axis.orientation(newValue);
        }
      }

      var items = goog.array.concat(this.xGrids_, this.yGrids_, this.xMinorGrids_, this.yMinorGrids_, this.lineAxesMarkers_, this.rangeAxesMarkers_, this.textAxesMarkers_);
      anychart.core.Base.suspendSignalsDispatching(items);
      for (i = items.length; i--;) {
        var item = items[i];
        if (item) {
          newValue = item.layout() == anychart.enums.Layout.HORIZONTAL ?
              anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL;
          item.layout(newValue);
        }
      }

      anychart.core.Base.resumeSignalsDispatchingTrue(axes, items);
    }
    return this;
  }

  return this.isVerticalInternal = goog.isDef(this.isVerticalInternal) ? this.isVerticalInternal : !!this.getOption('isVertical');
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.invalidateAnnotations = function() {
  if (this.annotationsModule_)
    this.annotations().invalidateAnnotations();
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.calculateStatistics = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_STATISTICS)) {
    anychart.core.ChartWithAxes.base(this, 'calculateStatistics');

    var elementsStat = this.statistics(anychart.enums.Statistics.CHART_ELEMENTS);
    elementsStat['axes'] = {'x': 0, 'y': 0};
    elementsStat['grids'] = {'x': 0, 'y': 0, 'xMinor': 0, 'yMinor': 0};

    var length = Math.max(
        this.xAxes_.length,
        this.yAxes_.length,
        this.xGrids_.length,
        this.yGrids_.length,
        this.xMinorGrids_.length,
        this.yMinorGrids_.length);

    for (var i = length; i--;) {
      if (this.xAxes_[i]) elementsStat['axes']['x']++;
      if (this.yAxes_[i]) elementsStat['axes']['y']++;
      if (this.xGrids_[i]) elementsStat['grids']['x']++;
      if (this.yGrids_[i]) elementsStat['grids']['y']++;
      if (this.xMinorGrids_[i]) elementsStat['grids']['xMinor']++;
      if (this.yMinorGrids_[i]) elementsStat['grids']['yMinor']++;
    }

    this.statistics(anychart.enums.Statistics.CHART_ELEMENTS, elementsStat);

    //NOTE: doesn't mark consistent because ChartWithOrthogonalScales does.
  }
};


//endregion
//region --- Default settings getters/setters
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
anychart.core.ChartWithAxes.prototype.defaultXAxisSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultYAxisSettings = function(opt_value) {
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
anychart.core.ChartWithAxes.prototype.defaultGridSettings = function(opt_value) {
  if (!this.defaultGridSettings_) { // we need this for getGridZIndex method to work
    this.defaultGridSettings_ = anychart.getFlatTheme('defaultGridSettings');
  }

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
anychart.core.ChartWithAxes.prototype.defaultMinorGridSettings = function(opt_value) {
  if (!this.defaultMinorGridSettings_) { // we need this for getGridZIndex method to work
    this.defaultMinorGridSettings_ = anychart.getFlatTheme('defaultMinorGridSettings');
  }

  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


//endregion
//region --- Grids
//----------------------------------------------------------------------------------------------------------------------
//
//  Grids
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create Grid instance.
 * @return {!anychart.core.GridBase}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createGridInstance = function() {
  return new anychart.cartesianModule.Grid();
};


/**
 * Return z-index for grid.
 * @param {boolean} isMajor .
 * @return {number}
 */
anychart.core.ChartWithAxes.prototype.getGridZIndex = function(isMajor) {
  var themeSettings = isMajor ? this.defaultGridSettings() : this.defaultMinorGridSettings();
  return themeSettings['zIndex'] + goog.array.concat(this.xGrids_, this.yGrids_, this.xMinorGrids_, this.yMinorGrids_).length * 0.001;
};


/**
 * Getter/setter for xGrid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.GridBase|anychart.core.ChartWithAxes)} Grid instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.xGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.xGrids_[index];
  if (!grid) {
    grid = this.createGridInstance();
    grid.setOwner(this);
    grid.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL);
    grid.zIndex(this.getGridZIndex(true));
    this.xGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.core.GridBase|anychart.core.ChartWithAxes)} Grid instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.yGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.yGrids_[index];
  if (!grid) {
    grid = this.createGridInstance();
    grid.setOwner(this);
    grid.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.zIndex(this.getGridZIndex(true));
    this.yGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for x minorGrid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Minor grid settings.
 * @param {(Object|boolean|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.GridBase|anychart.core.ChartWithAxes)} Minor grid instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.xMinorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.xMinorGrids_[index];
  if (!grid) {
    grid = this.createGridInstance();
    grid.setOwner(this);
    grid.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL);
    grid.addThemes('defaultMinorGridSettings');
    grid.zIndex(this.getGridZIndex(false));
    this.xMinorGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for y minorGrid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Minor grid settings.
 * @param {(Object|boolean|null)=} opt_value Minor grid settings to set.
 * @return {!(anychart.core.GridBase|anychart.core.ChartWithAxes)} Minor grid instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.yMinorGrid = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var grid = this.yMinorGrids_[index];
  if (!grid) {
    grid = this.createGridInstance();
    grid.setOwner(this);
    grid.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    grid.addThemes('defaultMinorGridSettings');
    grid.zIndex(this.getGridZIndex(false));
    this.yMinorGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.ChartWithAxes.prototype.onGridSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * @return {{vertical: number, horizontal: number}}
 */
anychart.core.ChartWithAxes.prototype.calculateGridsThickness = function() {
  var grids = goog.array.concat(this.xGrids_, this.yGrids_);
  var maxVerticalThickness = 0;
  var maxHorizontalThickness = 0;
  for (var i = 0, len = grids.length; i < len; i++) {
    var grid = /** @type {anychart.core.GridBase} */(grids[i]);
    if (grid && grid.enabled()) {
      var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(grid.getOption('stroke')));
      if (grid.isHorizontal()) {
        if (thickness > maxHorizontalThickness) {
          maxHorizontalThickness = thickness;
        }
      } else {
        if (thickness > maxVerticalThickness) {
          maxVerticalThickness = thickness;
        }
      }
    }
  }

  return {
    vertical: maxVerticalThickness,
    horizontal: maxHorizontalThickness
  };
};


//endregion
//region --- Axes
//----------------------------------------------------------------------------------------------------------------------
//
//  Axes
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart axis settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.core.Axis|anychart.core.ChartWithAxes)} Axis instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.xAxis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.core.Axis();
    axis.setParentEventTarget(this);
    this.setupCreated('defaultXAxisSettings', axis);
    this.xAxes_[index] = axis;
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES |
        anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.Axis|anychart.core.ChartWithAxes)} Axis instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.yAxis = function(opt_indexOrValue, opt_value) {
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
    axis = new anychart.core.Axis();
    this.setupCreated('defaultYAxisSettings', axis);
    axis.setParentEventTarget(this);
    this.yAxes_[index] = axis;
    axis.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    axis.setup(value);
    return this;
  } else {
    return axis;
  }
};


/**
 * @return {number} Number of series.
 */
anychart.core.ChartWithAxes.prototype.getXAxesCount = function() {
  return this.xAxes_.length;
};


/**
 * @return {number} Number of series.
 */
anychart.core.ChartWithAxes.prototype.getYAxesCount = function() {
  return this.yAxes_.length;
};


/**
 * Listener for axes invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ChartWithAxes.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES_CHART_AXES;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  this.suspendSignalsDispatching();
  // if there are no signals, !state and nothing happens.
  this.invalidate(state, signal);
  this.invalidateState(anychart.enums.Store.SERIES_CHART, anychart.enums.State.DATA_AREA, anychart.Signal.NEEDS_REDRAW);
  this.resumeSignalsDispatching(true);
};


/**
 * Gets axis by index. First of all goes through x-axes, then y-axes.
 * SAMPLE: if we have 4 x-axes and 3 y-axes, chart.getAxisByIndex(4) will return very first y-axis.
 * @param {number} index - Index to be found.
 * @return {anychart.core.Axis|undefined}
 */
anychart.core.ChartWithAxes.prototype.getAxisByIndex = function(index) {
  return (index >= this.xAxes_.length) ? this.yAxes_[index - this.xAxes_.length] : this.xAxes_[index];
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getXAxisByIndex = function(index) {
  return this.xAxes_[index];
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getYAxisByIndex = function(index) {
  return this.yAxes_[index];
};


/**
 * @param {anychart.core.Axis} axis
 * @protected
 */
anychart.core.ChartWithAxes.prototype.setYAxisScale = function(axis) {
  axis.scale(/** @type {anychart.scales.Base} */(this.yScale()));
};


//endregion
//region --- Scales invalidation.
/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getScaleAdditionalInvalidationState = function() {
  return anychart.ConsistencyState.AXES_CHART_AXES; //this overridden method fixes DVF-3678
};


//endregion
//region --- Axis markers
//----------------------------------------------------------------------------------------------------------------------
//
//  Axis markers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create lineMarker instance.
 * @return {!(anychart.core.axisMarkers.Line|anychart.cartesian3dModule.axisMarkers.Line)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createLineMarkerInstance = function() {
  return new anychart.core.axisMarkers.Line();
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.cartesian3dModule.axisMarkers.Line|anychart.core.ChartWithAxes)} Line marker instance by index or itself for method chaining.
 */
anychart.core.ChartWithAxes.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = this.createLineMarkerInstance();

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultLineMarkerSettings');
    lineMarker.addThemes(extendedThemes);

    lineMarker.setChart(this);
    lineMarker.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.lineAxesMarkers_[index] = lineMarker;
    lineMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.axisMarkers.Range|anychart.cartesian3dModule.axisMarkers.Range)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createRangeMarkerInstance = function() {
  return new anychart.core.axisMarkers.Range();
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.cartesian3dModule.axisMarkers.Range|anychart.core.ChartWithAxes)} Range marker instance by index or itself for chaining call.
 */
anychart.core.ChartWithAxes.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = this.createRangeMarkerInstance();

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultRangeMarkerSettings');
    rangeMarker.addThemes(extendedThemes);

    rangeMarker.setChart(this);
    rangeMarker.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.rangeAxesMarkers_[index] = rangeMarker;
    rangeMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.core.axisMarkers.Text|anychart.cartesian3dModule.axisMarkers.Text)}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.createTextMarkerInstance = function() {
  return new anychart.core.axisMarkers.Text();
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.cartesian3dModule.axisMarkers.Text|anychart.core.ChartWithAxes)} Text marker instance by index or itself for chaining call.
 */
anychart.core.ChartWithAxes.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = this.createTextMarkerInstance();

    // textMarker.addThemes('cartesianBase.defaultTextMarkerSettings');
    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultTextMarkerSettings');
    textMarker.addThemes(extendedThemes);

    textMarker.setChart(this);
    textMarker.setDefaultLayout(this.isVertical() ? anychart.enums.Layout.VERTICAL : anychart.enums.Layout.HORIZONTAL);
    this.textAxesMarkers_[index] = textMarker;
    textMarker.listenSignals(this.onMarkersSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS | anychart.ConsistencyState.SCALE_CHART_SCALES_STATISTICS, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.ChartWithAxes.prototype.onMarkersSignal = function(event) {
  var state = anychart.ConsistencyState.AXES_CHART_AXES_MARKERS;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    state |= anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.SCALE_CHART_Y_SCALES;
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Gets scales from axes, grids, axes markers.
 * @param {Object.<string, anychart.scales.Base>} scales
 * @param {boolean} isX Whether to get x scales.
 * @return {Object.<string, anychart.scales.Base>}
 */
anychart.core.ChartWithAxes.prototype.getAdditionalScales = function(scales, isX) {
  this.calculate();
  var scalesList = goog.object.clone(scales);
  var elementsWithScale = goog.array.concat(
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.xGrids_,
      this.yGrids_,
      this.xMinorGrids_,
      this.yMinorGrids_);
  var scale, uid, i, isY;
  for (i = 0; i < elementsWithScale.length; i++) {
    var item = elementsWithScale[i];
    if (item) {
      isY = !!(item.isHorizontal() ^ this.isVertical());

      // isX - means we are collecting xScales
      // isY - means that element's scale supposed to be yScale
      // isX | isY | collect == !continue
      //  0  |  0  |    0      collecting yScales and element scale is xScale => !collect = continue
      //  0  |  1  |    1      collecting yScales and element scale is yScale => collect = !continue
      //  1  |  0  |    1      collecting xScales and element scale is xScale => collect = !continue
      //  1  |  1  |    0      collecting xScales and element scale is yScale => !collect = continue
      if (!(isX ^ isY))
        continue;

      scale = item.scale();
      if (scale) {
        uid = String(goog.getUid(scale));
        if (!(uid in scalesList))
          scalesList[uid] = scale;
      }
    }
  }
  var axes = isX ? this.xAxes_ : this.yAxes_;
  for (i = 0; i < axes.length; i++) {
    scale = /** @type {anychart.scales.Base} */ (axes[i] && axes[i].scale());
    if (scale) {
      uid = String(goog.getUid(scale));
      if (!(uid in scalesList))
        scalesList[uid] = scale;
    }
  }
  return scalesList;
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.invalidateScaleBasedElements = function(scale) {
  var foundOne = 0;
  var markers = goog.array.concat(this.lineAxesMarkers_, this.rangeAxesMarkers_, this.textAxesMarkers_);
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    if (marker && marker.enabled() && (marker.scale() == scale)) {
      foundOne |= marker.invalidate(anychart.ConsistencyState.BOUNDS);
    }
  }
  if (foundOne)
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Calculation/Statistics
/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getXScales = function() {
  this.calculate();
  return this.getScales(this.getAdditionalScales(this.xScales, true));
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getYScales = function() {
  this.calculate();
  return this.getScales(this.getAdditionalScales(this.yScales, false));
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.calculateAdditionalXScalesExtensions = function() {
  this.extendScalesByMarkers(this.xScales, true);
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.calculateAdditionalYScalesExtensions = function() {
  this.extendScalesByMarkers(this.yScales, false);
};


/**
 * Extend scales by axis markers values.
 * @param {Object} scalesObject Scales map.
 * @param {boolean} isX x scales extending.
 */
anychart.core.ChartWithAxes.prototype.extendScalesByMarkers = function(scalesObject, isX) {
  var scales = this.getScales(scalesObject);
  var markers = goog.array.concat(this.lineAxesMarkers_, this.rangeAxesMarkers_, this.textAxesMarkers_);
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    if (marker && marker.enabled()) {
      var autoScale = /** @type {anychart.scales.Base} */ (!!(marker.isHorizontal() ^ this.isVertical()) ? this.yScale() : this.xScale());
      var markerScale = marker.scale() ? marker.scale() : autoScale;
      if (markerScale) {
        for (var j = 0; j < scales.length; j++) {
          var scale = scales[j];
          if ((scale === markerScale) && (marker.getOption('scaleRangeMode') == anychart.enums.ScaleRangeMode.CONSIDER)) {
            scale.extendDataRange.apply(scale, marker.getReferenceValues());
          }
        }
      }
    }
  }
};


//endregion
//region --- Crosshair
//----------------------------------------------------------------------------------------------------------------------
//
//  Crosshair
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Crosshair|anychart.core.ChartWithAxes)}
 */
anychart.core.ChartWithAxes.prototype.crosshair = function(opt_value) {
  if (!this.crosshair_) {
    this.crosshair_ = new anychart.core.ui.Crosshair();
    this.crosshair_.enabled(false);
    this.crosshair_.interactivityTarget(this);
    this.crosshair_.listenSignals(this.onCrosshairSignal_, this);
    this.setupCreated('crosshair', this.crosshair_);

    this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
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
anychart.core.ChartWithAxes.prototype.onCrosshairSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSHAIR, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Annotations
//----------------------------------------------------------------------------------------------------------------------
//
//  Annotations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Annotations plot-level controller.
 * @param {Array.<anychart.enums.AnnotationTypes|anychart.annotationsModule.AnnotationJSONFormat>=} opt_annotationsList
 * @return {anychart.core.ChartWithSeries|anychart.annotationsModule.PlotController}
 */
anychart.core.ChartWithAxes.prototype.annotations = function(opt_annotationsList) {
  if (!this.annotationsModule_) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Annotations']);
  } else if (!this.annotationsPlotController_) {
    /**
     * @type {anychart.annotationsModule.ChartController}
     * @private
     */
    this.annotationsChartController_ = new this.annotationsModule_['ChartController'](this);
    /**
     * @type {anychart.annotationsModule.PlotController}
     * @private
     */
    this.annotationsPlotController_ = new this.annotationsModule_['PlotController'](this.annotationsChartController_, this);
    this.setupCreated('annotations', this.annotationsPlotController_);
    this.annotationsPlotController_.listenSignals(this.annotationsInvalidated_, this);
  }
  if (goog.isDef(opt_annotationsList)) {
    if (this.annotationsPlotController_)
      this.annotationsPlotController_.setup(opt_annotationsList);
    return this;
  }
  return this.annotationsPlotController_ || null;
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.ChartWithAxes.prototype.annotationsInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_ANNOTATIONS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/Setter for default annotation settings.
 * @param {Object=} opt_value
 * @return {Object}
 */
anychart.core.ChartWithAxes.prototype.defaultAnnotationSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultAnnotationSettings_ = opt_value;
    return this;
  }
  return this.defaultAnnotationSettings_;
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.onMouseDown = function(event) {
  if (this.annotationsModule_)
    this.annotations().unselect();
  anychart.core.ChartWithAxes.base(this, 'onMouseDown', event);
};


//endregion
//region --- Bounds
//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.getPlotBounds = function() {
  return this.dataBounds;
};


/**
 * Prepare content area bounds.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 * @return {anychart.math.Rect}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.getContentAreaBounds = function(bounds) {
  return bounds.clone().round();
};


/**
 * Get bounds without axes and scrollers.
 * @param {anychart.math.Rect} contentAreaBounds Total bounds of content area.
 * @param {number=} opt_scrollerSize Scroller size if any (used in descendants to override the behaviour).
 * @return {anychart.math.Rect}
 */
anychart.core.ChartWithAxes.prototype.getBoundsWithoutAxes = function(contentAreaBounds, opt_scrollerSize) {
  var axesInsideBounds = this.getPixelBounds().clone();

  var i, count;
  var axis;
  var axes = goog.array.concat(this.xAxes_, this.yAxes_);
  var attempt = 0;

  var firstLeftAxis, firstTopAxis, firstRightAxis, firstBottomAxis;
  for (i = 0, count = axes.length; i < count; i++) {
    axis = /** @type {anychart.core.Axis} */(axes[i]);
    if (axis && axis.enabled()) {
      switch (axis.getOption('orientation')) {
        case anychart.enums.Orientation.TOP:
          if (!firstTopAxis)
            firstTopAxis = axis;
          break;
        case anychart.enums.Orientation.BOTTOM:
          if (!firstBottomAxis)
            firstBottomAxis = axis;
          break;
        case anychart.enums.Orientation.RIGHT:
          if (!firstRightAxis)
            firstRightAxis = axis;
          break;
        case anychart.enums.Orientation.LEFT:
          if (!firstLeftAxis)
            firstLeftAxis = axis;
          break;
      }
      axis.suspendSignalsDispatching();
      var axisPaddingSettings = axis.padding().ownSettings;
      axisPaddingSettings['top'] = 0;
      axisPaddingSettings['right'] = 0;
      axisPaddingSettings['bottom'] = 0;
      axisPaddingSettings['left'] = 0;
      axis.invalidate(axis.ALL_VISUAL_STATES);
    }
  }

  var boundsWithoutAxes;
  do {
    // axes local vars
    var remainingBounds;
    var orientation;
    var offsets = [0, 0, 0, 0];
    var complete = true;
    boundsWithoutAxes = contentAreaBounds.clone();
    this.topAxisPadding_ = NaN;
    this.bottomAxisPadding_ = NaN;
    this.leftAxisPadding_ = NaN;
    this.rightAxisPadding_ = NaN;
    var axisStrokeThickness;

    for (i = axes.length; i--;) {
      axis = /** @type {anychart.core.Axis} */(axes[i]);
      if (axis && axis.enabled()) {
        axis.parentBounds(contentAreaBounds);
        orientation = axis.getOption('orientation');
        var stroke = /** @type {acgraph.vector.Stroke|string} */(axis.getOption('stroke'));
        if (!goog.isObject(stroke))
          stroke = acgraph.vector.normalizeStroke(stroke);
        axisStrokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(stroke));
        if (orientation == anychart.enums.Orientation.TOP) {
          axis.padding()['top'](offsets[0]);
          axis.padding()['bottom'](0);
          remainingBounds = axis.getRemainingBounds(firstTopAxis != axis);
          offsets[0] = contentAreaBounds.height - remainingBounds.height;
          if (isNaN(this.topAxisPadding_))
            this.topAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.BOTTOM) {
          axis.padding()['bottom'](offsets[2]);
          axis.padding()['top'](0);
          remainingBounds = axis.getRemainingBounds(firstBottomAxis != axis);
          offsets[2] = contentAreaBounds.height - remainingBounds.height;
          if (isNaN(this.bottomAxisPadding_))
            this.bottomAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.LEFT) {
          axis.padding()['left'](offsets[3]);
          axis.padding()['right'](0);
          remainingBounds = axis.getRemainingBounds(firstLeftAxis != axis);
          offsets[3] = contentAreaBounds.width - remainingBounds.width;
          if (isNaN(this.leftAxisPadding_))
            this.leftAxisPadding_ = axisStrokeThickness;
        } else if (orientation == anychart.enums.Orientation.RIGHT) {
          axis.padding()['right'](offsets[1]);
          axis.padding()['left'](0);
          remainingBounds = axis.getRemainingBounds(firstRightAxis != axis);
          offsets[1] = contentAreaBounds.width - remainingBounds.width;
          if (isNaN(this.rightAxisPadding_))
            this.rightAxisPadding_ = axisStrokeThickness;
        }
      }
    }

    offsets = this.applyScrollerOffset(offsets, opt_scrollerSize || 0);

    boundsWithoutAxes.left += offsets[3];
    boundsWithoutAxes.top += offsets[0];
    boundsWithoutAxes.width -= offsets[1] + offsets[3];
    boundsWithoutAxes.height -= offsets[2] + offsets[0];

    for (i = axes.length; i--;) {
      axis = /** @type {anychart.core.Axis} */(axes[i]);
      if (axis && axis.enabled()) {
        var isNotFirstAxis = firstTopAxis != axis && firstBottomAxis != axis && firstLeftAxis != axis && firstRightAxis != axis;
        var remainingBoundsBeforeSetPadding = axis.getRemainingBounds(isNotFirstAxis);

        if (axis.isHorizontal()) {
          axis.padding()['left'](offsets[3]);
          axis.padding()['right'](offsets[1]);
          remainingBounds = axis.getRemainingBounds(firstTopAxis != axis && firstBottomAxis != axis);
          if (remainingBounds.height != remainingBoundsBeforeSetPadding.height) {
            complete = false;
          }
        } else {
          axis.padding()['top'](offsets[0]);
          axis.padding()['bottom'](offsets[2]);
          remainingBounds = axis.getRemainingBounds(firstLeftAxis != axis && firstRightAxis != axis);
          if (remainingBounds.width != remainingBoundsBeforeSetPadding.width) {
            complete = false;
          }
        }

        var axisPixelBounds = axis.getPixelBounds(false);
        var side;
        switch (axis.getOption('orientation')) {
          case anychart.enums.Orientation.TOP:
            side = anychart.enums.Orientation.BOTTOM;
            break;
          case anychart.enums.Orientation.RIGHT:
            side = anychart.enums.Orientation.LEFT;
            break;
          case anychart.enums.Orientation.BOTTOM:
            side = anychart.enums.Orientation.TOP;
            break;
          case anychart.enums.Orientation.LEFT:
            side = anychart.enums.Orientation.RIGHT;
            break;
        }

        var bounds = axesInsideBounds.differenceBySide(axisPixelBounds, /** @type {anychart.enums.Orientation} */(side));
        if (bounds)
          axesInsideBounds = bounds;
      }
    }
    attempt++;
  } while (!complete && attempt < anychart.core.ChartWithAxes.MAX_ATTEMPTS_AXES_CALCULATION);

  for (i = 0, count = axes.length; i < count; i++) {
    axis = axes[i];
    if (axis && axis.enabled()) {
      if (axis == firstTopAxis || axis == firstBottomAxis || axis == firstLeftAxis || axis == firstRightAxis) {
        axis.insideBounds(axesInsideBounds);
      }

      axis.resumeSignalsDispatching(false);
    }
  }
  return boundsWithoutAxes.clone().round();
};


/**
 * Should apply additional offsets produced by the scroller if any and return the offsets array.
 * @param {Array.<number>} offsets
 * @param {number} scrollerSize
 * @return {Array.<number>}
 */
anychart.core.ChartWithAxes.prototype.applyScrollerOffset = function(offsets, scrollerSize) {
  return offsets;
};


//endregion
//region --- Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns bounds chagned signal
 * @return {number}
 */
anychart.core.ChartWithAxes.prototype.getBoundsChangedSignal = function() {
  return anychart.ConsistencyState.AXES_CHART_AXES |
      anychart.ConsistencyState.AXES_CHART_GRIDS |
      anychart.ConsistencyState.AXES_CHART_AXES_MARKERS |
      anychart.ConsistencyState.SERIES_CHART_SERIES |
      anychart.ConsistencyState.AXES_CHART_ANNOTATIONS |
      anychart.ConsistencyState.AXES_CHART_CROSSHAIR |
      anychart.ConsistencyState.AXES_CHART_CROSSLINES;
};


/**
 * Draw chart elements.
 */
anychart.core.ChartWithAxes.prototype.drawElements = function() {
  var i, count;
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_GRIDS)) {
    var grids = goog.array.concat(this.yGrids_, this.xGrids_, this.xMinorGrids_, this.yMinorGrids_);

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
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_GRIDS);
  }

  // draw axes outside of data bounds
  // only inside axes ticks can intersect data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    var axes = goog.array.concat(this.xAxes_, this.yAxes_);
    var axis;
    for (i = 0, count = axes.length; i < count; i++) {
      axis = /** @type {anychart.core.Axis} */(axes[i]);
      if (axis) {
        axis.suspendSignalsDispatching();
        axis.container(this.rootElement);
        axis.draw();
        axis.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS)) {
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
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS);
  }
};


/**
 * Draw cartesian chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.core.ChartWithAxes.prototype.drawContent = function(bounds) {
  if (this.annotationsModule_) {
    this.annotations();
    this.annotationsChartController_.ready(true);
  }

  var i, count;

  this.calculate();

  if (this.isConsistent()) {
    return;
  }

  anychart.core.Base.suspendSignalsDispatching(this.xAxes_, this.yAxes_);

  anychart.performance.start('Cartesian bounds calc');
  // set default scales for axis if they not set
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES_CHART_AXES)) {
    var item;
    for (i = 0, count = this.xAxes_.length; i < count; i++) {
      item = this.xAxes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
        //Scale uid check fixes DVF-3678
        if (item && (!item.scale() || String(goog.getUid(item.scale())) == this.oldXScaleUid)) {
          item.scale(/** @type {anychart.scales.Base} */(this.xScale()));
          this.invalidate(anychart.ConsistencyState.BOUNDS);
        }
      }
    }

    for (i = 0, count = this.yAxes_.length; i < count; i++) {
      item = this.yAxes_[i];
      if (item) {
        item.labels().dropCallsCache();
        item.minorLabels().dropCallsCache();
        //Scale uid check fixes DVF-3678
        if (item && (!item.scale() || String(goog.getUid(item.scale())) == this.oldYScaleUid)) {
          this.setYAxisScale(item);
          this.invalidate(anychart.ConsistencyState.BOUNDS);
        }
      }
    }
  }

  // calculate axes space first, the result is data bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // bounds of data area
    this.dataBounds = this.getBoundsWithoutAxes(this.getContentAreaBounds(bounds));

    // we do not invalidate series BOUNDS state, because it will be invalidate naturally in series drawing section
    this.invalidateAnnotations();
    this.invalidate(this.getBoundsChangedSignal());
  }

  anychart.performance.end('Cartesian bounds calc');

  anychart.performance.start('Cartesian elements drawing');
  this.drawElements();
  anychart.performance.end('Cartesian elements drawing');

  this.drawSeries(this.topAxisPadding_, this.rightAxisPadding_, this.bottomAxisPadding_,
      this.leftAxisPadding_);

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_CROSSHAIR)) {
    var crosshair = this.getCreated('crosshair');
    if (crosshair) {
      crosshair.suspendSignalsDispatching();
      crosshair.parentBounds(this.dataBounds);
      crosshair.container(this.rootElement);
      crosshair.draw();
      crosshair.resumeSignalsDispatching(false);
    }

    this.markConsistent(anychart.ConsistencyState.AXES_CHART_CROSSHAIR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_ANNOTATIONS)) {
    if (this.annotationsModule_) {
      var annotations = this.annotations();
      annotations.suspendSignalsDispatching();
      annotations.parentBounds(this.dataBounds);
      annotations.container(this.rootElement);
      annotations.draw();
      annotations.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_ANNOTATIONS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_CROSSLINES)) {
    if (!this.crosslines_) {
      this.crosslines_ = this.rootElement.path();
      this.crosslines_.zIndex(2);
    }
    var stroke = /** @type {acgraph.vector.Stroke} */ (this.crossing().getOption('stroke'));
    var strokeIsNone = anychart.utils.isNone(stroke) || !goog.isDef(stroke);
    var thickness = acgraph.vector.getThickness(stroke);
    if (!strokeIsNone) {
      var lineBounds = this.dataBounds.clone();
      var top = lineBounds.top;
      var bottom = top + lineBounds.height;
      var left = lineBounds.left;
      var right = left + lineBounds.width;
      var middleX = anychart.utils.applyPixelShift((left + right) / 2, thickness);
      var middleY = anychart.utils.applyPixelShift((top + bottom) / 2, thickness);

      this.crosslines_
          .clear()
          .moveTo(middleX, top)
          .lineTo(middleX, bottom)
          .moveTo(left, middleY)
          .lineTo(right, middleY);
    }

    if (this.crosslines_) {
      this.crosslines_.stroke(stroke);
      this.crosslines_.clip(this.dataBounds);
    }

    this.calculateQuarterBounds(thickness);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_QUARTER);
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_CROSSLINES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_QUARTER)) {
    var quarters = this.quarters().getItems();
    for (i = 0; i < quarters.length; i++) {
      var quarterInstance = quarters[i];
      if (!quarterInstance)
        continue;
      quarterInstance.container(this.rootElement);
      quarterInstance.parentBounds(this.quarterBounds_[i]);
      quarterInstance.draw();
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_QUARTER);
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.xAxes_, this.yAxes_);
};


//endregion
//region --- Quadrant
/**
 * Calculates bounds for all quarters.
 * @param {number} thickness Thickness of crosslines
 */
anychart.core.ChartWithAxes.prototype.calculateQuarterBounds = function(thickness) {
  /**
   * @type {Array.<anychart.math.Rect>}
   * @private
   */
  this.quarterBounds_ = [];

  var w = this.dataBounds.width / 2;
  var h = this.dataBounds.height / 2;

  // right top quarter
  this.quarterBounds_[0] = anychart.math.rect(
      this.dataBounds.left + w + thickness / 2,
      this.dataBounds.top, w - thickness / 2, h - thickness / 2);

  // left top quarter
  this.quarterBounds_[1] = anychart.math.rect(
      this.dataBounds.left,
      this.dataBounds.top, w - thickness / 2, h - thickness / 2);

  // left bottom quarter
  this.quarterBounds_[2] = anychart.math.rect(
      this.dataBounds.left,
      this.dataBounds.top + h + thickness / 2, w - thickness / 2, h - thickness / 2);

  // right bottom quarter
  this.quarterBounds_[3] = anychart.math.rect(
      this.dataBounds.left + w + thickness / 2,
      this.dataBounds.top + h + thickness / 2, w - thickness / 2, h - thickness / 2);
};


/**
 * Quarter invalidation handler.
 * @param {anychart.SignalEvent} event Signal event.
 */
anychart.core.ChartWithAxes.prototype.quarterInvalidated = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_QUARTER, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for quarter settings.
 * @param {Object=} opt_value
 * @return {anychart.core.ChartWithAxes|anychart.core.utils.QuarterSettings} Chart or quarter settings.
 */
anychart.core.ChartWithAxes.prototype.quarters = function(opt_value) {
  if (!this.quarterSettings_) {
    this.quarterSettings_ = new anychart.core.utils.QuarterSettings(this);

    this.setupCreated('quarters', this.quarterSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.quarterSettings_.setup(opt_value);
    return this;
  }
  return this.quarterSettings_;
};


/**
 * Crossing invalidation handler.
 * @param {anychart.SignalEvent} event Signal event.
 * @private
 */
anychart.core.ChartWithAxes.prototype.crossingInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_CROSSLINES | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for crossing settings.
 * @param {(Object)=} opt_value Crossing settings object.
 * @return {(anychart.core.ChartWithAxes|anychart.core.utils.Crossing)} Crossing settings or self for chaining.
 */
anychart.core.ChartWithAxes.prototype.crossing = function(opt_value) {
  if (!this.crossing_) {
    this.crossing_ = new anychart.core.utils.Crossing();
    this.setupCreated('crossing', this.crossing_);
    this.crossing_.listenSignals(this.crossingInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.crossing_.setup(opt_value);
    return this;
  }
  return this.crossing_;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ChartWithAxes.base(this, 'setupByJSON', config, opt_default);
  this.crossing(config['crossing']);
  this.quarters(config['quarters']);
};


/**
 * Setup axis markers with scales.
 * @param {Object=} opt_config configuration to use for elements initialization.
 */
anychart.core.ChartWithAxes.prototype.setupAxisMarkers = function(opt_config) {
  var scalesInstances = this.getScaleInstances();
  var config  = goog.isDef(opt_config) ? opt_config : this.themeSettings;
  var setupElement = goog.isDef(opt_config);

  this.setupElementsWithScales(config['lineAxesMarkers'], this.lineMarker, scalesInstances, setupElement);
  this.setupElementsWithScales(config['rangeAxesMarkers'], this.rangeMarker, scalesInstances, setupElement);
  this.setupElementsWithScales(config['textAxesMarkers'], this.textMarker, scalesInstances, setupElement);
};


/**
 * Setups scales for grids.
 * @param {Object=} opt_config configuration to use for grid initialization.
 */
anychart.core.ChartWithAxes.prototype.setupGrids = function(opt_config) {
  var scalesInstances = this.getScaleInstances();
  var config  = goog.isDef(opt_config) ? opt_config : this.themeSettings;
  var setupElement = goog.isDef(opt_config);

  this.setupElementsWithScales(config['xGrids'], this.xGrid, scalesInstances, setupElement);
  this.setupElementsWithScales(config['yGrids'], this.yGrid, scalesInstances, setupElement);
  this.setupElementsWithScales(config['xMinorGrids'], this.xMinorGrid, scalesInstances, setupElement);
  this.setupElementsWithScales(config['yMinorGrids'], this.yMinorGrid, scalesInstances, setupElement);
};



/**
 * @inheritDoc
 */
anychart.core.ChartWithAxes.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  anychart.core.ChartWithAxes.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);

  if ('isVertical' in config)
    this.isVerticalInternal = !!config['isVertical'];

  // this.defaultXAxisSettings(config['defaultXAxisSettings']);
  // this.defaultYAxisSettings(config['defaultYAxisSettings']);
  // this.defaultGridSettings(config['defaultGridSettings']);
  // this.defaultMinorGridSettings(config['defaultMinorGridSettings']);
  // this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);
  // this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);
  // this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);
  // this.defaultAnnotationSettings(config['defaultAnnotationSettings']);
  if (this.annotationsModule_)
    this.annotations(config['annotations']);

  this.setupGrids(config);
  this.setupAxes(config);
  this.setupAxisMarkers(config);

  if ('crosshair' in config)
    this.crosshair().setupInternal(!!opt_default, config['crosshair']);
};


/**
 * Setup xAxes and yAxes
 * @param {Object=} opt_config configuration to use for elements initialization.
 */
anychart.core.ChartWithAxes.prototype.setupAxes = function(opt_config) {
  var scalesInstances = /** @type {Object} */(this.getScaleInstances());
  var config = goog.isDef(opt_config) ? opt_config : this.themeSettings;
  var setupElement = goog.isDef(opt_config);

  this.setupElementsWithScales(config['xAxes'], this.xAxis, scalesInstances, setupElement);
  this.setupElementsWithScales(config['yAxes'], this.yAxis, scalesInstances, setupElement);
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.serialize = function() {
  var json = anychart.core.ChartWithAxes.base(this, 'serialize');
  json['crossing'] = this.crossing().serialize();
  json['quarters'] = this.quarters().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.core.ChartWithAxes.base(this, 'serializeWithScales', json, scales, scaleIds);

  json['isVertical'] = this.isVertical();

  var axesIds = [];
  this.serializeElementsWithScales(json, 'xAxes', this.xAxes_, this.serializeAxis, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'yAxes', this.yAxes_, this.serializeAxis, scales, scaleIds, axesIds);

  this.serializeElementsWithScales(json, 'xGrids', this.xGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'yGrids', this.yGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'xMinorGrids', this.xMinorGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'yMinorGrids', this.yMinorGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'lineAxesMarkers', this.lineAxesMarkers_, this.serializeAxisMarker_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'rangeAxesMarkers', this.rangeAxesMarkers_, this.serializeAxisMarker_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'textAxesMarkers', this.textAxesMarkers_, this.serializeAxisMarker_, scales, scaleIds, axesIds);

  json['crosshair'] = this.crosshair().serialize();
};


/**
 * Serializes an axis and returns its config.
 * @param {anychart.core.Axis} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @protected
 */
anychart.core.ChartWithAxes.prototype.serializeAxis = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  axesIds.push(goog.getUid(item));
  return config;
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.GridBase} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeGrid_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  var axis = /** @type {anychart.core.Axis} */(item.axis());
  if (axis) {
    var axisIndex = goog.array.indexOf(axesIds, goog.getUid(axis));
    if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
      if (!('layout' in config)) {
        config['layout'] = axis.isHorizontal() ?
            anychart.enums.Layout.HORIZONTAL :
            anychart.enums.Layout.VERTICAL;
      }
      if (!('scale' in config)) { //doesn't override the scale already set.
        this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(axis.scale()), scales, scaleIds);
      }
    } else {
      config['axis'] = axisIndex;
    }
  }
  return config;
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.axisMarkers.PathBase|anychart.core.axisMarkers.TextBase|anychart.core.GridBase} item
 * @param {Object} config
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeElementAxis_ = function(item, config, scales, scaleIds, axesIds) {
  var axis = item.axis();
  if (axis) {
    var axisIndex = goog.array.indexOf(axesIds, goog.getUid(axis));
    if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
      if (!('layout' in config)) {
        config['layout'] = axis.isHorizontal() ?
            anychart.enums.Layout.HORIZONTAL :
            anychart.enums.Layout.VERTICAL;
      }
      if (!('scale' in config)) { //doesn't override the scale already set.
        this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(axis.scale()), scales, scaleIds);
      }
    } else {
      config['axis'] = axisIndex;
    }
  }
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.core.axisMarkers.PathBase|anychart.core.axisMarkers.TextBase} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.core.ChartWithAxes.prototype.serializeAxisMarker_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  if (item.isScaleSet())
    this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scaleInternal()), scales, scaleIds);
  this.serializeElementAxis_(item, config, scales, scaleIds, axesIds);
  return config;
};


/** @inheritDoc */
anychart.core.ChartWithAxes.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.xAxes_,
      this.yAxes_,
      this.lineAxesMarkers_,
      this.rangeAxesMarkers_,
      this.textAxesMarkers_,
      this.xGrids_,
      this.yGrids_,
      this.xMinorGrids_,
      this.yMinorGrids_,
      this.quarterSettings_,
      this.crossing_,
      this.annotationsChartController_);

  delete this.xAxes_;
  delete this.yAxes_;
  this.lineAxesMarkers_ = null;
  this.rangeAxesMarkers_ = null;
  this.textAxesMarkers_ = null;
  this.xGrids_ = null;
  this.yGrids_ = null;
  this.xMinorGrids_ = null;
  this.yMinorGrids_ = null;
  this.quarterSettings_ = null;
  this.crossing_ = null;
  this.annotationsChartController_ = null;

  anychart.core.ChartWithAxes.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.core.ChartWithAxes.prototype;
  proto['isVertical'] = proto.isVertical;
})();
