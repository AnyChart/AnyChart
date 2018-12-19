//region --- Requiring and Providing
goog.provide('anychart.core.ui.Outline');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
//endregion



/**
 * Map axes settings.
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.core.ui.Outline = function() {
  anychart.core.ui.Outline.base(this, 'constructor');

  /**
   * Parent title.
   * @type {anychart.core.ui.Outline}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.markConsistent(anychart.ConsistencyState.ALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['width', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['offset', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['enabled', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.ui.Outline, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Outline.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Outline.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.Outline.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Outline.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Outline.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'width',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offset',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'enabled',
      anychart.core.settings.boolOrNullNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Outline, anychart.core.ui.Outline.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.ui.Outline.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  } else if (goog.isString(arg0)) {
    return {
      'fill': arg0,
      'stroke': null,
      'enabled': true
    };
  }
  return null;
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault) {
      this.themeSettings['enabled'] = resolvedValue['enabled'];

      if ('fill' in resolvedValue)
        this.themeSettings['fill'] = resolvedValue['fill'];

      if ('stroke' in resolvedValue)
        this.themeSettings['stroke'] = resolvedValue['stroke'];

    } else {
      this.enabled(resolvedValue['enabled']);

      if ('fill' in resolvedValue)
        this['fill'](resolvedValue['fill']);

      if ('stroke' in resolvedValue)
        this['stroke'](resolvedValue['stroke']);
    }
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this['enabled']('enabled' in config ? config['enabled'] : true);
  }
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axes props');

  return json;
};


/** @inheritDoc */
anychart.core.ui.Outline.prototype.disposeInternal = function() {
  anychart.core.ui.Outline.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  // var proto = anychart.core.ui.Outline.prototype;
  // proto['stroke'] = proto.stroke;
  // proto['fill'] = proto.fill;
  // proto['width'] = proto.width;
  // proto['offset'] = proto.offset;
  // proto['enabled'] = proto.enabled;
})();
//endregion
