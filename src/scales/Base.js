goog.provide('anychart.scales.Base');
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.scales.IXScale');



/**
 * Basic methods for scales.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.scales.IXScale}
 */
anychart.scales.Base = function() {
  anychart.scales.Base.base(this, 'constructor');

  this.addThemes('defaultScaleSettings.linear');

  /**
   * The number of current calculation sessions. Each chart starts a calculation session in its calculate() method and
   * finishes it in its draw() method beginning.
   * @type {number}
   * @private
   */
  this.autoCalcs_ = 0;

  /**
   * If the scale is inverted (rtl or ttb).
   * @type {boolean}
   * @protected
   */
  this.isInverted = false;

  /**
   * Zoom factor.
   * @type {number}
   * @protected
   */
  this.zoomFactor = 1;

  /**
   * Zoom start.
   * @type {number}
   * @protected
   */
  this.zoomStart = 0;

  /**
   * Stack mode.
   * @type {anychart.enums.ScaleStackMode}
   * @private
   */
  this.stackMode_ = anychart.enums.ScaleStackMode.NONE;

  /**
   * Stack direction.
   * @type {anychart.enums.ScaleStackDirection}
   * @private
   */
  this.stackDirection_ = anychart.enums.ScaleStackDirection.DIRECT;
};
goog.inherits(anychart.scales.Base, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.Base.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * @param {*} value Value to transform in input scope.
 * @param {number=} opt_subRangeRatio Sub range ratio.
 * @return {number} Value transformed to [0, 1] scope.
 */
anychart.scales.Base.prototype.transform = goog.abstractMethod;


/**
 * @param {number} ratio Value to transform in input scope.
 * @return {*} Value transformed to output scope.
 */
anychart.scales.Base.prototype.inverseTransform = goog.abstractMethod;


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Base|*)} Ticks or itself for chaining.
 */
anychart.scales.Base.prototype.ticks = goog.nullFunction;


/**
 * This is an internal method to maintain compatibility with Stock scales in X scale transformation.
 * @param {*} key Key of the point to transform.
 * @param {number} index Point index. If it is needed but not passed it would be retrieved automatically.
 * @param {number=} opt_subRangeRatio Subrange ratio. Doesn't mean anything for stock for now.
 * @return {number}
 */
anychart.scales.Base.prototype.transformInternal = function(key, index, opt_subRangeRatio) {
  return this.transform(key, opt_subRangeRatio);
};


/**
 * Function to apply NONE comparison.
 * @param {*} value
 * @param {number} comparisonZero
 * @return {*}
 */
anychart.scales.Base.prototype.applyComparison = function(value, comparisonZero) {
  return value;
};


/**
 * Sets scale zoom and requests scale reapplication.
 * @param {number} factor
 * @param {number} start
 */
anychart.scales.Base.prototype.setZoom = function(factor, start) {
  if (this.zoomFactor == factor && this.zoomStart == start) return;
  this.zoomFactor = factor;
  this.zoomStart = start;
  this.inversionOrZoomChanged();
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/**
 * Getter for zoom factor.
 * @return {number}
 */
anychart.scales.Base.prototype.getZoomFactor = function() {
  return this.zoomFactor;
};


/**
 * Applies zoom settings to passed ratio.
 * @param {number} ratio
 * @return {number}
 */
anychart.scales.Base.prototype.applyZoomAndInverse = function(ratio) {
  var result = (ratio - this.zoomStart) * this.zoomFactor;
  return this.isInverted ? 1 - result : result;
};


/**
 * Applies zoom settings in reversed direction.
 * @param {number} ratio
 * @return {number}
 */
anychart.scales.Base.prototype.reverseZoomAndInverse = function(ratio) {
  if (this.isInverted) ratio = 1 - ratio;
  return ratio / this.zoomFactor + this.zoomStart;
};


/**
 * Checks if passed value will be treated as missing by this scale.
 * @param {*} value
 * @return {boolean}
 */
anychart.scales.Base.prototype.isMissing = function(value) {
  return anychart.utils.isNaN(value);
};


/**
 * Getter/setter for inverted.
 * Getter and setter for scale inversion.
 * @param {boolean=} opt_value Inverted state to set.
 * @return {(!anychart.scales.Base|boolean)} Inverted state or itself for method chaining.
 */
anychart.scales.Base.prototype.inverted = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.isInverted != opt_value) {
      this.isInverted = opt_value;
      this.inversionOrZoomChanged();
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.isInverted;
};


/**
 * Just a hook.
 */
anychart.scales.Base.prototype.inversionOrZoomChanged = function() {};


/**
 * Informs scale that an auto range calculation started for the chart, so it should reset its data range on the first
 * call of this method if needed.
 * @return {!anychart.scales.Base} Chaining.
 */
anychart.scales.Base.prototype.startAutoCalc = function() {
  if (!this.autoCalcs_)
    this.resetDataRange();
  this.autoCalcs_++;
  return this;
};


/**
 * Informs the scale that an auto range calculation started for the chart in past was ended.
 * @param {boolean=} opt_silently If this flag is set, do not dispatch an event if reapplication needed.
 * @return {boolean} If the calculation changed the scale and it needs to be reapplied.
 */
anychart.scales.Base.prototype.finishAutoCalc = function(opt_silently) {
  this.autoCalcs_ = Math.max(this.autoCalcs_ - 1, 0);
  if (!this.autoCalcs_) {
    return this.checkScaleChanged(!!opt_silently);
  } else
    return true; // todo: additional stuff when calculating shared scales!
};


/**
 * Checks if previous data range differs from the current, dispatches a REAPPLICATION signal and returns the result.
 * @param {boolean} silently If set, the signal is not dispatched.
 * @return {boolean} If the scale was changed and it needs to be reapplied.
 * @protected
 */
anychart.scales.Base.prototype.checkScaleChanged = goog.abstractMethod;


/** @inheritDoc */
anychart.scales.Base.prototype.checkWeights = function() {
  return false;
};


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
 * Extends the scale range.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Base} Itself for method chaining.
 */
anychart.scales.Base.prototype.extendDataRange = goog.abstractMethod;


/**
 * Resets scale data range if it needs auto calculation.
 * @return {!anychart.scales.Base} Itself for method chaining.
 * @protected
 */
anychart.scales.Base.prototype.resetDataRange = goog.abstractMethod;


/**
 * @return {number} Returns category width in ratio to the total space of the scale.
 */
anychart.scales.Base.prototype.getPointWidthRatio = function() {
  // TODO(Anton Saukh): non-Ordinal scales must have min distance between points calculation algorithm.
  return 0;
};


//endregion


/**
 * Setting, whether the scale can be stacked. Should be set in the constructor.
 * @type {boolean}
 * @protected
 */
anychart.scales.Base.prototype.canBeStacked = false;


/**
 * Getter/setter for stackMode.
 * Accepts 'none', 'value', 'percent'.
 * @param {(anychart.enums.ScaleStackMode|string)=} opt_value Stack mode if used as a setter.
 * @return {!anychart.scales.Base|anychart.enums.ScaleStackMode} StackMode or itself for method chaining.
 */
anychart.scales.Base.prototype.stackMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var res = this.canBeStacked ? anychart.enums.normalizeScaleStackMode(opt_value) : anychart.enums.ScaleStackMode.NONE;
    if (this.stackMode_ != res) {
      this.stackMode_ = res;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.canBeStacked ? this.stackMode_ : anychart.enums.ScaleStackMode.NONE;
};


/**
 * Getter/setter for stackDirection.
 * Accepts 'none', 'value', 'percent'.
 * @param {(anychart.enums.ScaleStackDirection|string)=} opt_value Stack direction if used as a setter.
 * @return {!anychart.scales.Base|anychart.enums.ScaleStackDirection} StackDirection or itself for method chaining.
 */
anychart.scales.Base.prototype.stackDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var res = anychart.enums.normalizeScaleStackDirection(opt_value);
    if (this.stackDirection_ != res) {
      this.stackDirection_ = res;
      if (this.stackMode() != anychart.enums.ScaleStackMode.NONE)
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.stackDirection_;
};


/**
 * Returns scale type.
 * @return {string}
 */
anychart.scales.Base.prototype.getType = goog.abstractMethod;


/**
 * Rounds to ticks precision if available.
 * @param {*} value
 * @param {number=} opt_addPrec
 * @return {number}
 */
anychart.scales.Base.prototype.roundToTicksPrecision = function(value, opt_addPrec) {
  return Number(value);
};


/** @inheritDoc */
anychart.scales.Base.prototype.serialize = function() {
  var json = anychart.scales.Base.base(this, 'serialize');
  json['type'] = this.getType();
  json['inverted'] = this.inverted();
  return json;
};


/** @inheritDoc */
anychart.scales.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.Base.base(this, 'setupByJSON', config, opt_default);
  this.inverted(config['inverted']);
};


/**
 * @param {string} type
 * @param {?boolean} defaultIsOrdinal True if use Ordinal as default, false - Linear, null - return null by default.
 * @return {anychart.scales.Base}
 */
anychart.scales.Base.fromString = function(type, defaultIsOrdinal) {
  return anychart.scales.Base.createOfType(
      anychart.scales.Base.ScaleTypesMapping[/** @type {anychart.enums.ScaleTypes} */(type)],
      defaultIsOrdinal ? anychart.scales.Base.ScaleTypes.ORDINAL : anychart.scales.Base.ScaleTypes.LINEAR);
};


/**
 * Mixable enum for scale types.
 * @enum {number}
 */
anychart.scales.Base.ScaleTypes = {
  UNKNOWN: 0,
  LINEAR: 1,
  LOG: 2,
  SCATTER: 3,
  DATE_TIME: 4,
  SCATTER_OR_DATE_TIME: 7,
  ORDINAL: 8,
  ALL_DEFAULT: 15,
  ORDINAL_COLOR: 16,
  LINEAR_COLOR: 32,
  COLOR_SCALES: 48,
  ALL: 63
};


/**
 * Mapping for the two enums.
 * @type {Object<anychart.enums.ScaleTypes,anychart.scales.Base.ScaleTypes>}
 */
anychart.scales.Base.ScaleTypesMapping = (function() {
  var map = {};
  map[anychart.enums.ScaleTypes.LINEAR] = anychart.scales.Base.ScaleTypes.LINEAR;
  map[anychart.enums.ScaleTypes.LOG] = anychart.scales.Base.ScaleTypes.LOG;
  map[anychart.enums.ScaleTypes.DATE_TIME] = anychart.scales.Base.ScaleTypes.DATE_TIME;
  map[anychart.enums.ScaleTypes.ORDINAL] = anychart.scales.Base.ScaleTypes.ORDINAL;
  map[anychart.enums.ScaleTypes.LINEAR_COLOR] = anychart.scales.Base.ScaleTypes.LINEAR_COLOR;
  map[anychart.enums.ScaleTypes.ORDINAL_COLOR] = anychart.scales.Base.ScaleTypes.ORDINAL_COLOR;
  return map;
})();


/**
 * @type {Object.<anychart.scales.Base.ScaleTypes,Function>}
 */
anychart.scales.Base.constructorsMap_;


/**
 *
 * @param {anychart.scales.Base.ScaleTypes} type
 * @param {?anychart.scales.Base.ScaleTypes} defaultType
 * @return {?anychart.scales.Base}
 */
anychart.scales.Base.createOfType = function(type, defaultType) {
  if (!anychart.scales.Base.constructorsMap_) {
    anychart.scales.Base.constructorsMap_ = {};
    anychart.scales.Base.constructorsMap_[anychart.scales.Base.ScaleTypes.LINEAR] = anychart.scales.linear;
    anychart.scales.Base.constructorsMap_[anychart.scales.Base.ScaleTypes.LOG] = anychart.scales.log;
    anychart.scales.Base.constructorsMap_[anychart.scales.Base.ScaleTypes.DATE_TIME] = anychart.scales.dateTime;
    anychart.scales.Base.constructorsMap_[anychart.scales.Base.ScaleTypes.ORDINAL] = anychart.scales.ordinal;
    anychart.scales.Base.constructorsMap_[anychart.scales.Base.ScaleTypes.LINEAR_COLOR] = function() {
      var cls;
      return (cls = anychart.module['scales']['linearColor']) ?
          cls() :
          anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Color scales']);
    };
    anychart.scales.Base.constructorsMap_[anychart.scales.Base.ScaleTypes.ORDINAL_COLOR] = function() {
      var cls;
      return (cls = anychart.module['scales']['ordinalColor']) ?
          cls() :
          anychart.core.reporting.error(anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE, null, ['Color scales']);
    };
  }
  var cls = anychart.scales.Base.constructorsMap_[type] || anychart.scales.Base.constructorsMap_[defaultType] || null;
  // cls can return undefined
  return /** @type {?anychart.scales.Base} */(cls && cls() || null);
};


/**
 * Rules up all the scale setup needed. Returns a new scale if needed otherwise
 * all the setup is made through the scale signals listeners.
 * @param {?anychart.scales.Base} currentScale
 * @param {*=} opt_newScaleSetupValue
 * @param {?anychart.enums.ScaleTypes=} opt_defaultScaleType
 * @param {anychart.scales.Base.ScaleTypes=} opt_allowedScaleTypes
 * @param {Array=} opt_errorParams - if set, dispatches error on wrong scale type.
 * @param {Function=} opt_signalsHandler
 * @param {*=} opt_signalsHandlerContext
 * @return {?anychart.scales.Base}
 */
anychart.scales.Base.setupScale = function(currentScale, opt_newScaleSetupValue, opt_defaultScaleType,
                                           opt_allowedScaleTypes, opt_errorParams, opt_signalsHandler,
                                           opt_signalsHandlerContext) {
  var result = null;
  if (currentScale != opt_newScaleSetupValue) {
    opt_allowedScaleTypes = opt_allowedScaleTypes || anychart.scales.Base.ScaleTypes.ALL_DEFAULT;
    var currentType = currentScale ? currentScale.getType() : null;
    var type, config, instance;
    config = instance = null;
    if (goog.isString(opt_newScaleSetupValue)) {
      type = opt_newScaleSetupValue || currentType;
    } else if (anychart.utils.instanceOf(opt_newScaleSetupValue, anychart.scales.Base)) {
      type = opt_newScaleSetupValue.getType();
      instance = /** @type {anychart.scales.Base} */(opt_newScaleSetupValue);
    } else if (goog.isObject(opt_newScaleSetupValue)) {
      type = opt_newScaleSetupValue['type'] || currentType || opt_defaultScaleType;
      config = opt_newScaleSetupValue;
    }
    var internalType = anychart.scales.Base.ScaleTypesMapping[type];
    if (!!(internalType & opt_allowedScaleTypes)) {
      if (!instance && type != currentType) {
        instance = anychart.scales.Base.createOfType(internalType,
            anychart.scales.Base.ScaleTypesMapping[/** @type {anychart.enums.ScaleTypes} */(opt_defaultScaleType)] || null);
      }
      if (instance) {
        instance.suspendSignalsDispatching();
        if (opt_signalsHandler) {
          if (currentScale) {
            currentScale.unlistenSignals(opt_signalsHandler, opt_signalsHandlerContext);
          }
          instance.listenSignals(opt_signalsHandler, opt_signalsHandlerContext);
        }
        instance.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
        result = currentScale = instance;
      }
      if (currentScale && config) {
        // if instance exists, we have already suspended it
        if (!instance)
          currentScale.suspendSignalsDispatching();
        currentScale.setupByJSON(config);
        result = currentScale;
      }
    } else if (opt_errorParams) {
      anychart.core.reporting.error(anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE, undefined, opt_errorParams);
    }
  }
  return /** @type {anychart.scales.Base} */(result);
};


//exports
(function() {
  var proto = anychart.scales.Base.prototype;
  proto['inverted'] = proto.inverted;//doc|ex
  proto['startAutoCalc'] = proto.startAutoCalc;//doc|need-ex
  proto['finishAutoCalc'] = proto.finishAutoCalc;//doc|need-ex
})();
