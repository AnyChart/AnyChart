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
anychart.mapModule.elements.AxisSettings.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  var descriptors = anychart.core.settings.descriptors;

  anychart.core.settings.createDescriptors(map, [
    descriptors.STROKE,
    descriptors.OVERLAP_MODE,
    descriptors.DRAW_FIRST_LABEL,
    descriptors.DRAW_LAST_LABEL,
    descriptors.ENABLED
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.AxisSettings, anychart.mapModule.elements.AxisSettings.SIMPLE_PROPS_DESCRIPTORS);

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
    this.topAxis_.dropThemes();
    this.setupCreated('top', this.topAxis_);
    this.topAxis_.orientation(anychart.enums.Orientation.TOP);
    this.topAxis_.parent(this);
    this.topAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 0;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.topAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.topAxis_;
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
    this.rightAxis_.dropThemes();
    this.setupCreated('right', this.rightAxis_);
    this.rightAxis_.orientation(anychart.enums.Orientation.RIGHT);
    this.rightAxis_.parent(this);
    this.rightAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 1;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.rightAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.rightAxis_;
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
    this.bottomAxis_.dropThemes();
    this.setupCreated('bottom', this.bottomAxis_);
    this.bottomAxis_.orientation(anychart.enums.Orientation.BOTTOM);
    this.bottomAxis_.parent(this);
    this.bottomAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 2;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.bottomAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.bottomAxis_;
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
    this.leftAxis_.dropThemes();
    this.setupCreated('left', this.leftAxis_);
    this.leftAxis_.orientation(anychart.enums.Orientation.LEFT);
    this.leftAxis_.parent(this);
    this.leftAxis_.listenSignals(this.map_.onAxesSettingsSignal, this.map_);
    var index = 3;
    var zIndex = anychart.mapModule.Chart.ZINDEX_AXIS + index * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.leftAxis_.setAutoZIndex(/** @type {number} */(zIndex));
    this.axes_[index] = this.leftAxis_;
  }

  if (goog.isDef(opt_value)) {
    this.leftAxis_.setup(opt_value);
    return this;
  }
  return this.leftAxis_;
};


/**
 * Set scale for every axis.
 * @param {anychart.mapModule.scales.Geo} scale
 */
anychart.mapModule.elements.AxisSettings.prototype.setScale = function(scale) {
  var axes = this.getItems();
  for (var i = 0; i < axes.length; i++) {
    var axis = axes[i];
    if (axis.scale() !== scale)
      axis.scale(scale);
  }
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
    this.setupCreated('title', this.title_);
    this.title_.listenSignals(this.titleInvalidated_, this);
    this.title_.markConsistent(anychart.ConsistencyState.ALL);
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
    this.setupCreated('labels', this.labels_);
    this.labels_.setupByJSON(this.labels_.themeSettings, true);

    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
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
    this.setupCreated('minorLabels', this.minorLabels_);
    this.minorLabels_.setupByJSON(this.minorLabels_.themeSettings, true);

    this.minorLabels_.listenSignals(this.minorLabelsInvalidated_, this);
    this.minorLabels_.markConsistent(anychart.ConsistencyState.ALL);
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
    this.setupCreated('ticks', this.ticks_);
    this.ticks_.listenSignals(this.ticksInvalidated_, this);
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
    this.setupCreated('minorTicks', this.minorTicks_);
    this.minorTicks_.listenSignals(this.ticksInvalidated_, this);
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
/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.setupSpecial = function(isDefault, var_args) {
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
 * Create and setup elements that should be created before draw
 * @param {boolean=} opt_default
 * @param {Object=} opt_config
 */
anychart.mapModule.elements.AxisSettings.prototype.setupElements = function(opt_default, opt_config) {
  var config = goog.isDef(opt_config) ? opt_config : {};

  this.left().setupInternal(!!opt_default, config['left']);
  this.top().setupInternal(!!opt_default, config['top']);
  this.right().setupInternal(!!opt_default, config['right']);
  this.bottom().setupInternal(!!opt_default, config['bottom']);
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.setupByJSON = function(config, opt_default) {
  this.map_.suspendSignalsDispatching();

  anychart.core.settings.deserialize(this, anychart.mapModule.elements.AxisSettings.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  if (!opt_default) {
    this['enabled']('enabled' in config ? config['enabled'] : true);
  }

  this.title().setupInternal(!!opt_default, config['title']);

  this.ticks().setupInternal(!!opt_default, config['ticks']);
  this.minorTicks().setupInternal(!!opt_default, config['minorTicks']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.minorLabels().setupInternal(!!opt_default, config['minorLabels']);

  this.setupElements(!!opt_default, config);

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

  json['title'] = this.title().serialize();
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['labels'] = this.labels().serialize();
  json['minorLabels'] = this.minorLabels().serialize();

  anychart.core.settings.serialize(this, anychart.mapModule.elements.AxisSettings.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axes props');

  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisSettings.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.topAxis_,
      this.rightAxis_,
      this.bottomAxis_,
      this.leftAxis_,
      this.title_,
      this.labels_,
      this.minorLabels_,
      this.ticks_,
      this.minorTicks_);
  this.topAxis_ = null;
  this.rightAxis_ = null;
  this.bottomAxis_ = null;
  this.leftAxis_ = null;
  this.axes_.length = 0;
  this.title_ = null;
  this.labels_ = null;
  this.minorLabels_ = null;
  this.ticks_ = null;
  this.minorTicks_ = null;
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
