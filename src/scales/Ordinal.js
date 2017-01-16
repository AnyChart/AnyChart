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
    this.registerDisposable(this.ticks_);
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
    this.checkScaleChanged(false);
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
anychart.scales.Ordinal.prototype.getCategorisation = function() {
  return this.values_;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.getPointWidthRatio = function() {
  return 1 / this.values_.length * this.getZoomFactor();
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
  if (isNaN(index)) return NaN;
  var result = index / this.values_.length +
      (opt_subRangeRatio || 0) / this.values_.length; // sub scale part
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
  //todo(Anton Saukh): needs improvement.
  var index = goog.math.clamp(Math.ceil(ratio * this.values_.length) - 1, 0, this.values_.length - 1);
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
  if (this.names_)
    json['names'] = this.names_;
  json['ticks'] = this.ticks().serialize();
  return json;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.Ordinal.base(this, 'setupByJSON', config, opt_default);
  this.values(config['values']);
  this.ticks(config['ticks']);
  this.names(config['names']);
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
 * @return {anychart.scales.Ordinal} Ordinal scale.
 */
anychart.scales.ordinal = function() {
  return new anychart.scales.Ordinal();
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
})();
