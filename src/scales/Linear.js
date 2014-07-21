goog.provide('anychart.scales.Linear');

goog.require('anychart.scales.ScatterBase');
goog.require('anychart.scales.ScatterTicks');



/**
 * Represents simple linear scale that transforms values from domain [a, b] to domain [0, 1].
 * Note that a can be greater than b. The only condition for the scale is that a != b.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.Linear = function() {
  /**
   * Major ticks for the scale.
   * @type {anychart.scales.ScatterTicks}
   * @protected
   */
  this.ticksObj = null;

  /**
   * Minor ticks of the scale.
   * @type {anychart.scales.ScatterTicks}
   * @protected
   */
  this.minorTicksObj = null;

  this.canBeStacked = true;

  goog.base(this);
};
goog.inherits(anychart.scales.Linear, anychart.scales.ScatterBase);


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.Linear.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = new anychart.scales.ScatterTicks(this);
    this.registerDisposable(this.ticksObj);
    this.ticksObj.listenSignals(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.ticksObj.set(opt_value);
    return this;
  }
  return this.ticksObj;
};


/**
 * Gets or sets a set of scale minor ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.Linear.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicksObj) {
    this.minorTicksObj = new anychart.scales.ScatterTicks(this);
    this.registerDisposable(this.minorTicksObj);
    this.minorTicksObj.listenSignals(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.minorTicksObj.set(opt_value);
    return this;
  }
  return this.minorTicksObj;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.calculate = function() {
  if (this.consistent) return;

  goog.base(this, 'calculate');

  var newRange = this.ticks().setup(this.min, this.max, this.minimumModeAuto, this.maximumModeAuto);

  if (this.minimumModeAuto)
    this.min = newRange[0];

  if (this.maximumModeAuto)
    this.max = newRange[1];

  this.minorTicks().setupAsMinor(this.ticks().get(), this.min, this.max);

  this.range = this.max - this.min;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.Linear.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.Linear.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['ticks'] = this.ticks().serialize();
  data['minorTicks'] = this.minorTicks().serialize();
  data['type'] = 'linear';
  return data;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', value);
  this.ticks().deserialize(value['ticks']);
  this.minorTicks().deserialize(value['minorTicks']);
  this.resumeSignalsDispatching(true);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Shortcut to create a linear scale.
 * @return {anychart.scales.Linear} Linear scale.
 */
anychart.scales.linear = function() {
  return new anychart.scales.Linear();
};


//exports
goog.exportSymbol('anychart.scales.Linear', anychart.scales.Linear);
anychart.scales.Linear.prototype['ticks'] = anychart.scales.Linear.prototype.ticks;
anychart.scales.Linear.prototype['minorTicks'] = anychart.scales.Linear.prototype.minorTicks;
goog.exportSymbol('anychart.scales.linear', anychart.scales.linear);
