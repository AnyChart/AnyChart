goog.provide('anychart.core.StateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.CircularLabelsFactory');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Outline');
goog.require('anychart.core.utils.Connector');



/**
 * Class representing state settings (normal, hovered, selected)
 * @param {anychart.core.settings.IObjectWithSettings} stateHolder State holder.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} descriptorsMeta Descriptors for state.
 * @param {anychart.PointState|anychart.SettingsState} stateType
 * @param {!Array.<Array>=} opt_descriptorsOverride
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.core.StateSettings = function(stateHolder, descriptorsMeta, stateType, opt_descriptorsOverride) {
  anychart.core.StateSettings.base(this, 'constructor');

  /**
   * @type {anychart.core.settings.IObjectWithSettings}
   */
  this.stateHolder = stateHolder;

  /**
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = descriptorsMeta;

  /**
   * @type {anychart.PointState|anychart.SettingsState}
   */
  this.stateType = stateType;

  if (goog.isDef(opt_descriptorsOverride)) {
    var newDescriptors = {};
    for (var i in this.PROPERTY_DESCRIPTORS) {
      newDescriptors[i] = this.PROPERTY_DESCRIPTORS[i];
    }
    var diff = anychart.core.settings.createDescriptors(newDescriptors, opt_descriptorsOverride);
    this.PROPERTY_DESCRIPTORS = newDescriptors;
    anychart.core.settings.populate(this, diff, true);
  }
};
goog.inherits(anychart.core.StateSettings, anychart.core.Base);


//region --- Constants and static
/**
 * Option name for labels factory constructor.
 * @type {string}
 */
anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR = 'labelsFactoryConstructor';


/**
 * Option name for labels factory after init callback.
 * @type {string}
 */
anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK = 'labelsAfterInitCallback';


/**
 * Option name for labels factory after init callback.
 * @type {string}
 */
anychart.core.StateSettings.LOWER_LABELS_AFTER_INIT_CALLBACK = 'lowerLabelsAfterInitCallback';


/**
 * Option name for headers factory after init callback.
 * @type {string}
 */
anychart.core.StateSettings.HEADERS_AFTER_INIT_CALLBACK = 'headersAfterInitCallback';


/**
 * Option name for markers factory constructor.
 * @type {string}
 */
anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR = 'markersFactoryConstructor';


/**
 * Option name for markers factory after init callback.
 * @type {string}
 */
anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK = 'markersAfterInitCallback';


/**
 * Option name for outlier markers factory after init callback.
 * @type {string}
 */
anychart.core.StateSettings.OUTLIER_MARKERS_AFTER_INIT_CALLBACK = 'outlierMarkersAfterInitCallback';


/**
 * Option name for connector after init callback (used in event markers).
 * @type {string}
 */
anychart.core.StateSettings.CONNECTOR_AFTER_INIT_CALLBACK = 'connectorAfterInitCallback';


/**
 * Option name for labels factory after init callback.
 * @type {string}
 */
anychart.core.StateSettings.BACKGROUND_AFTER_INIT_CALLBACK = 'backgroundAfterInitCallback';


/**
 * Option name for outline settings constructor.
 * @type {string}
 */
anychart.core.StateSettings.OUTLINE_CONSTRUCTOR = 'outlineConstructor';


/**
 * Option name for outline after init callback.
 * @type {string}
 */
anychart.core.StateSettings.OUTLINE_AFTER_INIT_CALLBACK = 'outlineAfterInitCallback';


/**
 * Default labels factory constructor.
 * @this {*}
 * @return {anychart.core.ui.LabelsFactory}
 */
anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR = function() {
  return new anychart.core.ui.LabelsFactory();
};


/**
 * Default labels factory constructor. But without using defaultLabelsFactory theme
 * @this {*}
 * @return {anychart.core.ui.LabelsFactory}
 */
anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME = function() {
  return new anychart.core.ui.LabelsFactory(true);
};


/**
 * Default labels settings constructor.
 * @this {*}
 * @return {anychart.core.ui.LabelsSettings}
 */
anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR = function() {
  return new anychart.core.ui.LabelsSettings();
};


/**
 * Default labels settings constructor. But without using defaultSimpleLabelsSettings theme
 * @this {*}
 * @return {anychart.core.ui.LabelsSettings}
 */
anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME = function() {
  return new anychart.core.ui.LabelsSettings(true);
};


/**
 * Circular labels factory constructor.
 * @this {*}
 * @return {anychart.core.ui.CircularLabelsFactory}
 */
anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR = function() {
  return new anychart.core.ui.CircularLabelsFactory();
};


/**
 * Circular labels factory constructor. But without using defaultLabelsFactory theme
 * @this {*}
 * @return {anychart.core.ui.CircularLabelsFactory}
 */
anychart.core.StateSettings.CIRCULAR_LABELS_CONSTRUCTOR_NO_THEME = function() {
  return new anychart.core.ui.CircularLabelsFactory(true);
};



/**
 * Default labels factory constructor.
 * @this {*}
 * @return {anychart.core.ui.MarkersFactory}
 */
anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR = function() {
  return new anychart.core.ui.MarkersFactory();
};


/**
 * Default labels factory constructor. But without using defaultMarkerFactory theme
 * @this {*}
 * @return {anychart.core.ui.MarkersFactory}
 */
anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME = function() {
  return new anychart.core.ui.MarkersFactory(void 0, void 0, true);
};


/**
 * Default outline settings constructor.
 * @this {*}
 * @return {anychart.core.ui.Outline}
 */
anychart.core.StateSettings.DEFAULT_OUTLINE_CONSTRUCTOR = function() {
  return new anychart.core.ui.Outline();
};


/**
 * Default labels factory after init callback.
 * @param {anychart.core.ui.LabelsFactory} factory
 * @this {*}
 */
anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK = function(factory) {
  factory.listenSignals(this.labelsInvalidated_, this);
  factory.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
};


/**
 * Default labels factory after init callback.
 * @param {anychart.core.ui.LabelsFactory} factory
 * @this {*}
 */
anychart.core.StateSettings.DEFAULT_HEADERS_AFTER_INIT_CALLBACK = function(factory) {
  factory.listenSignals(this.headersInvalidated_, this);
  factory.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
};


/**
 * Default labels factory after init callback.
 * @param {anychart.core.ui.MarkersFactory} factory
 * @this {*}
 */
anychart.core.StateSettings.DEFAULT_MARKERS_AFTER_INIT_CALLBACK = function(factory) {
  factory.listenSignals(this.markersInvalidated_, this);
  factory.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
};


/**
 * Default labels factory after init callback.
 * @param {anychart.core.ui.MarkersFactory} factory
 * @this {*}
 */
anychart.core.StateSettings.DEFAULT_OUTLIER_MARKERS_AFTER_INIT_CALLBACK = function(factory) {
  factory.listenSignals(this.outlierMarkersInvalidated_, this);
  factory.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
};


/**
 * Default connector after init callback.
 * @param {anychart.core.utils.Connector} connector
 * @this {*}
 */
anychart.core.StateSettings.DEFAULT_CONNECTOR_AFTER_INIT_CALLBACK = function(connector) {
  connector.listenSignals(this.connectorInvalidated_, this);
  connector.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
};


/**
 * Default background after init callback.
 * @param {anychart.core.ui.Background} background
 * @this {*}
 */
anychart.core.StateSettings.DEFAULT_BACKGROUND_AFTER_INIT_CALLBACK = function(background) {
  background.listenSignals(this.backgroundInvalidated_, this);
};


//endregion
//region --- Overrides
/** @inheritDoc */
anychart.core.StateSettings.prototype.invalidate = function(state, opt_signal) {
  return this.stateHolder.invalidate(state, opt_signal);
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.dispatchSignal = function(signal, opt_force) {
  return this.stateHolder.dispatchSignal(signal, opt_force);
};


/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.StateSettings.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.StateSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.StateSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  var parent = this.stateHolder.getParentState(this.stateType);
  if (parent) {
    sett.push.apply(sett, parent.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  var parent = this.stateHolder.getParentState(this.stateType);
  if (parent) {
    sett.push.apply(sett, parent.getHighPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


//endregion
//region --- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.StateSettings.prototype.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  /**
   * @type {!Object.<string, Array>}
   */
  var descriptors = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    // standart coloring + series coloring
    descriptors.FILL_FUNCTION,
    descriptors.NEGATIVE_FILL,
    descriptors.RISING_FILL,
    descriptors.FALLING_FILL,
    descriptors.STROKE_FUNCTION,
    descriptors.LOW_STROKE,
    descriptors.HIGH_STROKE,
    descriptors.LOW_FILL,
    descriptors.HIGH_FILL,
    descriptors.NEGATIVE_STROKE,
    descriptors.RISING_STROKE,
    descriptors.FALLING_STROKE,
    descriptors.MEDIAN_STROKE,
    descriptors.STEM_STROKE,
    descriptors.WHISKER_STROKE,
    descriptors.HATCH_FILL_FUNCTION,
    descriptors.NEGATIVE_HATCH_FILL,
    descriptors.RISING_HATCH_FILL,
    descriptors.FALLING_HATCH_FILL,
    descriptors.HIGH_HATCH_FILL,
    descriptors.LOW_HATCH_FILL,
    descriptors.WHISKER_WIDTH,
    // marker series
    descriptors.TYPE,
    // marker series + annotations
    descriptors.SIZE,
    // annotations
    descriptors.TREND,
    descriptors.GRID,
    // linear gauge tank pointer
    descriptors.EMPTY_FILL,
    descriptors.EMPTY_HATCH_FILL,
    // tag cloud
    descriptors.FONT_FAMILY,
    descriptors.FONT_STYLE,
    descriptors.FONT_VARIANT,
    descriptors.FONT_WEIGHT,
    descriptors.FONT_SIZE,
    // other text properties
    descriptors.FONT_COLOR,
    descriptors.FONT_OPACITY,
    descriptors.FONT_DECORATION,
    descriptors.TEXT_SHADOW,
    // pert tasks
    descriptors.DUMMY_FILL,
    descriptors.DUMMY_STROKE,
    // pie tasks
    descriptors.EXPLODE,
    // button content
    descriptors.CONTENT,

    descriptors.WIDTH_NUMBER,
    descriptors.HEIGHT_NUMBER,

    descriptors.SHAPE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.StateSettings, anychart.core.StateSettings.prototype.PROPERTY_DESCRIPTORS);


//endregion
//region --- Own API
/**
 * Sets meta for field name.
 * @param {string} fieldName
 * @param {Array|anychart.core.settings.PropertyDescriptorMeta} meta
 */
anychart.core.StateSettings.prototype.setMeta = function(fieldName, meta) {
  if (goog.isArray(meta)) {
    anychart.core.settings.createDescriptorMeta.apply(null, goog.array.concat(this.descriptorsMeta, fieldName, meta));
  } else if (goog.isObject(meta)) {
    this.descriptorsMeta[fieldName] = meta;
  }
};


/**
 * Add meta.
 * @param {Array.<Array>} metas
 */
anychart.core.StateSettings.prototype.addMeta = function(metas) {
  for (var i = 0; i < metas.length; i++) {
    anychart.core.settings.createDescriptorMeta.apply(null, goog.array.concat(this.descriptorsMeta, metas[i]));
  }
};


/**
 *  Getter for state type.
 *  @return {number}
 */
anychart.core.StateSettings.prototype.getState = function() {
  return this.stateType;
};


//endregion
//region --- Complex objects
/**
 * Labels.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory|anychart.core.ui.CircularLabelsFactory|anychart.core.ui.LabelsSettings}
 */
anychart.core.StateSettings.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    var labelsFactoryConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.labels_ = labelsFactoryConstructor();
    this.labels_.supportsEnabledSuspension = false;
    this.setupCreated('labels', this.labels_);
    afterInitCallback.call(this.stateHolder, this.labels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Labels.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory|anychart.core.ui.CircularLabelsFactory}
 */
anychart.core.StateSettings.prototype.minLabels = function(opt_value) {
  if (!this.minLabels_) {
    var labelsFactoryConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.minLabels_ = labelsFactoryConstructor();
    this.minLabels_.supportsEnabledSuspension = false;
    this.setupCreated('minLabels', this.minLabels_);

    afterInitCallback.call(this.stateHolder, this.minLabels_);
    this.minLabels_.markConsistent(anychart.ConsistencyState.ALL);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.minLabels_.setup(opt_value);
    return this;
  }
  return this.minLabels_;
};


/**
 * Labels.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory|anychart.core.ui.CircularLabelsFactory}
 */
anychart.core.StateSettings.prototype.maxLabels = function(opt_value) {
  if (!this.maxLabels_) {
    var labelsFactoryConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.maxLabels_ = labelsFactoryConstructor();
    this.maxLabels_.supportsEnabledSuspension = false;
    this.setupCreated('maxLabels', this.maxLabels_);

    afterInitCallback.call(this.stateHolder, this.maxLabels_);
    this.maxLabels_.markConsistent(anychart.ConsistencyState.ALL);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.maxLabels_.setup(opt_value);
    return this;
  }
  return this.maxLabels_;
};


/**
 * Header labels (TreeMap).
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory}
 */
anychart.core.StateSettings.prototype.headers = function(opt_value) {
  if (!this.headers_) {
    var labelsFactoryConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.HEADERS_AFTER_INIT_CALLBACK)) || anychart.core.StateSettings.DEFAULT_HEADERS_AFTER_INIT_CALLBACK;
    this.headers_ = labelsFactoryConstructor();
    this.setupCreated('headers', this.headers_);
    afterInitCallback.call(this.stateHolder, this.headers_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.headers_.setup(opt_value);
    return this;
  }
  return this.headers_;
};


/**
 * Upper labels (tasks).
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsSettings}
 */
anychart.core.StateSettings.prototype.upperLabels = function(opt_value) {
  return this.labels(opt_value);
};


/**
 * Lower labels (tasks).
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory}
 */
anychart.core.StateSettings.prototype.lowerLabels = function(opt_value) {
  if (!this.lowerLabels_) {
    var labelsFactoryConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.lowerLabels_ = labelsFactoryConstructor();
    //this.setupCreated('lowerLabels', this.lowerLabels_);

    afterInitCallback.call(this.stateHolder, this.lowerLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.lowerLabels_.setup(opt_value);
    return this;
  }
  return this.lowerLabels_;
};


/**
 * Markers.
 * @param {(Object|boolean|null|string)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.MarkersFactory}
 */
anychart.core.StateSettings.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    var markersFactoryConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.markers_ = markersFactoryConstructor();
    this.setupCreated('markers', this.markers_);
    afterInitCallback.call(this.stateHolder, this.markers_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Outlier markers.
 * @param {(Object|boolean|null|string)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.MarkersFactory}
 */
anychart.core.StateSettings.prototype.outlierMarkers = function(opt_value) {
  if (!this.outlierMarkers_) {
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.OUTLIER_MARKERS_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.outlierMarkers_ = new anychart.core.ui.MarkersFactory();
    this.setupCreated('outlierMarkers', this.outlierMarkers_);
    afterInitCallback.call(this.stateHolder, this.outlierMarkers_);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.outlierMarkers_.setup(opt_value);
    return this;
  }
  return this.outlierMarkers_;
};


/**
 * Connector settings (stroke/length).
 * @param {(Object|string|number)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.utils.Connector}
 */
anychart.core.StateSettings.prototype.connector = function(opt_value) {
  if (!this.connector_) {
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.CONNECTOR_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.connector_ = new anychart.core.utils.Connector();
    this.setupCreated('connector', this.connector_);
    afterInitCallback.call(this.stateHolder, this.connector_);
  }

  if (goog.isDef(opt_value)) {
    this.connector_.setup(opt_value);
    return this;
  }
  return this.connector_;
};


/**
 * Outline.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.Outline}
 */
anychart.core.StateSettings.prototype.outline = function(opt_value) {
  if (!this.outline_) {
    var outlineSettingsConstructor = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.OUTLINE_CONSTRUCTOR)) || anychart.core.StateSettings.DEFAULT_OUTLINE_CONSTRUCTOR;
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.OUTLINE_AFTER_INIT_CALLBACK)) || goog.nullFunction;
    this.outline_ = outlineSettingsConstructor();
    this.setupCreated('outline', this.outline_);
    afterInitCallback.call(this.stateHolder, this.outline_);
  }

  if (goog.isDef(opt_value)) {
    this.outline_.setup(opt_value);
    return this;
  }
  return this.outline_;
};


/**
 * Background.
 * @param {(Object|string|boolean|null)=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.Background}
 */
anychart.core.StateSettings.prototype.background = function(opt_value) {
  if (!this.background_) {
    var afterInitCallback = /** @type {Function} */ (this.getOption(anychart.core.StateSettings.BACKGROUND_AFTER_INIT_CALLBACK)) || anychart.core.StateSettings.DEFAULT_BACKGROUND_AFTER_INIT_CALLBACK;
    this.background_ = new anychart.core.ui.Background();
    this.setupCreated('background', this.background_);
    afterInitCallback.call(this.stateHolder, this.background_);

    this.background_.dropThemes();
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


//endregion
//region --- State Fallbacks
/**
 * Normal fallback.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.settings.IObjectWithSettings}
 */
anychart.core.StateSettings.prototype.normal = function(opt_value) {
  return this.stateHolder.normal(opt_value);
};


/**
 * Hovered fallback.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.settings.IObjectWithSettings}
 */
anychart.core.StateSettings.prototype.hovered = function(opt_value) {
  return this.stateHolder.hovered(opt_value);
};


/**
 * Selected fallback.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.settings.IObjectWithSettings}
 */
anychart.core.StateSettings.prototype.selected = function(opt_value) {
  if (this.stateHolder.selected)
    return this.stateHolder.selected(opt_value);
  else
    return null;
};


//endregion
//region --- Setup / Serialize / Dispose
/** @inheritDoc */
anychart.core.StateSettings.prototype.serialize = function() {
  var json = anychart.core.StateSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, this.PROPERTY_DESCRIPTORS, json, 'State settings', this.descriptorsMeta);

  if (this.descriptorsMeta['labels'])
    json['labels'] = this.labels().serialize();

  if (this.descriptorsMeta['minLabels'])
    json['minLabels'] = this.minLabels().serialize();

  if (this.descriptorsMeta['maxLabels'])
    json['maxLabels'] = this.maxLabels().serialize();

  if (this.descriptorsMeta['headers'])
    json['headers'] = this.headers().serialize();

  if (this.descriptorsMeta['lowerLabels'])
    json['lowerLabels'] = this.lowerLabels().serialize();

  if (this.descriptorsMeta['upperLabels']) {
    json['upperLabels'] = json['labels'];
    delete json['labels'];
  }

  if (this.descriptorsMeta['markers'])
    json['markers'] = this.markers().serialize();

  if (this.descriptorsMeta['outlierMarkers'])
    json['outlierMarkers'] = this.outlierMarkers().serialize();

  if (this.descriptorsMeta['connector'])
    json['connector'] = this.connector().serialize();

  if (this.descriptorsMeta['outline'])
    json['outline'] = this.outline().serialize();

  if (this.descriptorsMeta['background'])
    json['background'] = this.background().serialize();

  return json;
};


/**
 *  Set enabled property to true in config.
 *  @param {Object} config
 */
anychart.core.StateSettings.prototype.setEnabledTrue = function(config) {
  if (goog.typeOf(config) == 'object' && !('enabled' in config))
    config['enabled'] = true;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.StateSettings.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, this.PROPERTY_DESCRIPTORS, config, opt_default);

  var flatThemeSetup = goog.object.isEmpty(config);
  if (goog.isDef(this.descriptorsMeta['labels'])) {
    var labelsConfig = flatThemeSetup ? this.labels().themeSettings : config['labels'];
    this.setEnabledTrue(labelsConfig);
    this.labels().setupInternal(!!opt_default, labelsConfig);
  }

  if (goog.isDef(this.descriptorsMeta['minLabels'])) {
    var minLabelsConfig = flatThemeSetup ? this.minLabels().themeSettings : config['minLabels'];
    this.setEnabledTrue(minLabelsConfig);
    this.minLabels().setupInternal(!!opt_default, minLabelsConfig);
  }

  if (goog.isDef(this.descriptorsMeta['maxLabels'])) {
    var maxLabelsConfig = flatThemeSetup ? this.maxLabels().themeSettings : config['maxLabels'];
    this.setEnabledTrue(maxLabelsConfig);
    this.maxLabels().setupInternal(!!opt_default, maxLabelsConfig);
  }

  if (goog.isDef(this.descriptorsMeta['headers'])) {
    var headersConfig = flatThemeSetup ? this.headers().themeSettings : config['headers'];
    this.setEnabledTrue(headersConfig);
    this.headers().setup(headersConfig);
  }

  if (goog.isDef(this.descriptorsMeta['lowerLabels'])) {
    var lowerLabelsConfig = flatThemeSetup ? this.lowerLabels().themeSettings : config['lowerLabels'];
    this.setEnabledTrue(lowerLabelsConfig);
    this.lowerLabels().setupInternal(!!opt_default, lowerLabelsConfig);
  }

  if (goog.isDef(this.descriptorsMeta['upperLabels'])) {
    var upperLabelsConfig = flatThemeSetup ? this.upperLabels().themeSettings : config['upperLabels'];
    this.setEnabledTrue(upperLabelsConfig);
    this.upperLabels().setupInternal(!!opt_default, upperLabelsConfig);
  }

  if (goog.isDef(this.descriptorsMeta['markers'])) {
    var markersConfig = flatThemeSetup ? this.markers().themeSettings : config['markers'];
    this.setEnabledTrue(markersConfig);
    this.markers().setupInternal(!!opt_default, markersConfig);
  }

  if (goog.isDef(this.descriptorsMeta['outlierMarkers'])) {
    var outlierMarkersConfig = flatThemeSetup ? this.outlierMarkers().themeSettings : config['outlierMarkers'];
    this.setEnabledTrue(outlierMarkersConfig);
    this.outlierMarkers().setupInternal(!!opt_default, outlierMarkersConfig);
  }

  if (goog.isDef(this.descriptorsMeta['connector'])) {
    this.connector().setupInternal(!!opt_default, flatThemeSetup ? this.connector().themeSettings : config['connector']);
  }

  if (goog.isDef(this.descriptorsMeta['outline'])) {
    // this.setEnabledTrue(config['outline']);
    this.outline().setupInternal(!!opt_default, flatThemeSetup ? this.outline().themeSettings : config['outline']);
  }

  if (goog.isDef(this.descriptorsMeta['background'])) {
    this.background().setupInternal(!!opt_default, config['background']);
    this.background().markConsistent(anychart.ConsistencyState.ALL);
  }
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.dropThemes = function(opt_dropDefaultThemes) {
  anychart.core.StateSettings.base(this, 'dropThemes', opt_dropDefaultThemes);
  this.resolutionChainCache(null);
  return this;
};


/**
 * Re-initialize theme settings for all child elements
 */
anychart.core.StateSettings.prototype.updateChildrenThemes = function() {
  var children = {
    'labels': this.labels_,
    'minLabels': this.minLabels_,
    'maxLabels': this.maxLabels_,
    'headers': this.headers_,
    'lowerLabels': this.lowerLabels_,
    'markers': this.markers_,
    'outlierMarkers': this.outlierMarkers_,
    'outline': this.outline_,
    'connector': this.connector_,
    'background': this.background_
  };

  for (var getterName in children) {
    var child = children[getterName];
    if (child && child.dropThemes) {
      child.dropThemes();
      child.restoreDefaultThemes();
      this.setupCreated(getterName, child);
    }
  }
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.labels_,
      this.minLabels_,
      this.maxLabels_,
      this.headers_,
      this.lowerLabels_,
      this.markers_,
      this.outlierMarkers_,
      this.outline_,
      this.connector_,
      this.background_
  );
  delete this.connector_;
  anychart.core.StateSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.core.StateSettings.prototype;
  proto['labels'] = proto.labels;
  proto['minLabels'] = proto.minLabels;
  proto['maxLabels'] = proto.maxLabels;
  proto['headers'] = proto.headers;
  proto['upperLabels'] = proto.upperLabels;
  proto['lowerLabels'] = proto.lowerLabels;
  proto['markers'] = proto.markers;
  proto['outlierMarkers'] = proto.outlierMarkers;
  proto['connector'] = proto.connector;
  proto['outline'] = proto.outline;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion
