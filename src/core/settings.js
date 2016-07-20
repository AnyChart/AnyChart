goog.provide('anychart.core.settings');
goog.require('acgraph.vector');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.utils');


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
          descriptor.normalizer == anychart.core.settings.hatchFillOrFunctionNormalizer) {
        val = anychart.color.serialize(descriptor.normalizer([val]));
      } else if (descriptor.normalizer == anychart.core.settings.colorNormalizer && !goog.isNull(val)) {
        val = anychart.color.serialize(descriptor.normalizer(val));
      }
      json[name] = val;
    }
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
    if (this.getOwnOption(fieldName) != opt_value) {
      this.setOption(fieldName, opt_value);
      if (this.check(supportCheck))
        this.invalidate(consistencyState, signal);
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
    if (this.getOwnOption(fieldName) != opt_value) {
      this.setOption(fieldName, opt_value);
      if (this.check(supportCheck))
        this.invalidate(consistencyState, signal);
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
 * Single arg normalizer for boolean params.
 * @param {*} val
 * @return {boolean}
 */
anychart.core.settings.booleanNormalizer = function(val) {
  return !!val;
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
//endregion
