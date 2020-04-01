goog.provide('anychart.core.settings');
goog.provide('anychart.core.settings.IObjectWithSettings');

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
 *    deprecatedPropName: (string|undefined)
 * }}
 */
anychart.core.settings.PropertyDescriptor;


/**
 * Property descriptor meta.
 * @typedef {{
 *   consistency: number,
 *   signal: number,
 *   capabilities: number,
 *   beforeInvalidationHook: Function,
 *   context: *,
 *   invalidationCondition: function(*, *):boolean
 * }}
 */
anychart.core.settings.PropertyDescriptorMeta;


/**
 * Default values comparator.
 * @param {*} oldValue - Old value.
 * @param {*} newNormalizedValue - New normalized value.
 * @return {boolean} - True if value has been changed and instance must be invalidated, false otherwise.
 */
anychart.core.settings.DEFAULT_INVALIDATION_CONDITION = function(oldValue, newNormalizedValue) {
  return oldValue !== newNormalizedValue;
};


//region Creating descriptors
/**
 * Creates descriptor.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptor>} map
 * @param {anychart.enums.PropertyHandlerType|Array} descriptorOrHandler - Handler type.
 * @param {string} propName - Property name.
 * @param {Function} normalizer - Normalizer function.
 * @param {string=} opt_methodName - Deprecated prop name.
 * @return {anychart.core.settings.PropertyDescriptor}
 */
anychart.core.settings.createDescriptor = function(map, descriptorOrHandler, propName, normalizer, opt_methodName) {
  if (goog.isArray(descriptorOrHandler))
    return anychart.core.settings.createDescriptor.apply(null, goog.array.concat(map, descriptorOrHandler));
  else {
    /**
     * @type {anychart.core.settings.PropertyDescriptor}
     */
    var descriptor = {
      handler: /** @type {number} */ (descriptorOrHandler),
      propName: propName,
      normalizer: normalizer
    };
    var methodName = propName;
    if (goog.isDef(opt_methodName)) {
      methodName = descriptor.deprecatedPropName = opt_methodName;
    }
    map[methodName] = descriptor;
  }
  return descriptor;
};


/**
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} map
 * @param {!Array.<Array>} descriptors Descriptors.
 * @return {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.settings.createDescriptors = function(map, descriptors) {
  var diff = {};
  for (var i = 0; i < descriptors.length; i++) {
    diff[descriptors[i][1]] = anychart.core.settings.createDescriptor.apply(null, goog.array.concat(map, descriptors[i]));
  }
  return diff;
};


/**
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} map
 * @param {string} propName
 * @param {number} consistency - Consistency to set.
 * @param {number} signal - Signal.
 * @param {number=} opt_capabilities - Check function.
 * @param {Function=} opt_beforeInvalidationHook
 * @param {*=} opt_hookContext
 * @param {(function(*, *):boolean)=} opt_invalidationCondition
 */
anychart.core.settings.createDescriptorMeta = function(map, propName, consistency, signal, opt_capabilities,
                                                       opt_beforeInvalidationHook, opt_hookContext, opt_invalidationCondition) {
  var meta = {
    consistency: consistency,
    signal: signal
  };
  if (goog.isDef(opt_capabilities))
    meta.capabilities = opt_capabilities;
  if (goog.isDef(opt_beforeInvalidationHook) && goog.isFunction(opt_beforeInvalidationHook)) {
    meta.beforeInvalidationHook = opt_beforeInvalidationHook;
    meta.context = opt_hookContext;
  }
  meta.invalidationCondition = opt_invalidationCondition;
  map[propName] = /** @type {anychart.core.settings.PropertyDescriptorMeta} */ (meta);
};


/**
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} map
 * @param {!Array.<Array>} metas
 */
anychart.core.settings.createDescriptorsMeta = function(map, metas) {
  for (var i = 0; i < metas.length; i++) {
    anychart.core.settings.createDescriptorMeta.apply(null, goog.array.concat(map, metas[i]));
  }
};


/**
 * Creates text properties descriptors.
 * @return {!Object.<string, anychart.core.settings.PropertyDescriptor>} - Descriptors map.
 */
anychart.core.settings.createTextPropertiesDescriptors = function() {
  return anychart.core.settings.createDescriptors({}, anychart.core.settings.createTextPropertiesDescriptorsTemplate());
};


/**
 * Text props.
 * @type {Array.<string>}
 */
anychart.core.settings.TEXT_PROPS = [
  'minFontSize',
  'maxFontSize',
  'adjustFontSize',
  'fontSize',
  'fontFamily',
  'fontColor',
  'fontOpacity',
  'fontDecoration',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'letterSpacing',
  'textDirection',
  'lineHeight',
  'textIndent',
  'vAlign',
  'hAlign',
  'wordWrap',
  'wordBreak',
  'textOverflow',
  'selectable',
  'disablePointerEvents',
  'useHtml',
  'format' //TODO (A.Kudryavtsev): Do we need to declare it here?
];


/**
 * Creates text properties descriptors.
 * @return {!Array.<Array>} - Descriptors template map.
 */
anychart.core.settings.createTextPropertiesDescriptorsTemplate = function() {
  return [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minFontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxFontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'adjustFontSize', anychart.core.settings.adjustFontSizeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontSize', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontFamily', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontColor', anychart.core.settings.stringOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontOpacity', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontDecoration', anychart.enums.normalizeFontDecoration],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontStyle', anychart.enums.normalizeFontStyle],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontVariant', anychart.enums.normalizeFontVariant],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontWeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'letterSpacing', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textDirection', anychart.enums.normalizeTextDirection],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textShadow', acgraph.vector.normalizeTextShadow],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'lineHeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textIndent', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'vAlign', anychart.enums.normalizeVAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hAlign', anychart.enums.normalizeHAlign],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordWrap', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'wordBreak', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'textOverflow', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'selectable', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'disablePointerEvents', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'useHtml', anychart.core.settings.booleanNormalizer]
  ];
};


/**
 * Creates text properties descriptors.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} map - Map with descriptors meta.
 * @param {number} invalidateBoundsState - State to invalidate bounds.
 * @param {number} nonBoundsState - State to invalidate without bounds.
 * @param {number} boundsChangedSignal - Signal for changed bounds.
 * @param {number} nonBoundsSignal - Signal for non-bounds changes.
 * @param {Function=} opt_boundsStateBeforeInvalidationHook - .
 */
anychart.core.settings.createTextPropertiesDescriptorsMeta = function(map, invalidateBoundsState,
                                                                      nonBoundsState, boundsChangedSignal, nonBoundsSignal,
                                                                      opt_boundsStateBeforeInvalidationHook) {
  anychart.core.settings.createDescriptorsMeta(map, [
    ['minFontSize', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['maxFontSize', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['adjustFontSize', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['fontSize', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['fontFamily', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['fontColor', nonBoundsState, nonBoundsSignal],
    ['fontOpacity', nonBoundsState, nonBoundsSignal],
    ['fontDecoration', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['fontStyle', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['fontVariant', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['fontWeight', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['letterSpacing', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['textDirection', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['textShadow', nonBoundsState, nonBoundsSignal],
    ['lineHeight', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['textIndent', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['vAlign', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['hAlign', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['wordWrap', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['wordBreak', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['textOverflow', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook],
    ['selectable', nonBoundsState, nonBoundsSignal],
    ['disablePointerEvents', nonBoundsState, nonBoundsSignal],
    ['useHtml', invalidateBoundsState, boundsChangedSignal, void 0, opt_boundsStateBeforeInvalidationHook]
  ]);
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
 * @param {!(Function|Object)} target
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 * @param {boolean=} opt_targetIsInstance If the target is an instance. Treated as a class contructor otherwise.
 */
anychart.core.settings.populate = function(target, descriptors, opt_targetIsInstance) {
  if (!opt_targetIsInstance)
    target = target.prototype;
  for (var i in descriptors) {
    var descriptor = descriptors[i];
    target[i] = goog.partial(
        anychart.core.settings.handlersMap[descriptor.handler],
        descriptor.propName,
        descriptor.deprecatedPropName,
        descriptor.normalizer);
  }
};


/**
 * Populate aliases.
 * @param {!Function} classConstructor
 * @param {Array.<string>} aliases
 * @param {string} aliasTo
 */
anychart.core.settings.populateAliases = function(classConstructor, aliases, aliasTo) {
  for (var i = 0; i < aliases.length; i++) {
    var alias = aliases[i];
    classConstructor.prototype[alias] = (function(propName) {
      return function(args) {
        var calledAlias = this[aliasTo]();
        if (goog.isDef(arguments[0])) {
          //aliasTo[propName].apply(aliasTo, arguments);
          calledAlias[propName].apply(calledAlias, arguments);
          return this;
        }
        return calledAlias[propName]();
      };
    })(alias);
  }
};


/**
 * Deserializes passed config to a target using descriptors.
 * @param {!(anychart.core.settings.IObjectWithSettings|Object|anychart.core.Base)} target
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 * @param {!Object} config
 * @param {boolean=} opt_default
 */
anychart.core.settings.deserialize = function(target, descriptors, config, opt_default) {
  if (opt_default && target.themeSettings) {
    anychart.core.settings.copy(target.themeSettings, descriptors, config);
  } else {
    for (var name in descriptors) {
      var val = config[name];
      if (goog.isDef(val))
        target.getOption ?
            target[name](val) :
            target[name] = val;
    }
  }
};


/**
 * Populates passed json object with serialized settings of the target using descriptors.
 * @param {!anychart.core.settings.IObjectWithSettings} target
 * @param {!Object.<anychart.core.settings.PropertyDescriptor>} descriptors
 * @param {!Object} json
 * @param {string=} opt_warningPrefix
 * @param {Object.<anychart.core.settings.PropertyDescriptorMeta>=} opt_descriptorsMeta
 * @param {boolean=} opt_ownOnly
 */
anychart.core.settings.serialize = function(target, descriptors, json, opt_warningPrefix, opt_descriptorsMeta, opt_ownOnly) {
  var name, val, descriptor;
  var list = goog.isDef(opt_descriptorsMeta) ? opt_descriptorsMeta : descriptors;
  for (name in list) {
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
    if (descriptor) {
      if (!goog.isDef(val) && !opt_ownOnly && target.check(/** @type {number} */ (target.getCapabilities(name)))) {
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
        } else if (descriptor.normalizer == anychart.core.settings.adjustFontSizeNormalizer) {
          val = descriptor.normalizer([val]);
        }
        json[name] = val;
      }
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
 * @param {string} deprecatedFieldName
 * @param {function(*):*} normalizer
 * @param {*=} opt_value
 * @return {*|anychart.core.settings.IObjectWithSettings}
 * @this {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.settings.simpleHandler = function(fieldName, deprecatedFieldName, normalizer, opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = normalizer.call(this, opt_value);
    var comparator = this.getInvalidationCondition(fieldName);
    if (comparator.call(this, this.getOwnOption(fieldName), opt_value)) {
      this.setOption(fieldName, opt_value);
      if (this.check(/** @type {number} */ (this.getCapabilities(fieldName)))) {
        this.getHook(fieldName).call(this.getHookContext(fieldName));
        var signal = this.getSignal(fieldName);
        var consistencyState = this.getConsistencyState(fieldName);
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
 * Simple field handler, that is suitable for partial application to make real handlers.
 * @param {string} fieldName
 * @param {string} deprecatedFieldName
 * @param {function(*):*} normalizer
 * @param {*=} opt_value
 * @return {*|anychart.core.settings.IObjectWithSettings}
 * @this {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.settings.simpleDeprecatedHandler = function(fieldName, deprecatedFieldName, normalizer, opt_value) {
  if (fieldName)
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, [deprecatedFieldName + '()', fieldName + '()'], true);
  else
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED_WITHOUT_REPLACEMENT, null, [deprecatedFieldName + '()'], true);
  return anychart.core.settings.simpleHandler.call(this, fieldName, deprecatedFieldName, normalizer, opt_value);
};


/**
 * Field handler, that is suitable for partial application to make real handlers. Unlike the simpleHandler it passes
 * all args starting to the normalizer instead of the first param only.
 * @param {string} fieldName
 * @param {string} deprecatedFieldName
 * @param {function(Array):*} arrayNormalizer
 * @param {*=} opt_value
 * @param {...*} var_args
 * @return {*|anychart.core.settings.IObjectWithSettings}
 * @this {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.settings.multiArgsHandler = function(fieldName, deprecatedFieldName, arrayNormalizer, opt_value, var_args) {
  if (goog.isDef(opt_value)) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = [];
    for (var i = 3; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    opt_value = arrayNormalizer.call(this, args);
    var comparator = this.getInvalidationCondition(fieldName);
    if (comparator.call(this, this.getOwnOption(fieldName), opt_value)) {
      this.setOption(fieldName, opt_value);
      if (this.check(/** @type {number} */ (this.getCapabilities(fieldName)))) {
        this.getHook(fieldName).call(this.getHookContext(fieldName));
        var signal = this.getSignal(fieldName);
        var consistencyState = this.getConsistencyState(fieldName);
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
 * @param {string} deprecatedFieldName
 * @param {function(Array):*} arrayNormalizer
 * @param {*=} opt_value
 * @param {...*} var_args
 * @return {*|anychart.core.settings.IObjectWithSettings}
 * @this {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.settings.multiArgsDeprecatedHandler = function(fieldName, deprecatedFieldName, arrayNormalizer, opt_value, var_args) {
  if (fieldName)
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, [deprecatedFieldName + '()', fieldName + '()'], true);
  else
    anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED_WITHOUT_REPLACEMENT, null, [deprecatedFieldName + '()'], true);
  return anychart.core.settings.multiArgsHandler.apply(this, arguments);
};


/**
 * Handlers map to avoid switching.
 * @type {Array.<Function>}
 */
anychart.core.settings.handlersMap = (function() {
  var map = [];
  map[anychart.enums.PropertyHandlerType.SINGLE_ARG] = anychart.core.settings.simpleHandler;
  map[anychart.enums.PropertyHandlerType.MULTI_ARG] = anychart.core.settings.multiArgsHandler;
  map[anychart.enums.PropertyHandlerType.SINGLE_ARG_DEPRECATED] = anychart.core.settings.simpleDeprecatedHandler;
  map[anychart.enums.PropertyHandlerType.MULTI_ARG_DEPRECATED] = anychart.core.settings.multiArgsDeprecatedHandler;
  return map;
})();


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
 * Simple normalizer for stroke.
 * @param {*} arg
 * @return {acgraph.vector.Stroke}
 */
anychart.core.settings.strokeSimpleNormalizer = function(arg) {
  return acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null|undefined} */(arg));
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
 * @return {?number}
 */
anychart.core.settings.numberOrNullNormalizer = function(val) {
  return goog.isNull(val) ? val : Number(val);
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
 * Single arg normalizer for string params.
 * @param {*} val
 * @return {?string}
 */
anychart.core.settings.stringOrNullNormalizer = function(val) {
  return goog.isNull(val) ? val : String(val);
};


/**
 * Single arg normalizer for string or function params.
 * @param {*} val
 * @return {string|Function}
 */
anychart.core.settings.stringOrFunctionNormalizer = function(val) {
  return goog.isFunction(val) ? val : String(val);
};


/**
 * Single arg normalizer for string or function params.
 * @param {*} val
 * @return {number|string|Function}
 */
anychart.core.settings.numberOrPercentOrNullOrFunctionNormalizer = function(val) {
  return /** @type {Function|number|string} */((goog.isNull(val) || goog.isFunction(val) || anychart.utils.isPercent(val)) ? val : parseFloat(val));
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
 * @param {Array.<boolean|Array.<boolean>|Object>} args
 * @return {Object}
 */
anychart.core.settings.adjustFontSizeNormalizer = function(args) {
  var arg1 = args[0];
  if (args.length == 1) {
    if (goog.isArray(arg1)) {
      return {'width': arg1.length > 0 ? arg1[0] : void 0, 'height': arg1.length > 1 ? arg1[1] : arg1[0]};
    } else if (goog.isObject(arg1)) {
      return {'width': arg1['width'], 'height': arg1['height']};
    } else {
      return {'width': !!arg1, 'height': !!arg1};
    }
  } else {
    var arg2 = args[1];
    return {'width': !!arg1, 'height': !!arg2};
  }
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


/**
 * Single arg normalizer for start angle.
 * @param {*} val
 * @return {number}
 */
anychart.core.settings.startAngleNormalizer = function(val) {
  return goog.math.standardAngle(anychart.utils.toNumber(val) || 0);
};


/**
 * Returns null or percent value.
 * @param {*} val
 * @return {?string}
 */
anychart.core.settings.nullOrPercentNormalizer = function(val) {
  return goog.isNull(val) ? val : /** @type {string} */ (anychart.utils.normalizeToPercent(val));
};


//endregion
//region Descriptors
/**
 * @type {!Object.<string, Array>}
 */
anychart.core.settings.descriptors = (function() {
  var map = {};

  map.ENABLED = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer];

  map.FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer];
  map.FILL_FUNCTION = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillOrFunctionNormalizer];
  map.FILL_FUNCTION_SIMPLE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fill', anychart.core.settings.fillOrFunctionSimpleNormalizer];
  map.NEGATIVE_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'negativeFill', anychart.core.settings.fillOrFunctionNormalizer];
  map.RISING_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'risingFill', anychart.core.settings.fillOrFunctionNormalizer];
  map.FALLING_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fallingFill', anychart.core.settings.fillOrFunctionNormalizer];
  map.LOW_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'lowFill', anychart.core.settings.fillOrFunctionNormalizer];
  map.HIGH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'highFill', anychart.core.settings.fillOrFunctionNormalizer];

  map.STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer];
  map.STROKE_FUNCTION = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.STROKE_FUNCTION_SIMPLE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'stroke', anychart.core.settings.strokeOrFunctionSimpleNormalizer];
  map.LOW_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'lowStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.HIGH_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'highStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.NEGATIVE_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'negativeStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.RISING_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'risingStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.FALLING_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fallingStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.MEDIAN_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'medianStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.STEM_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stemStroke', anychart.core.settings.strokeOrFunctionNormalizer];
  map.WHISKER_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'whiskerStroke', anychart.core.settings.strokeOrFunctionNormalizer];

  map.HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'hatchFill', anychart.core.settings.hatchFillNormalizer];
  map.HATCH_FILL_FUNCTION = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'hatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];
  map.HATCH_FILL_FUNCTION_SIMPLE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hatchFill', anychart.core.settings.hatchFillOrFunctionSimpleNormalizer];
  map.NEGATIVE_HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'negativeHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];
  map.RISING_HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'risingHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];
  map.FALLING_HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fallingHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];
  map.HIGH_HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'highHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];
  map.LOW_HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'lowHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];

  map.ALIGN = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'align', anychart.enums.normalizeAlign];

  // box series
  map.WHISKER_WIDTH = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'whiskerWidth', anychart.core.settings.numberOrPercentNormalizer];

  // marker series
  map.TYPE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.core.settings.markerTypeNormalizer];
  map.SIZE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer];

  // annotations
  map.TREND = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'trend', anychart.core.settings.strokeOrFunctionNormalizer];
  map.GRID = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'grid', anychart.core.settings.strokeOrFunctionNormalizer];

  // linear gauge tank pointer
  map.EMPTY_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'emptyFill', anychart.core.settings.fillOrFunctionNormalizer];
  map.EMPTY_HATCH_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'emptyHatchFill', anychart.core.settings.hatchFillOrFunctionNormalizer];

  // tag cloud state descriptors
  map.FONT_FAMILY = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontFamily', anychart.core.settings.stringNormalizer];
  map.FONT_STYLE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontStyle', anychart.enums.normalizeFontStyle];
  map.FONT_VARIANT = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontVariant', anychart.enums.normalizeFontVariant];
  map.FONT_WEIGHT = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontWeight', anychart.core.settings.numberOrStringNormalizer];
  map.FONT_SIZE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontSize', anychart.core.settings.numberOrPercentOrNullOrFunctionNormalizer];
  // other text settings
  map.FONT_COLOR = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontColor', anychart.core.settings.stringOrNullNormalizer];
  map.FONT_OPACITY = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontOpacity', anychart.core.settings.numberNormalizer];
  map.FONT_DECORATION = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontDecoration', anychart.enums.normalizeFontDecoration];
  // pert tasks
  map.DUMMY_FILL = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'dummyFill', anychart.core.settings.fillOrFunctionNormalizer];
  map.DUMMY_STROKE = [anychart.enums.PropertyHandlerType.MULTI_ARG, 'dummyStroke', anychart.core.settings.strokeOrFunctionNormalizer];

  // connector
  map.EVENT_MARKER_TYPE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.enums.normalizeEventMarkerType];
  map.LENGTH = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'length', anychart.core.settings.numberOrPercentNormalizer];

  // event markers
  map.DIRECTION = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'direction', anychart.enums.normalizeDirection];
  map.EVENT_MARKERS_POSITION = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizeEventMarkerPosition];
  map.SERIES_ID = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'seriesId', anychart.core.settings.stringNormalizer];
  map.FIELD_NAME = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fieldName', anychart.core.settings.stringNormalizer];
  map.WIDTH = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer];
  map.HEIGHT = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer];
  map.FORMAT = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer];
  map.FONT_PADDING = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontPadding', anychart.core.settings.numberOrPercentNormalizer];
  map.STICK_TO_LEFT = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'stickToLeft', anychart.core.settings.booleanNormalizer];

  //pie
  map.EXPLODE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'explode', anychart.core.settings.numberOrPercentNormalizer];
  map.START_ANGLE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startAngle', anychart.core.settings.startAngleNormalizer];

  map.CURSOR = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'cursor', anychart.enums.normalizeCursor];
  map.CONTENT = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'content', anychart.core.settings.asIsNormalizer];

  map.OVERLAP_MODE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'overlapMode', anychart.enums.normalizeLabelsOverlapMode];

  //markers and markers factory
  map.ANCHOR = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.enums.normalizeAnchor];
  map.POSITION = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizePosition];
  map.OFFSET_X = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.numberNormalizer];
  map.OFFSET_Y = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.numberNormalizer];
  map.POSITION_FORMATTER = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.functionNormalizer];
  map.ROTATION = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberOrNullNormalizer];

  //axes
  map.DRAW_FIRST_LABEL = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawFirstLabel', anychart.core.settings.booleanNormalizer];
  map.DRAW_LAST_LABEL = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawLastLabel', anychart.core.settings.booleanNormalizer];

  map.WIDTH_NUMBER = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrNullNormalizer];
  map.HEIGHT_NUMBER = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrNullNormalizer];
  map.SHAPE = [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'shape', anychart.core.settings.stringOrNullNormalizer];
  return map;
})();


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
 * Returns capabilities that should be checked after option change.
 * @param {string} fieldName
 * @return {number|undefined} Capabilities
 */
anychart.core.settings.IObjectWithSettings.prototype.getCapabilities = function(fieldName) {};


/**
 * Returns state that should be invalidated after option changed and capabilities check has passed.
 * @param {string} fieldName
 * @return {anychart.ConsistencyState|number}
 */
anychart.core.settings.IObjectWithSettings.prototype.getConsistencyState = function(fieldName) {};


/**
 * Returns signal that should be dispatched after option changed and capabilities check has passed.
 * @param {string} fieldName
 * @return {number} Signal to dispatch
 */
anychart.core.settings.IObjectWithSettings.prototype.getSignal = function(fieldName) {};


/**
 * Returns hook context.
 * @param {string} fieldName
 * @return {*} Before invalidation hook.
 */
anychart.core.settings.IObjectWithSettings.prototype.getHookContext = function(fieldName) {};


/**
 * Returns hook that should be called before invalidation.
 * @param {string} fieldName
 * @return {Function} Before invalidation hook.
 */
anychart.core.settings.IObjectWithSettings.prototype.getHook = function(fieldName) {};


/**
 * Returns invalidation condition.
 * @param {string} fieldName
 * @return {function(*, *):boolean} Invalidation condition function.
 */
anychart.core.settings.IObjectWithSettings.prototype.getInvalidationCondition = function(fieldName) {};


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
 * @param {(Object.<string, *>)=} opt_meta - Meta key-value config to be copied to signal event.
 */
anychart.core.settings.IObjectWithSettings.prototype.dispatchSignal = function(state, opt_force, opt_meta) {};


/**
 * Returns parent state for state holder by type.
 * @param {anychart.PointState|number} stateType
 * @return {anychart.core.StateSettings}
 */
anychart.core.settings.IObjectWithSettings.prototype.getParentState = function(stateType) {};
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
