goog.provide('anychart.core.TagCloudStateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 * Tag cloud state settings class.
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.TagCloudStateSettings = function() {
  anychart.core.TagCloudStateSettings.base(this, 'constructor');
  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};
};
goog.inherits(anychart.core.TagCloudStateSettings, anychart.core.Base);


//region --- Chart Infrastructure Overrides
/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REDRAW_APPEARANCE;


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.TagCloudStateSettings.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontFamily',
      anychart.core.settings.stringNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.BOUNDS_CHANGED);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionSimpleNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW_APPEARANCE);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontStyle',
      anychart.enums.normalizeFontStyle,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.BOUNDS_CHANGED);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontVariant',
      anychart.enums.normalizeFontVariant,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.BOUNDS_CHANGED);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontWeight',
      anychart.core.settings.numberOrStringNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.BOUNDS_CHANGED);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fontSize',
      anychart.core.settings.numberOrPercentOrNullOrFunctionNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.BOUNDS_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.TagCloudStateSettings, anychart.core.TagCloudStateSettings.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/**
 * Resolution chain getter.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.TagCloudStateSettings.prototype.getResolutionChain = function() {
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- Serialization
/** @inheritDoc *//**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.TagCloudStateSettings.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Tag cloud props');

  return json;
};


/** @inheritDoc */
anychart.core.TagCloudStateSettings.prototype.setupByJSON = function(config, opt_default) {
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
//   var proto = anychart.core.TagCloudStateSettings.prototype;
//   proto['fill'] = proto.fill;
//   proto['fontFamily'] = proto.fontFamily;
//   proto['fontStyle'] = proto.fontStyle;
//   proto['fontVariant'] = proto.fontVariant;
//   proto['fontWeight'] = proto.fontWeight;
//   proto['fontSize'] = proto.fontSize;
// })();
//endregion
