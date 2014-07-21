goog.provide('anychart.scales.Ordinal');

goog.require('anychart.scales.Base');
goog.require('anychart.scales.OrdinalTicks');
goog.require('goog.array');



/**
 * Ordinal scale.
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
   * @type {!Array.<anychart.scales.Ordinal.ValuesMapNode>}
   * @private
   */
  this.valuesMap_ = [];

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
   * Values comparator for discrete input domain.
   * @type {Function}
   * @private
   */
  this.comparator_ = anychart.scales.Ordinal.DEFAULT_COMPARATOR_;

  /**
   * An object to store a node to not to create a new node every time we need a comparison.
   * @type {anychart.scales.Ordinal.ValuesMapNode}
   * @private
   */
  this.aNode_ = {key: 0, value: 0};

  /**
   * Ticks for the scale.
   * @type {anychart.scales.OrdinalTicks}
   * @private
   */
  this.ticks_ = null;

  goog.base(this);
};
goog.inherits(anychart.scales.Ordinal, anychart.scales.Base);


/**
 * @typedef {{key: *, value: number}}
 */
anychart.scales.Ordinal.ValuesMapNode;


/**
 * Default comparator for discrete values searcher.
 * @param {anychart.scales.Ordinal.ValuesMapNode} a First value.
 * @param {anychart.scales.Ordinal.ValuesMapNode} b Second value.
 * @return {number} Comparison result.
 * @private
 */
anychart.scales.Ordinal.DEFAULT_COMPARATOR_ = function(a, b) {
  var aType = goog.typeOf(a.key);
  var bType = goog.typeOf(b.key);
  if (aType < bType) {
    return -1;
  } else if (aType > bType) {
    return 1;
  } if (a.key < b.key) {
    return -1;
  } else if (a.key > b.key) {
    return 1;
  }
  return 0;
};


/**
 * @param {*} key Node key.
 * @param {number} value Node value.
 * @return {anychart.scales.Ordinal.ValuesMapNode} Created node.
 * @private
 */
anychart.scales.Ordinal.createInputDomainMapNode_ = function(key, value) {
  return {key: key, value: value};
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Ordinal|anychart.scales.OrdinalTicks)} Ticks or itself for chaining.
 */
anychart.scales.Ordinal.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.scales.OrdinalTicks(this);
    this.registerDisposable(this.ticks_);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.ticks_.set(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
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
 * Getter/setter for scale names.
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
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
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
  this.aNode_.key = value;
  var index = goog.array.binarySearch(this.valuesMap_, this.aNode_, this.comparator_);
  if (index < 0)
    return NaN;
  return this.valuesMap_[index].value;
};


/**
 * @return {!anychart.scales.Ordinal} Resets input domain.
 */
anychart.scales.Ordinal.prototype.resetDataRange = function() {
  this.oldValues_ = this.values_;
  this.values_ = [];
  this.valuesMap_.length = 0;
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
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Ordinal} Itself for chaining.
 */
anychart.scales.Ordinal.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    if (goog.array.binaryInsert(this.valuesMap_,
        anychart.scales.Ordinal.createInputDomainMapNode_(arguments[i], this.values_.length),
        this.comparator_)) {
      this.values_.push(arguments[i]);
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
  return 1 / this.values_.length;
};


/**
 * @param {*} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to output scope.
 */
anychart.scales.Ordinal.prototype.transform = function(value, opt_subRangeRatio) {
  this.aNode_.key = value;
  var index = goog.array.binarySearch(this.valuesMap_, this.aNode_, this.comparator_);
  if (index < 0)
    return NaN;
  var result = this.valuesMap_[index].value / this.values_.length +
      (opt_subRangeRatio || 0) / this.values_.length; // sub scale part
  return this.isInverted ? 1 - result : result;
};


/**
 * @param {number} ratio Value to transform in input scope.
 * @return {*} Value transformed to output scope.
 */
anychart.scales.Ordinal.prototype.inverseTransform = function(ratio) {
  if (this.isInverted) ratio = 1 - ratio;
  //todo(Anton Saukh): needs improvement.
  var index = ratio * this.values_.length;
  return this.values_[Math.round(index)];
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
  var data = goog.base(this, 'serialize');
  data['values'] = this.autoDomain_ ? null : this.values();
  data['ticks'] = this.ticks().serialize();
  data['type'] = 'ordinal';
  return data;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();
  goog.base(this, 'deserialize', value);
  this.values(value['values']);
  this.ticks().deserialize(value['ticks']);
  this.resumeSignalsDispatching(true);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Shortcut way to create ordinal scale.
 * @return {anychart.scales.Ordinal} Ordinal scale.
 */
anychart.scales.ordinal = function() {
  return new anychart.scales.Ordinal();
};


//exports
goog.exportSymbol('anychart.scales.Ordinal', anychart.scales.Ordinal);
anychart.scales.Ordinal.prototype['transform'] = anychart.scales.Ordinal.prototype.transform;
anychart.scales.Ordinal.prototype['inverseTransform'] = anychart.scales.Ordinal.prototype.inverseTransform;
anychart.scales.Ordinal.prototype['ticks'] = anychart.scales.Ordinal.prototype.ticks;
anychart.scales.Ordinal.prototype['values'] = anychart.scales.Ordinal.prototype.values;
anychart.scales.Ordinal.prototype['names'] = anychart.scales.Ordinal.prototype.names;
anychart.scales.Ordinal.prototype['extendDataRange'] = anychart.scales.Ordinal.prototype.extendDataRange;
goog.exportSymbol('anychart.scales.ordinal', anychart.scales.ordinal);
