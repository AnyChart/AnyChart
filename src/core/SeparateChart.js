goog.provide('anychart.core.SeparateChart');
goog.require('anychart.core.ChartWithCredits');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.enums');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.core.ChartWithCredits}
 */
anychart.core.SeparateChart = function() {
  /**
   * @type {anychart.core.ui.Legend}
   * @private
   */
  this.legend_ = null;

  anychart.core.SeparateChart.base(this, 'constructor');

  if (this.supportsBaseHighlight)
    this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);

};
goog.inherits(anychart.core.SeparateChart, anychart.core.ChartWithCredits);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds LEGEND to core.Chart states.
 * @type {number}
 */
anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithCredits.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CHART_LEGEND;


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for legend.
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
  // If there are no signals - state == 0 and nothing will happen.
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


/** @inheritDoc */
anychart.core.SeparateChart.prototype.calculateContentAreaSpace = function(totalBounds) {
  var bounds = anychart.core.SeparateChart.base(this, 'calculateContentAreaSpace', totalBounds);

  var legend = /** @type {anychart.core.ui.Legend} */(this.legend());
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LEGEND | anychart.ConsistencyState.BOUNDS)) {
    legend.suspendSignalsDispatching();
    if (!legend.container() && legend.enabled()) legend.container(this.rootElement);
    legend.parentBounds(bounds);
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
  bounds = legend.enabled() ? legend.getRemainingBounds() : bounds;

  return bounds.clone();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.SeparateChart.prototype.serialize = function() {
  var json = anychart.core.SeparateChart.base(this, 'serialize');
  json['legend'] = this.legend().serialize();
  json['interactivity'] = this.interactivity().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.SeparateChart.prototype.setupByJSON = function(config) {
  anychart.core.SeparateChart.base(this, 'setupByJSON', config);
  this.legend(config['legend']);
  this.interactivity(config['interactivity']);
};


//exports
anychart.core.SeparateChart.prototype['legend'] = anychart.core.SeparateChart.prototype.legend;//doc|ex
anychart.core.SeparateChart.prototype['interactivity'] = anychart.core.SeparateChart.prototype.interactivity;
