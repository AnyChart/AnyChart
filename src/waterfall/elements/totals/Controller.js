goog.provide('anychart.waterfallModule.totals.Controller');

goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.scales.Ordinal');
goog.require('anychart.waterfallModule.totals.Total');


/**
 * Class that creates, removes and store created totals.
 *
 * @param {!anychart.waterfallModule.Chart} chart - Waterfall chart instance.
 *
 * @constructor
 *
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.waterfallModule.totals.Controller = function(chart) {
  anychart.waterfallModule.totals.Controller.base(this, 'constructor');

  /**
   * Waterfall chart instance.
   *
   * @type {!anychart.waterfallModule.Chart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Totals layer.
   *
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = acgraph.layer();
  this.layer_.zIndex(anychart.waterfallModule.totals.Controller.Z_INDEX);

  /**
   * Array of all totals.
   *
   * @type {Array.<anychart.waterfallModule.totals.Total>}
   * @private
   */
  this.totals_ = [];
};
goog.inherits(anychart.waterfallModule.totals.Controller, anychart.core.VisualBaseWithBounds);


/**
 * zIndex for totals layer.
 * @type {number}
 */
anychart.waterfallModule.totals.Controller.Z_INDEX = 30;


/**
 * Supported signals.
 *
 * @type {anychart.Signal|number}
 */
anychart.waterfallModule.totals.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Supported consistency states.
 *
 * @type {anychart.ConsistencyState|number}
 */
anychart.waterfallModule.totals.Controller.prototype.SUPPORTED_CONSISTENCY_STATES =
  anychart.ConsistencyState.BOUNDS |
  anychart.ConsistencyState.SERIES_DATA;


/**
 * Set container for totals and draw it.
 *
 * @private
 */
anychart.waterfallModule.totals.Controller.prototype.setupTotals_ = function() {
  anychart.core.Base.suspendSignalsDispatching(this.totals_);

  var categories = this.chart_.xScale().values();

  for (var i = 0; i < this.totals_.length; i++) {
    var total = this.totals_[i];

    total.setOption('isVertical', this.chart_.isVertical());
    total.container(goog.array.indexOf(categories, total.getOption('x')) >= 0 ? this.layer_ : null);
    total.parentBounds(/**@type {goog.math.Rect}*/(this.parentBounds()));
  }

  anychart.core.Base.resumeSignalsDispatchingFalse(this.totals_);
};


/**
 * Set container for totals and draw it.
 *
 * @private
 */
anychart.waterfallModule.totals.Controller.prototype.drawTotals_ = function() {
  for (var i = 0; i < this.totals_.length; i++) {
    var total = this.totals_[i];
    total.draw();
  }
};


/**
 * Draw totals.
 */
anychart.waterfallModule.totals.Controller.prototype.draw = function() {
  if (!this.checkDrawingNeeded()) {
    return;
  }

  if (!this.layer_.parent()) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer}*/(this.container()));
  }

  this.layer_.clip(/** @type {goog.math.Rect} */(this.parentBounds()));

  var xScale = this.chart_.xScale();

  if (xScale.getType() == anychart.enums.ScaleTypes.ORDINAL) {
    this.setupTotals_();
    this.drawTotals_();
  }

  this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
};

/**
 * On totals count change callback.
 */
anychart.waterfallModule.totals.Controller.prototype.onTotalsCountChange = function() {
  this.invalidate(anychart.ConsistencyState.SERIES_DATA, anychart.Signal.NEEDS_REDRAW);
};


//region --- Calculations
/**
 * Update datasets of each total instance.
 */
anychart.waterfallModule.totals.Controller.prototype.updateTotalsData = function() {
  for (var i = 0; i < this.totals_.length; i++) {
    var total = this.totals_[i];

    if (total.getOption('enabled')) {
      total.updateData();
    }
  }
};


/**
 * Calculate and returns totals drawing plans.
 *
 * @param {!Object} xHashMap - Auto calculated scale hashmap.
 * @param {!Array.<string>} xArray - Auto calculated scale values.
 *
 * @return {Array.<anychart.core.series.Cartesian.DrawingPlan>}
 */
anychart.waterfallModule.totals.Controller.prototype.getDrawingPlans = function(xHashMap, xArray) {
  var plans = [];
  for (var i = 0; i < this.totals_.length; i++) {
    var total = this.totals_[i];
    if (total.getOption('enabled') && goog.array.indexOf(xArray, total.getCategoryValue()) !== -1) {
      plans.push(total.getOrdinalDrawingPlan(xHashMap, xArray, false));
    }
  }
  return plans;
};


/**
 * Creates and calculates totals data.
 */
anychart.waterfallModule.totals.Controller.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_DATA)) {
    this.updateTotalsData();
    this.markConsistent(anychart.ConsistencyState.SERIES_DATA);
  }
};


/**
 * Total invalidation handler.
 *
 * @param {anychart.SignalEvent} event - Signal event.
 *
 * @private
 */
anychart.waterfallModule.totals.Controller.prototype.totalInvalidationHandler_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.SERIES_DATA);
  }

  this.dispatchEvent(event);
};


//endregion
// region --- Public API
/**
 * Remove total from totals array by total instance.
 *
 * @param {anychart.waterfallModule.totals.Total} total - Total instance.
 * @return {boolean}
 */
anychart.waterfallModule.totals.Controller.prototype.removeTotal = function(total) {
  var indexToDelete = goog.array.indexOf(this.totals_, total);

  return this.removeTotalAt(indexToDelete);
};


/**
 * Remove total by index.
 *
 * @param {number} index - Index of total to remove.
 * @return {boolean}
 */
anychart.waterfallModule.totals.Controller.prototype.removeTotalAt = function(index) {
  var total = this.totals_[index];

  if (goog.isDef(total)) {
    this.totals_.splice(index, 1);

    // Dispose of series call some dispatching inside chart. We don't need it.
    this.chart_.suspendSignalsDispatching();

    goog.dispose(total);

    this.chart_.resumeSignalsDispatching(false);

    this.onTotalsCountChange();
    return true;
  }

  return false;
};


/**
 * Return total instance by index.
 *
 * @param {number} index - Index of total.
 * @return {anychart.waterfallModule.totals.Total}
 */
anychart.waterfallModule.totals.Controller.prototype.getTotalAt = function(index) {
  return this.totals_[index] || null;
};


/**
 * Check total config correctness.
 *
 * @param {Object} config
 *
 * @return {boolean}
 */
anychart.waterfallModule.totals.Controller.prototype.checkConfig = function(config) {
  var x = config['x'];
  var name = config['name'];

  return goog.isDef(x) && goog.isDef(name) && !goog.array.some(this.totals_, function(total) {
    return total.name() === name;
  });
};


/**
 * Create item with given settings.
 *
 * @param {!Object} config
 * @return {anychart.waterfallModule.totals.Total}
 */
anychart.waterfallModule.totals.Controller.prototype.addTotal = function(config) {
  if (this.checkConfig(config)) {
    this.chart_.suspendSignalsDispatching();
    var total = new anychart.waterfallModule.totals.Total(this, this.chart_);

    total.suspendSignalsDispatching();
    total.setup(config);
    // For tooltip events.
    total.setParentEventTarget(this.chart_);
    total.listenSignals(this.totalInvalidationHandler_, this);
    total.resumeSignalsDispatching(false);

    this.totals_.push(total);

    this.chart_.resumeSignalsDispatching(false);

    this.onTotalsCountChange();

    return total;
  }
  return null;
};


/**
 * Return array of all created total instances.
 *
 * @return {Array.<anychart.waterfallModule.totals.Total>}
 */
anychart.waterfallModule.totals.Controller.prototype.getAllTotals = function() {
  var totals = [];

  for (var i = 0; i < this.totals_.length; i++) {
    totals.push(this.totals_[i]);
  }

  return totals;
};


//endregion
//region --- Serialize/Deserialize
/** @inheritDoc */
anychart.waterfallModule.totals.Controller.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.layer_,
    this.totals_
  );

  this.layer_ = null;
  this.totals_.length = 0;

  anychart.waterfallModule.totals.Controller.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.waterfallModule.totals.Controller.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.totals.Controller.base(this, 'setupByJSON', config, opt_default);

  for (var i = 0; i < config.length; i++) {
    var totalConfig = config[i];
    this.addTotal(totalConfig);
  }
};


/** @inheritDoc */
anychart.waterfallModule.totals.Controller.prototype.serialize = function() {
  var json = anychart.waterfallModule.totals.Controller.base(this, 'serialize');
  var totals = [];

  for (var i = 0; i < this.totals_.length; i++) {
    var total = this.totals_[i];
    totals.push(total.serialize());
  }

  json['totals'] = totals;
  return json;
};
//endregion
