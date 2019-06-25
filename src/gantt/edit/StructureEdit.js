goog.provide('anychart.ganttModule.edit.StructureEdit');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



//endregion
//region -- Constructor.
/**
 * Timeline editing base settings.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.edit.StructureEdit = function() {
  anychart.ganttModule.edit.StructureEdit.base(this, 'constructor');

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['stroke', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['placementStroke', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['enabled', 0, anychart.Signal.ENABLED_STATE_CHANGED]
  ]);

};
goog.inherits(anychart.ganttModule.edit.StructureEdit, anychart.core.Base);


//endregion
//region -- Signals ans Consistency.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.edit.StructureEdit.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION; //Needs to redraw edit settings.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.edit.StructureEdit.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Descriptors.
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.edit.StructureEdit.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'placementStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.edit.StructureEdit, anychart.ganttModule.edit.StructureEdit.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.edit.StructureEdit.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.getHighPriorityResolutionChain = function() {
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
 * @param {?anychart.ganttModule.edit.StructureEdit=} opt_value - Value to set.
 * @return {?anychart.ganttModule.edit.StructureEdit} - Current parent or itself for chaining.
 */
anychart.ganttModule.edit.StructureEdit.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.onParentSignal_);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.onParentSignal_, this);
        this.parent_ = opt_value;
        this.parent_.listenSignals(this.onParentSignal_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.edit.StructureEdit.prototype.onParentSignal_ = function(e) {
  var signal = 0;
  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    signal |= anychart.Signal.ENABLED_STATE_CHANGED;
  }
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    signal |= anychart.Signal.NEEDS_REAPPLICATION;
  }
  this.dispatchSignal(signal);
};


//endregion
//region -- Serialization/Deserialization.
/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.setupSpecial = function(isDefault, var_args) {
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
anychart.ganttModule.edit.StructureEdit.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.edit.StructureEdit.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.edit.StructureEdit.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.edit.StructureEdit.prototype.serialize = function() {
  var json = anychart.ganttModule.edit.StructureEdit.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.edit.StructureEdit.DESCRIPTORS, json, void 0, void 0, true);
  if (!this.hasOwnOption('enabled') || goog.isNull(json['enabled']))
    delete json['enabled'];
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.edit.StructureEdit.prototype.disposeInternal = function() {
  if (this.parent_) {
    this.parent_.unlistenSignals(this.onParentSignal_, this);
    this.parent_ = null;
  }
  this.resolutionChainCache_ = null;

  anychart.ganttModule.edit.StructureEdit.base(this, 'disposeInternal');
};


//endregion
