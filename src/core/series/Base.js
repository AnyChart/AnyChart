goog.provide('anychart.core.series.Base');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.reporting');
goog.require('anychart.core.series');
goog.require('anychart.core.series.RenderingSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers.PerPoint');
goog.require('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Error');
goog.require('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.LegendContextProvider');
goog.require('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.SeriesA11y');
goog.require('anychart.core.utils.SeriesPointContextProvider');
goog.require('anychart.core.utils.TokenParser');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.scales.IXScale');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Class that represents a series for the user.
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.utils.ISeriesWithError}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.series.Base = function(chart, plot, type, config) {
  anychart.core.series.Base.base(this, 'constructor');

  /**
   * Chart reference.
   * @type {!anychart.core.IChart}
   */
  this.chart = chart;

  /**
   * Plot reference.
   * @type {!anychart.core.IPlot}
   */
  this.plot = plot;

  /**
   * Visual settings storage.
   * @type {!Object}
   * @protected
   */
  this.settings = {};

  /**
   * Auto values of settings set by external controller.
   * @type {!Object}
   */
  this.autoSettings = {};
  this.autoSettings['pointWidth'] = '90%';
  this.autoSettings['isVertical'] = this.chart.isVertical();

  /**
   * Default (theme) settings holder.
   * @type {!Object}
   */
  this.defaultSettings = {};

  /**
   * Series clip.
   * @type {boolean|anychart.math.Rect}
   * @private
   */
  this.clip_ = false;

  /**
   * Statistics map.
   * @type {Object}
   * @private
   */
  this.statistics_ = {};

  /**
   * Error paths dictionary by stroke object hash.
   * @type {Array.<!acgraph.vector.Path>}
   * @private
   */
  this.errorPaths_ = null;

  /**
   * Pool of freed paths that can be reused.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.errorPathsPool_ = null;

  /**
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * Clip element for the root layer to reduce clip instances amount.
   * @type {acgraph.vector.Clip}
   * @private
   */
  this.clipElement_ = null;

  /**
   * A comparison-zeroed value. This value should be substracted from all values series draw.
   * @type {number}
   */
  this.comparisonZero = 0;

  /**
   * @type {anychart.core.utils.SeriesA11y}
   * @private
   */
  this.a11y_ = null;

  /**
   * Renderer.
   * @type {anychart.core.series.RenderingSettings}
   * @private
   */
  this.renderingSettings_ = new anychart.core.series.RenderingSettings(this);
  this.renderingSettings_.listenSignals(this.rendererInvalidated_, this);

  this.applyConfig(config, true);
};
goog.inherits(anychart.core.series.Base, anychart.core.VisualBaseWithBounds);


/**
 * Consistency states supported by series.
 * @type {number}
 */
anychart.core.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SERIES_DATA |
    anychart.ConsistencyState.SERIES_LABELS |
    anychart.ConsistencyState.SERIES_MARKERS |
    anychart.ConsistencyState.SERIES_OUTLIERS |
    anychart.ConsistencyState.SERIES_ERROR |
    anychart.ConsistencyState.SERIES_COLOR |
    anychart.ConsistencyState.SERIES_CLIP |
    anychart.ConsistencyState.SERIES_POINTS |
    anychart.ConsistencyState.SERIES_SHAPE_MANAGER |
    anychart.ConsistencyState.A11Y;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION |
    anychart.Signal.NEED_UPDATE_LEGEND |
    anychart.Signal.NEEDS_UPDATE_A11Y;


//region --- Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.core.series.Base.DEFAULT_HATCH_FILL_TYPE = acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK;


/**
 * Series cache of resolver functions.
 * @type {Object.<string, function(anychart.core.series.Base, number):(acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill)>}
 * @private
 */
anychart.core.series.Base.colorResolversCache_ = {};


/**
 * Series cache of resolver functions.
 * @type {Object.<string, function(anychart.core.series.Base, anychart.data.IRowInfo, number):*>}
 * @private
 */
anychart.core.series.Base.settingsResolversCache_ = {};


/**
 * If the series should bind handlers to root layer.
 * @type {boolean}
 * @protected
 */
anychart.core.series.Base.prototype.canBeInteractive = true;


/**
 * Series config.
 * @type {!anychart.core.series.TypeConfig}
 */
anychart.core.series.Base.prototype.config;


/**
 * Current drawer instance.
 * @type {!anychart.core.drawers.Base}
 */
anychart.core.series.Base.prototype.drawer;


/**
 * Current series shape manager.
 * @type {!anychart.core.shapeManagers.Base}
 * @protected
 */
anychart.core.series.Base.prototype.shapeManager;


/**
 * @type {!anychart.data.IIterator}
 * @protected
 */
anychart.core.series.Base.prototype.iterator;


/**
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.series.Base.prototype.pixelBoundsCache;


/**
 * Series id.
 * @type {string}
 * @private
 */
anychart.core.series.Base.prototype.id_;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.core.series.Base.prototype.name_;


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.core.series.Base.prototype.meta_;


/**
 * Series tooltip.
 * @type {anychart.core.ui.Tooltip}
 * @private
 */
anychart.core.series.Base.prototype.tooltip_;


/**
 * Series error.
 * @type {anychart.core.utils.Error}
 * @private
 */
anychart.core.series.Base.prototype.error_;


/**
 * Series labels object.
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.series.Base.prototype.labels_;


/**
 * Series hover labels object.
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.series.Base.prototype.hoverLabels_;


/**
 * Series select labels object.
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.series.Base.prototype.selectLabels_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.markers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.hoverMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.selectMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.outlierMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.hoverOutlierMarkers_;


/**
 * @type {anychart.core.ui.MarkersFactory}
 * @private
 */
anychart.core.series.Base.prototype.selectOutlierMarkers_;


/**
 * Dictionary of outlier markers indexes by point index.
 * Need to identify what outliers belongs to point when hover/unhover it.
 * @type {Object.<number, !Array.<number>>}
 * @private
 */
anychart.core.series.Base.prototype.indexToMarkerIndexes_;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.minimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.maximumBubbleValue_ = NaN;


/**
 * Minimum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.selfMinimumBubbleValue_ = NaN;


/**
 * Maximum bubble value.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.selfMaximumBubbleValue_ = NaN;


/**
 * Calculated minimum size value. For inner use.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.minimumSizeValue_ = NaN;


/**
 * Calculated maximum size value. For inner use.
 * @type {number}
 * @private
 */
anychart.core.series.Base.prototype.maximumSizeValue_ = NaN;


//endregion
//region --- Series setup
//----------------------------------------------------------------------------------------------------------------------
//
//  Series setup
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {string}
 */
anychart.core.series.Base.prototype.getType = function() {
  return this.type_;
};


/**
 * @param {string=} opt_value
 * @return {anychart.core.series.Base|string}
 */
anychart.core.series.Base.prototype.seriesType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var info = this.chart.getConfigByType(opt_value);
    if (info && /** @type {string} */(info[0]) != this.type_) {
      this.type_ = /** @type {string} */(info[0]); // normalized type
      this.applyConfig(/** @type {anychart.core.series.TypeConfig} */(info[1]), false);
      // since we are changing entire series - we should recalculate and redraw everything
      this.invalidate(
          anychart.ConsistencyState.SERIES_POINTS |
          anychart.ConsistencyState.SERIES_CLIP |
          anychart.ConsistencyState.SERIES_DATA |
          anychart.ConsistencyState.A11Y,
          this.SUPPORTED_SIGNALS);
    }
    return this;
  }
  return this.type_;
};


/**
 * Getter/Setter for series type.
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean=} opt_default Apply default config.
 */
anychart.core.series.Base.prototype.applyConfig = function(config, opt_default) {
  if (this.config) {
    if (this.rootLayer) {
      // if prev config used own root and the next one doesn't - we should dispose the root layer
      if (!this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT) &&
          this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT, config)) {
        goog.dispose(this.rootLayer);
        this.rootLayer = null;
      }
    }
  }
  this.config = config;

  goog.dispose(this.drawer);
  this.drawer = /** @type {!anychart.core.drawers.Base} */(new anychart.core.drawers.AvailableDrawers[config.drawerType](this));

  this.recreateShapeManager();

  this.defaultSettings = this.plot.defaultSeriesSettings()[this.type_] || {};

  if (this.supportsOutliers()) {
    this.indexToMarkerIndexes_ = {};
  } else if (this.indexToMarkerIndexes_) {
    delete this.indexToMarkerIndexes_;
  }

  this.autoSettings['xPointPosition'] = 0.5;

  this.suspendSignalsDispatching();
  this.applyDefaultsToElements(this.defaultSettings, true, opt_default);
  this.resumeSignalsDispatching(false);
  // here should markers/labels/errors/outliers setup be

  this.renderingSettings_.setDefaults();
};


/**
 * Recreates shape manager.
 */
anychart.core.series.Base.prototype.recreateShapeManager = function() {
  goog.dispose(this.shapeManager);
  var smc = (this.config.shapeManagerType == anychart.enums.ShapeManagerTypes.PER_POINT) ?
      anychart.core.shapeManagers.PerPoint :
      anychart.core.shapeManagers.PerSeries;
  this.shapeManager = new smc(
      this,
      this.renderingSettings_.getShapesConfig(),
      this.check(anychart.core.series.Capabilities.ALLOW_INTERACTIVITY),
      null,
      this.config.postProcessor);
};


/**
 * @param {Object} defaults
 * @param {boolean=} opt_resetLegendItem Temporary flag.
 * @param {boolean=} opt_default
 */
anychart.core.series.Base.prototype.applyDefaultsToElements = function(defaults, opt_resetLegendItem, opt_default) {
  if (this.supportsLabels()) {
    this.labels().setup(defaults['labels']);
    this.hoverLabels().setup(defaults['hoverLabels']);
    this.selectLabels().setup(defaults['selectLabels']);
  }

  if (this.supportsMarkers()) {
    this.markers().setup(defaults['markers']);
    this.hoverMarkers().setup(defaults['hoverMarkers']);
    this.selectMarkers().setup(defaults['selectMarkers']);
  }

  if (this.supportsOutliers()) {
    this.outlierMarkers().setup(defaults['outlierMarkers']);
    this.hoverOutlierMarkers().setup(defaults['hoverOutlierMarkers']);
    this.selectOutlierMarkers().setup(defaults['selectOutlierMarkers']);
  }

  if (this.supportsError())
    this.error().setup(defaults['error']);

  if (opt_resetLegendItem)
    this.legendItem().reset();
  this.legendItem().setup(defaults['legendItem']);

  if ('tooltip' in defaults)
    this.tooltip().setupByVal(defaults['tooltip'], opt_default);

  if (!!opt_default) {
    this.clip(defaults['clip']);
    this.zIndex(defaults['zIndex']);
  }

  this.a11y(defaults['a11y'] || this.plot.defaultSeriesSettings()['a11y']);
};


/**
 * Returns animation type.
 * @return {string}
 */
anychart.core.series.Base.prototype.getAnimationType = function() {
  return this.type_;
};


/**
 * Renderer settings invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.series.Base.prototype.rendererInvalidated_ = function(e) {
  var state = anychart.ConsistencyState.SERIES_POINTS;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (e.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    state |= anychart.ConsistencyState.SERIES_SHAPE_MANAGER;
  this.invalidate(state, signal);
};


//endregion
//region --- Index/Id/Name/SeriesMeta
//----------------------------------------------------------------------------------------------------------------------
//
//  Index/Id/Name
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns series index in chart.
 * @return {number}
 */
anychart.core.series.Base.prototype.getIndex = function() {
  if (this.isDisposed())
    return -1;
  return goog.array.indexOf(this.plot.getAllSeries(), this);
};


/**
 * Getter/setter for series global index, used in palettes and autoId.
 * @param {number=} opt_value Id of the series.
 * @return {number|anychart.core.series.Base} Id or self for chaining.
 */
anychart.core.series.Base.prototype.autoIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.autoIndex_ = opt_value;
    return this;
  }
  return this.autoIndex_;
};


/**
 * Getter/setter for series id.
 * @param {(string)=} opt_value Id of the series.
 * @return {string|anychart.core.series.Base} Id or self for chaining.
 */
anychart.core.series.Base.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.id_ != opt_value) {
      this.id_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.id_ || String(this.autoIndex_);
};


/**
 * Sets and gets series name.
 * @param {string=} opt_value
 * @return {anychart.core.series.Base|string}
 */
anychart.core.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.name_ || ('Series ' + this.getIndex());
};


/**
 * Sets/gets series meta data.
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for method chaining.
 */
anychart.core.series.Base.prototype.meta = function(opt_object_or_key, opt_value) {
  if (!this.meta_) this.meta_ = {};

  if (goog.isDef(opt_object_or_key)) {
    if (goog.isDef(opt_value)) {
      var value = this.meta_[opt_object_or_key];
      if (!goog.isDef(value) || value != opt_value) {
        this.meta_[opt_object_or_key] = opt_value;
        //TODO: send signal to redraw components that depend on meta (legend)
      }
      return this;
    } else {
      if (goog.isObject(opt_object_or_key)) {
        if (this.meta_ != opt_object_or_key) {
          this.meta_ = opt_object_or_key;
          //TODO: send signal to redraw components that depend on meta (legend)
        }
        return this;
      } else {
        return this.meta_[opt_object_or_key];
      }
    }
  } else {
    return this.meta_;
  }
};


//endregion
//region --- Support testers
//----------------------------------------------------------------------------------------------------------------------
//
//  Support testers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Checks if series supports passed capability.
 * @param {anychart.core.series.Capabilities|anychart.core.drawers.Capabilities|number} capability
 * @param {anychart.core.series.TypeConfig=} opt_config
 * @param {anychart.core.drawers.Base=} opt_drawer
 * @return {boolean}
 */
anychart.core.series.Base.prototype.check = function(capability, opt_config, opt_drawer) {
  var config = opt_config || this.config;
  var drawer = opt_drawer || this.drawer;
  return !!(capability & config.capabilities | capability & drawer.flags);
};


/**
 * Checks if the series supports interactiviy.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsInteractivity = function() {
  return this.check(anychart.core.series.Capabilities.ALLOW_INTERACTIVITY);
};


/**
 * Checks if the series supports overriding settings by points.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsPointSettings = function() {
  return this.check(anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS);
};


/**
 * Whether series can be stacked.
 * @return {boolean} .
 */
anychart.core.series.Base.prototype.supportsStack = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_STACK);
};


/**
 * Whether series can be drawn in comparison mode.
 * @return {boolean} .
 */
anychart.core.series.Base.prototype.supportsComparison = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON);
};


/**
 * Tester if the series can have an error. (All except range series, OHLC, Bubble).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsError = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_ERROR) &&
      this.check(anychart.core.series.Capabilities.ALLOW_ERROR);
};


/**
 * Tester if the series has outlierMarkers() method.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsOutliers = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS);
};


/**
 * Tester if the series has markers() method.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsMarkers = function() {
  return this.check(anychart.core.series.Capabilities.SUPPORTS_MARKERS);
};


/**
 * Tester if the series has labels() method.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.supportsLabels = function() {
  return this.check(anychart.core.series.Capabilities.SUPPORTS_LABELS);
};


/**
 * Tester if the series is size based (bubble).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isSizeBased = function() {
  return this.check(anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE);
};


/**
 * Tester if the series is width based (column, rangeColumn).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isWidthBased = function() {
  return !!this.renderingSettings_.getOption('needsWidth');
};


/**
 * Tester if the series needs zero.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.needsZero = function() {
  return !!this.renderingSettings_.getOption('needsZero');
};


/**
 * Tester if the series should be distributed by width.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isWidthDistributed = function() {
  return this.check(anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION);
};


/**
 * Tester if the series is discrete based.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isDiscreteBased = function() {
  return this.check(anychart.core.drawers.Capabilities.IS_DISCRETE_BASED);
};


/**
 * Tester if the series is area based (area, area3d).
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isLineBased = function() {
  return this.check(anychart.core.drawers.Capabilities.IS_LINE_BASED);
};


/**
 * Tester if it is a series.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isSeries = function() {
  return true;
};


/**
 * Tester if it is a chart.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isChart = function() {
  return false;
};


/**
 * If the series has its own root layer.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.hasOwnLayer = function() {
  return !this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT);
};


//endregion
//region --- Infrastructure
//----------------------------------------------------------------------------------------------------------------------
//
//  Infrastructure
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get point width in case of width-based series.
 * @return {number} Point width.
 */
anychart.core.series.Base.prototype.getPixelPointWidth = function() {
  if (this.isWidthBased())
    return anychart.utils.normalizeSize(/** @type {(number|string)} */(this.getOption('pointWidth')),
        this.getCategoryWidth());
  else
    return 0;
};


/**
 * Returns default series hatch fill.
 * @return {acgraph.vector.HatchFill}
 */
anychart.core.series.Base.prototype.getAutoHatchFill = function() {
  return this.autoHatchFill || acgraph.vector.normalizeHatchFill(anychart.core.series.Base.DEFAULT_HATCH_FILL_TYPE);
};


/**
 * @return {!anychart.core.I3DProvider}
 */
anychart.core.series.Base.prototype.get3DProvider = function() {
  return /** @type {!anychart.core.I3DProvider} */(this.chart);
};


/** @inheritDoc */
anychart.core.series.Base.prototype.getEnableChangeSignals = function() {
  return this.SUPPORTED_SIGNALS;
};


/**
 * Sets automatic bar width to the series.
 * @param {number} value
 */
anychart.core.series.Base.prototype.setAutoPointWidth = function(value) {
  this.autoSettings['pointWidth'] = String(value * 100) + '%';
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.core.series.Base.prototype.setAutoColor = function(value) {
  this.autoSettings['color'] = value;
  this.labels().setAutoColor(this.getLabelsColor());
  this.markers().setAutoFill(this.getMarkerFill());
  this.markers().setAutoStroke(this.getMarkerStroke());
  this.outlierMarkers().setAutoFill(this.getOutliersFill());
  this.outlierMarkers().setAutoStroke(this.getOutliersStroke());
};


/**
 * Works for autopositioning by a plot, if external value is set - it is not overwritten.
 * @param {number} position .
 */
anychart.core.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoSettings['xPointPosition'] = position;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.enums.MarkerType} value Auto marker type distributed by the chart.
 */
anychart.core.series.Base.prototype.setAutoMarkerType = function(value) {
  this.autoSettings['type'] = value;
  this.markers().setAutoType(value);
  if (this.check(anychart.core.drawers.Capabilities.IS_MARKER_BASED))
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS);
};


/**
 * @param {number} min .
 * @param {number} max .
 * @param {number|string} minSize
 * @param {number|string} maxSize
 */
anychart.core.series.Base.prototype.setAutoSizeScale = function(min, max, minSize, maxSize) {
  this.minimumBubbleValue_ = min;
  this.maximumBubbleValue_ = max;
  this.minimumSizeSetting_ = minSize;
  this.maximumSizeSetting_ = maxSize;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} value Auto hatch fill type distributed by the chart.
 */
anychart.core.series.Base.prototype.setAutoHatchFill = function(value) {
  // auto hatch fill doesn't use autoSettings, because it should not be a default for hatchFill() value
  this.autoHatchFill = /** @type {acgraph.vector.HatchFill} */(acgraph.vector.normalizeHatchFill(value));
};


/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.Base|anychart.core.utils.Padding)} .
 */
anychart.core.series.Base.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


/**
 * Get whisker width in px.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} pointState Point state.
 * @return {number} Whisker width pixel value.
 */
anychart.core.series.Base.prototype.getWhiskerWidth = function(point, pointState) {
  var name;
  if (!!(pointState & anychart.PointState.SELECT)) {
    name = 'selectWhiskerWidth';
  } else if (!!(pointState & anychart.PointState.HOVER)) {
    name = 'hoverWhiskerWidth';
  }
  var result;
  if (name) {
    if (this.supportsPointSettings())
      result = point.get(name);
    if (!goog.isDef(result))
      result = this.getOption(name);
  }

  if (!goog.isDef(result)) {
    if (this.supportsPointSettings())
      result = point.get('whiskerWidth');
    if (!goog.isDef(result))
      result = this.getOption('whiskerWidth');
  }

  return anychart.utils.normalizeSize(/** @type {(number|string)} */(result), this.pointWidthCache);
};


/**
 * Returns category width in pixels according to current X scale settings.
 * @return {number} Category width in pixels.
 * @protected
 */
anychart.core.series.Base.prototype.getCategoryWidth = goog.abstractMethod;


/**
 * Calculates size scale for the series if needed and compares with minMax members.
 * @param {Array.<number>} minMax Array of two values: [min, max].
 */
anychart.core.series.Base.prototype.calculateSizeScale = function(minMax) {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.selfMinimumBubbleValue_ = Number.POSITIVE_INFINITY;
    this.selfMaximumBubbleValue_ = Number.NEGATIVE_INFINITY;

    var iter = this.getDetachedIterator();
    while (iter.advance()) {
      var size = Number(iter.get('size'));
      if (!isNaN(size) && (size >= 0 || this.getOption('displayNegative'))) {
        size = Math.abs(size);
        if (size > this.selfMaximumBubbleValue_)
          this.selfMaximumBubbleValue_ = size;
        if (size < this.selfMinimumBubbleValue_)
          this.selfMinimumBubbleValue_ = size;
      }
    }
  }
  minMax[0] = Math.min(minMax[0], this.selfMinimumBubbleValue_);
  minMax[1] = Math.max(minMax[1], this.selfMaximumBubbleValue_);
};


/**
 * Calculates bubble pixel size.
 * @param {number} size Size value from data.
 * @return {number|undefined} Pixel size of bubble.
 * @protected
 */
anychart.core.series.Base.prototype.calculateSize = function(size) {
  var negative = size < 0;
  size = Math.abs(size);
  var ratio = (size - this.minimumBubbleValue_) / (this.maximumBubbleValue_ - this.minimumBubbleValue_);
  if (isNaN(ratio) || !isFinite(ratio))
    ratio = 0.5;
  size = (this.minimumSizeValue_ + ratio * (this.maximumSizeValue_ - this.minimumSizeValue_));
  return (negative ? -size : size);
};


/**
 * @return {string}
 */
anychart.core.series.Base.prototype.getScalesPairIdentifier = function() {
  return goog.getUid(this.getXScale()) + '_' + goog.getUid(this.yScale());
};


/**
 * Returns Y names that the series currently uses.
 * @return {Array.<string>}
 */
anychart.core.series.Base.prototype.getYValueNames = function() {
  return (/** @type {?Array.<string>} */(this.renderingSettings_.getOption('yValues')));
};


/**
 * Returns series root layer (used in animations).
 * @return {acgraph.vector.ILayer}
 */
anychart.core.series.Base.prototype.getRootLayer = function() {
  return this.rootLayer;
};


/**
 * Returns separate chart. LEGACY.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.series.Base.prototype.getChart = function() {
  return /** @type {anychart.core.SeparateChart} */(this.chart);
};


//endregion
//region --- Working with data
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns NEW DETACHED data iterator. Advancing this iterator doesn't influence series iterator.
 * @return {!anychart.data.IIterator}
 */
anychart.core.series.Base.prototype.getDetachedIterator = goog.abstractMethod;


/**
 * Returns ATTACHED data iterator. Advancing this iterator also advances series iterator.
 * @return {!anychart.data.IIterator}
 */
anychart.core.series.Base.prototype.getIterator = function() {
  return this.iterator || this.getResetIterator();
};


/**
 * Returns reset ATTACHED data iterator. Advancing this iterator also advances series iterator.
 * @return {!anychart.data.IIterator}
 */
anychart.core.series.Base.prototype.getResetIterator = function() {
  return this.iterator = this.getDetachedIterator();
};


//endregion
//region --- Working with scales
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with scales
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {anychart.scales.IXScale}
 */
anychart.core.series.Base.prototype.getXScale = function() {
  return /** @type {anychart.scales.IXScale} */(this.chart.xScale());
};


/**
 * Getter/setter for yScale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|anychart.core.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.core.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!(opt_value instanceof anychart.scales.Base))
      opt_value = null;
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlistenSignals(this.scaleInvalidated, this);
      this.yScale_ = opt_value;
      if (this.yScale_)
        this.yScale_.listenSignals(this.scaleInvalidated, this);
      this.invalidate(anychart.ConsistencyState.SERIES_POINTS,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_ || this.plot.yScale();
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.series.Base.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS, signal);
  } else {
    this.dispatchSignal(signal);
  }
};


//endregion
//region --- Different public methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Different public methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Transforms x to pix coords.
 * @param {*} value
 * @param {number=} opt_subRangeRatio
 * @return {number} Pix value.
 */
anychart.core.series.Base.prototype.transformX = function(value, opt_subRangeRatio) {
  return this.applyRatioToBounds(this.getXScale().transform(value, opt_subRangeRatio), true);
};


/**
 * Transforms y to pix coords.
 * @param {*} value
 * @param {number=} opt_subRangeRatio
 * @return {number} Pix value.
 */
anychart.core.series.Base.prototype.transformY = function(value, opt_subRangeRatio) {
  return this.applyRatioToBounds(
      (/** @type {anychart.scales.Base} */(this.yScale())).transform(value, opt_subRangeRatio),
      false);
};


/**
 * Series rendering settings getter/setter.
 * @param {(Object|Function|string)=} opt_value
 * @return {anychart.core.series.Base|anychart.core.series.RenderingSettings}
 */
anychart.core.series.Base.prototype.rendering = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.renderingSettings_.setup(opt_value);
    return this;
  }
  return this.renderingSettings_;
};


//endregion
//region --- Errors
//----------------------------------------------------------------------------------------------------------------------
//
//  Errors
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/Setter for an error for series.
 * @param {(Object|null|boolean|string)=} opt_value Error.
 * @return {(anychart.core.utils.Error|anychart.core.series.Base)} Series error or self for chaining.
 */
anychart.core.series.Base.prototype.error = function(opt_value) {
  if (!this.supportsError())
    anychart.core.reporting.warning(anychart.enums.WarningCode.SERIES_DOESNT_SUPPORT_ERROR, undefined, [this.seriesType()]);
  if (!this.error_) {
    this.error_ = new anychart.core.utils.Error(this);
    this.error_.listenSignals(this.onErrorSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.error_.setup(opt_value);
    return this;
  }

  return this.error_;
};


/**
 * Listener for error invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.onErrorSignal_ = function(event) {
  var state = anychart.ConsistencyState.SERIES_POINTS;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  }
  this.invalidate(state, signal);
};


/**
 * Removes all error paths and clears hashes.
 */
anychart.core.series.Base.prototype.resetErrorPaths = function() {
  if (!this.errorPathsPool_)
    this.errorPathsPool_ = [];
  if (this.errorPaths_) {
    while (this.errorPaths_.length) {
      var path = this.errorPaths_.pop();
      path.clear();
      path.parent(null);
      this.errorPathsPool_.push(path);
    }
  } else
    this.errorPaths_ = [];
};


/**
 * Returns error path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 */
anychart.core.series.Base.prototype.getErrorPath = function(stroke) {
  var index = this.getIterator().getIndex();
  var path = this.errorPathsPool_.length ?
      /** @type {!acgraph.vector.Path} */(this.errorPathsPool_.pop()) :
      /** @type {!acgraph.vector.Path} */ (acgraph.path().zIndex(anychart.core.shapeManagers.ERROR_SHAPES_ZINDEX));

  this.rootLayer.addChild(path);
  this.shapeManager.setupInteractivity(path, this.supportsInteractivity(), index);
  path.stroke(stroke);
  path.fill(null);
  this.errorPaths_.push(path);
  return path;
};


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number, number>} Array of lower and upper errors value.
 */
anychart.core.series.Base.prototype.getErrorValues = function(horizontal) {
  return this.error().getErrorValues(horizontal);
};


/**
 * Returns proper error stroke in current point.
 * @param {boolean} horizontal
 * @return {acgraph.vector.Stroke}
 */
anychart.core.series.Base.prototype.getErrorStroke = function(horizontal) {
  var color = /** @type {acgraph.vector.Stroke|Function} */(horizontal ? this.error().xErrorStroke() : this.error().valueErrorStroke());
  var context;
  if (goog.isFunction(color)) {
    context = this.getColorResolutionContext();
    color = acgraph.vector.normalizeStroke(color.call(context, context));
  }
  var pointColor;
  if (this.supportsPointSettings()) {
    pointColor = this.getPointOption(horizontal ? 'xErrorStroke' : 'valueErrorStroke');
    if (goog.isFunction(pointColor)) {
      context = this.getColorResolutionContext(/** @type {acgraph.vector.Stroke|undefined} */(color));
      pointColor = acgraph.vector.normalizeStroke(pointColor.call(context, context));
    } else if (pointColor) {
      pointColor = acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(pointColor));
    }
  }
  return /** @type {acgraph.vector.Stroke} */(pointColor || color);
};


/**
 * Draws an error.
 * @param {anychart.data.IRowInfo} point
 */
anychart.core.series.Base.prototype.drawError = function(point) {
  if (!point.meta('missing') && this.error().hasAnyErrorValues()) {
    var error = this.error();
    var errorMode = error.mode();
    var isVertical = /** @type {boolean} */(this.getOption('isVertical'));

    switch (errorMode) {
      case anychart.enums.ErrorMode.NONE:
        break;
      case anychart.enums.ErrorMode.X:
        error.draw(true, isVertical);
        break;
      case anychart.enums.ErrorMode.VALUE:
        error.draw(false, isVertical);
        break;
      case anychart.enums.ErrorMode.BOTH:
        error.draw(true, isVertical);
        error.draw(false, isVertical);
        break;
    }
  }
};


//endregion
//region --- Working with clip
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with clip
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Clipping settings
 * @param {(boolean|anychart.math.Rect)=} opt_value [False, if series is created manually.<br/>True, if created via chart
 *    Enable/disable series clip.
 * @return {anychart.core.series.Base|boolean|anychart.math.Rect} .
 */
anychart.core.series.Base.prototype.clip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) opt_value = false;
    if (this.clip_ != opt_value) {
      this.clip_ = opt_value;
      this.invalidate(anychart.ConsistencyState.SERIES_CLIP, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.clip_;
  }
};


//endregion
//region --- Working with legend
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with legend
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets/Gets legend item setting for series.
 * @param {(Object)=} opt_value Legend item settings object.
 * @return {(anychart.core.utils.LegendItemSettings|anychart.core.series.Base)} Legend item settings or self for chaining.
 */
anychart.core.series.Base.prototype.legendItem = function(opt_value) {
  if (!this.legendItem_) {
    this.legendItem_ = new anychart.core.utils.LegendItemSettings();
    this.legendItem_.listenSignals(this.onLegendItemSignal, this);
  }
  if (goog.isDef(opt_value)) {
    this.legendItem_.setup(opt_value);
    return this;
  }

  return this.legendItem_;
};


/**
 * Listener for legend item settings invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @protected
 */
anychart.core.series.Base.prototype.onLegendItemSignal = function(event) {
  var signal = anychart.Signal.NEED_UPDATE_LEGEND;
  var force = false;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
    force = true;
  }
  this.dispatchSignal(signal, force);
};


/**
 * Creates legend item data.
 * @param {Function|string} itemsTextFormatter Items text formatter.
 * @return {!anychart.core.ui.Legend.LegendItemProvider} Color for legend item.
 */
anychart.core.series.Base.prototype.getLegendItemData = function(itemsTextFormatter) {
  var legendItem = this.legendItem();
  legendItem.markAllConsistent();

  var json = legendItem.getJSON();
  var baseColor = this.getOption('color');
  var context = this.createLegendContextProvider();

  var formatter = json['text'] || itemsTextFormatter;
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getTextFormatter(formatter);
  json['text'] = goog.isFunction(formatter) ?
      formatter.call(context, context) :
      this.getLegendItemText(context);

  json['disabled'] = 'disabled' in json ? !!json['disabled'] : !this.enabled();
  json['meta'] = /** @type {Object} */ (this.meta());
  if (json['iconType'] == anychart.enums.LegendItemIconType.MARKER && !this.check(anychart.core.drawers.Capabilities.IS_MARKER_BASED)) {
    json['iconFill'] = this.markers_.fill();
    json['iconStroke'] = this.markers_.stroke();
  }
  json['iconType'] = this.getLegendIconType(json['iconType'], context);
  json['iconEnabled'] = 'iconEnabled' in json ? !!json['iconEnabled'] : true;
  json['iconStroke'] = this.getLegendIconColor(
      json['iconStroke'],
      anychart.enums.ColorType.STROKE,
      baseColor,
      context);
  json['iconFill'] = this.getLegendIconColor(
      json['iconFill'],
      anychart.enums.ColorType.FILL,
      baseColor,
      context);
  json['iconHatchFill'] = this.getLegendIconColor(
      json['iconHatchFill'],
      anychart.enums.ColorType.HATCH_FILL,
      this.getAutoHatchFill(),
      context);

  if (this.supportsMarkers() && this.markers().enabled()) {
    json['iconMarkerType'] = json['iconMarkerType'] || this.markers_.type();
    json['iconMarkerFill'] = json['iconMarkerFill'] || this.markers_.fill();
    json['iconMarkerStroke'] = json['iconMarkerStroke'] || this.markers_.stroke();
  } else {
    json['iconMarkerType'] = null;
    json['iconMarkerFill'] = null;
    json['iconMarkerStroke'] = null;
  }
  return /** @type {anychart.core.ui.Legend.LegendItemProvider} */(json);
};


/**
 * Gets legend icon type for the series.
 * @param {*} type
 * @param {Object} context
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number))}
 */
anychart.core.series.Base.prototype.getLegendIconType = function(type, context) {
  if (type == anychart.enums.LegendItemIconType.MARKER) {
    if (this.check(anychart.core.drawers.Capabilities.IS_MARKER_BASED)) {
      type = this.getOption('type');
    } else if (this.supportsMarkers()) {
      type = this.markers().type();
    } else {
      type = anychart.enums.LegendItemIconType.SQUARE;
    }
    if (type == anychart.enums.LegendItemIconType.LINE)
      type = anychart.enums.LegendItemIconType.V_LINE;
  } else if (!goog.isFunction(type)) {
    type = anychart.enums.normalizeLegendItemIconType(type);
  }
  return /** @type {anychart.enums.LegendItemIconType} */ (type);
};


/**
 * Returns default legendItem color.
 * @param {*} legendItemJson
 * @param {anychart.enums.ColorType} colorType
 * @param {*} baseColor
 * @param {Object} context
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 */
anychart.core.series.Base.prototype.getLegendIconColor = function(legendItemJson, colorType, baseColor, context) {
  if (legendItemJson) {
    if (goog.isFunction(legendItemJson)) {
      var ctx = {
        'sourceColor': baseColor
      };
      legendItemJson = legendItemJson.call(ctx, ctx);
    } else {
      legendItemJson = anychart.color.serialize(
          /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(legendItemJson));
    }
  } else {
    var name;
    if (colorType == anychart.enums.ColorType.STROKE) {
      name = 'stroke';
    } else if (colorType == anychart.enums.ColorType.HATCH_FILL) {
      if (this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL))
        return null;
      name = 'hatchFill';
    } else {
      if (this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL)) {
        name = 'stroke';
        colorType = anychart.enums.ColorType.STROKE;
      } else {
        name = 'fill';
      }
    }
    var resolver = anychart.core.series.Base.getColorResolver([name], colorType);
    legendItemJson = resolver(this, anychart.PointState.NORMAL, true);
  }
  return legendItemJson;
};


/**
 * Returns default legend item text.
 * @param {Object} context
 * @return {string}
 */
anychart.core.series.Base.prototype.getLegendItemText = function(context) {
  return /** @type {string} */(this.name());
};


//endregion
//region --- Working with tooltip
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with tooltip
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter and setter for the tooltip.
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.series.Base|anychart.core.ui.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    if (this.chart.supportsTooltip()) {
      var chart = /** @type {anychart.core.Chart} */ (this.chart);
      var parent = /** @type {anychart.core.ui.Tooltip} */ (chart.tooltip());
      this.tooltip_.parent(parent);
      this.tooltip_.chart(chart);
    }
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


//endregion
//region --- Color resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Color resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns a color resolver for passed color names and type.
 * @param {?Array.<string>} colorNames
 * @param {anychart.enums.ColorType} colorType
 * @return {function(anychart.core.series.Base, number, boolean=):acgraph.vector.AnyColor}
 */
anychart.core.series.Base.getColorResolver = function(colorNames, colorType) {
  if (!colorNames) return anychart.core.series.Base.getNullColor_;
  var hash = colorType + '|' + colorNames.join('|');
  var result = anychart.core.series.Base.colorResolversCache_[hash];
  if (!result) {
    /** @type {!Function} */
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.core.series.Base.colorResolversCache_[hash] = result = goog.partial(anychart.core.series.Base.getColor_,
        colorNames, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL);
  }
  return result;
};


/**
 * Returns final color or hatch fill for passed params.
 * @param {Array.<string>} colorNames
 * @param {!Function} normalizer
 * @param {boolean} isHatchFill
 * @param {anychart.core.series.Base} series
 * @param {number} state
 * @param {boolean=} opt_ignorePointSettings
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 * @private
 */
anychart.core.series.Base.getColor_ = function(colorNames, normalizer, isHatchFill, series, state, opt_ignorePointSettings) {
  var stateColor, context;
  state = anychart.core.utils.InteractivityState.clarifyState(state);
  if (state != anychart.PointState.NORMAL && colorNames.length > 1) {
    stateColor = opt_ignorePointSettings ?
        series.getOption(colorNames[state]) :
        series.resolveOption(colorNames[state], series.getIterator(), normalizer);
    if (isHatchFill && stateColor === true)
      stateColor = normalizer(series.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) { // hatch fills set as function some why cannot nest by initial implementation
        context = series.getHatchFillResolutionContext(opt_ignorePointSettings);
        return /** @type {acgraph.vector.PatternFill} */(normalizer(stateColor.call(context, context)));
      }
    }
  }
  // we can get here only if state color is undefined or is a function
  var color = opt_ignorePointSettings ?
      series.getOption(colorNames[0]) :
      series.resolveOption(colorNames[0], series.getIterator(), normalizer);
  if (isHatchFill && color === true)
    color = normalizer(series.getAutoHatchFill());
  if (goog.isFunction(color)) {
    context = isHatchFill ?
        series.getHatchFillResolutionContext(opt_ignorePointSettings) :
        series.getColorResolutionContext(void 0, opt_ignorePointSettings);
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(normalizer(color.call(context, context)));
  }
  if (stateColor) { // it is a function and not a hatch fill here
    context = series.getColorResolutionContext(/** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(color), opt_ignorePointSettings);
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


/**
 * Returns normalized null stroke or fill.
 * @return {string}
 * @private
 */
anychart.core.series.Base.getNullColor_ = function() {
  return 'none';
};


/**
 * Returns color resolution context.
 * This context is used to resolve a fill or stroke set as a function for current point.
 * @param {(acgraph.vector.Fill|acgraph.vector.Stroke)=} opt_baseColor
 * @param {boolean=} opt_ignorePointSettings Whether should take detached iterator.
 * @return {Object}
 */
anychart.core.series.Base.prototype.getColorResolutionContext = goog.abstractMethod;


/**
 * Returns hatch fill resolution context.
 * This context is used to resolve a hatch fill set as a function for current point.
 * @param {boolean=} opt_ignorePointSettings Whether should take detached iterator.
 * @return {Object}
 */
anychart.core.series.Base.prototype.getHatchFillResolutionContext = goog.abstractMethod;


//endregion
//region --- Settings resolution
//----------------------------------------------------------------------------------------------------------------------
//
//  Settings resolution
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns settings resolver function.
 * @param {?Array.<string>} names Array of [normal, hover=, selected=] settings names.
 * @param {Function} normalizer Normalizer function. Will be called only if the settings piece has come from the point.
 * @param {Array.<string>=} opt_seriesNames Array of [normal, hover=, selected=] settings names.
 * @return {function(anychart.core.series.Base, anychart.data.IRowInfo, number):*}
 */
anychart.core.series.Base.getSettingsResolver = function(names, normalizer, opt_seriesNames) {
  if (!names) return anychart.core.series.Base.getUndefined_;
  var hash = goog.getUid(normalizer) + '|' + names.join('|') + (opt_seriesNames ? '|' + opt_seriesNames.join('|') : '');
  opt_seriesNames = opt_seriesNames || names;
  var result = anychart.core.series.Base.settingsResolversCache_[hash];
  if (!result) {
    anychart.core.series.Base.settingsResolversCache_[hash] = result = function(series, point, state) {
      state = anychart.core.utils.InteractivityState.clarifyState(state);
      var val;
      if (state != anychart.PointState.NORMAL && names.length > 1) {
        val = series.resolveOption(names[state], point, normalizer, opt_seriesNames[state]);
        if (goog.isDef(val))
          return val;
      }
      return series.resolveOption(names[0], point, normalizer, opt_seriesNames[0]);
    };
  }
  return result;
};


/**
 * Returns undefined.
 * @return {*}
 * @private
 */
anychart.core.series.Base.getUndefined_ = function() {
  return void 0;
};


/**
 * Returns an option value for the current point.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.Base.prototype.getPointOption = function(name) {
  return this.supportsPointSettings() ?
      this.getIterator().get(name) :
      undefined;
};


/**
 * Returns option value if it was set directly to the series.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.Base.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.Base.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * RReturns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.series.Base.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns an option value for the series.
 * @param {string} name
 * @return {*}
 */
anychart.core.series.Base.prototype.getOption = function(name) {
  var res = this.settings[name];
  if (!goog.isDefAndNotNull(res)) {
    res = this.defaultSettings[name];
    if (!goog.isDefAndNotNull(res)) {
      res = this.autoSettings[name];
    }
  }
  return res;
};


/**
 * Sets series option value.
 * @param {string} name
 * @param {*} value
 */
anychart.core.series.Base.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Returns proper settings due to the state if point settings are supported by the series.
 * @param {string} name
 * @param {anychart.data.IRowInfo} point
 * @param {Function} normalizer
 * @param {string=} opt_seriesName - series option name if differs from point names.
 * @return {*}
 */
anychart.core.series.Base.prototype.resolveOption = function(name, point, normalizer, opt_seriesName) {
  var val;
  if (this.supportsPointSettings())
    val = point.get(name);
  if (goog.isDef(val)) {
    val = normalizer(val);
  } else {
    name = opt_seriesName || name;
    val = this.settings[name];
    if (!goog.isDefAndNotNull(val)) {
      val = this.defaultSettings[name];
      if (!goog.isDefAndNotNull(val))
        val = this.autoSettings[name];
      if (goog.isDef(val))
        val = normalizer(val);
    }
  }
  return val;
};


//endregion
//region --- Factories optimization
//----------------------------------------------------------------------------------------------------------------------
//
//  Factories optimization
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Prepares passed factory to be displayed. Returns true, if the factory SHOULD be drawn.
 * @param {anychart.core.ui.LabelsFactory|anychart.core.ui.MarkersFactory} factory
 * @param {boolean} stateFactoriesEnabled
 * @param {boolean} hasPointSettings
 * @param {anychart.core.series.Capabilities|number} isSupported
 * @param {anychart.ConsistencyState|number} consistency
 * @return {boolean}

 */
anychart.core.series.Base.prototype.prepareFactory = function(factory, stateFactoriesEnabled, hasPointSettings, isSupported, consistency) {
  factory.suspendSignalsDispatching();
  if (this.check(isSupported) && ((factory.enabled() !== false) || stateFactoriesEnabled || hasPointSettings)) {
    factory.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    if (this.hasInvalidationState(consistency)) {
      factory.clear();
      factory.parentBounds(this.pixelBoundsCache);
      return true;
    }
  } else {
    factory.clear();
    factory.container(null);
  }
  factory.draw();
  factory.resumeSignalsDispatching(false);
  return false;
};


/**
 * Draws element(s) for point.
 * @param {Array.<function(this:anychart.core.series.Base):(anychart.core.ui.LabelsFactory|anychart.core.ui.MarkersFactory)>} factoryGetters
 * @param {Array.<string>} overrideNames
 * @param {boolean} hasPointOverrides
 * @param {boolean} isLabel
 * @param {?Array.<number>} positionYs
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} state
 * @return {anychart.core.ui.MarkersFactory.Marker|anychart.core.ui.LabelsFactory.Label|null}
 * @protected
 */
anychart.core.series.Base.prototype.drawFactoryElement = function(factoryGetters, overrideNames, hasPointOverrides, isLabel, positionYs, point, state) {
  var isDraw, positionProvider, i, indexes;
  var index = point.getIndex();
  if (positionYs) {
    indexes = this.indexToMarkerIndexes_[index];
    if (!indexes)
      indexes = this.indexToMarkerIndexes_[index] = [];
  }
  var mainFactory = factoryGetters[0].call(this);

  var pointOverride, statePointOverride, stateFactory;
  if (point.meta('missing')) {
    isDraw = false;
    pointOverride = statePointOverride = undefined;
    stateFactory = null;
  } else {
    state = anychart.core.utils.InteractivityState.clarifyState(state);

    if (this.supportsPointSettings() && hasPointOverrides) {
      pointOverride = point.get(overrideNames[0]);
      if (state != anychart.PointState.NORMAL)
        statePointOverride = point.get(overrideNames[state]);
    } else {
      pointOverride = statePointOverride = undefined;
    }

    var pointOverrideEnabled = pointOverride && goog.isDef(pointOverride['enabled']) ? pointOverride['enabled'] : null;
    var statePointOverrideEnabled = statePointOverride && goog.isDef(statePointOverride['enabled']) ? statePointOverride['enabled'] : null;

    stateFactory = (state == anychart.PointState.NORMAL) ? null : factoryGetters[state].call(this);

    isDraw = goog.isNull(statePointOverrideEnabled) ? // has no state marker or null "enabled" in it ?
        (!stateFactory || goog.isNull(stateFactory.enabled())) ? // has no state stateFactory or null "enabled" in it ?
            goog.isNull(pointOverrideEnabled) ? // has no marker in point or null "enabled" in it ?
                mainFactory.enabled() :
                pointOverrideEnabled :
            stateFactory.enabled() :
        statePointOverrideEnabled;
  }

  if (isDraw) {
    var formatProvider = isLabel ? this.createLabelsContextProvider() : null;
    if (positionYs) {
      var x = point.meta('x');
      if (/** @type {boolean} */(this.getOption('isVertical'))) {
        for (i = 0; i < positionYs.length; i++) {
          positionProvider = {'value': {'x': positionYs[i], 'y': x}};
          indexes[i] = this.drawSingleFactoryElement(mainFactory, indexes[i], positionProvider, formatProvider,
              stateFactory, pointOverride, statePointOverride).getIndex();
        }
      } else {
        for (i = 0; i < positionYs.length; i++) {
          positionProvider = {'value': {'x': x, 'y': positionYs[i]}};
          indexes[i] = this.drawSingleFactoryElement(mainFactory, indexes[i], positionProvider, formatProvider,
              stateFactory, pointOverride, statePointOverride).getIndex();
        }
      }
    } else {
      var position = (statePointOverride && statePointOverride['position']) ||
          (stateFactory && stateFactory.position()) ||
          (pointOverride && pointOverride['position']) ||
          mainFactory.position();
      positionProvider = this.createPositionProvider(/** @type {anychart.enums.Position|string} */(position), true);
      return this.drawSingleFactoryElement(mainFactory, index, positionProvider, formatProvider,
          stateFactory, pointOverride, statePointOverride, position);
    }
  } else {
    if (positionYs) {
      for (i = 0; i < indexes.length; i++) {
        mainFactory.clear(indexes[i]);
      }
    } else {
      mainFactory.clear(index);
    }
  }
  return null;
};


/**
 *
 * @param {?anychart.enums.Position} position
 * @param {boolean} positiveDirection
 * @param {boolean} isVertical
 * @return {anychart.enums.Anchor}
 */
anychart.core.series.Base.prototype.flipAnchor = function(position, positiveDirection, isVertical) {
  if (position === null) {
    if (positiveDirection) {
      if (isVertical) {
        return anychart.enums.Anchor.LEFT_CENTER;
      } else {
        return anychart.enums.Anchor.CENTER_BOTTOM;
      }
    } else {
      if (isVertical) {
        return anychart.enums.Anchor.RIGHT_CENTER;
      } else {
        return anychart.enums.Anchor.CENTER_TOP;
      }
    }
  } else {
    switch (position) {
      case anychart.enums.Position.LEFT_TOP:
        return anychart.enums.Anchor.RIGHT_BOTTOM;

      case anychart.enums.Position.LEFT_CENTER:
        return anychart.enums.Anchor.RIGHT_CENTER;

      case anychart.enums.Position.LEFT_BOTTOM:
        return anychart.enums.Anchor.RIGHT_TOP;

      case anychart.enums.Position.CENTER_TOP:
        return anychart.enums.Anchor.CENTER_BOTTOM;

      case anychart.enums.Position.CENTER:
        return anychart.enums.Anchor.CENTER;

      case anychart.enums.Position.CENTER_BOTTOM:
        return anychart.enums.Anchor.CENTER_TOP;

      case anychart.enums.Position.RIGHT_TOP:
        return anychart.enums.Anchor.LEFT_BOTTOM;

      case anychart.enums.Position.RIGHT_CENTER:
        return anychart.enums.Anchor.LEFT_CENTER;

      case anychart.enums.Position.RIGHT_BOTTOM:
        return anychart.enums.Anchor.LEFT_TOP;

      default:
        return anychart.enums.Anchor.CENTER;
    }
  }
};


/**
 * Resolves anchor in auto mode.
 * @param {?anychart.enums.Position|string} position Position.
 * @param {anychart.core.ui.LabelsFactory.Label} element Label.
 * @return {anychart.enums.Anchor}
 */
anychart.core.series.Base.prototype.resolveAutoAnchor = function(position, element) {
  var iterator = this.getIterator();

  var normalizedPosition = anychart.enums.normalizePosition(position, null);
  var valueNames = this.getYValueNames();
  var value = /** @type {string} */ (normalizedPosition == null ? position : valueNames[valueNames.length - 1]);

  var isVertical = /** @type {boolean} */ (this.getOption('isVertical'));
  var positiveDirection = (/** @type {number} */ (iterator.get(value)) || 0) >= 0;
  var flippedAnchor = this.flipAnchor(normalizedPosition, positiveDirection, isVertical);
  element.autoAnchor(flippedAnchor);
  element.autoVertical(isVertical);
  return flippedAnchor;
};


/**
 * Draws one factory element.
 * @param {anychart.core.ui.MarkersFactory|anychart.core.ui.LabelsFactory} factory
 * @param {number|undefined} index
 * @param {*} positionProvider
 * @param {*} formatProvider
 * @param {anychart.core.ui.MarkersFactory|anychart.core.ui.LabelsFactory|null} stateFactory
 * @param {*} pointOverride
 * @param {*} statePointOverride
 * @param {(?anychart.enums.Position|string)=} opt_position Position which is needed to calculate label auto anchor.
 * @return {anychart.core.ui.MarkersFactory.Marker|anychart.core.ui.LabelsFactory.Label}
 * @protected
 */
anychart.core.series.Base.prototype.drawSingleFactoryElement = function(factory, index, positionProvider, formatProvider, stateFactory, pointOverride, statePointOverride, opt_position) {
  var element = formatProvider ? factory.getLabel(/** @type {number} */(index)) : factory.getMarker(/** @type {number} */(index));
  if (element) {
    if (formatProvider)
      element.formatProvider(formatProvider);
    element.positionProvider(positionProvider);
  } else {
    if (formatProvider)
      element = factory.add(formatProvider, positionProvider, index);
    else
      element = factory.add(positionProvider, index);
  }
  element.resetSettings();
  if (goog.isDef(opt_position) && formatProvider) {
    this.resolveAutoAnchor(opt_position, element);
  }
  if (formatProvider)
    element.currentLabelsFactory(stateFactory || factory);
  else
    element.currentMarkersFactory(stateFactory || factory);
  element.setSettings(/** @type {Object} */(pointOverride), /** @type {Object} */(statePointOverride));
  element.draw();
  return element;
};


//endregion
//region --- Labels
//----------------------------------------------------------------------------------------------------------------------
//
//  Labels
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for current series data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.setParentEventTarget(this);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Gets or sets series select data labels.
 * @param {(Object|boolean|null)=} opt_value Series data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.series.Base)} Labels instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.selectLabels = function(opt_value) {
  if (!this.selectLabels_) {
    this.selectLabels_ = new anychart.core.ui.LabelsFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectLabels_.setup(opt_value);
    return this;
  }
  return this.selectLabels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Draws label for a point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} pointState Point state - normal, hover or select.
 * @protected
 */
anychart.core.series.Base.prototype.drawLabel = function(point, pointState) {
  if (this.check(anychart.core.series.Capabilities.SUPPORTS_LABELS))
    point.meta('label', this.drawFactoryElement(
        [this.labels, this.hoverLabels, this.selectLabels],
        ['label', 'hoverLabel', 'selectLabel'],
        this.planHasPointLabels(),
        true,
        null,
        point,
        pointState));
};


/**
 * Returns labels default font color.
 * @return {string}
 */
anychart.core.series.Base.prototype.getLabelsColor = function() {
  var color;
  if (anychart.DEFAULT_THEME != 'v6') {
    color = anychart.color.darken(/** @type {acgraph.vector.Fill} */(this.getOption('color')));
    if (goog.isObject(color)) {
      color = /** @type {string|undefined} */(color['color']);
    }
  }
  return /** @type {string} */(color || '');
};


//endregion
//region --- Markers
//----------------------------------------------------------------------------------------------------------------------
//
//  Markers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for markers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();
    this.markers_.setParentEventTarget(this);
    this.markers_.listenSignals(this.markersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter/setter for hoverMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.selectMarkers = function(opt_value) {
  if (!this.selectMarkers_) {
    this.selectMarkers_ = new anychart.core.ui.MarkersFactory();
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectMarkers_.setup(opt_value);
    return this;
  }
  return this.selectMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND);
  }
};


/**
 * Draws marker for the point.
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.series.Base.prototype.drawMarker = function(point, pointState) {
  if (this.check(anychart.core.series.Capabilities.SUPPORTS_MARKERS))
    point.meta('marker', this.drawFactoryElement(
        [this.markers, this.hoverMarkers, this.selectMarkers],
        ['marker', 'hoverMarker', 'selectMarker'],
        this.planHasPointMarkers(),
        false,
        null,
        point,
        pointState));
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Fill} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getMarkerFill = function() {
  var fillGetter = anychart.core.series.Base.getColorResolver(
      [this.check(anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL) ? 'stroke' : 'fill'],
      anychart.enums.ColorType.FILL);
  var fill = /** @type {acgraph.vector.Fill} */(fillGetter(this, anychart.PointState.NORMAL, true));
  if (anychart.DEFAULT_THEME != 'v6')
    return /** @type {acgraph.vector.Fill} */(anychart.color.setOpacity(fill, 1, true));
  else
    return fill;
};


/**
 * Return marker color for series.
 * @return {!acgraph.vector.Stroke} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getMarkerStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(/** @type {acgraph.vector.Fill} */(this.markers().fill())));
};


//endregion
//region --- Outliers
//----------------------------------------------------------------------------------------------------------------------
//
//  Outliers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for outlierMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.outlierMarkers = function(opt_value) {
  if (!this.outlierMarkers_) {
    this.outlierMarkers_ = new anychart.core.ui.MarkersFactory();
    this.outlierMarkers_.setParentEventTarget(this);
    this.outlierMarkers_.listenSignals(this.outlierMarkersInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.outlierMarkers_.setup(opt_value);
    return this;
  }
  return this.outlierMarkers_;
};


/**
 * Getter/setter for hoverOutlierMarkers.
 * @param {(Object|boolean|null|string)=} opt_value Series outliers hover markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.hoverOutlierMarkers = function(opt_value) {
  if (!this.hoverOutlierMarkers_) {
    this.hoverOutlierMarkers_ = new anychart.core.ui.MarkersFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.hoverOutlierMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverOutlierMarkers_;
};


/**
 * Getter for series outlier markers on select.
 * @param {(Object|boolean|null|string)=} opt_value Series outliers hover markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.series.Base)} Markers instance or itself for chaining call.
 */
anychart.core.series.Base.prototype.selectOutlierMarkers = function(opt_value) {
  if (!this.selectOutlierMarkers_) {
    this.selectOutlierMarkers_ = new anychart.core.ui.MarkersFactory();
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.selectOutlierMarkers_.setup(opt_value);
    return this;
  }
  return this.selectOutlierMarkers_;
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.series.Base.prototype.outlierMarkersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.SERIES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Draws outliers markers for the point.
 * @param {anychart.data.IIterator} iterator
 * @param {anychart.PointState|number} pointState Point state.
 * @protected
 */
anychart.core.series.Base.prototype.drawPointOutliers = function(iterator, pointState) {
  var outliers;
  if (this.check(anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS) &&
      (outliers = iterator.meta('outliers')) &&
      outliers.length)
    this.drawFactoryElement(
        [this.outlierMarkers, this.hoverOutlierMarkers, this.selectOutlierMarkers],
        ['outlierMarker', 'hoverOutlierMarker', 'selectOutlierMarker'],
        this.planHasPointOutliers(),
        false,
        /** @type {Array.<number>} */(outliers),
        iterator,
        pointState);
};


/**
 * Return outlier marker color for series.
 * @return {acgraph.vector.Fill} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getOutliersFill = function() {
  var fillGetter = anychart.core.series.Base.getColorResolver(['fill'], anychart.enums.ColorType.FILL);
  return /** @type {acgraph.vector.Fill} */(fillGetter(this, anychart.PointState.NORMAL, true));
};


/**
 * Return outlier marker color for series.
 * @return {acgraph.vector.Stroke} Marker color for series.
 * @protected
 */
anychart.core.series.Base.prototype.getOutliersStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(
      /** @type {acgraph.vector.Stroke} */(this.outlierMarkers().fill())));
};


/**
 * Find pointIndex by marker index.
 * @param {number} markerIndex
 * @return {number}
 * @protected
 */
anychart.core.series.Base.prototype.getPointIndexByOutlierIndex = function(markerIndex) {
  return +(goog.object.findKey(this.indexToMarkerIndexes_, function(val) {
    return goog.array.some(val, function(value) {
      return value == markerIndex;
    });
  }));
};


//endregion
//region --- Drawing plan related checkers
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing plan related checkers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Should return true if there is a point with a label defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointLabels = function() {
  return false;
};


/**
 * Should return true if there is a point with a marker defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointMarkers = function() {
  return false;
};


/**
 * Should return true if there is a point with an outlier defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointOutliers = function() {
  return false;
};


/**
 * Should return true if there is a point with an error defined in data.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planHasPointErrors = function() {
  return false;
};


/**
 * Should return true if the series is considered stacked.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planIsStacked = function() {
  return false;
};


/**
 * Should return true if the series X scale is inverted.
 * @return {boolean}
 */
anychart.core.series.Base.prototype.planIsXScaleInverted = function() {
  return false;
};


//endregion
//region --- Drawing points
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing points
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.series.Base.prototype.remove = function() {
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.shapeManager.setContainer(null);
  } else if (this.rootLayer) {
    this.rootLayer.remove();
  }

  // just a remove should be here, but the lablesFactory's remove() is very odd
  if (this.labels_ && this.labels_.getDomElement()) {
    this.labels_.getDomElement().remove();
    this.labels_.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  if (this.markers_) {
    this.markers_.remove();
    this.markers_.invalidate(anychart.ConsistencyState.CONTAINER);
  }

  if (this.outlierMarkers_) {
    this.outlierMarkers_.remove();
    this.outlierMarkers_.invalidate(anychart.ConsistencyState.CONTAINER);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Accessibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for accessibility setting.
 * @param {(boolean|Object)=} opt_enabledOrJson - Whether to enable accessibility.
 * @return {anychart.core.utils.SeriesA11y|anychart.core.series.Base} - Accessibility settings object or self for chaining.
 */
anychart.core.series.Base.prototype.a11y = function(opt_enabledOrJson) {
  if (!this.a11y_) {
    this.a11y_ = new anychart.core.utils.SeriesA11y(this);
    this.registerDisposable(this.a11y_);
    this.a11y_.listenSignals(this.onA11ySignal_, this);
    if (this.chart instanceof anychart.core.Chart) {
      this.a11y_.parentA11y(/** @type {anychart.core.utils.A11y} */ (/** @type {anychart.core.Chart} */ (this.chart).a11y()));
      this.a11y_.parentA11y().applyChangesInChildA11y();
    }
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.a11y_.setup.apply(this.a11y_, arguments);
    return this;
  } else {
    return this.a11y_;
  }
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.series.Base.prototype.onA11ySignal_ = function() {
  this.invalidate(anychart.ConsistencyState.A11Y, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Draws the series.
 * @return {anychart.core.series.Base}
 */
anychart.core.series.Base.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  anychart.performance.start('Series draw()');
  this.suspendSignalsDispatching();

  // DVF-2334 - reapplying auto colors to elements to ensure color consistency
  // maybe we will be able to remove this in future refactorings
  if (goog.isDef(this.autoSettings['color']) &&
      this.hasInvalidationState(
          anychart.ConsistencyState.SERIES_MARKERS |
          anychart.ConsistencyState.SERIES_LABELS |
          anychart.ConsistencyState.SERIES_OUTLIERS))
    this.setAutoColor(this.autoSettings['color']);

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_SHAPE_MANAGER)) {
    this.recreateShapeManager();
    this.markConsistent(anychart.ConsistencyState.SERIES_SHAPE_MANAGER);
  }

  // resolving bounds
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.pixelBoundsCache = this.getPixelBounds();
    this.boundsWithoutAxes = this.axesLinesSpace_ ?
        this.axesLinesSpace_.tightenBounds(this.pixelBoundsCache) :
        this.pixelBoundsCache;
    var size = Math.min(this.pixelBoundsCache.height, this.pixelBoundsCache.width);
    this.minimumSizeValue_ = anychart.utils.normalizeSize(this.minimumSizeSetting_, size);
    this.maximumSizeValue_ = anychart.utils.normalizeSize(this.maximumSizeSetting_, size);
    this.invalidate(anychart.ConsistencyState.SERIES_CLIP |
        anychart.ConsistencyState.SERIES_POINTS |
        anychart.ConsistencyState.SERIES_COLOR);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  // calculating pixel positions
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.prepareData();
    this.invalidate(anychart.ConsistencyState.SERIES_POINTS | anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.A11Y,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_UPDATE_A11Y);
    this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS)) {
    this.invalidate(anychart.ConsistencyState.SERIES_LABELS |
        anychart.ConsistencyState.SERIES_MARKERS |
        anychart.ConsistencyState.SERIES_ERROR |
        anychart.ConsistencyState.SERIES_OUTLIERS);
  }

  /** @type {Array.<Function>} */
  var elementsDrawers = [];
  var factoriesToFinalize = [];
  var factory, i, state, stateFactoriesEnabled;
  var COMMON_STATES = anychart.ConsistencyState.CONTAINER | anychart.ConsistencyState.SERIES_POINTS;

  // preparing to draw different series parts
  if (this.hasInvalidationState(COMMON_STATES)) {
    this.categoryWidthCache = this.getCategoryWidth();
    this.pointWidthCache = this.getPixelPointWidth();
    this.prepareRootLayer();
    // we do not mark any states consistent here - we do it later.
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_LABELS | COMMON_STATES)) {
    factory = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
    stateFactoriesEnabled = /** @type {boolean} */(this.hoverLabels().enabled() || this.selectLabels().enabled());
    if (this.prepareFactory(factory, stateFactoriesEnabled, this.planHasPointLabels(),
            anychart.core.series.Capabilities.SUPPORTS_LABELS, anychart.ConsistencyState.SERIES_LABELS)) {
      factory.setAutoZIndex(/** @type {number} */(this.zIndex() + anychart.core.shapeManagers.LABELS_ZINDEX));
      // see DVF-2259
      factory.invalidate(anychart.ConsistencyState.Z_INDEX);
      elementsDrawers.push(this.drawLabel);
      factoriesToFinalize.push(factory);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_MARKERS | COMMON_STATES)) {
    factory = /** @type {anychart.core.ui.MarkersFactory} */(this.markers());
    stateFactoriesEnabled = /** @type {boolean} */(this.hoverMarkers().enabled() || this.selectMarkers().enabled());
    if (this.prepareFactory(factory, stateFactoriesEnabled, this.planHasPointMarkers(),
            anychart.core.series.Capabilities.SUPPORTS_MARKERS, anychart.ConsistencyState.SERIES_MARKERS)) {
      factory.setAutoZIndex(/** @type {number} */(this.zIndex() + anychart.core.shapeManagers.MARKERS_ZINDEX));
      elementsDrawers.push(this.drawMarker);
      factoriesToFinalize.push(factory);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_ERROR | COMMON_STATES)) {
    this.resetErrorPaths();
    if (this.supportsError() &&
        (this.error().mode() != anychart.enums.ErrorMode.NONE) &&
        (this.planHasPointErrors() || this.error().hasGlobalErrorValues())) {
      elementsDrawers.push(this.drawError);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_ERROR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_OUTLIERS | COMMON_STATES)) {
    factory = /** @type {anychart.core.ui.MarkersFactory} */(this.outlierMarkers());
    stateFactoriesEnabled = /** @type {boolean} */(this.hoverOutlierMarkers().enabled() || this.selectOutlierMarkers().enabled());
    if (this.prepareFactory(factory, stateFactoriesEnabled, this.planHasPointOutliers(),
            anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS, anychart.ConsistencyState.SERIES_OUTLIERS)) {
      factory.setAutoZIndex(/** @type {number} */(this.zIndex() + anychart.core.shapeManagers.OUTLIERS_ZINDEX));
      elementsDrawers.push(this.drawPointOutliers);
      factoriesToFinalize.push(factory);
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_OUTLIERS);
  }

  var elementsDrawersLength = elementsDrawers.length;

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS)) {
    anychart.performance.start('Series drawing points');
    var columns = this.retrieveDataColumns();
    var iterator;
    if (columns) {
      if (this.needsZero()) {
        var scale = /** @type {anychart.scales.Base} */(this.yScale());
        this.zeroY = this.applyAxesLinesSpace(
            this.applyRatioToBounds(
                goog.math.clamp((scale && scale.transform(0, 0.5)) || 0, 0, 1),
                false));
      }
      this.startDrawing();

      iterator = this.getResetIterator();
      // currently this section is actual only for Stock, because
      // Cartesian processes preFirst point as a regular point in iterator
      var point = this.getPreFirstPoint();
      if (point) {
        this.makePointMeta(point, this.getYValueNames(), columns);
        this.drawPoint(point, this.getPointState(point.getIndex()));
      }

      // main points drawing cycle
      iterator.reset();
      while (iterator.advance()) {
        state = this.getPointState(iterator.getIndex());
        this.makePointMeta(iterator, this.getYValueNames(), columns);
        this.drawPoint(iterator, state);
        for (i = 0; i < elementsDrawersLength; i++)
          elementsDrawers[i].call(this, iterator, state);
      }

      // currently this section is actual only for Stock, because
      // Cartesian processes preFirst point as a regular point in iterator
      point = this.getPostLastPoint();
      if (point) {
        this.makePointMeta(point, this.getYValueNames(), columns);
        this.drawPoint(point, this.getPointState(point.getIndex()));
      }

      this.finalizeDrawing();
    } else {
      iterator = this.getResetIterator();
      while (iterator.advance()) {
        this.makeMissing(iterator, this.getYValueNames());
      }
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.Z_INDEX);

    if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
      this.invalidate(anychart.ConsistencyState.SERIES_CLIP);
    }
    anychart.performance.end('Series drawing points');
  } else if (elementsDrawersLength) {
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      state = this.getPointState(iterator.getIndex());
      for (i = 0; i < elementsDrawersLength; i++)
        elementsDrawers[i].call(this, iterator, state);
    }
  }

  for (i = 0; i < factoriesToFinalize.length; i++) {
    factory = factoriesToFinalize[i];
    factory.draw();
    factory.resumeSignalsDispatching(false);
  }
  // no other elements depend on CONTAINER or SERIES_POINTS
  this.markConsistent(COMMON_STATES);

  // if the series had only color settings changed, than we get here
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_COLOR)) {
    this.updateColors();
    this.markConsistent(anychart.ConsistencyState.SERIES_COLOR);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.applyZIndex();
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CLIP)) {
    this.applyClip();
    this.markConsistent(anychart.ConsistencyState.SERIES_CLIP);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.A11Y)) {
    //SeriesPointContextProvider is pretty suitable in this case.
    this.a11y().applyA11y(this.createTooltipContextProvider());
    this.markConsistent(anychart.ConsistencyState.A11Y);
  }

  this.resumeSignalsDispatching(false);

  anychart.performance.end('Series draw()');

  return this;
};


/**
 * Starts drawing.
 * @protected
 */
anychart.core.series.Base.prototype.startDrawing = function() {
  this.drawer.startDrawing(this.shapeManager);
};


/**
 * Draws point.
 * @param {anychart.data.IRowInfo} point
 * @param {number|anychart.PointState} state
 * @protected
 */
anychart.core.series.Base.prototype.drawPoint = function(point, state) {
  this.drawer.drawPoint(point, state);
};


/**
 * Finalizes drawing.
 * @protected
 */
anychart.core.series.Base.prototype.finalizeDrawing = function() {
  this.drawer.finalizeDrawing();
};


/**
 * Prepares root layer(s) and shapeManager(s) to be drawn.
 * @protected
 */
anychart.core.series.Base.prototype.prepareRootLayer = function() {
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.rootLayer = this.container();
  } else {
    if (!this.rootLayer) {
      this.rootLayer = acgraph.layer();
      if (this.canBeInteractive)
        this.bindHandlersToGraphics(this.rootLayer);
    }
    this.rootLayer.zIndex(/** @type {number} */(this.zIndex()));
    this.rootLayer.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
  }
  // we should clear shape manager before changing container, because it would cause a big overhead in that case.
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_POINTS))
    this.shapeManager.clearShapes();

  this.shapeManager.setContainer(this.rootLayer);
};


/**
 * Applies ZIndex to the series.
 */
anychart.core.series.Base.prototype.applyZIndex = function() {
  var zIndex = /** @type {number} */(this.zIndex());
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    if (this.shapeManager instanceof anychart.core.shapeManagers.PerPoint) {
      var iterator = this.getDetachedIterator();
      while (iterator.advance()) {
        var shapes = /** @type {Object.<acgraph.vector.Shape>} */(iterator.meta('shapes'));
        if (shapes)
          this.shapeManager.updateZIndex(zIndex, shapes);
      }
    } else {
      this.shapeManager.updateZIndex(zIndex);
    }
  } else {
    this.rootLayer.zIndex(zIndex);
  }
};


/**
 * Returns full clip bounds for current clip settings.
 * @return {!anychart.math.Rect}
 */
anychart.core.series.Base.prototype.calcFullClipBounds = function() {
  var clip = this.clip_;
  if (goog.isBoolean(clip)) {
    clip = this.boundsWithoutAxes;
    if (this.check(anychart.core.drawers.Capabilities.IS_3D_BASED)) {
      clip = (/** @type {anychart.math.Rect} */(clip)).clone();
      var provider = this.get3DProvider();
      var yShift = provider.getY3DFullShift();
      clip.top -= yShift;
      clip.height += yShift;
      clip.width += provider.getX3DFullShift();
    }
  }
  return /** @type {!anychart.math.Rect} */(clip);
};


/**
 * Makes proper clipping.
 * @param {anychart.math.Rect=} opt_customClip Custom temporary clip to apply.
 */
anychart.core.series.Base.prototype.applyClip = function(opt_customClip) {
  var clip = opt_customClip || this.clip_;
  if (goog.isBoolean(clip)) {
    if (clip) {
      clip = this.calcFullClipBounds();
    } else {
      clip = null;
    }
  }
  var clipElement;
  if (clip) {
    if (!this.clipElement_)
      this.clipElement_ = acgraph.clip();
    this.clipElement_.shape(clip);
    clipElement = this.clipElement_;
  } else {
    clipElement = null;
  }
  if (this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    this.shapeManager.applyClip(clipElement);
  } else {
    this.rootLayer.clip(clipElement);
  }
  if (this.labels_) {
    var labelDOM = this.labels_.getDomElement();
    if (labelDOM) labelDOM.clip(clipElement);
  }
  if (this.markers_) {
    var markerDOM = this.markers_.getDomElement();
    if (markerDOM) markerDOM.clip(clipElement);
  }
  if (this.outlierMarkers_) {
    markerDOM = this.outlierMarkers_.getDomElement();
    if (markerDOM) markerDOM.clip(clipElement);
  }
};


/**
 * Separately updates color settings on shapes.
 * @protected
 */
anychart.core.series.Base.prototype.updateColors = function() {
  if (this.shapeManager instanceof anychart.core.shapeManagers.PerPoint) {
    var iterator = this.getResetIterator();
    while (iterator.advance()) {
      this.shapeManager.updateColors(this.getPointState(iterator.getIndex()),
          /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
    }
  } else {
    this.shapeManager.updateColors(this.getSeriesState());
  }
};


//endregion
//region --- Extracting data
//----------------------------------------------------------------------------------------------------------------------
//
//  Extracting data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * This function is supposed to react on data changes.
 */
anychart.core.series.Base.prototype.prepareData = function() {
};


/**
 * Retrieves an array of column indexes matching asked column names from the current mapping.
 * @return {?Array.<(number|string)>}
 * @protected
 */
anychart.core.series.Base.prototype.retrieveDataColumns = function() {
  return this.getYValueNames();
};


/**
 * Returns point state by it's index.
 * @param {number} index
 * @return {anychart.PointState|number}
 */
anychart.core.series.Base.prototype.getPointState = function(index) {
  return anychart.PointState.NORMAL;
};


/**
 * Returns series state.
 * @return {anychart.PointState|number}
 */
anychart.core.series.Base.prototype.getSeriesState = function() {
  return anychart.PointState.NORMAL;
};


/**
 * Returns if the point is in visible subset (due to zoom).
 * @param {anychart.data.IRowInfo} point
 * @return {boolean}
 */
anychart.core.series.Base.prototype.isPointVisible = function(point) {
  return true;
};


/**
 * Should return pre-first point if it exists.
 * @return {?anychart.data.IRowInfo}
 * @protected
 */
anychart.core.series.Base.prototype.getPreFirstPoint = function() {
  return null;
};


/**
 * Should return post-last point if it exists.
 * @return {?anychart.data.IRowInfo}
 * @protected
 */
anychart.core.series.Base.prototype.getPostLastPoint = function() {
  return null;
};


//endregion
//region --- Data to Pixels transformation
//----------------------------------------------------------------------------------------------------------------------
//
//  Data to Pixels transformation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio
 * @param {boolean} xDirection
 * @return {number}
 * @protected
 */
anychart.core.series.Base.prototype.applyRatioToBounds = function(ratio, xDirection) {
  var min, range;
  if (!!(xDirection ^ /** @type {boolean} */(this.getOption('isVertical')))) {
    min = this.pixelBoundsCache.left;
    range = this.pixelBoundsCache.width;
  } else {
    min = this.pixelBoundsCache.getBottom();
    range = -this.pixelBoundsCache.height;
  }
  return min + ratio * range;
};


/**
 * Applies axes lines info to passed pixel value.
 * @param {number} value
 * @return {number}
 */
anychart.core.series.Base.prototype.applyAxesLinesSpace = function(value) {
  var max, min;
  if (/** @type {boolean} */(this.getOption('isVertical'))) {
    min = this.boundsWithoutAxes.left;
    max = min + this.boundsWithoutAxes.width;
  } else {
    min = this.boundsWithoutAxes.top;
    max = min + this.boundsWithoutAxes.height;
  }
  return goog.math.clamp(value, min, max);
};


/**
 * If the series should consider the meta empty in makePointMeta.
 * @return {boolean}
 * @protected
 */
anychart.core.series.Base.prototype.considerMetaEmpty = function() {
  return false;
};


/**
 * Calculates pixel value
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 */
anychart.core.series.Base.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  var i;
  var pointMissing = this.considerMetaEmpty() ?
      0 :
      (Number(rowInfo.meta('missing')) || 0) & ~anychart.core.series.PointAbsenceReason.OUT_OF_RANGE;
  if (!this.isPointVisible(rowInfo))
    pointMissing |= anychart.core.series.PointAbsenceReason.OUT_OF_RANGE;
  rowInfo.meta('x',
      this.applyRatioToBounds(
          this.getXScale().transformInternal(
              rowInfo.getX(),
              rowInfo.getIndex(),
              /** @type {number} */(this.getOption('xPointPosition'))), true));
  if (!!pointMissing) {
    this.makeMissing(rowInfo, yNames);
  } else {
    var yScale = /** @type {anychart.scales.Base} */(this.yScale());
    var val;
    if (this.planIsStacked()) {
      val = yScale.transform(rowInfo.meta('stackedValue'), 0.5);
      if (isNaN(val)) pointMissing = false;
      rowInfo.meta('value', this.applyRatioToBounds(val, false));
      val = yScale.transform(rowInfo.meta('stackedZero'), 0.5);
      if (isNaN(val)) pointMissing = false;
      rowInfo.meta('zero', this.applyRatioToBounds(goog.math.clamp(val, 0, 1), false));
      rowInfo.meta('zeroMissing', rowInfo.meta('stackedMissing'));
      rowInfo.meta('prevValue', this.applyRatioToBounds(yScale.transform(rowInfo.meta('stackedValuePrev'), 0.5), false));
      rowInfo.meta('prevZero', this.applyRatioToBounds(yScale.transform(rowInfo.meta('stackedZeroPrev'), 0.5), false));
      rowInfo.meta('nextValue', this.applyRatioToBounds(yScale.transform(rowInfo.meta('stackedValueNext'), 0.5), false));
      rowInfo.meta('nextZero', this.applyRatioToBounds(yScale.transform(rowInfo.meta('stackedZeroNext'), 0.5), false));
    } else {
      if (this.needsZero()) {
        rowInfo.meta('zero', this.zeroY);
        rowInfo.meta('zeroMissing', false);
      }
      for (i = 0; i < yColumns.length; i++) {
        val = yScale.transform(yScale.applyComparison(rowInfo.getColumn(yColumns[i]), this.comparisonZero), 0.5);
        if (isNaN(val)) pointMissing |= anychart.core.series.PointAbsenceReason.VALUE_FIELD_MISSING;
        rowInfo.meta(yNames[i], this.applyRatioToBounds(val, false));
      }
    }
    if (this.isSizeBased()) {
      // negative sizes should be filtered out on drawing plan calculation stage
      // by settings missing reason VALUE_FIELD_MISSING
      rowInfo.meta('size', this.calculateSize(Number(rowInfo.get('size'))));
    }
    if (this.supportsOutliers()) {
      var outliers = [];
      var outliersSource = rowInfo.get('outliers');
      if (goog.isArray(outliersSource)) {
        for (i = 0; i < outliersSource.length; i++) {
          if (!yScale.isMissing(outliersSource[i]))
            outliers.push(
                this.applyRatioToBounds(
                    yScale.transform(
                        yScale.applyComparison(
                            outliersSource[i],
                            this.comparisonZero),
                        0.5),
                    false));
        }
      }
      rowInfo.meta('outliers', outliers);
    }
  }
  rowInfo.meta('missing', pointMissing);
};


/**
 * Makes passed row missing.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 */
anychart.core.series.Base.prototype.makeMissing = function(rowInfo, yNames) {
  // rowInfo.meta('x', undefined);
  for (var i = 0; i < yNames.length; i++) {
    rowInfo.meta(yNames[i], undefined);
  }
};


//endregion
//region --- Format/Position providers generation
//----------------------------------------------------------------------------------------------------------------------
//
//  Format/Position providers generation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates labels format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.core.series.Base.prototype.createLabelsContextProvider = function() {
  var provider = new anychart.core.utils.SeriesPointContextProvider(this, this.getYValueNames(), this.supportsError());
  provider.applyReferenceValues();
  return provider;
};


/**
 * Creates tooltip context provider.
 * @return {!anychart.core.utils.SeriesPointContextProvider}
 */
anychart.core.series.Base.prototype.createTooltipContextProvider = function() {
  if (!this.tooltipContext) {
    /**
     * Tooltip context cache.
     * @type {anychart.core.utils.SeriesPointContextProvider}
     * @protected
     */
    this.tooltipContext = new anychart.core.utils.SeriesPointContextProvider(this, this.getYValueNames(), this.supportsError());
  }
  this.tooltipContext.applyReferenceValues();
  return this.tooltipContext;
};


/**
 * Creates context provider for legend items text formatter function.
 * @return {Object} Legend context provider.
 * @protected
 */
anychart.core.series.Base.prototype.createLegendContextProvider = function() {
  if (!this.legendProvider) {
    /**
     * Legend context cache.
     * @type {Object}
     */
    this.legendProvider = new anychart.core.utils.LegendContextProvider(this);
  }
  return this.legendProvider;
};


/**
 * Create series position provider.
 * @param {string} position Understands anychart.enums.Position and some additional values.
 * @param {boolean=} opt_shift3D If true, adds a 3D shift if possible.
 * @return {Object} Object with info for labels formatting.
 */
anychart.core.series.Base.prototype.createPositionProvider = function(position, opt_shift3D) {
  var iterator = this.getIterator();
  var point;
  if (iterator.meta('missing')) {
    point = {'x': NaN, 'y': NaN};
  } else {
    var x = /** @type {number} */(iterator.meta('x'));
    var anchor = anychart.enums.normalizeAnchor(position, null);
    if (anchor) {
      var top = /** @type {number} */(iterator.meta(this.config.anchoredPositionTop));
      var bottom = /** @type {number} */(iterator.meta(this.config.anchoredPositionBottom));
      var bounds = new anychart.math.Rect(x, Math.min(top, bottom), 0, Math.abs(bottom - top));
      if (this.isWidthBased()) {
        bounds.left -= this.pointWidthCache / 2;
        bounds.width += this.pointWidthCache;
      }
      if (this.isSizeBased()) {
        var size = /** @type {number} */(iterator.meta('size'));
        bounds.left -= size;
        bounds.top -= size;
        bounds.width += size + size;
        bounds.height += size + size;
      }
      if (/** @type {boolean} */(this.getOption('isVertical'))) {
        var tmp = bounds.left;
        bounds.left = bounds.top;
        bounds.top = tmp;
        tmp = bounds.height;
        bounds.height = bounds.width;
        bounds.width = tmp;
      }
      point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
    } else {
      var val = iterator.meta(position);
      if (!goog.isDef(val)) {
        val = iterator.get(position);
        if (goog.isDef(val)) {
          if (this.planIsStacked()) {
            val += iterator.meta('stackedZero');
          }
          val = this.transformY(val);
        } else {
          val = NaN;
        }
      }
      if (/** @type {boolean} */(this.getOption('isVertical')))
        point = {'x': val, 'y': x};
      else
        point = {'x': x, 'y': val};
    }

    if (opt_shift3D && this.check(anychart.core.drawers.Capabilities.IS_3D_BASED)) {
      var provider3D = this.get3DProvider();
      var index = this.getIndex();
      point['x'] += provider3D.getX3DDistributionShift(index, this.planIsStacked());
      point['y'] -= provider3D.getY3DDistributionShift(index, this.planIsStacked());
    }
  }
  return {'value': point};
};


//endregion
//region --- OptimizedProperties
//----------------------------------------------------------------------------------------------------------------------
//
//  OptimizedProperties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.series.Base.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ALLOW_INTERACTIVITY);

  map['selectFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['negativeFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'negativeFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverNegativeFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverNegativeFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectNegativeFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectNegativeFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['risingFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'risingFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverRisingFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverRisingFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectRisingFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectRisingFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['fallingFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fallingFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverFallingFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFallingFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);
  map['selectFallingFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFallingFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['lowStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'lowStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverLowStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverLowStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectLowStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectLowStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['highStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'highStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverHighStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHighStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectHighStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHighStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['negativeStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'negativeStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverNegativeStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverNegativeStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectNegativeStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectNegativeStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['risingStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'risingStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverRisingStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverRisingStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectRisingStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectRisingStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['fallingStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fallingStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverFallingStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFallingStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectFallingStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFallingStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['medianStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'medianStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverMedianStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverMedianStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectMedianStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectMedianStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['stemStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stemStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverStemStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStemStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectStemStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStemStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['whiskerStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'whiskerStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverWhiskerStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverWhiskerStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectWhiskerStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectWhiskerStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['hatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.SERIES_POINTS,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR | anychart.ConsistencyState.SERIES_POINTS,
      0,
      anychart.core.series.Capabilities.ANY);

  map['negativeHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'negativeHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverNegativeHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverNegativeHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectNegativeHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectNegativeHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['risingHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'risingHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverRisingHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverRisingHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectRisingHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectRisingHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['fallingHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fallingHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['hoverFallingHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFallingHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['selectFallingHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFallingHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      0,
      0,
      anychart.core.series.Capabilities.ANY);

  map['color'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer,
      anychart.ConsistencyState.SERIES_COLOR,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);

  map['xPointPosition'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'xPointPosition',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.series.Capabilities.ANY);

  map['pointWidth'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'pointWidth',
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.IS_WIDTH_BASED);

  map['connectMissingPoints'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'connectMissingPoints',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING);

  map['displayNegative'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'displayNegative',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION,
      anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE);

  map['whiskerWidth'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'whiskerWidth',
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS);

  map['hoverWhiskerWidth'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverWhiskerWidth',
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      0,
      anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS);

  map['selectWhiskerWidth'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectWhiskerWidth',
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      0,
      anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS);

  map['type'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'type',
      anychart.core.settings.markerTypeNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED);

  map['hoverType'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverType',
      anychart.core.settings.markerTypeNormalizer,
      0,
      0,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED);

  map['selectType'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectType',
      anychart.core.settings.markerTypeNormalizer,
      0,
      0,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED);

  map['size'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'size',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED);

  map['hoverSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverSize',
      anychart.core.settings.numberNormalizer,
      0,
      0,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED);

  map['selectSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectSize',
      anychart.core.settings.numberNormalizer,
      0,
      0,
      anychart.core.drawers.Capabilities.IS_MARKER_BASED);

  map['stepDirection'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'stepDirection',
      anychart.enums.normalizeStepDirection,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION);

  map['isVertical'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'isVertical',
      anychart.core.settings.boolOrNullNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW,
      anychart.core.drawers.Capabilities.ANY);

  return map;
})();


// populating series base prototype with properties
anychart.core.settings.populate(anychart.core.series.Base, anychart.core.series.Base.PROPERTY_DESCRIPTORS);


//endregion
//region --- Statistics
//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series statistics.
 * @param {string=} opt_name Statistics parameter name.
 * @param {*=} opt_value Statistics parameter value.
 * @return {anychart.core.series.Base|Object.<number>|number}
 */
anychart.core.series.Base.prototype.statistics = function(opt_name, opt_value) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_name] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_name];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Calculate series statistics.
 */
anychart.core.series.Base.prototype.calculateStatistics = goog.nullFunction;


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.core.series.Base.prototype.getStat = function(key) {
  this.chart.ensureStatisticsReady();
  return this.statistics_[key];
};


//endregion
//region --- Serialization/Deserialization/Dispose
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization/Deserialization/Dispose
//
//----------------------------------------------------------------------------------------------------------------------
// Fill and stroke settings are located here, but you should export them ONLY in series themselves.
/**
 * @inheritDoc
 */
anychart.core.series.Base.prototype.serialize = function() {
  var json = anychart.core.series.Base.base(this, 'serialize');

  json['seriesType'] = this.seriesType();
  json['clip'] = (this.clip_ instanceof anychart.math.Rect) ? this.clip_.serialize() : this.clip_;

  if (this.meta_)
    json['meta'] = this.meta();
  if (this.id_)
    json['id'] = this.id();
  if (this.name_)
    json['name'] = this.name();
  if (this.autoIndex_ != this.getIndex())
    json['autoIndex'] = this.autoIndex();

  if (this.supportsInteractivity()) {
    json['tooltip'] = this.tooltip().serialize();
    json['legendItem'] = this.legendItem().serialize();
  }

  if (this.supportsLabels()) {
    json['labels'] = this.labels().serialize();
    json['hoverLabels'] = this.hoverLabels().getChangedSettings();
    json['selectLabels'] = this.selectLabels().getChangedSettings();
    if (goog.isNull(json['hoverLabels']['enabled'])) {
      delete json['hoverLabels']['enabled'];
    }
    if (goog.isNull(json['selectLabels']['enabled'])) {
      delete json['selectLabels']['enabled'];
    }
  }

  if (this.supportsMarkers()) {
    json['markers'] = this.markers().serialize();
    json['hoverMarkers'] = this.hoverMarkers().serialize();
    json['selectMarkers'] = this.selectMarkers().serialize();
  }

  if (this.supportsOutliers()) {
    json['outlierMarkers'] = this.outlierMarkers().serialize();
    json['hoverOutlierMarkers'] = this.hoverOutlierMarkers().serialize();
    json['selectOutlierMarkers'] = this.selectOutlierMarkers().serialize();
  }

  if (this.supportsError()) {
    json['error'] = this.error().serialize();
  }

  anychart.core.settings.serialize(this, anychart.core.series.Base.PROPERTY_DESCRIPTORS, json);

  json['a11y'] = this.a11y().serialize();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.series.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.series.Base.base(this, 'setupByJSON', config, opt_default);

  this.id(config['id']);
  this.autoIndex(config['autoIndex']);
  this.name(config['name']);
  this.meta(config['meta']);
  this.clip(config['clip']);
  this.a11y(config['a11y']);

  anychart.core.settings.deserialize(this, anychart.core.series.Base.PROPERTY_DESCRIPTORS, config);

  this.applyDefaultsToElements(config, false, opt_default);
};


/** @inheritDoc */
anychart.core.series.Base.prototype.disposeInternal = function() {
  goog.disposeAll(this.errorPaths_, this.errorPathsPool_);
  if (!this.check(anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT)) {
    goog.dispose(this.rootLayer);
  }
  goog.disposeAll(
      this.shapeManager,
      this.drawer,
      this.markers_,
      this.hoverMarkers_,
      this.selectMarkers_,
      this.labels_,
      this.hoverLabels_,
      this.selectLabels_,
      this.outlierMarkers_,
      this.hoverOutlierMarkers_,
      this.selectOutlierMarkers_,
      this.tooltip_,
      this.legendItem_,
      this.error_
  );
  this.rootLayer = null;
  this.errorPaths_ = null;
  this.yScale_ = null;
  delete this.chart;
  delete this.plot;
  delete this.iterator;
  delete this.defaultSettings;
  delete this.autoSettings;
  delete this.settings;
  delete this.shapeManager;
  delete this.drawer;
  delete this.markers_;
  delete this.hoverMarkers_;
  delete this.selectMarkers_;
  delete this.labels_;
  delete this.hoverLabels_;
  delete this.selectLabels_;
  delete this.outlierMarkers_;
  delete this.hoverOutlierMarkers_;
  delete this.selectOutlierMarkers_;
  delete this.tooltip_;
  delete this.legendItem_;
  delete this.error_;
  anychart.core.series.Base.base(this, 'disposeInternal');
};


//endregion
//region --- These methods don't have non-exported versions
//----------------------------------------------------------------------------------------------------------------------
//
//  These methods don't have non-exported versions
//
//----------------------------------------------------------------------------------------------------------------------

//fill
//hoverFill
//selectFill
//negativeFill
//hoverNegativeFill
//selectNegativeFill
//risingFill
//hoverRisingFill
//selectRisingFill
//fallingFill
//hoverFallingFill
//selectFallingFill

//stroke
//hoverStroke
//selectStroke
//lowStroke
//hoverLowStroke
//selectLowStroke
//highStroke
//hoverHighStroke
//selectHighStroke
//negativeStroke
//hoverNegativeStroke
//selectNegativeStroke
//risingStroke
//hoverRisingStroke
//selectRisingStroke
//fallingStroke
//hoverFallingStroke
//selectFallingStroke
//medianStroke
//hoverMedianStroke
//selectMedianStroke
//stemStroke
//hoverStemStroke
//selectStemStroke
//whiskerStroke
//hoverWhiskerStroke
//selectWhiskerStroke

//hatchFill
//hoverHatchFill
//selectHatchFill
//negativeHatchFill
//hoverNegativeHatchFill
//selectNegativeHatchFill
//risingHatchFill
//hoverRisingHatchFill
//selectRisingHatchFill
//fallingHatchFill
//hoverFallingHatchFill
//selectFallingHatchFill

//color
//xPointPosition
//pointWidth
//connectMissingPoints
//displayNegative
//whiskerWidth
//hoverWhiskerWidth
//selectWhiskerWidth
//type
//hoverType
//selectType
//size
//hoverSize
//selectSize

//endregion

//exports
(function() {
  var proto = anychart.core.series.Base.prototype;
  proto['a11y'] = proto.a11y;

  proto['getType'] = proto.getType;//legacy for scatter
  proto['seriesType'] = proto.seriesType;
  proto['name'] = proto.name;
  proto['id'] = proto.id;
  proto['meta'] = proto.meta;
  proto['getIndex'] = proto.getIndex;

  proto['yScale'] = proto.yScale;

  proto['labels'] = proto.labels;//doc|ex
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;

  proto['markers'] = proto.markers;//doc|ex
  proto['hoverMarkers'] = proto.hoverMarkers;//doc|ex
  proto['selectMarkers'] = proto.selectMarkers;

  proto['outlierMarkers'] = proto.outlierMarkers;
  proto['hoverOutlierMarkers'] = proto.hoverOutlierMarkers;
  proto['selectOutlierMarkers'] = proto.selectOutlierMarkers;

  proto['tooltip'] = proto.tooltip;
  proto['legendItem'] = proto.legendItem;
  proto['clip'] = proto.clip;
  proto['error'] = proto.error;

  proto['transformX'] = proto.transformX;
  proto['transformY'] = proto.transformY;

  proto['getPixelBounds'] = proto.getPixelBounds;
  proto['getPixelPointWidth'] = proto.getPixelPointWidth;

  proto['getStat'] = proto.getStat;

  proto['rendering'] = proto.rendering;
})();
