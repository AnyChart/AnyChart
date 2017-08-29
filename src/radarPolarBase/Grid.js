goog.provide('anychart.radarPolarBaseModule.Grid');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.GridWithLayout');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.scales');



/**
 * Grid.
 * @constructor
 * @extends {anychart.core.GridWithLayout}
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
   * @type {number}
   * @private
   */
  this.startAngle_;

  /**
   * @type {anychart.enums.Layout|anychart.enums.RadialGridLayout}
   * @protected
   */
  this.defaultLayout = anychart.enums.RadialGridLayout.CIRCUIT;
};
goog.inherits(anychart.radarPolarBaseModule.Grid, anychart.core.GridWithLayout);


//region --- Layout
/** @inheritDoc */
anychart.radarPolarBaseModule.Grid.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizePolarLayout(opt_value, anychart.enums.RadialGridLayout.CIRCUIT);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis_) {
    var isCircuit = this.axis_ instanceof anychart.radarPolarBaseModule.RadialAxis;
    return isCircuit ? anychart.enums.RadialGridLayout.CIRCUIT : anychart.enums.RadialGridLayout.RADIAL;
  } else {
    return this.defaultLayout;
  }
};


//endregion
//region --- Infrastructure
/**
 * Getter/setter for yScale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.radarPolarBaseModule.Grid} Axis yScale or itself for method chaining.
 */
anychart.radarPolarBaseModule.Grid.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      this.yScale_ = opt_value;
      this.yScale_.listenSignals(this.yScaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.yScale_) {
    return this.yScale_;
  } else if (this.axis_ && this.axis_ instanceof anychart.radarPolarBaseModule.RadialAxis) {
    return /** @type {anychart.scales.Base} */ (this.axis_.scale());
  } else if (this.getParentElement()) {
    return /** @type {anychart.scales.Base} */ (this.getParentElement().yScale());
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
 * @param {anychart.scales.Ordinal=} opt_value Scale.
 * @return {anychart.scales.Ordinal|!anychart.radarPolarBaseModule.Grid} Axis xScale or itself for method chaining.
 */
anychart.radarPolarBaseModule.Grid.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      this.xScale_ = opt_value;
      this.xScale_.listenSignals(this.xScaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION | anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.xScale_) {
    return this.xScale_;
  } else if (this.axis_ && this.axis_ instanceof anychart.radarPolarBaseModule.Axis) {
    return /** @type {anychart.scales.Ordinal} */(this.axis_.scale());
  } else if (this.getParentElement()) {
    return /** @type {anychart.scales.Ordinal} */ (this.getParentElement().xScale());
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
      anychart.ConsistencyState.APPEARANCE;

  this.invalidate(state, signal);
};


/**
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.radarPolarBaseModule.Grid)} .
 */
anychart.radarPolarBaseModule.Grid.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.standardAngle((goog.isNull(opt_value) || isNaN(+opt_value)) ? 0 : +opt_value);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Inner radius getter/setter.
 * @param {(string|number)=} opt_value .
 * @return {(string|number|anychart.radarPolarBaseModule.Grid)} .
 */
anychart.radarPolarBaseModule.Grid.prototype.innerRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.normalizeNumberOrPercent(opt_value, this.innerRadius_);
    if (this.innerRadius_ != value) {
      this.innerRadius_ = value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.innerRadius_;
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
})();
//endregion
