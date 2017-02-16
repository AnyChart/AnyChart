goog.provide('anychart.scales.ScatterBase');

goog.require('anychart.scales.Base');



/**
 * Base for all scatter scales (Linear, Logarithmic and DateTime).
 * Doesn't declare any ticks, so different scales can declare their own.
 * @constructor
 * @extends {anychart.scales.Base}
 */
anychart.scales.ScatterBase = function() {
  anychart.scales.ScatterBase.base(this, 'constructor');
  /**
   * Threshold ticks count.
   * @type {number}
   * @private
   */
  this.maxTicksCount_ = 1000;

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
   * Soft minimum setting.
   * @type {number}
   * @protected
   */
  this.softMin = NaN;

  /**
   * Soft maximum setting.
   * @type {number}
   * @protected
   */
  this.softMax = NaN;

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

  /**
   * Flag to stick to zero value on auto calc if gaps lead to zero crossing. Used in Linear scales only.
   * @type {boolean}
   * @protected
   */
  this.stickToZeroFlag = false;
};
goog.inherits(anychart.scales.ScatterBase, anychart.scales.Base);


/**
 * Max ticks count for interval-mode ticks calculation.
 * @param {number=} opt_value
 * @return {number|anychart.scales.ScatterBase}
 */
anychart.scales.ScatterBase.prototype.maxTicksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, 1000, false);
    if (this.maxTicksCount_ != val) {
      this.maxTicksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.maxTicksCount_;
};


/**
 * Getter/setter for minimum.
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.ScatterBase} Scale minimum.
 */
anychart.scales.ScatterBase.prototype.minimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumber(opt_value);
    var auto = isNaN(val);
    if (auto != this.minimumModeAuto || (!auto && val != this.min)) {
      this.minimumModeAuto = auto;
      this.min = val;
      this.softMin = NaN;
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
 * Getter/setter for maximum.
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.ScatterBase} Scale maximum.
 */
anychart.scales.ScatterBase.prototype.maximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumber(opt_value);
    var auto = isNaN(val);
    if (auto != this.maximumModeAuto || (!auto && val != this.max)) {
      this.maximumModeAuto = auto;
      this.max = val;
      this.softMax = NaN;
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
 * Soft minimum getter and setter. If data range minimum is greater than soft minimum, the soft minimum value will
 * become the scale minimum.
 * @param {number=} opt_value
 * @return {!(anychart.scales.ScatterBase|number)}
 */
anychart.scales.ScatterBase.prototype.softMinimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!(isNaN(opt_value) && isNaN(this.softMin)) && opt_value != this.softMin) {
      this.softMin = opt_value;
      this.min = NaN;
      this.minimumModeAuto = true;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.softMin;
};


/**
 * Soft maximum getter and setter. If data range maximum is less than soft maximum, the soft maximum value will
 * become the scale maximum.
 * @param {number=} opt_value
 * @return {!(anychart.scales.ScatterBase|number)}
 */
anychart.scales.ScatterBase.prototype.softMaximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!(isNaN(opt_value) && isNaN(this.softMax)) && opt_value != this.softMax) {
      this.softMax = opt_value;
      this.max = NaN;
      this.maximumModeAuto = true;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.softMax;
};


/**
 * Getter/setter for minimumGap.
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
 * Getter/setter for maximumGap.
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
  var result = anychart.scales.ScatterBase.base(this, 'stackMode', opt_stackMode);
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
  this.dataRangeMin = Infinity;
  this.dataRangeMax = -Infinity;
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
 * Interface requires us to have opt_subRangeRatio, but it is not used.
 * @param {*} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to scope [0, 1].
 */
anychart.scales.ScatterBase.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();
  value = anychart.utils.toNumber(value);
  return this.applyZoomAndInverse((value - this.min) / this.range);
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
  if (!isFinite(this.dataRangeMax)) {
    if (!isFinite(this.dataRangeMin)) {
      this.dataRangeMin = 0;
      this.dataRangeMax = 1;
    } else {
      this.dataRangeMax = this.dataRangeMin + 1;
    }
  } else if (!isFinite(this.dataRangeMin)) {
    this.dataRangeMin = this.dataRangeMax - 1;
  } else if (anychart.math.roughlyEqual(this.dataRangeMin, this.dataRangeMax, 1e-10)) {
    this.dataRangeMin -= 0.5;
    this.dataRangeMax += 0.5;
  }

  var max = this.maximumModeAuto ?
      (isNaN(this.softMax) ?
          this.dataRangeMax :
          Math.max(this.dataRangeMax, this.softMax)) :
      this.max;
  var min = this.minimumModeAuto ?
      (isNaN(this.softMin) ?
          this.dataRangeMin :
          Math.min(this.dataRangeMin, this.softMin)) :
      this.min;
  var range = max - min;

  if (Math.abs(range) < 1e-4 && !this.minimumModeAuto && !this.maximumModeAuto) this.max += 1e-4;

  if (this.minimumModeAuto) {
    this.min = this.dataRangeMin - range * this.minimumRangeBasedGap;
    if (!isNaN(this.softMin)) {
      if (range > 0)
        this.min = Math.min(this.min, this.softMin);
      else
        this.min = Math.max(this.min, this.softMin);
    }
    if (this.stickToZeroFlag && this.min < 0 && this.dataRangeMin >= 0 && this.min != this.softMin)
      this.min = 0;
  }

  if (this.maximumModeAuto) {
    this.max = this.dataRangeMax + range * this.maximumRangeBasedGap;
    if (!isNaN(this.softMax)) {
      if (range > 0)
        this.max = Math.max(this.max, this.softMax);
      else
        this.max = Math.min(this.max, this.softMax);
    }
    if (this.stickToZeroFlag && this.max < 0 && this.dataRangeMax >= 0 && this.max != this.softMax)
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
  ratio = this.reverseZoomAndInverse(ratio);
  return ratio * this.range + this.min;
};


/** @inheritDoc */
anychart.scales.ScatterBase.prototype.serialize = function() {
  var json = anychart.scales.ScatterBase.base(this, 'serialize');
  json['maximum'] = this.maximumModeAuto ? null : this.max;
  json['minimum'] = this.minimumModeAuto ? null : this.min;
  json['minimumGap'] = this.minimumGap();
  json['maximumGap'] = this.maximumGap();
  json['softMinimum'] = isNaN(this.softMin) ? null : this.softMin;
  json['softMaximum'] = isNaN(this.softMax) ? null : this.softMax;
  json['maxTicksCount'] = this.maxTicksCount_;
  return json;
};


/** @inheritDoc */
anychart.scales.ScatterBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.ScatterBase.base(this, 'setupByJSON', config, opt_default);
  this.minimumGap(config['minimumGap']);
  this.maximumGap(config['maximumGap']);
  this.softMinimum(config['softMinimum']);
  this.softMaximum(config['softMaximum']);
  this.minimum(config['minimum']);
  this.maximum(config['maximum']);
  this.maxTicksCount(config['maxTicksCount']);
};


/**
 * @param {string} type
 * @param {boolean=} opt_canReturnNull
 * @return {anychart.scales.ScatterBase}
 */
anychart.scales.ScatterBase.fromString = function(type, opt_canReturnNull) {
  type = (type + '').toLowerCase();
  switch (type) {
    case 'log':
    case 'logarithmic':
      return anychart.scales.log();
    case 'lin':
    case 'linear':
      return anychart.scales.linear();
    case 'date':
    case 'datetime':
    case 'dt':
      return anychart.scales.dateTime();
    default:
      return opt_canReturnNull ? null : anychart.scales.linear();
  }
};


//exports
(function() {
  var proto = anychart.scales.ScatterBase.prototype;
  proto['maxTicksCount'] = proto.maxTicksCount;
  proto['minimum'] = proto.minimum;//doc|ex
  proto['maximum'] = proto.maximum;//doc|ex
  proto['extendDataRange'] = proto.extendDataRange;//doc|need-ex
})();
