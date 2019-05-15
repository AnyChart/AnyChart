//region --- Requiring and Providing
goog.provide('anychart.sunburstModule.Level');
goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.sunburstModule.Chart} target .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.sunburstModule.Level = function(target) {
  anychart.sunburstModule.Level.base(this, 'constructor');

  /**
   * Owner.
   * @type {anychart.sunburstModule.Chart}
   */
  this.target = target;

  /**
   * Parent title.
   * @type {anychart.sunburstModule.Level}
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
    ['thickness', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['enabled', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW]
  ]);

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['labels', anychart.ConsistencyState.ONLY_DISPATCHING, 0]
  ]);
  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, /** @this {anychart.sunburstModule.Level} */ function(factory) {
    factory.listenSignals(this.labelsSignalHandler, this);
    factory.setParentEventTarget(this);
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  });

  var hoveredDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(hoveredDescriptorsMeta, [
    ['labels', anychart.ConsistencyState.ONLY_DISPATCHING, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, hoveredDescriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);

  var selectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(selectedDescriptorsMeta, [
    ['labels', anychart.ConsistencyState.ONLY_DISPATCHING, 0]
  ]);
  this.selected_ = new anychart.core.StateSettings(this, selectedDescriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME);

  this.normal_.labels().markConsistent(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.sunburstModule.Level, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.sunburstModule.Level, ['labels'], 'normal');


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.sunburstModule.Level.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;


//endregion
//region --- Descriptors


/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.sunburstModule.Level.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  function thicknessNormalizer(opt_value) {
    return goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeNumberOrPercent(opt_value);
  }
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thickness',
      thicknessNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'enabled',
      anychart.core.settings.boolOrNullNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.sunburstModule.Level, anychart.sunburstModule.Level.PROPERTY_DESCRIPTORS);


//endregion
//region --- API
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.sunburstModule.Level}
 */
anychart.sunburstModule.Level.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.sunburstModule.Level}
 */
anychart.sunburstModule.Level.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.sunburstModule.Level}
 */
anychart.sunburstModule.Level.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
//region --- Labels
/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 */
anychart.sunburstModule.Level.prototype.labelsSignalHandler = function(event) {
  this.normal_.labels().markConsistent(anychart.ConsistencyState.ALL);
  this.target.labelsInvalidated(event);
};
//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.sunburstModule.Level.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.sunburstModule.Level.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.sunburstModule.Level.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.sunburstModule.Level.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.sunburstModule.Level.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.sunburstModule.Level.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.sunburstModule.Level.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault)
      this.themeSettings['enabled'] = resolvedValue['enabled'];
    else
      this.enabled(resolvedValue['enabled']);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.sunburstModule.Level.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, anychart.sunburstModule.Level.PROPERTY_DESCRIPTORS, config);

  this.normal_.setupInternal(!!opt_default, config);
  this.normal_.setupInternal(!!opt_default, config['normal']);
  this.hovered_.setupInternal(!!opt_default, config['hovered']);
  this.selected_.setupInternal(!!opt_default, config['selected']);
};


/** @inheritDoc */
anychart.sunburstModule.Level.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, anychart.sunburstModule.Level.PROPERTY_DESCRIPTORS, json, 'Sunburst level');

  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return json;
};

/**
 * @inheritDoc
 */
anychart.sunburstModule.Level.prototype.disposeInternal = function() {
  goog.disposeAll(this.normal_, this.hovered_, this.selected_);
  this.normal_ = null;
  this.hovered_ = null;
  this.selected_ = null;
  anychart.sunburstModule.Level.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.sunburstModule.Level.prototype;
  // proto['thickness'] = proto.thickness;
  // proto['labels'] = proto.labels;
  // proto['enabled'] = proto.enabled;

  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion
