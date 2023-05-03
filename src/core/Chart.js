/**
 * @fileoverview anychart.core.Chart file.
 * @suppress {extraRequire}
 * todo: anychart.core.utils.InteractivityState should be excluded from requires
 */
goog.provide('anychart.core.Chart');

goog.require('acgraph');
goog.require('acgraph.events.BrowserEvent');
goog.require('anychart.compatibility');
goog.require('anychart.core.NoDataSettings');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.ChartCredits');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Animation');
goog.require('anychart.core.utils.ChartA11y');
goog.require('anychart.core.utils.Interactivity');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.performance');
goog.require('anychart.themes.merging');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.fullscreen');
goog.require('goog.events.EventHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.json.hybrid');
goog.require('goog.object');

goog.forwardDeclare('anychart.ui.ContextMenu');
goog.forwardDeclare('anychart.ui.ContextMenu.Item');
goog.forwardDeclare('anychart.ui.ContextMenu.PrepareItemsContext');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.Chart = function() {
  //todo: this suspend can be replaced with a flag for the chart if it will not be needed anywhere else.
  this.suspendSignalsDispatching();
  anychart.core.Chart.base(this, 'constructor');

  this.addThemes('chart');

  /**
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.rootElement = null;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * @type {acgraph.vector.Rect}
   * @protected
   */
  this.shadowRect = null;

  /**
   * @type {anychart.core.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * @type {Array.<anychart.core.ui.Label>}
   * @private
   */
  this.chartLabels_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.autoRedraw_ = true;

  /**
   * Public property for the Table to allow restoring the autoRedraw state.
   * @type {boolean}
   */
  this.originalAutoRedraw;

  /**
   * @type {anychart.core.utils.Animation}
   * @private
   */
  this.animation_ = null;

  /**
   * Chart context provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.chartContextProvider_ = null;

  /**
   * @type {anychart.core.utils.ChartA11y}
   * @private
   */
  this.a11y_ = null;

  /**
   * Dirty state for autoRedraw_ field. Used to avoid similar checking through multiple this.listenSignal calls.
   * @type {boolean}
   * @private
   */
  this.autoRedrawIsSet_ = false;


  /**
   * X shift (in pixels) for 3D mode. Calculated in anychart.cartesian3dModule.Chart.
   * @type {number}
   */
  this.x3dShift = 0;


  /**
   * Y shift (in pixels) for 3D mode. Calculated in anychart.cartesian3dModule.Chart.
   * @type {number}
   */
  this.y3dShift = 0;


  /**
   * Statistics object.
   * @type {Object}
   * @private
   */
  this.statistics_ = {};

  /**
   * @type {anychart.core.ui.ChartCredits}
   * @private
   */
  this.credits_ = null;

  /**
   * @type {boolean}
   * @protected
   */
  this.allowCreditsDisabling = false;

  /**
   * Interactive rect drawing bounds.
   * @type {?Array.<?anychart.math.Rect>}
   * @private
   */
  this.irDrawingBounds_ = null;

  /**
   * Rect that serves as an overlay for ignore mouse events mode.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.overlayRect_ = null;

  /**
   * Interactivity rect.
   * @type {acgraph.vector.Rect}
   * @protected
   */
  this.interactivityRect = null;

  /**
   * If the mouse down interactivity should be prevented.
   * @type {boolean}
   */
  this.preventMouseDownInteractivity = false;

  /**
   * @type {?string}
   * @private
   */
  this.id_ = null;

  this.invalidate(anychart.ConsistencyState.ALL);

  //region Init descriptors meta
  /**
   * @this {anychart.core.Chart}
   */
  function selectMarqueeFillBeforeInvalidation() {
    if (this.inMarquee()) {
      this.interactivityRect.fill(/** @type {acgraph.vector.Fill} */ (this.getOption('selectRectangleMarqueeFill')));
    }
  }

  /**
   * @this {anychart.core.Chart}
   */
  function selectMarqueeStrokeBeforeInvalidation() {
    if (this.inMarquee()) {
      this.interactivityRect.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('selectRectangleMarqueeStroke')));
    }
  }

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['selectRectangleMarqueeFill', 0, 0, 0, selectMarqueeFillBeforeInvalidation],
    ['selectRectangleMarqueeStroke', 0, 0, 0, selectMarqueeStrokeBeforeInvalidation]
  ]);
  //endregion

  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.Chart, anychart.core.VisualBaseWithBounds);


/**
 * Supported consistency states. Adds APPEARANCE to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds BACKGROUND and TITLE to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CHART_LABELS |
    anychart.ConsistencyState.CHART_BACKGROUND |
    anychart.ConsistencyState.CHART_TITLE |
    anychart.ConsistencyState.A11Y |
    anychart.ConsistencyState.CHART_ANIMATION |
    anychart.ConsistencyState.CHART_CREDITS;


/**
 * Chart content bounds.
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.Chart.prototype.contentBounds;


//region --- Testers
//------------------------------------------------------------------------------
//
//  Testers
//
//------------------------------------------------------------------------------
/**
 * A temporary crutch to suppress base interactivity support in Stock.
 * @return {boolean}
 * @protected
 */
anychart.core.Chart.prototype.supportsBaseHighlight = function() {
  return true;
};


/**
 * 3D mode flag.
 * @return {boolean}
 * @public
 */
anychart.core.Chart.prototype.isMode3d = function() {
  return false;
};


/**
 * Whether chart supports tooltip.
 * @return {boolean}
 */
anychart.core.Chart.prototype.supportsTooltip = function() {
  return true;
};


/**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {anychart.core.Chart|anychart.core.ui.Legend} Chart legend instance of itself for chaining call.
 */
anychart.core.Chart.prototype.legend = function(opt_value) {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_LEGEND_IN_CHART);
  return goog.isDef(opt_value) ? this : null;
};


/**
 * Internal public method. Returns all chart series.
 * @return {!Array.<anychart.core.series.Base|anychart.linearGaugeModule.pointers.Base|anychart.circularGaugeModule.pointers.Base>}
 */
anychart.core.Chart.prototype.getAllSeries = goog.abstractMethod;


/**
 * Getter series by index.
 * @param {number} index .
 * @return {anychart.core.series.Base}
 */
anychart.core.Chart.prototype.getSeries = function(index) {
  return null;
};


/**
 * Tester if it is series.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isSeries = function() {
  return false;
};


/**
 * Tester if it is chart.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isChart = function() {
  return true;
};


//endregion
//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Gets root layer.
 * @return {acgraph.vector.Layer}
 */
anychart.core.Chart.prototype.getRootElement = function() {
  return this.rootElement;
};


/**
 * Creates Stage and set up stage's credits with chart's credits values.
 * @return {!acgraph.vector.Stage}
 * @protected
 */
anychart.core.Chart.prototype.createStage = function() {
  var stage = acgraph.create();
  stage.allowCreditsDisabling = this.allowCreditsDisabling;

  stage.credits(this.credits().serializeDiff());
  return stage;
};


/**
 * Returns chart type. Published in charts.
 * @return {anychart.enums.ChartTypes|anychart.enums.GaugeTypes|anychart.enums.MapTypes}
 */
anychart.core.Chart.prototype.getType = goog.abstractMethod;


/**
 * @typedef {{chart: anychart.core.Chart}}
 */
anychart.core.Chart.DrawEvent;


//endregion
//region --- Margin
//------------------------------------------------------------------------------
//
//  Margin
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Chart|anychart.core.utils.Margin)} .
 */
anychart.core.Chart.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
    this.setupCreated('margin', this.margin_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  } else {
    return this.margin_;
  }
};


/**
 * Internal margin invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.marginInvalidated_ = function(event) {
  // whatever has changed in margins affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//endregion
//region --- Padding
//------------------------------------------------------------------------------
//
//  Padding
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Chart|anychart.core.utils.Padding)} .
 */
anychart.core.Chart.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
                                                 opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
    this.setupCreated('padding', this.padding_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.paddingInvalidated_ = function(event) {
  // whatever has changed in paddings affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//endregion
//region --- Background
//------------------------------------------------------------------------------
//
//  Background
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.Chart|anychart.core.ui.Background} .
 */
anychart.core.Chart.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.backgroundInvalidated_ = function(event) {
  // whatever has changed in background we redraw only background
  // because it doesn't affect other elements
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CHART_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region --- Title
//------------------------------------------------------------------------------
//
//  Title
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.core.Chart)} .
 */
anychart.core.Chart.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.setParentEventTarget(this);
    this.title_.listenSignals(this.onTitleSignal, this);
    this.setupCreated('title', this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.Chart.prototype.onTitleSignal = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CHART_TITLE | anychart.ConsistencyState.A11Y;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals - !state and nothing will happen.
  this.invalidate(state, signal);
};


//endregion
//region --- Chart labels
//------------------------------------------------------------------------------
//
//  Chart labels
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for label.
 * @param {(null|boolean|Object|string|number)=} opt_indexOrValue Chart label instance to add.
 * @param {(null|boolean|Object|string)=} opt_value Chart label instance.
 * @return {!(anychart.core.ui.Label|anychart.core.Chart)} Chart label instance or itself for chaining call.
 */
anychart.core.Chart.prototype.label = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var label = this.chartLabels_[index];
  if (!label) {
    label = this.createChartLabel();
    label.setParentEventTarget(this);
    label.addThemes('defaultFontSettings', 'defaultLabelSettings');

    this.chartLabels_[index] = label;
    label.listenSignals(this.onLabelSignal_, this);
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    label.setup(value);
    return this;
  } else {
    return label;
  }
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onLabelSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Creates chart label.
 * @return {anychart.core.ui.Label} Label instance.
 */
anychart.core.Chart.prototype.createChartLabel = function() {
  return new anychart.core.ui.Label();
};


/**
 * Sets chart label settings.
 * @param {anychart.core.ui.Label} label Label for tuning.
 * @param {anychart.math.Rect} bounds Label parent bounds.
 * @protected
 */
anychart.core.Chart.prototype.setLabelSettings = function(label, bounds) {
  label.parentBounds(bounds);
};


//endregion
//region --- No data label
/**
 * No data label invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.Chart.prototype.noDataSettingsInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 *  No data settings.
 *  @param {Object=} opt_value
 *  @return {anychart.core.Chart|anychart.core.NoDataSettings} noData settings or self for chaining.
 */
anychart.core.Chart.prototype.noData = function(opt_value) {
  if (!this.noDataSettings_) {
    this.noDataSettings_ = new anychart.core.NoDataSettings(this);
    this.noDataSettings_.listenSignals(this.noDataSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.noDataSettings_.setup(opt_value);
    return this;
  }
  return this.noDataSettings_;
};


/**
 * Is there no data on the chart.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isNoData = function() {
  return false;
};


/**
 * @return {boolean}
 */
anychart.core.Chart.prototype.supportsNoData = function() {
  return true;
};


//endregion
//region --- Calculations and statistics
//------------------------------------------------------------------------------
//
//  Calculations and statistics
//
//------------------------------------------------------------------------------
/**
 * Developers note:
 * This method:
 * - Calculates all required drawing data.
 * - Considering all calculated data, fills the statistics object with calculated values.
 * - Can be called before this.draw() method is called.
 * - Can be called any amount of times. Must do the calculations only if something important had been changed.
 * - This method is called EVERY TIME getStat() is called.
 */
anychart.core.Chart.prototype.calculate = goog.nullFunction;


/**
 * Calculates all statistics for the chart.
 */
anychart.core.Chart.prototype.calculateStatistics = goog.nullFunction;


/**
 * Ensures that statistics is ready.
 */
anychart.core.Chart.prototype.ensureStatisticsReady = function() {
  this.calculate();
  this.calculateStatistics();
};


/**
 * Chart statistics getter/setter for internal usage. Turns names to lower case and asks values as lower case.
 * @param {string=} opt_name Statistics parameter name.
 * @param {*=} opt_value Statistics parameter value.
 * @return {anychart.core.Chart|*}
 */
anychart.core.Chart.prototype.statistics = function(opt_name, opt_value) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_name.toLowerCase()] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_name.toLowerCase()];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Resets statistics
 * @return {anychart.core.Chart} - Itself.
 */
anychart.core.Chart.prototype.resetStatistics = function() {
  this.statistics_ = {};
  return this;
};


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.core.Chart.prototype.getStat = function(key) {
  this.ensureStatisticsReady();
  return this.statistics(key);
};


//endregion
//region --- Tooltip
//------------------------------------------------------------------------------
//
//  Tooltip
//
//------------------------------------------------------------------------------
/**
 * Creates chart tooltip.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Tooltip|anychart.core.Chart)}
 */
anychart.core.Chart.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = this.createTooltip();
    this.setupCreated('tooltip', this.tooltip_);
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Creates tooltip.
 * @protected
 * @return {!anychart.core.ui.Tooltip}
 */
anychart.core.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(anychart.core.ui.Tooltip.Capabilities.ANY);
  tooltip.chart(this);
  tooltip.containerProvider(this);

  if (this.supportsBaseHighlight())
    this.listen(anychart.enums.EventType.POINTS_HOVER, this.showTooltip_, true);
  return tooltip;
};


/**
 * Return points information for union tooltip display mode.
 *
 * @param {anychart.core.series.Base} series
 * @param {number} pointIndex
 * @param {number} categoryIndex
 *
 * @return {Array.<{
 *   series: anychart.core.series.Base,
 *   points: Array.<number>
 * }>}
 */
anychart.core.Chart.prototype.getPointsForUnionDisplayMode = function(series, pointIndex, categoryIndex) {
  var points = [];
  // check isDef series for compile_each (for gantt, etc.)
  if (goog.isDef(this.getAllSeries())) {
    // get points from all series by point index
    points = goog.array.map(this.getAllSeries(), function(series) {
      if (series.getOption('xMode') == anychart.enums.XMode.SCATTER)
        series.getIterator().select(pointIndex);
      else
        series.getIterator().select(categoryIndex);
      return {
        'series': series,
        'points': [pointIndex]
      };
    });
  }

  // filter missing
  return goog.array.filter(points, function(point) {
    var series = point['series'];
    var iterator = series.getIterator();
    if (goog.isDef(iterator.meta('missing'))) {
      return !iterator.meta('missing');
    }
    return !anychart.utils.isNaN(iterator.get('value'));
  });
};


/**
 * @param {anychart.core.MouseEvent} event
 * @private
 */
anychart.core.Chart.prototype.showTooltip_ = function(event) {
  if (event.forbidTooltip) return;

  // summary
  // Tooltip Mode   | Interactivity mode
  // Single + Single - draw one tooltip.
  // Union + Single - draw one tooltip at the hovered point, content from all points by index of hovered point.
  // Separated + Single  - draw all tooltips for hovered points.

  // Single + byX - draw one tooltip at nearest point to cursor.
  // Union + byX - draw one tooltip at nearest point to cursor (in point position), content from all hovered points.
  // Separated + byX - draw all tooltips for hovered points.

  // For bySpot as for byX

  var toShowSeriesStatus = [];
  goog.array.forEach(event['seriesStatus'], function(status) {
    if (goog.array.isEmpty(status['points'])) {
      if (this.tooltip_.getOption('positionMode') == anychart.enums.TooltipPositionMode.FLOAT) {
        this.unlisten(goog.events.EventType.MOUSEMOVE, this.updateTooltip);
      }
      this.tooltip_.hide(false, event);

    } else if (status['series'].enabled()) {
      toShowSeriesStatus.push(status);
    }
  }, this);

  if (!goog.array.isEmpty(toShowSeriesStatus)) {
    if (this.tooltip_.getOption('positionMode') == anychart.enums.TooltipPositionMode.FLOAT) {
      this.listen(goog.events.EventType.MOUSEMOVE, this.updateTooltip);
    }

    var interactivity = this.getCreated('interactivity', true, this.interactivity);
    if (interactivity.getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
      var points = [];
      if (this.tooltip_.getOption('displayMode') == anychart.enums.TooltipDisplayMode.SINGLE) {
        points = event['seriesStatus'];
      } else {
        var categoryIndex;
        var pointIndex = categoryIndex = event['seriesStatus'][0]['points'][0];
        // improve maps support (separated & point modes)
        if (goog.isDef(pointIndex['index'])) pointIndex = categoryIndex = pointIndex['index'];
        var series = event['seriesStatus'][0]['series'];

        // if series xScale ordinal and in scatter xMode than we should use categoryIndex insteadof pointIndex
        if (series.getXScale &&
          anychart.utils.instanceOf(series.getXScale(), anychart.scales.Ordinal) &&
          series.getOption('xMode') == anychart.enums.XMode.SCATTER
        ) {
          categoryIndex = event['point'].get('x');
        }

        points = this.getPointsForUnionDisplayMode(series, pointIndex, categoryIndex);
      }

      this.tooltip_.showForSeriesPoints(points,
          event['originalEvent']['clientX'],
          event['originalEvent']['clientY'],
          event['seriesStatus'][0]['series'],
          this.useUnionTooltipAsSingle());

      // byX, bySpot
    } else {
      var nearestSeriesStatus = toShowSeriesStatus[0];
      toShowSeriesStatus[0]['series'].getIterator().select(toShowSeriesStatus[0]['nearestPointToCursor']['index']);

      goog.array.forEach(toShowSeriesStatus, function(status) {
        if (nearestSeriesStatus['nearestPointToCursor']['distance'] > status['nearestPointToCursor']['distance']) {
          status['series'].getIterator().select(status['nearestPointToCursor']['index']);
          nearestSeriesStatus = status;
        }
      });

      if (this.tooltip_.getOption('displayMode') == anychart.enums.TooltipDisplayMode.SINGLE) {
        // show nearest hovered point to cursor
        this.tooltip_.showForSeriesPoints([nearestSeriesStatus],
            event['originalEvent']['clientX'],
            event['originalEvent']['clientY'],
            nearestSeriesStatus['series'],
            this.useUnionTooltipAsSingle());
      } else {
        // show all hovered points, in union mode position will be to nearest hovered point to cursor
        this.tooltip_.showForSeriesPoints(toShowSeriesStatus,
            event['originalEvent']['clientX'],
            event['originalEvent']['clientY'],
            nearestSeriesStatus['series'],
            this.useUnionTooltipAsSingle());
      }
    }
  }
};


/**
 * Update tooltip position. (for float)
 * @param {anychart.core.MouseEvent} event
 * @protected
 */
anychart.core.Chart.prototype.updateTooltip = function(event) {
  this.tooltip_.updatePosition(event['clientX'], event['clientY']);
};


/**
 * Used in sparklines.
 * @return {boolean}
 */
anychart.core.Chart.prototype.useUnionTooltipAsSingle = function() {
  return false;
};


//endregion
//region --- Context menu
//------------------------------------------------------------------------------
//
//  Context menu
//
//------------------------------------------------------------------------------
/**
 * Creates context menu for chart.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.ui.ContextMenu|!anychart.core.Chart}
 */
anychart.core.Chart.prototype.contextMenu = function(opt_value) {
  if (!this.contextMenu_) {
    // suppress NO_FEATURE_IN_MODULE warning
    this.contextMenu_ = anychart.module['ui']['contextMenu'](!!goog.isObject(opt_value) && opt_value['fromTheme']);
    if (this.contextMenu_) {
      this.contextMenu_['itemsProvider'](this.contextMenuItemsProvider);
    }
  }

  if (goog.isDef(opt_value)) {
    if (this.contextMenu_) {
      this.contextMenu_['setup'](opt_value);
    }
    return this;
  } else {
    return this.contextMenu_;
  }
};


/**
 * Returns link to version history.
 * Used by context menu version item.
 * @return {string}
 * @protected
 */
anychart.core.Chart.prototype.getVersionHistoryLink = function() {
  return 'https://anychart.com/products/anychart/history';
};


/**
 * Default context menu items provider.
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
 * @this {anychart.ui.ContextMenu.PrepareItemsContext}
 * @return {Object.<string, anychart.ui.ContextMenu.Item>}
 * @protected
 */
anychart.core.Chart.prototype.contextMenuItemsProvider = function(context) {
  // For fired on MarkersFactory or LabelsFactory
  var parentEventTarget = context['event'] ? context['event']['target'].getParentEventTarget() : null;
  // For fired on series point (context['event']['target'] == chart)
  var meta = context['event'] ? anychart.utils.extractTag(context['event']['domTarget']) : null;
  var isSeries = goog.isObject(meta) && goog.isDef(meta.series) &&
      meta.series['seriesType'] && goog.isDef(meta.index);
  var isPointContext = isSeries || (parentEventTarget && parentEventTarget['seriesType']);

  var items = {};
  if (anychart.module['exports']) {
    goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.core.Chart.contextMenuMap['exporting'])));
  }
  if (goog.dom.fullscreen.isSupported() && context['menuParent'])
    goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.core.Chart.contextMenuMap[context['menuParent'].fullScreen() ? 'full-screen-exit' : 'full-screen-enter'])));
  goog.object.extend(items, /** @type {Object} */ (anychart.utils.recursiveClone(anychart.core.Chart.contextMenuMap['main'])));

  if (anychart.DEVELOP) {
    // prepare version link (specific to each product)
    var versionHistoryItem = /** @type {anychart.ui.ContextMenu.Item} */(anychart.utils.recursiveClone(anychart.core.Chart.contextMenuItems['version-history']));
    versionHistoryItem['href'] = context['menuParent'].getVersionHistoryLink() + '?version=' + anychart.VERSION;

    items['version-history-separator'] = {'index': 81};
    items['save-config-as'] = anychart.utils.recursiveClone(anychart.core.Chart.contextMenuItems['save-config-as']);
    items['link-to-help'] = anychart.utils.recursiveClone(anychart.core.Chart.contextMenuItems['link-to-help']);
    items['version-history'] = versionHistoryItem;
  }

  return context['menuParent'].specificContextMenuItems(items, context, isPointContext);
};


/**
 * Specific set context menu items to chart.
 * @param {Object.<string, anychart.ui.ContextMenu.Item>} items Default items provided from chart.
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
 * @param {boolean} isPointContext
 * @return {Object.<string, anychart.ui.ContextMenu.Item>}
 * @protected
 */
anychart.core.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  return items;
};


/**
 * Gets incoming raw common context object for context menu and patches it adding necessary fields.
 *
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context - Incoming raw common context object.
 * @return {anychart.ui.ContextMenu.PrepareItemsContext} - Patched context object or a new one.
 */
anychart.core.Chart.prototype.patchContextMenuContext = function(context) {
  return context;
};


/**
 * Get selected points.
 * @return {Array.<anychart.core.Point>}
 */
anychart.core.Chart.prototype.getSelectedPoints = function() {
  var selectedPoints = [];
  var selectedPointsIndexes, series, i, j;
  var allSeries = this.getAllSeries();
  for (i = 0; i < allSeries.length; i++) {
    series = allSeries[i];
    if (!series || !series.state || !series.getPoint || !series.enabled()) continue;
    selectedPointsIndexes = series.state.getIndexByPointState(anychart.PointState.SELECT);
    for (j = 0; j < selectedPointsIndexes.length; j++) {
      selectedPoints.push(series.getPoint(selectedPointsIndexes[j]));
    }
  }

  return selectedPoints;
};


/**
 * Items map.
 * @type {Object.<string, anychart.ui.ContextMenu.Item>}
 */
anychart.core.Chart.contextMenuItems = {
  // Select marquee
  'select-marquee-start': {
    'index': 9.3,
    'text': 'Start selection marquee',
    'eventType': 'anychart.startSelectMarquee',
    'action': function(context) {
      context['menuParent'].startSelectRectangleMarquee(false);
    }
  },

  // Item 'Export as ...'.
  'save-chart-as': {
    'index': 10,
    'text': 'Save chart as...',
    'iconClass': 'ac ac-file-image-o',
    'subMenu': {
      'save-chart-as-png': {
        'index': 10,
        'text': '.png',
        'iconClass': 'ac ac-file-image-o',
        'eventType': 'anychart.saveAsPng',
        'action': function(context) {
          context['menuParent'].saveAsPng();
        }
      },
      'save-chart-as-jpg': {
        'index': 20,
        'text': '.jpg',
        'iconClass': 'ac ac-file-image-o',
        'eventType': 'anychart.saveAsJpg',
        'action': function(context) {
          context['menuParent'].saveAsJpg();
        }
      },
      'save-chart-as-pdf': {
        'index': 30,
        'text': '.pdf',
        'iconClass': 'ac ac-file-pdf-o',
        'eventType': 'anychart.saveAsPdf',
        'action': function(context) {
          context['menuParent'].saveAsPdf();
        }
      },
      'save-chart-as-svg': {
        'index': 40,
        'text': '.svg',
        'iconClass': 'ac ac-file-code-o',
        'eventType': 'anychart.saveAsSvg',
        'action': function(context) {
          context['menuParent'].saveAsSvg();
        }
      }
    }
  },

  // Item 'Save data as...'.
  'save-data-as': {
    'index': 20,
    'text': 'Save data as...',
    'iconClass': 'ac ac-save',
    'subMenu': {
      'save-data-as-text': {
        'index': 10,
        'text': '.csv',
        'iconClass': 'ac ac-file-excel-o',
        'eventType': 'anychart.saveAsCsv',
        'action': function(context) {
          context['menuParent'].saveAsCsv();
        }
      },
      'save-data-as-xlsx': {
        'index': 20,
        'text': '.xlsx',
        'iconClass': 'ac ac-file-excel-o',
        'eventType': 'anychart.saveAsXlsx',
        'action': function(context) {
          context['menuParent'].saveAsXlsx();
        }
      }
    }
  },

  // Item 'Share with...'.
  'share-with': {
    'index': 30,
    'text': 'Share with...',
    'iconClass': 'ac ac-net',
    'subMenu': {
      'share-with-facebook': {
        'index': 10,
        'text': 'Facebook',
        'iconClass': 'ac ac-facebook',
        'eventType': 'anychart.shareWithFacebook',
        'action': function(context) {
          context['menuParent'].shareWithFacebook();
        }
      },
      'share-with-twitter': {
        'index': 20,
        'text': 'Twitter',
        'iconClass': 'ac ac-twitter',
        'eventType': 'anychart.shareWithTwitter',
        'action': function(context) {
          context['menuParent'].shareWithTwitter();
        }
      },
      'share-with-linkedin': {
        'index': 30,
        'text': 'LinkedIn',
        'iconClass': 'ac ac-linkedin',
        'eventType': 'anychart.shareWithLinkedIn',
        'action': function(context) {
          context['menuParent'].shareWithLinkedIn();
        }
      },
      'share-with-pinterest': {
        'index': 40,
        'text': 'Pinterest',
        'iconClass': 'ac ac-pinterest',
        'eventType': 'anychart.shareWithPinterest',
        'action': function(context) {
          context['menuParent'].shareWithPinterest();
        }
      }
    }
  },

  // Item 'Print Chart'.
  'print-chart': {
    'index': 50,
    'text': 'Print',
    'iconClass': 'ac ac-print',
    'eventType': 'anychart.print',
    'action': function(context) {
      context['menuParent'].print();
    }
  },

  // Item-link to our site.
  'full-screen-enter': {
    'index': 60,
    'text': 'Enter full screen',
    'action': function(context) {
      context['menuParent'].fullScreen(true);
    }
  },

  'full-screen-exit': {
    'index': 60,
    'text': 'Exit full screen',
    'action': function(context) {
      context['menuParent'].fullScreen(false);
    }
  },

  // Item-link to our site.
  'about': {
    'index': 80,
    'iconClass': 'ac ac-cog',
    'text': 'AnyChart ' + (anychart.VERSION ?
        goog.string.subs.apply(null, ['v%s.%s.%s.%s'].concat(anychart.VERSION.split('.'))) :
        ' develop version'),
    'href': 'https://anychart.com'
  },

  // Item 'Save config as..'.
  'save-config-as': {
    'index': 100,
    'text': 'Save config as...',
    'iconClass': 'ac ac-save',
    'subMenu': {
      'save-config-as-json': {
        'index': 10,
        'text': '.json',
        'iconClass': 'ac ac-file-code-o',
        'eventType': 'anychart.saveAsJson',
        'action': function(context) {
          context['menuParent'].saveAsJson();
        }
      },
      'save-config-as-xml': {
        'index': 20,
        'text': '.xml',
        'iconClass': 'ac ac-file-code-o',
        'eventType': 'anychart.saveAsXml',
        'action': function(context) {
          context['menuParent'].saveAsXml();
        }
      }
    }
  },

  // Item 'Link to help'.
  'link-to-help': {
    'index': 110,
    'iconClass': 'ac ac-question',
    'text': 'Need help? Go to support center!',
    'href': 'https://anychart.com/support'
  },

  // Item-link to version history.
  'version-history': {
    'index': 120,
    'text': 'Version History',
    'href': ''
  }
};


/**
 * Menu map.
 * @type {Object.<string, Object.<string, anychart.ui.ContextMenu.Item>>}
 */
anychart.core.Chart.contextMenuMap = {
  // Menu 'Default menu'.
  'exporting': {
    'save-chart-as': anychart.core.Chart.contextMenuItems['save-chart-as'],
    'save-data-as': anychart.core.Chart.contextMenuItems['save-data-as'],
    'share-with': anychart.core.Chart.contextMenuItems['share-with'],
    'print-chart': anychart.core.Chart.contextMenuItems['print-chart'],
    'exporting-separator': {'index': 51}
  },
  'full-screen-enter': {
    'full-screen-enter': anychart.core.Chart.contextMenuItems['full-screen-enter'],
    'full-screen-separator': {'index': 61}
  },
  'full-screen-exit': {
    'full-screen-exit': anychart.core.Chart.contextMenuItems['full-screen-exit'],
    'full-screen-separator': {'index': 61}
  },
  'main': {
    'about': anychart.core.Chart.contextMenuItems['about']
  },
  'select-marquee': {
    'select-marquee-start': anychart.core.Chart.contextMenuItems['select-marquee-start'],
    'select-marquee-separator': {'index': 9.4}
  }
};


//endregion
//region --- Credits
//------------------------------------------------------------------------------
//
//  Credits
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for credits.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.Chart|anychart.core.ui.ChartCredits)} Chart credits or itself for chaining call.
 */
anychart.core.Chart.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.ChartCredits(this);
    this.credits_.listenSignals(this.onCreditsSignal_, this);
    this.setupCreated('credits', this.credits_);
    this.credits_.setupByJSON(this.credits_.themeSettings);
  }

  if (goog.isDef(opt_value)) {
    this.credits_.setup(opt_value);
    return this;
  } else {
    return this.credits_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onCreditsSignal_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.CHART_CREDITS;
  }
  // If there are no signals - !state and nothing will happen.
  this.invalidate(state, signal);
};


//endregion
//region --- Animation
//------------------------------------------------------------------------------
//
//  Animation
//
//------------------------------------------------------------------------------
/**
 * Setter/getter for animation setting.
 * @param {(boolean|Object)=} opt_enabledOrJson Whether to enable animation.
 * @param {number=} opt_duration A Duration in milliseconds.
 * @return {anychart.core.utils.Animation|anychart.core.Chart} Animations settings object or self for chaining.
 */
anychart.core.Chart.prototype.animation = function(opt_enabledOrJson, opt_duration) {
  if (!this.animation_) {
    this.animation_ = new anychart.core.utils.Animation();
    this.animation_.listenSignals(this.onAnimationSignal_, this);
    this.setupCreated('animation', this.animation_);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.animation_.setup.apply(this.animation_, arguments);
    return this;
  } else {
    return this.animation_;
  }
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.Chart.prototype.onAnimationSignal_ = function() {
  this.invalidate(anychart.ConsistencyState.CHART_ANIMATION, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Animate chart.
 */
anychart.core.Chart.prototype.doAnimation = goog.nullFunction;


//endregion
//region --- A11y
//------------------------------------------------------------------------------
//
//  A11y
//
//------------------------------------------------------------------------------
/**
 * Creates tooltip context provider.
 * @return {anychart.format.Context}
 */
anychart.core.Chart.prototype.createA11yContextProvider = function() {
  if (!this.chartContextProvider_) {
    this.chartContextProvider_ = new anychart.format.Context();
  }

  var values = {
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN}
  };

  this.chartContextProvider_
      .statisticsSources([this]);

  return /** @type {anychart.format.Context} */ (this.chartContextProvider_.propagate(values));
};


/**
 * Setter/getter for accessibility setting.
 * @param {(boolean|Object)=} opt_enabledOrJson - Whether to enable accessibility.
 * @return {anychart.core.utils.ChartA11y|anychart.core.Chart} - Accessibility settings object or self for chaining.
 */
anychart.core.Chart.prototype.a11y = function(opt_enabledOrJson) {
  if (!this.a11y_) {
    this.a11y_ = new anychart.core.utils.ChartA11y(this);
    this.a11y_.listenSignals(this.onA11ySignal_, this);
    this.setupCreated('a11y', this.a11y_);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.a11y_.setup.apply(this.a11y_, arguments);
    return this;
  } else {
    return this.a11y_;
  }
};


/**
 * A11y change handler.
 * @private
 */
anychart.core.Chart.prototype.onA11ySignal_ = function() {
  this.invalidate(anychart.ConsistencyState.A11Y, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Bounds and drawing
//------------------------------------------------------------------------------
//
//  Bounds and drawing
//
//------------------------------------------------------------------------------
/**
 * Calculate chart content bounds. Reduces total bounds to content bounds by
 * substracting credits, margin, padding, title and background stroke thickness
 * from total bounds.
 * If total bounds are zero - this method isn't called.
 * @param {!anychart.math.Rect} totalBounds Total chart area bounds, do not override, it can be useful later.
 * @return {!anychart.math.Rect} Chart content bounds, allocated space for all chart appearance items.
 */
anychart.core.Chart.prototype.calculateContentAreaSpace = function(totalBounds) {
  //chart area bounds with applied margin and copped by credits
  var boundsWithoutCredits;
  //chart area with applied margin
  var boundsWithoutMargin;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  //
  var boundsWithoutBackgroundThickness;

  boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  var background = this.getCreated('background');
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_BACKGROUND | anychart.ConsistencyState.BOUNDS)) {
    if (background) {
      background.suspendSignalsDispatching();
      if (!background.container()) background.container(this.rootElement);
      background.parentBounds(boundsWithoutMargin);
      background.resumeSignalsDispatching(false);
      background.draw();
    }
    this.markConsistent(anychart.ConsistencyState.CHART_BACKGROUND);
  }

  boundsWithoutBackgroundThickness = background && background.enabled() ? background.getRemainingBounds() : boundsWithoutMargin;
  boundsWithoutCredits = this.drawCredits(boundsWithoutBackgroundThickness);
  boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutCredits);

  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_TITLE | anychart.ConsistencyState.BOUNDS)) {
    if (title) {
      title.suspendSignalsDispatching();
      if (!title.container()) title.container(this.rootElement);
      title.parentBounds(boundsWithoutPadding);
      title.resumeSignalsDispatching(false);
      title.draw();
    }
    this.markConsistent(anychart.ConsistencyState.CHART_TITLE);
  }

  boundsWithoutTitle = title && title.enabled() ? title.getRemainingBounds() : boundsWithoutPadding;

  return boundsWithoutTitle.clone();
};


/**
 * Draw credits.
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @return {!anychart.math.Rect} Bounds without credits bounds.
 */
anychart.core.Chart.prototype.drawCredits = function(parentBounds) {
  var stage = this.container().getStage();
  if (!stage)
    return /** @type {!anychart.math.Rect} */(parentBounds);

  var stageCredits = stage.credits();
  var chartCredits = this.credits();

  stageCredits.setup(chartCredits.serializeDiff());
  chartCredits.dropSettings();

  this.markConsistent(anychart.ConsistencyState.CHART_CREDITS);
  return /** @type {!anychart.math.Rect} */(parentBounds);
};


/**
 * Renders chart.
 */
anychart.core.Chart.prototype.drawInternal = function() {
  if (!this.autoRedrawIsSet_) {
    if (this.autoRedraw_)
      this.listenSignals(this.invalidateHandler_, this);
    else
      this.unlistenSignals(this.invalidateHandler_, this);
    this.autoRedrawIsSet_ = true;
  }

  if (!this.checkDrawingNeeded())
    return;

  anychart.performance.start('Chart.draw()');
  var startTime;
  if (anychart.DEVELOP) {
    startTime = anychart.performance.relativeNow();
  }

  this.suspendSignalsDispatching();

  var noDataLabel = /** @type {anychart.core.ui.Label} */ (this.noData().getCreated('label'));
  if (noDataLabel && this.supportsNoData()) {
    var noData = this.isNoData();
    // checking for root layer to avoid dispatching on the first draw
    var doDispatch = noDataLabel['visible']() !== noData && this.rootElement;
    if (doDispatch) {
      var noDataEvent = {
        'type': anychart.enums.EventType.DATA_CHANGED,
        'chart': this,
        'hasData': !noData
      };
      noData = this.dispatchEvent(noDataEvent) && noData;
    }
    noDataLabel['visible'](noData);
  }

  //create root element only if draw is called
  if (!this.rootElement) {
    this.rootElement = acgraph.layer();
    this.bindHandlersToGraphics(this.rootElement);
  }

  //suspend stage
  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.contextMenu_ && goog.isDef(this.themeSettings['contextMenu']))
    this.contextMenu(this.themeSettings['contextMenu']);

  if (this.contextMenu_) {
    this.contextMenu_['attach'](this);
  }

  //start clear container consistency states
  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //can be null if you add chart to tooltip container on hover (Vitalya :) )
    if (stage) {
      //listen resize event
      // stage.resize(stage.originalWidth, stage.originalHeight);
      stage.listen(
          acgraph.vector.Stage.EventType.STAGE_RESIZE,
          this.resizeHandler,
          false,
          this
      );
    }
  }
  //end clear container consistency states

  //total chart area bounds, do not override, it can be useful later
  var totalBounds = /** @type {!anychart.math.Rect} */(this.getPixelBounds());

  /*
  DVF-3944
  This boolean value is set true if bounds are zero: either width or height, or both.
  It is used further in the code to avoid drawing, animation and calculation of content bounds
  in case of total bounds being zeroed. This is done due to lack of reasons to perform drawing
  and calculations within zero bounds (they are not visible).
  As a side effect it fixes problems that aroused from bounds being requested for the element while
  it isn't visible (display: none). In this case Chrome returned zero bounds, Firefox threw an exception.
  */
  var isNonZeroBounds = totalBounds.width && totalBounds.height;

  /*
  Actions inside this condition are drawing and bounds calculation related.
  It's unnecessary to perform any of this, when bounds are zero.
  In case of zero bounds we skip:
    1) this.beforeDraw() - any preparations for drawing
    2) this.calculateContentAreaSpace() - reduction of total bounds to the bounds we actually perform drawing in.
    3) this.drawContent() and this.specialDraw() - where most of the drawing magic happens.
    4) creation of shadowRect for crosshair to work when background is disabled.
    5) labels, including noDataLabel, drawing.
    6) animation and a11y - they are unnecessary for invisible elements.
  But dispatchDetachedEvent and onInteractivitySignal are fired anyway.
  Former detaches 'chartdraw' signal from current execution frame, putting it in the end of events queue
  and allowing this.draw() method to complete before event hadlers are executed.
  And latter sets hoverMode for series with chart interactivity hoverMode, in case base interactivity is supported.
   */
  if (isNonZeroBounds) {
    // DVF-1648
    anychart.performance.start('Chart.beforeDraw()');
    this.beforeDraw();
    anychart.performance.end('Chart.beforeDraw()');

    anychart.performance.start('Chart.calculateBounds()');
    this.contentBounds = this.calculateContentAreaSpace(totalBounds);
    anychart.performance.end('Chart.calculateBounds()');

    anychart.performance.start('Chart.drawContent()');
    this.drawContent(this.contentBounds);
    this.specialDraw(this.getPlotBounds());
    anychart.performance.end('Chart.drawContent()');

    /*
    Creates rectangular opaque element, with the size of content bounds, to catch mouse events.
    Used for crosshair to work correctly in cases when background is not drawn and therefore mouse events
    are fired only over series svg elements.
     */
    var background = this.getCreated('background');
    var fill = background ? background.getOption('fill') : null;
    if (!background || !background.enabled() || !fill || fill == 'none') {
      if (!this.shadowRect) {
        this.shadowRect = this.rootElement.rect();
        this.shadowRect.fill(anychart.color.TRANSPARENT_HANDLER).stroke(null);
      }
      this.shadowRect.setBounds(this.contentBounds);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LABELS | anychart.ConsistencyState.BOUNDS)) {
      for (var i = 0, count = this.chartLabels_.length; i < count; i++) {
        var label = this.chartLabels_[i];
        if (label) {
          label.suspendSignalsDispatching();
          if (!label.container() && label.enabled()) label.container(this.rootElement);
          this.setLabelSettings(label, totalBounds);
          label.draw();
          label.resumeSignalsDispatching(false);
        }
      }

      if (noDataLabel) {
        noDataLabel.suspendSignalsDispatching();
        noDataLabel.container(this.rootElement);
        this.setLabelSettings(noDataLabel, this.contentBounds);
        noDataLabel.draw();
        noDataLabel.resumeSignalsDispatching(false);
      }

      this.markConsistent(anychart.ConsistencyState.CHART_LABELS);
    }
  }

  // whether drawing happened or not we still clear bounds state to receive bounds updates
  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  if (isNonZeroBounds) {
    this.doAnimation();
    this.markConsistent(anychart.ConsistencyState.CHART_ANIMATION);

    if (this.hasInvalidationState(anychart.ConsistencyState.A11Y)) {
      var a11y = this.getCreated('a11y');
      if (a11y)
        a11y.applyA11y();
      this.markConsistent(anychart.ConsistencyState.A11Y);
    }
  }

  this.resumeSignalsDispatching(false);

  var id = acgraph.utils.IdGenerator.getInstance().identify(this, 'chart');
  this.rootElement.id(id);

  if (manualSuspend) {
    anychart.performance.start('Stage resume');
    stage.resume();
    anychart.performance.end('Stage resume');
  }

  if (stage)
    stage.getCharts()[id] = this;

  this.dispatchDetachedEvent({
    'type': anychart.enums.EventType.CHART_DRAW,
    'chart': this
  });

  if (anychart.DEVELOP) {
    var msg = 'Chart rendering time: ' + anychart.math.round((anychart.performance.relativeNow() - startTime), 4);
    anychart.core.reporting.info(msg);
  }

  if (this.supportsBaseHighlight())
    this.onInteractivitySignal();

  anychart.performance.end('Chart.draw()');
};


/**
 * Starts the rendering of the chart into the container.
 * @param {boolean=} opt_async Whether do draw asynchronously.
 * @return {anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 */
anychart.core.Chart.prototype.draw = function(opt_async) {
  if (opt_async) {
    if (!this.bindedDraw_)
      this.bindedDraw_ = goog.bind(this.draw, this);
    setTimeout(this.bindedDraw_, 0);
  } else
    this.drawInternal();

  return this;
};


/**
 * Extension point do before draw chart content.
 * If total bounds are zero - this method isn't called.
 */
anychart.core.Chart.prototype.beforeDraw = function() {};


/**
 * Extension point do draw chart content.
 * If total bounds are zero - this method isn't called.
 * @param {anychart.math.Rect} bounds Chart content area bounds.
 */
anychart.core.Chart.prototype.drawContent = function(bounds) {};


/**
 * Extension point do draw special chart content.
 * If total bounds are zero - this method isn't called.
 * @param {anychart.math.Rect} bounds Chart plot bounds.
 */
anychart.core.Chart.prototype.specialDraw = function(bounds) {};


/**
 * Flag whether to automatically call chart.draw() on any changes or not.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.Chart)} - Current value or itself for chaining.
 */
anychart.core.Chart.prototype.autoRedraw = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoRedraw_ != opt_value) {
      this.autoRedraw_ = opt_value;
      this.autoRedrawIsSet_ = false;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      if (this.autoRedraw_)
        this.draw();
    }
    return this;
  } else {
    return this.autoRedraw_;
  }
};


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.core.Chart.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.CHART_LABELS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Getter for plot bounds of the chart.
 * @return {anychart.math.Rect}
 */
anychart.core.Chart.prototype.getPlotBounds = function() {
  return this.contentBounds;
};


/**
 * Convert coordinates relative local container (plot or data) to global coordinates relative global document.
 * @param {number} xCoord .
 * @param {number} yCoord .
 * @return {Object.<string, number>} .
 */
anychart.core.Chart.prototype.localToGlobal = function(xCoord, yCoord) {
  var result = {
    'x': xCoord,
    'y': yCoord
  };
  if (this.container() && this.container().getStage()) {
    var containerPosition = this.container().getStage().getClientPosition();
    result['x'] += containerPosition.x;
    result['y'] += containerPosition.y;
  }
  return result;
};


/**
 * Convert global coordinates relative global document to coordinates relative local container (plot or data).
 * @param {number} xCoord .
 * @param {number} yCoord .
 * @return {Object.<string, number>} .
 */
anychart.core.Chart.prototype.globalToLocal = function(xCoord, yCoord) {
  var result = {
    'x': xCoord,
    'y': yCoord
  };
  if (this.container() && this.container().getStage()) {
    var containerPosition = this.container().getStage().getClientPosition();
    result['x'] -= containerPosition.x;
    result['y'] -= containerPosition.y;
  }
  return result;
};


/** @inheritDoc */
anychart.core.Chart.prototype.remove = function() {
  if (this.rootElement) this.rootElement.parent(null);
};


//todo(Anton Saukh): refactor this mess!
/**
 * Internal invalidation event handler, redraw chart on all invalidate events.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.invalidateHandler_ = function(event) {
  anychart.globalLock.onUnlock(this.draw, this);
};


//endregion
//region --- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Chart.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectRectangleMarqueeFill',
      anychart.core.settings.fillNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectRectangleMarqueeStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG_DEPRECATED,
      'selectRectangleMarqueeFill',
      anychart.core.settings.fillNormalizer,
      'selectMarqueeFill');

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG_DEPRECATED,
      'selectRectangleMarqueeStroke',
      anychart.core.settings.strokeNormalizer,
      'selectMarqueeStroke');

  return map;
})();
anychart.core.settings.populate(anychart.core.Chart, anychart.core.Chart.PROPERTY_DESCRIPTORS);


//endregion
//region --- Ser/Deser/Json/XML/Dispose
//------------------------------------------------------------------------------
//
//  Ser/Deser/Json/XML/Dispose
//
//------------------------------------------------------------------------------
/**
 * Return chart configuration as JSON object or string.
 * Note for documentation writers!: Google compiler thinks that "Object" has "toJSON" method that must accept string and return *.
 * To avoid this we have to put in the "wrong" params.
 * In external documentation parameter must be boolean, and method must return Object|string.
 * For the moment we have no way around this "nice feature" of the compiler.
 * @param {boolean=} opt_stringify Return as JSON as string.
 *  Note: stringifying ignores this flag.
 * @return {*} Chart JSON.
 */
anychart.core.Chart.prototype.toJson = function(opt_stringify) {
  var data = this.isDisposed() ? {} : this.serialize();
  // todo: Hack for cases when getFullTheme was called and demerge is necessary
  if (goog.isDef(anychart.getThemes()[0]['chart']['background']['fill']))
    data = /** @type {!Object} */(anychart.themes.merging.demerge(data, this.getDefaultThemeObj())) || {};
  return opt_stringify ? goog.json.hybrid.stringify(data) : data;
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @return {string|Node} Chart configuration.
 */
anychart.core.Chart.prototype.toXml = function(opt_asXmlNode) {
  return anychart.utils.json2xml(/** @type {Object} */(this.toJson(false)), '', opt_asXmlNode);
};


/**
 * Returns chart type for JSON.
 * @return {string}
 * @private
 */
anychart.core.Chart.prototype.getNormalizedType_ = function() {
  var type = this.getType();
  switch (type.toLowerCase()) {
    case 'map':
      return 'map';
    case 'gantt-resource':
    case 'gantt-project':
      return 'gantt';
    case 'circular-gauge':
    case 'linear-gauge':
    case 'thermometer':
    case 'tank':
    case 'led':
      return 'gauge';
    default:
      return 'chart';
  }
};


/**
 * Returns default theme object.
 * @return {Object}
 */
anychart.core.Chart.prototype.getDefaultThemeObj = function() {
  var result = {};
  result[this.getNormalizedType_()] = anychart.getFullTheme(this.getType());
  return result;
};


/** @inheritDoc */
anychart.core.Chart.prototype.serialize = function() {
  var json = anychart.core.Chart.base(this, 'serialize');

  json['type'] = this.getType();

  if (this.getCreated('title'))
    json['title'] = this.title().serialize();

  if (this.getCreated('background'))
    json['background'] = this.background().serialize();

  if (this.getCreated('tooltip'))
    json['tooltip'] = this.tooltip().serialize();

  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();

  if (this.getCreated('a11y'))
    json['a11y'] = this.a11y().serialize();

  if (goog.isDef(this.autoRedraw_))
    json['autoRedraw'] = this.autoRedraw_;
  var labels = [];
  for (var i = 0; i < this.chartLabels_.length; i++) {
    if (this.chartLabels_[i])
      labels.push(this.chartLabels_[i].serialize());
  }
  if (labels.length > 0)
    json['chartLabels'] = labels;
  // from VisualBaseWithBounds
  json['bounds'] = this.bounds().serialize();

  if (this.getCreated('animation'))
    json['animation'] = this.animation().serialize();

  if(this.noData().getCreated('label'))
    json['noDataLabel'] = this.noData().label().serialize();

  if (this.contextMenu_) {
    json['contextMenu'] = this.contextMenu()['serialize']();
  }

  json['credits'] = this.credits().serialize();

  var exports;
  if (this.exports_)
    exports = this.exports().serialize();
  if (exports && !goog.object.isEmpty(exports))
    json['exports'] = exports;

  anychart.core.settings.serialize(this, anychart.core.Chart.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.Chart.prototype.setupByJSON = function(config, opt_default) {
  //Set this before another manipulations.
  if ('autoRedraw' in config)
    this.autoRedraw_ = config['autoRedraw']; //don't use method this.autoRedraw() to avoid calling draw().

  anychart.core.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('title' in config)
    this.title().setupInternal(!!opt_default, config['title']);

  if ('background' in config)
    this.background().setupInternal(!!opt_default, config['background']);

  if ('padding' in config)
    this.padding().setupInternal(!!opt_default, config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);

  var labels = config['chartLabels'];
  if (goog.isArray(labels)) {
    for (var i = 0; i < labels.length; i++)
      this.label(i, labels[i]);
  }

  // from VisualBase
  if (goog.isString(config['container']))
    this.container(config['container']);

  // from VisualBaseWithBounds
  this.bounds(config['bounds']);
  this.left(config['left']);
  this.top(config['top']);
  this.width(config['width']);
  this.height(config['height']);
  this.right(config['right']);
  this.bottom(config['bottom']);
  this.animation(config['animation']);

  if ('noDataLabel' in config)
    this.noData().label().setupInternal(!!opt_default, config['noDataLabel']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);

  if ('a11y' in config)
    this.a11y().setupInternal(!!opt_default, config['a11y']);

  if (goog.isDef(config['contextMenu']))
    this.contextMenu(config['contextMenu']);

  if ('credits' in config)
    this.credits(config['credits']);

  if ('exports' in config)
    this.exports(config['exports']);

  anychart.core.settings.deserialize(this, anychart.core.Chart.PROPERTY_DESCRIPTORS, config);
};


/**
 * Setup chart state settings after chart has been instantiated
 */
anychart.core.Chart.prototype.setupStateSettings = goog.nullFunction();


/** @inheritDoc */
anychart.core.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.animation_,
      this.a11y_,
      this.tooltip_,
      this.noDataSettings_,
      this.interactivity_,
      this.background_,
      this.tooltip_,
      this.margin_,
      this.padding_,
      this.title_,
      this.chartLabels_,
      this.contextMenu_,
      this.credits_,
      this.rootElement);

  this.animation_ = null;
  this.a11y_ = null;
  this.tooltip_ = null;
  this.noDataSettings_ = null;
  this.interactivity_ = null;
  this.background_ = null;
  this.tooltip_ = null;
  this.margin_ = null;
  this.padding_ = null;
  this.title_ = null;
  this.chartLabels_.length = 0;
  this.contextMenu_ = null;
  this.credits_ = null;
  this.rootElement = null;

  anychart.core.Chart.base(this, 'disposeInternal');

  if (this.id_)
    anychart.untrackChart(this, /** @type {string} */(this.id_));
};


//endregion
//region --- Interactivity
//------------------------------------------------------------------------------
//
//  Interactivity
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.Chart.prototype.handleMouseEvent = function(event) {
  var series;

  var tag = anychart.utils.extractTag(event['domTarget']);
  var index;

  if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory) || anychart.utils.instanceOf(event['target'], anychart.core.ui.MarkersFactory)) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend)) {
    if (tag) {
      series = tag.series;
      index = tag.index;
    }
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    if (!goog.isDef(event['pointIndex']))
      event['pointIndex'] = goog.isArray(index) ? index[index.length - 1] : index;

    var evt = series.makePointEvent(event);
    if (evt)
      series.dispatchEvent(evt);
  }
};


/** @inheritDoc */
anychart.core.Chart.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.core.Chart.base(this, 'makeBrowserEvent', e);
  var tag = anychart.utils.extractTag(res['relatedDomTarget']);

  var series = tag && tag.series;
  if (series && !series.isDisposed() && series.enabled()) {
    return series.makeBrowserEvent(e);
  }
  return res;
};


/**
 * Creates series status objects for event.
 * @param {Array.<Object>} seriesStatus .
 * @param {boolean=} opt_empty .
 * @return {Array.<Object>}
 * @protected
 */
anychart.core.Chart.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
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
      'series': status.series,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/**
 * Makes current point for events.
 * @param {Object} seriesStatus .
 * @param {string} event .
 * @param {boolean=} opt_empty .
 * @return {Object}
 * @protected
 */
anychart.core.Chart.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var series, pointIndex, pointStatus, minDistance = Infinity;
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    if (status.nearestPointToCursor) {
      var nearestPoint = status.nearestPointToCursor;
      if (minDistance > nearestPoint.distance || !series) {
        series = status.series;
        pointIndex = nearestPoint.index;
        pointStatus = goog.array.contains(status.points, nearestPoint.index);
        minDistance = nearestPoint.distance;
      }
    }
  }
  var currentPoint = {
    'index': pointIndex,
    'series': series
  };

  currentPoint[event] = opt_empty ? !pointStatus : pointStatus;

  return currentPoint;
};


/**
 * This method also has a side effect - it patches the original source event to maintain seriesStatus support for
 * browser events.
 * @param {string} type Type of the interactivity point event.
 * @param {Object} event Event object.
 * @param {Array.<Object>} seriesStatus Array of series statuses.
 * @param {boolean=} opt_empty .
 * @param {boolean=} opt_forbidTooltip
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.Chart.prototype.makeInteractivityPointEvent = function(type, event, seriesStatus, opt_empty, opt_forbidTooltip) {
  var currentPoint = this.makeCurrentPoint(seriesStatus, type, opt_empty);
  var wrappedPoints = [];
  /** @type {anychart.core.series.Base} */
  var series;
  if (!opt_empty) {
    for (var i = 0; i < seriesStatus.length; i++) {
      var status = seriesStatus[i];
      series = status.series;
      for (var j = 0; j < status.points.length; j++)
        wrappedPoints.push(series.getPoint(status.points[j]));
    }
  }
  series = currentPoint['series'];
  var res = {
    'type': (type == 'hovered') ? anychart.enums.EventType.POINTS_HOVER : anychart.enums.EventType.POINTS_SELECT,
    'seriesStatus': this.createEventSeriesStatus(seriesStatus, opt_empty),
    'currentPoint': currentPoint,
    'actualTarget': event['target'],
    'target': this,
    'originalEvent': event,
    'point': series.getPoint(currentPoint['index']),
    'points': wrappedPoints
  };
  if (opt_forbidTooltip)
    res.forbidTooltip = true;
  return res;
};


/**
 * Gets chart point by index.
 * @param {number} index Point index.
 * @return {anychart.core.Point} Chart point.
 */
anychart.core.Chart.prototype.getPoint = goog.abstractMethod;


/**
 * Returns points by event.
 * @param {anychart.core.MouseEvent} event
 * @return {?Array.<{
 *    series: (anychart.core.series.Base|anychart.linearGaugeModule.pointers.Base|anychart.circularGaugeModule.pointers.Base),
 *    points: Array.<number>,
 *    lastPoint: (number|undefined),
 *    nearestPointToCursor: (Object.<number>|undefined)
 * }>}
 */
anychart.core.Chart.prototype.getSeriesStatus = goog.abstractMethod;


/**
 * Some action on mouse over and move.
 * @param {Array.<number>|number} index Point index or indexes.
 * @param {anychart.core.series.Base} series Series.
 */
anychart.core.Chart.prototype.doAdditionActionsOnMouseOverAndMove = goog.nullFunction;


/**
 * Some action on mouse out.
 */
anychart.core.Chart.prototype.doAdditionActionsOnMouseOut = goog.nullFunction;


/**
 * Handler for mouseMove and mouseOver events.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseOverAndMove = function(event) {
  var series, i, j, len;
  var interactivity = this.getCreated('interactivity', true, this.interactivity);

  var tag = anychart.utils.extractTag(event['domTarget']);
  var index, parent;
  var forbidTooltip = false;
  var isTargetLegendOrColorRange = anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend) || this.checkIfColorRange(event['target']);

  if (isTargetLegendOrColorRange) {
    if (goog.isDef(tag)) {
      if (goog.isNumber(tag)) {
        tag = event['target'].getParentEventTarget();
      }
      if (tag.points_) {
        series = tag.points_.series;
        index = tag.points_.points;
        if (goog.isArray(index) && !index.length) index = NaN;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
      forbidTooltip = true;
    }
  } else if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory)
      || anychart.utils.instanceOf(event['target'], anychart.core.ui.MarkersFactory)
      || anychart.utils.instanceOf(event['target'], anychart.core.ui.Tooltip)) {
    parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if ((event['target'].getParentEventTarget && anychart.utils.instanceOf(event['target'].getParentEventTarget(), anychart.core.ui.Tooltip))) {
    parent = event['target'].getParentEventTarget().getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag && tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);

    if (goog.isDefAndNotNull(evt) && goog.isNumber(evt['pointIndex']) && !isNaN(evt['pointIndex']))
      index = evt['pointIndex'];
    if (evt && ((anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget'])) || series.dispatchEvent(evt))) {
      if (interactivity.getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {

        var whetherNeedHoverIndex = goog.isArray(index) && !goog.array.every(index, function(el) {
              return series.state.hasPointStateByPointIndex(anychart.PointState.HOVER, el);
            }, this);

        if (whetherNeedHoverIndex || (!series.state.hasPointStateByPointIndex(anychart.PointState.HOVER, index) && !isNaN(index))) {
          if (goog.isFunction(series.hoverPoint))
            series.hoverPoint(/** @type {number} */ (index), event);

          this.doAdditionActionsOnMouseOverAndMove(/** @type {number|Array.<number>} */(index), /** @type {!anychart.core.series.Base} */(series));

          var alreadyHoveredPoints = series.state.getIndexByPointState(anychart.PointState.HOVER);
          var eventSeriesStatus = [];
          if (alreadyHoveredPoints.length)
            eventSeriesStatus.push({
              series: series,
              points: alreadyHoveredPoints,
              nearestPointToCursor: {index: (goog.isArray(index) ? index[0] : index), distance: 0}
            });

          if (eventSeriesStatus.length) {
            series.getIterator().select(eventSeriesStatus[0].nearestPointToCursor.index);
            this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, eventSeriesStatus, false, forbidTooltip));
            this.prevHoverSeriesStatus = eventSeriesStatus.length ? eventSeriesStatus : null;
          }
        }
      }
    }
  } else {
    if (this.prevHoverSeriesStatus) {
      this.unhover();
      this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true));
      this.prevHoverSeriesStatus = null;
    }
  }

  if (interactivity.getOption('hoverMode') != anychart.enums.HoverMode.SINGLE) {
    var seriesStatus = this.getSeriesStatus(event);
    var dispatchEvent = false;

    if (seriesStatus && seriesStatus.length) {
      series = this.getAllSeries();
      for (i = 0; i < series.length; i++) {
        var contains = false;
        for (j = 0; j < seriesStatus.length; j++) {
          contains = contains || series[i] == seriesStatus[j].series;
        }
        if (!contains && series[i].state.getIndexByPointState(anychart.PointState.HOVER).length) {
          seriesStatus.push({
            series: series[i],
            points: []
          });
          series[i].unhover();
          dispatchEvent = true;
        }
      }

      for (i = 0, len = seriesStatus.length; i < len; i++) {
        var seriesStatus_ = seriesStatus[i];
        series = seriesStatus_.series;
        var points = seriesStatus_.points;

        var hoveredPoints = series.state.getIndexByPointState(anychart.PointState.HOVER);
        dispatchEvent = dispatchEvent || !goog.array.equals(points, hoveredPoints);
        if (!series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.HOVER)) {
          series.hoverPoint(seriesStatus_.points);
        }
      }
      if (dispatchEvent) {
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, seriesStatus, false, forbidTooltip));
        this.prevHoverSeriesStatus = seriesStatus.length ? seriesStatus : null;
      }
    } else {
      if (!(anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend))) {
        this.unhover();
        if (this.prevHoverSeriesStatus)
          this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true));
        this.prevHoverSeriesStatus = null;
      }
    }
  }
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseOut = function(event) {
  var interactvity = this.getCreated('interactivity', true, this.interactivity);
  var hoverMode = interactvity.getOption('hoverMode');

  var tag = anychart.utils.extractTag(event['domTarget']);
  var forbidTooltip = false;

  var series, index;
  if (anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory) || anychart.utils.instanceOf(event['target'], anychart.core.ui.MarkersFactory)) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend) || this.checkIfColorRange(event['target'])) {
    if (tag) {
      if (tag.points_) {
        series = tag.points_.series;
        index = tag.points_.points;
        if (goog.isArray(index) && !index.length) index = NaN;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
    }
    forbidTooltip = true;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() &&
      goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt) {
      var prevTag = anychart.utils.extractTag(event['relatedDomTarget']);
      var prevIndex = anychart.utils.toNumber(goog.isObject(prevTag) ? prevTag.index : prevTag);

      var ifParent = anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget']);
      var isParentTooltip = acgraph.type() == acgraph.StageType.VML && series.tooltip && anychart.utils.checkIfParent(series.tooltip(), event['relatedTarget']);

      if ((!ifParent || (prevIndex != index)) && series.dispatchEvent(evt) && !isParentTooltip) {
        if (hoverMode == anychart.enums.HoverMode.SINGLE && (!isNaN(index) || goog.isArray(index))) {
          series.unhover();
          this.doAdditionActionsOnMouseOut();
          this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, [{
            series: series,
            points: [],
            nearestPointToCursor: {index: (goog.isArray(index) ? index[0] : index), distance: 0}
          }], false, forbidTooltip));
        }
      }
    }
  }

  if (hoverMode != anychart.enums.HoverMode.SINGLE) {
    if (!anychart.utils.checkIfParent(this, event['relatedTarget'])) {
      this.unhover();
      this.doAdditionActionsOnMouseOut();
      if (this.prevHoverSeriesStatus)
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true, forbidTooltip));
      this.prevHoverSeriesStatus = null;
    }
  }

};


/**
 * Checks if the target is a color range.
 * @param {*} target
 * @return {boolean}
 */
anychart.core.Chart.prototype.checkIfColorRange = function(target) {
  return false;
};


/**
 * Handler for mouseClick event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseDown = function(event) {
  this.onMouseDown(event);
};


/**
 * Logic for mouse down. It needs for inherited classes.
 * @protected
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.onMouseDown = function(event) {
  if (this.preventMouseDownInteractivity)
    return;
  var interactivity = this.getCreated('interactivity', true, this.interactivity);

  var seriesStatus, eventSeriesStatus, allSeries, alreadySelectedPoints, i;
  var controlKeyPressed = event.ctrlKey || event.metaKey;
  var multiSelectOnClick = /** @type {boolean} */(interactivity.getOption('multiSelectOnClick'));
  var multiSelectKeyPressed = controlKeyPressed || event.shiftKey || multiSelectOnClick;
  var clickWithControlOnSelectedSeries, equalsSelectedPoints;

  var tag = anychart.utils.extractTag(event['domTarget']);

  var isColorRange = this.checkIfColorRange(event['target']);
  var isLegend = anychart.utils.instanceOf(event['target'], anychart.core.ui.Legend);
  var isLabelsFactory = anychart.utils.instanceOf(event['target'], anychart.core.ui.LabelsFactory);
  var isMarkersFactory = anychart.utils.instanceOf(event['target'], anychart.core.ui.MarkersFactory);
  var isTargetLegendOrColorRange = isLegend || isColorRange;

  var series, s, index, points;
  if (isTargetLegendOrColorRange) {
    if (tag) {
      points = tag.points_ || tag.points;
      if (points) {
        series = points.series;
        index = points.points;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
    }
  } else if (isLabelsFactory || isMarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else {
    series = tag && tag.series;
    index = tag && goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt && ((anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget'])) || series.dispatchEvent(evt))) {
      if (!isTargetLegendOrColorRange)
        index = evt['pointIndex'];
      if (interactivity.getOption('hoverMode') == anychart.enums.HoverMode.SINGLE) {
        if (interactivity.getOption('selectionMode') == anychart.enums.SelectionMode.NONE || series.selectionMode() == anychart.enums.SelectionMode.NONE)
          return;

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
        equalsSelectedPoints = alreadySelectedPoints.length == 1 && alreadySelectedPoints[0] == index;

        if (!multiSelectKeyPressed && equalsSelectedPoints)
          return;

        clickWithControlOnSelectedSeries = multiSelectKeyPressed && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
        var unselect = !multiSelectOnClick && (clickWithControlOnSelectedSeries || !multiSelectKeyPressed ||
            (multiSelectKeyPressed && interactivity.getOption('selectionMode') != anychart.enums.SelectionMode.MULTI_SELECT));

        if (unselect) {
          this.unselect();
          if (this.prevSelectSeriesStatus)
            this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
        } else if (series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
          if (this.prevSelectSeriesStatus)
            this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
          series.unselect();
          if (goog.isArray(index))
            index = index[index.length - 1];
        }

        if (goog.isFunction(series.selectPoint))
          series.selectPoint(/** @type {number} */ (index), event);

        allSeries = this.getAllSeries();
        eventSeriesStatus = [];
        for (i = 0; i < allSeries.length; i++) {
          s = allSeries[i];
          if (!s) continue;
          alreadySelectedPoints = s.state.getIndexByPointState(anychart.PointState.SELECT);
          if (alreadySelectedPoints.length) {
            eventSeriesStatus.push({
              series: s,
              points: alreadySelectedPoints,
              nearestPointToCursor: {index: index, distance: 0}
            });
          }
        }

        if (!eventSeriesStatus.length) {
          eventSeriesStatus.push({
            series: series,
            points: [],
            nearestPointToCursor: {index: index, distance: 0}
          });
        }

        this.dispatchEvent(this.makeInteractivityPointEvent('selected', evt, eventSeriesStatus));

        if (equalsSelectedPoints)
          this.prevSelectSeriesStatus = null;
        else
          this.prevSelectSeriesStatus = eventSeriesStatus;
      }
    }
  } else if (interactivity.getOption('hoverMode') == anychart.enums.HoverMode.SINGLE && interactivity.getOption('unselectOnClickOutOfPoint')) {
    if (!isTargetLegendOrColorRange)
      this.unselect();

    if (this.prevSelectSeriesStatus)
      this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
    this.prevSelectSeriesStatus = null;
  }

  if (interactivity.getOption('hoverMode') != anychart.enums.HoverMode.SINGLE) {
    if (interactivity.getOption('selectionMode') == anychart.enums.SelectionMode.NONE)
      return;

    var j, len;
    seriesStatus = this.getSeriesStatus(event);

    if (seriesStatus && seriesStatus.length) {
      var dispatchEvent = false;
      eventSeriesStatus = [];
      var contains, seriesStatus_;

      if (interactivity.getOption('selectionMode') == anychart.enums.SelectionMode.SINGLE_SELECT) {
        var nearest;
        for (i = 0, len = seriesStatus.length; i < len; i++) {
          seriesStatus_ = seriesStatus[i];
          series = seriesStatus_.series;

          if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
            continue;

          if (!nearest) nearest = seriesStatus_;
          if (nearest.nearestPointToCursor.distance > seriesStatus_.nearestPointToCursor.distance) {
            nearest = seriesStatus_;
          }
        }

        series = nearest.series;

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
        equalsSelectedPoints = alreadySelectedPoints.length == 1 && alreadySelectedPoints[0] == nearest.nearestPointToCursor.index;

        dispatchEvent = !equalsSelectedPoints || (equalsSelectedPoints && multiSelectKeyPressed);

        clickWithControlOnSelectedSeries = multiSelectKeyPressed && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
        if ((clickWithControlOnSelectedSeries || !multiSelectKeyPressed) && !equalsSelectedPoints) {
          series.unselect();
        }
        series.selectPoint(/** @type {number} */ (nearest.nearestPointToCursor.index), event);

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);

        if (alreadySelectedPoints.length) {
          eventSeriesStatus.push({
            series: series,
            points: [nearest.nearestPointToCursor.index],
            nearestPointToCursor: nearest.nearestPointToCursor
          });


          allSeries = this.getAllSeries();
          for (i = 0; i < allSeries.length; i++) {
            series = allSeries[i];
            if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
              continue;

            contains = series == eventSeriesStatus[0].series;
            if (!contains) {
              series.unselect();
            }
          }
        } else {
          eventSeriesStatus.push({
            series: series,
            points: alreadySelectedPoints,
            nearestPointToCursor: seriesStatus_.nearestPointToCursor
          });
        }
      } else {
        var emptySeries = [];
        if (!multiSelectKeyPressed) {
          allSeries = this.getAllSeries();

          for (i = 0; i < allSeries.length; i++) {
            s = allSeries[i];
            if (s.selectionMode() == anychart.enums.SelectionMode.NONE)
              continue;

            contains = false;
            for (j = 0; j < seriesStatus.length; j++) {
              contains = contains || s == seriesStatus[j].series;
            }
            if (!contains && s.state.getIndexByPointState(anychart.PointState.SELECT).length) {
              emptySeries.push({series: s, points: []});
              s.unselect();
              dispatchEvent = true;
            }
          }
        }

        for (i = 0, len = seriesStatus.length; i < len; i++) {
          seriesStatus_ = seriesStatus[i];
          series = seriesStatus_.series;

          if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
            continue;

          if (series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
            points = [seriesStatus_.nearestPointToCursor.index];
          } else {
            points = seriesStatus_.points;
          }

          alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
          if (event.shiftKey) {
            contains = true;
            for (j = 0; j < points.length; j++) {
              contains = contains && goog.array.contains(alreadySelectedPoints, points[j]);
            }
            equalsSelectedPoints = contains;
          } else if (!controlKeyPressed) {
            equalsSelectedPoints = goog.array.equals(points, alreadySelectedPoints);
          }
          dispatchEvent = dispatchEvent || !equalsSelectedPoints;

          if (!equalsSelectedPoints) {
            clickWithControlOnSelectedSeries = multiSelectKeyPressed && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
            if (clickWithControlOnSelectedSeries || !multiSelectKeyPressed || series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
              series.unselect();
            }
            series.selectPoint(points, event);
          }
          alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
          if (alreadySelectedPoints.length) {
            eventSeriesStatus.push({
              series: series,
              points: alreadySelectedPoints,
              nearestPointToCursor: seriesStatus_.nearestPointToCursor
            });
          } else {
            emptySeries.push({
              series: series,
              points: alreadySelectedPoints,
              nearestPointToCursor: seriesStatus_.nearestPointToCursor
            });
          }
        }

        for (i = 0; i < emptySeries.length; i++) {
          eventSeriesStatus.push(emptySeries[i]);
        }
      }

      if (dispatchEvent) {
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, eventSeriesStatus));
        this.prevSelectSeriesStatus = eventSeriesStatus.length ? eventSeriesStatus : null;
      }
    } else {
      if (!isTargetLegendOrColorRange)
        this.unselect();

      if (this.prevSelectSeriesStatus)
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
      this.prevSelectSeriesStatus = null;
    }
  }
};


/**
 * Deselects all series. It doesn't matter what series it belongs to.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 */
anychart.core.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  var i, len;
  var series = this.getAllSeries();
  for (i = 0, len = series.length; i < len; i++) {
    if (series[i]) series[i].unselect();
  }
};


/**
 * Make unhover to all series. It doesn't matter what series it belongs to.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 */
anychart.core.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  var i, len;
  var series = this.getAllSeries();
  for (i = 0, len = series.length; i < len; i++) {
    if (series[i]) series[i].unhover();
  }
};


/**
 * Enables or disables mouse events processing by creating overlay rectangle.
 * @param {boolean} ignore Set 'true' to ignore
 */
anychart.core.Chart.prototype.ignoreMouseEvents = function(ignore) {
  if (ignore) {
    if (!this.overlayRect_) {
      this.overlayRect_ = acgraph.rect(0, 0, 0, 0);
      this.overlayRect_.zIndex(10000);
    }
    this.overlayRect_.disablePointerEvents(false);
    this.overlayRect_.cursor(acgraph.vector.Cursor.WAIT);
    this.overlayRect_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.overlayRect_.stroke(null);
    this.overlayRect_.setBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));
    this.overlayRect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
  } else if (this.overlayRect_) {
    this.overlayRect_.remove();
  }
};


/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|anychart.enums.HoverMode)=} opt_value Settings object or boolean value like enabled state.
 * @return {anychart.core.utils.Interactivity|anychart.core.Chart}
 */
anychart.core.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = this.createInteractivitySettings();
    this.interactivity_.listenSignals(this.onInteractivitySignal, this);

    this.setupCreated('interactivity', this.interactivity_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value))
      this.interactivity_.setup(opt_value);
    else
      this.interactivity_['hoverMode'](opt_value);
    return this;
  }
  return this.interactivity_;
};


/**
 * Creates an instance of interactivity settings object.
 * @return {anychart.core.utils.Interactivity}
 * @protected
 */
anychart.core.Chart.prototype.createInteractivitySettings = function() {
  return new anychart.core.utils.Interactivity(this);
};


/**
 * Animation enabled change handler.
 * @protected
 */
anychart.core.Chart.prototype.onInteractivitySignal = function() {
  var series = this.getAllSeries();
  for (var i = series.length; i--;) {
    if (series[i]) {
      var interactivity = this.getCreated('interactivity', true, this.interactivity);
      series[i].hoverMode(/** @type {anychart.enums.HoverMode} */(interactivity.getOption('hoverMode')));
    }
  }
};


//endregion
//region --- Interactive rect drawing
//------------------------------------------------------------------------------
//
//  Interactive rect drawing
//
//------------------------------------------------------------------------------
/**
 * @param {?function(number,number,number,number,number,acgraph.events.BrowserEvent):(boolean|undefined)=} opt_onStart
 * @param {?function(number,number,number,number,number,acgraph.events.BrowserEvent):(boolean|undefined)=} opt_onChange
 * @param {?function(number,number,number,number,number,acgraph.events.BrowserEvent):(boolean|undefined)=} opt_onFinish
 * @param {?(anychart.math.Rect|Array.<?anychart.math.Rect>)=} opt_bounds
 * @param {boolean=} opt_blockPropagation
 * @param {acgraph.vector.Cursor=} opt_cursor
 * @param {boolean=} opt_repeat
 * @param {acgraph.vector.Stroke=} opt_stroke
 * @param {acgraph.vector.Fill=} opt_fill
 * @param {boolean=} opt_fullHeight
 * @return {boolean}
 */
anychart.core.Chart.prototype.startIRDrawing = function(opt_onStart, opt_onChange, opt_onFinish, opt_bounds, opt_blockPropagation, opt_cursor, opt_repeat, opt_stroke, opt_fill, opt_fullHeight) {
  if (!this.rootElement)
    return false;
  this.finishIRDrawing();
  this.irDrawingFullHeight_ = !!opt_fullHeight;
  this.irDrawingActive_ = false;
  this.irDrawingBounds_ = opt_bounds ? goog.array.concat(opt_bounds) : [this.getPlotBounds()];
  this.irBlocksPropagation_ = opt_blockPropagation;
  this.irOnStart_ = opt_onStart;
  this.irOnChange_ = opt_onChange;
  this.irOnFinish_ = opt_onFinish;
  this.irRepeat_ = !!opt_repeat;
  if (!this.interactivityRect) {
    this.interactivityRect = acgraph.rect(0, 0, 0, 0);
    this.interactivityRect.zIndex(10001);
    this.interactivityRect.disablePointerEvents(true);
  }
  this.interactivityRect.stroke(opt_stroke || '3 red');
  this.interactivityRect.fill(opt_fill || 'red 0.5');
  var target;
  if (opt_blockPropagation) {
    this.ignoreMouseEvents(true);
    this.overlayRect_.cursor(null);
    target = this.overlayRect_;
  } else {
    target = this.rootElement;
  }
  this.irDrawingTarget_ = target;
  this.irDrawingCursor_ = opt_cursor || null;
  this.irEventHandler_ = new goog.events.EventHandler(this);
  if (this.irDrawingCursor_) {
    this.irEventHandler_.listen(target, acgraph.events.EventType.MOUSEOVER, this.irDrawingMouseHoverHandler_, true);
    this.irEventHandler_.listen(document, acgraph.events.EventType.MOUSEMOVE, this.irDrawingMouseHoverHandler_, true);
    this.irEventHandler_.listen(document, acgraph.events.EventType.TOUCHMOVE, this.irDrawingMouseHoverHandler_, true);
    this.irEventHandler_.listen(target, acgraph.events.EventType.MOUSEOUT, this.irDrawingMouseHoverHandler_, true);
  }
  this.irEventHandler_.listen(target, acgraph.events.EventType.TOUCHSTART, this.irDrawingMouseDownHandler_, true);
  this.irEventHandler_.listen(target, acgraph.events.EventType.MOUSEDOWN, this.irDrawingMouseDownHandler_, true);
  return true;
};


/**
 * Cleanup after IR drawing.
 */
anychart.core.Chart.prototype.finishIRDrawing = function() {
  if (this.irDrawingBounds_) {
    this.irDrawingFullHeight_ = false;
    this.irRepeat_ = false;
    this.irDrawingActive_ = false;
    if (this.irBlocksPropagation_)
      this.ignoreMouseEvents(false);
    this.irBlocksPropagation_ = false;
    this.irOnStart_ = this.irOnChange_ = this.irOnFinish_ = null;
    if (this.interactivityRect) {
      this.interactivityRect.parent(null);
    }
    this.irDrawingCursor_ = null;
    goog.disposeAll(this.irDragger_, this.irEventHandler_);
    this.irDrawingBounds_ = this.irDragger_ = this.irEventHandler_ = null;
    this.irDrawingTarget_.cursor(null);
    this.irDrawingTarget_ = null;
  }
};


/**
 * Checks whether the point is in any interactive rect drawing bounds rect.
 * @param {number} x
 * @param {number} y
 * @return {number} Returns the index of the first rect the point belongs to plus one or zero if no rect contains the point.
 * @private
 */
anychart.core.Chart.prototype.getIRDrawingBoundsIndex_ = function(x, y) {
  if (this.irDrawingBounds_ && this.container()) {
    var cp = this.container().getStage().getClientPosition();
    x -= cp.x;
    y -= cp.y;
    for (var i = 0; i < this.irDrawingBounds_.length; i++) {
      var rect = this.irDrawingBounds_[i];
      if (rect &&
          rect.left < x && x < rect.left + rect.width &&
          rect.top < y && y < rect.top + rect.height) {
        return i + 1;
      }
    }
  }
  return 0;
};


/**
 * Mouse over handler for interactive rect drawing process.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.Chart.prototype.irDrawingMouseHoverHandler_ = function(e) {
  if (this.irDrawingBounds_)
    this.irDrawingTarget_.cursor(
        (this.irDrawingActive_ || this.getIRDrawingBoundsIndex_(e['clientX'], e['clientY'])) ?
            this.irDrawingCursor_ :
            null);
};


/**
 * Mouse down handler for interactive rect drawing process.
 * @param {acgraph.events.BrowserEvent} e
 * @private
 */
anychart.core.Chart.prototype.irDrawingMouseDownHandler_ = function(e) {
  var rect, rectIndex;
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var cp = container.getStage().getClientPosition();
  var startX = e['clientX'] - cp.x;
  var startY = e['clientY'] - cp.y;
  if ((e.type != acgraph.events.EventType.MOUSEDOWN || e.getOriginalEvent().isMouseActionButton()) &&
      (rectIndex = this.getIRDrawingBoundsIndex_(e['clientX'], e['clientY'])) &&
      (!this.irOnStart_ || this.irOnStart_(rectIndex - 1, startX, startY, 0, 0, e) !== false)) {
    this.irDrawingBoundsIndex_ = rectIndex - 1;
    rect = this.irDrawingBounds_[this.irDrawingBoundsIndex_];

    this.irStartX_ = startX;
    this.irStartY_ = startY;
    var irBounds;
    if (this.irDrawingFullHeight_) {
      irBounds = new anychart.math.Rect(this.irStartX_, rect.top, 0, rect.height);
    } else {
      irBounds = new anychart.math.Rect(this.irStartX_, this.irStartY_, 0, 0);
    }
    this.interactivityRect.setBounds(irBounds);
    this.interactivityRect.parent(container);

    if (!this.irDragger_)
      this.irDragger_ = new anychart.core.Chart.IRDragger(this.interactivityRect);
    this.irDragger_.setScrollTarget(anychart.window);

    rect = rect.clone();
    rect.left -= this.irStartX_;
    rect.top -= this.irStartY_;
    this.irDragger_.setLimits(rect);

    this.irEventHandler_.listen(this.irDragger_, goog.fx.Dragger.EventType.DRAG, this.irDrawingDragHandler_);
    this.irEventHandler_.listen(this.irDragger_, goog.fx.Dragger.EventType.END, this.irDrawingDragEndHandler_);

    this.irDrawingActive_ = true;
    this.irDragger_.startDrag(e.getOriginalEvent());
    e.preventDefault();
    e.stopPropagation();
  }
};


/**
 * Drag progress handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.Chart.prototype.irDrawingDragHandler_ = function(e) {
  var irBounds;
  if (this.irDrawingFullHeight_) {
    var rect = this.irDrawingBounds_[this.irDrawingBoundsIndex_];
    irBounds = new anychart.math.Rect(this.irStartX_, rect.top, e.left, rect.height);
  } else {
    irBounds = new anychart.math.Rect(this.irStartX_, this.irStartY_, e.left, e.top);
  }
  this.interactivityRect.setBounds(irBounds);
  if (this.irOnChange_) {
    this.irOnChange_(this.irDrawingBoundsIndex_, this.irStartX_, this.irStartY_, e.left, e.top, new acgraph.events.BrowserEvent(e.browserEvent, this.container().getStage()));
  }
};


/**
 * Drag end handler.
 * @param {goog.fx.DragEvent} e
 * @private
 */
anychart.core.Chart.prototype.irDrawingDragEndHandler_ = function(e) {
  var irBounds;
  if (this.irDrawingFullHeight_) {
    var rect = this.irDrawingBounds_[this.irDrawingBoundsIndex_];
    irBounds = new anychart.math.Rect(this.irStartX_, rect.top, e.left, rect.height);
  } else {
    irBounds = new anychart.math.Rect(this.irStartX_, this.irStartY_, e.left, e.top);
  }
  this.interactivityRect.setBounds(irBounds);
  var repeat = false;
  if (this.irOnFinish_) {
    repeat = this.irOnFinish_(this.irDrawingBoundsIndex_, this.irStartX_, this.irStartY_, e.left, e.top, new acgraph.events.BrowserEvent(e.browserEvent, this.container().getStage())) === false;
  }
  if (repeat || this.irRepeat_) {
    this.interactivityRect.parent(null);
  } else {
    this.finishIRDrawing();
  }
};



/**
 * IR drawing dragger.
 * @param {acgraph.vector.Rect} iRect
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.core.Chart.IRDragger = function(iRect) {
  anychart.core.Chart.IRDragger.base(this, 'constructor', iRect.domElement());

  // we don't need these handlers here
  goog.events.unlisten(
      this.handle,
      [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN],
      this.startDrag, false, this);
};
goog.inherits(anychart.core.Chart.IRDragger, goog.fx.Dragger);


/** @inheritDoc */
anychart.core.Chart.IRDragger.prototype.computeInitialPosition = function() {
  this.deltaX = this.deltaY = 0;
};


/** @inheritDoc */
anychart.core.Chart.IRDragger.prototype.defaultAction = function(x, y) {};


//endregion
//region --- Selection marquee
//------------------------------------------------------------------------------
//
//  Selection marquee
//
//------------------------------------------------------------------------------
/**
 * Starts select marquee drawing.
 * @deprecated since 8.6.0 use chart.startSelectRectangleMarquee() instead. DVF-4300
 * @param {boolean=} opt_repeat
 * @return {anychart.core.Chart}
 */
anychart.core.Chart.prototype.startSelectMarquee = function(opt_repeat) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['chart.startSelectMarquee()', 'chart.startSelectRectangleMarquee()'], true);
  return this.startSelectRectangleMarquee(opt_repeat);
};


/**
 * Starts select marquee drawing.
 * @param {boolean=} opt_repeat
 * @return {anychart.core.Chart}
 */
anychart.core.Chart.prototype.startSelectRectangleMarquee = function(opt_repeat) {
  this.preventMouseDownInteractivity =
      this.startIRDrawing(this.onSelectMarqueeStart, this.onSelectMarqueeChange, this.onSelectMarqueeFinish, this.getSelectMarqueeBounds(),
          false, undefined, opt_repeat, /** @type {acgraph.vector.Stroke} */ (this.getOption('selectRectangleMarqueeStroke')), /** @type {acgraph.vector.Fill} */ (this.getOption('selectRectangleMarqueeFill')));
  return this;
};


/**
 * Returns true if there is a marquee process running.
 * @return {boolean}
 */
anychart.core.Chart.prototype.inMarquee = function() {
  return !!this.irDrawingBounds_;
};


/**
 * Stops current marquee action if any.
 * @return {anychart.core.Chart}
 */
anychart.core.Chart.prototype.cancelMarquee = function() {
  // DVF-4341 Cancel marquee after start breaks select.
  this.preventMouseDownInteractivity = false;

  this.finishIRDrawing();
  return this;
};


/**
 * Returns select marquee bounds.
 * @return {?Array.<?anychart.math.Rect>}
 * @protected
 */
anychart.core.Chart.prototype.getSelectMarqueeBounds = function() {
  return null;
};


/**
 * Creates select marquee event object.
 * @param {string} eventType
 * @param {number} plotIndex
 * @param {number} startX
 * @param {number} startY
 * @param {number} width
 * @param {number} height
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {goog.events.EventLike}
 * @protected
 */
anychart.core.Chart.prototype.createSelectMarqueeEvent = function(eventType, plotIndex, startX, startY, width, height, browserEvent) {
  var cp = this.container().getStage().getClientPosition();
  var left = width < 0 ? startX + width : startX;
  var top = height < 0 ? startY + height : startY;
  return {
    type: eventType, // dispatch expects it to be an obfuscated property
    'offsetX': browserEvent['offsetX'],
    'offsetY': browserEvent['offsetY'],
    'clientX': browserEvent['clientX'],
    'clientY': browserEvent['clientY'],
    'screenX': browserEvent['screenX'],
    'screenY': browserEvent['screenY'],
    'button': browserEvent['button'],
    'actionButton': browserEvent['actionButton'],
    'keyCode': browserEvent['keyCode'],
    'charCode': browserEvent['charCode'],
    'ctrlKey': browserEvent['ctrlKey'],
    'altKey': browserEvent['altKey'],
    'shiftKey': browserEvent['shiftKey'],
    'metaKey': browserEvent['metaKey'],
    'platformModifierKey': browserEvent['platformModifierKey'],
    'clientStartX': startX + cp.x,
    'clientStartY': startY + cp.y,
    'clientLeft': left + cp.x,
    'clientTop': top + cp.y,
    'startX': startX,
    'startY': startY,
    'left': left,
    'top': top,
    'width': Math.abs(width),
    'height': Math.abs(height)
  };
};


/**
 * @param {number} plotIndex
 * @param {number} startX
 * @param {number} startY
 * @param {number} width
 * @param {number} height
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 * @protected
 */
anychart.core.Chart.prototype.onSelectMarqueeStart = function(plotIndex, startX, startY, width, height, browserEvent) {
  return this.dispatchEvent(this.createSelectMarqueeEvent(anychart.enums.EventType.SELECT_MARQUEE_START, plotIndex, startX, startY, width, height, browserEvent));
};


/**
 * @param {number} plotIndex
 * @param {number} startX
 * @param {number} startY
 * @param {number} width
 * @param {number} height
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 * @protected
 */
anychart.core.Chart.prototype.onSelectMarqueeChange = function(plotIndex, startX, startY, width, height, browserEvent) {
  return this.dispatchEvent(this.createSelectMarqueeEvent(anychart.enums.EventType.SELECT_MARQUEE_CHANGE, plotIndex, startX, startY, width, height, browserEvent));
};


/**
 * @param {number} plotIndex
 * @param {number} startX
 * @param {number} startY
 * @param {number} width
 * @param {number} height
 * @param {acgraph.events.BrowserEvent} browserEvent
 * @return {boolean}
 * @protected
 */
anychart.core.Chart.prototype.onSelectMarqueeFinish = function(plotIndex, startX, startY, width, height, browserEvent) {
  var e = this.createSelectMarqueeEvent(anychart.enums.EventType.SELECT_MARQUEE_FINISH, plotIndex, startX, startY, width, height, browserEvent);
  var rv = this.dispatchEvent(e);
  if (rv) {
    this.selectByRect(e);
  }
  this.preventMouseDownInteractivity = false;
  return rv;
};


/**
 * @param {goog.events.EventLike} marqueeFinishEvent
 * @protected
 */
anychart.core.Chart.prototype.selectByRect = function(marqueeFinishEvent) {
};


//endregion
//region --- Full screen
//------------------------------------------------------------------------------
//
//  Full screen
//
//------------------------------------------------------------------------------
/**
 * Getter/Setter for the full screen mode.
 * @param {boolean=} opt_value
 * @return {anychart.core.Chart|boolean}
 */
anychart.core.Chart.prototype.fullScreen = function(opt_value) {
  var container = this.container();
  var stage = container ? container.getStage() : null;
  if (goog.isDef(opt_value)) {
    if (stage)
      stage.fullScreen(opt_value);
    return this;
  }
  return stage ? /** @type {boolean} */(stage.fullScreen()) : false;
};


/**
 * Tester for the full screen support.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isFullScreenAvailable = function() {
  var container = this.container();
  var stage = container ? container.getStage() : null;
  return stage ? /** @type {boolean} */(stage.isFullScreenAvailable()) : false;
};


//endregion
//region --- Exporting/Sharing/Data serialization
//------------------------------------------------------------------------------
//
//  Exporting/Sharing/Data serialization
//
//------------------------------------------------------------------------------
/**
 * Chart exports settings.
 * @param {Object=} opt_value .
 * @return {anychart.core.Chart|anychart.exportsModule.Exports}
 */
anychart.core.Chart.prototype.exports = function(opt_value) {
  var exports = goog.global['anychart']['exports'];
  if (exports) {
    if (!this.exports_)
      this.exports_ = exports.create();
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }

  if (goog.isDef(opt_value) && this.exports_) {
    this.exports_.setupByJSON(opt_value);
    return this;
  }

  return this.exports_;
};


/**
 * Returns an array of objects that contain data.
 * @return {Array.<{data: function():anychart.data.IDataSource}>}
 */
anychart.core.Chart.prototype.getDataHolders = function() {
  return /** @type {Array.<{data: function():anychart.data.IDataSource}>} */(this.getAllSeries());
};


/**
 * @return {Array.<anychart.data.IDataSource>}
 */
anychart.core.Chart.prototype.getRawCsvDataSources = function() {
  var res = goog.array.concat.apply(null, goog.array.map(
      /** @type {Array} */(this.getDataHolders()),
      function(item) {
        return item.data().getDataSets();
      }));
  goog.array.removeDuplicates(res, res, anychart.utils.hash);
  return res;
};


/**
 * @param {Array} targetCsvRow
 * @param {*} dataRow
 * @param {Object} headers
 * @protected
 */
anychart.core.Chart.prototype.populateRawCsvRow = function(targetCsvRow, dataRow, headers) {
  var column;
  if (goog.isArray(dataRow)) {
    for (column = 0; column < dataRow.length; column++)
      populate(targetCsvRow, dataRow[column], headers[column]);
  } else if (goog.isObject(dataRow)) {
    for (column in dataRow)
      populate(targetCsvRow, dataRow[column], headers[column]);
  } else {
    populate(targetCsvRow, dataRow, headers['value']);
  }

  function populate(resultRow, val, index) {
    resultRow[index] = goog.isObject(val) ? goog.json.serialize(val) : val;
  }
};


/**
 * Gets data for RAW toCsv mode.
 * @return {{headers: Array.<string>, data: Array.<Array.<*>>}}
 * @protected
 */
anychart.core.Chart.prototype.getRawCsvData = function() {
  var dataSources = this.getRawCsvDataSources();

  var headers = {};
  var headersLength = 0;
  var needsDataSourceNumber = dataSources.length > 1;
  if (needsDataSourceNumber) {
    headers['#'] = headersLength++;
  }
  var i;
  for (i = 0; i < dataSources.length; i++) {
    headersLength = dataSources[i].populateObjWithKnownFields(headers, headersLength);
  }

  var csvHeaders = [];
  for (var header in headers)
    csvHeaders[headers[header]] = header;

  var csvData = [];
  for (i = 0; i < dataSources.length; i++) {
    var dataSource = dataSources[i];
    for (var j = 0, len = dataSource.getRowsCount(); j < len; j++) {
      var csvRow = new Array(headersLength);
      this.populateRawCsvRow(csvRow, dataSource.getRow(j), headers);

      if (needsDataSourceNumber)
        csvRow[0] = i;
      csvData.push(csvRow);
    }
  }
  return {headers: csvHeaders, data: csvData};
};


/**
 * @param {anychart.enums.ChartDataExportMode} mode
 * @param {*} series
 * @param {*} x
 * @return {boolean}
 * @protected
 */
anychart.core.Chart.prototype.shouldAddCsvRow = function(mode, series, x) {
  return true;
};


/**
 * @return {Array.<string>}
 * @protected
 */
anychart.core.Chart.prototype.getCsvGrouperColumn = function() {
  return [];
};


/**
 * @param {anychart.data.IRowInfo} iterator
 * @return {*}
 * @protected
 */
anychart.core.Chart.prototype.getCsvGrouperValue = function(iterator) {
  return iterator.getIndex();
};


/**
 * @param {anychart.data.IRowInfo} iterator
 * @param {*} dataHolder
 * @return {?string}
 * @protected
 */
anychart.core.Chart.prototype.getCsvGrouperAlias = function(iterator, dataHolder) {
  return null;
};


/**
 * Gets y value names from the *series*.
 * @param {*} dataHolder
 * @return {Array}
 */
anychart.core.Chart.prototype.getCsvColumns = function(dataHolder) {
  return (anychart.utils.instanceOf(dataHolder, anychart.core.series.Base)) ? dataHolder.getYValueNames() : ['value'];
};


/**
 * Wraps passed field name with the series id.
 * @param {string} name
 * @param {*} dataHolder
 * @param {number} index
 * @param {number} columnsCount
 * @return {string}
 */
anychart.core.Chart.prototype.prefixCsvColumnName = function(name, dataHolder, index, columnsCount) {
  return ((anychart.utils.instanceOf(dataHolder, anychart.core.series.Base)) ? dataHolder.name() : ('series' + String(index))) +
      ((columnsCount > 1) ? (' (' + name + ')') : '');
};


/**
 * @param {*} x
 * @param {?string} xAlias
 * @param {Array.<Array>} data
 * @param {Object.<number>} xValues
 * @param {string} id
 * @param {number} index
 * @param {Object} seriesXValues
 * @return {Array}
 * @protected
 */
anychart.core.Chart.prototype.getCsvExportRow = function(x, xAlias, data, xValues, id, index, seriesXValues) {
  var xHash = anychart.utils.hash(x);
  var rowIndex;
  if (xHash in xValues) {
    rowIndex = xValues[xHash];
  } else {
    rowIndex = xValues[xHash] = data.length;
    data.push([xAlias || String(x)]);
  }
  return data[rowIndex];
};


/**
 * @param {*} x
 * @param {?string} xAlias
 * @param {Array.<Array>} data
 * @param {Object.<number>} xValues
 * @param {string} id
 * @param {number} index
 * @param {Object} seriesXValues
 * @return {Array}
 * @protected
 */
anychart.core.Chart.prototype.getCsvExportRowScatter = function(x, xAlias, data, xValues, id, index, seriesXValues) {
  var xHash = anychart.utils.hash(x);
  var rowIndex;
  if (xHash in seriesXValues) {
    var i = 1;
    var newHash;
    do {
      newHash = xHash + '_' + i.toString();
    } while (newHash in seriesXValues);
    xHash = newHash;
  }
  seriesXValues[xHash] = true;
  if (xHash in xValues) {
    rowIndex = xValues[xHash];
  } else {
    rowIndex = xValues[xHash] = data.length;
    data.push([xAlias || String(x)]);
  }
  return data[rowIndex];
};


/**
 * @param {*} dataHolder
 * @param {anychart.enums.ChartDataExportMode} mode
 * @return {anychart.data.IIterator}
 * @protected
 */
anychart.core.Chart.prototype.getCsvIterator = function(dataHolder, mode) {
  return goog.isFunction(dataHolder.getIterator) ? dataHolder.getIterator() : dataHolder.data().getIterator();
};


/**
 * @param {*} dataHolder
 * @return {string}
 * @protected
 */
anychart.core.Chart.prototype.identifyCsvDataHolder = function(dataHolder) {
  return anychart.utils.hash(dataHolder.data().getDataSets()[0]);
};


/**
 * @param {Array} row
 * @param {Array} names
 * @param {anychart.data.IRowInfo} iterator
 * @param {Array} headers
 * @protected
 */
anychart.core.Chart.prototype.populateCsvRow = function(row, names, iterator, headers) {
  for (var i = 0; i < names.length; i++) {
    row[i + headers.length] = iterator.get(names[i]);
  }
};


/**
 * Add headers for csv.
 *
 * @param {Array<string>} headers - Array with headers.
 * @param {Array<{data: function():anychart.data.IDataSource}>} dataHolders - Dataholders to serialize.
 * @param {Array<string>} names - Field names to serialize.
 * @param {number} currentHolderIndex - Index of current dataholder.
 *
 * @protected
 */
anychart.core.Chart.prototype.populateCsvHeaders = function(headers, dataHolders, names, currentHolderIndex) {
  if (dataHolders.length > 1) {
    for (var j = 0; j < names.length; j++) {
      headers.push(this.prefixCsvColumnName(names[j], dataHolders[currentHolderIndex], currentHolderIndex + 1, names.length));
    }
  } else {
    headers.push.apply(headers, names);
  }
};


/**
 * Gets data for DEFAULT toCsv mode.
 * @param {anychart.enums.ChartDataExportMode} mode
 * @return {{headers: Array.<string>, data: Array.<Array.<*>>}}
 */
anychart.core.Chart.prototype.getCsvData = function(mode) {
  var dataHolders = this.getDataHolders();
  var headers = this.getCsvGrouperColumn();
  var xValues = {};
  var data = [];
  for (var i = 0; i < dataHolders.length; i++) {
    var dataHolder = dataHolders[i];
    var names = this.getCsvColumns(dataHolder);
    if (names.length) {
      var iterator = this.getCsvIterator(dataHolder, mode);
      iterator.reset();
      var holderId = this.identifyCsvDataHolder(dataHolder);
      var seriesXValues = {};
      while (iterator.advance()) {
        var grouper = this.getCsvGrouperValue(iterator);
        if (this.shouldAddCsvRow(mode, dataHolder, grouper)) {
          var row = this.getCsvExportRow(
              grouper,
              this.getCsvGrouperAlias(iterator, dataHolder),
              data,
              xValues,
              holderId,
              iterator.getIndex(),
              seriesXValues);
          this.populateCsvRow(row, names, iterator, headers);
        }
      }
      this.populateCsvHeaders(headers, dataHolders, names, i);
    }
  }
  return {headers: headers, data: data};
};


/**
 * Returns CSV string with series data.
 * @param {(string|anychart.enums.ChartDataExportMode)=} opt_chartDataExportMode CSV mode.
 * @param {Object.<string, (string|boolean|function(*, *=):string|undefined)>=} opt_csvSettings CSV settings.
 * @return {string} CSV string.
 */
anychart.core.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  opt_chartDataExportMode = anychart.enums.normalizeChartDataExportMode(opt_chartDataExportMode);
  var result = (opt_chartDataExportMode == anychart.enums.ChartDataExportMode.RAW) ?
      this.getRawCsvData() :
      this.getCsvData(opt_chartDataExportMode);
  return anychart.utils.serializeCsv(result.headers, result.data, opt_csvSettings);
};


/**
 * Gets chart represented as HTML table.
 * @param {string=} opt_title - Title to be set.
 * @param {boolean=} opt_asString - Whether to represent table as string.
 * @return {Element|string|null} - HTML table instance or null if got some parse errors.
 */
anychart.core.Chart.prototype.toHtmlTable = function(opt_title, opt_asString) {
  // This is how result CSV must look like.
  // var csv = 'x,Brandy,Whiskey,Tequila\n' +
  //     '2007,14.1,20.7,12.2\n' +
  //     '2008,15.7,21.6,10\n' +
  //     '2009,12,22.5,8.9';
  var csv = this.toCsv();
  var table = anychart.utils.htmlTableFromCsv(csv, opt_title, opt_asString);
  if (table) {
    return opt_asString ? goog.dom.getOuterHtml(table) : table;
  } else {
    return null;
  }
};


/**
 * Gets chart represented as invisible HTML table for accessibility purposes.
 * @param {string=} opt_title - Title to be set.
 * @param {boolean=} opt_asString - Whether to represent table as string.
 * @return {Element|string|null} - HTML table instance with a11y style (invisible) or null if got some parse errors.
 */
anychart.core.Chart.prototype.toA11yTable = function(opt_title, opt_asString) {
  var table = /** @type {Element} */ (this.toHtmlTable(opt_title));
  if (table) {
    //Style to hide the table: https://www.w3.org/WAI/tutorials/forms/labels/
    var settings = {
      'border': 0,
      'clip': 'rect(0 0 0 0)',
      'height': '1px',
      'margin': '-1px',
      'overflow': 'hidden',
      'padding': 0,
      'position': 'absolute',
      'width': '1px'
    };
    goog.style.setStyle(table, settings);
    return opt_asString ? goog.dom.getOuterHtml(table) : table;
  }
  return table;
};


/**
 * Saves chart config as XML document.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsXml = function(opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    var xml = /** @type {string} */(this.toXml(false));
    exports.saveAsXml(this, xml, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves chart config as XML document.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsJson = function(opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    var json = /** @type {string} */(this.toJson(true));
    exports.saveAsJson(this, json, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves chart data as csv.
 * @param {(string|anychart.enums.ChartDataExportMode)=} opt_chartDataExportMode CSV mode.
 * @param {Object.<string, (string|boolean|function(*, *=):string|undefined)>=} opt_csvSettings CSV settings.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsCsv = function(opt_chartDataExportMode, opt_csvSettings, opt_filename) {
  var exports = anychart.module['exports'];
  if (exports) {
    var csv = this.toCsv(opt_chartDataExportMode, opt_csvSettings);
    exports.saveAsCsv(this, csv, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


/**
 * Saves chart data as excel document.
 * @param {(string|anychart.enums.ChartDataExportMode)=} opt_chartDataExportMode CSV mode.
 * @param {string=} opt_filename file name to save.
 * @param {{headers:Function}=} opt_exportOptions - Additional export options.
 */
anychart.core.Chart.prototype.saveAsXlsx = function(opt_chartDataExportMode, opt_filename, opt_exportOptions) {
  var exports = anychart.module['exports'];
  if (exports) {
    var csvOptions = {
      'rowsSeparator': '\n',
      'columnsSeparator': ',',
      'ignoreFirstRow': false
    };

    goog.mixin(csvOptions, opt_exportOptions || {});

    var csv = this.toCsv(opt_chartDataExportMode, csvOptions);

    exports.saveAsXlsx(this, csv, opt_filename);
  } else {
    anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Exporting']);
  }
};


//endregion
//region ------- Charts tracking


/**
 * Getter/setter for chart id.
 * @param {?string=} opt_value
 * @return {(string|anychart.core.Chart)} Return chart id or chart itself for chaining.
 */
anychart.core.Chart.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.id_ != opt_value) {
      if (goog.isNull(opt_value)) {
        anychart.untrackChart(this, /** @type {string} */(this.id_));
        this.id_ = opt_value;

      } else if (anychart.trackChart(this, opt_value, /** @type {string} */(this.id_))) {
        this.id_ = opt_value;
      }
    }
    return this;
  }
  return this.id_;
};


//endregion
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.core.Chart.prototype;
  proto['a11y'] = proto.a11y;
  proto['animation'] = proto.animation;
  proto['autoRedraw'] = proto.autoRedraw;
  proto['title'] = proto.title;//doc|ex
  proto['background'] = proto.background;//doc|ex
  proto['margin'] = proto.margin;//doc|ex
  proto['padding'] = proto.padding;//doc|ex
  proto['label'] = proto.label;//doc|ex
  proto['container'] = proto.container;//doc
  proto['contextMenu'] = proto.contextMenu;
  proto['draw'] = proto.draw;//doc
  proto['toJson'] = proto.toJson;//|need-ex
  proto['toXml'] = proto.toXml;//|need-ex
  proto['legend'] = proto.legend;//dummy DO NOT USE
  proto['credits'] = proto.credits;//dummy DO NOT USE
  proto['tooltip'] = proto.tooltip;
  proto['saveAsPng'] = proto.saveAsPng;//inherited
  proto['saveAsJpg'] = proto.saveAsJpg;//inherited
  proto['saveAsPdf'] = proto.saveAsPdf;//inherited
  proto['saveAsSvg'] = proto.saveAsSvg;//inherited
  proto['shareAsPng'] = proto.shareAsPng;//inherited
  proto['shareAsJpg'] = proto.shareAsJpg;//inherited
  proto['shareAsPdf'] = proto.shareAsPdf;//inherited
  proto['shareAsSvg'] = proto.shareAsSvg;//inherited
  proto['getPngBase64String'] = proto.getPngBase64String;//inherited
  proto['getJpgBase64String'] = proto.getJpgBase64String;//inherited
  proto['getSvgBase64String'] = proto.getSvgBase64String;//inherited
  proto['getPdfBase64String'] = proto.getPdfBase64String;//inherited
  proto['toSvg'] = proto.toSvg;//inherited
  proto['saveAsCsv'] = proto.saveAsCsv;
  proto['saveAsXlsx'] = proto.saveAsXlsx;
  proto['saveAsXml'] = proto.saveAsXml;
  proto['saveAsJson'] = proto.saveAsJson;
  proto['exports'] = proto.exports;
  proto['toCsv'] = proto.toCsv;
  proto['toA11yTable'] = proto.toA11yTable;
  proto['toHtmlTable'] = proto.toHtmlTable;
  proto['localToGlobal'] = proto.localToGlobal;
  proto['globalToLocal'] = proto.globalToLocal;
  proto['getStat'] = proto.getStat;
  proto['getSelectedPoints'] = proto.getSelectedPoints;
  proto['credits'] = proto.credits;
  proto['shareWithFacebook'] = proto.shareWithFacebook;
  proto['shareWithTwitter'] = proto.shareWithTwitter;
  proto['shareWithLinkedIn'] = proto.shareWithLinkedIn;
  proto['shareWithPinterest'] = proto.shareWithPinterest;
  proto['startSelectMarquee'] = proto.startSelectMarquee;
  proto['startSelectRectangleMarquee'] = proto.startSelectRectangleMarquee;
  // auto generated
  // proto['selectMarqueeFill'] = proto.selectMarqueeFill;
  // proto['selectMarqueeStroke'] = proto.selectMarqueeStroke;
  proto['inMarquee'] = proto.inMarquee;
  proto['cancelMarquee'] = proto.cancelMarquee;
  proto['id'] = proto.id;
  proto['fullScreen'] = proto.fullScreen;
  proto['isFullScreenAvailable'] = proto.isFullScreenAvailable;
})();

