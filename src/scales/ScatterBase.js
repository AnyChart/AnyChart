goog.provide('anychart.scales.ScatterBase');

goog.require('anychart.scales.Base');
goog.require('anychart.scales.Continuous');



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
  this.maxTicksCount_ = NaN;

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
   */
  this.seenData = true;

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
   * Transformer.
   * @type {anychart.scales.Continuous}
   * @protected
   */
  this.transformer = null;

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

      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.max;
};


/**
 * Getter/setter for a setting that turns minimum alignment by interval on or off.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.scales.ScatterBase}
 */
anychart.scales.ScatterBase.prototype.alignMinimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.alignMinimumVal != opt_value) {
      this.alignMinimumVal = opt_value;
      if (this.minimumModeAuto) {
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  return this.alignMinimumVal;
};


/**
 * Getter/setter for a setting that turns maximum alignment by interval on or off.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.scales.ScatterBase}
 */
anychart.scales.ScatterBase.prototype.alignMaximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.alignMaximumVal != opt_value) {
      this.alignMaximumVal = opt_value;
      if (this.maximumModeAuto) {
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  return this.alignMaximumVal;
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
anychart.scales.ScatterBase.prototype.inversionOrZoomChanged = function() {
  this.consistent = false;
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
  this.seenData = false;
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
    if (isNaN(value))
      value = parseFloat(arguments[i]);
    if (!isNaN(value)) {
      this.seenData = true;
      if (value < this.dataRangeMin) {
        this.dataRangeMin = value;
        this.consistent = false;
      }
      if (value > this.dataRangeMax) {
        this.dataRangeMax = value;
        this.consistent = false;
      }
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
  return Number(this.transformer.transform(value));
};


/**
 * Ensures that ticks are initialized for the scale.
 * NOTE: THIS METHOD IS FOR INTERNAL USE IN THE SCALE AND TICKS ONLY. DO NOT PUBLISH IT.
 */
anychart.scales.ScatterBase.prototype.calculate = function() {
  if (!this.consistent) {
    this.consistent = true;
    this.determineScaleMinMax();
    this.setupTicks();
    this.setupTransformer();
  }
};


/**
 * Should setup specific ticks.
 */
anychart.scales.ScatterBase.prototype.setupTicks = function() {};


/**
 * Should setup specific transformer.
 */
anychart.scales.ScatterBase.prototype.setupTransformer = function() {
  if (!this.transformer) {
    this.transformer = new anychart.scales.Continuous();
  }
  var offset = this.zoomStart * this.zoomFactor;
  var range = [-offset, this.zoomFactor - offset];
  if (this.isInverted) {
    range.reverse();
  }
  this.transformer.range(range);
};


/**
 * Determines this.min, this.max and this.range.
 * @protected
 */
anychart.scales.ScatterBase.prototype.determineScaleMinMax = function() {
  var tmp;
  var cannotChangeMin = !this.minimumModeAuto;
  var cannotChangeMax = !this.maximumModeAuto;

  var percentStack = this.stackMode() == anychart.enums.ScaleStackMode.PERCENT;

  if (cannotChangeMin) {
    this.extendDataRange(this.min);
  }
  if (cannotChangeMax) {
    this.extendDataRange(this.max);
  }
  if (!this.seenData) {
    // the only case - if both min and max are auto and there were no data
    this.dataRangeMin = 0;
    this.dataRangeMax = percentStack ? 100 : 1;
  }

  var min = cannotChangeMin ? this.min : this.dataRangeMin;
  var max = cannotChangeMax ? this.max : this.dataRangeMax;
  // invariants at this point:
  // 1) min <= max
  // 2) min < Infinity
  // 3) max > -Infinity

  if (!cannotChangeMin && min >= this.softMin) { // also handles NaN check
    min = this.softMin;
    cannotChangeMin = true;
  }

  if (!cannotChangeMax && max <= this.softMax) { // also handles NaN check
    max = this.softMax;
    cannotChangeMax = true;
  }

  if (anychart.math.roughlyEqual(min, max, 1e-6)) {
    var d;
    if (min == max) {
      d = .5;
    } else {
      // DVF-3900 fix
      // the value that we should subtract and plus should be less then exp number
      // we take minimum data range exponential notation
      var exponentialNotation = min.toExponential(); // example "1e-6"

      var power = exponentialNotation.split('e')[1];
      var absPower = Math.abs(power);
      
      // we increment it by 1, to make smaller, and calculate delta
      d = +('1e-' + Math.max(absPower + 1, 5));
    }
    if (cannotChangeMax) {
      min -= d * 2;
    } else if (cannotChangeMin) {
      max += d * 2;
    } else {
      min -= d;
      max += d;
    }
  }

  if (percentStack) {
    cannotChangeMin = cannotChangeMax = true;
  }

  tmp = this.applyGaps(min, max, !cannotChangeMin, !cannotChangeMax, this.stickToZeroFlag, true);
  this.min = tmp.min;
  this.max = tmp.max;
  this.borderLog = tmp.borderLog || 0;
};


/**
 * Applies gaps.
 * @param {number} min
 * @param {number} max
 * @param {boolean} canChangeMin
 * @param {boolean} canChangeMax
 * @param {boolean} stickToZero
 * @param {boolean} round
 * @return {{max: number, min: number}}
 * @protected
 */
anychart.scales.ScatterBase.prototype.applyGaps = function(min, max, canChangeMin, canChangeMax, stickToZero, round) {
  var range = max - min;
  var minimumGap = range * this.minimumRangeBasedGap;
  var maximumGap = range * this.maximumRangeBasedGap;
  return {
    max: canChangeMax ? this.applyGap_(max, maximumGap, stickToZero, round, 1) : max,
    min: canChangeMin ? this.applyGap_(min, minimumGap, stickToZero, round, -1) : min
  };
};


/**
 * Applies gap to value.
 * @param {number} value Value that need to be gaped.
 * @param {number} gap Gap that should be applied.
 * @param {boolean} stickToZero Whether to take into account stickToZero flag.
 * @param {boolean} round Should we use round in calculation.
 * @param {number} sign (1, -1) to indicate max or min gap we applying.
 * @return {number} Value with applied gap.
 * @private
 */
anychart.scales.ScatterBase.prototype.applyGap_ = function(value, gap, stickToZero, round, sign) {
  var gapedValue = value + sign * gap;

  if (stickToZero && (value * gapedValue <= 0))
    return 0;

  if (round) {
    var roundedGapedValue = anychart.math.specialRound(gapedValue);
    var digitsCount = Math.min(anychart.math.getPrecision(roundedGapedValue), anychart.math.getPrecision(gapedValue));
    var adjuster = +('1e-' + (digitsCount + 1));
    if (roundedGapedValue > gapedValue) {
      roundedGapedValue = roundedGapedValue + sign * adjuster;
    }
    gapedValue = roundedGapedValue;
  }

  return gapedValue;
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
  return this.transformer.inverseTransform(ratio);
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
  json['softMaximum'] = isNaN(this.softMax) ? null : this.softMax;
  json['alignMinimum'] = this.alignMinimumVal;
  json['alignMaximum'] = this.alignMaximumVal;
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
  this.alignMinimum(config['alignMinimum']);
  this.alignMaximum(config['alignMaximum']);
  this.maxTicksCount(config['maxTicksCount']);
};


/**
 * @param {string} type
 * @param {boolean=} opt_canReturnNull
 * @return {anychart.scales.ScatterBase}
 */
anychart.scales.ScatterBase.fromString = function(type, opt_canReturnNull) {
  switch (type) {
    case anychart.enums.ScaleTypes.LOG:
      return anychart.scales.log();
    case anychart.enums.ScaleTypes.LINEAR:
      return anychart.scales.linear();
    case anychart.enums.ScaleTypes.DATE_TIME:
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
