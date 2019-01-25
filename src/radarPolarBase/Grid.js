goog.provide('anychart.radarPolarBaseModule.Grid');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.GridBase');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.radarPolarBaseModule.RadialAxis');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.GridBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.radarPolarBaseModule.Grid = function() {
  anychart.radarPolarBaseModule.Grid.base(this, 'constructor');

  /**
   * @type {anychart.scales.Ordinal}
   * @private
   */
  this.xScale_;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.yScale_;

  /**
   * @type {anychart.enums.Layout|anychart.enums.RadialGridLayout}
   * @protected
   */
  this.defaultLayout = anychart.enums.RadialGridLayout.CIRCUIT;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['startAngle', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['innerRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.radarPolarBaseModule.Grid, anychart.core.GridBase);


anychart.radarPolarBaseModule.Grid.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function innerRadiusNormalizer(opt_value) {
    return anychart.utils.normalizeNumberOrPercent(opt_value, this.getOption('innerRadius'));
  }

  var descriptors = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    descriptors.START_ANGLE,
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'innerRadius', innerRadiusNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.radarPolarBaseModule.Grid, anychart.radarPolarBaseModule.Grid.PROPERTY_DESCRIPTORS);

//region --- Layout
/** @inheritDoc */
anychart.radarPolarBaseModule.Grid.prototype.normalizeLayout = function(layout) {
  return anychart.enums.normalizePolarLayout(layout, anychart.enums.RadialGridLayout.CIRCUIT);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.Grid.prototype.getLayoutByAxis = function(axis) {
  var isCircuit = anychart.utils.instanceOf(axis, anychart.radarPolarBaseModule.RadialAxis);
  return isCircuit ? anychart.enums.RadialGridLayout.CIRCUIT : anychart.enums.RadialGridLayout.RADIAL;
};


//endregion
//region --- Infrastructure
/**
 * Getter/setter for yScale.
 * @param {(anychart.scales.Base|anychart.enums.ScaleTypes|Object)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.radarPolarBaseModule.Grid} Axis yScale or itself for method chaining.
 */
anychart.radarPolarBaseModule.Grid.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.yScale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.yScaleInvalidated_, this);
    if (val) {
      var dispatch = this.yScale_ == val;
      this.yScale_ = /** @type {anychart.scales.Base} */(val);
      this.yScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
    return this;
  } else if (this.yScale_) {
    return this.yScale_;
  } else if (this.getOwner()) {
    return /** @type {anychart.scales.Base} */ (this.getOwner().yScale());
  } else {
    return null;
  }
};


/**
 * Internal yScale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.radarPolarBaseModule.Grid.prototype.yScaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


/**
 * Getter/setter for xScale.
 * @param {(anychart.scales.Ordinal|anychart.enums.ScaleTypes|Object)=} opt_value Scale.
 * @return {anychart.scales.Ordinal|!anychart.radarPolarBaseModule.Grid} Axis xScale or itself for method chaining.
 */
anychart.radarPolarBaseModule.Grid.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.scales.Base.setupScale(this.xScale_, opt_value, null,
        anychart.scales.Base.ScaleTypes.ORDINAL, null, this.xScaleInvalidated_, this);
    if (val) {
      var dispatch = this.xScale_ == val;
      this.xScale_ = /** @type {anychart.scales.Ordinal} */(val);
      this.xScale_.resumeSignalsDispatching(dispatch);
      if (!dispatch) {
        this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
      }
    }
    return this;
  } else if (this.xScale_) {
    return this.xScale_;
  } else if (this.getOwner()) {
    return /** @type {anychart.scales.Ordinal} */ (this.getOwner().xScale());
  } else {
    return null;
  }
};


/**
 * Internal xScale invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.radarPolarBaseModule.Grid.prototype.xScaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS |
      anychart.ConsistencyState.GRIDS_POSITION |
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


/**
 * Whether marker is radial
 * @return {boolean} If the marker is horizontal.
 */
anychart.radarPolarBaseModule.Grid.prototype.isRadial = function() {
  return this.layout() == anychart.enums.RadialGridLayout.RADIAL;
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.radarPolarBaseModule.Grid.prototype.checkScale = function() {
  var xScale = /** @type {anychart.scales.Ordinal} */(this.xScale());
  var yScale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.yScale());

  if (!xScale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return false;
  }

  if (!this.isRadial() && !yScale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return false;
  }
  return true;
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.radarPolarBaseModule.Grid.prototype;
  proto['isRadial'] = proto.isRadial;
  proto['yScale'] = proto.yScale;
  proto['xScale'] = proto.xScale;
  proto['axis'] = proto.axis;
  // proto['isMinor'] = proto.isMinor;
})();
//endregion
