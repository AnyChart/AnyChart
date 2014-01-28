goog.provide('anychart.scales.Base');

goog.require('anychart.utils.Invalidatable');


/**
 * @enum {string}
 */
anychart.scales.StackMode = {
  NONE: 'none',
  VALUE: 'value',
  PERCENT: 'percent'
};



/**
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.scales.Base = function() {
  goog.base(this);

  /**
   * The number of current calculation sessions. Each chart starts a calculation session in it's calculate() method and
   * finishes it in it's draw() method beginning.
   * @type {number}
   * @private
   */
  this.autoCalcs_ = 0;
};
goog.inherits(anychart.scales.Base, anychart.utils.Invalidatable);


/**
 * Также может диспатчить состояния SCALE_SETTINGS, SCALE_SETTINGS_HARD, SCALE_STACK_SETTINGS и SCALE_RECATEGORIZED.
 * @type {number}
 */
anychart.scales.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.TICKS_SET;


/**
 * @param {string|number} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to [0, 1] scope.
 */
anychart.scales.Base.prototype.transform = goog.abstractMethod;


/**
 * @param {number} ratio Value to transform in input scope.
 * @return {number|string|undefined} Value transformed to output scope.
 */
anychart.scales.Base.prototype.inverseTransform = goog.abstractMethod;


//region --- Section Internal methods ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Internal methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @return {boolean} Returns true if the scale needs input domain calculations.
 */
anychart.scales.Base.prototype.needsAutoCalc = goog.abstractMethod;


/**
 * Informs scale that an auto range calculation started for the chart, so it should reset it's data range on the first
 * call of this method if needed.
 */
anychart.scales.Base.prototype.startAutoCalc = function() {
  if (!this.autoCalcs_)
    this.resetDataRange();
  this.autoCalcs_++;
};


/**
 * Informs the scale, that an auto range calculation started for the chart in past was ended.
 */
anychart.scales.Base.prototype.finishAutoCalc = function() {
  this.autoCalcs_ = Math.max(this.autoCalcs_ - 1, 0);
};


/**
 * Extends the scale range.
 * @param {...(number|string)} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Base} Itself for chaining.
 */
anychart.scales.Base.prototype.extendDataRange = goog.abstractMethod;


/**
 * Resets scale data range if it needs auto calculation.
 * @return {!anychart.scales.Base} Itself for chaining.
 * @protected
 */
anychart.scales.Base.prototype.resetDataRange = goog.abstractMethod;


/**
 * @return {Array.<(number|string)>} Returns categories array if the scale requires series to categorise their data.
 *    Returns null otherwise.
 */
anychart.scales.Base.prototype.categorisation = function() {
  return null;
};


/**
 * @return {number} Returns category width in ratio to the total space of the scale.
 */
anychart.scales.Base.prototype.getPointWidthRatio = function() {
  // TODO(Anton Saukh): non-Ordinal scales must have min distance between points calculation mechanism.
  return 0;
};
//endregion


//region --- Section Stacking ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Stacking
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Positive stack maximum for percent stacking.
 * @type {number}
 * @private
 */
anychart.scales.Base.prototype.stackMax_ = NaN;


/**
 * Negative stack minimum for percent stacking.
 * @type {number}
 * @private
 */
anychart.scales.Base.prototype.stackMin_ = NaN;


/**
 * Positive stack value.
 * @type {number}
 * @private
 */
anychart.scales.Base.prototype.stackPositive_ = 0;


/**
 * Negative stack value.
 * @type {number}
 * @private
 */
anychart.scales.Base.prototype.stackNegative_ = 0;


/**
 * @type {boolean}
 * @private
 */
anychart.scales.Base.prototype.stackMissing_ = false;


/**
 * Stacking mode.
 * @type {anychart.scales.StackMode}
 * @private
 */
anychart.scales.Base.prototype.stackMode_ = anychart.scales.StackMode.NONE;


/**
 * Accepts 'none', 'value', 'percent'.
 * @param {anychart.scales.StackMode=} opt_stackMode Stack mode if used as setter.
 * @return {anychart.scales.Base|anychart.scales.StackMode} StackMode or itself for chaining.
 */
anychart.scales.Base.prototype.stackMode = function(opt_stackMode) {
  if (goog.isDef(opt_stackMode)) {
    var str = ('' + opt_stackMode).toLowerCase();
    var res, fn;
    if (str == /** @type {string} */(anychart.scales.StackMode.PERCENT)) {
      res = anychart.scales.StackMode.PERCENT;
      fn = this.applyModePercent_;
    } else if (str == /** @type {string} */(anychart.scales.StackMode.VALUE)) {
      res = anychart.scales.StackMode.VALUE;
      fn = this.applyModeValue_;
    } else {
      res = anychart.scales.StackMode.NONE;
      fn = this.applyModeNone_;
    }
    if (this.stackMode_ != res) {
      this.stackMode_ = res;
      this.applyStacking = fn;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
    }
    return this;
  }
  return this.stackMode_;
};


/**
 * Applies positive stack top as a stack max for current iteration.
 * @param {number} min Negative stack limit.
 * @param {number} max Positive stack limit.
 * @return {anychart.scales.Base} Returns itself for chaining.
 */
anychart.scales.Base.prototype.setStackRange = function(min, max) {
  this.stackMin_ = Math.min(min, max, 0);
  this.stackMax_ = Math.max(max, min, 0);
  return this;
};


/**
 * Resets current stack to initial value.
 * @return {anychart.scales.Base} .
 */
anychart.scales.Base.prototype.resetStack = function() {
  this.stackPositive_ = 0;
  this.stackNegative_ = 0;
  this.stackMissing_ = false;
  return this;
};


/**
 * Applies stacking to passed value.
 * @param {*} value Data value.
 * @return {*} Stacked data value.
 */
anychart.scales.Base.prototype.applyStacking = anychart.scales.Base.prototype.applyModeNone_;


/**
 * Returns previously stacked value.
 * @param {*} value Data value.
 * @return {number} Previously stacked data value. Returns 0, if prev value was NaN.
 */
anychart.scales.Base.prototype.getPrevVal = function(value) {
  if (this.stackMode_ != anychart.scales.StackMode.NONE && goog.isNumber(value) && !isNaN(value)) {
    if (value >= 0)
      return this.stackPositive_;
    else
      return this.stackNegative_;
  } else
    return 0;
};


/**
 * @return {boolean} .
 */
anychart.scales.Base.prototype.isStackValMissing = function() {
  return this.stackMissing_;
};


/**
 * Apply stack function for NONE mode of Stacker.
 * @param {*} value Data value.
 * @return {*} Stacked data value.
 * @private
 */
anychart.scales.Base.prototype.applyModeNone_ = function(value) {
  return value;
};


/**
 * Apply stack function for VALUE mode of Stacker.
 * @param {*} value Data value.
 * @return {*} Stacked data value.
 * @private
 */
anychart.scales.Base.prototype.applyModeValue_ = function(value) {
  var isNotMissing = goog.isNumber(value) && !isNaN(value);
  if (isNotMissing) {
    if (/** @type {number} */(value) >= 0) {
      value = this.stackPositive_ += /** @type {number} */(value); // both value and stackVal become a sum of them.
    } else {
      value = this.stackNegative_ += /** @type {number} */(value); // both value and stackVal become a sum of them.
    }
  }
  this.stackMissing_ = !isNotMissing;
  return value;
};


/**
 * Apply stack function for PERCENT mode of Stacker.
 * @param {*} value Data value.
 * @return {*} Stacked data value.
 * @private
 */
anychart.scales.Base.prototype.applyModePercent_ = function(value) {
  var max = /** @type {number} */(value) < 0 ? this.stackMin_ : this.stackMax_;
  return this.applyModeValue_(goog.math.clamp(/** @type {number} */(value) * 100 / max, 0, 100));
};
//endregion
