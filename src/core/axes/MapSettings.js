//region --- Requiring and Providing
goog.provide('anychart.core.axes.MapSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.axes.Map');
goog.require('anychart.core.axes.MapTicks');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Title');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.charts.Map} map .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.core.axes.MapSettings = function(map) {
  anychart.core.axes.MapSettings.base(this, 'constructor');

  /**
   * Map.
   * @private
   * @type {anychart.charts.Map}
   */
  this.map_ = map;

  /**
   * All axes.
   * @private
   * @type {Array.<anychart.core.axes.Map>}
   */
  this.axes_ = [];

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

  /**
   * Parent title.
   * @type {anychart.core.axes.MapSettings}
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
};
goog.inherits(anychart.core.axes.MapSettings, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.MapSettings.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.ENABLED |
    anychart.ConsistencyState.Z_INDEX |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.AXIS_TITLE |
    anychart.ConsistencyState.AXIS_LABELS |
    anychart.ConsistencyState.AXIS_TICKS |
    anychart.ConsistencyState.AXIS_OVERLAP;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.MapSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED;


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axes.MapSettings.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map['overlapMode'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'overlapMode',
      anychart.enums.normalizeLabelsOverlapMode,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map['drawFirstLabel'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawFirstLabel',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map['drawLastLabel'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLastLabel',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map['enabled'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'enabled',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.ENABLED_STATE_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.axes.MapSettings, anychart.core.axes.MapSettings.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Axes
/**
 * Return all exist axes.
 * @return {Array.<anychart.core.axes.Map>}
 */
anychart.core.axes.MapSettings.prototype.getItems = function() {
  return this.axes_;
};


/**
 * Top axis.
 * @param {(boolean|Object)=} opt_value Settings for axis.
 * @return {anychart.core.axes.MapSettings|anychart.core.axes.Map}
 */
anychart.core.axes.MapSettings.prototype.top = function(opt_value) {
  if (!this.topAxis_) {
    this.topAxis_ = new anychart.core.axes.Map();
    this.topAxis_.orientation(anychart.enums.Orientation.TOP);
    this.topAxis_.parent(this);
    this.topAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 0;
    var zIndex = anychart.charts.Map.ZINDEX_AXIS + index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    this.topAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.topAxis_;
    this.registerDisposable(this.topAxis_);
  }

  if (goog.isDef(opt_value)) {
    this.topAxis_.setup(opt_value);
    return this;
  }
  return this.topAxis_;
};


/**
 * Right axis.
 * @param {(boolean|Object)=} opt_value Settings for axis.
 * @return {anychart.core.axes.MapSettings|anychart.core.axes.Map}
 */
anychart.core.axes.MapSettings.prototype.right = function(opt_value) {
  if (!this.rightAxis_) {
    this.rightAxis_ = new anychart.core.axes.Map();
    this.rightAxis_.orientation(anychart.enums.Orientation.RIGHT);
    this.rightAxis_.parent(this);
    this.rightAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 1;
    var zIndex = anychart.charts.Map.ZINDEX_AXIS + index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    this.rightAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.rightAxis_;
    this.registerDisposable(this.rightAxis_);
  }

  if (goog.isDef(opt_value)) {
    this.rightAxis_.setup(opt_value);
    return this;
  }
  return this.rightAxis_;
};


/**
 * Bottom axis.
 * @param {(boolean|Object)=} opt_value Settings for axis.
 * @return {anychart.core.axes.MapSettings|anychart.core.axes.Map}
 */
anychart.core.axes.MapSettings.prototype.bottom = function(opt_value) {
  if (!this.bottomAxis_) {
    this.bottomAxis_ = new anychart.core.axes.Map();
    this.bottomAxis_.orientation(anychart.enums.Orientation.BOTTOM);
    this.bottomAxis_.parent(this);
    this.bottomAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 2;
    var zIndex = anychart.charts.Map.ZINDEX_AXIS + index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    this.bottomAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.bottomAxis_;
    this.registerDisposable(this.bottomAxis_);
  }

  if (goog.isDef(opt_value)) {
    this.bottomAxis_.setup(opt_value);
    return this;
  }
  return this.bottomAxis_;
};


/**
 * Left axis.
 * @param {(boolean|Object)=} opt_value Settings for axis.
 * @return {anychart.core.axes.MapSettings|anychart.core.axes.Map}
 */
anychart.core.axes.MapSettings.prototype.left = function(opt_value) {
  if (!this.leftAxis_) {
    this.leftAxis_ = new anychart.core.axes.Map();
    this.leftAxis_.orientation(anychart.enums.Orientation.LEFT);
    this.leftAxis_.parent(this);
    this.leftAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 3;
    var zIndex = anychart.charts.Map.ZINDEX_AXIS + index * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
    this.leftAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.leftAxis_;
    this.registerDisposable(this.leftAxis_);
  }

  if (goog.isDef(opt_value)) {
    this.leftAxis_.setup(opt_value);
    return this;
  }
  return this.leftAxis_;
};


//endregion
//region --- Public complex settings
/**
 * Getter/setter for title.
 * @param {(boolean|Object|string)=} opt_value Axis title.
 * @return {!(anychart.core.ui.Title|anychart.core.axes.MapSettings)} Axis title or itself for method chaining.
 */
anychart.core.axes.MapSettings.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.title_.markConsistent(anychart.ConsistencyState.ALL);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    this.title_.markConsistent(anychart.ConsistencyState.ALL);
    return this;
  }
  return this.title_;
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.MapSettings.prototype.titleInvalidated_ = function(event) {
  this.title_.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Getter/setter for labels.
 * @param {(Object|boolean)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.MapSettings)} Axis labels of itself for method chaining.
 */
anychart.core.axes.MapSettings.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
    this.registerDisposable(this.labels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;

    this.labels_.setup(opt_value);
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
    return this;
  }
  return this.labels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.MapSettings.prototype.labelsInvalidated_ = function(event) {
  this.labels_.markConsistent(anychart.ConsistencyState.ALL);
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dispatchSignal(signal);
};


/**
 * Getter/setter for minorLabels.
 * @param {(Object|boolean)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.axes.MapSettings)} Axis labels of itself for method chaining.
 */
anychart.core.axes.MapSettings.prototype.minorLabels = function(opt_value) {
  if (!this.minorLabels_) {
    this.minorLabels_ = new anychart.core.ui.LabelsFactory();
    this.minorLabels_.listenSignals(this.minorLabelsInvalidated_, this);
    this.minorLabels_.markConsistent(anychart.ConsistencyState.ALL);
    this.registerDisposable(this.minorLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.minorLabels_.setup(opt_value);
    this.minorLabels_.markConsistent(anychart.ConsistencyState.ALL);
    return this;
  }
  return this.minorLabels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.MapSettings.prototype.minorLabelsInvalidated_ = function(event) {
  this.minorLabels_.markConsistent(anychart.ConsistencyState.ALL);
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dispatchSignal(signal);
};


/**
 * Getter/setter for ticks.
 * @param {(Object|boolean)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.MapTicks|anychart.core.axes.MapSettings)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.MapSettings.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.core.axes.MapTicks();
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
    this.registerDisposable(this.ticks_);
  }

  if (goog.isDef(opt_value)) {
    this.ticks_.setup(opt_value);
    return this;
  }
  return this.ticks_;
};


/**
 * Getter/setter for minorTicks.
 * @param {(Object|boolean)=} opt_value Axis ticks.
 * @return {!(anychart.core.axes.MapTicks|anychart.core.axes.MapSettings)} Axis ticks or itself for method chaining.
 */
anychart.core.axes.MapSettings.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.core.axes.MapTicks();
    this.minorTicks_.listenSignals(this.ticksInvalidated_, this);
    this.registerDisposable(this.minorTicks_);
  }

  if (goog.isDef(opt_value)) {
    this.minorTicks_.setup(opt_value);
    return this;
  }
  return this.minorTicks_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.axes.MapSettings.prototype.ticksInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal = anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  } else if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal = anychart.Signal.NEEDS_REDRAW;
  }
  this.dispatchSignal(signal);
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.axes.MapSettings.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default)
      this.themeSettings['enabled'] = !!value;
    else
      this.enabled(!!value);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.setupByJSON = function(config, opt_default) {
  this.map_.suspendSignalsDispatching();

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this.setOption('enabled', 'enabled' in config ? config['enabled'] : true);
  }

  this.title().setupByVal(config['title'], opt_default);
  this.ticks().setupByVal(config['ticks'], opt_default);
  this.minorTicks().setupByVal(config['minorTicks'], opt_default);

  this.labels().setup(config['labels']);
  this.minorLabels().setup(config['minorLabels']);

  this.left().setupByVal(config['left'], opt_default);
  this.top().setupByVal(config['top'], opt_default);
  this.right().setupByVal(config['right'], opt_default);
  this.bottom().setupByVal(config['bottom'], opt_default);

  this.map_.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.serialize = function() {
  var json = {};

  if (this.leftAxis_) {
    json['left'] = this.leftAxis_.serialize();
  }
  if (this.topAxis_) {
    json['top'] = this.topAxis_.serialize();
  }
  if (this.rightAxis_) {
    json['right'] = this.rightAxis_.serialize();
  }
  if (this.bottomAxis_) {
    json['bottom'] = this.bottomAxis_.serialize();
  }

  json['title'] = this.title_.serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axes props');

  return json;
};


/** @inheritDoc */
anychart.core.axes.MapSettings.prototype.disposeInternal = function() {
  anychart.core.axes.MapSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.axes.MapSettings.prototype;
  proto['left'] = proto.left;
  proto['top'] = proto.top;
  proto['right'] = proto.right;
  proto['bottom'] = proto.bottom;

  proto['title'] = proto.title;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
  proto['labels'] = proto.labels;
  proto['minorLabels'] = proto.minorLabels;

  // proto['enabled'] = proto.enabled;
  // proto['stroke'] = proto.stroke;
  // proto['drawFirstLabel'] = proto.drawFirstLabel;
  // proto['drawLastLabel'] = proto.drawLastLabel;
  // proto['overlapMode'] = proto.overlapMode;
})();
//endregion
