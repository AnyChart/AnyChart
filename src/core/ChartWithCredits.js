goog.provide('anychart.core.ChartWithCredits');
goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.ChartCredits');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.core.Chart}
 */
anychart.core.ChartWithCredits = function() {

  /**
   * @type {anychart.core.ui.ChartCredits}
   * @private
   */
  this.credits_ = null;

  goog.base(this);
};
goog.inherits(anychart.core.ChartWithCredits, anychart.core.Chart);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ChartWithCredits.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds LEGEND and CREDITS to core.Chart states.
 * @type {number}
 */
anychart.core.ChartWithCredits.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CHART_CREDITS;


//----------------------------------------------------------------------------------------------------------------------
//
//  Credits.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for credits.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.Chart|anychart.core.ui.ChartCredits)} Chart credits or itself for chaining call.
 */
anychart.core.ChartWithCredits.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.ChartCredits(this);
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
anychart.core.ChartWithCredits.prototype.onCreditsSignal_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.CHART_CREDITS;
  }
  // If there are no signals - state == 0 and nothing will happen.
  this.invalidate(state, signal);
};


/**
 * Draw credits.
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @return {!anychart.math.Rect} Bounds without credits bounds.
 */
anychart.core.ChartWithCredits.prototype.drawCredits = function(parentBounds) {
  var stage = this.container().getStage();
  if (!stage)
    return /** @type {!anychart.math.Rect} */(parentBounds);

  var stageCredits = stage.credits();
  var chartCredits = this.credits();

  stageCredits.setupByJSON(chartCredits.serialize());
  chartCredits.dropSettings();

  this.markConsistent(anychart.ConsistencyState.CHART_CREDITS);
  return /** @type {!anychart.math.Rect} */(parentBounds);
};


/** @inheritDoc */
anychart.core.ChartWithCredits.prototype.calculateContentAreaSpace = function(totalBounds) {
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
  boundsWithoutCredits = this.drawCredits(boundsWithoutBackgroundThickness);
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

  return boundsWithoutTitle.clone();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Setup.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ChartWithCredits.prototype.serialize = function() {
  var json = anychart.core.ChartWithCredits.base(this, 'serialize');
  json['credits'] = this.credits().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ChartWithCredits.prototype.setupByJSON = function(config) {
  anychart.core.ChartWithCredits.base(this, 'setupByJSON', config);
  this.credits(config['credits']);
};


//exports
anychart.core.ChartWithCredits.prototype['credits'] = anychart.core.ChartWithCredits.prototype.credits;//doc|ex

