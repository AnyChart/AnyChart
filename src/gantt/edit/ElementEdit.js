goog.provide('anychart.ganttModule.edit.ElementEdit');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.ganttModule.edit.SideControl');
goog.require('anychart.ganttModule.edit.StructureEdit');
goog.require('anychart.ganttModule.edit.Thumb');



//endregion
//region -- Constructor.
/**
 * Timeline editing base settings.
 * @param {anychart.ganttModule.edit.StructureEdit} enabledStateProvider - 'enabled' state provider.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.edit.ElementEdit = function(enabledStateProvider) {
  anychart.ganttModule.edit.ElementEdit.base(this, 'constructor');

  /**
   * 'enabled' state provider.
   * @type {anychart.ganttModule.edit.StructureEdit}
   * @private
   */
  this.enabledStateProvider_ = enabledStateProvider;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['stroke', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['enabled', 0, anychart.Signal.NEEDS_REAPPLICATION]
  ]);

  /**
   * Thumbs settings.
   * @type {anychart.ganttModule.edit.Thumb}
   * @private
   */
  this.thumbs_ = null;

  /**
   * Connector thumbs settings.
   * @type {anychart.ganttModule.edit.Thumb}
   * @private
   */
  this.connectorThumbs_ = null;

  /**
   * Start side control settings.
   * @type {anychart.ganttModule.edit.SideControl}
   * @private
   */
  this.start_ = null;

  /**
   * End side control settings.
   * @type {anychart.ganttModule.edit.SideControl}
   * @private
   */
  this.end_ = null;
};
goog.inherits(anychart.ganttModule.edit.ElementEdit, anychart.core.Base);


//endregion
//region -- Signals ans Consistency.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.edit.ElementEdit.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION; //Needs to redraw edit settings.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.edit.ElementEdit.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Descriptors.
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.edit.ElementEdit.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.edit.ElementEdit, anychart.ganttModule.edit.ElementEdit.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.edit.ElementEdit.prototype.getOption = function(name) {
  var res = anychart.core.settings.getOption.call(this, name);
  if (name == 'enabled')
    res = goog.isDefAndNotNull(res) ? res : this.enabledStateProvider_.getOption('enabled');
  return res;
};


/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.getHighPriorityResolutionChain = function() {
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
 * @param {?anychart.ganttModule.edit.ElementEdit=} opt_value - Value to set.
 * @return {?anychart.ganttModule.edit.ElementEdit} - Current parent or itself for chaining.
 */
anychart.ganttModule.edit.ElementEdit.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.redispatch_);
        this.thumbs().parent(null);
        this.connectorThumbs().parent(null);
        this.start().parent(null);
        this.end().parent(null);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.redispatch_, this);
        this.parent_ = opt_value;
        this.thumbs().parent(this.parent_.thumbs());
        this.connectorThumbs().parent(this.parent_.connectorThumbs());
        this.start().parent(this.parent_.start());
        this.end().parent(this.parent_.end());
        this.parent_.listenSignals(this.redispatch_, this);
      }
    }
    this.start().resolutionChainCache(null);
    this.end().resolutionChainCache(null);
    return this;
  }
  return this.parent_;
};


//endregion
//region -- API.
/**
 * Common edit thumbs settings.
 * @param {Object=} opt_value - Setup object.
 * @return {anychart.ganttModule.edit.ElementEdit|anychart.ganttModule.edit.Thumb} - Current value or itself for chaining.
 */
anychart.ganttModule.edit.ElementEdit.prototype.thumbs = function(opt_value) {
  if (!this.thumbs_) {
    this.thumbs_ = new anychart.ganttModule.edit.Thumb();
    this.setupCreated('thumbs', this.thumbs_);
    this.thumbs_.listenSignals(this.redispatch_, this);
  }

  if (goog.isDef(opt_value)) {
    this.thumbs_.setup(opt_value);
    return this;
  }

  return this.thumbs_;
};


/**
 * Common edit thumbs settings.
 * @param {Object=} opt_value - Setup object.
 * @return {anychart.ganttModule.edit.ElementEdit|anychart.ganttModule.edit.Thumb} - Current value or itself for chaining.
 */
anychart.ganttModule.edit.ElementEdit.prototype.connectorThumbs = function(opt_value) {
  if (!this.connectorThumbs_) {
    this.connectorThumbs_ = new anychart.ganttModule.edit.Thumb();
    this.setupCreated('connectorThumbs', this.connectorThumbs_);
    // this.connectorThumbs_.parent(/** @type {anychart.ganttModule.edit.Thumb} */ (this.thumbs()));
    this.connectorThumbs_.listenSignals(this.redispatch_, this);
  }

  if (goog.isDef(opt_value)) {
    this.connectorThumbs_.setup(opt_value);
    return this;
  }

  return this.connectorThumbs_;
};


/**
 * Start edit control settings.
 * @param {Object=} opt_value - Setup object.
 * @return {anychart.ganttModule.edit.ElementEdit|anychart.ganttModule.edit.SideControl} - Current value or itself for chaining.
 */
anychart.ganttModule.edit.ElementEdit.prototype.start = function(opt_value) {
  if (!this.start_) {
    this.start_ = new anychart.ganttModule.edit.SideControl();
    this.setupCreated('start', this.start_);
    this.start_.thumb().parent(/** @type {anychart.ganttModule.edit.Thumb} */ (this.thumbs()));
    this.start_.connectorThumb().parent(this.connectorThumbs());
    this.start_.listenSignals(this.redispatch_, this);
  }

  if (goog.isDef(opt_value)) {
    this.start_.setup(opt_value);
    return this;
  }

  return this.start_;
};


/**
 * End edit control settings.
 * @param {Object=} opt_value - Setup object.
 * @return {anychart.ganttModule.edit.ElementEdit|anychart.ganttModule.edit.SideControl} - Current value or itself for chaining.
 */
anychart.ganttModule.edit.ElementEdit.prototype.end = function(opt_value) {
  if (!this.end_) {
    this.end_ = new anychart.ganttModule.edit.SideControl();
    this.setupCreated('end', this.end_);
    this.end_.thumb().parent(/** @type {anychart.ganttModule.edit.Thumb} */ (this.thumbs()));
    this.end_.connectorThumb().parent(this.connectorThumbs());
    this.end_.listenSignals(this.redispatch_, this);
  }

  if (goog.isDef(opt_value)) {
    this.end_.setup(opt_value);
    return this;
  }

  return this.end_;
};


/**
 * Redispatcher.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.edit.ElementEdit.prototype.redispatch_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


//endregion
//region -- Serialization/Deserialization.
/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    if (isDefault) {
      this.themeSettings['enabled'] = resolvedValue['enabled'];
    } else {
      this.enabled(resolvedValue['enabled']);
    }
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.edit.ElementEdit.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.edit.ElementEdit.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.edit.ElementEdit.DESCRIPTORS, config, opt_default);
  if ('thumbs' in config)
    this.thumbs().setupInternal(!!opt_default, config['thumbs']);
  if ('connectorThumbs' in config)
    this.connectorThumbs().setupInternal(!!opt_default, config['connectorThumbs']);
  if ('start' in config)
    this.start().setupInternal(!!opt_default, config['start']);
  if ('end' in config)
    this.end().setupInternal(!!opt_default, config['end']);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.edit.ElementEdit.prototype.serialize = function() {
  var json = anychart.ganttModule.edit.ElementEdit.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.edit.ElementEdit.DESCRIPTORS, json, void 0, void 0, true);
  if (!this.hasOwnOption('enabled') || goog.isNull(json['enabled']))
    delete json['enabled'];
  json['thumbs'] = this.thumbs().serialize();
  json['connectorThumbs'] = this.connectorThumbs().serialize();
  json['start'] = this.start().serialize();
  json['end'] = this.end().serialize();
  return json;
};


/** @inheritDoc */
anychart.ganttModule.edit.ElementEdit.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.thumbs_,
      this.connectorThumbs_,
      this.start_,
      this.end_);
  this.thumbs_ = null;
  this.connectorThumbs_ = null;
  this.start_ = null;
  this.end_ = null;
  anychart.ganttModule.edit.ElementEdit.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.edit.ElementEdit.prototype;
  proto['thumbs'] = proto.thumbs;
  proto['connectorThumbs'] = proto.connectorThumbs;
  proto['start'] = proto.start;
  proto['end'] = proto.end;
})();


//endregion
