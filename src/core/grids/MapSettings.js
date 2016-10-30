//region --- Requiring and Providing
goog.provide('anychart.core.grids.MapSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.grids.Map');
goog.require('anychart.core.settings');
//endregion



/**
 * Map axes settings.
 * @param {!anychart.charts.Map} map .
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @constructor
 */
anychart.core.grids.MapSettings = function(map) {
  anychart.core.grids.MapSettings.base(this, 'constructor');

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
   * Map.
   * @private
   * @type {anychart.charts.Map}
   */
  this.map_ = map;

  /**
   * All grids.
   * @private
   * @type {Array.<anychart.core.grids.Map>}
   */
  this.grids_ = [];

  /**
   * Resolution chain cache.
   * @type {Array.<Object|null|undefined>|null}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.markConsistent(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.grids.MapSettings, anychart.core.Base);


//region --- Internal properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.grids.MapSettings.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.core.grids.MapSettings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.ENABLED_STATE_CHANGED |
    anychart.Signal.Z_INDEX_STATE_CHANGED;


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.getHighPriorityResolutionChain = function() {
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
anychart.core.grids.MapSettings.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map[anychart.opt.STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.STROKE,
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.MINOR_STROKE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.MINOR_STROKE,
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.ODD_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.ODD_FILL,
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.EVEN_FILL] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      anychart.opt.EVEN_FILL,
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map[anychart.opt.DRAW_FIRST_LINE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DRAW_FIRST_LINE,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.DRAW_LAST_LINE] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DRAW_LAST_LINE,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.ENABLED] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ENABLED,
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.ENABLED_STATE_CHANGED);

  map[anychart.opt.Z_INDEX] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.Z_INDEX,
      anychart.utils.toNumber,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.Z_INDEX_STATE_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.grids.MapSettings, anychart.core.grids.MapSettings.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Grids
/**
 * Return all exist grids.
 * @return {Array.<anychart.core.grids.Map>}
 */
anychart.core.grids.MapSettings.prototype.getItems = function() {
  return this.grids_;
};


/**
 * Vertical grid.
 * @param {(boolean|Object)=} opt_value
 * @return {anychart.core.grids.Map|anychart.core.grids.MapSettings}
 */
anychart.core.grids.MapSettings.prototype.vertical = function(opt_value) {
  if (!this.verticalGrid_) {
    this.verticalGrid_ = new anychart.core.grids.Map();
    this.verticalGrid_.layout(anychart.enums.Layout.VERTICAL);
    this.verticalGrid_.parent(this);
    var zIndex = this.getOption(anychart.opt.Z_INDEX) + this.grids_.length * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
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
 * @return {anychart.core.grids.Map|anychart.core.grids.MapSettings}
 */
anychart.core.grids.MapSettings.prototype.horizontal = function(opt_value) {
  if (!this.horizontalGrid_) {
    this.horizontalGrid_ = new anychart.core.grids.Map();
    this.horizontalGrid_.layout(anychart.enums.Layout.HORIZONTAL);
    this.horizontalGrid_.parent(this);
    var zIndex = this.getOption(anychart.opt.Z_INDEX) + this.grids_.length * anychart.charts.Map.ZINDEX_INCREMENT_MULTIPLIER;
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
anychart.core.grids.MapSettings.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default)
      this.themeSettings[anychart.opt.ENABLED] = !!value;
    else
      this.enabled(!!value);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.setupByJSON = function(config, opt_default) {
  this.map_.suspendSignalsDispatching();

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this.setOption(anychart.opt.ENABLED, anychart.opt.ENABLED in config ? config[anychart.opt.ENABLED] : true);
  }

  this.horizontal().setupByVal(config['horizontal'], opt_default);
  this.vertical().setupByVal(config['vertical'], opt_default);

  this.map_.resumeSignalsDispatching(true);
};


/** @inheritDoc */
anychart.core.grids.MapSettings.prototype.serialize = function() {
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
anychart.core.grids.MapSettings.prototype.disposeInternal = function() {

};


//endregion
//region --- Exports
//exports
anychart.core.grids.MapSettings.prototype['horizontal'] = anychart.core.grids.MapSettings.prototype.horizontal;
anychart.core.grids.MapSettings.prototype['vertical'] = anychart.core.grids.MapSettings.prototype.vertical;
//descriptors
// anychart.core.grids.MapSettings.prototype['enabled'] = anychart.core.grids.MapSettings.prototype.enabled;
// anychart.core.grids.MapSettings.prototype['zIndex'] = anychart.core.grids.MapSettings.prototype.zIndex;
// anychart.core.grids.MapSettings.prototype['stroke'] = anychart.core.grids.MapSettings.prototype.stroke;
// anychart.core.grids.MapSettings.prototype['minorStroke'] = anychart.core.grids.MapSettings.prototype.minorStroke;
// anychart.core.grids.MapSettings.prototype['drawFirstLine'] = anychart.core.grids.MapSettings.prototype.drawFirstLine;
// anychart.core.grids.MapSettings.prototype['drawLastLine'] = anychart.core.grids.MapSettings.prototype.drawLastLine;
// anychart.core.grids.MapSettings.prototype['oddFill'] = anychart.core.grids.MapSettings.prototype.oddFill;
// anychart.core.grids.MapSettings.prototype['evenFill'] = anychart.core.grids.MapSettings.prototype.evenFill;
//endregion




