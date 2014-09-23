goog.provide('anychart.scales.DateTime');

goog.require('anychart.scales.DateTimeTicks');
goog.require('anychart.scales.ScatterBase');



/**
 * Scatter datetime scale.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.DateTime = function() {
  goog.base(this);
  /**
   * Major ticks for the scale.
   * @type {anychart.scales.DateTimeTicks}
   * @protected
   */
  this.ticksObj = null;

  /**
   * Minor ticks of the scale.
   * @type {anychart.scales.DateTimeTicks}
   * @protected
   */
  this.minorTicksObj = null;

  goog.base(this);
};
goog.inherits(anychart.scales.DateTime, anychart.scales.ScatterBase);


/** @inheritDoc */
anychart.scales.DateTime.prototype.isMissing = function(value) {
  return isNaN(anychart.utils.normalizeTimestamp(value));
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.DateTime|anychart.scales.DateTimeTicks)} Ticks or itself for method chaining.
 */
anychart.scales.DateTime.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = new anychart.scales.DateTimeTicks(this);
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
 * @return {!(anychart.scales.DateTime|anychart.scales.DateTimeTicks)} Ticks or itself for method chaining.
 */
anychart.scales.DateTime.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicksObj) {
    this.minorTicksObj = new anychart.scales.DateTimeTicks(this);
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
anychart.scales.DateTime.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    goog.base(this, 'extendDataRange', anychart.utils.normalizeTimestamp(arguments[i]));
  }
  return this;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.transform = function(value, opt_subRangeRatio) {
  return goog.base(this, 'transform', anychart.utils.normalizeTimestamp(value), opt_subRangeRatio);
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.calculate = function() {
  if (this.consistent) return;

  goog.base(this, 'calculate');

  var newRange = this.minorTicks().setupAsMinor(this.min, this.max, this.minimumModeAuto, this.maximumModeAuto);
  if (this.minimumModeAuto)
    this.min = newRange[0];
  if (this.maximumModeAuto)
    this.max = newRange[1];

  this.ticks().setup(this.min, this.max);

  this.range = this.max - this.min;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.getCategorisation = function() {
  return true;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.DateTime.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.DateTime.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['ticks'] = this.ticks().serialize();
  data['minorTicks'] = this.minorTicks().serialize();
  data['type'] = 'datetime';
  return data;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.deserialize = function(value) {
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
 * Shortcut to create DateTime scale.
 * @return {anychart.scales.DateTime} DateTime scale.
 */
anychart.scales.dateTime = function() {
  return new anychart.scales.DateTime();
};


//exports
goog.exportSymbol('anychart.scales.dateTime', anychart.scales.dateTime);
anychart.scales.DateTime.prototype['ticks'] = anychart.scales.DateTime.prototype.ticks;
anychart.scales.DateTime.prototype['minorTicks'] = anychart.scales.DateTime.prototype.minorTicks;
anychart.scales.DateTime.prototype['transform'] = anychart.scales.DateTime.prototype.transform;
anychart.scales.DateTime.prototype['extendDataRange'] = anychart.scales.DateTime.prototype.extendDataRange;
