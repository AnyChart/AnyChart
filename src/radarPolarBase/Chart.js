goog.provide('anychart.radarPolarBaseModule.Chart');

goog.require('anychart.core.ChartWithOrthogonalScales');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.palettes');
goog.require('anychart.radarPolarBaseModule.RadialAxis');
goog.require('anychart.scales');



/**
 * Common chart class for radar and polar.
 * @param {boolean} categorizeData
 * @constructor
 * @extends {anychart.core.ChartWithOrthogonalScales}
 */
anychart.radarPolarBaseModule.Chart = function(categorizeData) {
  anychart.radarPolarBaseModule.Chart.base(this, 'constructor', categorizeData);

  /**
   * @type {Array.<anychart.radarModule.Grid|anychart.polarModule.Grid>}
   * @private
   */
  this.xGrids_ = [];

  /**
   * @type {Array.<anychart.radarModule.Grid|anychart.polarModule.Grid>}
   * @private
   */
  this.yGrids_ = [];

  /**
   * @type {Array.<anychart.radarModule.Grid|anychart.polarModule.Grid>}
   * @private
   */
  this.xMinorGrids_ = [];

  /**
   * @type {Array.<anychart.radarModule.Grid|anychart.polarModule.Grid>}
   * @private
   */
  this.yMinorGrids_ = [];

  function beforeInvalidation() {
    for (var i = 0; i < this.seriesList.length; i++) {
      this.seriesList[i].invalidate(anychart.ConsistencyState.SERIES_POINTS);
    }
  }
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['startAngle', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['innerRadius',
      anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.SERIES_CHART_SERIES,
      anychart.Signal.NEEDS_REDRAW,
      0,
      beforeInvalidation]
  ]);
};
goog.inherits(anychart.radarPolarBaseModule.Chart, anychart.core.ChartWithOrthogonalScales);

//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported consistency states. Adds AXES, AXES_MARKERS, GRIDS to anychart.core.ChartWithSeries states.
 * @type {number}
 */
anychart.radarPolarBaseModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithOrthogonalScales.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.AXES_CHART_GRIDS;


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.calculateStatistics = function() {
  anychart.radarPolarBaseModule.Chart.base(this, 'calculateStatistics');

  var elementsStat = this.statistics(anychart.enums.Statistics.CHART_ELEMENTS);

  elementsStat['axes'] = {'x': 1, 'y': 1};
  elementsStat['grids'] = {'x': 0, 'y': 0, 'xMinor': 0, 'yMinor': 0};

  var length = Math.max(
      this.xGrids_.length,
      this.yGrids_.length,
      this.xMinorGrids_.length,
      this.yMinorGrids_.length);

  for (var i = length; i--;) {
    if (this.xGrids_[i]) elementsStat['grids']['x']++;
    if (this.yGrids_[i]) elementsStat['grids']['y']++;
    if (this.xMinorGrids_[i]) elementsStat['grids']['xMinor']++;
    if (this.yMinorGrids_[i]) elementsStat['grids']['yMinor']++;
  }

  this.statistics(anychart.enums.Statistics.CHART_ELEMENTS, elementsStat);
};


//endregion
//region --- Specific settings
//------------------------------------------------------------------------------
//
//  Specific settings
//
//------------------------------------------------------------------------------
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.radarPolarBaseModule.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  function startAngleNormalizer(opt_value) {
    return goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'startAngle',
      startAngleNormalizer);

  function innerRadiusNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, this.getOption('innerRadius'));
  }

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'innerRadius',
      innerRadiusNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.radarPolarBaseModule.Chart, anychart.radarPolarBaseModule.Chart.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.getPlotBounds = function() {
  return this.dataBounds;
};


//endregion
//region --- Grids
//------------------------------------------------------------------------------
//
//  Grids
//
//------------------------------------------------------------------------------
/**
 * Create Grid instance.
 * @return {!(anychart.radarModule.Grid|anychart.polarModule.Grid)}
 * @protected
 */
anychart.radarPolarBaseModule.Chart.prototype.createGridInstance = goog.abstractMethod;


/**
 * Return z-index for grid.
 * @param {boolean} isMajor .
 * @return {number}
 */
anychart.radarPolarBaseModule.Chart.prototype.getGridZIndex = function(isMajor) {
  var themeSettings = isMajor ? this.defaultGridSettings() : this.defaultMinorGridSettings();
  return themeSettings['zIndex'] + goog.array.concat(this.xGrids_, this.yGrids_, this.xMinorGrids_, this.yMinorGrids_).length * 0.001;
};


/**
 * Getter/setter for x grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.radarModule.Grid|anychart.polarModule.Grid|anychart.radarPolarBaseModule.Chart)} Grid instance by index or itself for method chaining.
 */
anychart.radarPolarBaseModule.Chart.prototype.xGrid = function(opt_indexOrValue, opt_value) {
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
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.RADIAL);
    grid.zIndex(this.getGridZIndex(true));
    this.xGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    grid.setup(value);
    return this;
  } else {
    return grid;
  }
};


/**
 * Getter/setter for y grid.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Grid settings.
 * @param {(Object|boolean|null)=} opt_value Grid settings to set.
 * @return {!(anychart.radarModule.Grid|anychart.polarModule.Grid|anychart.radarPolarBaseModule.Chart)} Grid instance by index or itself for method chaining.
 */
anychart.radarPolarBaseModule.Chart.prototype.yGrid = function(opt_indexOrValue, opt_value) {
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
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.CIRCUIT);
    grid.zIndex(this.getGridZIndex(true));
    this.yGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.radarModule.Grid|anychart.polarModule.Grid|anychart.radarPolarBaseModule.Chart)} Minor grid instance by index or itself for method chaining.
 */
anychart.radarPolarBaseModule.Chart.prototype.xMinorGrid = function(opt_indexOrValue, opt_value) {
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
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.RADIAL);
    grid.addThemes('defaultMinorGridSettings');
    grid.zIndex(this.getGridZIndex(false));
    this.xMinorGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
 * @return {!(anychart.radarModule.Grid|anychart.polarModule.Grid|anychart.radarPolarBaseModule.Chart)} Minor grid instance by index or itself for method chaining.
 */
anychart.radarPolarBaseModule.Chart.prototype.yMinorGrid = function(opt_indexOrValue, opt_value) {
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
    grid.setDefaultLayout(anychart.enums.RadialGridLayout.CIRCUIT);
    grid.addThemes('defaultMinorGridSettings');
    grid.zIndex(this.getGridZIndex(false));
    this.yMinorGrids_[index] = grid;
    grid.listenSignals(this.onGridSignal, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
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
anychart.radarPolarBaseModule.Chart.prototype.onGridSignal = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_GRIDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Getter/setter for grid default settings.
 * @param {Object=} opt_value Object with grid settings.
 * @return {Object}
 */
anychart.radarPolarBaseModule.Chart.prototype.defaultGridSettings = function(opt_value) {
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
anychart.radarPolarBaseModule.Chart.prototype.defaultMinorGridSettings = function(opt_value) {
  if (!this.defaultMinorGridSettings_) { // we need this for getGridZIndex method to work
    this.defaultMinorGridSettings_ = anychart.getFlatTheme('defaultMinorGridSettings');
  }

  if (goog.isDef(opt_value)) {
    this.defaultMinorGridSettings_ = opt_value;
    return this;
  }
  return this.defaultMinorGridSettings_ || {};
};


/**
 * Setup scales for grids.
 * @param {Object=} opt_config
 */
anychart.radarPolarBaseModule.Chart.prototype.setupGrids = function(opt_config) {
  var scalesInstances = this.getScaleInstances();
  var config  = goog.isDef(opt_config) ? opt_config : this.themeSettings;
  var setupElement = goog.isDef(opt_config);

  this.setupElementsWithScales(config['xGrids'], this.xGrid, scalesInstances, setupElement);
  this.setupElementsWithScales(config['yGrids'], this.yGrid, scalesInstances, setupElement);
  this.setupElementsWithScales(config['xMinorGrids'], this.xMinorGrid, scalesInstances, setupElement);
  this.setupElementsWithScales(config['yMinorGrids'], this.yMinorGrid, scalesInstances, setupElement);
};
//endregion
//region --- Axes
//------------------------------------------------------------------------------
//
//  Axes
//
//------------------------------------------------------------------------------
/**
 * Creates proper axis instance.
 * @return {anychart.radarModule.Axis|anychart.polarModule.Axis}
 */
anychart.radarPolarBaseModule.Chart.prototype.createXAxisInstance = goog.abstractMethod;


/**
 * Getter/setter for xAxis.
 * @param {(Object|boolean|null)=} opt_value Chart axis settings to set.
 * @return {!(anychart.radarModule.Axis|anychart.polarModule.Axis|anychart.radarPolarBaseModule.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.radarPolarBaseModule.Chart.prototype.xAxis = function(opt_value) {
  if (!this.xAxis_) {
    this.xAxis_ = this.createXAxisInstance();
    this.setupCreated('xAxis', this.xAxis_);
    this.xAxis_.setParentEventTarget(this);
    this.xAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.BOUNDS);
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
 * @return {!(anychart.radarPolarBaseModule.RadialAxis|anychart.radarPolarBaseModule.Chart)} Axis instance by index or itself for method chaining.
 */
anychart.radarPolarBaseModule.Chart.prototype.yAxis = function(opt_value) {
  if (!this.yAxis_) {
    this.yAxis_ = new anychart.radarPolarBaseModule.RadialAxis();
    this.setupCreated('yAxis', this.yAxis_);
    this.yAxis_.setParentEventTarget(this);
    this.yAxis_.listenSignals(this.onAxisSignal_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.BOUNDS);
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
anychart.radarPolarBaseModule.Chart.prototype.onAxisSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.AXES_CHART_AXES;
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
 * @return {anychart.polarModule.Axis|anychart.radarModule.Axis|anychart.radarPolarBaseModule.RadialAxis|undefined}
 */
anychart.radarPolarBaseModule.Chart.prototype.getAxisByIndex = function(index) {
  switch (index) {
    case 0:
      return this.xAxis_;
    case 1:
      return this.yAxis_;
    default:
      return void 0;
  }
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.getXAxisByIndex = function() {
  return this.xAxis_;
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.getYAxisByIndex = function() {
  return this.yAxis_;
};


//endregion
//region --- Drawing
//------------------------------------------------------------------------------
//
//  Drawing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.setupSeriesBeforeDraw = function(series, opt_topAxisPadding, opt_rightAxisPadding, opt_bottomAxisPadding, opt_leftAxisPadding) {
  var startAngle = /** @type {number} */ (this.getOption('startAngle'));
  if (series.getOwnOption('startAngle') != startAngle) {
    series.setOption('startAngle', startAngle);
    series.invalidate(anychart.ConsistencyState.SERIES_POINTS);
  }
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.beforeSeriesDraw = function() {
  this.distributeSeries();
};


/**
 * Draw radar polar chart content items.
 * @param {anychart.math.Rect} bounds Bounds of cartesian content area.
 */
anychart.radarPolarBaseModule.Chart.prototype.drawContent = function(bounds) {
  var i, count;

  this.calculate();

  if (this.isConsistent()) {
    return;
  }

  var xAxis = this.xAxis();
  var yAxis = this.yAxis();

  anychart.core.Base.suspendSignalsDispatching(xAxis, yAxis);

  var axisInvalidated = false;
  var startAngle = /** @type {number} */ (this.getOption('startAngle'));

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.AXES_CHART_AXES)) {
    var xScale = /** @type {anychart.scales.Base} */(this.xScale());
    var yScale = /** @type {anychart.scales.Base} */(this.yScale());

    if (!xAxis.scale() || xAxis.scale().isChartScale) {
      xAxis.scaleInternal(xScale, true);
    }
    xAxis.dropLabelCallsCache();

    if (!yAxis.scale() || yAxis.scale().isChartScale) {
      yAxis.scaleInternal(yScale, true);
    }
    yAxis.dropLabelCallsCache();

    // Total bounds of content area.
    var contentAreaBounds = bounds.clone().round();
    xAxis['startAngle'](startAngle);
    xAxis.parentBounds(contentAreaBounds);

    // Data bounds are what is left of xAxis.
    var newDataBounds = xAxis.getRemainingBounds().round();

    /*
      Scale changes trigger AXES_CHART_AXES state, but leave BOUNDS state unchanged.
      At the same time changes to the scale sometimes lead to the bounds changes.
    */
    var boundsUpdated = !goog.math.Rect.equals(newDataBounds, this.dataBounds);
    var boundsInvalidated = this.hasInvalidationState(anychart.ConsistencyState.BOUNDS);

    /*
      Bounds state is triggered on bounds changes and on startAngle/innerRadius.
      So it is crucial to invalidate axes/grids/series even if data bounds remain same.
     */
    if (boundsUpdated || boundsInvalidated) {
      this.dataBounds = newDataBounds;
      this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES |
          anychart.ConsistencyState.AXES_CHART_GRIDS |
          anychart.ConsistencyState.SERIES_CHART_SERIES);
    }

    axisInvalidated = true;
  }

  var innerRadius = /** @type {string|number} */ (this.getOption('innerRadius'));

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_GRIDS)) {
    var grids = goog.array.concat(this.xGrids_, this.yGrids_, this.xMinorGrids_, this.yMinorGrids_);

    for (i = 0, count = grids.length; i < count; i++) {
      var grid = grids[i];
      if (grid) {
        grid.suspendSignalsDispatching();
        if (axisInvalidated) {
          grid.invalidate(anychart.ConsistencyState.GRIDS_POSITION);
        }
        grid.parentBounds(this.dataBounds);
        grid['innerRadius'](innerRadius);
        grid.container(this.rootElement);
        grid['startAngle'](startAngle);
        grid.draw();
        grid.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_GRIDS);
  }

  /*
    Draw axes outside of data bounds.
    Only inside axes ticks can intersect data bounds.
   */
  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    xAxis.container(this.rootElement);
    // Parent bounds and angle were already set for xAxis at BOUNDS.
    xAxis.draw();

    yAxis.container(this.rootElement);
    yAxis['startAngle'](startAngle);
    yAxis['innerRadius'](innerRadius);
    yAxis.parentBounds(this.dataBounds.clone());
    yAxis.draw();

    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }

  this.drawSeries(0, 0, 0, 0);

  anychart.core.Base.resumeSignalsDispatchingFalse(xAxis, yAxis);
};


//endregion
//region --- Interactivity
//------------------------------------------------------------------------------
//
//  Interactivity
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.getSeriesStatus = function(event) {
  var clientX = event['clientX'];
  var clientY = event['clientY'];
  var value, index;

  var containerOffset = this.container().getStage().getClientPosition();

  var x = clientX - containerOffset.x;
  var y = clientY - containerOffset.y;

  var radius = Math.min(this.dataBounds.width, this.dataBounds.height) / 2;
  var cx = Math.round(this.dataBounds.left + this.dataBounds.width / 2);
  var cy = Math.round(this.dataBounds.top + this.dataBounds.height / 2);

  var clientRadius = anychart.math.vectorLength(cx, cy, x, y);

  if (clientRadius > radius)
    return null;

  var points = [];
  var interactivity = this.interactivity();
  var i, len, series;
  var iterator;
  var dx, dy, angle;

  if (interactivity.getOption('hoverMode') == anychart.enums.HoverMode.BY_SPOT) {
    var spotRadius = /** @type {number} */(interactivity.getOption('spotRadius'));
    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      if (series.enabled()) {
        var ind = [];
        var minLength = Infinity;
        var minLengthIndex;
        var names = series.getYValueNames();
        iterator = series.getDetachedIterator();
        while (iterator.advance()) {
          var pointX = /** @type {number} */(iterator.meta('x'));
          for (var j = 0; j < names.length; j++) {
            var pointY = /** @type {number} */(iterator.meta(names[j]));
            var length = anychart.math.vectorLength(pointX, pointY, x, y);
            if (length <= spotRadius) {
              index = iterator.getIndex();
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
  } else if (this.interactivity().getOption('hoverMode') == anychart.enums.HoverMode.BY_X) {
    dx = x - cx;
    dy = y - cy;
    angle = Math.PI / 2 + Math.atan2(dy, -dx) + goog.math.toRadians(/** @type {number} */ (this.getOption('startAngle')));
    angle = goog.math.modulo(angle, Math.PI * 2);

    var ratio = 1 - (angle / (Math.PI * 2));
    for (i = 0, len = this.seriesList.length; i < len; i++) {
      series = this.seriesList[i];
      value = series.xScale().inverseTransform(ratio);
      if (this.categorizeData) {
        var tmp = series.findX(value);
        index = tmp >= 0 ? [tmp] : [];
      } else {
        index = series.data().findClosestByX(
            anychart.utils.toNumber(value),
            anychart.utils.instanceOf(series.xScale(), anychart.scales.Ordinal));
      }

      iterator = series.getDetachedIterator();
      minLength = Infinity;
      if (index.length) {
        var resultIndex = [];
        for (j = 0; j < index.length; j++) {
          if (iterator.select(index[j])) {
            var pixX = /** @type {number} */(iterator.meta('x'));
            var pixY = /** @type {number} */(iterator.meta('value'));
            length = anychart.math.vectorLength(pixX, pixY, x, y);
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


//endregion
//region --- Overrides
/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.getScaleAdditionalInvalidationState = function () {
  return anychart.radarPolarBaseModule.Chart.base(this, 'getScaleAdditionalInvalidationState') |
      anychart.ConsistencyState.AXES_CHART_GRIDS |
      anychart.ConsistencyState.AXES_CHART_AXES;
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.serialize = function() {
  var json = anychart.radarPolarBaseModule.Chart.base(this, 'serialize');
  return {'chart': json};
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.setupByJSONWithScales = function(config, scalesInstances, opt_default) {
  anychart.radarPolarBaseModule.Chart.base(this, 'setupByJSONWithScales', config, scalesInstances, opt_default);

  anychart.core.settings.deserialize(this, anychart.radarPolarBaseModule.Chart.PROPERTY_DESCRIPTORS, config);

  var json = config['xAxis'];
  this.xAxis().setupInternal(!!opt_default, json);
  if (goog.isObject(json) && 'scale' in json && json['scale'] > 1)
    this.xAxis().scale(scalesInstances[json['scale']]);

  json = config['yAxis'];
  this.yAxis().setupInternal(!!opt_default, json);
  if (goog.isObject(json) && 'scale' in json && json['scale'] > 1)
    this.yAxis().scale(scalesInstances[json['scale']]);

  this.setupGrids(config);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.serializeWithScales = function(json, scales, scaleIds) {
  anychart.radarPolarBaseModule.Chart.base(this, 'serializeWithScales', json, scales, scaleIds);

  var axesIds = [];
  anychart.core.settings.serialize(this, anychart.radarPolarBaseModule.Chart.PROPERTY_DESCRIPTORS, json);

  json['xAxis'] = this.serializeAxis_(/** @type {anychart.radarModule.Axis|anychart.polarModule.Axis} */(this.xAxis()), scales, scaleIds, axesIds);
  json['yAxis'] = this.serializeAxis_(/** @type {anychart.radarPolarBaseModule.RadialAxis} */(this.yAxis()), scales, scaleIds, axesIds);

  this.serializeElementsWithScales(json, 'xGrids', this.xGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'yGrids', this.yGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'xMinorGrids', this.xMinorGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
  this.serializeElementsWithScales(json, 'yMinorGrids', this.yMinorGrids_, this.serializeGrid_, scales, scaleIds, axesIds);
};


/**
 * Serializes an axis and returns its config.
 * @param {anychart.radarModule.Axis|anychart.polarModule.Axis|anychart.radarPolarBaseModule.RadialAxis} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.radarPolarBaseModule.Chart.prototype.serializeAxis_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.scale()), scales, scaleIds);
  axesIds.push(goog.getUid(item));
  return config;
};


/**
 * Serializes a grid and returns its config.
 * @param {anychart.radarModule.Grid|anychart.polarModule.Grid} item
 * @param {Array} scales
 * @param {Object} scaleIds
 * @param {Array} axesIds
 * @return {Object}
 * @private
 */
anychart.radarPolarBaseModule.Chart.prototype.serializeGrid_ = function(item, scales, scaleIds, axesIds) {
  var config = item.serialize();
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.xScale()), scales, scaleIds);
  this.serializeScale(config, 'scale', /** @type {anychart.scales.Base} */(item.yScale()), scales, scaleIds);
  var axis = /** @type {anychart.core.Axis} */(item.axis());
  if (axis) {
    var axisIndex = goog.array.indexOf(axesIds, goog.getUid(axis));
    if (axisIndex < 0) { //axis presents but not found in existing axes. Taking scale and layout from it.
      if (!('layout' in config)) {
        config['layout'] = anychart.utils.instanceOf(axis, anychart.radarPolarBaseModule.RadialAxis) ?
            anychart.enums.RadialGridLayout.CIRCUIT :
            anychart.enums.RadialGridLayout.RADIAL;
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


/** @inheritDoc */
anychart.radarPolarBaseModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.xAxis_, this.yAxis_, this.xGrids_, this.yGrids_,
      this.xMinorGrids_, this.yMinorGrids_);
  this.xAxis_ = null;
  this.yAxis_ = null;
  this.xGrids_ = null;
  this.yGrids_ = null;
  this.xMinorGrids_ = null;
  this.yMinorGrids_ = null;
  anychart.radarPolarBaseModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//------------------------------------------------------------------------------
//
//  Exports
//
//------------------------------------------------------------------------------
//exports
(function() {
  var proto = anychart.radarPolarBaseModule.Chart.prototype;
  proto['xScale'] = proto.xScale;//doc|ex
  proto['yScale'] = proto.yScale;//doc|ex
  proto['xGrid'] = proto.xGrid;//doc|ex
  proto['yGrid'] = proto.yGrid;//doc|ex
  proto['xMinorGrid'] = proto.xMinorGrid;//doc|ex
  proto['yMinorGrid'] = proto.yMinorGrid;//doc|ex
  proto['xAxis'] = proto.xAxis;//doc|ex
  proto['yAxis'] = proto.yAxis;//doc|ex
  proto['getSeries'] = proto.getSeries;//doc|ex
  // autoexport
  // proto['area'] = proto.area;//doc|ex
  // proto['line'] = proto.line;//doc|ex
  // proto['marker'] = proto.marker;//doc|ex
  // proto['startAngle'] = proto.startAngle;//doc|ex
  // proto['innerRadius'] = proto.innerRadius;
  proto['palette'] = proto.palette;//doc|ex
  proto['markerPalette'] = proto.markerPalette;//doc|ex
  proto['hatchFillPalette'] = proto.hatchFillPalette;
  // auto from ChartWithSeries
  // proto['defaultSeriesType'] = proto.defaultSeriesType;
  proto['addSeries'] = proto.addSeries;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['getSeriesCount'] = proto.getSeriesCount;
  proto['removeSeries'] = proto.removeSeries;
  proto['removeSeriesAt'] = proto.removeSeriesAt;
  proto['removeAllSeries'] = proto.removeAllSeries;
  proto['getPlotBounds'] = proto.getPlotBounds;
  proto['getXScales'] = proto.getXScales;
  proto['getYScales'] = proto.getYScales;
})();
//endregion
