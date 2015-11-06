goog.provide('anychart.core.SeparateChart');
goog.require('acgraph');
goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.Credits');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.enums');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.core.Chart}
 */
anychart.core.SeparateChart = function() {
  /**
   * @type {anychart.core.ui.Legend}
   * @private
   */
  this.legend_ = null;

  /**
   * @type {anychart.core.ui.Credits}
   * @private
   */
  this.credits_ = null;

  goog.base(this);

  if (this.supportsBaseHighlight)
    this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);
};
goog.inherits(anychart.core.SeparateChart, anychart.core.Chart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds LEGEND and CREDITS to core.Chart states.
 * @type {number}
 */
anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CHART_LEGEND |
    anychart.ConsistencyState.CHART_CREDITS;


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current chart legend.
 * @example <t>lineChart</t>
 * chart.line([-2, 11, 2, 4]);
 * chart.line([7, 10, 2, 0]);
 * chart.legend()
 *         .position('right')
 *         .title(null)
 *         .itemsLayout('vertical')
 *         .align('left');
 * @return {!anychart.core.ui.Legend} An instance of {@link anychart.core.ui.Legend} for method chaining.
 *//**
 * Setter for chart legend setting.
 * @example <t>lineChart</t>
 * chart.line([-2, 11, 2, 4]);
 * chart.line([7, 10, 2, 0]);
 * chart.legend(true);
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {!(anychart.core.Chart|anychart.core.ui.Legend)} Chart legend instance of itself for chaining call.
 */
anychart.core.SeparateChart.prototype.legend = function(opt_value) {
  if (!this.legend_) {
    this.legend_ = new anychart.core.ui.Legend();
    this.registerDisposable(this.legend_);
    this.legend_.listenSignals(this.onLegendSignal_, this);
    this.legend_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    this.legend_.setup(opt_value);
    return this;
  } else {
    return this.legend_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.SeparateChart.prototype.onLegendSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CHART_LEGEND;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals – state == 0 and nothing will happen.
  this.invalidate(state, signal);
};


/**
 * Create legend items provider specific to chart type.
 * @param {string|anychart.enums.LegendItemsSourceMode} sourceMode Items source mode (default|categories).
 * @param {?Function} itemsTextFormatter Legend items text formatter.
 * @return {!Array.<anychart.core.ui.Legend.LegendItemProvider>} Legend items provider.
 */
anychart.core.SeparateChart.prototype.createLegendItemsProvider = goog.abstractMethod;


/**
 * Identifies that legend item created by this source can interact in specified mode.
 * By default can interact only in DEFAULT mode.
 * @param {anychart.enums.LegendItemsSourceMode} mode Legend mode for this chart.
 * @return {boolean} Can interact or not.
 */
anychart.core.SeparateChart.prototype.legendItemCanInteractInMode = function(mode) {
  return (mode == anychart.enums.LegendItemsSourceMode.DEFAULT);
};


/**
 * Calls when legend item that some how belongs to the chart was clicked.
 * @param {anychart.core.ui.LegendItem} item Legend item that was clicked.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.SeparateChart.prototype.legendItemClick = function(item, event) {
  var sourceKey = item.sourceKey();
  var series = this.getSeries(/** @type {number} */ (sourceKey));
  if (series) {
    series.enabled(!series.enabled());
    if (series.enabled())
      series.hoverSeries();
    else
      series.unhover();
  }
};


/**
 * Calls when legend item that some how belongs to the chart was hovered.
 * @param {anychart.core.ui.LegendItem} item Legend item that was hovered.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.SeparateChart.prototype.legendItemOver = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var series = this.getSeries(/** @type {number} */ (sourceKey));
  if (series) {
    series.hoverSeries();
  }
};


/**
 * Calls when legend item that some how belongs to the chart was unhovered.
 * @param {anychart.core.ui.LegendItem} item Legend item that was unhovered.
 * @param {anychart.core.MouseEvent} event Mouse event.
 */
anychart.core.SeparateChart.prototype.legendItemOut = function(item, event) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var series = this.getSeries(/** @type {number} */ (sourceKey));
  if (series) {
    series.unhover();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Credits.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current chart credits settings.
 * @example <t>lineChart</t>
 * chart.line([1, 4, 2, 9]);
 * chart.credits().text('Click me!');
 * @return {!anychart.core.ui.Credits} An instance of {@link anychart.core.ui.Credits} class for method chaining.
 *//**
 * Setter for chart credits settings.
 * @example <t>lineChart</t>
 * chart.line([1, 4, 2, 9]);
 * chart.credits(null);
 * @param {(Object|boolean|null)=} opt_value
 * @return {!anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.Chart|anychart.core.ui.Credits)} Chart credits or itself for chaining call.
 */
anychart.core.SeparateChart.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.Credits();
    this.registerDisposable(this.credits_);
    this.credits_.listenSignals(this.onCreditsSignal_, this);
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
anychart.core.SeparateChart.prototype.onCreditsSignal_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CHART_CREDITS;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
  }
  // If there are no signals – state == 0 and nothing will happen.
  this.invalidate(state, signal);
};


/** @inheritDoc */
anychart.core.SeparateChart.prototype.calculateContentAreaSpace = function(totalBounds) {
  //chart area bounds with applied margin and copped by credits
  var boundsWithoutCredits;
  // chart area with applied margin, padding, title and legend
  var boundsWithoutLegend;
  //chart area with applied margin
  var boundsWithoutMargin;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  //
  var boundsWithoutBackgroundThickness;

  boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  var background = this.background();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_BACKGROUND | anychart.ConsistencyState.BOUNDS)) {
    background.suspendSignalsDispatching();
    if (!background.container()) background.container(this.rootElement);
    background.parentBounds(boundsWithoutMargin);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_BACKGROUND);
  }
  boundsWithoutBackgroundThickness = background.enabled() ? background.getRemainingBounds() : boundsWithoutMargin;

  var credits = this.credits();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_CREDITS | anychart.ConsistencyState.BOUNDS)) {
    credits.suspendSignalsDispatching();
    if (!credits.container())
      credits.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    credits.parentBounds(/** @type {anychart.math.Rect} */ (boundsWithoutBackgroundThickness));
    credits.resumeSignalsDispatching(false);
    credits.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_CREDITS);
  }
  boundsWithoutCredits = this.credits().getRemainingBounds();
  boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutCredits);

  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_TITLE | anychart.ConsistencyState.BOUNDS)) {
    title.suspendSignalsDispatching();
    if (!title.container()) title.container(this.rootElement);
    title.parentBounds(boundsWithoutPadding);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_TITLE);
  }
  boundsWithoutTitle = title.enabled() ? title.getRemainingBounds() : boundsWithoutPadding;

  var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.BOUNDS)) {
    legend.suspendSignalsDispatching();
    if (!legend.container() && legend.enabled()) legend.container(this.rootElement);
    legend.parentBounds(boundsWithoutTitle);
    if (!legend.itemsSource())
      legend.itemsSource(this);
    legend.resumeSignalsDispatching(false);
    legend.invalidate(anychart.ConsistencyState.APPEARANCE);
    legend.draw();

    // DVF-1518
    var legendBounds = legend.getRemainingBounds();
    if (!goog.math.Rect.equals(this.legendBoundsCache_, legendBounds)) {
      this.legendBoundsCache_ = legendBounds;
      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.CHART_LEGEND);
  }
  boundsWithoutLegend = legend.enabled() ? legend.getRemainingBounds() : boundsWithoutTitle;

  return boundsWithoutLegend.clone();
};


/** @inheritDoc */
anychart.core.SeparateChart.prototype.resizeHandler = function(evt) {
  this.suspendSignalsDispatching();
  this.invalidate(anychart.ConsistencyState.CHART_CREDITS, anychart.Signal.NEEDS_REDRAW);
  this.credits().invalidate(anychart.ConsistencyState.CREDITS_POSITION);
  goog.base(this, 'resizeHandler', evt);
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.SeparateChart.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['legend'] = this.legend().serialize();
  json['credits'] = this.credits().serialize();
  json['interactivity'] = this.interactivity().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.SeparateChart.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.legend(config['legend']);
  this.credits(config['credits']);
  this.interactivity(config['interactivity']);
};


//exports
anychart.core.SeparateChart.prototype['legend'] = anychart.core.SeparateChart.prototype.legend;//doc|ex
anychart.core.SeparateChart.prototype['credits'] = anychart.core.SeparateChart.prototype.credits;//doc|ex
anychart.core.SeparateChart.prototype['interactivity'] = anychart.core.SeparateChart.prototype.interactivity;
