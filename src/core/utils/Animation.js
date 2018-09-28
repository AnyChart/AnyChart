goog.provide('anychart.core.utils.Animation');
goog.require('anychart.core.Base');



/**
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Animation = function() {
  anychart.core.utils.Animation.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['duration', 0, anychart.Signal.NEEDS_REAPPLICATION]
  ]);
};
goog.inherits(anychart.core.utils.Animation, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Animation.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.Animation.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var durationNormalizer = function(val) {
    return goog.isNull(val) ? this.getThemeOption('duration') : anychart.utils.normalizeToNaturalNumber(val, this.getOption('duration'), true);
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'duration', durationNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.utils.Animation, anychart.core.utils.Animation.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.core.utils.Animation.prototype.serialize = function() {
  var json = {};
  anychart.core.settings.serialize(this, anychart.core.utils.Animation.PROPERTY_DESCRIPTORS, json);
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.utils.Animation.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.settings.deserialize(this, anychart.core.utils.Animation.PROPERTY_DESCRIPTORS, json, opt_default);
};


/** @inheritDoc */
anychart.core.utils.Animation.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  var result = null;
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    result = {'enabled': !!arg0};

    var arg1 = arguments[2];
    if (goog.isDef(arg1))
      result['duration'] = arg1;

  } else if (!isNaN(+arg0)) {
    result = {'enabled': true, 'duration': +arg0};
  }
  return result;
};


/** @inheritDoc */
anychart.core.utils.Animation.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if ('enabled' in resolvedValue)
      this['enabled'](resolvedValue['enabled']);
    if ('duration' in resolvedValue)
      this['duration'](resolvedValue['duration']);
    return true;
  }
  return false;
};


//exports
(function() {
  var proto = anychart.core.utils.Animation.prototype;
  // auto generated
  //proto['enabled'] = proto.enabled;
  //proto['duration'] = proto.duration;
})();
