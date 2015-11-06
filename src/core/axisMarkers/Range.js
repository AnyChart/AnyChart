goog.provide('anychart.core.axisMarkers.Range');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Range marker.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axisMarkers.Range = function() {
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
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_;

  /**
   * @type {number}
   * @private
   */
  this.from_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.to_ = 0;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.defaultFill_ = 'black';

  this.setDefaultLayout(anychart.enums.Layout.HORIZONTAL);
  this.setDefaultFill('#c1c1c1 0.4');
};
goog.inherits(anychart.core.axisMarkers.Range, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Range.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Range.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.APPEARANCE;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value RangeMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Range} Layout or this.
 */
anychart.core.axisMarkers.Range.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_ || this.defaultLayout_;
  }
};


/**
 * Set Default layout.
 * @param {anychart.enums.Layout} value Layout value.
 */
anychart.core.axisMarkers.Range.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
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
 * @return {!anychart.core.axisMarkers.Range} An instance of the {@link anychart.core.axisMarkers.Range} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Range} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.scaleInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
anychart.core.axisMarkers.Range.prototype.scaleInvalidated_ = function(event) {
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
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.VisualBase|anychart.core.utils.Padding)} .
 */
anychart.core.axisMarkers.Range.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.axesLinesSpace_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set range marker fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.axisMarkers.Range)} .
 */
anychart.core.axisMarkers.Range.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_ || this.defaultFill_;
};


/**
 * @param {acgraph.vector.Fill} value Default fill value.
 */
anychart.core.axisMarkers.Range.prototype.setDefaultFill = function(value) {
  var needInvalidate = !this.fill_ && this.defaultFill_ != value;
  this.defaultFill_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.APPEARANCE);
};


/**
 * Get/set starting marker value.
 * @param {number=} opt_newValue RangeMarker value settings.
 * @return {number|anychart.core.axisMarkers.Range} RangeMarker value settings or RangeMarker instance for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.from = function(opt_newValue) {
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
 * @return {number|anychart.core.axisMarkers.Range} RangeMarker value settings or RangeMarker instance for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.to = function(opt_newValue) {
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
anychart.core.axisMarkers.Range.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.axisMarkers.Range} An instance of {@link anychart.core.axisMarkers.Range} class for method chaining.
 */
anychart.core.axisMarkers.Range.prototype.draw = function() {
  var scale = /** @type {anychart.scales.Linear|anychart.scales.Ordinal} */(this.scale());

  if (!scale) {
    anychart.utils.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

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
    this.markerElement().fill(/** @type {acgraph.vector.Stroke} */(this.fill()));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var layout = this.layout();
    var minValue = this.from_, maxValue = this.to_;
    if (this.from_ > this.to_) {
      minValue = this.from_;
      maxValue = this.to_;
    }
    // clamping to prevent range marker go out from the bounds. Ratio should be between 0 and 1.
    var ratioMinValue = goog.math.clamp(this.scale().transform(minValue, 0), 0, 1);
    var ratioMaxValue = goog.math.clamp(this.scale().transform(maxValue, 1), 0, 1);

    if (isNaN(ratioMinValue) || isNaN(ratioMaxValue)) return this;

    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();
    this.markerElement().clear();

    if (layout == anychart.enums.Layout.HORIZONTAL) {
      var y_max = Math.floor(bounds.getBottom() - bounds.height * ratioMaxValue);
      var y_min = Math.ceil(bounds.getBottom() - bounds.height * ratioMinValue);
      var x_start = bounds.getLeft();
      var x_end = bounds.getRight();

      this.markerElement()
          .moveTo(x_start, y_max)
          .lineTo(x_end, y_max)
          .lineTo(x_end, y_min)
          .lineTo(x_start, y_min)
          .close();
    } else if (layout == anychart.enums.Layout.VERTICAL) {
      var y_start = bounds.getBottom();
      var y_end = bounds.getTop();
      var x_min = Math.floor(bounds.getLeft() + (bounds.width * ratioMinValue));
      var x_max = Math.ceil(bounds.getLeft() + (bounds.width * ratioMaxValue));

      this.markerElement()
          .moveTo(x_min, y_start)
          .lineTo(x_min, y_end)
          .lineTo(x_max, y_end)
          .lineTo(x_max, y_start)
          .close();

    }
    this.markerElement().clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create marker element.
 * @return {!acgraph.vector.Path} AxisMarker line element.
 * @protected
 */
anychart.core.axisMarkers.Range.prototype.markerElement = function() {
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
anychart.core.axisMarkers.Range.prototype.disposeInternal = function() {
  delete this.fill_;
  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['from'] = this.from();
  json['to'] = this.to();
  json['layout'] = this.layout();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Range.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.from(config['from']);
  this.to(config['to']);
  this.layout(config['layout']);
  this.fill(config['fill']);
};


//exports
anychart.core.axisMarkers.Range.prototype['from'] = anychart.core.axisMarkers.Range.prototype.from;
anychart.core.axisMarkers.Range.prototype['to'] = anychart.core.axisMarkers.Range.prototype.to;
anychart.core.axisMarkers.Range.prototype['scale'] = anychart.core.axisMarkers.Range.prototype.scale;
anychart.core.axisMarkers.Range.prototype['layout'] = anychart.core.axisMarkers.Range.prototype.layout;
anychart.core.axisMarkers.Range.prototype['fill'] = anychart.core.axisMarkers.Range.prototype.fill;
anychart.core.axisMarkers.Range.prototype['isHorizontal'] = anychart.core.axisMarkers.Range.prototype.isHorizontal;
