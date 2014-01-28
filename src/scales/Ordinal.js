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
   * @type {!Array.<(number|string)>}
   * @private
   */
  this.values_ = [];

  /**
   * @type {!Array.<anychart.scales.Ordinal.ValuesMapNode>}
   * @private
   */
  this.valuesMap_ = [];

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
 * @typedef {{key: (number|string), value: (number|string)}}
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
 * Может диспатчить состояния TICKS_SET, SCALE_SETTINGS, SCALE_SETTINGS_HARD, SCALE_STACK_SETTINGS, SCALE_RECATEGORIZED
 * но находиться в них не может.
 * @type {number}
 */
anychart.scales.Ordinal.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


/**
 * @param {number|string} key Node key.
 * @param {number|string} value Node value.
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
    this.ticks_.listen(anychart.utils.Invalidatable.INVALIDATED, this.ticksInvalidated_, false, this);
  }
  if (goog.isDef(opt_value)) {
    this.ticks_.set(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * @param {(Array.<number|string>|number|string|null)=} opt_values Array of values, or values, or null for autocalc.
 * @param {...(number|string)} var_args Other values, that should be contained in input domain.
 * @return {!(anychart.scales.Ordinal|Array.<number|string>)} This or input domain.
 */
anychart.scales.Ordinal.prototype.values = function(opt_values, var_args) {
  if (!goog.isDef(opt_values))
    return this.values_;
  if (goog.isNull(opt_values)) {
    if (!this.autoDomain_) {
      this.resetDataRange();
      this.autoDomain_ = true;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS_HARD);
    }
  } else {
    this.autoDomain_ = false;
    var isArray = goog.isArray(opt_values);
    this.resetDataRange();
    if (isArray && opt_values.length)
      this.extendDataRange.apply(this, /** @type {Array} */(opt_values));
    else
      this.extendDataRange.apply(this, arguments);
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_RECATEGORIZED);
  }
  return this;
};


/**
 * @return {!anychart.scales.Ordinal} Resets input domain.
 */
anychart.scales.Ordinal.prototype.resetDataRange = function() {
  this.values_.length = this.valuesMap_.length = 0;
  return this;
};


/**
 * @param {...(number|string)} var_args Values that are supposed to extend the input domain.
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


/**
 * @return {Array.<(number|string)>} Returns categories array if the scale requires series to categorise their data.
 *    Returns null otherwise.
 */
anychart.scales.Ordinal.prototype.categorisation = function() {
  return this.values_;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.getPointWidthRatio = function() {
  return 1 / this.values_.length;
};


/**
 * @param {string|number} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to output scope.
 */
anychart.scales.Ordinal.prototype.transform = function(value, opt_subRangeRatio) {
  this.aNode_.key = value;
  var index = goog.array.binarySearch(this.valuesMap_, this.aNode_, this.comparator_);
  if (index < 0)
    return NaN;
  return this.valuesMap_[index].value / this.values_.length +
      (opt_subRangeRatio || 0) / this.values_.length; // sub scale part
};


/**
 * @param {number} ratio Value to transform in input scope.
 * @return {number|string|undefined} Value transformed to output scope.
 */
anychart.scales.Ordinal.prototype.inverseTransform = function(ratio) {
  //todo(Anton Saukh): needs improvement.
  var index = ratio * this.values_.length;
  return this.values_[Math.round(index)];
};


/**
 * Ticks invalidation handler.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @private
 */
anychart.scales.Ordinal.prototype.ticksInvalidated_ = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.TICKS_SET))
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.TICKS_SET);
};
