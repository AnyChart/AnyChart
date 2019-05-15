//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.AxisTicks');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
//endregion



/**
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.VisualBase}
 */
anychart.mapModule.elements.AxisTicks = function() {
  anychart.mapModule.elements.AxisTicks.base(this, 'constructor');

  delete this.themeSettings['enabled'];

  /**
   * Ticks enabled.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.orientation_;

  /**
   * Parent title.
   * @type {anychart.mapModule.elements.AxisTicks}
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
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.path = acgraph.path();
  this.path.disableStrokeScaling(true);
  this.bindHandlersToGraphics(this.path);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW],
    ['length', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.ONLY_DISPATCHING, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.mapModule.elements.AxisTicks, anychart.core.VisualBase);


//region --- Class properties
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.AxisTicks.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.mapModule.elements.AxisTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//endregion
//region --- IObjectWithSettings overrides
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.mapModule.elements.AxisTicks.prototype.getOption = anychart.core.settings.getOption;


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.getHighPriorityResolutionChain = function() {
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
 * @param {anychart.mapModule.elements.AxisTicks=} opt_value - Value to set.
 * @return {anychart.mapModule.elements.AxisTicks} - Current value or itself for method chaining.
 */
anychart.mapModule.elements.AxisTicks.prototype.parent = function(opt_value) {
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
anychart.mapModule.elements.AxisTicks.prototype.parentInvalidated_ = function(e) {
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
anychart.mapModule.elements.AxisTicks.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
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
      'length',
      anychart.utils.toNumber);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'position',
      anychart.enums.normalizeSidePosition);

  return map;
})();
anychart.core.settings.populate(anychart.mapModule.elements.AxisTicks, anychart.mapModule.elements.AxisTicks.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Support methods
/**
 * Internal use.
 * Change orientation and set drawer to null.
 * @param {(string|anychart.enums.Orientation)=} opt_value Orientation.
 * @return {anychart.mapModule.elements.AxisTicks|anychart.enums.Orientation} Orientation or self for chaining.
 */
anychart.mapModule.elements.AxisTicks.prototype.orientation = function(opt_value) {
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
anychart.mapModule.elements.AxisTicks.prototype.isHorizontal = function() {
  var orientation = this.orientation();
  return orientation == anychart.enums.Orientation.TOP ||
      orientation == anychart.enums.Orientation.BOTTOM;
};


/**
 * Setting scale.
 * @param {anychart.mapModule.scales.Geo} value
 */
anychart.mapModule.elements.AxisTicks.prototype.setScale = function(value) {
  /**
   * @type {anychart.mapModule.scales.Geo}
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
anychart.mapModule.elements.AxisTicks.prototype.getGeoLine = function() {
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
anychart.mapModule.elements.AxisTicks.prototype.getAngleForPosition_ = function(position, angle, centerPos, nearPos) {
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
anychart.mapModule.elements.AxisTicks.prototype.calcTick = function(value) {
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
anychart.mapModule.elements.AxisTicks.prototype.getTickBounds = function(value) {
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
anychart.mapModule.elements.AxisTicks.prototype.remove = function() {
  if (this.path) this.path.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.mapModule.elements.AxisTicks} {@link anychart.mapModule.elements.AxisTicks} instance for method chaining.
 */
anychart.mapModule.elements.AxisTicks.prototype.draw = function() {
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
anychart.mapModule.elements.AxisTicks.prototype.drawTick = function(value) {
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
anychart.mapModule.elements.AxisTicks.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.mapModule.elements.AxisTicks.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }
};


/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.serialize = function() {
  var json = anychart.mapModule.elements.AxisTicks.base(this, 'serialize');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Map axis ticks props');
  return json;
};


/** @inheritDoc */
anychart.mapModule.elements.AxisTicks.prototype.disposeInternal = function() {
  goog.dispose(this.path);
  this.path = null;
  anychart.mapModule.elements.AxisTicks.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
//descriptors
// proto['length'] = proto.length;
// proto['stroke'] = proto.stroke;
// proto['position'] = proto.position;
//endregion
