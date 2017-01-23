goog.provide('anychart.core.settings');

goog.require('acgraph.vector');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.math');


/**
 * Series property descriptor.
 * @typedef {{
 *    handler: number,
 *    propName: string,
 *    normalizer: Function,
 *    capabilityCheck: number,
 *    consistency: (anychart.ConsistencyState|number),
 *    signal: (anychart.Signal|number)
 * }|{
 *    handler: number,
 *    propName: string,
 *    normalizer: Function,
 *    consistency: (anychart.ConsistencyState|number),
 *    signal: (anychart.Signal|number)
 * }}
 */
anychart.core.settings.PropertyDescriptor;


//region Creating descriptors
/**
 * Creates descriptor.
 * @param {anychart.enums.PropertyHandlerType} handler - Handler type.
 * @param {string} propName - Property name.
 * @param {Function} normalizer - Normalizer function.
 * @param {number} consistency - Consistency to set.
 * @param {number} signal - Signal.
 * @param {number=} opt_check - Check function.
 * @return {anychart.core.settings.PropertyDescriptor} - Descriptor.
 */
anychart.core.settings.createDescriptor = function(handler, propName, normalizer, consistency, signal, opt_check) {
  /**
   * @type {anychart.core.settings.PropertyDescriptor}
   */
  var descriptor = {
    handler: handler,
    propName: propName,
    normalizer: normalizer,
    consistency: consistency,
    signal: signal
  };
  if (goog.isDef(opt_check))
    descriptor.capabilityCheck = opt_check;
  return descriptor;
};


/**
 * Creates text properties descriptors.
 * @param {number} invalidateBoundsState - State to invalidate bounds.
 * @param {number} nonBoundsState - State to invalidate without bounds.
 * @param {number} boundsChangedSignal - Signal for changed bounds.
 * @param {number} nonBoundsSignal - Signal for non-bounds changes.
 * @return {!Object.<string, anychart.core.settings.PropertyDescriptor>} - Descriptors map.
 */
anychart.core.settings.createTextPropertiesDescriptors = function(invalidateBoundsState, nonBoundsState, boundsChangedSignal, nonBoundsSignal) {

  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['minFontSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minFontSize',
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['maxFontSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxFontSize',
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['adjustFontSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'adjustFontSize',
      anychart.core.settings.adjustFontSizeNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['fontSize'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontSize',
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['fontFamily'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontFamily',
      anychart.core.settings.stringNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['fontColor'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontColor',
      anychart.core.settings.stringNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  map['fontOpacity'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontOpacity',
      anychart.core.settings.numberNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  map['fontDecoration'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontDecoration',
      anychart.enums.normalizeFontDecoration,
      invalidateBoundsState,
      boundsChangedSignal);

  map['fontStyle'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontStyle',
      anychart.enums.normalizeFontStyle,
      invalidateBoundsState,
      boundsChangedSignal);

  map['fontVariant'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontVariant',
      anychart.enums.normalizeFontVariant,
      invalidateBoundsState,
      boundsChangedSignal);

  map['fontWeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontWeight',
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['letterSpacing'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'letterSpacing',
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['textDirection'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textDirection',
      anychart.enums.normalizeTextDirection,
      invalidateBoundsState,
      boundsChangedSignal);

  map['lineHeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'lineHeight',
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['textIndent'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textIndent',
      anychart.core.settings.numberNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['vAlign'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'vAlign',
      anychart.enums.normalizeVAlign,
      invalidateBoundsState,
      boundsChangedSignal);

  map['hAlign'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hAlign',
      anychart.enums.normalizeHAlign,
      invalidateBoundsState,
      boundsChangedSignal);

  map['textWrap'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textWrap',
      anychart.enums.normalizeTextWrap,
      invalidateBoundsState,
      boundsChangedSignal);

  map['textOverflow'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'textOverflow',
      anychart.core.settings.stringNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map['selectable'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectable',
      anychart.core.settings.booleanNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  map['disablePointerEvents'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'disablePointerEvents',
      anychart.core.settings.booleanNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  map['useHtml'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'useHtml',
      anychart.core.settings.booleanNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  return map;
};
//endregion


//region Functions to work with settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Functions to work with settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Populates the prototype of passed class constructor with settings from descriptors.
 * @param {!Function} classConstructor
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 */
anychart.core.settings.populate = function(classConstructor, descriptors) {
  for (var i in descriptors) {
    var descriptor = descriptors[i];
    classConstructor.prototype[i] = goog.partial(
        descriptor.handler == anychart.enums.PropertyHandlerType.MULTI_ARG ?
            anychart.core.settings.multiArgsHandler :
            anychart.core.settings.simpleHandler,
        descriptor.propName,
        descriptor.normalizer,
        descriptor.capabilityCheck,
        descriptor.consistency,
        descriptor.signal);
  }
};


/**
 * Deserializes passed config to a target using descriptors.
 * @param {!anychart.core.settings.IObjectWithSettings} target
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 * @param {!Object} config
 */
anychart.core.settings.deserialize = function(target, descriptors, config) {
  for (var name in descriptors) {
    var val = config[name];
    if (goog.isDef(val))
      target[name](val);
  }
};


/**
 * Populates passed json object with serialized settings of the target using descriptors.
 * @param {!anychart.core.settings.IObjectWithSettings} target
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 * @param {!Object} json
 * @param {string=} opt_warningPrefix
 */
anychart.core.settings.serialize = function(target, descriptors, json, opt_warningPrefix) {
  var name, val, descriptor;
  for (name in descriptors) {
    val = undefined;
    descriptor = descriptors[name];
    if (target.hasOwnOption(name)) {
      val = target.getOwnOption(name);
      if (goog.isFunction(val)) {
        anychart.core.reporting.warning(
            anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
            null,
            [(opt_warningPrefix ? opt_warningPrefix + ' ' : '') + name]
        );
      }
    }
    if (!goog.isDef(val) && target.check(descriptor.capabilityCheck)) {
      val = target.getThemeOption(name);
    }
    if (goog.isDef(val) && !goog.isFunction(val)) {
      if (descriptor.normalizer == anychart.core.settings.strokeOrFunctionNormalizer ||
          descriptor.normalizer == anychart.core.settings.fillOrFunctionNormalizer ||
          descriptor.normalizer == anychart.core.settings.hatchFillOrFunctionNormalizer ||
          descriptor.normalizer == anychart.core.settings.strokeNormalizer ||
          descriptor.normalizer == anychart.core.settings.fillNormalizer ||
          descriptor.normalizer == anychart.core.settings.hatchFillNormalizer) {
        val = anychart.color.serialize(descriptor.normalizer([val]));
      } else if (descriptor.normalizer == anychart.core.settings.colorNormalizer && !goog.isNull(val)) {
        val = anychart.color.serialize(descriptor.normalizer(val));
      } else if ((descriptor.normalizer == anychart.core.settings.colorNormalizer ||
          descriptor.normalizer == anychart.core.settings.strokeNormalizer) && !goog.isNull(val)) {
        val = anychart.color.serialize(descriptor.normalizer([val]));
      }
      json[name] = val;
    }
  }
};


/**
 * Copy settings from config to target for descriptors map.
 * @param {!Object} target
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 * @param {!Object} config
 */
anychart.core.settings.copy = function(target, descriptors, config) {
  for (var name in descriptors) {
    var val = config[name];
    if (goog.isDef(val))
      target[name] = val;
  }
};
//endregion


//region Handlers
//----------------------------------------------------------------------------------------------------------------------
//
//  Handlers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Simple field handler, that is suitable for partial application to make real handlers.
 * @param {string} fieldName
 * @param {function(*):*} normalizer
 * @param {number} supportCheck - set to anychart.core.series.Capabilities.ANY to invalidate in any case.
 * @param {anychart.ConsistencyState|number} consistencyState
 * @param {anychart.Signal|number} signal
 * @param {*=} opt_value
 * @return {*|anychart.core.settings.IObjectWithSettings}
 * @this {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.settings.simpleHandler = function(fieldName, normalizer, supportCheck, consistencyState, signal, opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = normalizer(opt_value);
    if (this.getOwnOption(fieldName) !== opt_value) {
      this.setOption(fieldName, opt_value);
      if (this.check(supportCheck)) {
        if (consistencyState) {
          this.invalidate(consistencyState, signal);
        } else {
          this.dispatchSignal(signal);
        }
      }
    }
    return this;
  }
  return this.getOption(fieldName);
};


/**
 * Field handler, that is suitable for partial application to make real handlers. Unlike the simpleHandler it passes
 * all args starting to the normalizer instead of the first param only.
 * @param {string} fieldName
 * @param {function(Array):*} arrayNormalizer
 * @param {number} supportCheck - set to anychart.core.series.Capabilities.ANY to invalidate in any case.
 * @param {anychart.ConsistencyState|number} consistencyState
 * @param {anychart.Signal|number} signal
 * @param {*=} opt_value
 * @param {...*} var_args
 * @return {*|anychart.core.settings.IObjectWithSettings}
 * @this {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.settings.multiArgsHandler = function(fieldName, arrayNormalizer, supportCheck, consistencyState, signal, opt_value, var_args) {
  if (goog.isDef(opt_value)) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = [];
    for (var i = 5; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    opt_value = arrayNormalizer(args);
    if (this.getOwnOption(fieldName) !== opt_value) {
      this.setOption(fieldName, opt_value);
      if (this.check(supportCheck))
        if (consistencyState == anychart.ConsistencyState.ONLY_DISPATCHING) {
          this.dispatchSignal(signal);
        } else {
          this.invalidate(consistencyState, signal);
        }
    }
    return this;
  }
  return this.getOption(fieldName);
};
//endregion


//region Normalizers
//----------------------------------------------------------------------------------------------------------------------
//
//  Normalizers
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns passed value as is, without normalization.
 * @param {*} val
 * @return {*}
 */
anychart.core.settings.asIsNormalizer = function(val) {
  return val;
};


/**
 * Array normalizer for fill.
 * @param {*} val
 * @return {?acgraph.vector.Fill}
 */
anychart.core.settings.colorNormalizer = function(val) {
  return goog.isNull(val) ? val : acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(val));
};


/**
 * Array normalizer for stroke.
 * @param {Array.<*>} args
 * @return {acgraph.vector.Stroke}
 */
anychart.core.settings.strokeNormalizer = function(args) {
  return acgraph.vector.normalizeStroke.apply(null, args);
};


/**
 * Array normalizer for stroke.
 * @param {Array.<*>} args
 * @return {*}
 */
anychart.core.settings.strokeOrFunctionNormalizer = function(args) {
  return goog.isFunction(args[0]) ?
      args[0] :
      acgraph.vector.normalizeStroke.apply(null, args);
};


/**
 * Single arg normalizer for stroke.
 * @param {*} val
 * @return {*}
 */
anychart.core.settings.strokeOrFunctionSimpleNormalizer = function(val) {
  return goog.isFunction(val) ?
      val :
      acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null|undefined} */(val));
};


/**
 * Array normalizer for fill.
 * @param {Array.<*>} args
 * @return {acgraph.vector.Fill}
 */
anychart.core.settings.fillNormalizer = function(args) {
  return acgraph.vector.normalizeFill.apply(null, args);
};


/**
 * Array normalizer for fill.
 * @param {Array.<*>} args
 * @return {*}
 */
anychart.core.settings.fillOrFunctionNormalizer = function(args) {
  return goog.isFunction(args[0]) ?
      args[0] :
      acgraph.vector.normalizeFill.apply(null, args);
};


/**
 * Single arg normalizer for fill.
 * @param {*} val
 * @return {*}
 */
anychart.core.settings.fillOrFunctionSimpleNormalizer = function(val) {
  return goog.isFunction(val) ?
      val :
      acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill|Array.<(acgraph.vector.GradientKey|string)>|null|undefined} */(val));
};


/**
 * Array normalizer for hatchFill.
 * @param {Array.<*>} args
 * @return {*}
 */
anychart.core.settings.hatchFillOrFunctionNormalizer = function(args) {
  return goog.isFunction(args[0]) || args[0] === true ?
      args[0] :
      acgraph.vector.normalizeHatchFill.apply(null, args);
};


/**
 * Single arg normalizer for hatchFill.
 * @param {*} val
 * @return {*}
 */
anychart.core.settings.hatchFillOrFunctionSimpleNormalizer = function(val) {
  return goog.isFunction(val) || val === true ?
      val :
      acgraph.vector.normalizeHatchFill(/** @type {string|Object|null|undefined} */(val));
};


/**
 * Array normalizer for hatch fill.
 * @param {Array.<*>} args
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill}
 */
anychart.core.settings.hatchFillNormalizer = function(args) {
  return acgraph.vector.normalizeHatchFill.apply(null, args);
};


/**
 * Single arg normalizer for boolean params.
 * @param {*} val
 * @return {boolean}
 */
anychart.core.settings.booleanNormalizer = function(val) {
  return !!val;
};


/**
 * Single arg normalizer for boolean or null params.
 * @param {*} val
 * @return {?boolean}
 */
anychart.core.settings.boolOrNullNormalizer = function(val) {
  return goog.isNull(val) ? val : !!val;
};


/**
 * Single arg normalizer for number params.
 * @param {*} val
 * @return {number}
 */
anychart.core.settings.numberNormalizer = function(val) {
  return Number(val);
};


/**
 * Single arg normalizer for number params.
 * @param {*} val
 * @return {number|string}
 */
anychart.core.settings.numberOrZeroNormalizer = function(val) {
  return anychart.utils.toNumberOrStringOrNull(val) || 0;
};


/**
 * Single arg normalizer for string params.
 * @param {*} val
 * @return {string}
 */
anychart.core.settings.stringNormalizer = function(val) {
  return String(val);
};


/**
 * Single arg normalizer for natural (or zero) params. Defaults to NaN.
 * @param {*} val
 * @return {number}
 */
anychart.core.settings.naturalNumberNormalizer = function(val) {
  return anychart.utils.normalizeToNaturalNumber(val, NaN, true);
};


/**
 * Single arg normalizer for number params.
 * @param {*} val
 * @return {number|string|null}
 */
anychart.core.settings.numberOrPercentNormalizer = function(val) {
  return anychart.utils.normalizeNumberOrPercent(val, null);
};


/**
 * Single arg normalizer for marker type params.
 * @param {*} val
 * @return {anychart.enums.MarkerType|Function}
 */
anychart.core.settings.markerTypeNormalizer = function(val) {
  return goog.isFunction(val) ? val : anychart.enums.normalizeMarkerType(val);
};


/**
 * Single arg normalizer for orientation params.
 * @param {*} val
 * @return {?anychart.enums.Orientation}
 */
anychart.core.settings.orientationNormalizer = function(val) {
  return goog.isNull(val) ? val : anychart.enums.normalizeOrientation(val);
};


/**
 * Array normalizer for adjustFontSize.
 * @param {Array.<boolean>} args
 * @return {Object|boolean}
 */
anychart.core.settings.adjustFontSizeNormalizer = function(args) {
  return (args.length == 1) ? args[0] : {'width': args[0], 'height': args[1]};
};


/**
 * Single arg normalizer for number or string.
 * @param {*} val
 * @return {number|string}
 */
anychart.core.settings.numberOrStringNormalizer = function(val) {
  return anychart.utils.toNumberOrString(val);
};


/**
 * Ratio normalizer for number or string.
 * @param {*} val
 * @return {number}
 */
anychart.core.settings.ratioNormalizer = function(val) {
  return goog.math.clamp(anychart.utils.toNumber(val), 0, 1);
};


/**
 * Array normalizer.
 * @param {Array.<*>} args
 * @return {*}
 */
anychart.core.settings.arrayNormalizer = function(args) {
  if (goog.isArray(args[0]))
    return args[0];
  else
    return args;
};


/**
 * Single arg normalizer for function params.
 * @param {*} val
 * @return {?Function}
 */
anychart.core.settings.functionNormalizer = function(val) {
  return goog.isFunction(val) ? val : null;
};
//endregion



//region IObjectWithSettings
//----------------------------------------------------------------------------------------------------------------------
//
//  IObjectWithSettings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * An object that supports settings model.
 * @interface
 */
anychart.core.settings.IObjectWithSettings = function() {};


/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.settings.IObjectWithSettings.prototype.getOwnOption = function(name) {};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.settings.IObjectWithSettings.prototype.hasOwnOption = function(name) {};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.settings.IObjectWithSettings.prototype.getThemeOption = function(name) {};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.settings.IObjectWithSettings.prototype.getOption = function(name) {};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.settings.IObjectWithSettings.prototype.setOption = function(name, value) {};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.settings.IObjectWithSettings.prototype.check = function(flags) {};


/**
 * Sets consistency state to an element {@link anychart.ConsistencyState}.
 * @param {anychart.ConsistencyState|number} state State(s) to be set.
 * @param {(anychart.Signal|number)=} opt_signal Signal(s) to be sent to listener, if states have been set.
 * @return {number} Actually modified consistency states.
 */
anychart.core.settings.IObjectWithSettings.prototype.invalidate = function(state, opt_signal) {};


/**
 * Sends invalidation event to listeners.
 *
 * NOTE: YOU CAN ONLY SEND SIGNALS FROM SUPPORTED_SIGNALS MASK!
 *
 * @param {anychart.Signal|number} state Invalidation state(s).
 * @param {boolean=} opt_force Force to dispatch signal.
 */
anychart.core.settings.IObjectWithSettings.prototype.dispatchSignal = function(state, opt_force) {};
//endregion



//region IResolvable
//----------------------------------------------------------------------------------------------------------------------
//
//  IResolvable
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * An object that is able to have parent object to take settings from it.
 * @interface
 */
anychart.core.settings.IResolvable = function() {};


/**
 * Gets chain of settings object ordered by priority.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.settings.IResolvable.prototype.getResolutionChain = function() {};


/**
 * Gets chain of low priority settings.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.settings.IResolvable.prototype.getLowPriorityResolutionChain = function() {};


/**
 * Gets chain of high priority settings.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.settings.IResolvable.prototype.getHighPriorityResolutionChain = function() {};


/**
 * Getter/setter for resolution chain cache.
 * General idea of this cache is to avoid array re-concatenation on every getOption() call.
 * @param {Array.<Object|null|undefined>=} opt_value - Value to set.
 * @return {?Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.settings.IResolvable.prototype.resolutionChainCache = function(opt_value) {};


/**
 * Default resolution chain getter for IResolvable object.
 * @this {anychart.core.settings.IResolvable}
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.settings.getResolutionChain = function() {
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/**
 * Gets option value by name for IResolvable.
 * @param {string} name - Option name.
 * @this {anychart.core.settings.IResolvable}
 * @return {*} - Option value.
 */
anychart.core.settings.getOption = function(name) {
  var chain = this.getResolutionChain();
  for (var i = 0; i < chain.length; i++) {
    var obj = chain[i];
    if (obj) {
      var res = obj[name];
      if (goog.isDef(res))
        return res;
    }
  }
  return void 0;
};
//endregion
