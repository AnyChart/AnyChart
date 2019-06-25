goog.provide('anychart.ganttModule.edit.SideControl');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.ganttModule.edit.Thumb');



//endregion
//region -- Constructor.
/**
 * Edit thumb.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.edit.SideControl = function() {
  anychart.ganttModule.edit.SideControl.base(this, 'constructor');

  /**
   * Thumb settings.
   * @type {anychart.ganttModule.edit.Thumb}
   * @private
   */
  this.thumb_ = null;

  /**
   * Connector thumb settings.
   * @type {anychart.ganttModule.edit.Thumb}
   * @private
   */
  this.connectorThumb_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

};
goog.inherits(anychart.ganttModule.edit.SideControl, anychart.core.Base);


//endregion
//region -- Signals ans Consistency.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.edit.SideControl.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION; //Needs to redraw edit settings.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.edit.SideControl.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent edit-element.
 * @param {?anychart.ganttModule.edit.SideControl=} opt_value - Value to set.
 * @return {?anychart.ganttModule.edit.SideControl} - Current parent or itself for chaining.
 */
anychart.ganttModule.edit.SideControl.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.thumb().parent(null);
        this.connectorThumb().parent(null);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.thumb().parent(this.parent_.thumb());
        this.connectorThumb().parent(this.parent_.connectorThumb());
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
anychart.ganttModule.edit.SideControl.prototype.parentInvalidated_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/** @inheritDoc */
anychart.ganttModule.edit.SideControl.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.edit.SideControl.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.edit.SideControl.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.edit.SideControl.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- API.
/**
 * Thumb settings getter/setter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.edit.SideControl|anychart.ganttModule.edit.Thumb} - Current value or itself for method chaining.
 */
anychart.ganttModule.edit.SideControl.prototype.thumb = function(opt_value) {
  if (!this.thumb_) {
    this.thumb_ = new anychart.ganttModule.edit.Thumb();
    this.setupCreated('thumb', this.thumb_);
    this.thumb_.listenSignals(this.redispatch_, this);
  }

  if (goog.isDef(opt_value)) {
    this.thumb_.setup(opt_value);
    return this;
  }

  return this.thumb_;
};


/**
 * Connector thumb settings getter/setter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.edit.SideControl|anychart.ganttModule.edit.Thumb} - Current value or itself for method chaining.
 */
anychart.ganttModule.edit.SideControl.prototype.connectorThumb = function(opt_value) {
  if (!this.connectorThumb_) {
    this.connectorThumb_ = new anychart.ganttModule.edit.Thumb();
    this.setupCreated('connectorThumb', this.connectorThumb_);
    this.connectorThumb_.listenSignals(this.redispatch_, this);
  }

  if (goog.isDef(opt_value)) {
    this.connectorThumb_.setup(opt_value);
    return this;
  }

  return this.connectorThumb_;
};


/**
 * Redispatcher.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.edit.SideControl.prototype.redispatch_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.edit.SideControl.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.edit.SideControl.base(this, 'setupByJSON', config, opt_default);
  this.thumb().setupInternal(!!opt_default, config['thumb']);
  this.connectorThumb().setupInternal(!!opt_default, config['connectorThumb']);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.edit.SideControl.prototype.serialize = function() {
  var json = anychart.ganttModule.edit.SideControl.base(this, 'serialize');
  json['thumb'] = this.thumb().serialize();
  json['connectorThumb'] = this.connectorThumb().serialize();
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.edit.SideControl.prototype.disposeInternal = function() {
  if (this.parent_) {
    this.parent_.unlistenSignals(this.parentInvalidated_, this);
    this.parent_ = null;
  }
  this.resolutionChainCache_ = null;

  this.thumb_.unlistenSignals(this.redispatch_, this);
  this.connectorThumb_.unlistenSignals(this.redispatch_, this);
  goog.disposeAll(this.thumb_, this.connectorThumb_);
  this.thumb_ = null;
  this.connectorThumb_ = null;

  anychart.ganttModule.edit.SideControl.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.edit.SideControl.prototype;
  proto['thumb'] = proto.thumb;
  proto['connectorThumb'] = proto.connectorThumb;
})();


//endregion
