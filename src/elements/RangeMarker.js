goog.provide('anychart.elements.RangeMarker');
goog.require('acgraph');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Range marker.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.RangeMarker = function() {
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
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {number}
   * @private
   */
  this.from_;

  /**
   * @type {number}
   * @private
   */
  this.to_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;
  this.restoreDefaults();
};
goog.inherits(anychart.elements.RangeMarker, anychart.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.RangeMarker.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.RangeMarker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.APPEARANCE;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value RangeMarker layout.
 * @return {anychart.enums.Layout|anychart.elements.RangeMarker} Layout or this.
 */
anychart.elements.RangeMarker.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the axis scale.
 * @return {anychart.scales.Base} Axis scale.
 *//**
 * Setter for axis scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.elements.RangeMarker} An instance of the {@link anychart.elements.RangeMarker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|anychart.elements.RangeMarker} Axis scale or itself for method chaining.
 */
anychart.elements.RangeMarker.prototype.scale = function(opt_value) {
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
anychart.elements.RangeMarker.prototype.scaleInvalidated_ = function(event) {
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
 * @return {!anychart.elements.RangeMarker} An instance of the {@link anychart.elements.RangeMarker} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.math.Rect=} opt_value Bounds for marker.
 * @return {acgraph.math.Rect|anychart.elements.RangeMarker} Bounds or this.
 */
anychart.elements.RangeMarker.prototype.parentBounds = function(opt_value) {
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
 * Get/set range marker fill.
 * @param {string|acgraph.vector.Fill=} opt_value RangeMarker line settings.
 * @return {string|acgraph.vector.Fill|anychart.elements.RangeMarker} RangeMarker line settings or RangeMarker instance for method chaining.
 */
anychart.elements.RangeMarker.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.fill_ != opt_value) {
      this.fill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_;
  }
};


/**
 * Get/set starting marker value.
 * @param {number=} opt_newValue RangeMarker value settings.
 * @return {number|anychart.elements.RangeMarker} RangeMarker value settings or RangeMarker instance for method chaining.
 */
anychart.elements.RangeMarker.prototype.from = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.from_ != opt_newValue) {
      this.from_ = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.from_;
  }
};


/**
 * Get/set ending marker value.
 * @param {number=} opt_newValue RangeMarker value settings.
 * @return {number|anychart.elements.RangeMarker} RangeMarker value settings or RangeMarker instance for method chaining.
 */
anychart.elements.RangeMarker.prototype.to = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.to_ != opt_newValue) {
      this.to_ = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.to_;
  }
};


/**
 * Defines marker layout
 * @return {boolean} If the marker is horizontal.
 */
anychart.elements.RangeMarker.prototype.isHorizontal = function() {
  return this.layout_ == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 */
anychart.elements.RangeMarker.prototype.draw = function() {
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
    this.markerElement().fill(/** @type {acgraph.vector.Stroke} */(this.fill_));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var minValue = this.from_, maxValue = this.to_;
    if (this.from_ > this.to_) {
      minValue = this.from_;
      maxValue = this.to_;
    }
    // clamping to prevent range marker go out from the bounds. Ratio should be between 0 and 1.
    var ratioMinValue = goog.math.clamp(this.scale().transform(minValue, 0), 0, 1);
    var ratioMaxValue = goog.math.clamp(this.scale().transform(maxValue, 1), 0, 1);

    if (isNaN(ratioMinValue) || isNaN(ratioMaxValue)) return;

    var shiftMinValue = -.5;
    var shiftMaxValue = -.5;

    var bounds = this.parentBounds();
    this.markerElement().clear();

    if (this.layout_ == anychart.enums.Layout.HORIZONTAL) {
      var y_max = Math.round(bounds.getTop() + bounds.height - bounds.height * ratioMaxValue);
      var y_min = Math.round(bounds.getTop() + bounds.height - bounds.height * ratioMinValue);
      var x_start = bounds.getLeft();
      var x_end = bounds.getLeft() + bounds.width;
      ratioMaxValue == 1 ? y_max -= shiftMaxValue : y_max += shiftMaxValue;
      ratioMinValue == 1 ? y_min -= shiftMinValue : y_min += shiftMinValue;

      this.markerElement()
          .moveTo(x_start, y_max)
          .lineTo(x_end, y_max)
          .lineTo(x_end, y_min)
          .lineTo(x_start, y_min)
          .close();
    } else if (this.layout_ == anychart.enums.Layout.VERTICAL) {
      var y_start = bounds.getBottom();
      var y_end = bounds.getBottom() - bounds.height;
      var x_min = bounds.getLeft() + (bounds.width * ratioMinValue);
      var x_max = bounds.getLeft() + (bounds.width * ratioMaxValue);
      ratioMaxValue == 1 ? x_max += shiftMaxValue : x_max -= shiftMaxValue;
      ratioMinValue == 1 ? x_min += shiftMinValue : x_min -= shiftMinValue;

      this.markerElement()
          .moveTo(x_min, y_start)
          .lineTo(x_min, y_end)
          .lineTo(x_max, y_end)
          .lineTo(x_max, y_start)
          .close();
    }
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * Restore defaults.
 */
anychart.elements.RangeMarker.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.zIndex(25);
  this.layout(anychart.enums.Layout.HORIZONTAL);
  this.from(0);
  this.to(0);
  this.fill('black 0.3');
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.RangeMarker.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.RangeMarker.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  data['from'] = this.from();
  data['to'] = this.to();
  data['layout'] = this.layout();
  return data;
};


/** @inheritDoc */
anychart.elements.RangeMarker.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', value);

  this.fill(value['fill']);
  this.from(value['from']);
  this.to(value['to']);
  this.layout(value['layout']);

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
anychart.elements.RangeMarker.prototype.markerElement = function() {
  if (!this.markerElement_) {
    this.markerElement_ = /** @type {!acgraph.vector.Path} */(acgraph.path().stroke(null));
    this.registerDisposable(this.markerElement_);
  }
  return this.markerElement_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.RangeMarker.prototype.disposeInternal = function() {
  delete this.fill_;
  goog.base(this, 'disposeInternal');
};


/**
 * Constructor function.
 * @return {!anychart.elements.RangeMarker}
 */
anychart.elements.rangeMarker = function() {
  return new anychart.elements.RangeMarker();
};


//exports
goog.exportSymbol('anychart.elements.rangeMarker', anychart.elements.rangeMarker);
anychart.elements.RangeMarker.prototype['from'] = anychart.elements.RangeMarker.prototype.from;
anychart.elements.RangeMarker.prototype['to'] = anychart.elements.RangeMarker.prototype.to;
anychart.elements.RangeMarker.prototype['scale'] = anychart.elements.RangeMarker.prototype.scale;
anychart.elements.RangeMarker.prototype['parentBounds'] = anychart.elements.RangeMarker.prototype.parentBounds;
anychart.elements.RangeMarker.prototype['layout'] = anychart.elements.RangeMarker.prototype.layout;
anychart.elements.RangeMarker.prototype['fill'] = anychart.elements.RangeMarker.prototype.fill;
anychart.elements.RangeMarker.prototype['draw'] = anychart.elements.RangeMarker.prototype.draw;
anychart.elements.RangeMarker.prototype['isHorizontal'] = anychart.elements.RangeMarker.prototype.isHorizontal;
