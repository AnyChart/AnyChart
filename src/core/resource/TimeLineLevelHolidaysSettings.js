//region --- Provide & Require
goog.provide('anychart.core.resource.TimeLineLevelHolidaysSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.Padding');
//endregion



/**
 * Resource Chart Timeline element.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.resource.TimeLineLevelHolidaysSettings = function() {
  anychart.core.resource.TimeLineLevelHolidaysSettings.base(this, 'constructor');

  /**
   * Padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = new anychart.core.utils.Padding();
  this.padding_.listenSignals(this.boundsInvalidated_, this);

  /**
   * Settings holder.
   * @type {!Object}
   */
  this.settings = {};

  /**
   * Default settings holder.
   * @type {!Object}
   */
  this.defaultSettings = {};

  /**
   * Parent title.
   * @type {anychart.core.resource.TimeLine}
   * @private                                                                                        `
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.markConsistent(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.resource.TimeLineLevelHolidaysSettings, anychart.core.Base);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED;


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.settings[name]);
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.defaultSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.settings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.resource.TimeLine=} opt_value - Value to set.
 * @return {anychart.core.resource.TimeLine|anychart.core.resource.TimeLineLevelHolidaysSettings} - Current value or itself for method chaining.
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_)
        this.parent_.listenSignals(this.parentInvalidated_, this);
      this.padding_.parent(/** @type {anychart.core.utils.Padding} */(this.parent_.padding()));
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
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    // state |= this.ALL_VISUAL_STATES;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
  }

  this.invalidate(state, signal);
};


//endregion
//region --- Settings
//------------------------------------------------------------------------------
//
//  Settings
//
//------------------------------------------------------------------------------
/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS =
    anychart.core.settings.createTextPropertiesDescriptors(
        anychart.ConsistencyState.ONLY_DISPATCHING,
        anychart.ConsistencyState.ONLY_DISPATCHING,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
        anychart.Signal.NEEDS_REDRAW
    );
anychart.core.resource.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS['textFormatter'] =
    anychart.core.settings.createDescriptor(
        anychart.enums.PropertyHandlerType.SINGLE_ARG,
        'textFormatter',
        anychart.core.settings.asIsNormalizer,
        anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
anychart.core.settings.populate(anychart.core.resource.TimeLineLevelHolidaysSettings, anychart.core.resource.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS);


/**
 * Properties that should be defined in anychart.core.resource.TimeLineLevelHolidaysSettings prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.TimeLineLevelHolidaysSettings, anychart.core.resource.TimeLineLevelHolidaysSettings.DESCRIPTORS);


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|anychart.core.utils.Space.NormalizedSpace)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.resource.TimeLineLevelHolidaysSettings|anychart.core.utils.Padding)} .
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return /** @type {!anychart.core.utils.Padding} */(this.padding_);
};


//endregion
//region --- Signals handling
//------------------------------------------------------------------------------
//
//  Signals handling
//
//------------------------------------------------------------------------------
/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.defaultSettings, anychart.core.resource.TimeLineLevelHolidaysSettings.DESCRIPTORS, config);
  anychart.core.settings.copy(this.defaultSettings, anychart.core.resource.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.resource.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, anychart.core.resource.TimeLineLevelHolidaysSettings.DESCRIPTORS, config);
  }

  this.padding().setupByVal(config['padding'], opt_default);
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.serialize = function() {
  var json = {};

  json['padding'] = this.padding().serialize();

  anychart.core.settings.serialize(this, anychart.core.resource.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS, json, 'Time line holidays settings text props');
  anychart.core.settings.serialize(this, anychart.core.resource.TimeLineLevelHolidaysSettings.DESCRIPTORS, json, 'Time line holidays settings props');

  return json;
};


/** @inheritDoc */
anychart.core.resource.TimeLineLevelHolidaysSettings.prototype.disposeInternal = function() {
  anychart.core.resource.TimeLineLevelHolidaysSettings.base(this, 'disposeInternal');

  goog.dispose(this.padding_);
  this.padding_ = null;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.resource.TimeLineLevelHolidaysSettings.prototype;
  proto['padding'] = proto.padding;
})();


//endregion
