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
   * @type {!Function}
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


/** @inheritDoc */
anychart.scales.Ordinal.prototype.getType = function() {
  return anychart.enums.ScaleTypes.ORDINAL;
};


/**
 * Default comparator for discrete values searcher.
 * @param {anychart.scales.Ordinal.ValuesMapNode} a First value.
 * @param {anychart.scales.Ordinal.ValuesMapNode} b Second value.
 * @return {number} Comparison result.
 * @private
 */
anychart.scales.Ordinal.DEFAULT_COMPARATOR_ = function(a, b) {
  return anychart.utils.compareAsc(a.key, b.key);
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


/** @inheritDoc */
anychart.scales.Ordinal.prototype.isMissing = function(value) {
  return !goog.isDef(value);
};


/**
 * Getter for set of scale ticks in terms of data values.
 * @return {!anychart.scales.OrdinalTicks} An instance of {@link anychart.scales.OrdinalTicks} class for method chaining.
 *//**
 * Setter for set of scale ticks in terms of data values.
 * @example <t>lineChart</t>
 * chart.line([
 *  ['A1', 1.1],
 *  ['A2', 1.4],
 *  ['A3', 1.2],
 *  ['A4', 1.9],
 *  ['B1', 1.1],
 *  ['B2', 1.4],
 *  ['B3', 1.2],
 *  ['B4', 1.9]
 * ]);
 * chart.xScale().ticks([0,2,4,6]);
 * @param {(Object|Array)=} opt_value An array of indexes of ticks values.
 * @return {!anychart.scales.Ordinal} An instance of {@link anychart.scales.Ordinal} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for scale input domain.
 * @return {Array.<number|string>} Current input domain.
 *//**
 * Setter for scale input domain.
 * @example <t>lineChart</t>
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.xScale().values(['A1', 'A2', 'B1', 'B2']);
 * //the same that
 * //chart.xScale().values('A1', 'A2', 'B1', 'B2');
 * @param {(Array.<*>|*|null)=} opt_values Array of values, or values, or null for autocalc.
 * @param {...*} var_args Other values, that should be contained in input domain.
 * @return {!anychart.scales.Ordinal} An instance of {@link anychart.scales.Ordinal} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for scale ticks names.
 * @return {Array.<*>} Current scale ticks names.
 *//**
 * Setter for scale ticks names.
 * @example <t>lineChart</t>
 * var data = [
 *   {x:10, myName: 'Q1', value: 1.1},
 *   {x:11, myName: 'Q2', value: 1.4},
 *   {x:12, myName: 'Q3', value: 1.2},
 *   {x:13, myName: 'Q4', value: 1.9}
 * ];
 * chart.line(data);
 * chart.xScale().names('myName');
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.9]);
 * chart.xScale().names(['C1', 'C2', 'C3', 'C4']);
 * @param {(Array.<*>|string)=} opt_value Array of names or attribute name for data set.
 * @return {anychart.scales.Ordinal} An instance of {@link anychart.scales.Ordinal} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Extends the current input domain with the passed values (if such don't exist in the domain).
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Ordinal} {@link anychart.scales.Ordinal} instance for method chaining.
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
  this.aNode_.key = value;
  var index = goog.array.binarySearch(this.valuesMap_, this.aNode_, this.comparator_);
  if (index < 0)
    return NaN;
  var result = this.valuesMap_[index].value / this.values_.length +
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
  var json = goog.base(this, 'serialize');
  if (!this.autoDomain_)
    json['values'] = this.values();
  if (this.names_)
    json['names'] = this.names_;
  json['ticks'] = this.ticks().serialize();
  return json;
};


/** @inheritDoc */
anychart.scales.Ordinal.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
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
goog.exportSymbol('anychart.scales.ordinal', anychart.scales.ordinal);//doc|ex
anychart.scales.Ordinal.prototype['transform'] = anychart.scales.Ordinal.prototype.transform;//doc|ex
anychart.scales.Ordinal.prototype['inverseTransform'] = anychart.scales.Ordinal.prototype.inverseTransform;//doc|ex
anychart.scales.Ordinal.prototype['ticks'] = anychart.scales.Ordinal.prototype.ticks;//doc|ex
anychart.scales.Ordinal.prototype['values'] = anychart.scales.Ordinal.prototype.values;//doc|ex
anychart.scales.Ordinal.prototype['names'] = anychart.scales.Ordinal.prototype.names;//doc|ex
anychart.scales.Ordinal.prototype['extendDataRange'] = anychart.scales.Ordinal.prototype.extendDataRange;//doc|need-ex
