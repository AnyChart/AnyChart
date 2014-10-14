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
   * If the scale is consistent. We can't use consistency states management due to the same behaviour for all scales.
   * @type {boolean}
   * @protected
   */
  this.consistent = false;
};
goog.inherits(anychart.scales.ScatterBase, anychart.scales.Base);


/**
 * Getter for scale minimum.
 * @return {number} Current scale minimum.
 *//**
 * Setter for scale minimum.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.95]);
 * chart.yScale().minimum(1.3);
 * @param {number=} opt_value Value to set.
 * @return {!anychart.scales.ScatterBase} An instance of {@link anychart.scales.ScatterBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.ScatterBase} Scale minimum.
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
 * Getter for scale maximum.
 * @return {number} Current scale maximum.
 *//**
 * Setter for scale maximum.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.95]);
 * chart.yScale().maximum(1.6);
 * @param {number=} opt_value Value to set.
 * @return {!anychart.scales.ScatterBase} An instance of {@link anychart.scales.ScatterBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.ScatterBase} Scale maximum.
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
 * Getter for scale minimum gap.
 * @return {number} Current scale minimum gap.
 *//**
 * Scale minimum gap.<br/>
 * <b>Note:</b> Gap works only if scale minimum is not set explicitly using {@link anychart.scales.ScatterBase#minimum}.
 * @shortDescription Setter for scale minimum gap.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.95]);
 * chart.yScale().minimumGap(0.6);
 * @param {number=} opt_value Value from 0 to 1.
 * @return {!anychart.scales.ScatterBase} {@link anychart.scales.ScatterBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.ScatterBase} .
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
 * Getter for scale maximum gap.
 * @return {number} Current scale maximum gap.
 *//**
 * Scale maximum gap.<br/>
 * <b>Note:</b> Gap works only if scale minimum is not set explicitly using {@link anychart.scales.ScatterBase#maximum}.
 * @shortDescription Setter for scale maximum gap.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.95]);
 * chart.yScale().maximumGap(0.6);
 * @param {number=} opt_value Value from 0 to 1.
 * @return {!anychart.scales.ScatterBase} {@link anychart.scales.ScatterBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.ScatterBase} .
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
  if (opt_stackMode == anychart.enums.ScaleStackMode.PERCENT) {
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
  this.consistent = false;
  return this;
};


/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).<br/>
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.ScatterBase} {@link anychart.scales.ScatterBase} instance for method chaining.
 */
anychart.scales.ScatterBase.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = +arguments[i];
    if (isNaN(value)) value = parseFloat(arguments[i]);
    if (value < this.dataRangeMin) {
      this.dataRangeMin = value;
      this.consistent = false;
    }
    if (value > this.dataRangeMax) {
      this.dataRangeMax = value;
      this.consistent = false;
    }
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
 * Returns tick position ratio by its name.<br/>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or <b>chart.draw()</b>.
 * @example
 * var chart = anychart.lineChart();
 * chart.line([1.1, 1.4, 1.2, 1.9]);
 * chart.container(stage).draw();
 * // Trying to get to '1.25' tick position.
 * var position = chart.yScale().transform(1.25);
 * // Returns 0.25
 * @param {*} value Value to transform in input scope.
 * @return {number} Value transformed to scope [0, 1].
 *//**
 * Interface requires us to have opt_subRangeRatio, but it is not used.
 * @ignoreDoc
 * @param {*} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to scope [0, 1].
 */
anychart.scales.ScatterBase.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();
  value = anychart.utils.toNumber(value);
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
  this.determineScaleMinMax();
};


/**
 * Determines this.min, this.max and this.range.
 * @protected
 */
anychart.scales.ScatterBase.prototype.determineScaleMinMax = function() {
  var range = (this.maximumModeAuto ? this.dataRangeMax : this.max) - (this.minimumModeAuto ? this.dataRangeMin : this.min);
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
};


/**
 * Returns tick by its position ratio.<br/>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or <b>chart.draw()</b>.
 * @example
 * var chart = anychart.lineChart();
 * chart.line([1.1, 1.4, 1.2, 1.95]);
 * chart.container(stage).draw();
 * // Draw a red marker on the found tick.
 * chart.lineMarker().value(chart.yScale().inverseTransform(0.39));
 * @param {number} ratio Value to transform in input scope.
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


//exports
anychart.scales.ScatterBase.prototype['transform'] = anychart.scales.ScatterBase.prototype.transform;//doc|ex
anychart.scales.ScatterBase.prototype['inverseTransform'] = anychart.scales.ScatterBase.prototype.inverseTransform;//doc|ex
anychart.scales.ScatterBase.prototype['minimum'] = anychart.scales.ScatterBase.prototype.minimum;//doc|ex
anychart.scales.ScatterBase.prototype['maximum'] = anychart.scales.ScatterBase.prototype.maximum;//doc|ex
anychart.scales.ScatterBase.prototype['minimumGap'] = anychart.scales.ScatterBase.prototype.minimumGap;//doc|ex
anychart.scales.ScatterBase.prototype['maximumGap'] = anychart.scales.ScatterBase.prototype.maximumGap;//doc|ex
anychart.scales.ScatterBase.prototype['extendDataRange'] = anychart.scales.ScatterBase.prototype.extendDataRange;//doc|need-ex
anychart.scales.ScatterBase.prototype['stackMode'] = anychart.scales.ScatterBase.prototype.stackMode;//inherited
