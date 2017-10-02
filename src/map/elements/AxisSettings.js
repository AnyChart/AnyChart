//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.AxisSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.Title');
goog.require('anychart.mapModule.elements.Axis');
goog.require('anychart.mapModule.elements.AxisTicks');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.mapModule.Chart} map .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.mapModule.elements.AxisSettings = function(map) {
  anychart.mapModule.elements.AxisSettings.base(this, 'constructor');

  /**
   * Map.
   * @private
   * @type {anychart.mapModule.Chart}
   */
  this.map_ = map;

  /**
   * All axes.
   * @private
   * @type {Array.<anychart.mapModule.elements.Axis>}
   */
  this.axes_ = [];

  /**
   * Parent title.
   * @type {anychart.mapModule.elements.AxisSettings}
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
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['overlapMode', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawFirstLabel', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawLastLabel', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['enabled', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.ENABLED_STATE_CHANGED]
  ]);
};
goog.inherits(anychart.mapModule.elements.AxisSettings, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.AxisSettings.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.mapModule.elements.AxisSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.mapModule.elements.AxisSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.isResolvable = function() {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.getHighPriorityResolutionChain = function() {
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
anychart.mapModule.elements.AxisSettings.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'overlapMode',
      anychart.enums.normalizeLabelsOverlapMode);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawFirstLabel',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLastLabel',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'enabled',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.AxisSettings, anychart.mapModule.elements.AxisSettings.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Axes
/**
 * Return all exist axes.
 * @return {Array.<anychart.mapModule.elements.Axis>}
 */
anychart.mapModule.elements.AxisSettings.prototype.getItems = function() {
  return this.axes_;
};


/**
 * Top axis.
 * @param {(boolean|Object)=} opt_value Settings for axis.
 * @return {anychart.mapModule.elements.AxisSettings|anychart.mapModule.elements.Axis}
 */
anychart.mapModule.elements.AxisSettings.prototype.top = function(opt_value) {
  if (!this.topAxis_) {
    this.topAxis_ = new anychart.mapModule.elements.Axis();
    this.topAxis_.orientation(anychart.enums.Orientation.TOP);
    this.topAxis_.parent(this);
    this.topAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 0;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
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
 * @return {anychart.mapModule.elements.AxisSettings|anychart.mapModule.elements.Axis}
 */
anychart.mapModule.elements.AxisSettings.prototype.right = function(opt_value) {
  if (!this.rightAxis_) {
    this.rightAxis_ = new anychart.mapModule.elements.Axis();
    this.rightAxis_.orientation(anychart.enums.Orientation.RIGHT);
    this.rightAxis_.parent(this);
    this.rightAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 1;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
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
 * @return {anychart.mapModule.elements.AxisSettings|anychart.mapModule.elements.Axis}
 */
anychart.mapModule.elements.AxisSettings.prototype.bottom = function(opt_value) {
  if (!this.bottomAxis_) {
    this.bottomAxis_ = new anychart.mapModule.elements.Axis();
    this.bottomAxis_.orientation(anychart.enums.Orientation.BOTTOM);
    this.bottomAxis_.parent(this);
    this.bottomAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 2;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
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
 * @return {anychart.mapModule.elements.AxisSettings|anychart.mapModule.elements.Axis}
 */
anychart.mapModule.elements.AxisSettings.prototype.left = function(opt_value) {
  if (!this.leftAxis_) {
    this.leftAxis_ = new anychart.mapModule.elements.Axis();
    this.leftAxis_.orientation(anychart.enums.Orientation.LEFT);
    this.leftAxis_.parent(this);
    this.leftAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 3;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
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
 * @return {!(anychart.core.ui.Title|anychart.mapModule.elements.AxisSettings)} Axis title or itself for method chaining.
 */
anychart.mapModule.elements.AxisSettings.prototype.title = function(opt_value) {
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
anychart.mapModule.elements.AxisSettings.prototype.titleInvalidated_ = function(event) {
  this.title_.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Getter/setter for labels.
 * @param {(Object|boolean)=} opt_value Axis labels.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.mapModule.elements.AxisSettings)} Axis labels of itself for method chaining.
 */
anychart.mapModule.elements.AxisSettings.prototype.labels = function(opt_value) {
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
anychart.mapModule.elements.AxisSettings.prototype.labelsInvalidated_ = function(event) {
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
 * @return {!(anychart.core.ui.LabelsFactory|anychart.mapModule.elements.AxisSettings)} Axis labels of itself for method chaining.
 */
anychart.mapModule.elements.AxisSettings.prototype.minorLabels = function(opt_value) {
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
anychart.mapModule.elements.AxisSettings.prototype.minorLabelsInvalidated_ = function(event) {
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
 * @return {!(anychart.mapModule.elements.AxisTicks|anychart.mapModule.elements.AxisSettings)} Axis ticks or itself for method chaining.
 */
anychart.mapModule.elements.AxisSettings.prototype.ticks = function(opt_value) {
  if (!this.ticks_) {
    this.ticks_ = new anychart.mapModule.elements.AxisTicks();
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
 * @return {!(anychart.mapModule.elements.AxisTicks|anychart.mapModule.elements.AxisSettings)} Axis ticks or itself for method chaining.
 */
anychart.mapModule.elements.AxisSettings.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicks_) {
    this.minorTicks_ = new anychart.mapModule.elements.AxisTicks();
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
anychart.mapModule.elements.AxisSettings.prototype.ticksInvalidated_ = function(event) {
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
anychart.mapModule.elements.AxisSettings.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.setupSpecial = function(isDefault, var_args) {
  var arg0 = arguments[1];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    if (isDefault)
      this.themeSettings['enabled'] = !!arg0;
    else
      this.enabled(!!arg0);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.setupByJSON = function(config, opt_default) {
  this.map_.suspendSignalsDispatching();

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this['enabled']('enabled' in config ? config['enabled'] : true);
  }

  this.title().setupInternal(!!opt_default, config['title']);
  this.ticks().setupInternal(!!opt_default, config['ticks']);
  this.minorTicks().setupInternal(!!opt_default, config['minorTicks']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);

  this.left().setupInternal(!!opt_default, config['left']);
  this.top().setupInternal(!!opt_default, config['top']);
  this.right().setupInternal(!!opt_default, config['right']);
  this.bottom().setupInternal(!!opt_default, config['bottom']);

  this.map_.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.serialize = function() {
  var json = {};
  var axisSettings;

  if (this.leftAxis_) {
    axisSettings = this.leftAxis_.serialize();
    if (!goog.object.isEmpty(axisSettings))
      json['left'] = axisSettings;
  }
  if (this.topAxis_) {
    axisSettings = this.topAxis_.serialize();
    if (!goog.object.isEmpty(axisSettings))
      json['top'] = axisSettings;
  }
  if (this.rightAxis_) {
    axisSettings = this.rightAxis_.serialize();
    if (!goog.object.isEmpty(axisSettings))
      json['right'] = axisSettings;
  }
  if (this.bottomAxis_) {
    axisSettings = this.bottomAxis_.serialize();
    if (!goog.object.isEmpty(axisSettings))
      json['bottom'] = axisSettings;
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
anychart.mapModule.elements.AxisSettings.prototype.disposeInternal = function() {
  anychart.mapModule.elements.AxisSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.mapModule.elements.AxisSettings.prototype;
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
