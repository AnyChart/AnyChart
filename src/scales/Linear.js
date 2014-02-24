goog.provide('anychart.scales.Linear');

goog.require('anychart.scales.Base');
goog.require('anychart.scales.LinearTicks');



/**
 * Represents simple linear scale that transforms values from domain [a, b] to domain [a`, b`].
 * Note, that a can be greater than b and a` can be greater than b`. The only condition for the scale is that both
 * domains should not be empty, e.g. a != b and a` != b`.
 * @constructor
 * @extends {anychart.scales.Base}
 */
anychart.scales.Linear = function() {
  /**
   * Major ticks for the scale.
   * @type {anychart.scales.LinearTicks}
   * @private
   */
  this.ticks_ = null;

  /**
   * Minor ticks of the scale.
   * @type {anychart.scales.LinearTicks}
   * @private
   */
  this.minorTicks_ = null;

  /**
   * Scale input domain minimum.
   * @type {number}
   * @private
   */
  this.dataRangeMin_ = 0;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @private
   */
  this.dataRangeMax_ = 1;

  /**
   * @type {boolean}
   * @private
   */
  this.minimumModeAuto_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.maximumModeAuto_ = true;

  /**
   * @type {number}
   * @private
   */
  this.minimumRangeBasedGap_ = 0.1;

  /**
   * @type {number}
   * @private
   */
  this.maximumRangeBasedGap_ = 0.1;

  /**
   * @type {number}
   * @private
   */
  this.minimum_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.maximum_ = 1;

  /**
   * @type {number}
   * @private
   */
  this.range_ = 1;

  /**
   * Internal consistency flag.
   * @type {boolean}
   * @private
   */
  this.consistent_ = false;

  goog.base(this);
};
goog.inherits(anychart.scales.Linear, anychart.scales.Base);


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.LinearTicks)} Ticks or itself for chaining.
 */
anychart.scales.Linear.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.scales.LinearTicks(this);
    this.registerDisposable(this.ticks_);
    this.ticks_.listenInvalidation(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.ticks_.set(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * Gets or sets a set of scale minor ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.LinearTicks)} Ticks or itself for chaining.
 */
anychart.scales.Linear.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.scales.LinearTicks(this);
    this.registerDisposable(this.minorTicks_);
    this.minorTicks_.listen(anychart.utils.Invalidatable.INVALIDATED, this.ticksInvalidated_, false, this);
  }
  if (goog.isDef(opt_value)) {
    this.minorTicks_.set(opt_value);
    return this;
  }
  return this.minorTicks_;
};


/**
 * Gets or sets scale minimum.
 * @param {*=} opt_value Value to set.
 * @return {*} Scale minimum.
 */
anychart.scales.Linear.prototype.minimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var auto = goog.isNull(opt_value) || isNaN(opt_value);
    var val = auto ? NaN : +opt_value;
    if (auto != this.minimumModeAuto_ || (!auto && val != this.minimum_)) {
      var isHardChange = this.minimumModeAuto_ == false && this.maximumModeAuto_;
      this.minimumModeAuto_ = auto;
      this.minimum_ = val;
      this.consistent_ = false;
      this.dispatchInvalidationEvent(isHardChange ?
          anychart.utils.ConsistencyState.SCALE_SETTINGS_HARD :
          anychart.utils.ConsistencyState.SCALE_SETTINGS);
    }
    return this;
  }
  this.calculate();
  return this.minimum_;
};


/**
 * Gets or sets scale maximum.
 * @param {*=} opt_value Value to set.
 * @return {*} Scale maximum.
 */
anychart.scales.Linear.prototype.maximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var auto = goog.isNull(opt_value) || isNaN(opt_value);
    var val = auto ? NaN : +opt_value;
    if (auto != this.maximumModeAuto_ || (!auto && val != this.maximum_)) {
      var isHardChange = this.maximumModeAuto_ == false && this.minimumModeAuto_;
      this.maximumModeAuto_ = auto;
      this.maximum_ = val;
      this.consistent_ = false;
      this.dispatchInvalidationEvent(isHardChange ?
          anychart.utils.ConsistencyState.SCALE_SETTINGS_HARD :
          anychart.utils.ConsistencyState.SCALE_SETTINGS);
    }
    return this;
  }
  this.calculate();
  return this.maximum_;
};


/**
 * Resets scale data range if it needs auto calculation.
 * @return {!anychart.scales.Linear} Itself for chaining.
 * @protected
 */
anychart.scales.Linear.prototype.resetDataRange = function() {
  this.dataRangeMin_ = Number.MAX_VALUE;
  this.dataRangeMax_ = -Number.MAX_VALUE;
  this.consistent_ = false;
  return this;
};


/**
 * Extends the scale range.
 * @param {...(number|string)} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Base} Itself for chaining.
 */
anychart.scales.Linear.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = +arguments[i];
    if (value < this.dataRangeMin_)
      this.dataRangeMin_ = value;
    if (value > this.dataRangeMax_)
      this.dataRangeMax_ = value;
  }
  this.consistent_ = false;
  return this;
};


/**
 * @return {boolean} Returns true if the scale needs input domain auto calculations.
 */
anychart.scales.Linear.prototype.needsAutoCalc = function() {
  return this.minimumModeAuto_ || this.maximumModeAuto_;
};


/**
 * @param {number|string} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to scope [0, 1].
 */
anychart.scales.Linear.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();
  return (value - this.minimum_) / this.range_;
};


/**
 * @param {number} ratio Value in scope [0, 1] to transform into input scope.
 * @return {number} Value transformed to output scope.
 */
anychart.scales.Linear.prototype.inverseTransform = function(ratio) {
  this.calculate();
  return ratio * this.range_ + this.minimum_;
};


/**
 * Ensures that ticks are initialized for the scale.
 * NOTE: THIS METHOD IS FOR INTERNAL USE IN THE SCALE AND TICKS ONLY. DO NOT PUBLISH IT.
 */
anychart.scales.Linear.prototype.calculate = function() {
  if (this.consistent_ && this.isConsistent()) return;
  var range = this.dataRangeMax_ - this.dataRangeMin_;
  if (!range) {
    this.dataRangeMin_ -= 0.5;
    this.dataRangeMax_ += 0.5;
    range = 1;
  }

  var newRange = this.ticks().setup(
      [
        this.minimumModeAuto_ ? (this.dataRangeMin_ - range * this.minimumRangeBasedGap_) : this.minimum_,
        this.maximumModeAuto_ ? (this.dataRangeMax_ + range * this.maximumRangeBasedGap_) : this.maximum_
      ],
      this.minimumModeAuto_, this.maximumModeAuto_);

  //this.minorTicks().setup(this.ticks().get(), false, false);

  if (this.minimumModeAuto_)
    this.minimum_ = newRange[0];

  if (this.maximumModeAuto_)
    this.maximum_ = newRange[1];

  this.range_ = this.maximum_ - this.minimum_;

  this.consistent_ = true;
  this.markConsistent(anychart.utils.ConsistencyState.TICKS_SET);
};


/**
 * Ticks invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.scales.Linear.prototype.ticksInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.TICKS_SET))
    this.invalidate(anychart.utils.ConsistencyState.TICKS_SET);
};
