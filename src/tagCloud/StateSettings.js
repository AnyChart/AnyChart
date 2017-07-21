goog.provide('anychart.tagCloudModule.StateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 * Tag cloud state settings class.
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.tagCloudModule.StateSettings = function() {
  anychart.tagCloudModule.StateSettings.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fontFamily', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['fill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['fontStyle', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['fontVariant', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['fontWeight', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED],
    ['fontSize', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.tagCloudModule.StateSettings, anychart.core.Base);


//region --- Chart Infrastructure Overrides
/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE;


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.tagCloudModule.StateSettings.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontFamily',
      anychart.core.settings.stringNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionSimpleNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontStyle',
      anychart.enums.normalizeFontStyle);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontVariant',
      anychart.enums.normalizeFontVariant);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontWeight',
      anychart.core.settings.numberOrStringNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontSize',
      anychart.core.settings.numberOrPercentOrNullOrFunctionNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.tagCloudModule.StateSettings, anychart.tagCloudModule.StateSettings.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/**
 * Resolution chain getter.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.tagCloudModule.StateSettings.prototype.getResolutionChain = function() {
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.tagCloudModule.StateSettings.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- Serialization
/** @inheritDoc *//**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.tagCloudModule.StateSettings.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Tag cloud props');

  return json;
};


/** @inheritDoc */
anychart.tagCloudModule.StateSettings.prototype.setupByJSON = function(config, opt_default) {
  this.suspendSignalsDispatching();

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }

  this.resumeSignalsDispatching(true);
};


//endregion
//region --- Exports
// (function() {
//   var proto = anychart.tagCloudModule.StateSettings.prototype;
//   proto['fill'] = proto.fill;
//   proto['fontFamily'] = proto.fontFamily;
//   proto['fontStyle'] = proto.fontStyle;
//   proto['fontVariant'] = proto.fontVariant;
//   proto['fontWeight'] = proto.fontWeight;
//   proto['fontSize'] = proto.fontSize;
// })();
//endregion
