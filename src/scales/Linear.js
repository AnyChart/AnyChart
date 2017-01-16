goog.provide('anychart.scales.Linear');

goog.require('anychart.enums');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.scales.ScatterTicks');



/**
 * Represents simple linear scale that transforms values from domain [a, b] to domain [0, 1].
 * Note that a can be greater than b. The only condition for the scale is that a != b.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.linear}.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.Linear = function() {
  anychart.scales.Linear.base(this, 'constructor');

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

  /**
   * Log base value. Used mostly for ticks calculation, because it doesn't affect transformation results.
   * This value is declared here to avoid calculate() method override.
   * @type {number}
   * @protected
   */
  this.logBaseVal = 10;

  this.stickToZeroFlag = true;

  /**
   * Polymorphic function to support different comparisons
   * @param {*} value
   * @param {number} comparisonZero
   * @return {*}
   * @private
   */
  this.applyComparison_ = this.makeNoneComparison_;
};
goog.inherits(anychart.scales.Linear, anychart.scales.ScatterBase);


/**
 * @type {anychart.enums.ScaleComparisonMode}
 * @private
 */
anychart.scales.Linear.prototype.comparisonMode_ = anychart.enums.ScaleComparisonMode.NONE;


/**
 * @type {anychart.enums.ScaleCompareWithMode|number}
 * @private
 */
anychart.scales.Linear.prototype.compareWith_ = anychart.enums.ScaleCompareWithMode.FIRST_VISIBLE;


/** @inheritDoc */
anychart.scales.Linear.prototype.getType = function() {
  return anychart.enums.ScaleTypes.LINEAR;
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.Linear.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = this.createTicks();
  }
  if (goog.isDef(opt_value)) {
    this.ticksObj.setup(opt_value);
    return this;
  }
  return this.ticksObj;
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.Linear.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicksObj) {
    this.minorTicksObj = this.createTicks();
    this.minorTicksObj.suspendSignalsDispatching();
    this.minorTicksObj.count(5);
    this.minorTicksObj.resumeSignalsDispatching(false);
  }
  if (goog.isDef(opt_value)) {
    this.minorTicksObj.setup(opt_value);
    return this;
  }
  return this.minorTicksObj;
};


/**
 * Flag to stick to zero value on auto calc if gaps lead to zero crossing.
 * @param {boolean=} opt_value
 * @return {!(anychart.scales.Linear|boolean)}
 */
anychart.scales.Linear.prototype.stickToZero = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.stickToZeroFlag) {
      this.stickToZeroFlag = opt_value;
      if (this.minimumModeAuto || this.maximumModeAuto) {
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      }
    }
    return this;
  }
  return this.stickToZeroFlag;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.calculate = function() {
  if (this.consistent) return;

  anychart.scales.Linear.base(this, 'calculate');

  var setupResult = this.ticks().setupAsMajor(this.min, this.max,
      this.minimumModeAuto && this.min != this.softMin,
      this.maximumModeAuto && this.max != this.softMax,
      this.logBaseVal);

  if (this.minimumModeAuto)
    this.min = setupResult[0]; // new min

  if (this.maximumModeAuto)
    this.max = setupResult[1]; // new max

  this.minorTicks().setupAsMinor(this.ticks().getInternal(), this.logBaseVal, setupResult[2], setupResult[3]);

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


/**
 * Create scale ticks.
 * @return {!anychart.scales.ScatterTicks}
 * @protected
 */
anychart.scales.Linear.prototype.createTicks = function() {
  var ticks = new anychart.scales.ScatterTicks(this);
  this.registerDisposable(ticks);
  ticks.listenSignals(this.ticksInvalidated_, this);
  return ticks;
};


/**
 * Getter and setter for scale changes mode.
 * @param {(string|anychart.enums.ScaleComparisonMode)=} opt_value
 * @return {anychart.enums.ScaleComparisonMode|anychart.scales.Linear}
 */
anychart.scales.Linear.prototype.comparisonMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeScaleComparisonMode(opt_value);
    if (this.comparisonMode_ != opt_value) {
      this.comparisonMode_ = opt_value;
      switch (this.comparisonMode_) {
        case anychart.enums.ScaleComparisonMode.NONE:
          this.applyComparison_ = this.makeNoneComparison_;
          break;
        case anychart.enums.ScaleComparisonMode.VALUE:
          this.applyComparison_ = this.makeValuesComparison_;
          break;
        case anychart.enums.ScaleComparisonMode.PERCENT:
          this.applyComparison_ = this.makePercentComparison_;
          break;
      }
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.comparisonMode_;
};


/**
 * Getter and setter for date which should be used as a changes zero for series.
 * @param {(string|anychart.enums.ScaleCompareWithMode|number|Date)=} opt_value
 * @return {anychart.enums.ScaleCompareWithMode|number|anychart.scales.Linear}
 */
anychart.scales.Linear.prototype.compareWith = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeScaleCompareWithModeMode(opt_value) || anychart.utils.normalizeTimestamp(opt_value);
    if (this.compareWith_ != opt_value) {
      this.compareWith_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.compareWith_;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.applyComparison = function(value, comparisonZero) {
  return this.applyComparison_(value, comparisonZero);
};


/**
 * Polymorphic function to calculate NONE comparison.
 * @param {*} value
 * @param {number} comparisonZero
 * @return {*}
 * @private
 */
anychart.scales.Linear.prototype.makeNoneComparison_ = function(value, comparisonZero) {
  return value;
};


/**
 * Polymorphic function to calculate VALUES comparison.
 * @param {*} value
 * @param {number} comparisonZero
 * @return {*}
 * @private
 */
anychart.scales.Linear.prototype.makeValuesComparison_ = function(value, comparisonZero) {
  return anychart.utils.toNumber(value) - comparisonZero;
};


/**
 * Polymorphic function to calculate PERCENT comparison.
 * @param {*} value
 * @param {number} comparisonZero
 * @return {*}
 * @private
 */
anychart.scales.Linear.prototype.makePercentComparison_ = function(value, comparisonZero) {
  return (anychart.utils.toNumber(value) - comparisonZero) / (comparisonZero || 1) * 100;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.Linear.prototype.serialize = function() {
  var json = anychart.scales.Linear.base(this, 'serialize');
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['stackMode'] = this.stackMode();
  json['stickToZero'] = this.stickToZero();
  return json;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.Linear.base(this, 'setupByJSON', config, opt_default);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.stackMode(config['stackMode']);
  this.stickToZero(config['stickToZero']);
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for linear scale.
 * @example <t>lineChart</t>
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.yScale(anychart.scales.linear());
 * @return {anychart.scales.Linear} Linear scale.
 */
anychart.scales.linear = function() {
  return new anychart.scales.Linear();
};


//exports
(function() {
  var proto = anychart.scales.Linear.prototype;
  goog.exportSymbol('anychart.scales.linear', anychart.scales.linear);//doc|ex
  proto['transform'] = proto.transform;//doc|ex
  proto['inverseTransform'] = proto.inverseTransform;//doc|ex
  proto['getType'] = proto.getType;
  proto['ticks'] = proto.ticks;//doc|ex
  proto['minorTicks'] = proto.minorTicks;//doc|ex
  proto['stackMode'] = proto.stackMode;//inherited
  proto['stickToZero'] = proto.stickToZero;
  proto['softMinimum'] = proto.softMinimum;
  proto['softMaximum'] = proto.softMaximum;
  proto['minimumGap'] = proto.minimumGap;//doc|ex
  proto['maximumGap'] = proto.maximumGap;//doc|ex
  proto['comparisonMode'] = proto.comparisonMode;
  proto['compareWith'] = proto.compareWith;
})();

