goog.provide('anychart.core.axisMarkers.Line');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Line marker.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axisMarkers.Line = function() {
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
  this.layout_ = anychart.enums.Layout.HORIZONTAL;

  /**
   * @type {number}
   * @private
   */
  this.value_ = 0;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;
};
goog.inherits(anychart.core.axisMarkers.Line, anychart.core.VisualBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Line.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Line.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.BOUNDS |
        anychart.ConsistencyState.APPEARANCE;


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker layout.
 * @param {anychart.enums.Layout=} opt_value LineMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Line} Layout or this.
 */
anychart.core.axisMarkers.Line.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
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
 * @return {!anychart.core.axisMarkers.Line} {@link anychart.core.axisMarkers.Line} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Line} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.scale = function(opt_value) {
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
anychart.core.axisMarkers.Line.prototype.scaleInvalidated_ = function(event) {
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
anychart.core.axisMarkers.Line.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
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
 * Get/set line marker stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.core.axisMarkers.Line|acgraph.vector.Stroke)} LineMarker line settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
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
 * @return {number|anychart.core.axisMarkers.Line} LineMarker value settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.value = function(opt_newValue) {
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
 * Whether marker is horizontal
 * @return {boolean} If the marker is horizontal.
 */
anychart.core.axisMarkers.Line.prototype.isHorizontal = function() {
  return this.layout_ == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Drawing.
 * @return {anychart.core.axisMarkers.Line} An instance of {@link anychart.core.axisMarkers.Line} class for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.draw = function() {
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
    this.markerElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke_));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var ratio = goog.math.clamp(scale.transform(this.value_, 0.5), 0, 1);
    if (isNaN(ratio)) return this;

    var shift = this.markerElement().strokeThickness() % 2 == 0 ? 0 : -.5;
    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();
    this.markerElement().clear();

    if (this.layout_ == anychart.enums.Layout.HORIZONTAL) {
      var y = Math.round(bounds.getTop() + bounds.height - ratio * bounds.height);
      ratio == 1 ? y -= shift : y += shift;
      this.markerElement().moveTo(bounds.getLeft(), y);
      this.markerElement().lineTo(bounds.getRight(), y);
    } else if (this.layout_ == anychart.enums.Layout.VERTICAL) {
      var x = Math.round(bounds.getLeft() + ratio * bounds.width);
      ratio == 1 ? x += shift : x -= shift;
      this.markerElement().moveTo(x, bounds.getTop());
      this.markerElement().lineTo(x, bounds.getBottom());
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
anychart.core.axisMarkers.Line.prototype.remove = function() {
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
anychart.core.axisMarkers.Line.prototype.markerElement = function() {
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
anychart.core.axisMarkers.Line.prototype.disposeInternal = function() {
  delete this.stroke_;
  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['value'] = this.value();
  json['layout'] = this.layout();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.value(config['value']);
  this.layout(config['layout']);
  this.stroke(config['stroke']);
};


//exports
anychart.core.axisMarkers.Line.prototype['value'] = anychart.core.axisMarkers.Line.prototype.value;
anychart.core.axisMarkers.Line.prototype['scale'] = anychart.core.axisMarkers.Line.prototype.scale;
anychart.core.axisMarkers.Line.prototype['layout'] = anychart.core.axisMarkers.Line.prototype.layout;
anychart.core.axisMarkers.Line.prototype['stroke'] = anychart.core.axisMarkers.Line.prototype.stroke;
anychart.core.axisMarkers.Line.prototype['isHorizontal'] = anychart.core.axisMarkers.Line.prototype.isHorizontal;
