//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.GridSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.mapModule.elements.Grid');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.mapModule.Chart} map .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.mapModule.elements.GridSettings = function(map) {
  anychart.mapModule.elements.GridSettings.base(this, 'constructor');

  /**
   * Parent title.
   * @type {anychart.mapModule.elements.AxisSettings}
   * @private
   */
  this.parent_ = null;

  /**
   * Map.
   * @private
   * @type {anychart.mapModule.Chart}
   */
  this.map_ = map;

  /**
   * All grids.
   * @private
   * @type {Array.<anychart.mapModule.elements.Grid>}
   */
  this.grids_ = [];

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.markConsistent(anychart.ConsistencyState.ALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['minorStroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['oddFill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['evenFill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['drawFirstLine', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['drawLastLine', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['enabled', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.ENABLED_STATE_CHANGED],
    ['zIndex', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.Z_INDEX_STATE_CHANGED]
  ]);
};
goog.inherits(anychart.mapModule.elements.GridSettings, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.GridSettings.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.mapModule.elements.GridSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.Z_INDEX_STATE_CHANGED;


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.mapModule.elements.GridSettings.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.getHighPriorityResolutionChain = function() {
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
anychart.mapModule.elements.GridSettings.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'minorStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddFill',
      anychart.core.settings.fillNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenFill',
      anychart.core.settings.fillNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawFirstLine',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLastLine',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'enabled',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'zIndex',
      anychart.utils.toNumber);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.GridSettings, anychart.mapModule.elements.GridSettings.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Grids
/**
 * Return all exist grids.
 * @return {Array.<anychart.mapModule.elements.Grid>}
 */
anychart.mapModule.elements.GridSettings.prototype.getItems = function() {
  return this.grids_;
};


/**
 * Vertical grid.
 * @param {(boolean|Object)=} opt_value
 * @return {anychart.mapModule.elements.Grid|anychart.mapModule.elements.GridSettings}
 */
anychart.mapModule.elements.GridSettings.prototype.vertical = function(opt_value) {
  if (!this.verticalGrid_) {
    this.verticalGrid_ = new anychart.mapModule.elements.Grid();
    this.verticalGrid_.layout(anychart.enums.Layout.VERTICAL);
    this.verticalGrid_.parent(this);
    var zIndex = this.getOption('zIndex') + this.grids_.length * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.verticalGrid_.setAutoZIndex(/** @type {number} */(zIndex));
    this.verticalGrid_.listenSignals(this.map_.onGridsSettingsSignal, this.map_);
    this.grids_.push(this.verticalGrid_);
    this.map_.registerDisposable(this.verticalGrid_);
  }

  if (goog.isDef(opt_value)) {
    this.verticalGrid_.setup(opt_value);
    return this;
  }
  return this.verticalGrid_;
};


/**
 * Horizontal gid.
 * @param {(boolean|Object)=} opt_value
 * @return {anychart.mapModule.elements.Grid|anychart.mapModule.elements.GridSettings}
 */
anychart.mapModule.elements.GridSettings.prototype.horizontal = function(opt_value) {
  if (!this.horizontalGrid_) {
    this.horizontalGrid_ = new anychart.mapModule.elements.Grid();
    this.horizontalGrid_.layout(anychart.enums.Layout.HORIZONTAL);
    this.horizontalGrid_.parent(this);
    var zIndex = this.getOption('zIndex') + this.grids_.length * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.horizontalGrid_.setAutoZIndex(/** @type {number} */(zIndex));
    this.horizontalGrid_.listenSignals(this.map_.onGridsSettingsSignal, this.map_);
    this.grids_.push(this.horizontalGrid_);
    this.registerDisposable(this.horizontalGrid_);
  }

  if (goog.isDef(opt_value)) {
    this.horizontalGrid_.setup(opt_value);
    return this;
  }
  return this.horizontalGrid_;
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.mapModule.elements.GridSettings.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.setupSpecial = function(isDefault, var_args) {
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
anychart.mapModule.elements.GridSettings.prototype.setupByJSON = function(config, opt_default) {
  this.map_.suspendSignalsDispatching();

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this.setOption('enabled', 'enabled' in config ? config['enabled'] : true);
  }

  this.horizontal().setupInternal(!!opt_default, config['horizontal']);
  this.vertical().setupInternal(!!opt_default, config['vertical']);

  this.map_.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.serialize = function() {
  var json = {};

  if (this.verticalGrid_) {
    json['vertical'] = this.verticalGrid_.serialize();
  }
  if (this.horizontalGrid_) {
    json['horizontal'] = this.horizontalGrid_.serialize();
  }

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map grids props');

  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.disposeInternal = function() {

};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.mapModule.elements.GridSettings.prototype;
  proto['horizontal'] = proto.horizontal;
  proto['vertical'] = proto.vertical;
  //descriptors
  // proto['enabled'] = proto.enabled;
  // proto['zIndex'] = proto.zIndex;
  // proto['stroke'] = proto.stroke;
  // proto['minorStroke'] = proto.minorStroke;
  // proto['drawFirstLine'] = proto.drawFirstLine;
  // proto['drawLastLine'] = proto.drawLastLine;
  // proto['oddFill'] = proto.oddFill;
  // proto['evenFill'] = proto.evenFill;
})();
//endregion




