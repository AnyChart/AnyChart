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

  this.addThemes('defaultGridSettings');

  /**
   * Parent title.
   * @type {anychart.core.settings.IResolvable}
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

  /**
   * Palette for series colors.
   * @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
   * @private
   */
  this.palette_ = null;

  this.markConsistent(anychart.ConsistencyState.ALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['minorStroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
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
anychart.mapModule.elements.GridSettings.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  var descriptors = anychart.core.settings.descriptors;

  anychart.core.settings.createDescriptors(map, [
    descriptors.ENABLED,
    descriptors.STROKE,
    descriptors.FILL_FUNCTION,
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'minorStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawFirstLine', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawLastLine', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zIndex', anychart.utils.toNumber]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.GridSettings, anychart.mapModule.elements.GridSettings.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Palette
/**
 * Creates palette depending on passed value type.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)} palette
 * @private
 */
anychart.mapModule.elements.GridSettings.prototype.checkSetupPalette_ = function(palette) {
  if (anychart.utils.instanceOf(palette, anychart.palettes.RangeColors) || (goog.isObject(palette) && palette['type'] == 'range')) {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (anychart.utils.instanceOf(palette, anychart.palettes.DistinctColors) || goog.isObject(palette) || this.palette_ == null) {
    this.setupPalette_(anychart.palettes.DistinctColors);
  }
};


/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.mapModule.elements.GridSettings)} .
 */
anychart.mapModule.elements.GridSettings.prototype.palette = function(opt_value) {
  if (!this.palette_) {
    this.checkSetupPalette_(this.themeSettings['palette']);
    this.setupCreated('palette', this.palette_);
    this.palette_.restoreDefaults(false);
  }

  if (goog.isDef(opt_value)) {
    this.checkSetupPalette_(opt_value);
    this.palette_.setup(opt_value);
    return this;
  }
  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @private
 */
anychart.mapModule.elements.GridSettings.prototype.setupPalette_ = function(cls) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    //do nothing
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = /** @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors} */(new cls());
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.mapModule.elements.GridSettings.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


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
    this.verticalGrid_.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.verticalGrid_.dropThemes().parent(this);
    this.setupCreated('vertical', this.verticalGrid_);

    var zIndex = this.getOption('zIndex') + this.grids_.length * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.verticalGrid_.setAutoZIndex(/** @type {number} */(zIndex));
    this.verticalGrid_.listenSignals(this.map_.onGridsSettingsSignal, this.map_);
    this.grids_.push(this.verticalGrid_);
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
    this.horizontalGrid_.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
    this.horizontalGrid_.dropThemes().parent(this);
    this.setupCreated('horizontal', this.horizontalGrid_);

    var zIndex = this.getOption('zIndex') + this.grids_.length * anychart.mapModule.Chart.ZINDEX_INCREMENT_MULTIPLIER;
    this.horizontalGrid_.setAutoZIndex(/** @type {number} */(zIndex));
    this.horizontalGrid_.listenSignals(this.map_.onGridsSettingsSignal, this.map_);
    this.grids_.push(this.horizontalGrid_);
  }

  if (goog.isDef(opt_value)) {
    this.horizontalGrid_.setup(opt_value);
    return this;
  }
  return this.horizontalGrid_;
};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    return {'enabled': !!arg0};
  }
  return null;
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.setupSpecial = function(isDefault, var_args) {
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
anychart.mapModule.elements.GridSettings.prototype.setupElements = function(opt_default, opt_config) {
  var config = goog.isDef(opt_config) ? opt_config : this.themeSettings;

  this.horizontal().setupInternal(!!opt_default, config['horizontal']);
  this.vertical().setupInternal(!!opt_default, config['vertical']);
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.setupByJSON = function(config, opt_default) {
  this.map_.suspendSignalsDispatching();

  anychart.core.settings.deserialize(this, anychart.mapModule.elements.GridSettings.SIMPLE_PROPS_DESCRIPTORS, config);

  if (opt_default)
    this.setOption('enabled', 'enabled' in config ? config['enabled'] : true);

  if (config['palette'])
    this.palette(config['palette']);

  this.setupElements(!!opt_default, config);

  this.map_.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.serialize = function() {
  var json = {};
  var gridSettings;

  if (this.verticalGrid_) {
    gridSettings = this.verticalGrid_.serialize();
    if (!goog.object.isEmpty(gridSettings))
      json['vertical'] = gridSettings;
  }

  if (this.horizontalGrid_) {
    gridSettings = this.horizontalGrid_.serialize();
    if (!goog.object.isEmpty(gridSettings))
      json['horizontal'] = gridSettings;
  }

  if (this.palette_)
    json['palette'] = this.palette_.serialize();

  anychart.core.settings.serialize(this, anychart.mapModule.elements.GridSettings.SIMPLE_PROPS_DESCRIPTORS, json, 'Map grids props');

  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.GridSettings.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.verticalGrid_,
      this.horizontalGrid_,
      this.palette_);

  this.verticalGrid_ = null;
  this.horizontalGrid_ = null;
  this.palette_ = null;
  this.grids_.length = 0;
  this.map_ = null;

  anychart.mapModule.elements.GridSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.mapModule.elements.GridSettings.prototype;

  proto['horizontal'] = proto.horizontal;
  proto['vertical'] = proto.vertical;
  proto['palette'] = proto.palette;
  //descriptors
  // proto['enabled'] = proto.enabled;
  // proto['zIndex'] = proto.zIndex;
  // proto['stroke'] = proto.stroke;
  // proto['minorStroke'] = proto.minorStroke;
  // proto['drawFirstLine'] = proto.drawFirstLine;
  // proto['drawLastLine'] = proto.drawLastLine;
  // proto['fill'] = proto.fill;
})();
//endregion




