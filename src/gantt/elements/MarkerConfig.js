goog.provide('anychart.ganttModule.elements.MarkerConfig');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');


//endregion
//region -- Constructor.
/**
 * Marker config for start/end marker described at DVF-4397.
 *
 * This class is kind of simplification of anychart.core.ui.MarkersFactory
 * for settings chained resolution:
 *  - This class is a settings storage only.
 *  - This class is signals dispatcher only.
 *  - This class is used to get flat settings config to be passed to real MarkersFactory's
 *    marker to set it up.
 *  - This class tries to keep high calculations performance for gantt timeline.
 *
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.elements.MarkerConfig = function() {
  anychart.ganttModule.elements.MarkerConfig.base(this, 'constructor');

  /**
   * Parent marker config.
   *
   * @type {?anychart.ganttModule.elements.MarkerConfig}
   * @private
   */
  this.parent_ = null;

  /**
   * Flat settings cache, seriously.
   *
   * @type {?Object}
   * @private
   */
  this.flatSettingsCache_ = null;

  /**
   * This signal doesn't contain NEEDS_REAPPLICATION because
   * currently the beforeInvalidationHandler dispatches it.
   *
   * @type {anychart.Signal|number}
   */
  var signal = anychart.Signal.NEEDS_REDRAW;

  /*
    This meta is actually a copy of anychart.core.ui.MarkersFactory's descriptors meta with
    some exceptions:
      - MarkerConfig doesn't need positionFormatter
        because timeline itself will put the marker where it needs.
      - MarkerConfig is the settings storage an simple events dispatcher, so
        it doesn't have any consistency states. 
   */
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['position', 0, signal, void 0, this.resetCache],
    ['offsetY', 0, signal, void 0, this.resetCache],
    ['offsetX', 0, signal, void 0, this.resetCache],
    ['fill', 0, signal, void 0, this.resetCache],
    ['stroke', 0, signal, void 0, this.resetCache],
    // ['positionFormatter', 0, signal], // This field is excluded!
    ['anchor', 0, signal, void 0, this.resetCache],
    ['size', 0, signal, void 0, this.resetCache],
    ['rotation', 0, signal, void 0, this.resetCache],
    ['type', 0, signal, void 0, this.resetCache],
    ['enabled', 0, signal, void 0, this.resetCache] // Added as descriptor.
  ]);

};
goog.inherits(anychart.ganttModule.elements.MarkerConfig, anychart.core.Base);


//endregion
//region -- Supported signals.
/**
 * Supported signals.
 *
 * @type {anychart.Signal|number}
 */
anychart.ganttModule.elements.MarkerConfig.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW | // Regular redraw on any settings change.
    anychart.Signal.NEEDS_REAPPLICATION; // Parent invalidation signal.


//endregion
//region -- Optimized props descriptors.
/**
 * Simple descriptors.
 *
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.MarkerConfig.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.POSITION,
    anychart.core.settings.descriptors.OFFSET_Y,
    anychart.core.settings.descriptors.OFFSET_X,
    anychart.core.settings.descriptors.FILL,
    anychart.core.settings.descriptors.STROKE,
    // anychart.core.settings.descriptors.POSITION_FORMATTER, // This field is excluded!
    anychart.core.settings.descriptors.ANCHOR,
    anychart.core.settings.descriptors.SIZE,
    anychart.core.settings.descriptors.ROTATION,
    anychart.core.settings.descriptors.ENABLED, // Added as descriptor.
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.enums.normalizeMarkerType]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.MarkerConfig, anychart.ganttModule.elements.MarkerConfig.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.elements.MarkerConfig.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.ganttModule.elements.MarkerConfig.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.elements.MarkerConfig.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.elements.MarkerConfig.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.elements.MarkerConfig.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent element.
 *
 * @param {?anychart.ganttModule.elements.MarkerConfig=} opt_value - Value to set.
 * @return {?anychart.ganttModule.elements.MarkerConfig} - Current parent or itself for chaining.
 */
anychart.ganttModule.elements.MarkerConfig.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * This signal is used to reset flat settings cache on parent change.
 *
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.MarkerConfig.prototype.parentInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.resetCache(); // This will dispatch anychart.Signal.NEEDS_REAPPLICATION.
  }
};


//endregion
//region -- Private API.
/**
 * Resets flat settings cache.
 */
anychart.ganttModule.elements.MarkerConfig.prototype.resetCache = function() {
  this.flatSettingsCache_ = null;

  // This signal is force-dispatched to provide flatSettingsCache_ resetting during the suspension.
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION, true);
};



//endregion
//region -- Internal developers API.
/**
 * Flattens marker settings.
 *
 * @return {Object} - Flat resolution chaining result.
 */
anychart.ganttModule.elements.MarkerConfig.prototype.getFlatConfig = function() {
  if (!this.flatSettingsCache_) {
    this.flatSettingsCache_ = {};
    for (var key in anychart.ganttModule.elements.MarkerConfig.DESCRIPTORS) {
      // Gets value from resolution chain.
      var value = this.getOption(key);
      if (goog.isDef(value)) {
        this.flatSettingsCache_[key] = value;
      }
    }
  }
  return this.flatSettingsCache_;
};


//endregion
//region -- Serialization/Deserialization.
/** @inheritDoc */
anychart.ganttModule.elements.MarkerConfig.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.ganttModule.elements.MarkerConfig.prototype.setupSpecial = function(isDefault, var_args) {
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


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.MarkerConfig.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.MarkerConfig.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.elements.MarkerConfig.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.MarkerConfig.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.MarkerConfig.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.elements.MarkerConfig.DESCRIPTORS, json, void 0, void 0, true);
  return json;
};


//endregion