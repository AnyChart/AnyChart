goog.provide('anychart.scales.ScatterBase');

goog.require('anychart.scales.Base');



/**
 * Base for all scatter scales (Linear, Logarithmic and DateTime).
 * Doesn't declare any ticks, so different scales can declare their own.
 * @constructor
 * @extends {anychart.scales.Base}
 */
anychart.scales.ScatterBase = function() {
  goog.base(this);
  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMin = 0;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMax = 1;

  /**
   * @type {boolean}
   * @protected
   */
  this.minimumModeAuto = true;

  /**
   * @type {boolean}
   * @protected
   */
  this.maximumModeAuto = true;

  /**
   * @type {number}
   * @protected
   */
  this.minimumRangeBasedGap = 0.1;

  /**
   * @type {number}
   * @protected
   */
  this.maximumRangeBasedGap = 0.1;

  /**
   * @type {number}
   * @protected
   */
  this.min = NaN;

  /**
   * @type {number}
   * @protected
   */
  this.max = NaN;

  /**
   * @type {number}
   * @protected
   */
  this.range = 1;

  /**
   * If the scale is consistent. We can't use consistency states mechanic due to the same behaviour for all scales.
   * @type {boolean}
   * @protected
   */
  this.consistent = false;
};
goog.inherits(anychart.scales.ScatterBase, anychart.scales.Base);


/**
 * Gets or sets scale minimum.
 * @param {*=} opt_value Value to set.
 * @return {*} Scale minimum.
 */
anychart.scales.ScatterBase.prototype.minimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.isNull(opt_value) ? NaN : +opt_value;
    var auto = isNaN(val);
    if (auto != this.minimumModeAuto || (!auto && val != this.min)) {
      this.minimumModeAuto = auto;
      this.min = val;
      this.consistent = false;
      if (auto)
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      else
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.min;
};


/**
 * Gets or sets scale maximum.
 * @param {*=} opt_value Value to set.
 * @return {*} Scale maximum.
 */
anychart.scales.ScatterBase.prototype.maximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.isNull(opt_value) ? NaN : +opt_value;
    var auto = isNaN(val);
    if (auto != this.maximumModeAuto || (!auto && val != this.max)) {
      this.maximumModeAuto = auto;
      this.max = val;
      this.consistent = false;
      if (auto)
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      else
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.max;
};


/**
 * Gets or sets scale minimum range based gap.
 * @param {number=} opt_value Value to set.
 * @return {*} Scale minimum.
 */
anychart.scales.ScatterBase.prototype.minimumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.minimumRangeBasedGap != opt_value) {
      this.minimumRangeBasedGap = opt_value;
      if (this.minimumModeAuto) {
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  return this.minimumRangeBasedGap;
};


/**
 * Gets or sets scale maximum range based gap.
 * @param {number=} opt_value Value to set.
 * @return {*} Scale maximum.
 */
anychart.scales.ScatterBase.prototype.maximumGap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.maximumRangeBasedGap != opt_value) {
      this.maximumRangeBasedGap = opt_value;
      if (this.maximumModeAuto) {
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  return this.maximumRangeBasedGap;
};


/** @inheritDoc */
anychart.scales.ScatterBase.prototype.stackMode = function(opt_stackMode) {
  this.suspendSignalsDispatching();
  if (opt_stackMode == anychart.scales.StackMode.PERCENT) {
    this.minimumGap(0);
    this.maximumGap(0);
  }
  var result = goog.base(this, 'stackMode', opt_stackMode);
  this.resumeSignalsDispatching(true);
  return result;
};


/**
 * Resets scale data range if it needs auto calculation.
 * @return {!anychart.scales.ScatterBase} Itself for chaining.
 * @protected
 */
anychart.scales.ScatterBase.prototype.resetDataRange = function() {
  this.oldDataRangeMin = this.dataRangeMin;
  this.oldDataRangeMax = this.dataRangeMax;
  this.dataRangeMin = Number.MAX_VALUE;
  this.dataRangeMax = -Number.MAX_VALUE;
  return this;
};


/**
 * Extends the scale range.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.ScatterBase} Itself for chaining.
 */
anychart.scales.ScatterBase.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = +arguments[i];
    if (isNaN(value)) value = parseFloat(arguments[i]);
    if (value < this.dataRangeMin)
      this.dataRangeMin = value;
    if (value > this.dataRangeMax)
      this.dataRangeMax = value;
  }
  return this;
};


/** @inheritDoc */
anychart.scales.ScatterBase.prototype.checkScaleChanged = function(silently) {
  var res = (this.oldDataRangeMin != this.dataRangeMin) || (this.oldDataRangeMax != this.dataRangeMax);
  if (res) {
    this.consistent = false;
    if (!silently)
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return res;
};


/**
 * @return {boolean} Returns true if the scale needs input domain auto calculations.
 */
anychart.scales.ScatterBase.prototype.needsAutoCalc = function() {
  return this.minimumModeAuto || this.maximumModeAuto;
};


/**
 * @param {*} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to scope [0, 1].
 */
anychart.scales.ScatterBase.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();
  var result = (+(/** @type {number} */(value)) - this.min) / this.range;
  return this.isInverted ? 1 - result : result;
};


/**
 * Ensures that ticks are initialized for the scale.
 * NOTE: THIS METHOD IS FOR INTERNAL USE IN THE SCALE AND TICKS ONLY. DO NOT PUBLISH IT.
 */
anychart.scales.ScatterBase.prototype.calculate = function() {
  if (this.consistent) return;
  this.consistent = true;
  var range = this.dataRangeMax - this.dataRangeMin;
  if (!range) {
    this.dataRangeMin -= 0.5;
    this.dataRangeMax += 0.5;
    range = 1;
  }

  if (this.minimumModeAuto) {
    this.min = this.dataRangeMin - range * this.minimumRangeBasedGap;
    if (this.min < 0 && this.dataRangeMin >= 0)
      this.min = 0;
  }

  if (this.maximumModeAuto) {
    this.max = this.dataRangeMax + range * this.maximumRangeBasedGap;
    if (this.max < 0 && this.dataRangeMax >= 0)
      this.max = 0;
  }

  this.range = this.max - this.min;
};


/**
 * @param {number} ratio Value in scope [0, 1] to transform into input scope.
 * @return {*} Value transformed to output scope.
 */
anychart.scales.ScatterBase.prototype.inverseTransform = function(ratio) {
  this.calculate();
  if (this.isInverted) ratio = 1 - ratio;
  return ratio * this.range + this.min;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.ScatterBase.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['minimum'] = this.minimumModeAuto ? null : this.minimum();
  data['maximum'] = this.maximumModeAuto ? null : this.maximum();
  data['minimumGap'] = this.minimumGap();
  data['maximumGap'] = this.maximumGap();
  data['dataRangeMin'] = this.dataRangeMin;
  data['dataRangeMax'] = this.dataRangeMax;
  return data;
};


/** @inheritDoc */
anychart.scales.ScatterBase.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', value);

  this.minimum(goog.isNull(value['minimum']) ? NaN : value['minimum']);
  this.maximum(goog.isNull(value['maximum']) ? NaN : value['maximum']);

  this.minimumGap(value['minimumGap']);
  this.maximumGap(value['maximumGap']);
  this.resumeSignalsDispatching(true);
  return this;
};
