goog.provide('anychart.ganttModule.edit.Thumb');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



//endregion
//region -- Constructor.
/**
 * Edit thumb.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.edit.Thumb = function() {
  anychart.ganttModule.edit.Thumb.base(this, 'constructor');

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['stroke', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['size', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['type', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['verticalOffset', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['horizontalOffset', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['enabled', 0, 0]
  ]);
};
goog.inherits(anychart.ganttModule.edit.Thumb, anychart.core.Base);


//endregion
//region -- Signals ans Consistency.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.edit.Thumb.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION; //Needs to redraw edit settings.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.edit.Thumb.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Descriptors.
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.edit.Thumb.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.enums.normalizeMarkerType],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'verticalOffset', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'horizontalOffset', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.edit.Thumb, anychart.ganttModule.edit.Thumb.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.edit.Thumb.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.ganttModule.edit.Thumb.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.edit.Thumb.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.edit.Thumb.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.edit.Thumb.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent edit-element.
 * @param {?anychart.ganttModule.edit.Thumb=} opt_value - Value to set.
 * @return {?anychart.ganttModule.edit.Thumb} - Current parent or itself for chaining.
 */
anychart.ganttModule.edit.Thumb.prototype.parent = function(opt_value) {
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
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.edit.Thumb.prototype.parentInvalidated_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


//endregion
//region -- Serialization/Deserialization.
/** @inheritDoc */
anychart.ganttModule.edit.Thumb.prototype.setupSpecial = function(isDefault, var_args) {
  var arg0 = arguments[1];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    if (isDefault)
      this.themeSettings['enabled'] = arg0;
    else
      this['enabled'](arg0);
    return true;
  }
  return false;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.edit.Thumb.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.edit.Thumb.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.edit.Thumb.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.edit.Thumb.prototype.serialize = function() {
  var json = anychart.ganttModule.edit.Thumb.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.edit.Thumb.DESCRIPTORS, json, void 0, void 0, true);
  if (!this.hasOwnOption('enabled') || goog.isNull(json['enabled']))
    delete json['enabled'];
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.edit.Thumb.prototype.disposeInternal = function() {
  if (this.parent_) {
    this.parent_.unlistenSignals(this.parentInvalidated_, this);
    this.parent_ = null;
  }
  this.resolutionChainCache_ = null;

  anychart.ganttModule.edit.Thumb.base(this, 'disposeInternal');
};


//endregion

