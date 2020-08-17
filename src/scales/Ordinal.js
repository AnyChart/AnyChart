goog.provide('anychart.scales.Ordinal');

goog.require('anychart.enums');
goog.require('anychart.scales.Base');
goog.require('anychart.scales.OrdinalTicks');
goog.require('goog.array');



/**
 * Define Ordinal scale.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.ordinal}.
 * @constructor
 * @extends {anychart.scales.Base}
 */
anychart.scales.Ordinal = function() {
  /**
   * @type {!Array.<*>}
   * @private
   */
  this.values_ = [];

  /**
   * @type {!(Array.<*>|string)}
   * @private
   */
  this.names_ = [];

  /**
   * Weights values as it come from user.
   * @type {!(Array.<number>)}
   * @private
   */
  this.weights_ = [];

  /**
   * Normalized weights values.
   * @type {!(Array.<number>)}
   * @private
   */
  this.resultWeights_ = [];

  /**
   * Weights as ratio values.
   * @type {!(Array.<number>)}
   * @private
   */
  this.weightRatios_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.autoWeights_ = true;

  /**
   * @type {!Object.<number>}
   * @private
   */
  this.valuesMap_ = {};

  /**
   * Prev values set cache.
   * @type {Array.<*>}
   * @private
   */
  this.oldValues_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.autoDomain_ = true;

  /**
   * Ticks for the scale.
   * @type {anychart.scales.OrdinalTicks}
   * @private
   */
  this.ticks_ = null;

  anychart.scales.Ordinal.base(this, 'constructor');

  this.addThemes('defaultScaleSettings.ordinal');
};
goog.inherits(anychart.scales.Ordinal, anychart.scales.Base);


/** @inheritDoc */
anychart.scales.Ordinal.prototype.getType = function() {
  return anychart.enums.ScaleTypes.ORDINAL;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.isMissing = function(value) {
  return !goog.isDef(value);
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Ordinal|anychart.scales.OrdinalTicks)} Ticks or itself for chaining.
 */
anychart.scales.Ordinal.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.scales.OrdinalTicks(this);
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.ticks_.setup(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * Getter/setter for values.
 * @param {(Array.<*>|*|null)=} opt_values Array of values, or values, or null for autocalc.
 * @param {...*} var_args Other values, that should be contained in input domain.
 * @return {!(anychart.scales.Ordinal|Array.<number|string>)} This or input domain.
 */
anychart.scales.Ordinal.prototype.values = function(opt_values, var_args) {
  if (!goog.isDef(opt_values))
    return this.values_;
  if (goog.isNull(opt_values)) {
    if (!this.autoDomain_) {
      this.autoDomain_ = true;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  } else {
    this.autoDomain_ = false;
    var isArray = goog.isArray(opt_values);
    this.resetDataRange();
    if (isArray && opt_values.length)
      this.extendDataRange.apply(this, /** @type {Array} */(opt_values));
    else
      this.extendDataRange.apply(this, arguments);
    if (this.checkScaleChanged(true))
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Getter/setter for names.
 * @param {(Array.<*>|string)=} opt_value Array of names or attribute name for data set.
 * @return {(Array.<*>|anychart.scales.Ordinal)} Scale names or self for chaining.
 */
anychart.scales.Ordinal.prototype.names = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value))
      this.names_ = [];
    else if (goog.isArray(opt_value))
      this.names_ = goog.array.clone(opt_value);
    else {
      // if field name does not set by string or set value the same - return self.
      if (!goog.isString(opt_value) || this.names_ == opt_value)
        return this;
      this.names_ = opt_value;
    }
    this.resultNames_ = null;
    this.ticks().markInvalid();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  if (goog.isArray(this.names_)) {
    if (!this.resultNames_) {
      /**
       * Resulting names to return.
       * Need to avoid original set of names to be changed.
       */
      this.resultNames_ = goog.array.clone(this.names_);
    }

    if (this.resultNames_.length < this.values_.length) {
      while (this.resultNames_.length != this.values_.length) {
        this.resultNames_.push(this.values_[this.resultNames_.length]);
      }
    }

    return this.resultNames_;
  } else {
    return this.autoNames_ || [];
  }
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.checkWeights = function() {
  if (!this.weights_.length) return false;

  // If all values are equal
  for (var i = 1; i < this.weights_.length; i++) {
    if (this.weights_[i] != this.weights_[0])
      break;
  }

  return i != this.weights_.length;
};


/**
 * Getter/setter for weights.
 * @param {Array.<number>=} opt_value Array of weights.
 * @return {(Array.<number>|anychart.scales.Ordinal)} Scale weights or self for chaining.
 */
anychart.scales.Ordinal.prototype.weights = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.updateWeights_(opt_value);
    this.autoWeights_ = !this.weights_.length;
    return this;
  }

  if (this.resultWeights_.length != this.values_.length) {
    this.resultWeights_.length = 0;
    // validate weights values
    var sum = 0;
    var count = 0;
    var length = Math.min(this.weights_.length, this.values_.length);
    var badValue = false;
    for (var i = 0; i < length; i++) {
      var weight = anychart.utils.toNumber(this.weights_[i]);
      if (weight >= 0) {
        sum += weight;
        count++;
        this.resultWeights_.push(weight);
      } else {
        badValue = true;
        this.resultWeights_.push(void 0);
      }
    }

    if (length < this.values_.length || badValue) {
      // add average weights values for undefined indexes
      var avg = count > 0 ? (sum / count) : 1;
      for (var j = 0; j < this.values_.length; j++)
        if (!this.resultWeights_[j])
          this.resultWeights_[j] = avg;
    }
  }

  return this.resultWeights_;
};


/**
 * Updates weights container.
 * @param {Array.<number>} value Array of weights.
 * @private
 */
anychart.scales.Ordinal.prototype.updateWeights_ = function(value) {
  if (goog.isNull(value))
    this.weights_.length = 0;
  else if (goog.isArray(value))
    this.weights_ = goog.array.clone(value);

  if (!this.checkWeights())
    this.weights_.length = 0;

  this.resultWeights_.length = 0;
  this.weightRatios_.length = 0;
  this.ticks().markInvalid();
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/**
 * Wrapper for weights() method. Sets weights as auto calculated and does not affect serialization.
 * @param {Array.<number>} values Array of weights.
 * @return {anychart.scales.Ordinal} Self for chaining.
 */
anychart.scales.Ordinal.prototype.setAutoWeights = function(values) {
  if (this.autoWeights_)
    this.updateWeights_(values);

  return this;
};


/**
 * Getter for weight ratios.
 * @return {Array.<number>} Array of weight ratios. Each ratio is a value from 0 to 1.
 */
anychart.scales.Ordinal.prototype.weightRatios = function() {
  if (!this.weightRatios_ || this.weightRatios_.length != this.values_.length) {
    var weights = this.weights();
    var sum = 0;
    for (var i in weights) {
      sum += weights[i];
    }

    this.weightRatios_ = weights.map(function(val) {
      return val / sum;
    });

    this.weightRatiosSums_ = [0];
    for (var j = 0; j < this.weightRatios_.length; j++)
      this.weightRatiosSums_.push(this.weightRatios_[j] + this.weightRatiosSums_[j]);
  }
  return this.weightRatios_;
};


/**
 * Getter for scale names field name.
 * @return {?string} Field name for alias or null if names set explicit.
 */
anychart.scales.Ordinal.prototype.getNamesField = function() {
  if (goog.isArray(this.names_)) return null;
  else return this.names_;
};


/**
 * Setter for auto calculated scale names (names from dataset using field name)
 * @param {Array.<*>} value Array of auto names.
 */
anychart.scales.Ordinal.prototype.setAutoNames = function(value) {
  this.autoNames_ = value;
};


/**
 * Search value in the values and returns it index.
 * @param {*} value Value which index should be found.
 * @return {number} Index of value or NaN.
 */
anychart.scales.Ordinal.prototype.getIndexByValue = function(value) {
  var index = +this.valuesMap_[anychart.utils.hash(value)];
  if (isNaN(index))
    return NaN;
  return index;
};


/**
 * Returns values map.
 * @return {!Object.<string, number>}
 */
anychart.scales.Ordinal.prototype.getValuesMapInternal = function() {
  return this.valuesMap_;
};


/**
 * Sets pre-calculated values map and array.
 * @param {!Object.<string, number>} valuesMap
 * @param {!Array.<*>} valuesArray
 */
anychart.scales.Ordinal.prototype.setAutoValues = function(valuesMap, valuesArray) {
  this.valuesMap_ = valuesMap;
  this.values_ = valuesArray;
};


/**
 * @return {!anychart.scales.Ordinal} Resets input domain.
 */
anychart.scales.Ordinal.prototype.resetDataRange = function() {
  this.oldValues_ = this.values_;
  this.values_ = [];
  this.valuesMap_ = {};
  this.autoNames_ = null;
  this.resultNames_ = null;
  this.resultWeights_.length = 0;
  this.weightRatios_.length = 0;

  if (this.ticks_)
    this.ticks_.markInvalid();

  return this;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.checkScaleChanged = function(silently) {
  var res = !goog.array.equals(this.oldValues_, this.values_);
  if (res) {
    if (this.ticks_)
      this.ticks_.markInvalid();
    if (!silently)
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return res;
};


/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Ordinal} {@link anychart.scales.Ordinal} instance for method chaining.
 */
anychart.scales.Ordinal.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = arguments[i];
    var hash = anychart.utils.hash(value);
    var index = this.valuesMap_[hash];
    if (!goog.isDef(index)) {
      this.valuesMap_[hash] = this.values_.length;
      this.values_.push(value);
    }
  }
  return this;
};


/**
 * @return {boolean} Returns true if the scale needs input domain auto calculations.
 */
anychart.scales.Ordinal.prototype.needsAutoCalc = function() {
  return this.autoDomain_;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.getPointWidthRatio = function() {
  return 1 / this.values_.length * this.getZoomFactor();
};


/**
 * Scale mode.
 * Identifies categories behaviour.
 *
 * If mode is set to discrete (default value) then drawing representation will be
 *       |-------|-------|-------|
 *           A       B       C
 * This is suitable for drawing discrete series (column, box).
 *
 * Otherwise (continuous) it will be
 * |~~~~~|-----------|-----------|~~~~~|
 *       A           B           C
 * This is suitable for drawing continuous series (line, area).
 *
 * Scale transforms values according formula which takes into account that
 * ('A', 0.5) should be displayed as 0
 * ('C', 0.5) should be 1
 *
 * Example for 3 categories.
 * NB: values a rounded
 *
 *  value, subRangeRatio | discrete | continuous
 * ----------------------|----------|-----------
 *            A,   0     |        0 |        0  (-0.25)
 *            A, 0.5     |     0.16 |        0
 *            A,   1     |     0.33 |     0.25
 *            B,   0     |     0.33 |     0.25
 *            B, 0.5     |     0.50 |     0.50
 *            B,   1     |     0.67 |     0.75
 *            C,   0     |     0.67 |     0.75
 *            C, 0.5     |     0.83 |        1
 *            C,   1     |        1 |        1  (1.25)
 *
 * As you can see categories are widened and center of left category are placed at 0 ratio.
 * Same as center of right category are placed at 1 ratio.
 * Value in bracers shows "actual" values.
 *
 * @param {anychart.enums.OrdinalScaleMode=} opt_value
 * @return {anychart.enums.OrdinalScaleMode|anychart.scales.Ordinal} .
 */
anychart.scales.Ordinal.prototype.mode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrdinalScaleMode(opt_value);
    if (this.mode_ != opt_value) {
      this.mode_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.mode_;
};


/**
 * Returns tick position ratio by its name.<br/>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or <b>chart.draw()</b>.
 * @example
 * var chart = anychart.line();
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.container(stage).draw();
 * // Trying to get 'A2' position ratio.
 * var position = chart.xScale().transform('A2', 0.5);
 * // Returns 0.375
 * @param {*} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to output scope.
 */
anychart.scales.Ordinal.prototype.transform = function(value, opt_subRangeRatio) {
  var index = this.getIndexByValue(value);
  var k = index;
  if (isNaN(index)) return NaN;

  var result;
  if (this.checkWeights()) {
    result = (opt_subRangeRatio || 0) * this.weightRatios()[k] + this.weightRatiosSums_[k];

  } else {
    // just to short the length of code
    var n = this.values_.length;
    result = index / n + (opt_subRangeRatio || 0) / n;
    if (this.mode_ === anychart.enums.OrdinalScaleMode.CONTINUOUS) {
      result = (result * n - 0.5) / (n - 1);
      result = goog.math.clamp(result, 0, 1);
    }
  }
  return this.applyZoomAndInverse(result);
};


/**
 * Returns tick name by its ratio position.<br/>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or <b>chart.draw()</b>.
 * @example
 * var chart = anychart.lineChart();
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.container(stage).draw();
 * // Trying to get a tick.
 * var position = chart.xScale().inverseTransform(0.375);
 * // Returns 'A2'.
 * @param {number} ratio Value to transform in input scope.
 * @return {*} Value transformed to output scope.
 */
anychart.scales.Ordinal.prototype.inverseTransform = function(ratio) {
  ratio = this.reverseZoomAndInverse(ratio);
  var index;
  if (this.checkWeights()) {
    // to be sure that this.weightRatiosSums_ is initialized
    this.weightRatios();
    for (var j = 1; j < this.weightRatiosSums_.length; j++) {
      if (ratio <= this.weightRatiosSums_[j]) break;
    }

    index = j - 1;
  } else {
    if (this.mode_ === anychart.enums.OrdinalScaleMode.CONTINUOUS) {
      var n = this.values_.length;
      ratio = (ratio * (n - 1) + 0.5) / n;
    }
    //todo(Anton Saukh): needs improvement.
    index = goog.math.clamp(Math.ceil(ratio * this.values_.length) - 1, 0, this.values_.length - 1);
  }

  return this.values_[index];
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.Ordinal.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.Ordinal.prototype.serialize = function() {
  var json = anychart.scales.Ordinal.base(this, 'serialize');
  if (!this.autoDomain_)
    json['values'] = this.values();

  json['ticks'] = this.ticks().serialize();

  if (this.names_.length)
    json['names'] = this.names_;

  if (!this.autoWeights_ && this.checkWeights())
    json['weights'] = this.weights_;

  json['mode'] = this.mode_;

  return json;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.Ordinal.base(this, 'setupByJSON', config, opt_default);
  this.values(config['values']);
  this.ticks(config['ticks']);
  this.names(config['names']);
  this.weights(config['weights']);
  this.mode(config['mode']);
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.disposeInternal = function() {
  goog.dispose(this.ticks_);
  anychart.scales.Ordinal.base(this, 'disposeInternal');
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for ordinal scale.
 * @example <t>lineChart</t>
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.xScale(anychart.scales.ordinal());
 * @return {!anychart.scales.Ordinal} Ordinal scale.
 */
anychart.scales.ordinal = function() {
  var scale = new anychart.scales.Ordinal();
  scale.setup(scale.themeSettings);
  return scale;
};


//exports
(function() {
  var proto = anychart.scales.Ordinal.prototype;
  goog.exportSymbol('anychart.scales.ordinal', anychart.scales.ordinal);//doc|ex
  proto['getType'] = proto.getType;
  proto['transform'] = proto.transform;//doc|ex
  proto['inverseTransform'] = proto.inverseTransform;//doc|ex
  proto['ticks'] = proto.ticks;//doc|ex
  proto['values'] = proto.values;//doc|ex
  proto['names'] = proto.names;//doc|ex
  proto['extendDataRange'] = proto.extendDataRange;//doc|need-ex
  proto['weights'] = proto.weights;
})();
