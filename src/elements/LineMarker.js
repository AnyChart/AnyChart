goog.provide('anychart.elements.LineMarker');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.utils');



/**
 * Line marker.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.LineMarker = function() {
  goog.base(this);
  /**
   * @type {acgraph.vector.Path}
   * @private
   */
  this.markerElement_;

  /**
   * @type {anychart.scales.Base}
   * @private
   */
  this.scale_;

  /**
   * @type {acgraph.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * @type {anychart.utils.Direction}
   * @private
   */
  this.direction_;

  /**
   * @type {number}
   * @private
   */
  this.value_;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;
  this.restoreDefaults();
};
goog.inherits(anychart.elements.LineMarker, anychart.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.LineMarker.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.LineMarker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.APPEARANCE;


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker direction.
 * @param {anychart.utils.Direction=} opt_value LineMarker direction.
 * @return {anychart.utils.Direction|anychart.elements.LineMarker} Direction or this.
 */
anychart.elements.LineMarker.prototype.direction = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.direction_ != opt_value) {
      this.direction_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.direction_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for axis scale.
 * @return {anychart.scales.Base} Axis scale.
 *//**
 * Setter for axis scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.elements.LineMarker} An instance of the {@link anychart.elements.LineMarker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.LineMarker} Axis scale or itself for chaining.
 */
anychart.elements.LineMarker.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
    }
    return this;
  } else {
    return this.scale_;
  }
};


/**
 * Internal ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.elements.LineMarker.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  var state = anychart.ConsistencyState.BOUNDS;

  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//  Bounds.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for parentBounds.
 * @return {acgraph.math.Rect} Current parent bounds.
 *//**
 * Setter for parentBounds.
 * @param {acgraph.math.Rect=} opt_value Value to set.
 * @return {!anychart.elements.LineMarker} An instance of the {@link anychart.elements.LineMarker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.LineMarker} Bounds or this.
 */
anychart.elements.LineMarker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value ? opt_value.round() : null;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.parentBounds_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker stroke.
 * @param {string|acgraph.vector.Stroke=} opt_value LineMarker line settings.
 * @return {string|acgraph.vector.Stroke|anychart.elements.LineMarker} LineMarker line settings or LineMarker instance for chaining.
 */
anychart.elements.LineMarker.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Get/set value.
 * @param {number=} opt_newValue LineMarker value settings.
 * @return {number|anychart.elements.LineMarker} LineMarker value settings or LineMarker instance for chaining.
 */
anychart.elements.LineMarker.prototype.value = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.value_ != opt_newValue) {
      this.value_ = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.value_;
  }
};


/**
 * Определяет расположения маркера
 * @return {boolean} If the marker is horizontal.
 */
anychart.elements.LineMarker.prototype.isHorizontal = function() {
  return this.direction_ == anychart.utils.Direction.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 */
anychart.elements.LineMarker.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());
  if (!this.checkDrawingNeeded() || !scale)
    return;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.markerElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.markerElement().parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.markerElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke_));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var isOrdinal = scale instanceof anychart.scales.Ordinal;
    var ratio = scale.transform(this.value_, isOrdinal ? 0.5 : 0);
    if (isNaN(ratio)) return;

    var shift = this.markerElement().strokeThickness() % 2 == 0 ? 0 : -.5;
    var bounds = this.parentBounds();
    this.markerElement().clear();

    if (this.direction_ == anychart.utils.Direction.HORIZONTAL) {
      var y = Math.round(bounds.getTop() + bounds.height - ratio * bounds.height);
      ratio == 1 ? y -= shift : y += shift;
      this.markerElement().moveTo(bounds.getLeft(), y);
      this.markerElement().lineTo(bounds.getRight(), y);
    } else if (this.direction_ == anychart.utils.Direction.VERTICAL) {
      var x = Math.round(bounds.getLeft() + ratio * bounds.width);
      ratio == 1 ? x += shift : x -= shift;
      this.markerElement().moveTo(x, bounds.getTop());
      this.markerElement().lineTo(x, bounds.getBottom());
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Restore defaults.
 */
anychart.elements.LineMarker.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.zIndex(26);
  this.direction(anychart.utils.Direction.HORIZONTAL);
  this.value(0);
  this.stroke('black');
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.LineMarker.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.LineMarker.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  data['value'] = this.value();
  data['direction'] = this.direction();
  return data;
};


/** @inheritDoc */
anychart.elements.LineMarker.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  this.stroke(value['stroke']);
  this.value(value['value']);
  this.direction(value['direction']);

  this.resumeSignalsDispatching(true);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create marker element.
 * @return {!acgraph.vector.Path} AxisMarker line element.
 * @protected
 */
anychart.elements.LineMarker.prototype.markerElement = function() {
  if (!this.markerElement_) {
    this.markerElement_ = acgraph.path();
    this.registerDisposable(this.markerElement_);
  }
  return this.markerElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.LineMarker.prototype.disposeInternal = function() {
  delete this.stroke_;
  goog.base(this, 'disposeInternal');
};
