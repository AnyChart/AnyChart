//region --- Requiring and Providing
goog.provide('anychart.core.axes.MapTicks');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
//endregion



/**
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axes.MapTicks = function() {
  anychart.core.axes.MapTicks.base(this, 'constructor');

  /**
   * Ticks enabled.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.orientation_;

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
   * @type {anychart.core.axes.MapTicks}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * Path with ticks.
   * @type {!acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.path.disableStrokeScaling(true);
  this.bindHandlersToGraphics(this.path);
  this.registerDisposable(this.path);
};
goog.inherits(anychart.core.axes.MapTicks, anychart.core.VisualBase);


//region --- Class properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.MapTicks.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.MapTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.getHighPriorityResolutionChain = function() {
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
 * @param {anychart.core.axes.MapTicks=} opt_value - Value to set.
 * @return {anychart.core.axes.MapTicks} - Current value or itself for method chaining.
 */
anychart.core.axes.MapTicks.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (this.parent_)
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
      this.parent_ = opt_value;
      if (this.parent_)
        this.parent_.listenSignals(this.parentInvalidated_, this);
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
anychart.core.axes.MapTicks.prototype.parentInvalidated_ = function(e) {
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  this.resolutionChainCache_ = null;

  this.dispatchSignal(signal);
};


//endregion
//region --- Optimized props descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axes.MapTicks.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW);

  map['length'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'length',
      anychart.utils.toNumber,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map['position'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'position',
      anychart.enums.normalizeSidePosition,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  return map;
})();
anychart.core.settings.populate(anychart.core.axes.MapTicks, anychart.core.axes.MapTicks.prototype.SIMPLE_PROPS_DESCRIPTORS);


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] != opt_value) {
      var enabled = this.ownSettings['enabled'] = opt_value;
      this.dispatchSignal(this.getEnableChangeSignals());
      if (enabled) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption('enabled'));
  }
};


//endregion
//region --- Support methods
/**
 * Internal use.
 * Change orientation and set drawer to null.
 * @param {(string|anychart.enums.Orientation)=} opt_value Orientation.
 * @return {anychart.core.axes.MapTicks|anychart.enums.Orientation} Orientation or self for chaining.
 */
anychart.core.axes.MapTicks.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.drawer_ = null;
      //TODO:blackart do we need to dispatch anything when orientation is changed?
    }
    return this;
  } else {
    return this.orientation_;
  }
};


/**
 * Whether an tick has horizontal orientation.
 * @return {boolean} If the tick has horizontal orientation.
 */
anychart.core.axes.MapTicks.prototype.isHorizontal = function() {
  var orientation = this.orientation();
  return orientation == anychart.enums.Orientation.TOP ||
      orientation == anychart.enums.Orientation.BOTTOM;
};


/**
 * Setting scale.
 * @param {anychart.scales.Geo} value
 */
anychart.core.axes.MapTicks.prototype.setScale = function(value) {
  /**
   * @type {anychart.scales.Geo}
   * @private
   */
  this.scale_ = value;
};


//endregion
//region --- Calculation
/**
 * Calc geo line.
 * @return {number} .
 */
anychart.core.axes.MapTicks.prototype.getGeoLine = function() {
  switch (this.orientation()) {
    case anychart.enums.Orientation.TOP:
      this.geoLine = this.scale_.maximumY();
      break;
    case anychart.enums.Orientation.RIGHT:
      this.geoLine = this.scale_.maximumX();
      break;
    case anychart.enums.Orientation.BOTTOM:
      this.geoLine = this.scale_.minimumY();
      break;
    case anychart.enums.Orientation.LEFT:
      this.geoLine = this.scale_.minimumX();
      break;
  }
  return this.geoLine;
};


/**
 * Return tick angle rotation.
 * @param {string|anychart.enums.Orientation} position Tick position relative axis.
 * @param {number} angle Angel for tick rotation.
 * @param {Array.<number>} centerPos Tick coordinates.
 * @param {Array.<number>} nearPos Position near tick coordinates.
 * @private
 * @return {number}
 */
anychart.core.axes.MapTicks.prototype.getAngleForPosition_ = function(position, angle, centerPos, nearPos) {
  var angle_;
  switch (position) {
    case anychart.enums.SidePosition.INSIDE:
      angle_ = goog.math.standardAngleInRadians(angle) + 1.5 * Math.PI;

      if (this.orientation() == anychart.enums.Orientation.TOP || this.orientation() == anychart.enums.Orientation.LEFT) {
        if (centerPos[0] < nearPos[0] && (centerPos[1] <= nearPos[1] || centerPos[1] >= nearPos[1])) {
          angle_ = angle + .5 * Math.PI;
        }
      } else {
        if (centerPos[0] > nearPos[0] && (centerPos[1] <= nearPos[1] || centerPos[1] >= nearPos[1])) {
          angle_ = angle + .5 * Math.PI;
        }
      }
      break;
    case anychart.enums.SidePosition.CENTER:
      angle_ = this.getAngleForPosition_(anychart.enums.SidePosition.OUTSIDE, angle, centerPos, nearPos);

      centerPos[0] += Math.cos(angle_) * this.length() / 2;
      centerPos[1] += Math.sin(angle_) * this.length() / 2;

      angle_ = angle_ + Math.PI;

      break;
    case anychart.enums.SidePosition.OUTSIDE:
    default:
      angle_ = goog.math.standardAngleInRadians(angle - Math.PI / 2);

      if (this.orientation() == anychart.enums.Orientation.TOP || this.orientation() == anychart.enums.Orientation.LEFT) {
        if (centerPos[0] > nearPos[0] && (centerPos[1] <= nearPos[1] || centerPos[1] >= nearPos[1])) {
          angle_ = angle - 1.5 * Math.PI;
        }
      } else {
        if (centerPos[0] <= nearPos[0] && (centerPos[1] <= nearPos[1] || centerPos[1] >= nearPos[1])) {
          angle_ = angle - 1.5 * Math.PI;
        }
      }
      break;
  }
  return angle_;
};


/**
 * Calculation tick.
 * @param {number} value
 * @return {Array.<number>}
 */
anychart.core.axes.MapTicks.prototype.calcTick = function(value) {
  var nearPos, centerPos, tickCoords;
  this.scale_.calculate();
  value = parseFloat(value);
  var geoLine = this.getGeoLine();
  var position = /** @type {anychart.enums.Position} */(this.getOption('position'));
  var length = /** @type {number} */(this.getOption('length'));

  if (this.isHorizontal()) {
    centerPos = this.scale_.transform(value, geoLine, null);
    nearPos = this.scale_.transform(value + 1, geoLine, null);
  } else {
    centerPos = this.scale_.transform(geoLine, value, null);
    nearPos = this.scale_.transform(geoLine, value + 1, null);
  }

  var a = centerPos[1] - nearPos[1];
  var b = nearPos[0] - centerPos[0];
  var angle = Math.atan(-a / b);
  if (isNaN(angle)) angle = 0;

  var angle_ = this.getAngleForPosition_(position, angle, centerPos, nearPos);

  var dx = Math.cos(angle_) * length;
  var dy = Math.sin(angle_) * length;

  tickCoords = [centerPos[0], centerPos[1], centerPos[0] + dx, centerPos[1] + dy, angle_];

  return tickCoords;
};


/**
 * Returns tick bounds.
 * @param {number} value .
 * @return {anychart.math.Rect}
 */
anychart.core.axes.MapTicks.prototype.getTickBounds = function(value) {
  var coords = this.calcTick(value);
  return new anychart.math.Rect(
      Math.min(coords[0], coords[2]),
      Math.min(coords[1], coords[3]),
      Math.abs(coords[0] - coords[2]),
      Math.abs(coords[1] - coords[3]));
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.remove = function() {
  if (this.path) this.path.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.core.axes.MapTicks} {@link anychart.core.axes.MapTicks} instance for method chaining.
 */
anychart.core.axes.MapTicks.prototype.draw = function() {
  this.getGeoLine();

  this.path.clear();
  this.path.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('stroke')));

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.path.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.path.parent(/** @type {acgraph.vector.ILayer} */ (this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Axis ticks drawer for top orientation.
 * @param {number} value Tick value.
 */
anychart.core.axes.MapTicks.prototype.drawTick = function(value) {
  var tickCoords = this.calcTick(value);

  this.path.moveTo(tickCoords[0], tickCoords[1]);
  this.path.lineTo(tickCoords[2], tickCoords[3]);
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.axes.MapTicks.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
  if ('enabled' in config) this.themeSettings['enabled'] = config['enabled'];
  if ('zIndex' in config) this.themeSettings['zIndex'] = config['zIndex'];
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default)
      this.themeSettings['enabled'] = !!value;
    else
      this.enabled(!!value);
    return true;
  }
  return anychart.core.Base.prototype.specialSetupByVal.apply(this, arguments);
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.setupByJSON = function(config, opt_default) {
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    anychart.core.axes.MapTicks.base(this, 'setupByJSON', config);
  }
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.serialize = function() {
  var json = {};

  var zIndex;
  if (this.hasOwnOption('zIndex')) {
    zIndex = this.getOwnOption('zIndex');
  }
  if (!goog.isDef(zIndex)) {
    zIndex = this.getThemeOption('zIndex');
  }
  if (goog.isDef(zIndex)) json['zIndex'] = zIndex;

  var enabled;
  if (this.hasOwnOption('enabled')) {
    enabled = this.getOwnOption('enabled');
  }
  if (!goog.isDef(enabled)) {
    enabled = this.getThemeOption('enabled');
  }
  json['enabled'] = goog.isDef(enabled) ? enabled : null;

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axis ticks props');

  return json;
};


/** @inheritDoc */
anychart.core.axes.MapTicks.prototype.disposeInternal = function() {
  anychart.core.axes.MapTicks.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
//descriptors
// proto['length'] = proto.length;
// proto['stroke'] = proto.stroke;
// proto['position'] = proto.position;
//endregion
