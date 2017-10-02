//region --- Provide & Require
goog.provide('anychart.resourceModule.TimeLineLevelHolidaysSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.utils.Padding');
//endregion



/**
 * Resource Chart Timeline element.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.resourceModule.TimeLineLevelHolidaysSettings = function() {
  anychart.resourceModule.TimeLineLevelHolidaysSettings.base(this, 'constructor');

  /**
   * Padding.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = new anychart.core.utils.Padding();
  this.padding_.listenSignals(this.boundsInvalidated_, this);

  /**
   * Parent title.
   * @type {anychart.resourceModule.TimeLine}
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

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
      anychart.Signal.NEEDS_REDRAW);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['format', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.resourceModule.TimeLineLevelHolidaysSettings, anychart.core.Base);


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
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.isResolvable = function() {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.resourceModule.TimeLine=} opt_value - Value to set.
 * @return {anychart.resourceModule.TimeLine|anychart.resourceModule.TimeLineLevelHolidaysSettings} - Current value or itself for method chaining.
 */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.parent = function(opt_value) {
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
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.parentInvalidated_ = function(e) {
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
anychart.resourceModule.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS = (function() {
  var map = anychart.core.settings.createTextPropertiesDescriptors();
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'format',
      anychart.core.settings.stringOrFunctionNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.TimeLineLevelHolidaysSettings, anychart.resourceModule.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS);


/**
 * Properties that should be defined in anychart.resourceModule.TimeLineLevelHolidaysSettings prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.TimeLineLevelHolidaysSettings.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.TimeLineLevelHolidaysSettings, anychart.resourceModule.TimeLineLevelHolidaysSettings.DESCRIPTORS);


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|anychart.core.utils.Space.NormalizedSpace)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.resourceModule.TimeLineLevelHolidaysSettings|anychart.core.utils.Padding)} .
 */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.boundsInvalidated_ = function(event) {
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
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, anychart.resourceModule.TimeLineLevelHolidaysSettings.DESCRIPTORS, config);
  anychart.core.settings.copy(this.themeSettings, anychart.resourceModule.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.resourceModule.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, anychart.resourceModule.TimeLineLevelHolidaysSettings.DESCRIPTORS, config);
  }

  this.padding().setupInternal(!!opt_default, config['padding']);
};


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.serialize = function() {
  var json = {};

  json['padding'] = this.padding().serialize();

  anychart.core.settings.serialize(this, anychart.resourceModule.TimeLineLevelHolidaysSettings.TEXT_DESCRIPTORS, json, 'Time line holidays settings text props');
  anychart.core.settings.serialize(this, anychart.resourceModule.TimeLineLevelHolidaysSettings.DESCRIPTORS, json, 'Time line holidays settings props');

  return json;
};


/** @inheritDoc */
anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype.disposeInternal = function() {
  anychart.resourceModule.TimeLineLevelHolidaysSettings.base(this, 'disposeInternal');

  goog.dispose(this.padding_);
  this.padding_ = null;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.resourceModule.TimeLineLevelHolidaysSettings.prototype;
  proto['padding'] = proto.padding;
})();


//endregion
